"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const sampleRules = [
  { id: 1, vendor: "ABC Electronics", type: "percentage", value: "5%", minOrder: "₹10,000", status: "Active" },
  { id: 2, vendor: "XYZ Components", type: "fixed", value: "₹500", minOrder: "₹5,000", status: "Active" },
  { id: 3, vendor: "Tech Solutions", type: "tiered", value: "3-7%", minOrder: "₹15,000", status: "Inactive" },
]

export default function CommissionManagement() {
  const [rules, setRules] = useState(sampleRules)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const [formData, setFormData] = useState({
    vendor: "",
    type: "percentage",
    value: "",
    minOrder: "",
    maxOrder: "",
    description: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add or update rule logic
    console.log("Saving rule:", formData)
    setIsDialogOpen(false)
    setFormData({
      vendor: "",
      type: "percentage",
      value: "",
      minOrder: "",
      maxOrder: "",
      description: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingRule ? "Edit Commission Rule" : "Add Commission Rule"}</DialogTitle>
                  <DialogDescription>
                    Set up commission rules for vendors based on order values and performance.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Select
                        value={formData.vendor}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, vendor: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abc-electronics">ABC Electronics</SelectItem>
                          <SelectItem value="xyz-components">XYZ Components</SelectItem>
                          <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Commission Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
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

                    <div className="grid gap-2">
                      <Label htmlFor="value">
                        {formData.type === "percentage"
                          ? "Percentage (%)"
                          : formData.type === "fixed"
                            ? "Fixed Amount (₹)"
                            : "Tier Structure"}
                      </Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                        placeholder={
                          formData.type === "percentage"
                            ? "5"
                            : formData.type === "fixed"
                              ? "500"
                              : "3% up to 10K, 5% above"
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="minOrder">Min Order (₹)</Label>
                        <Input
                          id="minOrder"
                          value={formData.minOrder}
                          onChange={(e) => setFormData((prev) => ({ ...prev, minOrder: e.target.value }))}
                          placeholder="10000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxOrder">Max Order (₹)</Label>
                        <Input
                          id="maxOrder"
                          value={formData.maxOrder}
                          onChange={(e) => setFormData((prev) => ({ ...prev, maxOrder: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingRule ? "Update Rule" : "Create Rule"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Manage commission structures for different vendors and order values</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.vendor}</TableCell>
                      <TableCell>
                        <span className="capitalize">{rule.type}</span>
                      </TableCell>
                      <TableCell>{rule.value}</TableCell>
                      <TableCell>{rule.minOrder}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            rule.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {rule.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
