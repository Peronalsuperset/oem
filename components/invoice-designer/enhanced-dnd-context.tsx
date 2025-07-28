"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface DragState {
  isDragging: boolean
  draggedItem: any | null
  dragOffset: { x: number; y: number } | null
  dropZones: string[]
  validDropZone: string | null
  dragPreview: React.ReactNode | null
  snapGuides: {
    vertical: number[]
    horizontal: number[]
    active: { x?: number; y?: number }
  }
  collision: {
    detected: boolean
    components: string[]
  }
}

interface DndContextType extends DragState {
  startDrag: (item: any, offset: { x: number; y: number }) => void
  updateDrag: (position: { x: number; y: number }) => void
  endDrag: (dropResult?: any) => void
  setDropZones: (zones: string[]) => void
  setValidDropZone: (zone: string | null) => void
  addSnapGuide: (type: "vertical" | "horizontal", position: number) => void
  removeSnapGuide: (type: "vertical" | "horizontal", position: number) => void
  clearSnapGuides: () => void
  setCollision: (detected: boolean, components?: string[]) => void
  setDragPreview: (preview: React.ReactNode) => void
}

const DndContext = createContext<DndContextType | null>(null)

const initialState: DragState = {
  isDragging: false,
  draggedItem: null,
  dragOffset: null,
  dropZones: [],
  validDropZone: null,
  dragPreview: null,
  snapGuides: {
    vertical: [],
    horizontal: [],
    active: {},
  },
  collision: {
    detected: false,
    components: [],
  },
}

function dndReducer(state: DragState, action: any): DragState {
  switch (action.type) {
    case "START_DRAG":
      return {
        ...state,
        isDragging: true,
        draggedItem: action.payload.item,
        dragOffset: action.payload.offset,
        collision: { detected: false, components: [] },
      }

    case "UPDATE_DRAG":
      return {
        ...state,
        dragOffset: action.payload.position,
      }

    case "END_DRAG":
      return {
        ...state,
        isDragging: false,
        draggedItem: null,
        dragOffset: null,
        dragPreview: null,
        snapGuides: { ...state.snapGuides, active: {} },
        collision: { detected: false, components: [] },
      }

    case "SET_DROP_ZONES":
      return {
        ...state,
        dropZones: action.payload,
      }

    case "SET_VALID_DROP_ZONE":
      return {
        ...state,
        validDropZone: action.payload,
      }

    case "SET_DRAG_PREVIEW":
      return {
        ...state,
        dragPreview: action.payload,
      }

    case "ADD_SNAP_GUIDE":
      const { type, position } = action.payload
      const guides = type === "vertical" ? state.snapGuides.vertical : state.snapGuides.horizontal
      return {
        ...state,
        snapGuides: {
          ...state.snapGuides,
          [type]: [...guides, position].sort((a, b) => a - b),
        },
      }

    case "REMOVE_SNAP_GUIDE":
      const removeType = action.payload.type
      const removePosition = action.payload.position
      const removeGuides = removeType === "vertical" ? state.snapGuides.vertical : state.snapGuides.horizontal
      return {
        ...state,
        snapGuides: {
          ...state.snapGuides,
          [removeType]: removeGuides.filter((p) => p !== removePosition),
        },
      }

    case "CLEAR_SNAP_GUIDES":
      return {
        ...state,
        snapGuides: {
          vertical: [],
          horizontal: [],
          active: {},
        },
      }

    case "SET_ACTIVE_SNAP_GUIDES":
      return {
        ...state,
        snapGuides: {
          ...state.snapGuides,
          active: action.payload,
        },
      }

    case "SET_COLLISION":
      return {
        ...state,
        collision: {
          detected: action.payload.detected,
          components: action.payload.components || [],
        },
      }

    default:
      return state
  }
}

export function EnhancedDndProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dndReducer, initialState)
  const { toast } = useToast()
  const animationFrameRef = useRef<number>()

  const startDrag = useCallback((item: any, offset: { x: number; y: number }) => {
    dispatch({ type: "START_DRAG", payload: { item, offset } })
  }, [])

  const updateDrag = useCallback((position: { x: number; y: number }) => {
    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      dispatch({ type: "UPDATE_DRAG", payload: { position } })
    })
  }, [])

  const endDrag = useCallback((dropResult?: any) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    dispatch({ type: "END_DRAG", payload: dropResult })
  }, [])

  const setDropZones = useCallback((zones: string[]) => {
    dispatch({ type: "SET_DROP_ZONES", payload: zones })
  }, [])

  const setValidDropZone = useCallback((zone: string | null) => {
    dispatch({ type: "SET_VALID_DROP_ZONE", payload: zone })
  }, [])

  const setDragPreview = useCallback((preview: React.ReactNode) => {
    dispatch({ type: "SET_DRAG_PREVIEW", payload: preview })
  }, [])

  const addSnapGuide = useCallback((type: "vertical" | "horizontal", position: number) => {
    dispatch({ type: "ADD_SNAP_GUIDE", payload: { type, position } })
  }, [])

  const removeSnapGuide = useCallback((type: "vertical" | "horizontal", position: number) => {
    dispatch({ type: "REMOVE_SNAP_GUIDE", payload: { type, position } })
  }, [])

  const clearSnapGuides = useCallback(() => {
    dispatch({ type: "CLEAR_SNAP_GUIDES" })
  }, [])

  const setCollision = useCallback(
    (detected: boolean, components: string[] = []) => {
      dispatch({ type: "SET_COLLISION", payload: { detected, components } })

      if (detected && components.length > 0) {
        toast({
          title: "Collision Detected",
          description: `Component overlaps with ${components.length} other element(s)`,
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const value: DndContextType = {
    ...state,
    startDrag,
    updateDrag,
    endDrag,
    setDropZones,
    setValidDropZone,
    setDragPreview,
    addSnapGuide,
    removeSnapGuide,
    clearSnapGuides,
    setCollision,
  }

  return <DndContext.Provider value={value}>{children}</DndContext.Provider>
}

export function useEnhancedDnd() {
  const context = useContext(DndContext)
  if (!context) {
    throw new Error("useEnhancedDnd must be used within an EnhancedDndProvider")
  }
  return context
}
