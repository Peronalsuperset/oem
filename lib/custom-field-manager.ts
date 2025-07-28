"use client"

export interface CustomField {
  id: string
  name: string
  label: string
  type:
    | "text"
    | "number"
    | "date"
    | "email"
    | "phone"
    | "currency"
    | "percentage"
    | "textarea"
    | "select"
    | "checkbox"
    | "image"
  properties: {
    placeholder?: string
    defaultValue?: any
    required?: boolean
    validation?: {
      min?: number
      max?: number
      pattern?: string
      message?: string
    }
    options?: string[] // for select fields
    format?: string // for date/number formatting
    prefix?: string
    suffix?: string
    multiline?: boolean
    rows?: number
    width?: number
    height?: number
    fontSize?: number
    fontWeight?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    padding?: number
    textAlign?: "left" | "center" | "right"
    dataBinding?: string // for dynamic data
  }
  category: "basic" | "financial" | "contact" | "custom"
  icon?: string
  description?: string
  createdAt: string
  updatedAt: string
}

class CustomFieldManager {
  private storageKey = "custom-fields"

  // Get all custom fields
  getCustomFields(): CustomField[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultFields()
    } catch (error) {
      console.error("Error loading custom fields:", error)
      return this.getDefaultFields()
    }
  }

  // Save custom field
  saveCustomField(field: Omit<CustomField, "id" | "createdAt" | "updatedAt">): CustomField {
    try {
      const fields = this.getCustomFields()
      const now = new Date().toISOString()

      const newField: CustomField = {
        ...field,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      }

      fields.push(newField)
      localStorage.setItem(this.storageKey, JSON.stringify(fields))

      return newField
    } catch (error) {
      console.error("Error saving custom field:", error)
      throw new Error("Failed to save custom field")
    }
  }

  // Update custom field
  updateCustomField(id: string, updates: Partial<CustomField>): CustomField {
    try {
      const fields = this.getCustomFields()
      const index = fields.findIndex((f) => f.id === id)

      if (index === -1) {
        throw new Error("Custom field not found")
      }

      const updatedField = {
        ...fields[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      fields[index] = updatedField
      localStorage.setItem(this.storageKey, JSON.stringify(fields))

      return updatedField
    } catch (error) {
      console.error("Error updating custom field:", error)
      throw new Error("Failed to update custom field")
    }
  }

  // Delete custom field
  deleteCustomField(id: string): boolean {
    try {
      const fields = this.getCustomFields()
      const filteredFields = fields.filter((f) => f.id !== id)

      if (filteredFields.length === fields.length) {
        throw new Error("Custom field not found")
      }

      localStorage.setItem(this.storageKey, JSON.stringify(filteredFields))
      return true
    } catch (error) {
      console.error("Error deleting custom field:", error)
      throw new Error("Failed to delete custom field")
    }
  }

  // Get field by ID
  getCustomField(id: string): CustomField | null {
    try {
      const fields = this.getCustomFields()
      return fields.find((f) => f.id === id) || null
    } catch (error) {
      console.error("Error loading custom field:", error)
      return null
    }
  }

  // Get default system fields
  private getDefaultFields(): CustomField[] {
    const now = new Date().toISOString()
    return [
      {
        id: "field-company-name",
        name: "companyName",
        label: "Company Name",
        type: "text",
        properties: {
          placeholder: "Enter company name",
          required: true,
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "left",
        },
        category: "basic",
        description: "Company or business name",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "field-invoice-total",
        name: "invoiceTotal",
        label: "Invoice Total",
        type: "currency",
        properties: {
          prefix: "₹",
          required: true,
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "right",
          backgroundColor: "#f3f4f6",
        },
        category: "financial",
        description: "Total invoice amount",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "field-tax-rate",
        name: "taxRate",
        label: "Tax Rate",
        type: "percentage",
        properties: {
          suffix: "%",
          defaultValue: 18,
          min: 0,
          max: 100,
          fontSize: 14,
        },
        category: "financial",
        description: "Tax percentage rate",
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  // Generate field component properties
  generateFieldProperties(field: CustomField) {
    return {
      type: "custom-field",
      fieldType: field.type,
      fieldId: field.id,
      label: field.label,
      name: field.name,
      properties: {
        ...field.properties,
        customField: true,
        fieldDefinition: field,
      },
    }
  }
}

export const customFieldManager = new CustomFieldManager()
