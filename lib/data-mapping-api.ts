"use client"

export interface DataSource {
  id: string
  name: string
  type: "api" | "database" | "csv" | "json" | "manual"
  config: DataSourceConfig
  status: "connected" | "disconnected" | "error" | "loading"
  lastSync?: Date
  fields: DataField[]
}

export interface DataSourceConfig {
  // API Configuration
  url?: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  auth?: {
    type: "bearer" | "basic" | "apikey"
    token?: string
    username?: string
    password?: string
    apiKey?: string
    apiKeyHeader?: string
  }

  // Database Configuration
  connectionString?: string
  query?: string

  // File Configuration
  fileContent?: string

  // Refresh Configuration
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
}

export interface DataField {
  id: string
  name: string
  type: "string" | "number" | "boolean" | "date" | "object" | "array"
  required?: boolean
  description?: string
  example?: any
}

export interface DataMapping {
  sourceId: string
  sourceField: string
  targetField: string
  transform?: DataTransform
}

export interface DataTransform {
  type: "format" | "calculate" | "filter" | "sort"
  config: any
}

class DataMappingAPI {
  private dataSources: Map<string, DataSource> = new Map()
  private mappings: Map<string, DataMapping[]> = new Map()
  private cache: Map<string, { data: any[]; timestamp: number }> = new Map()
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map()

  // Data Source Management
  async createDataSource(config: Omit<DataSource, "id" | "status" | "fields">): Promise<DataSource> {
    const id = this.generateId()
    const dataSource: DataSource = {
      ...config,
      id,
      status: "loading",
      fields: [],
    }

    this.dataSources.set(id, dataSource)

    try {
      await this.testConnection(id)
      const fields = await this.discoverFields(id)
      dataSource.fields = fields
      dataSource.status = "connected"
      dataSource.lastSync = new Date()

      // Setup auto-refresh if enabled
      if (config.config.autoRefresh && config.config.refreshInterval) {
        this.setupAutoRefresh(id)
      }
    } catch (error) {
      dataSource.status = "error"
      console.error("Failed to create data source:", error)
    }

    this.dataSources.set(id, dataSource)
    return dataSource
  }

  async updateDataSource(id: string, updates: Partial<DataSource>): Promise<DataSource> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) {
      throw new Error("Data source not found")
    }

    const updatedSource = { ...dataSource, ...updates }
    this.dataSources.set(id, updatedSource)

    // Re-test connection if config changed
    if (updates.config) {
      try {
        await this.testConnection(id)
        updatedSource.status = "connected"
        updatedSource.lastSync = new Date()
      } catch (error) {
        updatedSource.status = "error"
        console.error("Failed to update data source:", error)
      }
    }

    return updatedSource
  }

  deleteDataSource(id: string): boolean {
    const interval = this.refreshIntervals.get(id)
    if (interval) {
      clearInterval(interval)
      this.refreshIntervals.delete(id)
    }

    this.cache.delete(id)
    this.mappings.delete(id)
    return this.dataSources.delete(id)
  }

  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id)
  }

  getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  // Connection Testing
  async testConnection(id: string): Promise<boolean> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) {
      throw new Error("Data source not found")
    }

    try {
      switch (dataSource.type) {
        case "api":
          return await this.testApiConnection(dataSource)
        case "database":
          return await this.testDatabaseConnection(dataSource)
        case "csv":
        case "json":
          return await this.testFileConnection(dataSource)
        case "manual":
          return true
        default:
          throw new Error("Unsupported data source type")
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      return false
    }
  }

  private async testApiConnection(dataSource: DataSource): Promise<boolean> {
    const { config } = dataSource
    if (!config.url) throw new Error("API URL is required")

    const headers: Record<string, string> = { ...config.headers }

    // Add authentication headers
    if (config.auth) {
      switch (config.auth.type) {
        case "bearer":
          headers.Authorization = `Bearer ${config.auth.token}`
          break
        case "basic":
          const credentials = btoa(`${config.auth.username}:${config.auth.password}`)
          headers.Authorization = `Basic ${credentials}`
          break
        case "apikey":
          headers[config.auth.apiKeyHeader || "X-API-Key"] = config.auth.apiKey || ""
          break
      }
    }

    const response = await fetch(config.url, {
      method: config.method || "GET",
      headers,
    })

    return response.ok
  }

  private async testDatabaseConnection(dataSource: DataSource): Promise<boolean> {
    // Database connection testing would be implemented here
    // This is a placeholder for actual database connectivity
    return Promise.resolve(true)
  }

  private async testFileConnection(dataSource: DataSource): Promise<boolean> {
    return !!dataSource.config.fileContent
  }

  // Field Discovery
  async discoverFields(id: string): Promise<DataField[]> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) {
      throw new Error("Data source not found")
    }

    try {
      const sampleData = await this.fetchSampleData(id)
      return this.analyzeDataStructure(sampleData)
    } catch (error) {
      console.error("Field discovery failed:", error)
      return []
    }
  }

  private async fetchSampleData(id: string): Promise<any[]> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) return []

    switch (dataSource.type) {
      case "api":
        return await this.fetchApiData(dataSource)
      case "csv":
        return await this.parseCsvData(dataSource)
      case "json":
        return await this.parseJsonData(dataSource)
      case "manual":
        return []
      default:
        return []
    }
  }

  private async fetchApiData(dataSource: DataSource): Promise<any[]> {
    const { config } = dataSource
    if (!config.url) return []

    const headers: Record<string, string> = { ...config.headers }

    if (config.auth) {
      switch (config.auth.type) {
        case "bearer":
          headers.Authorization = `Bearer ${config.auth.token}`
          break
        case "basic":
          const credentials = btoa(`${config.auth.username}:${config.auth.password}`)
          headers.Authorization = `Basic ${credentials}`
          break
        case "apikey":
          headers[config.auth.apiKeyHeader || "X-API-Key"] = config.auth.apiKey || ""
          break
      }
    }

    const response = await fetch(config.url, {
      method: config.method || "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  private async parseCsvData(dataSource: DataSource): Promise<any[]> {
    const { fileContent } = dataSource.config
    if (!fileContent) return []

    const lines = fileContent.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      return headers.reduce(
        (obj, header, index) => {
          obj[header] = values[index] || ""
          return obj
        },
        {} as Record<string, any>,
      )
    })

    return rows
  }

  private async parseJsonData(dataSource: DataSource): Promise<any[]> {
    const { fileContent } = dataSource.config
    if (!fileContent) return []

    try {
      const data = JSON.parse(fileContent)
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  private analyzeDataStructure(data: any[]): DataField[] {
    if (data.length === 0) return []

    const sample = data[0]
    const fields: DataField[] = []

    Object.entries(sample).forEach(([key, value]) => {
      const field: DataField = {
        id: this.generateId(),
        name: key,
        type: this.inferDataType(value),
        example: value,
      }
      fields.push(field)
    })

    return fields
  }

  private inferDataType(value: any): DataField["type"] {
    if (value === null || value === undefined) return "string"
    if (typeof value === "boolean") return "boolean"
    if (typeof value === "number") return "number"
    if (Array.isArray(value)) return "array"
    if (typeof value === "object") return "object"
    if (typeof value === "string") {
      // Check if it's a date
      if (!isNaN(Date.parse(value))) return "date"
      return "string"
    }
    return "string"
  }

  // Data Fetching
  async fetchData(id: string, useCache = true): Promise<any[]> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(id)
      if (cached && Date.now() - cached.timestamp < 60000) {
        // 1 minute cache
        return cached.data
      }
    }

    const dataSource = this.dataSources.get(id)
    if (!dataSource) {
      throw new Error("Data source not found")
    }

    try {
      const data = await this.fetchSampleData(id)

      // Update cache
      this.cache.set(id, {
        data,
        timestamp: Date.now(),
      })

      // Update last sync
      dataSource.lastSync = new Date()
      this.dataSources.set(id, dataSource)

      return data
    } catch (error) {
      dataSource.status = "error"
      this.dataSources.set(id, dataSource)
      throw error
    }
  }

  // Data Mapping
  setMapping(tableId: string, mappings: DataMapping[]): void {
    this.mappings.set(tableId, mappings)
  }

  getMapping(tableId: string): DataMapping[] {
    return this.mappings.get(tableId) || []
  }

  async applyMapping(tableId: string, sourceId: string): Promise<any[]> {
    const mappings = this.getMapping(tableId)
    const sourceData = await this.fetchData(sourceId)

    if (mappings.length === 0) return sourceData

    return sourceData.map((row) => {
      const mappedRow: Record<string, any> = {}

      mappings.forEach((mapping) => {
        let value = row[mapping.sourceField]

        // Apply transformations
        if (mapping.transform) {
          value = this.applyTransform(value, mapping.transform)
        }

        mappedRow[mapping.targetField] = value
      })

      return mappedRow
    })
  }

  private applyTransform(value: any, transform: DataTransform): any {
    switch (transform.type) {
      case "format":
        return this.formatValue(value, transform.config)
      case "calculate":
        return this.calculateValue(value, transform.config)
      default:
        return value
    }
  }

  private formatValue(value: any, config: any): any {
    // Implement formatting logic
    return value
  }

  private calculateValue(value: any, config: any): any {
    // Implement calculation logic
    return value
  }

  // Auto-refresh
  private setupAutoRefresh(id: string): void {
    const dataSource = this.dataSources.get(id)
    if (!dataSource?.config.refreshInterval) return

    const interval = setInterval(async () => {
      try {
        await this.fetchData(id, false) // Force refresh
      } catch (error) {
        console.error("Auto-refresh failed:", error)
      }
    }, dataSource.config.refreshInterval * 1000)

    this.refreshIntervals.set(id, interval)
  }

  // Utility
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Cleanup
  destroy(): void {
    this.refreshIntervals.forEach((interval) => clearInterval(interval))
    this.refreshIntervals.clear()
    this.dataSources.clear()
    this.mappings.clear()
    this.cache.clear()
  }
}

export const dataMappingAPI = new DataMappingAPI()
