// Convertit en WebP les JPG de contenu réellement importés par le Portfolio et
// la section « Nos services » — SANS jamais déplacer ni écraser une image.
//
// Règles de sûreté :
//  - même dossier (src/imports/), même base de nom, extension .webp ;
//  - si le nom .webp visé est déjà pris par une AUTRE image (le repo mélange
//    `nom.webp` issu de PNG et `nom_jpg.webp` issu de JPG), on choisit un
//    suffixe libre (`_jpg`, puis `_jpgw`, `_jpgw2`, …) : aucune collision ;
//  - on génère une version lossy (q82) et une lossless, on garde la PLUS PETITE,
//    et uniquement si elle est plus légère que le JPG d'origine (« si nécessaire ») ;
//  - le JPG d'origine est CONSERVÉ (on ne supprime rien tant que les imports ne
//    sont pas mis à jour) ; le mapping ancien→nouveau est imprimé pour l'édition.
//
// Usage : node scripts/jpg-to-webp.mjs
import sharp from "sharp"
import { statSync, existsSync, unlinkSync } from "node:fs"

const DIR = "src/imports/"

// JPG de contenu importés par le Portfolio (src/data/portfolio.ts) et la
// section services (src/data/servicePreviews.ts). Le logo NatCash (Payer.tsx)
// est volontairement exclu : hors périmètre « portfolio / services ».
const TARGETS = [
  // Portfolio
  "_509_3625-5920.jpg", "_509_3625-5920__1_.jpg", "_509_3625-5920__2_.jpg",
  "_509_3625-5920__3_.jpg", "_509_3625-5920__4_.jpg",
  "1.jpg", "2.jpg", "3.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg",
  "14.jpg", "15.jpg", "16.jpg", "17.jpg",
  "Manba_flyer.jpg", "Manba_gingembre.jpg", "Manba_Sal_.jpg", "Manba_Sucr_.jpg",
  "carte_de_visite_face.jpg", "carte_de_visite_dos.jpg",
  // Section « Nos services » (image dielines)
  "INOV_Digital_Services__1_.jpg",
]

// Choisit un nom .webp libre pour une base donnée (jamais d'écrasement).
function freeName(base) {
  const candidates = [`${base}_jpg`, `${base}_jpgw`, `${base}_jpgw2`, `${base}_jpgw3`]
  for (const c of candidates) if (!existsSync(`${DIR}${c}.webp`)) return `${c}.webp`
  throw new Error(`Aucun nom libre pour ${base}`)
}

const kb = (b) => (b / 1024).toFixed(1) + " KB"
const mapping = []
let converted = 0

for (const jpg of TARGETS) {
  const src = `${DIR}${jpg}`
  if (!existsSync(src)) { console.log(`⚠  introuvable : ${src}`); continue }
  const base = jpg.replace(/\.jpe?g$/i, "")
  const out = `${DIR}${freeName(base)}`
  const before = statSync(src).size

  // Deux encodages : lossy (photos/flyers) et lossless (aplats). On garde le plus petit.
  const lossyBuf = await sharp(src).webp({ quality: 82, effort: 6 }).toBuffer()
  const losslessBuf = await sharp(src).webp({ lossless: true, effort: 6 }).toBuffer()
  const best = lossyBuf.length <= losslessBuf.length ? lossyBuf : losslessBuf

  if (best.length < before) {
    const { writeFileSync } = await import("node:fs")
    writeFileSync(out, best)
    converted++
    mapping.push([jpg, out.replace(DIR, "")])
    const mode = best === lossyBuf ? "lossy q82" : "lossless"
    console.log(`✅ ${jpg} (${kb(before)}) → ${out.replace(DIR, "")} (${kb(best.length)}, ${mode})  −${Math.round((1 - best.length / before) * 100)}%`)
  } else {
    console.log(`↔  ${jpg} conservé en JPG (WebP non plus léger)`)
  }
}

console.log(`\nTerminé — ${converted}/${TARGETS.length} converti(s).`)
console.log("\n=== MAPPING (ancien.jpg -> nouveau.webp) ===")
for (const [a, b] of mapping) console.log(`${a} -> ${b}`)
