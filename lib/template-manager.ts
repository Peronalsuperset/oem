"use client"

export interface InvoiceTemplate {
  id: string
  name: string
  description?: string
  components: any[]
  settings: {
    pageSize: "A4" | "Letter" | "Legal" | "Custom"
    orientation: "portrait" | "landscape"
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
    branding: {
      primaryColor: string
      secondaryColor: string
      fontFamily: string
    }
  }
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

class TemplateManager {
  private storageKey = "invoice-templates"

  // Get all templates
  getTemplates(): InvoiceTemplate[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading templates:", error)
      return []
    }
  }

  // Get single template
  getTemplate(id: string): InvoiceTemplate | null {
    const templates = this.getTemplates()
    return templates.find((t) => t.id === id) || null
  }

  // Load template (alias for getTemplate)
  loadTemplate(id: string): InvoiceTemplate | null {
    return this.getTemplate(id)
  }

  // Save template
  saveTemplate(templateData: Partial<InvoiceTemplate>): InvoiceTemplate {
    try {
      const templates = this.getTemplates()
      const now = new Date().toISOString()

      const template: InvoiceTemplate = {
        id: templateData.id || `template-${Date.now()}`,
        name: templateData.name || "Untitled Template",
        description: templateData.description || "",
        components: templateData.components || [],
        settings: templateData.settings || {
          pageSize: "A4",
          orientation: "portrait",
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          branding: {
            primaryColor: "#000000",
            secondaryColor: "#666666",
            fontFamily: "Inter",
          },
        },
        isDefault: templateData.isDefault || false,
        createdAt: templateData.createdAt || now,
        updatedAt: now,
      }

      const existingIndex = templates.findIndex((t) => t.id === template.id)
      if (existingIndex >= 0) {
        templates[existingIndex] = template
      } else {
        templates.push(template)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(templates))
      return template
    } catch (error) {
      console.error("Error saving template:", error)
      throw new Error("Failed to save template")
    }
  }

  // Update template
  updateTemplate(id: string, updates: Partial<InvoiceTemplate>): InvoiceTemplate {
    const template = this.getTemplate(id)
    if (!template) {
      throw new Error("Template not found")
    }

    return this.saveTemplate({
      ...template,
      ...updates,
      id,
    })
  }

  // Delete template
  deleteTemplate(id: string): void {
    try {
      const templates = this.getTemplates()
      const filtered = templates.filter((t) => t.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error deleting template:", error)
      throw new Error("Failed to delete template")
    }
  }

  // Export template
  exportTemplate(id: string): string {
    const template = this.getTemplate(id)
    if (!template) {
      throw new Error("Template not found")
    }
    return JSON.stringify(template, null, 2)
  }

  // Import template
  importTemplate(templateData: string): InvoiceTemplate {
    try {
      const parsed = JSON.parse(templateData)

      // Validate required fields
      if (!parsed.name) {
        parsed.name = "Imported Template"
      }

      // Generate new ID to avoid conflicts
      parsed.id = `template-${Date.now()}`

      return this.saveTemplate(parsed)
    } catch (error) {
      console.error("Error importing template:", error)
      throw new Error("Failed to import template")
    }
  }
}

export const templateManager = new TemplateManager()
