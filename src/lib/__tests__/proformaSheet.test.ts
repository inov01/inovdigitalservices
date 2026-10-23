import { describe, expect, it } from "vitest"
import { buildProformaSheet, type ProformaSheetData } from "../proformaSheet"

const base: ProformaSheetData = {
  pf: { docTitle: "FACTURE PROFORMA", no: "N°", validity: "Valable 15 jours", inNameOf: "AU NOM DE", date: "DATE", serviceCol: "SERVICE", priceCol: "PRIX", total: "TOTAL", deposit70: "Acompte 70 %", noticeTitle: "Avis", notReceipt: "Pas un reçu" },
  labels: { subtotal: "Sous-total", discountLabel: "Remise" },
  rtl: false, logo: "/logo.webp", proformaNo: "26-10-23-10", dateStr: "23/10/2026",
  clientLabel: "MARIE", rows: [{ label: "LOGO", sla: "Standard · 3 jours", amount: "$120" }],
  otherText: "", discount: null, totalLabel: "$120",
}

describe("buildProformaSheet", () => {
  it("renders rows, number and total without a discount block", () => {
    const html = buildProformaSheet(base)
    expect(html).toContain("26-10-23-10")
    expect(html).toContain("LOGO")
    expect(html).toContain("$120")
    expect(html).not.toContain("Remise")
  })
  it("renders the discount block when provided", () => {
    const html = buildProformaSheet({ ...base, discount: { pct: 0.1, amountLabel: "$12", subtotalLabel: "$132" } })
    expect(html).toContain("Remise -10%")
    expect(html).toContain("-$12")
    expect(html).toContain("$132")
  })
  it("escapes injected markup in row labels and other text", () => {
    const html = buildProformaSheet({ ...base, rows: [{ label: "<img onerror=x>", sla: "", amount: "" }], otherText: "<script>" })
    expect(html).not.toContain("<img onerror")
    expect(html).not.toContain("<script>")
  })
  it("sets rtl direction", () => {
    expect(buildProformaSheet({ ...base, rtl: true })).toContain('dir="rtl"')
  })
})
