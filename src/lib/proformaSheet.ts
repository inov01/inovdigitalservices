export type ProformaRow = { label: string; sla: string; amount: string }

export type ProformaSheetData = {
  pf: Record<string, string>
  labels: { subtotal: string; discountLabel: string }
  rtl: boolean
  logo: string
  proformaNo: string
  dateStr: string
  clientLabel: string
  rows: ProformaRow[]
  otherText: string
  discount: { pct: number; amountLabel: string; subtotalLabel: string } | null
  totalLabel: string
}

export const escHtml = (v: string) => v.replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
))

/** Pure builder of the proforma sheet markup shown on the site and rendered to PNG. */
export function buildProformaSheet(d: ProformaSheetData): string {
  const { pf, rtl, logo, proformaNo, dateStr, clientLabel, discount, totalLabel, otherText } = d
  const rows = d.rows.map((r) => `
        <tr>
          <td style="padding:13px 18px;border:1.5px solid #111;font-weight:700;font-size:13px;letter-spacing:0.01em;">${escHtml(r.label)}<div style="margin-top:4px;font-weight:600;font-size:10.5px;color:var(--ds-accent);letter-spacing:0.01em;">${escHtml(r.sla)}</div></td>
          <td style="padding:13px 18px;border:1.5px solid #111;text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${escHtml(r.amount)}</td>
        </tr>`).join("")
  const otherRow = otherText
    ? `<tr>
          <td style="padding:13px 18px;border:1.5px solid #111;font-weight:700;font-size:13px;">${escHtml(otherText.toUpperCase())}</td>
          <td style="padding:13px 18px;border:1.5px solid #111;text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">—</td>
        </tr>`
    : ""
  return `
      <div dir="${rtl ? "rtl" : "ltr"}" style="position:relative;font-family:'Outfit',sans-serif;width:780px;margin:0 auto;padding:48px 44px;background:#fff;color:#111;overflow:hidden;">
        <!-- Watermark -->
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;">
          <img src="${logo}" alt="" style="width:560px;height:auto;object-fit:contain;transform:rotate(-45deg);opacity:0.05;" />
        </div>

        <div style="position:relative;">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">
            <div style="height:64px;flex-shrink:0;display:flex;align-items:center;">
              <img src="${logo}" alt="INOV" style="height:64px;width:auto;object-fit:contain;display:block;" />
            </div>
            <div style="text-align:right;">
              <h1 style="font-size:38px;font-weight:900;color:#111;margin:0;letter-spacing:-0.01em;">${pf.docTitle}</h1>
              <div style="margin-top:6px;font-size:14px;">
                <span style="font-weight:800;color:#111;">${pf.no} ${proformaNo}</span>
                <span style="font-weight:800;color:var(--ds-accent);margin-left:16px;">${pf.validity}</span>
              </div>
            </div>
          </div>

          <!-- Info boxes -->
          <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:36px;">
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">${pf.inNameOf}</td>
                <td style="padding:14px 20px;border:1.5px solid #111;font-weight:700;font-size:13px;">${clientLabel}</td>
              </tr>
            </table>
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">${pf.date}</td>
                <td style="padding:14px 28px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:center;">${dateStr}</td>
              </tr>
            </table>
          </div>

          <!-- Services table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:40px;">
            <thead>
              <tr style="background:#111;color:#fff;">
                <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;">${pf.serviceCol}</th>
                <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;width:130px;">${pf.priceCol}</th>
              </tr>
            </thead>
            <tbody>${rows}${otherRow}</tbody>
          </table>

          <!-- Footer -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-size:14px;line-height:2;">
              <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>@inov_digital_services</div>
              <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>(+509) 3625-5920</div>
            </div>
            <div style="text-align:right;">
              <table style="border-collapse:collapse;">
                ${discount ? `
                <tr>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">${d.labels.subtotal}</td>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${discount?.subtotalLabel ?? ""}</td>
                </tr>
                <tr>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;color:var(--ds-accent-text);">${d.labels.discountLabel} -${Math.round(discount!.pct * 100)}%</td>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;color:var(--ds-accent-text);">-${discount!.amountLabel}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">${pf.total}</td>
                  <td style="padding:13px 22px;border:1.5px solid #111;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${totalLabel}</td>
                </tr>
              </table>
              <div style="margin-top:10px;font-weight:800;font-size:15px;color:var(--ds-accent-text);">${pf.deposit70}</div>
              <div style="margin-top:18px;padding:12px 16px;border:1.5px dashed #111;background:#fafafa;font-size:11.5px;line-height:1.6;color:#333;">
                <strong style="display:block;font-size:12px;color:#111;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.03em;">${pf.noticeTitle}</strong>
                ${pf.notReceipt}
              </div>
            </div>
          </div>
        </div>
      </div>`
}
