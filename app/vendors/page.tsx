"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Download, Eye } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/invoice-calculations"

const sampleInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    orderValue: 50000,
    commission: 2500,
    gst: 450,
    tds: 125,
    finalPayout: 47825,
    status: "paid",
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    date: "2024-01-20",
    orderValue: 75000,
    commission: 3750,
    gst: 675,
    tds: 187.5,
    finalPayout: 71237.5,
    status: "pending",
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    date: "2024-01-25",
    orderValue: 30000,
    commission: 1500,
    gst: 270,
    tds: 75,
    finalPayout: 28695,
    status: "overdue",
  },
]

export default function VendorPortal() {
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices] = useState(sampleInvoices)

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCommission = invoices.reduce((sum, inv) => sum + inv.commission, 0)
  const totalPayout = invoices.reduce((sum, inv) => sum + inv.finalPayout, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.finalPayout, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                <p className="text-xs text-muted-foreground">Across all invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Payout Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPayout)}</div>
                <p className="text-xs text-muted-foreground">After GST & TDS</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Commission Invoices</CardTitle>
                  <CardDescription>Track your commission payments and invoice history</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Order Value</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>TDS</TableHead>
                    <TableHead>Final Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{formatCurrency(invoice.orderValue)}</TableCell>
                      <TableCell>{formatCurrency(invoice.commission)}</TableCell>
                      <TableCell>{formatCurrency(invoice.gst)}</TableCell>
                      <TableCell>{formatCurrency(invoice.tds)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.finalPayout)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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
