"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useDrop } from "react-dnd"
import { useResizeObserver } from "@/hooks/use-resize-observer"
import { EnhancedInvoiceComponent } from "./enhanced-invoice-component"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Grid, RulerIcon } from "lucide-react"
import { canvasSettingsManager, type CanvasSettings } from "@/lib/canvas-settings-manager"
import { useToast } from "@/hooks/use-toast"
import { Ruler } from "./ruler"

interface CanvasProps {
  components: any[]
  onComponentsChange: (components: any[]) => void
  selectedComponent: any
  onSelectComponent: (component: any) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  showGrid: boolean
  onToggleGrid: () => void
  canvasSettings: CanvasSettings
  onCanvasSettingsChange: (settings: CanvasSettings) => void
}

export function EnhancedInvoiceCanvas({
  components,
  onComponentsChange,
  selectedComponent,
  onSelectComponent,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  canvasSettings,
  onCanvasSettingsChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [snapToGrid, setSnapToGrid] = useState(canvasSettings.snapToGrid)
  const { toast } = useToast()

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showRulerGuides, setShowRulerGuides] = useState(false)

  // Responsive canvas sizing
  const canvasRect = useResizeObserver(canvasRef)

  useEffect(() => {
    if (canvasRect) {
      setCanvasSize({
        width: canvasRect.width,
        height: Math.max(canvasRect.height, 800),
      })
    }
  }, [canvasRect])

  // Update snap to grid when canvas settings change
  useEffect(() => {
    setSnapToGrid(canvasSettings.snapToGrid)
  }, [canvasSettings.snapToGrid])

  // Collision detection
  const checkCollision = useCallback((newComponent: any, existingComponents: any[]) => {
    const buffer = 5 // 5px buffer for collision detection

    return existingComponents.some((existing) => {
      if (existing.id === newComponent.id) return false

      return !(
        newComponent.x + newComponent.width + buffer < existing.x ||
        existing.x + existing.width + buffer < newComponent.x ||
        newComponent.y + newComponent.height + buffer < existing.y ||
        existing.y + existing.height + buffer < newComponent.y
      )
    })
  }, [])

  // Snap to grid function
  const snapToGridFn = useCallback(
    (value: number) => {
      return snapToGrid ? Math.round(value / canvasSettings.gridSize) * canvasSettings.gridSize : value
    },
    [snapToGrid, canvasSettings.gridSize],
  )

  // Mouse tracking for ruler guides
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / zoom,
          y: (e.clientY - rect.top) / zoom,
        })
      }
    },
    [zoom],
  )

  // Drop handler with validation
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "component",
      drop: (item: any, monitor) => {
        const offset = monitor.getClientOffset()
        const canvasRect = canvasRef.current?.getBoundingClientRect()

        if (offset && canvasRect) {
          const x = snapToGridFn((offset.x - canvasRect.left) / zoom)
          const y = snapToGridFn((offset.y - canvasRect.top) / zoom)

          const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
          const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)

          let newComponent: any

          if (item.customField) {
            // Handle custom field
            newComponent = {
              id: `${item.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: item.type,
              label: item.label,
              x: Math.max(0, Math.min(x, canvasPixelWidth - item.customField.properties.width)),
              y: Math.max(0, Math.min(y, canvasPixelHeight - item.customField.properties.height)),
              width: item.customField.properties.width,
              height: item.customField.properties.height,
              properties: {
                ...item.customField.properties,
                fieldDefinition: item.customField,
              },
              zIndex: components.length + 1,
            }
          } else {
            // Handle standard component
            newComponent = {
              id: `${item.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: item.type,
              label: item.label,
              x: Math.max(0, Math.min(x, canvasPixelWidth - 200)),
              y: Math.max(0, Math.min(y, canvasPixelHeight - 40)),
              width: getDefaultWidth(item.type),
              height: getDefaultHeight(item.type),
              properties: getDefaultProperties(item.type),
              zIndex: components.length + 1,
            }
          }

          // Check for collisions
          if (checkCollision(newComponent, components)) {
            toast({
              title: "Collision Detected",
              description: "Component overlaps with existing element. Please choose a different position.",
              variant: "destructive",
            })
            return
          }

          onComponentsChange([...components, newComponent])
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [components, zoom, snapToGridFn, checkCollision, onComponentsChange, canvasSettings, toast],
  )

  // Handle accessible drop events
  useEffect(() => {
    const handleAccessibleDrop = (e: CustomEvent) => {
      const { type, label, customField } = e.detail
      const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
      const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)
      const centerX = canvasPixelWidth / 2
      const centerY = canvasPixelHeight / 2

      let newComponent: any

      if (customField) {
        newComponent = {
          id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          label,
          x: centerX - customField.properties.width / 2,
          y: centerY - customField.properties.height / 2,
          width: customField.properties.width,
          height: customField.properties.height,
          properties: {
            ...customField.properties,
            fieldDefinition: customField,
          },
          zIndex: components.length + 1,
        }
      } else {
        newComponent = {
          id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          label,
          x: centerX - 100,
          y: centerY - 20,
          width: getDefaultWidth(type),
          height: getDefaultHeight(type),
          properties: getDefaultProperties(type),
          zIndex: components.length + 1,
        }
      }

      if (!checkCollision(newComponent, components)) {
        onComponentsChange([...components, newComponent])
      } else {
        toast({
          title: "Collision Detected",
          description: "Cannot add component at center position due to overlap.",
          variant: "destructive",
        })
      }
    }

    document.addEventListener("accessibleDrop", handleAccessibleDrop as EventListener)
    return () => document.removeEventListener("accessibleDrop", handleAccessibleDrop as EventListener)
  }, [components, checkCollision, onComponentsChange, canvasSettings, toast])

  // Component movement with collision detection
  const handleComponentMove = useCallback(
    (id: string, x: number, y: number) => {
      const componentIndex = components.findIndex((c) => c.id === id)
      if (componentIndex === -1) return

      const component = components[componentIndex]
      const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
      const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)

      const snappedX = snapToGridFn(Math.max(0, Math.min(x, canvasPixelWidth - component.width)))
      const snappedY = snapToGridFn(Math.max(0, Math.min(y, canvasPixelHeight - component.height)))

      const updatedComponent = { ...component, x: snappedX, y: snappedY }
      const otherComponents = components.filter((c) => c.id !== id)

      if (checkCollision(updatedComponent, otherComponents)) {
        toast({
          title: "Collision Detected",
          description: "Cannot move component to this position due to overlap.",
          variant: "destructive",
        })
        return
      }

      const newComponents = [...components]
      newComponents[componentIndex] = updatedComponent
      onComponentsChange(newComponents)
    },
    [components, snapToGridFn, checkCollision, onComponentsChange, canvasSettings, toast],
  )

  // Component resizing with validation
  const handleComponentResize = useCallback(
    (id: string, width: number, height: number) => {
      const componentIndex = components.findIndex((c) => c.id === id)
      if (componentIndex === -1) return

      const component = components[componentIndex]
      const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
      const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)

      const maxWidth = canvasPixelWidth - component.x
      const maxHeight = canvasPixelHeight - component.y

      const constrainedWidth = Math.max(50, Math.min(width, maxWidth))
      const constrainedHeight = Math.max(20, Math.min(height, maxHeight))

      const updatedComponent = {
        ...component,
        width: constrainedWidth,
        height: constrainedHeight,
      }

      const otherComponents = components.filter((c) => c.id !== id)

      if (checkCollision(updatedComponent, otherComponents)) {
        toast({
          title: "Collision Detected",
          description: "Cannot resize component due to overlap with other elements.",
          variant: "destructive",
        })
        return
      }

      const newComponents = [...components]
      newComponents[componentIndex] = updatedComponent
      onComponentsChange(newComponents)
    },
    [components, checkCollision, onComponentsChange, canvasSettings, toast],
  )

  // Delete component
  const handleDeleteComponent = useCallback(
    (id: string) => {
      onComponentsChange(components.filter((c) => c.id !== id))
      if (selectedComponent?.id === id) {
        onSelectComponent(null)
      }
    },
    [components, selectedComponent, onComponentsChange, onSelectComponent],
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedComponent) return

      const step = e.shiftKey ? 10 : 1
      let newX = selectedComponent.x
      let newY = selectedComponent.y

      const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
      const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          newX = Math.max(0, selectedComponent.x - step)
          break
        case "ArrowRight":
          e.preventDefault()
          newX = Math.min(canvasPixelWidth - selectedComponent.width, selectedComponent.x + step)
          break
        case "ArrowUp":
          e.preventDefault()
          newY = Math.max(0, selectedComponent.y - step)
          break
        case "ArrowDown":
          e.preventDefault()
          newY = Math.min(canvasPixelHeight - selectedComponent.height, selectedComponent.y + step)
          break
        case "Delete":
        case "Backspace":
          e.preventDefault()
          handleDeleteComponent(selectedComponent.id)
          break
        default:
          return
      }

      if (newX !== selectedComponent.x || newY !== selectedComponent.y) {
        handleComponentMove(selectedComponent.id, newX, newY)
      }
    },
    [selectedComponent, handleComponentMove, handleDeleteComponent, canvasSettings],
  )

  const canvasPixelWidth = canvasSettingsManager.mmToPixels(canvasSettings.width)
  const canvasPixelHeight = canvasSettingsManager.mmToPixels(canvasSettings.height)

  // Grid pattern
  const gridPattern = useMemo(() => {
    if (!showGrid || !canvasSettings.snapToGrid) return null

    const gridSize = canvasSettings.gridSize
    const lines = []

    // Vertical lines
    for (let x = 0; x <= canvasPixelWidth; x += gridSize) {
      lines.push(<line key={`v-${x}`} x1={x} y1={0} x2={x} y2={canvasPixelHeight} stroke="#e5e7eb" strokeWidth={0.5} />)
    }

    // Horizontal lines
    for (let y = 0; y <= canvasPixelHeight; y += gridSize) {
      lines.push(<line key={`h-${y}`} x1={0} y1={y} x2={canvasPixelWidth} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />)
    }

    return (
      <svg className="absolute inset-0 pointer-events-none" width={canvasPixelWidth} height={canvasPixelHeight}>
        {lines}
      </svg>
    )
  }, [showGrid, canvasSettings.snapToGrid, canvasSettings.gridSize, canvasPixelWidth, canvasPixelHeight])

  const handleToggleRulers = useCallback(() => {
    const newSettings = canvasSettingsManager.saveSettings({
      ...canvasSettings,
      showRulers: !canvasSettings.showRulers,
    })
    onCanvasSettingsChange(newSettings)
  }, [canvasSettings, onCanvasSettingsChange])

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.max(canvasSettings.zoom.min, zoom - 0.25))}
            disabled={zoom <= canvasSettings.zoom.min}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.min(canvasSettings.zoom.max, zoom + 0.25))}
            disabled={zoom >= canvasSettings.zoom.max}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onZoomChange(canvasSettings.zoom.default)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={canvasSettings.showRulers ? "default" : "outline"} size="sm" onClick={handleToggleRulers}>
            <RulerIcon className="h-4 w-4 mr-1" />
            Rulers
          </Button>
          <Button variant={showGrid ? "default" : "outline"} size="sm" onClick={onToggleGrid}>
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button variant={snapToGrid ? "default" : "outline"} size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
            Snap
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="relative">
          {/* Rulers */}
          {canvasSettings.showRulers && (
            <>
              {/* Top Ruler */}
              <div className="sticky top-0 left-0 z-20 bg-white border-b">
                <div className="flex">
                  {/* Corner square */}
                  <div className="w-8 h-8 bg-gray-100 border-r border-b flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  {/* Horizontal ruler */}
                  <div className="flex-1 overflow-hidden">
                    <Ruler
                      orientation="horizontal"
                      length={canvasPixelWidth}
                      zoom={zoom}
                      mousePosition={mousePosition.x}
                      showGuides={showRulerGuides}
                      unit="px"
                    />
                  </div>
                </div>
              </div>

              {/* Left Ruler */}
              <div className="absolute top-8 left-0 z-10">
                <Ruler
                  orientation="vertical"
                  length={canvasPixelHeight}
                  zoom={zoom}
                  mousePosition={mousePosition.y}
                  showGuides={showRulerGuides}
                  unit="px"
                />
              </div>
            </>
          )}

          {/* Canvas Container */}
          <div
            className="p-4"
            style={{
              paddingLeft: canvasSettings.showRulers ? "36px" : "16px",
              paddingTop: canvasSettings.showRulers ? "4px" : "16px",
            }}
          >
            <div
              className={`relative bg-white shadow-lg mx-auto transition-transform duration-200 ${
                isOver && canDrop ? "ring-2 ring-blue-400 ring-opacity-50" : ""
              }`}
              style={{
                width: `${canvasPixelWidth}px`,
                minHeight: `${canvasPixelHeight}px`,
                backgroundColor: canvasSettings.backgroundColor,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setShowRulerGuides(true)}
              onMouseLeave={() => setShowRulerGuides(false)}
              role="application"
              aria-label="Invoice design canvas. Use arrow keys to move selected component, Delete to remove."
              ref={(node) => {
                canvasRef.current = node
                drop(node)
              }}
            >
              {gridPattern}

              {components.map((component) => (
                <EnhancedInvoiceComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onSelect={() => onSelectComponent(component)}
                  onMove={handleComponentMove}
                  onResize={handleComponentResize}
                  onDelete={handleDeleteComponent}
                  canvasSize={{ width: canvasPixelWidth, height: canvasPixelHeight }}
                  zoom={zoom}
                />
              ))}

              {components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-medium mb-2">Start designing your invoice</div>
                    <div className="text-sm">Drag components from the palette to begin</div>
                    <div className="text-xs mt-2">Or press Tab to navigate with keyboard</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getDefaultWidth(type: string): number {
  const widths = {
    text: 200,
    logo: 120,
    table: 400,
    commission: 250,
    gst: 200,
    address: 200,
    phone: 150,
    email: 200,
    date: 120,
    "invoice-number": 150,
  }
  return widths[type] || 200
}

function getDefaultHeight(type: string): number {
  const heights = {
    text: 30,
    logo: 60,
    table: 120,
    commission: 80,
    gst: 60,
    address: 80,
    phone: 30,
    email: 30,
    date: 30,
    "invoice-number": 30,
  }
  return heights[type] || 40
}

function getDefaultProperties(type: string) {
  const defaults = {
    text: { content: "Sample Text", fontSize: 14, color: "#000000", fontWeight: "normal", textAlign: "left" },
    logo: { src: "/placeholder.svg?height=60&width=120", alt: "Company Logo", objectFit: "contain" },
    table: {
      rows: 3,
      columns: 4,
      headers: ["Item", "Qty", "Rate", "Amount"],
      borderStyle: "solid",
      borderColor: "#000000",
      headerBg: "#f3f4f6",
    },
    commission: { rate: 5, type: "percentage", showCalculation: true },
    gst: { rate: 18, hsn: "9983", showBreakdown: true },
    address: {
      content: "Company Address\nCity, State - PIN\nCountry",
      fontSize: 12,
      lineHeight: 1.4,
    },
    phone: { content: "+91 9876543210", fontSize: 12 },
    email: { content: "contact@company.com", fontSize: 12 },
    date: { format: "DD/MM/YYYY", fontSize: 12 },
    "invoice-number": { prefix: "INV-", format: "auto", fontSize: 14, fontWeight: "bold" },
  }

  return defaults[type] || {}
}
