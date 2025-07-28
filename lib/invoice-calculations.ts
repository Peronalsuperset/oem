export interface InvoiceData {
  orderValue: number
  commissionRate: number
  commissionType: "percentage" | "fixed" | "tiered"
  gstRate: number
  tdsRate: number
  vendorPAN?: string
}

export interface CalculationResult {
  orderTotal: number
  commissionAmount: number
  gstAmount: number
  tdsAmount: number
  finalPayout: number
  breakdown: {
    baseCommission: number
    gstOnCommission: number
    tdsDeduction: number
  }
}

export function calculateInvoice(data: InvoiceData): CalculationResult {
  const { orderValue, commissionRate, commissionType, gstRate, tdsRate, vendorPAN } = data

  // Calculate base commission
  let baseCommission = 0
  switch (commissionType) {
    case "percentage":
      baseCommission = (orderValue * commissionRate) / 100
      break
    case "fixed":
      baseCommission = commissionRate
      break
    case "tiered":
      // Simplified tiered calculation - in real app, this would be more complex
      if (orderValue <= 10000) {
        baseCommission = (orderValue * 3) / 100
      } else if (orderValue <= 50000) {
        baseCommission = (orderValue * 5) / 100
      } else {
        baseCommission = (orderValue * 7) / 100
      }
      break
  }

  // Calculate GST on commission
  const gstAmount = (baseCommission * gstRate) / 100

  // Calculate TDS (only if vendor has PAN)
  const tdsAmount = vendorPAN ? (baseCommission * tdsRate) / 100 : 0

  // Calculate final payout
  const finalPayout = orderValue - baseCommission - gstAmount + tdsAmount

  return {
    orderTotal: orderValue,
    commissionAmount: baseCommission,
    gstAmount,
    tdsAmount,
    finalPayout,
    breakdown: {
      baseCommission,
      gstOnCommission: gstAmount,
      tdsDeduction: tdsAmount,
    },
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function generateInvoiceNumber(prefix = "INV"): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")

  return `${prefix}-${year}${month}-${random}`
}
