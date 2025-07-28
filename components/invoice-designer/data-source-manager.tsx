"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { DropdownMenuContent } from "@/components/ui/dropdown-menu"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { DropdownMenu } from "@/components/ui/dropdown-menu"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Database,
  Globe,
  FileText,
  Code,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Link,
} from "lucide-react"
import { dataMappingAPI, type DataSource, type DataSourceConfig } from "@/lib/data-mapping-api"
import { useToast } from "@/hooks/use-toast"

interface DataSourceManagerProps {
  onDataSourceSelect?: (dataSource: DataSource) => void
  selectedDataSourceId?: string
}

const DATA_SOURCE_TYPES = [
  { value: "api", label: "REST API", icon: Globe, description: "Connect to REST API endpoints" },
  { value: "database", label: "Database", icon: Database, description: "Connect to SQL databases" },
  { value: "csv", label: "CSV File", icon: FileText, description: "Upload CSV files" },
  { value: "json", label: "JSON Data", icon: Code, description: "Paste JSON data" },
  { value: "manual", label: "Manual Entry", icon: Edit3, description: "Enter data manually" },
]

export function DataSourceManager({ onDataSourceSelect, selectedDataSourceId }: DataSourceManagerProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [newSourceType, setNewSourceType] = useState<DataSource["type"]>("api")
  const [newSourceConfig, setNewSourceConfig] = useState<DataSourceConfig>({})
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const { toast } = useToast()

  // Load data sources on mount
  useEffect(() => {
    setDataSources(dataMappingAPI.getAllDataSources())
  }, [])

  // Create new data source
  const handleCreateDataSource = useCallback(async () => {
    if (!newSourceConfig.url && newSourceType === "api") {
      toast({
        title: "Error",
        description: "API URL is required",
        variant: "destructive",
      })
      return
    }

    try {
      const dataSource = await dataMappingAPI.createDataSource({
        name: `New ${DATA_SOURCE_TYPES.find((t) => t.value === newSourceType)?.label}`,
        type: newSourceType,
        config: newSourceConfig,
      })

      setDataSources((prev) => [...prev, dataSource])
      setIsCreating(false)
      setNewSourceConfig({})

      toast({
        title: "Success",
        description: "Data source created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create data source",
        variant: "destructive",
      })
    }
  }, [newSourceType, newSourceConfig, toast])

  // Test connection
  const handleTestConnection = useCallback(
    async (id: string) => {
      setTestingConnection(id)
      try {
        const success = await dataMappingAPI.testConnection(id)
        toast({
          title: success ? "Success" : "Error",
          description: success ? "Connection successful" : "Connection failed",
          variant: success ? "default" : "destructive",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Connection test failed",
          variant: "destructive",
        })
      } finally {
        setTestingConnection(null)
      }
    },
    [toast],
  )

  // Delete data source
  const handleDeleteDataSource = useCallback(
    (id: string) => {
      dataMappingAPI.deleteDataSource(id)
      setDataSources((prev) => prev.filter((ds) => ds.id !== id))
      toast({
        title: "Success",
        description: "Data source deleted",
      })
    },
    [toast],
  )

  // Refresh data
  const handleRefreshData = useCallback(
    async (id: string) => {
      try {
        await dataMappingAPI.fetchData(id, false)
        setDataSources(dataMappingAPI.getAllDataSources())
        toast({
          title: "Success",
          description: "Data refreshed successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to refresh data",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Get status icon
  const getStatusIcon = (status: DataSource["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "loading":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Render configuration form
  const renderConfigForm = (
    type: DataSource["type"],
    config: DataSourceConfig,
    onChange: (config: DataSourceConfig) => void,
  ) => {
    switch (type) {
      case "api":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">API URL</Label>
              <Input
                id="url"
                value={config.url || ""}
                onChange={(e) => onChange({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/data"
              />
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={config.method || "GET"}
                onValueChange={(value) => onChange({ ...config, method: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Authentication</Label>
              <Select
                value={config.auth?.type || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    onChange({ ...config, auth: undefined })
                  } else {
                    onChange({ ...config, auth: { ...config.auth, type: value as any } })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Authentication</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.auth?.type === "bearer" && (
              <div>
                <Label htmlFor="token">Bearer Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={config.auth.token || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      auth: { ...config.auth, token: e.target.value },
                    })
                  }
                />
              </div>
            )}
            {config.auth?.type === "basic" && (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={config.auth.username || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        auth: { ...config.auth, username: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={config.auth.password || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        auth: { ...config.auth, password: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            )}
            {config.auth?.type === "apikey" && (
              <>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.auth.apiKey || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        auth: { ...config.auth, apiKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyHeader">Header Name</Label>
                  <Input
                    id="apiKeyHeader"
                    value={config.auth.apiKeyHeader || "X-API-Key"}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        auth: { ...config.auth, apiKeyHeader: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="autoRefresh"
                checked={config.autoRefresh || false}
                onCheckedChange={(checked) => onChange({ ...config, autoRefresh: checked })}
              />
              <Label htmlFor="autoRefresh">Auto Refresh</Label>
            </div>
            {config.autoRefresh && (
              <div>
                <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={config.refreshInterval || 60}
                  onChange={(e) => onChange({ ...config, refreshInterval: Number.parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        )

      case "csv":
        return (
          <div>
            <Label htmlFor="csvContent">CSV Content</Label>
            <Textarea
              id="csvContent"
              value={config.fileContent || ""}
              onChange={(e) => onChange({ ...config, fileContent: e.target.value })}
              placeholder="Paste your CSV content here..."
              rows={10}
            />
          </div>
        )

      case "json":
        return (
          <div>
            <Label htmlFor="jsonContent">JSON Content</Label>
            <Textarea
              id="jsonContent"
              value={config.fileContent || ""}
              onChange={(e) => onChange({ ...config, fileContent: e.target.value })}
              placeholder="Paste your JSON content here..."
              rows={10}
            />
          </div>
        )

      case "database":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="connectionString">Connection String</Label>
              <Input
                id="connectionString"
                type="password"
                value={config.connectionString || ""}
                onChange={(e) => onChange({ ...config, connectionString: e.target.value })}
                placeholder="postgresql://user:password@host:port/database"
              />
            </div>
            <div>
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={config.query || ""}
                onChange={(e) => onChange({ ...config, query: e.target.value })}
                placeholder="SELECT * FROM table_name"
                rows={5}
              />
            </div>
          </div>
        )

      default:
        return <div>Manual data entry - no configuration needed</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Sources</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      {/* Data Sources List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((dataSource) => {
          const typeInfo = DATA_SOURCE_TYPES.find((t) => t.value === dataSource.type)
          const isSelected = selectedDataSourceId === dataSource.id

          return (
            <Card
              key={dataSource.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => onDataSourceSelect?.(dataSource)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {typeInfo && <typeInfo.icon className="h-5 w-5 text-gray-600" />}
                    <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(dataSource.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSource(dataSource)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTestConnection(dataSource.id)}>
                          <Link className="h-4 w-4 mr-2" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRefreshData(dataSource.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDataSource(dataSource.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{typeInfo?.label}</Badge>
                  <Badge variant={dataSource.status === "connected" ? "default" : "destructive"}>
                    {dataSource.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{typeInfo?.description}</p>
                {dataSource.lastSync && (
                  <p className="text-xs text-gray-500">Last sync: {dataSource.lastSync.toLocaleString()}</p>
                )}
                <div className="mt-2">
                  <p className="text-xs text-gray-500">{dataSource.fields.length} fields discovered</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Data Source Dialog */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Data Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Data Source Type</Label>
                <Select value={newSourceType} onValueChange={(value) => setNewSourceType(value as DataSource["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderConfigForm(newSourceType, newSourceConfig, setNewSourceConfig)}

              <div className="flex space-x-2">
                <Button onClick={handleCreateDataSource}>Create Data Source</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Data Source Dialog */}
      {editingSource && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Data Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sourceName">Name</Label>
                <Input
                  id="sourceName"
                  value={editingSource.name}
                  onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                />
              </div>

              {renderConfigForm(editingSource.type, editingSource.config, (config) =>
                setEditingSource({ ...editingSource, config }),
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={async () => {
                    await dataMappingAPI.updateDataSource(editingSource.id, editingSource)
                    setDataSources(dataMappingAPI.getAllDataSources())
                    setEditingSource(null)
                    toast({
                      title: "Success",
                      description: "Data source updated",
                    })
                  }}
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingSource(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
