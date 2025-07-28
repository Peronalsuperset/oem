"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface DndState {
  draggedItem: any | null
  dropZones: string[]
  isValidDrop: boolean
  error: string | null
  loading: boolean
}

interface DndContextType extends DndState {
  setDraggedItem: (item: any) => void
  setDropZones: (zones: string[]) => void
  setValidDrop: (valid: boolean) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

const DndContext = createContext<DndContextType | null>(null)

const initialState: DndState = {
  draggedItem: null,
  dropZones: [],
  isValidDrop: false,
  error: null,
  loading: false,
}

function dndReducer(state: DndState, action: any): DndState {
  switch (action.type) {
    case "SET_DRAGGED_ITEM":
      return { ...state, draggedItem: action.payload }
    case "SET_DROP_ZONES":
      return { ...state, dropZones: action.payload }
    case "SET_VALID_DROP":
      return { ...state, isValidDrop: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

export function DndProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dndReducer, initialState)
  const { toast } = useToast()

  const setDraggedItem = useCallback((item: any) => {
    dispatch({ type: "SET_DRAGGED_ITEM", payload: item })
  }, [])

  const setDropZones = useCallback((zones: string[]) => {
    dispatch({ type: "SET_DROP_ZONES", payload: zones })
  }, [])

  const setValidDrop = useCallback((valid: boolean) => {
    dispatch({ type: "SET_VALID_DROP", payload: valid })
  }, [])

  const setError = useCallback(
    (error: string | null) => {
      dispatch({ type: "SET_ERROR", payload: error })
      if (error) {
        toast({
          title: "Design Error",
          description: error,
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  const value: DndContextType = {
    ...state,
    setDraggedItem,
    setDropZones,
    setValidDrop,
    setError,
    setLoading,
    clearError,
  }

  return <DndContext.Provider value={value}>{children}</DndContext.Provider>
}

export function useDndContext() {
  const context = useContext(DndContext)
  if (!context) {
    throw new Error("useDndContext must be used within a DndProvider")
  }
  return context
}
