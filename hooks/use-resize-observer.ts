"use client"

import { useEffect, useState, type RefObject } from "react"

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly
  target: Element
}

export function useResizeObserver(ref: RefObject<Element>) {
  const [rect, setRect] = useState<DOMRectReadOnly | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries[0]) {
        setRect(entries[0].contentRect)
      }
    })

    resizeObserver.observe(ref.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])

  return rect
}
