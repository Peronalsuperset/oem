"use client"

interface RulerProps {
  orientation: "horizontal" | "vertical"
  length: number
  zoom: number
  mousePosition: number
  showGuides: boolean
  unit: "px" | "mm"
}

export function Ruler({ orientation, length, zoom, mousePosition, showGuides, unit }: RulerProps) {
  const isHorizontal = orientation === "horizontal"
  const rulerSize = 32
  const tickInterval = unit === "px" ? 50 : 10 // 50px or 10mm intervals
  const minorTickInterval = unit === "px" ? 10 : 2 // 10px or 2mm intervals

  const ticks = []
  const labels = []

  // Generate major ticks and labels
  for (let i = 0; i <= length; i += tickInterval) {
    const position = i * zoom
    const value = unit === "px" ? i : Math.round(i / 3.78) // Convert px to mm approximately

    if (isHorizontal) {
      ticks.push(
        <line
          key={`major-${i}`}
          x1={position}
          y1={rulerSize - 8}
          x2={position}
          y2={rulerSize}
          stroke="#666"
          strokeWidth={1}
        />,
      )
      labels.push(
        <text key={`label-${i}`} x={position + 2} y={rulerSize - 12} fontSize="10" fill="#666" textAnchor="start">
          {value}
        </text>,
      )
    } else {
      ticks.push(
        <line
          key={`major-${i}`}
          x1={rulerSize - 8}
          y1={position}
          x2={rulerSize}
          y2={position}
          stroke="#666"
          strokeWidth={1}
        />,
      )
      labels.push(
        <text
          key={`label-${i}`}
          x={rulerSize - 12}
          y={position + 2}
          fontSize="10"
          fill="#666"
          textAnchor="end"
          transform={`rotate(-90, ${rulerSize - 12}, ${position + 2})`}
        >
          {value}
        </text>,
      )
    }
  }

  // Generate minor ticks
  for (let i = 0; i <= length; i += minorTickInterval) {
    if (i % tickInterval !== 0) {
      const position = i * zoom

      if (isHorizontal) {
        ticks.push(
          <line
            key={`minor-${i}`}
            x1={position}
            y1={rulerSize - 4}
            x2={position}
            y2={rulerSize}
            stroke="#999"
            strokeWidth={0.5}
          />,
        )
      } else {
        ticks.push(
          <line
            key={`minor-${i}`}
            x1={rulerSize - 4}
            y1={position}
            x2={rulerSize}
            y2={position}
            stroke="#999"
            strokeWidth={0.5}
          />,
        )
      }
    }
  }

  // Mouse position guide
  const mouseGuide = showGuides && mousePosition >= 0 && (
    <>
      {isHorizontal ? (
        <line
          x1={mousePosition * zoom}
          y1={0}
          x2={mousePosition * zoom}
          y2={rulerSize}
          stroke="#ff0000"
          strokeWidth={1}
          strokeDasharray="2,2"
        />
      ) : (
        <line
          x1={0}
          y1={mousePosition * zoom}
          x2={rulerSize}
          y2={mousePosition * zoom}
          stroke="#ff0000"
          strokeWidth={1}
          strokeDasharray="2,2"
        />
      )}
    </>
  )

  return (
    <div
      className="bg-gray-50 border-r border-b select-none"
      style={{
        width: isHorizontal ? length * zoom : rulerSize,
        height: isHorizontal ? rulerSize : length * zoom,
      }}
    >
      <svg
        width={isHorizontal ? length * zoom : rulerSize}
        height={isHorizontal ? rulerSize : length * zoom}
        className="overflow-visible"
      >
        <rect width="100%" height="100%" fill="#f9fafb" stroke="#e5e7eb" strokeWidth={0.5} />
        {ticks}
        {labels}
        {mouseGuide}
      </svg>
    </div>
  )
}
