"use client"

import type React from "react"
import { useCallback, useState, useRef, useEffect } from "react"
import { Rnd } from "react-rnd"
import { Trash2, Lock, Unlock, ImageIcon } from "lucide-react"

interface ComponentProps {
  component: any
  isSelected: boolean
  onSelect: () => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
  onDelete: (id: string) => void
  canvasSize: { width: number; height: number }
  zoom: number
}

export function EnhancedInvoiceComponent({
  component,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onDelete,
  canvasSize,
  zoom,
}: ComponentProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

  // Handle component focus for accessibility
  useEffect(() => {
    if (isSelected && componentRef.current) {
      componentRef.current.focus()
    }
  }, [isSelected])

  const handleDragStop = useCallback(
    (e: any, d: any) => {
      if (isLocked) return

      const newX = Math.max(0, Math.min(d.x, canvasSize.width - component.width))
      const newY = Math.max(0, Math.min(d.y, canvasSize.height - component.height))

      onMove(component.id, newX, newY)
    },
    [component, canvasSize, onMove, isLocked],
  )

  const handleResizeStop = useCallback(
    (e: any, direction: any, ref: any, delta: any, position: any) => {
      if (isLocked) return

      const newWidth = Math.max(50, Math.min(ref.offsetWidth, canvasSize.width - position.x))
      const newHeight = Math.max(20, Math.min(ref.offsetHeight, canvasSize.height - position.y))

      onResize(component.id, newWidth, newHeight)
      onMove(component.id, position.x, position.y)
    },
    [component.id, canvasSize, onResize, onMove, isLocked],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        onDelete(component.id)
      } else if (e.key === "Escape") {
        e.preventDefault()
        onSelect()
      }
    },
    [component.id, onDelete, onSelect],
  )

  const renderContent = useCallback(() => {
    try {
      switch (component.type) {
        case "text":
          return (
            <div
              style={{
                fontSize: `${component.properties.fontSize}px`,
                color: component.properties.color,
                fontWeight: component.properties.fontWeight,
                textAlign: component.properties.textAlign,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
              className="w-full h-full flex items-center"
            >
              {component.properties.content || "Text"}
            </div>
          )

        case "logo":
          return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded">
              <img
                src={component.properties.src || "/placeholder.svg?height=60&width=120&text=Logo"}
                alt={component.properties.alt || "Logo"}
                className="max-w-full max-h-full object-contain"
                style={{ objectFit: component.properties.objectFit }}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=60&width=120&text=Logo"
                }}
              />
            </div>
          )

        case "table":
          return (
            <div className="w-full h-full overflow-auto">
              <table
                className="w-full border-collapse text-xs"
                style={{
                  borderColor: component.properties.borderColor,
                  borderStyle: component.properties.borderStyle,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: component.properties.headerBg }}>
                    {component.properties.headers?.map((header: string, idx: number) => (
                      <th
                        key={idx}
                        className="border p-1 font-medium text-left"
                        style={{ borderColor: component.properties.borderColor }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: component.properties.rows || 3 }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {Array.from({ length: component.properties.columns || 4 }).map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="border p-1"
                          style={{ borderColor: component.properties.borderColor }}
                        >
                          Sample
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        case "commission":
          return (
            <div className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="font-medium text-blue-800">Commission Details</div>
              <div className="text-blue-600">
                Rate: {component.properties.rate}
                {component.properties.type === "percentage" ? "%" : " ₹"}
              </div>
              <div className="text-blue-600">Type: {component.properties.type}</div>
              {component.properties.showCalculation && (
                <div className="text-xs text-blue-500 mt-1">Calculation will appear here</div>
              )}
            </div>
          )

        case "gst":
          return (
            <div className="text-xs p-2 bg-green-50 border border-green-200 rounded">
              <div className="font-medium text-green-800">GST Details</div>
              <div className="text-green-600">Rate: {component.properties.rate}%</div>
              <div className="text-green-600">HSN: {component.properties.hsn}</div>
              {component.properties.showBreakdown && (
                <div className="text-xs text-green-500 mt-1">Tax breakdown will appear here</div>
              )}
            </div>
          )

        case "address":
          return (
            <div
              style={{
                fontSize: `${component.properties.fontSize}px`,
                lineHeight: component.properties.lineHeight,
                whiteSpace: "pre-line",
              }}
              className="w-full h-full text-gray-700"
            >
              {component.properties.content || "Address"}
            </div>
          )

        case "date":
          return (
            <div
              style={{ fontSize: `${component.properties.fontSize}px` }}
              className="w-full h-full flex items-center text-gray-700"
            >
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          )

        case "invoice-number":
          return (
            <div
              style={{
                fontSize: `${component.properties.fontSize}px`,
                fontWeight: component.properties.fontWeight,
              }}
              className="w-full h-full flex items-center text-gray-900"
            >
              {component.properties.prefix}2024-001
            </div>
          )

        case "custom-field":
          const customField = component.properties?.fieldDefinition
          if (!customField) {
            return (
              <div className="text-xs p-2 bg-red-50 border border-red-200 rounded text-red-600">
                Invalid custom field
              </div>
            )
          }

          const fieldStyle = {
            fontSize: `${customField.properties.fontSize}px`,
            fontWeight: customField.properties.fontWeight,
            color: customField.properties.color,
            backgroundColor: customField.properties.backgroundColor,
            borderColor: customField.properties.borderColor,
            borderWidth: `${customField.properties.borderWidth}px`,
            borderRadius: `${customField.properties.borderRadius}px`,
            padding: `${customField.properties.padding}px`,
            textAlign: customField.properties.textAlign,
            borderStyle: "solid",
          }

          switch (customField.type) {
            case "text":
            case "email":
            case "phone":
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  {customField.properties.prefix}
                  {customField.properties.defaultValue || customField.properties.placeholder || customField.label}
                  {customField.properties.suffix}
                </div>
              )

            case "textarea":
              return (
                <div style={fieldStyle} className="w-full h-full overflow-hidden">
                  {customField.properties.defaultValue || customField.properties.placeholder || customField.label}
                </div>
              )

            case "number":
            case "currency":
            case "percentage":
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  {customField.properties.prefix}
                  {customField.properties.defaultValue || "0"}
                  {customField.properties.suffix}
                </div>
              )

            case "date":
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  {customField.properties.defaultValue || new Date().toLocaleDateString()}
                </div>
              )

            case "select":
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  {customField.properties.options?.[0] || "Select option"}
                </div>
              )

            case "checkbox":
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  <input type="checkbox" className="mr-2" disabled />
                  {customField.label}
                </div>
              )

            case "image":
              return (
                <div
                  style={fieldStyle}
                  className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300"
                >
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-xs">Image</div>
                  </div>
                </div>
              )

            default:
              return (
                <div style={fieldStyle} className="w-full h-full flex items-center">
                  {customField.label}
                </div>
              )
          }

        default:
          return (
            <div className="text-xs p-2 bg-gray-100 border border-gray-300 rounded">
              {component.properties.content || component.label}
            </div>
          )
      }
    } catch (error) {
      console.error("Error rendering component:", error)
      return (
        <div className="text-xs p-2 bg-red-50 border border-red-200 rounded text-red-600">
          Error rendering component
        </div>
      )
    }
  }, [component])

  return (
    <Rnd
      size={{ width: component.width, height: component.height }}
      position={{ x: component.x, y: component.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={isLocked}
      enableResizing={!isLocked}
      bounds="parent"
      className={`group ${isSelected ? "z-50" : ""}`}
      style={{ zIndex: component.zIndex || 1 }}
    >
      <div
        ref={componentRef}
        tabIndex={0}
        role="button"
        aria-label={`${component.label} component`}
        className={`w-full h-full relative cursor-pointer transition-all duration-200 ${
          isSelected ? "ring-2 ring-blue-500 ring-opacity-75 shadow-lg" : isHovered ? "ring-1 ring-gray-300" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
      >
        {/* Component Content */}
        <div className="w-full h-full bg-white border border-gray-200 overflow-hidden">{renderContent()}</div>

        {/* Selection Controls */}
        {(isSelected || isHovered) && (
          <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-white border border-gray-200 rounded px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-gray-600 truncate max-w-20">{component.label}</span>
            <button
              type="button"
              className="h-5 w-5 p-0 flex items-center justify-center hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation()
                setIsLocked(!isLocked)
              }}
              title={isLocked ? "Unlock component" : "Lock component"}
            >
              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </button>
            <button
              type="button"
              className="h-5 w-5 p-0 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(component.id)
              }}
              title="Delete component"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Resize Handles (only when selected and not locked) */}
        {isSelected && !isLocked && (
          <>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize" />
          </>
        )}
      </div>
    </Rnd>
  )
}
