"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type DeviceType = "mobile" | "tablet" | "desktop"
type ViewMode = "auto" | "mobile" | "tablet" | "desktop"

interface ResponsiveContextType {
  deviceType: DeviceType
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined)

export function ResponsiveProvider({ children }: { children: ReactNode }) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop")
  const [viewMode, setViewMode] = useState<ViewMode>("auto")
  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setScreenWidth(width)
      setScreenHeight(height)

      if (width < 768) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }

    updateDeviceType()
    window.addEventListener("resize", updateDeviceType)
    return () => window.removeEventListener("resize", updateDeviceType)
  }, [])

  const currentDeviceType = viewMode === "auto" ? deviceType : (viewMode as DeviceType)

  const value: ResponsiveContextType = {
    deviceType: currentDeviceType,
    viewMode,
    setViewMode,
    isMobile: currentDeviceType === "mobile",
    isTablet: currentDeviceType === "tablet",
    isDesktop: currentDeviceType === "desktop",
    screenWidth,
    screenHeight,
  }

  return <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>
}

export function useResponsive() {
  const context = useContext(ResponsiveContext)
  if (context === undefined) {
    throw new Error("useResponsive must be used within a ResponsiveProvider")
  }
  return context
}

interface ResponsiveContainerProps {
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
  padding?: boolean
  className?: string
}

export function ResponsiveContainer({
  children,
  maxWidth = "7xl",
  padding = true,
  className,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }

  return (
    <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth], padding && "px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useResponsive()

  const currentCols = isMobile ? cols.mobile : isTablet ? cols.tablet : cols.desktop

  return <div className={cn("grid", `grid-cols-${currentCols}`, `gap-${gap}`, className)}>{children}</div>
}

interface ResponsiveStackProps {
  children: ReactNode
  direction?: {
    mobile?: "row" | "col"
    tablet?: "row" | "col"
    desktop?: "row" | "col"
  }
  spacing?: number
  className?: string
}

export function ResponsiveStack({
  children,
  direction = { mobile: "col", tablet: "row", desktop: "row" },
  spacing = 4,
  className,
}: ResponsiveStackProps) {
  const { isMobile, isTablet } = useResponsive()

  const currentDirection = isMobile ? direction.mobile : isTablet ? direction.tablet : direction.desktop

  return (
    <div
      className={cn(
        "flex",
        currentDirection === "row" ? "flex-row" : "flex-col",
        currentDirection === "row" ? `space-x-${spacing}` : `space-y-${spacing}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
