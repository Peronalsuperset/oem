"use client"

import { useMemo } from "react"

interface RulerProps {
  orientation: "horizontal" | "vertical"
  length: number
  zoom: number
  mousePosition: number
  showGuides: boolean
  unit: "px" | "mm"
  className?: string
}

export function Ruler({
  orientation,
  length,
  zoom,
  mousePosition,
  showGuides,
  unit = "px",
  className = "",
}: RulerProps) {
  const isHorizontal = orientation === "horizontal"

  // Calculate ruler dimensions - ensure no NaN values
  const rulerSize = 32 // Height for horizontal, width for vertical
  const scaledLength = Math.max(0, (length || 0) * (zoom || 1))

  // Generate tick marks and labels
  const ticks = useMemo(() => {
    const ticksArray = []
    const pixelsPerUnit = unit === "mm" ? 3.7795275591 : 1 // Convert mm to pixels
    const safeLength = length || 0
    const safeZoom = zoom || 1

    // Different tick intervals based on zoom level
    let majorInterval = 100 // Major ticks every 100px
    let minorInterval = 20 // Minor ticks every 20px
    let microInterval = 10 // Micro ticks every 10px

    if (safeZoom < 0.5) {
      majorInterval = 200
      minorInterval = 100
      microInterval = 50
    } else if (safeZoom > 2) {
      majorInterval = 50
      minorInterval = 10
      microInterval = 5
    }

    // Generate ticks
    for (let i = 0; i <= safeLength; i += microInterval) {
      const position = i * safeZoom
      const isMajor = i % majorInterval === 0
      const isMinor = i % minorInterval === 0

      let tickHeight = 4 // Micro tick
      if (isMajor) {
        tickHeight = 16 // Major tick
      } else if (isMinor) {
        tickHeight = 8 // Minor tick
      }

      ticksArray.push({
        position,
        height: tickHeight,
        isMajor,
        isMinor,
        value: unit === "mm" ? Math.round(i / pixelsPerUnit) : i,
      })
    }

    return ticksArray
  }, [length, zoom, unit])

  // Mouse guide line - ensure no NaN values
  const guidePosition = Math.max(0, (mousePosition || 0) * (zoom || 1))

  // Ensure dimensions are valid numbers
  const rulerWidth = isHorizontal ? scaledLength : rulerSize
  const rulerHeight = isHorizontal ? rulerSize : scaledLength

  // Validate dimensions to prevent NaN
  if (!isFinite(rulerWidth) || !isFinite(rulerHeight) || rulerWidth <= 0 || rulerHeight <= 0) {
    return null
  }

  return (
    <div
      className={`relative bg-white border-gray-300 select-none ${
        isHorizontal ? "border-b h-8 w-full" : "border-r w-8"
      } ${className}`}
      style={{
        [isHorizontal ? "width" : "height"]: `${scaledLength}px`,
        [isHorizontal ? "height" : "width"]: `${rulerSize}px`,
      }}
    >
      {/* Ruler background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />

      {/* Tick marks and labels */}
      <svg className="absolute inset-0 overflow-visible" width={rulerWidth} height={rulerHeight}>
        {ticks.map((tick, index) => {
          const x1 = isHorizontal ? tick.position : rulerSize - tick.height
          const y1 = isHorizontal ? rulerSize - tick.height : tick.position
          const x2 = isHorizontal ? tick.position : rulerSize
          const y2 = isHorizontal ? rulerSize : tick.position

          return (
            <g key={index}>
              {/* Tick line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tick.isMajor ? "#374151" : tick.isMinor ? "#6b7280" : "#9ca3af"}
                strokeWidth={tick.isMajor ? 1.5 : 1}
              />

              {/* Labels for major ticks */}
              {tick.isMajor && tick.value > 0 && (zoom || 1) > 0.3 && (
                <text
                  x={isHorizontal ? tick.position : rulerSize - 18}
                  y={isHorizontal ? rulerSize - 18 : tick.position - 2}
                  fontSize="10"
                  fill="#374151"
                  textAnchor={isHorizontal ? "middle" : "end"}
                  dominantBaseline={isHorizontal ? "middle" : "hanging"}
                  className="pointer-events-none"
                  transform={isHorizontal ? undefined : `rotate(-90 ${rulerSize - 18} ${tick.position - 2})`}
                >
                  {tick.value}
                  {unit === "mm" ? "mm" : ""}
                </text>
              )}
            </g>
          )
        })}

        {/* Mouse guide line */}
        {showGuides && guidePosition >= 0 && guidePosition <= scaledLength && (
          <>
            <line
              x1={isHorizontal ? guidePosition : 0}
              y1={isHorizontal ? 0 : guidePosition}
              x2={isHorizontal ? guidePosition : rulerSize}
              y2={isHorizontal ? rulerSize : guidePosition}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="2,2"
            />

            {/* Position indicator */}
            <circle
              cx={isHorizontal ? guidePosition : rulerSize / 2}
              cy={isHorizontal ? rulerSize / 2 : guidePosition}
              r="3"
              fill="#ef4444"
              stroke="white"
              strokeWidth="1"
            />

            {/* Position label */}
            {(zoom || 1) > 0.5 && (
              <text
                x={isHorizontal ? guidePosition : rulerSize - 2}
                y={isHorizontal ? 12 : guidePosition - 8}
                fontSize="9"
                fill="#ef4444"
                textAnchor={isHorizontal ? "middle" : "end"}
                className="pointer-events-none font-medium"
                transform={isHorizontal ? undefined : `rotate(-90 ${rulerSize - 2} ${guidePosition - 8})`}
              >
                {Math.round(mousePosition || 0)}
                {unit === "mm" ? "mm" : "px"}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Unit indicator in corner */}
      {isHorizontal && (
        <div className="absolute top-1 right-1 text-xs text-gray-500 font-medium bg-white px-1 rounded">{unit}</div>
      )}
    </div>
  )
}
