// Génère les aperçus de partage du portfolio (1200x630 JPG) + les métadonnées
// lues par api/portfolio-share.js. À relancer quand le portfolio change :
//   node scripts/portfolio-og.mjs
// Sorties : public/portfolio-og/<id>.jpg et api/_portfolio-og.js
import sharp from "sharp"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const SRC = readFileSync("src/data/portfolio.ts", "utf8")
const OUT = "public/portfolio-og"
mkdirSync(OUT, { recursive: true })

// import nomVariable from "../imports/fichier.webp"
const imports = {}
for (const m of SRC.matchAll(/import\s+(\w+)\s+from\s+"\.\.\/imports\/([^"]+)"/g)) imports[m[1]] = resolve("src/imports", m[2])

const body = SRC.slice(SRC.indexOf("export const albums"))
const blocks = body.split(/\n  \{\n    id: "/).slice(1)
const unq = (s) => s.replace(/\\"/g, '"')
const meta = {}

for (const b of blocks) {
  const id = b.slice(0, b.indexOf('"'))
  const pick = (k) => { const m = b.match(new RegExp(`\\n    ${k}: "((?:[^"\\\\]|\\\\.)*)"`)); return m ? unq(m[1]) : "" }
  const firstImg = b.match(/img:\s*(\w+)/)?.[1]
  const logo = b.match(/\n    logo:\s*(\w+)/)?.[1]
  const video = b.match(/videoId:\s*"([^"]+)"/)?.[1]

  let input = null
  if (firstImg && imports[firstImg]) input = readFileSync(imports[firstImg])
  else if (logo && imports[logo]) input = readFileSync(imports[logo])
  else if (video) {
    for (const q of ["maxresdefault", "hqdefault"]) {
      try {
        const r = await fetch(`https://img.youtube.com/vi/${video}/${q}.jpg`)
        if (r.ok) { input = Buffer.from(await r.arrayBuffer()); break }
      } catch {}
    }
  }

  let hasImage = false
  if (input) {
    // Fond flou plein cadre + visuel entier au centre : rien n'est rogné.
    const bg = await sharp(input).resize(1200, 630, { fit: "cover" }).blur(28).modulate({ brightness: 0.85 }).toBuffer()
    const fg = await sharp(input).resize(1080, 560, { fit: "inside", withoutEnlargement: false }).toBuffer()
    await sharp(bg).composite([{ input: fg, gravity: "center" }]).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/${id}.jpg`)
    hasImage = true
  }
  meta[id] = { client: pick("client"), tagline: pick("tagline"), impact: pick("impact"), image: hasImage }
}

writeFileSync("api/_portfolio-og.js", `// Fichier généré par scripts/portfolio-og.mjs, ne pas modifier à la main.\nexport default ${JSON.stringify(meta, null, 2)};\n`)
console.log(Object.keys(meta).length, "projets,", Object.values(meta).filter((m) => m.image).length, "images")
