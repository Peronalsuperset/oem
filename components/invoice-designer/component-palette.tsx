"use client"

import { useDrag } from "react-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, ImageIcon, Table, Calculator, FileText, MapPin, Phone, Mail, Calendar, Hash } from "lucide-react"

const COMPONENT_TYPES = [
  { type: "text", label: "Text Field", icon: Type, description: "Add custom text" },
  { type: "logo", label: "Logo", icon: ImageIcon, description: "Company logo" },
  { type: "table", label: "Table", icon: Table, description: "Data table" },
  { type: "commission", label: "Commission", icon: Calculator, description: "Commission calculator" },
  { type: "gst", label: "GST Details", icon: FileText, description: "GST information" },
  { type: "address", label: "Address", icon: MapPin, description: "Company address" },
  { type: "phone", label: "Phone", icon: Phone, description: "Contact number" },
  { type: "email", label: "Email", icon: Mail, description: "Email address" },
  { type: "date", label: "Date", icon: Calendar, description: "Invoice date" },
  { type: "invoice-number", label: "Invoice #", icon: Hash, description: "Invoice number" },
]

function DraggableComponent({ type, label, icon: Icon, description }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-gray-600" />
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  )
}

export function ComponentPalette() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COMPONENT_TYPES.map((component) => (
            <DraggableComponent
              key={component.type}
              type={component.type}
              label={component.label}
              icon={component.icon}
              description={component.description}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
