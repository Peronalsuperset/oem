"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  Plus,
  Wand2,
  Type,
  Hash,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Percent,
  ImageIcon,
  List,
  CheckSquare,
} from "lucide-react"
import { customFieldManager, type CustomField } from "@/lib/custom-field-manager"
import { useToast } from "@/hooks/use-toast"

const FIELD_TYPES = [
  { value: "text", label: "Text", icon: Type, description: "Single line text input" },
  { value: "textarea", label: "Text Area", icon: Type, description: "Multi-line text input" },
  { value: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { value: "currency", label: "Currency", icon: DollarSign, description: "Money amount" },
  { value: "percentage", label: "Percentage", icon: Percent, description: "Percentage value" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "email", label: "Email", icon: Mail, description: "Email address" },
  { value: "phone", label: "Phone", icon: Phone, description: "Phone number" },
  { value: "select", label: "Dropdown", icon: List, description: "Selection from options" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "True/false value" },
  { value: "image", label: "Image", icon: ImageIcon, description: "Image upload" },
]

interface CustomFieldCreatorProps {
  onFieldCreated: (field: CustomField) => void
}

export function CustomFieldCreator({ onFieldCreated }: CustomFieldCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "text" as CustomField["type"],
    category: "custom" as CustomField["category"],
    description: "",
    properties: {
      placeholder: "",
      defaultValue: "",
      required: false,
      fontSize: 14,
      fontWeight: "normal",
      color: "#000000",
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      borderWidth: 1,
      borderRadius: 4,
      padding: 8,
      textAlign: "left" as const,
      width: 200,
      height: 40,
      validation: {
        min: undefined,
        max: undefined,
        pattern: "",
        message: "",
      },
      options: [""],
      prefix: "",
      suffix: "",
      multiline: false,
      rows: 3,
    },
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and label are required",
        variant: "destructive",
      })
      return
    }

    try {
      // Clean up properties based on field type
      const cleanProperties = { ...formData.properties }

      // Remove irrelevant properties for specific field types
      if (formData.type !== "select") {
        delete cleanProperties.options
      }
      if (formData.type !== "textarea") {
        delete cleanProperties.multiline
        delete cleanProperties.rows
      }
      if (!["currency", "percentage"].includes(formData.type)) {
        delete cleanProperties.prefix
        delete cleanProperties.suffix
      }

      const newField = customFieldManager.saveCustomField({
        name: formData.name.trim(),
        label: formData.label.trim(),
        type: formData.type,
        category: formData.category,
        description: formData.description.trim(),
        properties: cleanProperties,
      })

      onFieldCreated(newField)
      setIsOpen(false)
      resetForm()

      toast({
        title: "Success",
        description: `Custom field "${newField.label}" created successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "text",
      category: "custom",
      description: "",
      properties: {
        placeholder: "",
        defaultValue: "",
        required: false,
        fontSize: 14,
        fontWeight: "normal",
        color: "#000000",
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        textAlign: "left",
        width: 200,
        height: 40,
        validation: {
          min: undefined,
          max: undefined,
          pattern: "",
          message: "",
        },
        options: [""],
        prefix: "",
        suffix: "",
        multiline: false,
        rows: 3,
      },
    })
  }

  const updateProperty = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        [key]: value,
      },
    }))
  }

  const updateValidation = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      properties: {
        ...prev.properties,
        validation: {
          ...prev.properties.validation,
          [key]: value,
        },
      },
    }))
  }

  const addOption = () => {
    updateProperty("options", [...(formData.properties.options || []), ""])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.properties.options || [])]
    newOptions[index] = value
    updateProperty("options", newOptions)
  }

  const removeOption = (index: number) => {
    const newOptions = (formData.properties.options || []).filter((_, i) => i !== index)
    updateProperty("options", newOptions)
  }

  const selectedFieldType = FIELD_TYPES.find((type) => type.value === formData.type)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Field
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            Create Custom Field
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="appearance">Style</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-name">Field Name *</Label>
                  <Input
                    id="field-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., customerName"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for data binding (no spaces)</p>
                </div>
                <div>
                  <Label htmlFor="field-label">Display Label *</Label>
                  <Input
                    id="field-label"
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Customer Name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="field-type">Field Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CustomField["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: CustomField["category"]) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field-description">Description</Label>
                <Textarea
                  id="field-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this field"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="field-placeholder">Placeholder Text</Label>
                <Input
                  id="field-placeholder"
                  value={formData.properties.placeholder}
                  onChange={(e) => updateProperty("placeholder", e.target.value)}
                  placeholder="Enter placeholder text"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="field-default">Default Value</Label>
                <Input
                  id="field-default"
                  value={formData.properties.defaultValue}
                  onChange={(e) => updateProperty("defaultValue", e.target.value)}
                  placeholder="Enter default value"
                  className="mt-1"
                />
              </div>

              {formData.type === "select" && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-1">
                    {(formData.properties.options || []).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={(formData.properties.options || []).length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {["currency", "percentage"].includes(formData.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field-prefix">Prefix</Label>
                    <Input
                      id="field-prefix"
                      value={formData.properties.prefix}
                      onChange={(e) => updateProperty("prefix", e.target.value)}
                      placeholder={formData.type === "currency" ? "₹" : ""}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-suffix">Suffix</Label>
                    <Input
                      id="field-suffix"
                      value={formData.properties.suffix}
                      onChange={(e) => updateProperty("suffix", e.target.value)}
                      placeholder={formData.type === "percentage" ? "%" : ""}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-width">Width (px)</Label>
                  <Input
                    id="field-width"
                    type="number"
                    value={formData.properties.width}
                    onChange={(e) => updateProperty("width", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={50}
                    max={800}
                  />
                </div>
                <div>
                  <Label htmlFor="field-height">Height (px)</Label>
                  <Input
                    id="field-height"
                    type="number"
                    value={formData.properties.height}
                    onChange={(e) => updateProperty("height", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={20}
                    max={400}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-font-size">Font Size (px)</Label>
                  <Input
                    id="field-font-size"
                    type="number"
                    value={formData.properties.fontSize}
                    onChange={(e) => updateProperty("fontSize", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={8}
                    max={72}
                  />
                </div>
                <div>
                  <Label htmlFor="field-font-weight">Font Weight</Label>
                  <Select
                    value={formData.properties.fontWeight}
                    onValueChange={(value) => updateProperty("fontWeight", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="field-text-align">Text Alignment</Label>
                <Select
                  value={formData.properties.textAlign}
                  onValueChange={(value: "left" | "center" | "right") => updateProperty("textAlign", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-color">Text Color</Label>
                  <div className="mt-1">
                    <ColorPicker
                      value={formData.properties.color}
                      onChange={(color) => updateProperty("color", color)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="field-bg-color">Background Color</Label>
                  <div className="mt-1">
                    <ColorPicker
                      value={formData.properties.backgroundColor}
                      onChange={(color) => updateProperty("backgroundColor", color)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="field-border-color">Border Color</Label>
                  <div className="mt-1">
                    <ColorPicker
                      value={formData.properties.borderColor}
                      onChange={(color) => updateProperty("borderColor", color)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="field-border-width">Border Width (px)</Label>
                  <Input
                    id="field-border-width"
                    type="number"
                    value={formData.properties.borderWidth}
                    onChange={(e) => updateProperty("borderWidth", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={0}
                    max={10}
                  />
                </div>
                <div>
                  <Label htmlFor="field-border-radius">Border Radius (px)</Label>
                  <Input
                    id="field-border-radius"
                    type="number"
                    value={formData.properties.borderRadius}
                    onChange={(e) => updateProperty("borderRadius", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={0}
                    max={20}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="field-padding">Padding (px)</Label>
                <Input
                  id="field-padding"
                  type="number"
                  value={formData.properties.padding}
                  onChange={(e) => updateProperty("padding", Number.parseInt(e.target.value))}
                  className="mt-1"
                  min={0}
                  max={50}
                />
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={formData.properties.required}
                  onCheckedChange={(checked) => updateProperty("required", checked)}
                />
                <Label htmlFor="field-required">Required Field</Label>
              </div>

              {["number", "currency", "percentage"].includes(formData.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field-min">Minimum Value</Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={formData.properties.validation?.min || ""}
                      onChange={(e) =>
                        updateValidation("min", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-max">Maximum Value</Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={formData.properties.validation?.max || ""}
                      onChange={(e) =>
                        updateValidation("max", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {["text", "email", "phone"].includes(formData.type) && (
                <div>
                  <Label htmlFor="field-pattern">Validation Pattern (RegEx)</Label>
                  <Input
                    id="field-pattern"
                    value={formData.properties.validation?.pattern || ""}
                    onChange={(e) => updateValidation("pattern", e.target.value)}
                    placeholder="e.g., ^[A-Za-z\s]+$ for letters only"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="field-validation-message">Custom Validation Message</Label>
                <Input
                  id="field-validation-message"
                  value={formData.properties.validation?.message || ""}
                  onChange={(e) => updateValidation("message", e.target.value)}
                  placeholder="Error message to show when validation fails"
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label htmlFor="field-data-binding">Data Binding</Label>
                <Input
                  id="field-data-binding"
                  value={formData.properties.dataBinding || ""}
                  onChange={(e) => updateProperty("dataBinding", e.target.value)}
                  placeholder="e.g., invoice.customer.name"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Bind to dynamic data source</p>
              </div>

              {formData.type === "textarea" && (
                <div>
                  <Label htmlFor="field-rows">Number of Rows</Label>
                  <Input
                    id="field-rows"
                    type="number"
                    value={formData.properties.rows}
                    onChange={(e) => updateProperty("rows", Number.parseInt(e.target.value))}
                    className="mt-1"
                    min={1}
                    max={20}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedFieldType && (
                <div className="flex items-center">
                  <selectedFieldType.icon className="h-4 w-4 mr-2" />
                  {selectedFieldType.description}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Field</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
