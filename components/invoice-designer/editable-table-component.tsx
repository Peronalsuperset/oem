"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Download,
  Upload,
  Calculator,
  Type,
  Hash,
  DollarSign,
  Percent,
  Calendar,
  List,
  MoreVertical,
  GripVertical,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface TableColumn {
  id: string
  label: string
  type: "text" | "number" | "currency" | "percentage" | "date" | "select" | "formula"
  width?: number
  required?: boolean
  options?: string[]
  prefix?: string
  suffix?: string
  decimals?: number
  formula?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    required?: boolean
  }
}

export interface TableRow {
  id: string
  data: Record<string, any>
}

export interface EditableTableProps {
  id: string
  columns: TableColumn[]
  rows: TableRow[]
  onColumnsChange: (columns: TableColumn[]) => void
  onRowsChange: (rows: TableRow[]) => void
  onDataChange?: (data: { columns: TableColumn[]; rows: TableRow[] }) => void
  className?: string
  editable?: boolean
  showControls?: boolean
}

const COLUMN_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "number", label: "Number", icon: Hash },
  { value: "currency", label: "Currency", icon: DollarSign },
  { value: "percentage", label: "Percentage", icon: Percent },
  { value: "date", label: "Date", icon: Calendar },
  { value: "select", label: "Select", icon: List },
  { value: "formula", label: "Formula", icon: Calculator },
]

export function EditableTableComponent({
  id,
  columns,
  rows,
  onColumnsChange,
  onRowsChange,
  onDataChange,
  className = "",
  editable = true,
  showControls = true,
}: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Add new column
  const addColumn = useCallback(() => {
    const newColumn: TableColumn = {
      id: generateId(),
      label: `Column ${columns.length + 1}`,
      type: "text",
      width: 120,
      required: false,
    }
    const updatedColumns = [...columns, newColumn]
    onColumnsChange(updatedColumns)
    onDataChange?.({ columns: updatedColumns, rows })
  }, [columns, rows, onColumnsChange, onDataChange])

  // Remove column
  const removeColumn = useCallback(
    (columnId: string) => {
      const updatedColumns = columns.filter((col) => col.id !== columnId)
      const updatedRows = rows.map((row) => ({
        ...row,
        data: Object.fromEntries(Object.entries(row.data).filter(([key]) => key !== columnId)),
      }))
      onColumnsChange(updatedColumns)
      onRowsChange(updatedRows)
      onDataChange?.({ columns: updatedColumns, rows: updatedRows })
    },
    [columns, rows, onColumnsChange, onRowsChange, onDataChange],
  )

  // Update column
  const updateColumn = useCallback(
    (columnId: string, updates: Partial<TableColumn>) => {
      const updatedColumns = columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col))
      onColumnsChange(updatedColumns)
      onDataChange?.({ columns: updatedColumns, rows })
    },
    [columns, rows, onColumnsChange, onDataChange],
  )

  // Add new row
  const addRow = useCallback(() => {
    const newRow: TableRow = {
      id: generateId(),
      data: columns.reduce(
        (acc, col) => {
          acc[col.id] = col.type === "number" || col.type === "currency" || col.type === "percentage" ? 0 : ""
          return acc
        },
        {} as Record<string, any>,
      ),
    }
    const updatedRows = [...rows, newRow]
    onRowsChange(updatedRows)
    onDataChange?.({ columns, rows: updatedRows })
  }, [columns, rows, onRowsChange, onDataChange])

  // Remove selected rows
  const removeSelectedRows = useCallback(() => {
    const updatedRows = rows.filter((row) => !selectedRows.has(row.id))
    onRowsChange(updatedRows)
    setSelectedRows(new Set())
    onDataChange?.({ columns, rows: updatedRows })
  }, [rows, selectedRows, onRowsChange, onDataChange])

  // Update cell value
  const updateCellValue = useCallback(
    (rowId: string, columnId: string, value: any) => {
      const column = columns.find((col) => col.id === columnId)
      if (!column) return

      // Process value based on column type
      let processedValue = value
      if (column.type === "number" || column.type === "currency" || column.type === "percentage") {
        processedValue = Number.parseFloat(value) || 0
      }

      // Handle formula columns
      if (column.type === "formula" && column.formula) {
        try {
          // Simple formula evaluation (extend as needed)
          const row = rows.find((r) => r.id === rowId)
          if (row) {
            processedValue = evaluateFormula(column.formula, row.data, columns)
          }
        } catch (error) {
          console.error("Formula evaluation error:", error)
          processedValue = "Error"
        }
      }

      const updatedRows = rows.map((row) =>
        row.id === rowId ? { ...row, data: { ...row.data, [columnId]: processedValue } } : row,
      )
      onRowsChange(updatedRows)
      onDataChange?.({ columns, rows: updatedRows })
    },
    [rows, columns, onRowsChange, onDataChange],
  )

  // Simple formula evaluator
  const evaluateFormula = (formula: string, rowData: Record<string, any>, columns: TableColumn[]) => {
    // Replace column references with actual values
    let processedFormula = formula
    columns.forEach((col) => {
      const value = rowData[col.id] || 0
      processedFormula = processedFormula.replace(new RegExp(`\\b${col.label}\\b`, "g"), value.toString())
    })

    // Basic math evaluation (extend for more complex formulas)
    try {
      // Simple SUM function
      if (processedFormula.includes("SUM(")) {
        const sumMatch = processedFormula.match(/SUM$$([^)]+)$$/)
        if (sumMatch) {
          const values = sumMatch[1].split(",").map((v) => Number.parseFloat(v.trim()) || 0)
          const sum = values.reduce((a, b) => a + b, 0)
          processedFormula = processedFormula.replace(sumMatch[0], sum.toString())
        }
      }

      // Evaluate basic arithmetic
      return Function(`"use strict"; return (${processedFormula})`)()
    } catch {
      return "Error"
    }
  }

  // Format cell value for display
  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) return ""

    switch (column.type) {
      case "currency":
        return `${column.prefix || "$"}${Number.parseFloat(value).toFixed(column.decimals || 2)}${column.suffix || ""}`
      case "percentage":
        return `${Number.parseFloat(value).toFixed(column.decimals || 1)}%`
      case "number":
        return Number.parseFloat(value).toFixed(column.decimals || 0)
      default:
        return value.toString()
    }
  }

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = columns.map((col) => col.label).join(",")
    const csvRows = rows.map((row) =>
      columns
        .map((col) => {
          const value = row.data[col.id] || ""
          return `"${value.toString().replace(/"/g, '""')}"`
        })
        .join(","),
    )

    const csvContent = [headers, ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `table-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [columns, rows, id])

  // Import from CSV
  const importFromCSV = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target?.result as string
        const lines = csv.split("\n").filter((line) => line.trim())

        if (lines.length === 0) return

        // Parse headers
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

        // Create columns
        const newColumns: TableColumn[] = headers.map((header, index) => ({
          id: generateId(),
          label: header || `Column ${index + 1}`,
          type: "text",
          width: 120,
        }))

        // Parse rows
        const newRows: TableRow[] = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.replace(/"/g, "").trim())
          return {
            id: generateId(),
            data: newColumns.reduce(
              (acc, col, index) => {
                acc[col.id] = values[index] || ""
                return acc
              },
              {} as Record<string, any>,
            ),
          }
        })

        onColumnsChange(newColumns)
        onRowsChange(newRows)
        onDataChange?.({ columns: newColumns, rows: newRows })
      }
      reader.readAsText(file)
    },
    [onColumnsChange, onRowsChange, onDataChange],
  )

  return (
    <Card className={`w-full ${className}`}>
      {showControls && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Editable Table</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addColumn} disabled={!editable}>
                <Plus className="h-4 w-4 mr-1" />
                Column
              </Button>
              <Button variant="outline" size="sm" onClick={addRow} disabled={!editable}>
                <Plus className="h-4 w-4 mr-1" />
                Row
              </Button>
              {selectedRows.size > 0 && (
                <Button variant="outline" size="sm" onClick={removeSelectedRows} disabled={!editable}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedRows.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!editable}>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="editable-table">
            <thead>
              <tr>
                {editable && (
                  <th className="w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === rows.length && rows.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(rows.map((row) => row.id)))
                        } else {
                          setSelectedRows(new Set())
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.id} style={{ width: column.width }} className="group relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {editable && <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />}
                        {editable ? (
                          <Input
                            value={column.label}
                            onChange={(e) => updateColumn(column.id, { label: e.target.value })}
                            className="border-0 p-0 h-auto bg-transparent font-medium"
                          />
                        ) : (
                          <span>{column.label}</span>
                        )}
                        {column.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      {editable && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="p-2">
                              <label className="text-xs font-medium">Type</label>
                              <Select
                                value={column.type}
                                onValueChange={(value) => updateColumn(column.id, { type: value as any })}
                              >
                                <SelectTrigger className="h-8 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COLUMN_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <type.icon className="h-3 w-3" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <DropdownMenuItem onClick={() => removeColumn(column.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {editable && (
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRows)
                          if (e.target.checked) {
                            newSelected.add(row.id)
                          } else {
                            newSelected.delete(row.id)
                          }
                          setSelectedRows(newSelected)
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.id}`}>
                      {editable && editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                        column.type === "select" ? (
                          <Select
                            value={row.data[column.id] || ""}
                            onValueChange={(value) => {
                              updateCellValue(row.id, column.id, value)
                              setEditingCell(null)
                            }}
                          >
                            <SelectTrigger className="cell-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {column.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={
                              column.type === "date"
                                ? "date"
                                : column.type === "number" || column.type === "currency" || column.type === "percentage"
                                  ? "number"
                                  : "text"
                            }
                            value={row.data[column.id] || ""}
                            onChange={(e) => updateCellValue(row.id, column.id, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setEditingCell(null)
                              }
                            }}
                            className="cell-input"
                            autoFocus
                          />
                        )
                      ) : (
                        <div
                          className="cell-input cursor-pointer hover:bg-gray-50"
                          onClick={() => editable && setEditingCell({ rowId: row.id, columnId: column.id })}
                        >
                          {formatCellValue(row.data[column.id], column)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
            {editable && (
              <Button variant="outline" size="sm" onClick={addRow} className="mt-2 bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Add First Row
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
