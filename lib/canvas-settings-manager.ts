"use client"

export interface CanvasSettings {
  id: string
  name: string
  width: number // in mm
  height: number // in mm
  orientation: "portrait" | "landscape"
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  gridSize: number
  snapToGrid: boolean
  backgroundColor: string
  showRulers: boolean
  showGuides: boolean
  zoom: {
    min: number
    max: number
    default: number
  }
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

export const PRESET_CANVAS_SIZES = {
  "a4-portrait": {
    name: "A4 Portrait",
    width: 210,
    height: 297,
    orientation: "portrait" as const,
  },
  "a4-landscape": {
    name: "A4 Landscape",
    width: 297,
    height: 210,
    orientation: "landscape" as const,
  },
  "letter-portrait": {
    name: "Letter Portrait",
    width: 216,
    height: 279,
    orientation: "portrait" as const,
  },
  "letter-landscape": {
    name: "Letter Landscape",
    width: 279,
    height: 216,
    orientation: "landscape" as const,
  },
  "legal-portrait": {
    name: "Legal Portrait",
    width: 216,
    height: 356,
    orientation: "portrait" as const,
  },
  custom: {
    name: "Custom Size",
    width: 210,
    height: 297,
    orientation: "portrait" as const,
  },
}

class CanvasSettingsManager {
  private storageKey = "canvas-settings"

  // Get default canvas settings
  getDefaultSettings(): CanvasSettings {
    const now = new Date().toISOString()
    return {
      id: "default-canvas",
      name: "A4 Portrait",
      width: 210,
      height: 297,
      orientation: "portrait",
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      gridSize: 10,
      snapToGrid: true,
      backgroundColor: "#ffffff",
      showRulers: true,
      showGuides: true,
      zoom: {
        min: 0.25,
        max: 3,
        default: 1,
      },
      isCustom: false,
      createdAt: now,
      updatedAt: now,
    }
  }

  // Get current settings (alias for loadSettings)
  getSettings(): CanvasSettings {
    return this.loadSettings()
  }

  // Save canvas settings
  saveSettings(settings: Partial<CanvasSettings>): CanvasSettings {
    try {
      const currentSettings = this.loadSettings()
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(this.storageKey, JSON.stringify(updatedSettings))
      return updatedSettings
    } catch (error) {
      console.error("Error saving canvas settings:", error)
      throw new Error("Failed to save canvas settings")
    }
  }

  // Update settings (alias for saveSettings)
  updateSettings(settings: Partial<CanvasSettings>): CanvasSettings {
    return this.saveSettings(settings)
  }

  // Load canvas settings
  loadSettings(): CanvasSettings {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultSettings()
    } catch (error) {
      console.error("Error loading canvas settings:", error)
      return this.getDefaultSettings()
    }
  }

  // Apply preset size
  applyPresetSize(presetKey: keyof typeof PRESET_CANVAS_SIZES): CanvasSettings {
    const preset = PRESET_CANVAS_SIZES[presetKey]
    return this.saveSettings({
      name: preset.name,
      width: preset.width,
      height: preset.height,
      orientation: preset.orientation,
      isCustom: presetKey === "custom",
    })
  }

  // Convert mm to pixels (assuming 96 DPI)
  mmToPixels(mm: number): number {
    return Math.round(mm * 3.7795275591)
  }

  // Convert pixels to mm
  pixelsToMm(pixels: number): number {
    return Math.round(pixels / 3.7795275591)
  }

  // Get printable area (excluding margins)
  getPrintableArea(settings: CanvasSettings) {
    return {
      width: settings.width - settings.margins.left - settings.margins.right,
      height: settings.height - settings.margins.top - settings.margins.bottom,
      offsetX: settings.margins.left,
      offsetY: settings.margins.top,
    }
  }
}

export const canvasSettingsManager = new CanvasSettingsManager()
