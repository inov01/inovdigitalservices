// Single source of truth for the "Nos services" preview images. Consumed by
// both the services section (Services.tsx) and the home hero coverflow
// (Hero.tsx), so the animating trio on the accueil always reflects the exact
// visuals shown in the services section.
import logo1 from "@/imports/logo-1.webp"
import socialFlyer from "@/imports/social_flyer.webp"
import packagingAnana from "@/imports/packaging_anana.webp"
import etiquetteSimple from "@/imports/INOV_Digital_Services__64_.webp"
import dielinesPackaging from "@/imports/INOV_Digital_Services__1__jpg.webp"

export { logo1, socialFlyer, packagingAnana, etiquetteSimple, dielinesPackaging }

// Order mirrors the "Nos services" section.
export const servicePreviews: string[] = [
  logo1, packagingAnana, etiquetteSimple, socialFlyer, dielinesPackaging,
]
