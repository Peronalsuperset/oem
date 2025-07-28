"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Download,
  Upload,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
  Minimize,
  Grid,
  Ruler,
  Layers,
  Database,
} from "lucide-react"
import { EnhancedComponentPalette } from "@/components/invoice-designer/enhanced-component-palette"
import { EnhancedInvoiceCanvas } from "@/components/invoice-designer/enhanced-invoice-canvas"
import { EnhancedPropertiesPanel } from "@/components/invoice-designer/enhanced-properties-panel"
import { CanvasSettingsPanel } from "@/components/invoice-designer/canvas-settings-panel"
import { DataSourceManager } from "@/components/invoice-designer/data-source-manager"
import { ResponsiveProvider, useResponsive, ResponsiveContainer } from "@/components/responsive-layout"
import { useToast } from "@/hooks/use-toast"
import { templateManager } from "@/lib/template-manager"
import { canvasSettingsManager } from "@/lib/canvas-settings-manager"

interface InvoiceComponent {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, any>
  zIndex?: number
}

function DesignerContent() {
  const { deviceType, viewMode, setViewMode, isMobile, isTablet } = useResponsive()
  const { toast } = useToast()

  // State management
  const [components, setComponents] = useState<InvoiceComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<InvoiceComponent | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [canvasSettings, setCanvasSettings] = useState(canvasSettingsManager.getDefaultSettings())
  const [templates, setTemplates] = useState(templateManager.getTemplates())
  const [activeTab, setActiveTab] = useState("components")

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect touch device for DnD backend
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window
  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend

  // Component management
  const handleComponentsChange = useCallback((newComponents: InvoiceComponent[]) => {
    setComponents(newComponents)
  }, [])

  const handleSelectComponent = useCallback((component: InvoiceComponent | null) => {
    setSelectedComponent(component)
  }, [])

  const handleCanvasSettingsChange = useCallback((newSettings: any) => {
    setCanvasSettings(newSettings)
    canvasSettingsManager.saveSettings(newSettings)
  }, [])

  const addComponent = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const newComponent: InvoiceComponent = {
        id: `${type}-${Date.now()}`,
        type,
        x: position?.x || 50,
        y: position?.y || 50,
        width: type === "table" ? 400 : 200,
        height: type === "table" ? 200 : 50,
        zIndex: components.length + 1,
        properties: {
          text: type === "text" ? "Sample Text" : "",
          fontSize: 14,
          fontWeight: "normal",
          color: "#000000",
          backgroundColor: "transparent",
          border: "none",
          padding: 8,
          ...(type === "table" && {
            rows: 3,
            columns: 3,
            data: Array(3)
              .fill(null)
              .map(() => Array(3).fill("")),
          }),
        },
      }
      setComponents((prev) => [...prev, newComponent])
      setSelectedComponent(newComponent)
    },
    [components.length],
  )

  const updateComponent = useCallback(
    (id: string, updates: Partial<InvoiceComponent>) => {
      setComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
      if (selectedComponent?.id === id) {
        setSelectedComponent((prev) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [selectedComponent],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((comp) => comp.id !== id))
      if (selectedComponent?.id === id) {
        setSelectedComponent(null)
      }
    },
    [selectedComponent],
  )

  // Template management
  const saveTemplate = useCallback(() => {
    const templateName = `Template ${templates.length + 1}`
    const template = {
      id: Date.now().toString(),
      name: templateName,
      components,
      settings: {
        pageSize: "A4" as const,
        orientation: "portrait" as const,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        branding: {
          primaryColor: "#000000",
          secondaryColor: "#666666",
          fontFamily: "Inter",
        },
      },
      isDefault: false,
    }

    templateManager.saveTemplate(template)
    setTemplates(templateManager.getTemplates())
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved successfully.`,
    })
  }, [components, templates.length, toast])

  const loadTemplate = useCallback(
    (templateId: string) => {
      const template = templateManager.getTemplate(templateId)
      if (template) {
        setComponents(template.components || [])
        setSelectedComponent(null)
        toast({
          title: "Template Loaded",
          description: `Template "${template.name}" has been loaded successfully.`,
        })
      }
    },
    [toast],
  )

  const exportTemplate = useCallback(() => {
    const template = {
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
  }, [components, canvasSettings, toast])

  const importTemplate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string)
          setComponents(template.components || [])
          if (template.canvasSettings) {
            setCanvasSettings(template.canvasSettings)
            canvasSettingsManager.saveSettings(template.canvasSettings)
          }
          setSelectedComponent(null)
          toast({
            title: "Template Imported",
            description: "Template has been imported successfully.",
          })
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to import template. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    },
    [toast],
  )

  // View mode handlers
  const handleViewModeChange = (mode: "auto" | "mobile" | "tablet" | "desktop") => {
    setViewMode(mode)
    toast({
      title: "View Mode Changed",
      description: `Switched to ${mode} view`,
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            saveTemplate()
            break
          case "Delete":
          case "Backspace":
            if (selectedComponent) {
              e.preventDefault()
              deleteComponent(selectedComponent.id)
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [saveTemplate, selectedComponent, deleteComponent])

  // Toolbar component
  const Toolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold">Invoice Designer</h1>
        <Badge variant="secondary">{deviceType}</Badge>
      </div>

      <div className="flex items-center space-x-2">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange("mobile")}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "tablet" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange("tablet")}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleViewModeChange("desktop")}
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-1">
          <Button variant={showGrid ? "default" : "ghost"} size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={showRulers ? "default" : "ghost"} size="sm" onClick={() => setShowRulers(!showRulers)}>
            <Ruler className="w-4 h-4" />
          </Button>
        </div>

        {/* Template Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={saveTemplate}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={exportTemplate}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importTemplate} className="hidden" />
        </div>

        {/* Fullscreen Toggle */}
        <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )

  // Mobile layout with sheets
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <Toolbar />

        <div className="flex-1 flex">
          {/* Mobile Canvas */}
          <div className="flex-1 overflow-auto">
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

          {/* Mobile Controls */}
          <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm">
                  <Layers className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="components" className="mt-4">
                    <EnhancedComponentPalette />
                  </TabsContent>
                  <TabsContent value="properties" className="mt-4">
                    <EnhancedPropertiesPanel
                      selectedComponent={selectedComponent}
                      onUpdateComponent={(updates) => {
                        if (selectedComponent) {
                          updateComponent(selectedComponent.id, updates)
                        }
                      }}
                      onDuplicateComponent={() => {
                        if (selectedComponent) {
                          const duplicated = {
                            ...selectedComponent,
                            id: `${selectedComponent.type}-${Date.now()}`,
                            x: selectedComponent.x + 20,
                            y: selectedComponent.y + 20,
                            zIndex: components.length + 1,
                          }
                          setComponents((prev) => [...prev, duplicated])
                          setSelectedComponent(duplicated)
                        }
                      }}
                      onDeleteComponent={() => {
                        if (selectedComponent) {
                          deleteComponent(selectedComponent.id)
                        }
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="data" className="mt-4">
                    <DataSourceManager
                      componentId={selectedComponent?.id}
                      onDataMapped={(data) => {
                        if (selectedComponent && selectedComponent.type === "table") {
                          updateComponent(selectedComponent.id, {
                            properties: {
                              ...selectedComponent.properties,
                              tableData: data,
                            },
                          })
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <CanvasSettingsPanel settings={canvasSettings} onSettingsChange={handleCanvasSettingsChange} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    )
  }

  // Tablet and Desktop layout
  return (
    <div className={`h-screen flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}>
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={`${isTablet ? "w-64" : "w-80"} border-r bg-gray-50 flex flex-col`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="components">
                <Layers className="w-4 h-4 mr-1" />
                {!isTablet && "Components"}
              </TabsTrigger>
              <TabsTrigger value="templates">
                <Save className="w-4 h-4 mr-1" />
                {!isTablet && "Templates"}
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="w-4 h-4 mr-1" />
                {!isTablet && "Data"}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-2">
              <TabsContent value="components" className="mt-0">
                <EnhancedComponentPalette />
              </TabsContent>
              <TabsContent value="templates" className="mt-0">
                <CanvasSettingsPanel settings={canvasSettings} onSettingsChange={handleCanvasSettingsChange} />
              </TabsContent>
              <TabsContent value="data" className="mt-0">
                <DataSourceManager
                  componentId={selectedComponent?.id}
                  onDataMapped={(data) => {
                    if (selectedComponent && selectedComponent.type === "table") {
                      updateComponent(selectedComponent.id, {
                        properties: {
                          ...selectedComponent.properties,
                          tableData: data,
                        },
                      })
                    }
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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

        {/* Right Properties Panel */}
        <div className={`${isTablet ? "w-64" : "w-80"} border-l bg-gray-50`}>
          <div className="p-4 border-b">
            <h3 className="font-semibold">Properties</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <EnhancedPropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={(updates) => {
                if (selectedComponent) {
                  updateComponent(selectedComponent.id, updates)
                }
              }}
              onDuplicateComponent={() => {
                if (selectedComponent) {
                  const duplicated = {
                    ...selectedComponent,
                    id: `${selectedComponent.type}-${Date.now()}`,
                    x: selectedComponent.x + 20,
                    y: selectedComponent.y + 20,
                    zIndex: components.length + 1,
                  }
                  setComponents((prev) => [...prev, duplicated])
                  setSelectedComponent(duplicated)
                }
              }}
              onDeleteComponent={() => {
                if (selectedComponent) {
                  deleteComponent(selectedComponent.id)
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DesignerPage() {
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window
  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend

  return (
    <ResponsiveProvider>
      <DndProvider backend={dndBackend}>
        <ResponsiveContainer maxWidth="full" padding={false}>
          <DesignerContent />
        </ResponsiveContainer>
      </DndProvider>
    </ResponsiveProvider>
  )
}
