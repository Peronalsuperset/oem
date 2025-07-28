"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer, X } from "lucide-react"

interface PreviewData {
  name: string
  components: any[]
}

export default function InvoicePreview() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get preview data from sessionStorage
    const data = sessionStorage.getItem("invoice-preview")
    if (data) {
      try {
        setPreviewData(JSON.parse(data))
      } catch (error) {
        console.error("Error parsing preview data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    console.log("Download PDF functionality would be implemented here")
  }

  const handleClose = () => {
    window.close()
  }

  const renderComponent = (component: any) => {
    const style = {
      position: "absolute" as const,
      left: `${component.x}px`,
      top: `${component.y}px`,
      width: `${component.width}px`,
      height: `${component.height}px`,
      zIndex: component.zIndex || 1,
    }

    const renderContent = () => {
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
            <div className="w-full h-full flex items-center justify-center">
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
                        className="border p-2 font-medium text-left"
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
                          className="border p-2"
                          style={{ borderColor: component.properties.borderColor }}
                        >
                          {colIdx === 0
                            ? `Item ${rowIdx + 1}`
                            : colIdx === 1
                              ? Math.floor(Math.random() * 10) + 1
                              : colIdx === 2
                                ? `₹${(Math.random() * 1000 + 100).toFixed(2)}`
                                : `₹${(Math.random() * 5000 + 500).toFixed(2)}`}
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
            <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="font-semibold text-blue-800 mb-2">Commission Details</div>
              <div className="text-blue-700 space-y-1">
                <div>
                  Rate: {component.properties.rate}
                  {component.properties.type === "percentage" ? "%" : " ₹"}
                </div>
                <div>Type: {component.properties.type}</div>
                {component.properties.showCalculation && (
                  <div className="text-sm text-blue-600 mt-2 pt-2 border-t border-blue-200">
                    <div>Order Value: ₹50,000</div>
                    <div>Commission: ₹{(50000 * (component.properties.rate / 100)).toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          )

        case "gst":
          return (
            <div className="text-sm p-3 bg-green-50 border border-green-200 rounded">
              <div className="font-semibold text-green-800 mb-2">GST Details</div>
              <div className="text-green-700 space-y-1">
                <div>Rate: {component.properties.rate}%</div>
                <div>HSN/SAC: {component.properties.hsn}</div>
                {component.properties.showBreakdown && (
                  <div className="text-sm text-green-600 mt-2 pt-2 border-t border-green-200">
                    <div>CGST: {component.properties.rate / 2}%</div>
                    <div>SGST: {component.properties.rate / 2}%</div>
                  </div>
                )}
              </div>
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
              className="w-full h-full text-gray-800"
            >
              {component.properties.content || "Company Address\nCity, State - PIN\nCountry"}
            </div>
          )

        case "phone":
          return (
            <div
              style={{ fontSize: `${component.properties.fontSize}px` }}
              className="w-full h-full flex items-center text-gray-800"
            >
              <span className="font-medium">Phone: </span>
              {component.properties.content || "+91 9876543210"}
            </div>
          )

        case "email":
          return (
            <div
              style={{ fontSize: `${component.properties.fontSize}px` }}
              className="w-full h-full flex items-center text-gray-800"
            >
              <span className="font-medium">Email: </span>
              {component.properties.content || "contact@company.com"}
            </div>
          )

        case "date":
          return (
            <div
              style={{ fontSize: `${component.properties.fontSize}px` }}
              className="w-full h-full flex items-center text-gray-800"
            >
              <span className="font-medium">Date: </span>
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

        default:
          return (
            <div className="text-sm p-2 bg-gray-100 border border-gray-300 rounded">
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading preview...</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No preview data available</p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Hidden in print */}
      <div className="bg-white shadow-sm border-b p-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Invoice Preview</h1>
            <p className="text-gray-600">{previewData.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="p-8 print:p-0">
        <div
          className="relative bg-white shadow-lg mx-auto print:shadow-none print:mx-0"
          style={{
            width: "210mm", // A4 width
            minHeight: "297mm", // A4 height
          }}
        >
          {previewData.components.map(renderComponent)}

          {/* Sample watermark for preview */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:hidden">
            <div
              className="text-gray-200 text-6xl font-bold transform -rotate-45 select-none"
              style={{ fontSize: "120px" }}
            >
              PREVIEW
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
