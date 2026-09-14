// Convertit des images PNG de contenu en WebP — uniquement si le WebP est plus
// léger que l'original (« si nécessaire »). Les favicons et icônes PWA
// (favicon-*, apple-touch-icon*, android-chrome*) sont volontairement exclus :
// ces formats doivent rester en PNG pour la compatibilité navigateur/OS.
//
// Usage : node scripts/png-to-webp.mjs [chemin1.png chemin2.png ...]
// Sans argument, cible les PNG de contenu importés dans le code.
import sharp from "sharp"
import { statSync, existsSync } from "node:fs"

// PNG de contenu réellement importés dans l'application (hors favicons/icônes).
const DEFAULT_TARGETS = [
  "src/imports/unnamed.png",      // logo MonCash (Payer.tsx)
  "src/imports/images__5_.png",   // logo BUH (Payer.tsx)
]

// Motifs à ne jamais convertir même s'ils sont passés en argument.
const EXCLUDE = /(favicon|apple-touch-icon|android-chrome|og-image)/i

const targets = process.argv.slice(2)
const files = (targets.length ? targets : DEFAULT_TARGETS).filter((f) => {
  if (EXCLUDE.test(f)) { console.log(`⏭  ignoré (icône/favicon) : ${f}`); return false }
  if (!existsSync(f)) { console.log(`⚠  introuvable : ${f}`); return false }
  return true
})

const kb = (bytes) => (bytes / 1024).toFixed(1) + " KB"
let converted = 0

for (const src of files) {
  const out = src.replace(/\.png$/i, ".webp")
  const before = statSync(src).size
  // Lossless : les logos ont des aplats et de la transparence.
  await sharp(src).webp({ lossless: true, effort: 6 }).toFile(out)
  const after = statSync(out).size
  if (after < before) {
    converted++
    console.log(`✅ ${src} (${kb(before)}) → ${out} (${kb(after)})  −${Math.round((1 - after / before) * 100)}%`)
  } else {
    // WebP pas plus léger : on retire le fichier généré et on garde le PNG.
    const { unlinkSync } = await import("node:fs")
    unlinkSync(out)
    console.log(`↔  ${src} conservé en PNG (WebP non plus léger : ${kb(after)} ≥ ${kb(before)})`)
  }
}

console.log(`\nTerminé — ${converted}/${files.length} fichier(s) converti(s) en WebP.`)
