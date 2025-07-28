"use client"
import { Rnd } from "react-rnd"

export function InvoiceComponent({ component, isSelected, onSelect, onMove, onResize }) {
  const renderContent = () => {
    switch (component.type) {
      case "text":
        return (
          <div
            style={{
              fontSize: component.properties.fontSize,
              color: component.properties.color,
            }}
          >
            {component.properties.content}
          </div>
        )

      case "logo":
        return (
          <img
            src={component.properties.src || "/placeholder.svg"}
            alt={component.properties.alt}
            className="max-w-full max-h-full object-contain"
          />
        )

      case "table":
        return (
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr>
                {component.properties.headers.map((header, idx) => (
                  <th key={idx} className="border border-gray-300 p-1 bg-gray-100">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: component.properties.rows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: component.properties.columns }).map((_, colIdx) => (
                    <td key={colIdx} className="border border-gray-300 p-1">
                      Sample
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )

      case "commission":
        return (
          <div className="text-sm">
            <div className="font-medium">Commission Details</div>
            <div>Rate: {component.properties.rate}%</div>
            <div>Type: {component.properties.type}</div>
          </div>
        )

      case "gst":
        return (
          <div className="text-sm">
            <div className="font-medium">GST Details</div>
            <div>Rate: {component.properties.rate}%</div>
            <div>HSN: {component.properties.hsn}</div>
          </div>
        )

      default:
        return <div className="text-sm">{component.properties.content || component.label}</div>
    }
  }

  return (
    <Rnd
      size={{ width: component.width, height: component.height }}
      position={{ x: component.x, y: component.y }}
      onDragStop={(e, d) => onMove(component.id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResize(component.id, ref.offsetWidth, ref.offsetHeight)
        onMove(component.id, position.x, position.y)
      }}
      className={`${isSelected ? "ring-2 ring-blue-500" : ""} cursor-pointer`}
      onClick={onSelect}
    >
      <div className="w-full h-full p-2 bg-white border border-gray-200 overflow-hidden">{renderContent()}</div>
    </Rnd>
  )
}
