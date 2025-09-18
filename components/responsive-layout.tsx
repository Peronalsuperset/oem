"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  viewMode: "mobile" | "tablet" | "desktop"
  setViewMode: (mode: "mobile" | "tablet" | "desktop") => void
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined)

export function ResponsiveProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [viewMode, setViewMode] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const mobile = width < 768
      const tablet = width >= 768 && width < 1024
      const desktop = width >= 1024

      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsDesktop(desktop)

      // Auto-set view mode based on screen size
      if (mobile) setViewMode("mobile")
      else if (tablet) setViewMode("tablet")
      else setViewMode("desktop")
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return (
    <ResponsiveContext.Provider
      value={{
        isMobile,
        isTablet,
        isDesktop,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  )
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
  maxWidth = "full",
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
  const { viewMode } = useResponsive()

  const getGridCols = () => {
    switch (viewMode) {
      case "mobile":
        return `grid-cols-${cols.mobile || 1}`
      case "tablet":
        return `grid-cols-${cols.tablet || 2}`
      case "desktop":
        return `grid-cols-${cols.desktop || 3}`
      default:
        return "grid-cols-1"
    }
  }

  return <div className={cn("grid", getGridCols(), `gap-${gap}`, className)}>{children}</div>
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
  const { viewMode } = useResponsive()

  const getFlexDirection = () => {
    switch (viewMode) {
      case "mobile":
        return direction.mobile === "row" ? "flex-row" : "flex-col"
      case "tablet":
        return direction.tablet === "row" ? "flex-row" : "flex-col"
      case "desktop":
        return direction.desktop === "row" ? "flex-row" : "flex-col"
      default:
        return "flex-col"
    }
  }

  const getSpacing = () => {
    const flexDirection = getFlexDirection()
    return flexDirection === "flex-row" ? `space-x-${spacing}` : `space-y-${spacing}`
  }

  return <div className={cn("flex", getFlexDirection(), getSpacing(), className)}>{children}</div>
}
