"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useDrag } from "react-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Type,
  ImageIcon,
  Table,
  Calculator,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
  Search,
  Palette,
  Wand2,
  DollarSign,
  Percent,
  List,
  CheckSquare,
} from "lucide-react"
import { CustomFieldCreator } from "./custom-field-creator"
import { customFieldManager, type CustomField } from "@/lib/custom-field-manager"

const COMPONENT_CATEGORIES = {
  basic: {
    label: "Basic Elements",
    icon: Type,
    components: [
      { type: "text", label: "Text Field", icon: Type, description: "Add custom text", category: "basic" },
      { type: "logo", label: "Logo", icon: ImageIcon, description: "Company logo", category: "basic" },
      { type: "date", label: "Date", icon: Calendar, description: "Invoice date", category: "basic" },
      { type: "invoice-number", label: "Invoice #", icon: Hash, description: "Invoice number", category: "basic" },
    ],
  },
  contact: {
    label: "Contact Info",
    icon: Phone,
    components: [
      { type: "address", label: "Address", icon: MapPin, description: "Company address", category: "contact" },
      { type: "phone", label: "Phone", icon: Phone, description: "Contact number", category: "contact" },
      { type: "email", label: "Email", icon: Mail, description: "Email address", category: "contact" },
    ],
  },
  financial: {
    label: "Financial",
    icon: Calculator,
    components: [
      { type: "table", label: "Table", icon: Table, description: "Data table", category: "financial" },
      {
        type: "commission",
        label: "Commission",
        icon: Calculator,
        description: "Commission calculator",
        category: "financial",
      },
      { type: "gst", label: "GST Details", icon: FileText, description: "GST information", category: "financial" },
    ],
  },
}

interface DraggableComponentProps {
  type: string
  label: string
  icon: React.ComponentType<any>
  description: string
  category: string
  customField?: CustomField
}

function DraggableComponent(props: DraggableComponentProps) {
  const { type, label, icon: Icon, description, category } = props

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "component",
      item: {
        type,
        label,
        category,
        ...(props.customField ? { customField: props.customField } : {}),
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [type, label, category, props.customField],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        // Trigger programmatic drag for accessibility
        const event = new CustomEvent("accessibleDrop", {
          detail: { type, label, category, customField: props.customField },
        })
        document.dispatchEvent(event)
      }
    },
    [type, label, category, props.customField],
  )

  return (
    <div
      ref={dragRef}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${label} component to canvas`}
      onKeyDown={handleKeyDown}
      className={`p-3 border rounded-lg cursor-move hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-md">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{label}</div>
          <div className="text-xs text-gray-500 truncate">{description}</div>
        </div>
      </div>
    </div>
  )
}

export function EnhancedComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  // Load custom fields on mount
  useEffect(() => {
    setCustomFields(customFieldManager.getCustomFields())
  }, [])

  const handleCustomFieldCreated = useCallback((field: CustomField) => {
    setCustomFields((prev) => [...prev, field])
  }, [])

  // Helper function to get field icons - moved before usage
  const getFieldIcon = (fieldType: string) => {
    const iconMap = {
      text: Type,
      number: Hash,
      currency: DollarSign,
      percentage: Percent,
      date: Calendar,
      email: Mail,
      phone: Phone,
      textarea: Type,
      select: List,
      checkbox: CheckSquare,
      image: ImageIcon,
    }
    return iconMap[fieldType] || Type
  }

  const customFieldsCategory = {
    label: "Custom Fields",
    icon: Wand2,
    components: customFields.map((field) => ({
      type: "custom-field",
      label: field.label,
      icon: getFieldIcon(field.type),
      description: field.description || `Custom ${field.type} field`,
      category: "custom",
      customField: field,
    })),
  }

  const allCategories = {
    ...COMPONENT_CATEGORIES,
    ...(customFields.length > 0 ? { custom: customFieldsCategory } : {}),
  }

  const filteredComponents = Object.entries(allCategories).reduce(
    (acc, [key, category]) => {
      const filtered = category.components.filter(
        (component) =>
          component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      if (filtered.length > 0 && (!activeCategory || activeCategory === key)) {
        acc[key] = { ...category, components: filtered }
      }

      return acc
    },
    {} as typeof allCategories,
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-2 mb-3">
          <Palette className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-lg">Components</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search invoice components"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="text-xs"
          >
            All
          </Button>
          {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => (
            <Button
              key={key}
              variant={activeCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className="text-xs"
            >
              <category.icon className="h-3 w-3 mr-1" />
              {category.label}
            </Button>
          ))}
          {customFields.length > 0 && (
            <Button
              variant={activeCategory === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === "custom" ? null : "custom")}
              className="text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Custom
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="mb-4">
          <CustomFieldCreator onFieldCreated={handleCustomFieldCreated} />
        </div>
        {Object.entries(filteredComponents).map(([key, category]) => (
          <Card key={key} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.components.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.components.map((component) => (
                <DraggableComponent
                  key={`${component.type}-${component.customField?.id || "default"}`}
                  type={component.type}
                  label={component.label}
                  icon={component.icon}
                  description={component.description}
                  category={component.category}
                  customField={component.customField}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        {Object.keys(filteredComponents).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No components found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}
