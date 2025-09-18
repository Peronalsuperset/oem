"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { EnhancedComponentPalette } from "@/components/invoice-designer/enhanced-component-palette"
import { EnhancedInvoiceCanvas } from "@/components/invoice-designer/enhanced-invoice-canvas"
import { EnhancedPropertiesPanel } from "@/components/invoice-designer/enhanced-properties-panel"
import { CanvasSettingsPanel } from "@/components/invoice-designer/canvas-settings-panel"
import { DataSourceManager } from "@/components/invoice-designer/data-source-manager"
import { ResponsiveProvider, ResponsiveContainer } from "@/components/responsive-layout"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { canvasSettingsManager, type CanvasSettings } from "@/lib/canvas-settings-manager"
import { templateManager } from "@/lib/template-manager"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Download,
  Upload,
  Settings,
  Palette,
  Database,
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
  Eye,
} from "lucide-react"

interface InvoiceComponent {
  id: string
  type: string
  label: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, any>
  zIndex?: number
}

function DesignerContent() {
  const [components, setComponents] = useState<InvoiceComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<InvoiceComponent | null>(null)
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(canvasSettingsManager.getSettings())
  const [zoom, setZoom] = useState(canvasSettings.zoom.default)
  const [showGrid, setShowGrid] = useState(canvasSettings.snapToGrid)
  const [viewMode, setViewMode] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()

  // Device detection
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  // Auto-detect device type for view mode
  useEffect(() => {
    if (isMobile) setViewMode("mobile")
    else if (isTablet) setViewMode("tablet")
    else setViewMode("desktop")
  }, [isMobile, isTablet])

  // DnD Backend selection based on device
  const dndBackend = isMobile ? TouchBackend : HTML5Backend
  const dndOptions = isMobile
    ? {
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
      }
    : {}

  const handleComponentsChange = useCallback((newComponents: InvoiceComponent[]) => {
    setComponents(newComponents)
  }, [])

  const handleSelectComponent = useCallback((component: InvoiceComponent | null) => {
    setSelectedComponent(component)
  }, [])

  const handleCanvasSettingsChange = useCallback((settings: CanvasSettings) => {
    setCanvasSettings(settings)
  }, [])

  const handleSaveTemplate = useCallback(async () => {
    try {
      const templateName = `Template ${new Date().toLocaleDateString()}`
      await templateManager.saveTemplate({
        id: Date.now().toString(),
        name: templateName,
        components,
        canvasSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      toast({
        title: "Template Saved",
        description: `Template "${templateName}" has been saved successfully.`,
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    }
  }, [components, canvasSettings, toast])

  const handleExportTemplate = useCallback(() => {
    try {
      const template = {
        name: `Export ${new Date().toLocaleDateString()}`,
        components,
        canvasSettings,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-template-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Template Exported",
        description: "Template has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export template. Please try again.",
        variant: "destructive",
      })
    }
  }, [components, canvasSettings, toast])

  const handleImportTemplate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string)
          if (template.components && template.canvasSettings) {
            setComponents(template.components)
            setCanvasSettings(template.canvasSettings)
            setSelectedComponent(null)
            toast({
              title: "Template Imported",
              description: "Template has been imported successfully.",
            })
          } else {
            throw new Error("Invalid template format")
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid template file. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
      event.target.value = ""
    },
    [toast],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            handleSaveTemplate()
            break
          case "e":
            e.preventDefault()
            handleExportTemplate()
            break
        }
      }
    },
    [handleSaveTemplate, handleExportTemplate],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const ViewModeToggle = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === "mobile" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("mobile")}
        className="h-8 w-8 p-0"
      >
        <Smartphone className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "tablet" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("tablet")}
        className="h-8 w-8 p-0"
      >
        <Tablet className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "desktop" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("desktop")}
        className="h-8 w-8 p-0"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )

  const ToolbarActions = () => (
    <div className="flex items-center space-x-2">
      <ViewModeToggle />
      <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportTemplate}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>
      <label>
        <Button variant="outline" size="sm" asChild>
          <span>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </span>
        </Button>
        <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
      </label>
      <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
        {isFullscreen ? <Eye className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
    </div>
  )

  if (viewMode === "mobile") {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-semibold">Invoice Designer</h1>
          <div className="flex items-center space-x-2">
            <ViewModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <CanvasSettingsPanel settings={canvasSettings} onSettingsChange={handleCanvasSettingsChange} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Canvas */}
        <div className="flex-1 overflow-hidden">
          <EnhancedInvoiceCanvas
            components={components}
            onComponentsChange={handleComponentsChange}
            selectedComponent={selectedComponent}
            onSelectComponent={handleSelectComponent}
            zoom={zoom}
            onZoomChange={setZoom}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            canvasSettings={canvasSettings}
            onCanvasSettingsChange={handleCanvasSettingsChange}
          />
        </div>

        {/* Mobile Bottom Sheets */}
        <div className="flex items-center justify-around p-2 bg-white border-t">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-1" />
                Components
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96">
              <EnhancedComponentPalette />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Properties
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96">
              <EnhancedPropertiesPanel
                selectedComponent={selectedComponent}
                onComponentUpdate={(updatedComponent) => {
                  const newComponents = components.map((c) => (c.id === updatedComponent.id ? updatedComponent : c))
                  setComponents(newComponents)
                }}
              />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-1" />
                Data
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96">
              <DataSourceManager />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }

  if (viewMode === "tablet") {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Tablet Header */}
        <div className="flex items-center justify-between p-3 bg-white border-b">
          <h1 className="text-xl font-semibold">Invoice Designer</h1>
          <ToolbarActions />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-medium">Components</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <EnhancedComponentPalette />
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 flex flex-col">
            <EnhancedInvoiceCanvas
              components={components}
              onComponentsChange={handleComponentsChange}
              selectedComponent={selectedComponent}
              onSelectComponent={handleSelectComponent}
              zoom={zoom}
              onZoomChange={setZoom}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              canvasSettings={canvasSettings}
              onCanvasSettingsChange={handleCanvasSettingsChange}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-64 bg-white border-l flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-medium">Properties</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <EnhancedPropertiesPanel
                selectedComponent={selectedComponent}
                onComponentUpdate={(updatedComponent) => {
                  const newComponents = components.map((c) => (c.id === updatedComponent.id ? updatedComponent : c))
                  setComponents(newComponents)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className={`h-screen flex flex-col bg-gray-50 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Desktop Header */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-2xl font-bold">Invoice Designer</h1>
          <ToolbarActions />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {!isFullscreen && (
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Components</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <EnhancedComponentPalette />
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <EnhancedInvoiceCanvas
            components={components}
            onComponentsChange={handleComponentsChange}
            selectedComponent={selectedComponent}
            onSelectComponent={handleSelectComponent}
            zoom={zoom}
            onZoomChange={setZoom}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            canvasSettings={canvasSettings}
            onCanvasSettingsChange={handleCanvasSettingsChange}
          />
        </div>

        {/* Right Sidebar */}
        {!isFullscreen && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Properties & Settings</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="p-4 space-y-6">
                <EnhancedPropertiesPanel
                  selectedComponent={selectedComponent}
                  onComponentUpdate={(updatedComponent) => {
                    const newComponents = components.map((c) => (c.id === updatedComponent.id ? updatedComponent : c))
                    setComponents(newComponents)
                  }}
                />
                <CanvasSettingsPanel settings={canvasSettings} onSettingsChange={handleCanvasSettingsChange} />
                <DataSourceManager />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DesignerPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const dndBackend = isMobile ? TouchBackend : HTML5Backend
  const dndOptions = isMobile
    ? {
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
      }
    : {}

  return (
    <ResponsiveProvider>
      <ResponsiveContainer>
        <DndProvider backend={dndBackend} options={dndOptions}>
          <DesignerContent />
        </DndProvider>
      </ResponsiveContainer>
    </ResponsiveProvider>
  )
}
