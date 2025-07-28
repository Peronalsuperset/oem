"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function PropertiesPanel({ selectedComponent, onUpdateComponent }) {
  if (!selectedComponent) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Select a component to edit its properties</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProperties = () => {
    switch (selectedComponent.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={selectedComponent.properties.content}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, content: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={selectedComponent.properties.fontSize}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, fontSize: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={selectedComponent.properties.color}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, color: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )

      case "commission":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="rate">Commission Rate</Label>
              <Input
                id="rate"
                type="number"
                value={selectedComponent.properties.rate}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, rate: Number.parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="type">Commission Type</Label>
              <Select
                value={selectedComponent.properties.type}
                onValueChange={(value) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, type: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "gst":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                type="number"
                value={selectedComponent.properties.rate}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, rate: Number.parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="hsn">HSN/SAC Code</Label>
              <Input
                id="hsn"
                value={selectedComponent.properties.hsn}
                onChange={(e) =>
                  onUpdateComponent({
                    properties: { ...selectedComponent.properties, hsn: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={selectedComponent.properties.content || ""}
              onChange={(e) =>
                onUpdateComponent({
                  properties: { ...selectedComponent.properties, content: e.target.value },
                })
              }
            />
          </div>
        )
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>{selectedComponent.label} Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderProperties()}

          {/* Common properties */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Position & Size</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="x">X</Label>
                <Input
                  id="x"
                  type="number"
                  value={selectedComponent.x}
                  onChange={(e) => onUpdateComponent({ x: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="y">Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={selectedComponent.y}
                  onChange={(e) => onUpdateComponent({ y: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedComponent.width}
                  onChange={(e) => onUpdateComponent({ width: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedComponent.height}
                  onChange={(e) => onUpdateComponent({ height: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
