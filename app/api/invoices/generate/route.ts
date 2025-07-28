import { type NextRequest, NextResponse } from "next/server"
import { calculateInvoice, generateInvoiceNumber } from "@/lib/invoice-calculations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderValue, commissionRate, commissionType, vendorId, templateId, vendorPAN } = body

    // Validate required fields
    if (!orderValue || !commissionRate || !vendorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate invoice amounts
    const calculationResult = calculateInvoice({
      orderValue: Number.parseFloat(orderValue),
      commissionRate: Number.parseFloat(commissionRate),
      commissionType: commissionType || "percentage",
      gstRate: 18, // Default GST rate for commission services
      tdsRate: 5, // Default TDS rate
      vendorPAN,
    })

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber()

    // In a real app, you would save this to the database
    const invoiceData = {
      invoiceNumber,
      vendorId,
      templateId,
      ...calculationResult,
      createdAt: new Date().toISOString(),
      status: "draft",
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
