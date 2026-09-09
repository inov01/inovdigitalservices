// Renders branded HTML "pages" to a multi-page PDF and triggers an immediate
// download — no browser print dialog. Each `.page` element becomes one A4 page.

const A4_W = 794
const A4_H = 1123

/**
 * @param pagesHtml  markup containing one or more `.page` elements
 * @param css        the stylesheet those pages rely on
 * @param filename   download filename (e.g. "guide.pdf")
 */
export async function downloadHtmlPagesAsPdf(
  pagesHtml: string,
  css: string,
  filename: string,
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ])

  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.background = "#fff"
  container.innerHTML = `<style>${css}</style>${pagesHtml}`
  document.body.appendChild(container)

  try {
    // Wait for every image (logos, etc.) to finish loading — otherwise capture is blank.
    const imgs = Array.from(container.querySelectorAll("img"))
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true })
              img.addEventListener("error", () => res(), { once: true })
            }),
      ),
    )
    // Wait for web fonts so text isn't captured in a fallback face.
    const fonts = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts
    if (fonts?.ready) { try { await fonts.ready } catch {} }
    await new Promise((res) => requestAnimationFrame(() => res(null)))

    const pages = Array.from(container.querySelectorAll<HTMLElement>(".page"))
    const pdf = new jsPDF({ unit: "px", format: [A4_W, A4_H], orientation: "portrait" })

    // scale 1.5 keeps text crisp while cutting render time roughly in half vs 2x.
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 1.5, useCORS: true, backgroundColor: "#ffffff",
        width: A4_W, height: A4_H, windowWidth: A4_W,
      })
      const img = canvas.toDataURL("image/jpeg", 0.85)
      if (i > 0) pdf.addPage([A4_W, A4_H], "portrait")
      pdf.addImage(img, "JPEG", 0, 0, A4_W, A4_H)
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
