"use client"

import { useCallback } from "react"
import { useDrop } from "react-dnd"
import { InvoiceComponent } from "./invoice-component"

export function InvoiceCanvas({ components, onComponentsChange, selectedComponent, onSelectComponent }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = monitor.getDropResult()?.getBoundingClientRect()

      if (offset && canvasRect) {
        const newComponent = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          label: item.label,
          x: offset.x - canvasRect.left,
          y: offset.y - canvasRect.top,
          width: 200,
          height: 40,
          properties: getDefaultProperties(item.type),
        }

        onComponentsChange((prev) => [...prev, newComponent])
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const handleComponentMove = useCallback(
    (id, x, y) => {
      onComponentsChange((prev) => prev.map((comp) => (comp.id === id ? { ...comp, x, y } : comp)))
    },
    [onComponentsChange],
  )

  const handleComponentResize = useCallback(
    (id, width, height) => {
      onComponentsChange((prev) => prev.map((comp) => (comp.id === id ? { ...comp, width, height } : comp)))
    },
    [onComponentsChange],
  )

  return (
    <div
      ref={drop}
      className={`relative w-full h-full bg-white border-2 border-dashed ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      } overflow-hidden`}
      style={{ minHeight: "800px" }}
    >
      {components.map((component) => (
        <InvoiceComponent
          key={component.id}
          component={component}
          isSelected={selectedComponent?.id === component.id}
          onSelect={() => onSelectComponent(component)}
          onMove={handleComponentMove}
          onResize={handleComponentResize}
        />
      ))}

      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-lg font-medium">Drag components here</div>
            <div className="text-sm">Start building your invoice template</div>
          </div>
        </div>
      )}
    </div>
  )
}

function getDefaultProperties(type) {
  const defaults = {
    text: { content: "Sample Text", fontSize: 14, color: "#000000" },
    logo: { src: "/placeholder.svg?height=60&width=120", alt: "Company Logo" },
    table: { rows: 3, columns: 4, headers: ["Item", "Qty", "Rate", "Amount"] },
    commission: { rate: 5, type: "percentage" },
    gst: { rate: 18, hsn: "9983" },
    address: { content: "Company Address\nCity, State - PIN" },
    phone: { content: "+91 9876543210" },
    email: { content: "contact@company.com" },
    date: { format: "DD/MM/YYYY" },
    "invoice-number": { prefix: "INV-", format: "auto" },
  }

  return defaults[type] || {}
}
