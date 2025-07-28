"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer, ExternalLink } from "lucide-react"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  templateName: string
  components: any[]
}

export function PreviewModal({ isOpen, onClose, templateName, components }: PreviewModalProps) {
  const [zoom, setZoom] = useState(0.6) // Smaller zoom for modal view

  const handlePrint = () => {
    // Store data and open in new window for printing
    const previewData = { name: templateName, components }
    sessionStorage.setItem("invoice-preview", JSON.stringify(previewData))
    window.open("/designer/preview", "_blank", "width=1000,height=1200")
  }

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    console.log("Download PDF functionality would be implemented here")
  }

  const renderComponent = (component: any) => {
    const style = {
      position: "absolute" as const,
      left: `${component.x * zoom}px`,
      top: `${component.y * zoom}px`,
      width: `${component.width * zoom}px`,
      height: `${component.height * zoom}px`,
      zIndex: component.zIndex || 1,
    }

    const renderContent = () => {
      switch (component.type) {
        case "text":
          return (
            <div
              style={{
                fontSize: `${(component.properties.fontSize || 14) * zoom}px`,
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
              />
            </div>
          )

        case "table":
          return (
            <div className="w-full h-full overflow-hidden">
              <table
                className="w-full border-collapse"
                style={{
                  borderColor: component.properties.borderColor,
                  borderStyle: component.properties.borderStyle,
                  fontSize: `${10 * zoom}px`,
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
                  {Array.from({ length: Math.min(component.properties.rows || 3, 3) }).map((_, rowIdx) => (
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
            <div className="p-2 bg-blue-50 border border-blue-200 rounded" style={{ fontSize: `${10 * zoom}px` }}>
              <div className="font-medium text-blue-800">Commission</div>
              <div className="text-blue-600">
                {component.properties.rate}
                {component.properties.type === "percentage" ? "%" : " ₹"}
              </div>
            </div>
          )

        case "gst":
          return (
            <div className="p-2 bg-green-50 border border-green-200 rounded" style={{ fontSize: `${10 * zoom}px` }}>
              <div className="font-medium text-green-800">GST</div>
              <div className="text-green-600">{component.properties.rate}%</div>
            </div>
          )

        case "address":
          return (
            <div
              style={{
                fontSize: `${(component.properties.fontSize || 12) * zoom}px`,
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
              style={{ fontSize: `${(component.properties.fontSize || 12) * zoom}px` }}
              className="w-full h-full flex items-center text-gray-700"
            >
              {new Date().toLocaleDateString("en-IN")}
            </div>
          )

        case "invoice-number":
          return (
            <div
              style={{
                fontSize: `${(component.properties.fontSize || 14) * zoom}px`,
                fontWeight: component.properties.fontWeight,
              }}
              className="w-full h-full flex items-center text-gray-900"
            >
              {component.properties.prefix}2024-001
            </div>
          )

        default:
          return (
            <div className="p-1 bg-gray-100 border border-gray-300 rounded" style={{ fontSize: `${10 * zoom}px` }}>
              {component.properties.content || component.label}
            </div>
          )
      }
    }

    return (
      <div key={component.id} style={style} className="overflow-hidden">
        {renderContent()}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Preview: {templateName}</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
                -
              </Button>
              <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(1, zoom + 0.1))}>
                +
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div
            className="relative bg-white shadow-lg mx-auto"
            style={{
              width: `${210 * zoom}mm`,
              minHeight: `${297 * zoom}mm`,
            }}
          >
            {components.map(renderComponent)}

            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">Empty Template</div>
                  <div className="text-sm">Add components to see preview</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {components.length} component{components.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Preview
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
