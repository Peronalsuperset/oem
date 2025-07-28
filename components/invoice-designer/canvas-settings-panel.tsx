"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import { Settings, Ruler, Grid, Palette, Monitor } from "lucide-react"
import { canvasSettingsManager, PRESET_CANVAS_SIZES, type CanvasSettings } from "@/lib/canvas-settings-manager"
import { useToast } from "@/hooks/use-toast"

interface CanvasSettingsPanelProps {
  settings: CanvasSettings
  onSettingsChange: (settings: CanvasSettings) => void
}

export function CanvasSettingsPanel({ settings, onSettingsChange }: CanvasSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)
  const [selectedPreset, setSelectedPreset] = useState<string>("custom")
  const { toast } = useToast()

  useEffect(() => {
    setLocalSettings(settings)

    // Determine which preset matches current settings
    const matchingPreset = Object.entries(PRESET_CANVAS_SIZES).find(
      ([key, preset]) =>
        preset.width === settings.width &&
        preset.height === settings.height &&
        preset.orientation === settings.orientation,
    )

    setSelectedPreset(matchingPreset ? matchingPreset[0] : "custom")
  }, [settings])

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)

    if (presetKey !== "custom") {
      const preset = PRESET_CANVAS_SIZES[presetKey as keyof typeof PRESET_CANVAS_SIZES]
      setLocalSettings((prev) => ({
        ...prev,
        name: preset.name,
        width: preset.width,
        height: preset.height,
        orientation: preset.orientation,
        isCustom: false,
      }))
    } else {
      setLocalSettings((prev) => ({
        ...prev,
        isCustom: true,
      }))
    }
  }

  const handleSave = () => {
    try {
      const savedSettings = canvasSettingsManager.saveSettings(localSettings)
      onSettingsChange(savedSettings)
      setIsOpen(false)

      toast({
        title: "Settings Saved",
        description: "Canvas settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save canvas settings",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    const defaultSettings = canvasSettingsManager.getDefaultSettings()
    setLocalSettings(defaultSettings)
    setSelectedPreset("a4-portrait")
  }

  const updateSetting = (key: keyof CanvasSettings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateMargin = (side: keyof CanvasSettings["margins"], value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      margins: {
        ...prev.margins,
        [side]: value,
      },
    }))
  }

  const updateZoom = (key: keyof CanvasSettings["zoom"], value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      zoom: {
        ...prev.zoom,
        [key]: value,
      },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Canvas Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Canvas Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="size" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="grid">Grid & Guides</TabsTrigger>
            <TabsTrigger value="zoom">Zoom</TabsTrigger>
          </TabsList>

          <TabsContent value="size" className="space-y-4">
            <div>
              <Label htmlFor="preset-size">Preset Sizes</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRESET_CANVAS_SIZES).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{preset.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {preset.width} × {preset.height}mm
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="canvas-width">Width (mm)</Label>
                <Input
                  id="canvas-width"
                  type="number"
                  value={localSettings.width}
                  onChange={(e) => updateSetting("width", Number.parseInt(e.target.value))}
                  className="mt-1"
                  min={50}
                  max={1000}
                  disabled={selectedPreset !== "custom"}
                />
              </div>
              <div>
                <Label htmlFor="canvas-height">Height (mm)</Label>
                <Input
                  id="canvas-height"
                  type="number"
                  value={localSettings.height}
                  onChange={(e) => updateSetting("height", Number.parseInt(e.target.value))}
                  className="mt-1"
                  min={50}
                  max={1000}
                  disabled={selectedPreset !== "custom"}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="canvas-orientation">Orientation</Label>
              <Select
                value={localSettings.orientation}
                onValueChange={(value: "portrait" | "landscape") => updateSetting("orientation", value)}
                disabled={selectedPreset !== "custom"}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Margins (mm)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label htmlFor="margin-top" className="text-xs">
                    Top
                  </Label>
                  <Input
                    id="margin-top"
                    type="number"
                    value={localSettings.margins.top}
                    onChange={(e) => updateMargin("top", Number.parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>
                <div>
                  <Label htmlFor="margin-right" className="text-xs">
                    Right
                  </Label>
                  <Input
                    id="margin-right"
                    type="number"
                    value={localSettings.margins.right}
                    onChange={(e) => updateMargin("right", Number.parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>
                <div>
                  <Label htmlFor="margin-bottom" className="text-xs">
                    Bottom
                  </Label>
                  <Input
                    id="margin-bottom"
                    type="number"
                    value={localSettings.margins.bottom}
                    onChange={(e) => updateMargin("bottom", Number.parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>
                <div>
                  <Label htmlFor="margin-left" className="text-xs">
                    Left
                  </Label>
                  <Input
                    id="margin-left"
                    type="number"
                    value={localSettings.margins.left}
                    onChange={(e) => updateMargin("left", Number.parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Preview</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  Canvas: {localSettings.width} × {localSettings.height}mm
                </div>
                <div>
                  Printable Area: {localSettings.width - localSettings.margins.left - localSettings.margins.right} ×{" "}
                  {localSettings.height - localSettings.margins.top - localSettings.margins.bottom}mm
                </div>
                <div>
                  Pixels: {canvasSettingsManager.mmToPixels(localSettings.width)} ×{" "}
                  {canvasSettingsManager.mmToPixels(localSettings.height)}px
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div>
              <Label htmlFor="canvas-name">Canvas Name</Label>
              <Input
                id="canvas-name"
                value={localSettings.name}
                onChange={(e) => updateSetting("name", e.target.value)}
                className="mt-1"
                placeholder="Enter canvas name"
              />
            </div>

            <div>
              <Label htmlFor="canvas-bg-color">Background Color</Label>
              <div className="mt-1">
                <ColorPicker
                  value={localSettings.backgroundColor}
                  onChange={(color) => updateSetting("backgroundColor", color)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-rulers"
                checked={localSettings.showRulers}
                onCheckedChange={(checked) => updateSetting("showRulers", checked)}
              />
              <Label htmlFor="show-rulers" className="flex items-center">
                <Ruler className="h-4 w-4 mr-2" />
                Show Rulers
              </Label>
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Display measurement rulers along canvas edges for precise positioning
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-guides"
                checked={localSettings.showGuides}
                onCheckedChange={(checked) => updateSetting("showGuides", checked)}
              />
              <Label htmlFor="show-guides" className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Show Alignment Guides
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <div>
              <Label htmlFor="grid-size">Grid Size (px)</Label>
              <Input
                id="grid-size"
                type="number"
                value={localSettings.gridSize}
                onChange={(e) => updateSetting("gridSize", Number.parseInt(e.target.value))}
                className="mt-1"
                min={5}
                max={50}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="snap-to-grid"
                checked={localSettings.snapToGrid}
                onCheckedChange={(checked) => updateSetting("snapToGrid", checked)}
              />
              <Label htmlFor="snap-to-grid" className="flex items-center">
                <Grid className="h-4 w-4 mr-2" />
                Snap to Grid
              </Label>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">Grid Settings</div>
              <div className="text-xs text-blue-600">
                Grid spacing: {localSettings.gridSize}px ({(localSettings.gridSize / 3.7795275591).toFixed(1)}mm)
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zoom" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="zoom-min">Minimum Zoom</Label>
                <Input
                  id="zoom-min"
                  type="number"
                  value={localSettings.zoom.min}
                  onChange={(e) => updateZoom("min", Number.parseFloat(e.target.value))}
                  className="mt-1"
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>
              <div>
                <Label htmlFor="zoom-max">Maximum Zoom</Label>
                <Input
                  id="zoom-max"
                  type="number"
                  value={localSettings.zoom.max}
                  onChange={(e) => updateZoom("max", Number.parseFloat(e.target.value))}
                  className="mt-1"
                  min={1}
                  max={5}
                  step={0.25}
                />
              </div>
              <div>
                <Label htmlFor="zoom-default">Default Zoom</Label>
                <Input
                  id="zoom-default"
                  type="number"
                  value={localSettings.zoom.default}
                  onChange={(e) => updateZoom("default", Number.parseFloat(e.target.value))}
                  className="mt-1"
                  min={localSettings.zoom.min}
                  max={localSettings.zoom.max}
                  step={0.25}
                />
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">Zoom Range</div>
              <div className="text-xs text-green-600">
                {Math.round(localSettings.zoom.min * 100)}% - {Math.round(localSettings.zoom.max * 100)}% (Default:{" "}
                {Math.round(localSettings.zoom.default * 100)}%)
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Apply Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
