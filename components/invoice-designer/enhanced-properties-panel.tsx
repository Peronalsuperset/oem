"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import { Settings, Palette, Layout, Type, AlertCircle, CheckCircle, Upload, Copy, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PropertiesPanelProps {
  selectedComponent: any
  onUpdateComponent: (updates: any) => void
  onDuplicateComponent?: () => void
  onDeleteComponent?: () => void
}

export function EnhancedPropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDuplicateComponent,
  onDeleteComponent,
}: PropertiesPanelProps) {
  const [localProperties, setLocalProperties] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Sync local properties with selected component
  useEffect(() => {
    if (selectedComponent) {
      setLocalProperties(selectedComponent.properties || {})
      setValidationErrors({})
      setHasUnsavedChanges(false)
    }
  }, [selectedComponent])

  // Validation rules
  const validateProperty = useCallback((key: string, value: any, componentType: string) => {
    const errors = {}

    switch (key) {
      case "fontSize":
        if (value < 8 || value > 72) {
          errors[key] = "Font size must be between 8 and 72"
        }
        break
      case "rate":
        if (componentType === "commission" && (value < 0 || value > 100)) {
          errors[key] = "Commission rate must be between 0 and 100"
        }
        if (componentType === "gst" && (value < 0 || value > 28)) {
          errors[key] = "GST rate must be between 0 and 28"
        }
        break
      case "hsn":
        if (componentType === "gst" && value && !/^\d{4,8}$/.test(value)) {
          errors[key] = "HSN code must be 4-8 digits"
        }
        break
      case "content":
        if (!value || value.trim().length === 0) {
          errors[key] = "Content cannot be empty"
        }
        break
      case "src":
        if (componentType === "logo" && value && !isValidUrl(value)) {
          errors[key] = "Please enter a valid URL"
        }
        break
    }

    return errors
  }, [])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle property updates with validation
  const handlePropertyChange = useCallback(
    (key: string, value: any) => {
      const errors = validateProperty(key, value, selectedComponent?.type)

      setValidationErrors((prev) => ({
        ...prev,
        ...errors,
        ...(Object.keys(errors).length === 0 ? { [key]: undefined } : {}),
      }))

      setLocalProperties((prev) => ({
        ...prev,
        [key]: value,
      }))

      setHasUnsavedChanges(true)

      // Auto-save if no errors
      if (Object.keys(errors).length === 0) {
        onUpdateComponent({
          properties: { ...localProperties, [key]: value },
        })
        setHasUnsavedChanges(false)
      }
    },
    [selectedComponent, localProperties, onUpdateComponent, validateProperty],
  )

  // Save changes manually
  const handleSaveChanges = useCallback(() => {
    const allErrors = Object.keys(localProperties).reduce((acc, key) => {
      const errors = validateProperty(key, localProperties[key], selectedComponent?.type)
      return { ...acc, ...errors }
    }, {})

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      })
      return
    }

    onUpdateComponent({ properties: localProperties })
    setHasUnsavedChanges(false)
    toast({
      title: "Changes Saved",
      description: "Component properties updated successfully",
    })
  }, [localProperties, selectedComponent, onUpdateComponent, validateProperty, toast])

  // Reset changes
  const handleResetChanges = useCallback(() => {
    if (selectedComponent) {
      setLocalProperties(selectedComponent.properties || {})
      setValidationErrors({})
      setHasUnsavedChanges(false)
    }
  }, [selectedComponent])

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div className="text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No component selected</p>
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  const renderBasicProperties = () => (
    <div className="space-y-4">
      {/* Position and Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="x">X Position</Label>
          <Input
            id="x"
            type="number"
            value={selectedComponent.x}
            onChange={(e) => onUpdateComponent({ x: Number.parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="y">Y Position</Label>
          <Input
            id="y"
            type="number"
            value={selectedComponent.y}
            onChange={(e) => onUpdateComponent({ y: Number.parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={selectedComponent.width}
            onChange={(e) => onUpdateComponent({ width: Number.parseInt(e.target.value) || 50 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            value={selectedComponent.height}
            onChange={(e) => onUpdateComponent({ height: Number.parseInt(e.target.value) || 20 })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Z-Index */}
      <div>
        <Label htmlFor="zIndex">Layer Order</Label>
        <Input
          id="zIndex"
          type="number"
          value={selectedComponent.zIndex || 1}
          onChange={(e) => onUpdateComponent({ zIndex: Number.parseInt(e.target.value) || 1 })}
          className="mt-1"
        />
      </div>
    </div>
  )

  const renderContentProperties = () => {
    switch (selectedComponent.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                value={localProperties.content || ""}
                onChange={(e) => handlePropertyChange("content", e.target.value)}
                className={`mt-1 ${validationErrors.content ? "border-red-500" : ""}`}
                placeholder="Enter your text here..."
              />
              {validationErrors.content && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="mt-1 space-y-2">
                  <Slider
                    value={[localProperties.fontSize || 14]}
                    onValueChange={([value]) => handlePropertyChange("fontSize", value)}
                    min={8}
                    max={72}
                    step={1}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={localProperties.fontSize || 14}
                    onChange={(e) => handlePropertyChange("fontSize", Number.parseInt(e.target.value))}
                    className={validationErrors.fontSize ? "border-red-500" : ""}
                    min={8}
                    max={72}
                  />
                </div>
                {validationErrors.fontSize && <p className="text-red-500 text-xs mt-1">{validationErrors.fontSize}</p>}
              </div>

              <div>
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select
                  value={localProperties.fontWeight || "normal"}
                  onValueChange={(value) => handlePropertyChange("fontWeight", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="lighter">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select
                value={localProperties.textAlign || "left"}
                onValueChange={(value) => handlePropertyChange("textAlign", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "logo":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={localProperties.src || ""}
                onChange={(e) => handlePropertyChange("src", e.target.value)}
                className={`mt-1 ${validationErrors.src ? "border-red-500" : ""}`}
                placeholder="https://example.com/logo.png"
              />
              {validationErrors.src && <p className="text-red-500 text-xs mt-1">{validationErrors.src}</p>}
            </div>

            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={localProperties.alt || ""}
                onChange={(e) => handlePropertyChange("alt", e.target.value)}
                className="mt-1"
                placeholder="Logo description"
              />
            </div>

            <div>
              <Label htmlFor="objectFit">Object Fit</Label>
              <Select
                value={localProperties.objectFit || "contain"}
                onValueChange={(value) => handlePropertyChange("objectFit", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                  <SelectItem value="scale-down">Scale Down</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        )

      case "commission":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="commissionType">Commission Type</Label>
              <Select
                value={localProperties.type || "percentage"}
                onValueChange={(value) => handlePropertyChange("type", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate">{localProperties.type === "percentage" ? "Percentage (%)" : "Amount (₹)"}</Label>
              <Input
                id="rate"
                type="number"
                value={localProperties.rate || 0}
                onChange={(e) => handlePropertyChange("rate", Number.parseFloat(e.target.value))}
                className={`mt-1 ${validationErrors.rate ? "border-red-500" : ""}`}
                min={0}
                max={localProperties.type === "percentage" ? 100 : undefined}
                step={localProperties.type === "percentage" ? 0.1 : 1}
              />
              {validationErrors.rate && <p className="text-red-500 text-xs mt-1">{validationErrors.rate}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showCalculation"
                checked={localProperties.showCalculation || false}
                onCheckedChange={(checked) => handlePropertyChange("showCalculation", checked)}
              />
              <Label htmlFor="showCalculation">Show Calculation</Label>
            </div>
          </div>
        )

      case "gst":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Select
                value={localProperties.rate?.toString() || "18"}
                onValueChange={(value) => handlePropertyChange("rate", Number.parseFloat(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hsn">HSN/SAC Code</Label>
              <Input
                id="hsn"
                value={localProperties.hsn || ""}
                onChange={(e) => handlePropertyChange("hsn", e.target.value)}
                className={`mt-1 ${validationErrors.hsn ? "border-red-500" : ""}`}
                placeholder="e.g., 9983"
                pattern="[0-9]{4,8}"
              />
              {validationErrors.hsn && <p className="text-red-500 text-xs mt-1">{validationErrors.hsn}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showBreakdown"
                checked={localProperties.showBreakdown || false}
                onCheckedChange={(checked) => handlePropertyChange("showBreakdown", checked)}
              />
              <Label htmlFor="showBreakdown">Show Tax Breakdown</Label>
            </div>
          </div>
        )

      case "table":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  value={localProperties.rows || 3}
                  onChange={(e) => handlePropertyChange("rows", Number.parseInt(e.target.value))}
                  className="mt-1"
                  min={1}
                  max={20}
                />
              </div>
              <div>
                <Label htmlFor="columns">Columns</Label>
                <Input
                  id="columns"
                  type="number"
                  value={localProperties.columns || 4}
                  onChange={(e) => handlePropertyChange("columns", Number.parseInt(e.target.value))}
                  className="mt-1"
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div>
              <Label>Table Headers</Label>
              <div className="mt-1 space-y-2">
                {(localProperties.headers || []).map((header: string, index: number) => (
                  <Input
                    key={index}
                    value={header}
                    onChange={(e) => {
                      const newHeaders = [...(localProperties.headers || [])]
                      newHeaders[index] = e.target.value
                      handlePropertyChange("headers", newHeaders)
                    }}
                    placeholder={`Header ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="borderStyle">Border Style</Label>
              <Select
                value={localProperties.borderStyle || "solid"}
                onValueChange={(value) => handlePropertyChange("borderStyle", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={localProperties.content || ""}
              onChange={(e) => handlePropertyChange("content", e.target.value)}
              className="mt-1"
              placeholder="Enter content..."
            />
          </div>
        )
    }
  }

  const renderStyleProperties = () => (
    <div className="space-y-4">
      {/* Color Properties */}
      {(selectedComponent.type === "text" || selectedComponent.type === "table") && (
        <div>
          <Label htmlFor="color">Text Color</Label>
          <div className="mt-1">
            <ColorPicker
              value={localProperties.color || "#000000"}
              onChange={(color) => handlePropertyChange("color", color)}
            />
          </div>
        </div>
      )}

      {selectedComponent.type === "table" && (
        <>
          <div>
            <Label htmlFor="borderColor">Border Color</Label>
            <div className="mt-1">
              <ColorPicker
                value={localProperties.borderColor || "#000000"}
                onChange={(color) => handlePropertyChange("borderColor", color)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="headerBg">Header Background</Label>
            <div className="mt-1">
              <ColorPicker
                value={localProperties.headerBg || "#f3f4f6"}
                onChange={(color) => handlePropertyChange("headerBg", color)}
              />
            </div>
          </div>
        </>
      )}

      {/* Spacing Properties */}
      {selectedComponent.type === "address" && (
        <div>
          <Label htmlFor="lineHeight">Line Height</Label>
          <div className="mt-1 space-y-2">
            <Slider
              value={[localProperties.lineHeight || 1.4]}
              onValueChange={([value]) => handlePropertyChange("lineHeight", value)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">{localProperties.lineHeight || 1.4}</div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Properties
          </h3>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{selectedComponent.type}</Badge>
            <span className="text-sm text-gray-600 truncate max-w-32">{selectedComponent.label}</span>
          </div>

          <div className="flex items-center space-x-1">
            {onDuplicateComponent && (
              <Button variant="ghost" size="sm" onClick={onDuplicateComponent}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onDeleteComponent && (
              <Button variant="ghost" size="sm" onClick={onDeleteComponent} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="content" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="content" className="mt-0">
              {renderContentProperties()}
            </TabsContent>

            <TabsContent value="style" className="mt-0">
              {renderStyleProperties()}
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              {renderBasicProperties()}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer Actions */}
      {hasUnsavedChanges && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              You have unsaved changes
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleResetChanges}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
