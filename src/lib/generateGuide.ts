import type { Lang } from "../i18n/translations"
import { downloadHtmlPagesAsPdf } from "./htmlToPdf"

type ErrorBlock = {
  kicker: string
  title: string
  problemLabel: string; problem: string
  costLabel: string; cost: string
  solutionLabel: string; solution: string
  tipLabel: string; tip: string
}

type GuideData = {
  lang: string; dir: string
  badge: string; printBtn: string; printHint: string
  title: string; subtitle: string
  toc: string[]
  stats: { value: string; label: string }[]
  errors: ErrorBlock[]
  cta: { title: string; highlight: string; lead: string; chips: string[]; footer: string }
}

const DATA: Record<Lang, GuideData> = {
  fr: {
    lang: "fr", dir: "ltr",
    badge: "Guide gratuit",
    printBtn: "Enregistrer en PDF",
    printHint: "Cliquez le bouton → choisissez « Enregistrer en PDF » → activez « Graphiques d'arrière-plan »",
    title: "7 erreurs de branding qui font fuir vos clients",
    subtitle: "Le guide concret pour bâtir une marque qui inspire confiance — et qui vend, dès le premier regard.",
    toc: ["Un logo trop compliqué","Des couleurs au hasard","Un style incohérent","Copier ses concurrents","Des visuels de mauvaise qualité","Oublier l'émotion","Pas d'identité écrite"],
    stats: [{value:"20+",label:"marques accompagnées"},{value:"80+",label:"visuels livrés"},{value:"48h",label:"délai de livraison"}],
    errors: [
      { kicker:"Le logo", title:"Un logo qui essaie de tout dire",
        problemLabel:"Le problème", problem:"Trop de détails, trop de texte, dégradés compliqués… Beaucoup de marques veulent que leur logo « raconte toute l'entreprise » en une image. Résultat : il devient illisible dès qu'on le réduit (photo de profil, tampon, étiquette).",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Un logo confus donne une impression d'amateurisme et ne se retient pas. Si votre audience ne peut pas l'identifier en une seconde, elle ne se souviendra pas de vous — et la mémorisation, c'est le début de la confiance.",
        solutionLabel:"La solution", solution:"Visez la simplicité : un logo doit rester net et reconnaissable même à 16 pixels. Testez-le en tout petit et en noir & blanc avant de le valider.",
        tipLabel:"Astuce concrète", tip:"Réduisez votre logo à la taille d'une icône d'application sur votre téléphone. Si on ne le reconnaît plus, simplifiez-le." },
      { kicker:"Les couleurs", title:"Des couleurs choisies « parce qu'on les aime »",
        problemLabel:"Le problème", problem:"Les couleurs sont choisies par goût personnel, sans logique, et changent d'une publication à l'autre. Or chaque couleur envoie un message inconscient : confiance, luxe, énergie, sérieux…",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Des couleurs incohérentes brouillent votre image et envoient le mauvais signal émotionnel. Une marque de soin qui utilise des couleurs agressives, par exemple, fait fuir avant même qu'on lise le message.",
        solutionLabel:"La solution", solution:"Définissez une palette de 2 à 3 couleurs (une principale, une secondaire, une neutre) et utilisez-les partout, sans exception.",
        tipLabel:"Astuce concrète", tip:"Choisissez vos couleurs selon l'émotion recherchée, pas selon vos préférences. Notez leurs codes exacts (ex. var(--ds-accent)) pour ne jamais improviser." },
      { kicker:"La cohérence", title:"Changer de style à chaque publication",
        problemLabel:"Le problème", problem:"Une police ici, un autre filtre là, une mise en page différente à chaque fois. Chaque visuel semble venir d'une marque différente.",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Sans cohérence, votre audience ne vous reconnaît pas dans son fil d'actualité. La répétition d'un même univers visuel est exactement ce qui crée le sentiment de « marque sérieuse et installée ».",
        solutionLabel:"La solution", solution:"Créez des gabarits (templates) réutilisables : mêmes polices, mêmes couleurs, mêmes marges. Vous gagnez du temps ET de la crédibilité.",
        tipLabel:"Astuce concrète", tip:"Regardez vos 9 dernières publications en grille. Si elles n'ont pas l'air d'une même famille, il est temps d'unifier votre style." },
      { kicker:"La différenciation", title:"Copier ses concurrents",
        problemLabel:"Le problème", problem:"On regarde ce que fait « le leader du marché » et on l'imite, en pensant faire un choix sûr. On finit par ressembler à tout le monde.",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Quand toutes les marques se ressemblent, aucune ne se remarque. Vous devenez interchangeable — et le client choisit alors uniquement le moins cher.",
        solutionLabel:"La solution", solution:"Identifiez ce qui vous rend unique (votre histoire, votre ton, votre spécialité) et mettez-le en avant sans complexe.",
        tipLabel:"Astuce concrète", tip:"Complétez cette phrase : « Contrairement aux autres, nous… ». La réponse est le cœur de votre positionnement." },
      { kicker:"La qualité", title:"Négliger la qualité des visuels",
        problemLabel:"Le problème", problem:"Photos floues, captures pixelisées, montages bâclés faits à la va-vite. « Ça fera l'affaire »… mais ça ne fait jamais l'affaire.",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Le client juge la qualité de votre produit ou service à la qualité de vos images. Un visuel négligé donne l'impression d'une offre négligée — et fait douter avant même l'achat.",
        solutionLabel:"La solution", solution:"Investissez dans des visuels soignés et en haute résolution. C'est votre vitrine : elle travaille pour vous 24h/24.",
        tipLabel:"Astuce concrète", tip:"Mieux vaut 3 visuels excellents que 10 visuels moyens. La qualité prime toujours sur la quantité." },
      { kicker:"L'émotion", title:"Oublier l'émotion et l'histoire",
        problemLabel:"Le problème", problem:"La communication ne parle que de produits, de prix et de caractéristiques. Aucune histoire, aucune émotion, aucun « pourquoi ».",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Les gens n'achètent pas un produit : ils achètent ce qu'il représente et ce qu'ils ressentent. Une marque sans récit reste froide et oubliable.",
        solutionLabel:"La solution", solution:"Racontez le « pourquoi » de votre marque : son origine, sa mission, les personnes derrière. C'est ce qui crée l'attachement.",
        tipLabel:"Astuce concrète", tip:"Partagez régulièrement les coulisses : le fondateur, la fabrication, un client heureux. L'humain crée la connexion." },
      { kicker:"La charte", title:"Ne pas avoir d'identité écrite",
        problemLabel:"Le problème", problem:"Aucun document ne fixe les règles de la marque. Chaque nouveau visuel, chaque nouveau prestataire repart de zéro et interprète à sa façon.",
        costLabel:"Pourquoi ça vous coûte des clients", cost:"Sans cadre, votre image se dilue au fil du temps et perd de sa force. Vous perdez aussi un temps précieux à re-expliquer votre univers à chaque collaboration.",
        solutionLabel:"La solution", solution:"Créez une mini-charte graphique : logo et ses variantes, couleurs exactes, polices, ton de communication.",
        tipLabel:"Astuce concrète", tip:"Même une charte d'une seule page suffit pour démarrer. L'essentiel est qu'elle existe et que tout le monde la suive." },
    ],
    cta: { title:"Prêt à corriger ces ", highlight:"erreurs ?", lead:"INOV Digital Services accompagne les marques dans leur branding, de A à Z. On s'occupe de tout — vous vous concentrez sur votre activité.", chips:["Logos & identité","Packaging","Affiches & flyers","Motion design","Sites vitrines","Promotion en ligne"], footer:"© INOV Digital Services — Merci de votre confiance." },
  },

  en: {
    lang: "en", dir: "ltr",
    badge: "Free guide",
    printBtn: "Save as PDF",
    printHint: "Click the button → choose 'Save as PDF' → enable 'Background graphics'",
    title: "7 branding mistakes that scare your clients away",
    subtitle: "The practical guide to building a brand that inspires trust — and sells, from the very first glance.",
    toc: ["A logo that's too complex","Random colour choices","An inconsistent style","Copying competitors","Poor-quality visuals","Forgetting emotion","No written identity"],
    stats: [{value:"20+",label:"brands supported"},{value:"80+",label:"visuals delivered"},{value:"48h",label:"delivery time"}],
    errors: [
      { kicker:"The logo", title:"A logo that tries to say everything",
        problemLabel:"The problem", problem:"Too many details, too much text, complex gradients… Many brands want their logo to 'tell the whole story' in one image. The result: it becomes illegible at small sizes (profile picture, stamp, label).",
        costLabel:"Why it costs you clients", cost:"A confusing logo looks amateurish and doesn't stick in the memory. If your audience can't identify it in a second, they won't remember you — and recognition is where trust begins.",
        solutionLabel:"The solution", solution:"Aim for simplicity: a logo must remain clean and recognisable even at 16 pixels. Test it at a tiny size and in black & white before signing off.",
        tipLabel:"Practical tip", tip:"Shrink your logo to app-icon size on your phone. If you can no longer recognise it, simplify it." },
      { kicker:"Colours", title:"Colours chosen 'because we like them'",
        problemLabel:"The problem", problem:"Colours are chosen on personal taste, without logic, and change from one post to the next. Yet every colour sends an unconscious message: trust, luxury, energy, seriousness…",
        costLabel:"Why it costs you clients", cost:"Inconsistent colours muddle your image and send the wrong emotional signal. A wellness brand that uses aggressive colours, for example, drives people away before they even read the message.",
        solutionLabel:"The solution", solution:"Define a palette of 2–3 colours (one primary, one secondary, one neutral) and use them everywhere, without exception.",
        tipLabel:"Practical tip", tip:"Choose your colours based on the emotion you want to convey, not your personal preferences. Note their exact codes (e.g. var(--ds-accent)) so you never have to improvise." },
      { kicker:"Consistency", title:"Changing style with every post",
        problemLabel:"The problem", problem:"One font here, a different filter there, a different layout every time. Every visual looks like it comes from a different brand.",
        costLabel:"Why it costs you clients", cost:"Without consistency, your audience won't recognise you in their feed. Repeating the same visual universe is exactly what creates the feeling of a 'serious, established brand'.",
        solutionLabel:"The solution", solution:"Create reusable templates: same fonts, same colours, same margins. You save time AND gain credibility.",
        tipLabel:"Practical tip", tip:"Look at your last 9 posts in grid view. If they don't look like one family, it's time to unify your style." },
      { kicker:"Differentiation", title:"Copying your competitors",
        problemLabel:"The problem", problem:"You look at what the 'market leader' does and imitate it, thinking it's a safe choice. You end up looking like everyone else.",
        costLabel:"Why it costs you clients", cost:"When all brands look the same, none stand out. You become interchangeable — and the client then chooses only on price. Your difference is your best selling argument.",
        solutionLabel:"The solution", solution:"Identify what makes you unique (your story, your tone, your speciality) and highlight it without hesitation.",
        tipLabel:"Practical tip", tip:"Complete this sentence: 'Unlike others, we…'. The answer is the heart of your positioning." },
      { kicker:"Quality", title:"Neglecting the quality of visuals",
        problemLabel:"The problem", problem:"Blurry photos, pixelated screenshots, rushed edits. 'It'll do'… but it never does.",
        costLabel:"Why it costs you clients", cost:"Clients judge the quality of your product or service by the quality of your images. A careless visual gives the impression of a careless offer — and creates doubt before the purchase.",
        solutionLabel:"The solution", solution:"Invest in polished, high-resolution visuals. It's your shop window: it works for you 24/7.",
        tipLabel:"Practical tip", tip:"Three excellent visuals are worth more than ten average ones. Quality always beats quantity." },
      { kicker:"Emotion", title:"Forgetting emotion and story",
        problemLabel:"The problem", problem:"Communication only talks about products, prices and features. No story, no emotion, no 'why'.",
        costLabel:"Why it costs you clients", cost:"People don't buy a product: they buy what it represents and how it makes them feel. A brand without a narrative stays cold and forgettable — and therefore easy to replace.",
        solutionLabel:"The solution", solution:"Tell the 'why' of your brand: its origin, its mission, the people behind it. That's what creates attachment.",
        tipLabel:"Practical tip", tip:"Share behind-the-scenes content regularly: the founder, the making-of, a happy client. Human stories create connection." },
      { kicker:"Brand guidelines", title:"Having no written identity",
        problemLabel:"The problem", problem:"No document sets the rules of the brand. Every new visual, every new supplier starts from scratch and interprets things their own way.",
        costLabel:"Why it costs you clients", cost:"Without a framework, your image dilutes over time and loses its strength. You also waste precious time re-explaining your universe at every collaboration.",
        solutionLabel:"The solution", solution:"Create a mini brand guide: logo and variants, exact colours, fonts, tone of communication.",
        tipLabel:"Practical tip", tip:"Even a one-page guide is enough to start. The important thing is that it exists and that everyone follows it." },
    ],
    cta: { title:"Ready to fix these ", highlight:"mistakes?", lead:"INOV Digital Services supports brands with their branding, from A to Z. We handle everything — you focus on your business.", chips:["Logos & identity","Packaging","Posters & flyers","Motion design","Showcase websites","Online promotion"], footer:"© INOV Digital Services — Thank you for your trust." },
  },

  es: {
    lang: "es", dir: "ltr",
    badge: "Guía gratuita",
    printBtn: "Guardar como PDF",
    printHint: "Haz clic → elige 'Guardar como PDF' → activa 'Gráficos de fondo'",
    title: "7 errores de branding que ahuyentan a tus clientes",
    subtitle: "La guía práctica para construir una marca que inspire confianza — y que venda, desde el primer vistazo.",
    toc: ["Un logo demasiado complejo","Colores al azar","Estilo inconsistente","Copiar a la competencia","Visueles de baja calidad","Olvidar la emoción","Sin identidad escrita"],
    stats: [{value:"20+",label:"marcas acompañadas"},{value:"80+",label:"visuales entregados"},{value:"48h",label:"plazo de entrega"}],
    errors: [
      { kicker:"El logo", title:"Un logo que intenta decirlo todo",
        problemLabel:"El problema", problem:"Demasiados detalles, demasiado texto, degradados complicados… Muchas marcas quieren que su logo 'cuente toda la empresa' en una imagen. Resultado: se vuelve ilegible al reducirlo (foto de perfil, sello, etiqueta).",
        costLabel:"Por qué te cuesta clientes", cost:"Un logo confuso da imagen de amateurismo y no se recuerda. Si tu audiencia no puede identificarlo en un segundo, no se acordará de ti — y la memorización es el comienzo de la confianza.",
        solutionLabel:"La solución", solution:"Apunta a la simplicidad: un logo debe seguir siendo nítido y reconocible incluso a 16 píxeles. Pruébalo muy pequeño y en blanco y negro antes de aprobarlo.",
        tipLabel:"Consejo práctico", tip:"Reduce tu logo al tamaño de un icono de app en tu teléfono. Si ya no se reconoce, simplificalo." },
      { kicker:"Los colores", title:"Colores elegidos 'porque nos gustan'",
        problemLabel:"El problema", problem:"Los colores se eligen por gusto personal, sin lógica, y cambian de una publicación a otra. Sin embargo, cada color envía un mensaje inconsciente: confianza, lujo, energía, seriedad…",
        costLabel:"Por qué te cuesta clientes", cost:"Los colores inconsistentes enturbian tu imagen y envían la señal emocional equivocada. Una marca de bienestar que usa colores agresivos, por ejemplo, ahuyenta antes de que se lea el mensaje.",
        solutionLabel:"La solución", solution:"Define una paleta de 2 a 3 colores (uno principal, uno secundario, uno neutro) y úsalos en todos lados, sin excepción.",
        tipLabel:"Consejo práctico", tip:"Elige tus colores según la emoción buscada, no según tus preferencias. Anota sus códigos exactos (ej. var(--ds-accent)) para no improvisar." },
      { kicker:"Coherencia", title:"Cambiar de estilo con cada publicación",
        problemLabel:"El problema", problem:"Una fuente aquí, otro filtro allá, una maquetación diferente cada vez. Cada visual parece venir de una marca distinta.",
        costLabel:"Por qué te cuesta clientes", cost:"Sin coherencia, tu audiencia no te reconoce en su feed. Repetir el mismo universo visual es exactamente lo que crea la sensación de 'marca seria y establecida'.",
        solutionLabel:"La solución", solution:"Crea plantillas reutilizables: mismas fuentes, mismos colores, mismos márgenes. Ganas tiempo Y credibilidad.",
        tipLabel:"Consejo práctico", tip:"Mira tus 9 últimas publicaciones en cuadrícula. Si no parecen de la misma familia, es hora de unificar tu estilo." },
      { kicker:"Diferenciación", title:"Copiar a la competencia",
        problemLabel:"El problema", problem:"Observas lo que hace 'el líder del mercado' y lo imitas pensando que es una elección segura. Terminas pareciendo igual que todos.",
        costLabel:"Por qué te cuesta clientes", cost:"Cuando todas las marcas se parecen, ninguna destaca. Te vuelves intercambiable — y el cliente elige solo por precio.",
        solutionLabel:"La solución", solution:"Identifica lo que te hace único (tu historia, tu tono, tu especialidad) y resáltalo sin complejos.",
        tipLabel:"Consejo práctico", tip:"Completa esta frase: 'A diferencia de los demás, nosotros…'. La respuesta es el corazón de tu posicionamiento." },
      { kicker:"Calidad", title:"Descuidar la calidad de los visuales",
        problemLabel:"El problema", problem:"Fotos borrosas, capturas pixeladas, montajes apresurados. 'Servirá'… pero nunca sirve.",
        costLabel:"Por qué te cuesta clientes", cost:"El cliente juzga la calidad de tu producto o servicio por la calidad de tus imágenes. Un visual descuidado da la impresión de una oferta descuidada.",
        solutionLabel:"La solución", solution:"Invierte en visuales cuidados y en alta resolución. Es tu escaparate: trabaja para ti las 24h.",
        tipLabel:"Consejo práctico", tip:"Tres visuales excelentes valen más que diez mediocres. La calidad siempre supera a la cantidad." },
      { kicker:"Emoción", title:"Olvidar la emoción y la historia",
        problemLabel:"El problema", problem:"La comunicación solo habla de productos, precios y características. Sin historia, sin emoción, sin 'por qué'.",
        costLabel:"Por qué te cuesta clientes", cost:"La gente no compra un producto: compra lo que representa y cómo les hace sentir. Una marca sin narrativa se queda fría y olvidable.",
        solutionLabel:"La solución", solution:"Cuenta el 'por qué' de tu marca: su origen, su misión, las personas detrás. Eso es lo que crea el vínculo.",
        tipLabel:"Consejo práctico", tip:"Comparte regularmente el making-of: el fundador, la fabricación, un cliente feliz. Lo humano crea la conexión." },
      { kicker:"Manual de marca", title:"No tener una identidad escrita",
        problemLabel:"El problema", problem:"Ningún documento fija las reglas de la marca. Cada nuevo visual, cada nuevo proveedor parte de cero e interpreta a su manera.",
        costLabel:"Por qué te cuesta clientes", cost:"Sin marco, tu imagen se diluye con el tiempo y pierde fuerza. También pierdes tiempo valioso re-explicando tu universo en cada colaboración.",
        solutionLabel:"La solución", solution:"Crea un mini manual de marca: logo y variantes, colores exactos, tipografías, tono de comunicación.",
        tipLabel:"Consejo práctico", tip:"Incluso un manual de una sola página es suficiente para empezar. Lo importante es que exista y que todos lo sigan." },
    ],
    cta: { title:"¿Listo para corregir estos ", highlight:"errores?", lead:"INOV Digital Services acompaña a las marcas en su branding, de la A a la Z. Nos encargamos de todo — tú te concentras en tu actividad.", chips:["Logos e identidad","Packaging","Carteles y flyers","Motion design","Sitios web","Promoción online"], footer:"© INOV Digital Services — Gracias por su confianza." },
  },

  ht: {
    lang: "ht", dir: "ltr",
    badge: "Gid gratis",
    printBtn: "Anrejistre an PDF",
    printHint: "Klike bouton an → chwazi 'Anrejistre an PDF' → aktive 'Grafik background'",
    title: "7 erè branding ki fè kliyan ou yo sove",
    subtitle: "Gid konkrè pou bati yon mak ki enspiw konfyans — epi ki vann, depi premye gade.",
    toc: ["Yon logo twò konplike","Koulè chwazi omaza","Yon style enkoeran","Kopye konkirann ou","Vizyèl ki pa bon kalite","Bliye emosyon","Pa gen idantite ekri"],
    stats: [{value:"20+",label:"mak akonpaye"},{value:"80+",label:"vizyèl livwe"},{value:"48h",label:"delè livrezon"}],
    errors: [
      { kicker:"Logo a", title:"Yon logo ki eseye di tout bagay",
        problemLabel:"Pwoblèm nan", problem:"Twòp detay, twòp tèks, degrade konplike… Anpil mak vle logo yo 'rakonte tout antrepriz la' nan yon sèl imaj. Rezilta: li vin ilisib lè ou rediksyon l (foto pwofil, sele, etikèt).",
        costLabel:"Poukisa sa koute ou kliyan", cost:"Yon logo konfize bay enpresyon amatè epi li pa rete nan memwa. Si piblik ou pa ka idantifye l nan yon segonn, yo pa pral sonje ou.",
        solutionLabel:"Solisyon an", solution:"Vize senplisite: yon logo dwe rete klè ak rekonesab menm nan 16 piksèl. Teste l an piti epi an blan ak nwa anvan ou valide l.",
        tipLabel:"Konsèy konkrè", tip:"Rediksyon logo ou nan gwosè yon ikòn aplikasyon sou telefòn ou. Si ou pa rekonèt li ankò, senplifye l." },
      { kicker:"Koulè yo", title:"Koulè chwazi 'paske nou renmen yo'",
        problemLabel:"Pwoblèm nan", problem:"Koulè yo chwazi selon gou pèsonèl, san lojik, epi yo chanje chak piblikasyon. Men chak koulè voye yon mesaj enkonscyan: konfyans, liks, enèji, serye…",
        costLabel:"Poukisa sa koute ou kliyan", cost:"Koulè enkoeran yo brouye imaj ou epi voye move siyal emosyonèl. Yon mak swen ki itilize koulè agresif, pa egzanp, fè moun sove anvan yo li mesaj la.",
        solutionLabel:"Solisyon an", solution:"Defini yon palèt 2 a 3 koulè (youn prensipal, youn segondè, youn neyt) epi itilize yo toupatou, san eksepsyon.",
        tipLabel:"Konsèy konkrè", tip:"Chwazi koulè ou yo selon emosyon ou vle transmèt, pa selon preferans ou. Note kòd egzak yo (egz. var(--ds-accent)) pou pa janm enprovize." },
      { kicker:"Koherans", title:"Chanje stil chak piblikasyon",
        problemLabel:"Pwoblèm nan", problem:"Yon fon isit, yon lòt filtre lòtbò, yon diferan mise en page chak fwa. Chak vizyèl sanble vin nan yon diferan mak.",
        costLabel:"Poukisa sa koute ou kliyan", cost:"San koherans, piblik ou pa rekonèt ou nan feed yo. Repete menm inivè vizyèl la se egzakteman sa ki kreye santiman 'mak serye ak etabli'.",
        solutionLabel:"Solisyon an", solution:"Kreye gabarit (templates) reutilizab: menm fon, menm koulè, menm maj. Ou ekonomize tan EPI ou genyen krediblite.",
        tipLabel:"Konsèy konkrè", tip:"Gade 9 dènye piblikasyon ou yo nan griy. Si yo pa sanble yon sèl fanmi, li lè pou inifye style ou." },
      { kicker:"Diferansyasyon", title:"Kopye konkirann ou yo",
        problemLabel:"Pwoblèm nan", problem:"Ou gade sa 'lidè mache a' fè epi ou imite l, panse sa se yon chwa san risk. Ou fini pa sanble tout moun.",
        costLabel:"Poukisa sa koute ou kliyan", cost:"Lè tout mak yo sanble, pa gen youn ki remake. Ou vin entèchanjab — epi kliyan an chwazi sèlman sou pri.",
        solutionLabel:"Solisyon an", solution:"Idantifye sa ki rann ou inik (istwa ou, ton ou, spesyalite ou) epi mete l devan san konplèks.",
        tipLabel:"Konsèy konkrè", tip:"Konplete fraz sa a: 'Kontrèman ak lòt yo, nou…'. Repons lan se kè pozisyonman ou." },
      { kicker:"Kalite", title:"Neglijwe kalite vizyèl yo",
        problemLabel:"Pwoblèm nan", problem:"Foto flou, kaptire pikselize, montaj depresipitasyon. 'Sa pral fè bagay'… men li pa janm fè bagay.",
        costLabel:"Poukisa sa koute ou kliyan", cost:"Kliyan an jije kalite pwodui oswa sèvis ou sou kalite imaj ou yo. Yon vizyèl neglije bay enpresyon yon òf neglije.",
        solutionLabel:"Solisyon an", solution:"Envesti nan vizyèl pran swen ak an wo rezolisyon. Se vitrin ou: li travay pou ou 24h/24.",
        tipLabel:"Konsèy konkrè", tip:"3 vizyèl ekselan vo plis pase 10 vizyèl mwayen. Kalite toujou depase kantite." },
      { kicker:"Emosyon", title:"Bliye emosyon ak istwa",
        problemLabel:"Pwoblèm nan", problem:"Kominikasyon an sèlman pale sou pwodui, pri ak karakteristik. Pa gen istwa, pa gen emosyon, pa gen 'poukisa'.",
        costLabel:"Poukisa sa koute ou kliyan", cost:"Moun pa achte yon pwodui: yo achte sa li reprezante ak sa yo santi. Yon mak san narasyon rete frèt ak bliyab.",
        solutionLabel:"Solisyon an", solution:"Rakonte 'poukisa' mak ou: orijin li, misyon li, moun ki dèyè li. Sa se sa ki kreye atachman.",
        tipLabel:"Konsèy konkrè", tip:"Pataje regilyèman kouliss: fondatè a, fabrikasyon an, yon kliyan kontan. Imen kreye koneksyon." },
      { kicker:"Chant grafik", title:"Pa gen idantite ekri",
        problemLabel:"Pwoblèm nan", problem:"Pa gen dokiman ki fikse règ mak la. Chak nouvo vizyèl, chak nouvo prestatatè rekòmanse depi zewo epi entèprete jan yo vle.",
        costLabel:"Poukisa sa koute ou kliyan", cost:"San kad, imaj ou dilye avèk tan epi pèdi fòs li. Ou pèdi tou tan presye a re-eksplike inivè ou nan chak kolaborasyon.",
        solutionLabel:"Solisyon an", solution:"Kreye yon mini chant grafik: logo ak varyasyon li, koulè egzak, fon, ton kominikasyon.",
        tipLabel:"Konsèy konkrè", tip:"Menm yon chant yon sèl paj ase pou kòmanse. Esansyèl la se ke li egziste epi tout moun swiv li." },
    ],
    cta: { title:"Prè pou korije ", highlight:"erè sa yo?", lead:"INOV Digital Services akonpaye mak yo nan branding yo, depi A jiska Z. Nou okipe tout bagay — ou konsantre sou aktivite ou.", chips:["Logos & idantite","Packaging","Afich & flyers","Motion design","Sit wèb","Pwomosyon sou entènèt"], footer:"© INOV Digital Services — Mèsi pou konfyans ou." },
  },

  pt: {
    lang: "pt", dir: "ltr",
    badge: "Guia gratuito",
    printBtn: "Salvar como PDF",
    printHint: "Clique → escolha 'Salvar como PDF' → ative 'Gráficos de fundo'",
    title: "7 erros de branding que afastam seus clientes",
    subtitle: "O guia prático para construir uma marca que inspire confiança — e que venda, desde o primeiro olhar.",
    toc: ["Um logo complexo demais","Cores escolhidas ao acaso","Estilo inconsistente","Copiar concorrentes","Visuais de baixa qualidade","Esquecer a emoção","Sem identidade escrita"],
    stats: [{value:"20+",label:"marcas acompanhadas"},{value:"80+",label:"visuais entregues"},{value:"48h",label:"prazo de entrega"}],
    errors: [
      { kicker:"O logo", title:"Um logo que tenta dizer tudo",
        problemLabel:"O problema", problem:"Detalhes demais, texto demais, gradientes complicados… Muitas marcas querem que o logo 'conte toda a empresa' em uma imagem. Resultado: fica ilegível quando reduzido (foto de perfil, carimbo, etiqueta).",
        costLabel:"Por que isso custa clientes", cost:"Um logo confuso parece amador e não fica na memória. Se o público não consegue identificá-lo em um segundo, não vai se lembrar de você.",
        solutionLabel:"A solução", solution:"Mire na simplicidade: um logo deve continuar nítido e reconhecível mesmo a 16 pixels. Teste-o bem pequeno e em preto e branco antes de aprovar.",
        tipLabel:"Dica prática", tip:"Reduza seu logo ao tamanho de um ícone de app no celular. Se não der mais para reconhecer, simplifique." },
      { kicker:"Cores", title:"Cores escolhidas 'porque a gente gosta'",
        problemLabel:"O problema", problem:"As cores são escolhidas por gosto pessoal, sem lógica, e mudam de uma publicação para outra. Mas cada cor envia uma mensagem inconsciente: confiança, luxo, energia, seriedade…",
        costLabel:"Por que isso custa clientes", cost:"Cores inconsistentes embaralham sua imagem e enviam o sinal emocional errado. Uma marca de cuidados que usa cores agressivas, por exemplo, afasta antes mesmo de o cliente ler a mensagem.",
        solutionLabel:"A solução", solution:"Defina uma paleta de 2 a 3 cores (uma principal, uma secundária, uma neutra) e use-as em todo lugar, sem exceção.",
        tipLabel:"Dica prática", tip:"Escolha suas cores com base na emoção desejada, não nas suas preferências. Anote os códigos exatos (ex. var(--ds-accent)) para nunca improvisar." },
      { kicker:"Consistência", title:"Mudar de estilo a cada publicação",
        problemLabel:"O problema", problem:"Uma fonte aqui, outro filtro ali, um layout diferente toda vez. Cada visual parece vir de uma marca diferente.",
        costLabel:"Por que isso custa clientes", cost:"Sem consistência, seu público não te reconhece no feed. Repetir o mesmo universo visual é exatamente o que cria a sensação de 'marca séria e estabelecida'.",
        solutionLabel:"A solução", solution:"Crie modelos reutilizáveis: mesmas fontes, mesmas cores, mesmas margens. Você ganha tempo E credibilidade.",
        tipLabel:"Dica prática", tip:"Olhe suas 9 últimas publicações em grade. Se não parecerem da mesma família, é hora de unificar seu estilo." },
      { kicker:"Diferenciação", title:"Copiar os concorrentes",
        problemLabel:"O problema", problem:"Você olha o que o 'líder de mercado' faz e imita, achando que é uma escolha segura. Acaba parecendo igual a todo mundo.",
        costLabel:"Por que isso custa clientes", cost:"Quando todas as marcas se parecem, nenhuma se destaca. Você vira intercambiável — e o cliente escolhe apenas pelo preço.",
        solutionLabel:"A solução", solution:"Identifique o que te torna único (sua história, seu tom, sua especialidade) e destaque isso sem complexo.",
        tipLabel:"Dica prática", tip:"Complete esta frase: 'Ao contrário dos outros, nós…'. A resposta é o coração do seu posicionamento." },
      { kicker:"Qualidade", title:"Negligenciar a qualidade dos visuais",
        problemLabel:"O problema", problem:"Fotos borradas, capturas pixeladas, montagens apressadas. 'Vai servir'… mas nunca serve.",
        costLabel:"Por que isso custa clientes", cost:"O cliente julga a qualidade do seu produto ou serviço pela qualidade das suas imagens. Um visual descuidado passa a impressão de uma oferta descuidada.",
        solutionLabel:"A solução", solution:"Invista em visuais cuidados e em alta resolução. É a sua vitrine: ela trabalha para você 24h por dia.",
        tipLabel:"Dica prática", tip:"Três visuais excelentes valem mais do que dez mediocres. A qualidade sempre supera a quantidade." },
      { kicker:"Emoção", title:"Esquecer a emoção e a história",
        problemLabel:"O problema", problem:"A comunicação fala apenas de produtos, preços e características. Nenhuma história, nenhuma emoção, nenhum 'porquê'.",
        costLabel:"Por que isso custa clientes", cost:"As pessoas não compram um produto: compram o que ele representa e o que sentem. Uma marca sem narrativa continua fria e esquecível.",
        solutionLabel:"A solução", solution:"Conte o 'porquê' da sua marca: sua origem, sua missão, as pessoas por trás. Isso é o que cria o vínculo.",
        tipLabel:"Dica prática", tip:"Compartilhe os bastidores regularmente: o fundador, a fabricação, um cliente feliz. O humano cria a conexão." },
      { kicker:"Manual de marca", title:"Não ter uma identidade escrita",
        problemLabel:"O problema", problem:"Nenhum documento define as regras da marca. Cada novo visual, cada novo fornecedor começa do zero e interpreta à sua maneira.",
        costLabel:"Por que isso custa clientes", cost:"Sem estrutura, sua imagem se dilui com o tempo e perde força. Você também perde tempo precioso re-explicando seu universo a cada colaboração.",
        solutionLabel:"A solução", solution:"Crie um mini manual de marca: logo e variações, cores exatas, fontes, tom de comunicação.",
        tipLabel:"Dica prática", tip:"Mesmo um manual de uma página é suficiente para começar. O importante é que exista e que todos o sigam." },
    ],
    cta: { title:"Pronto para corrigir esses ", highlight:"erros?", lead:"INOV Digital Services acompanha marcas no branding, do início ao fim. Cuidamos de tudo — você foca no seu negócio.", chips:["Logos & identidade","Packaging","Cartazes & flyers","Motion design","Sites vitrine","Promoção online"], footer:"© INOV Digital Services — Obrigado pela sua confiança." },
  },

  it: {
    lang: "it", dir: "ltr",
    badge: "Guida gratuita",
    printBtn: "Salva come PDF",
    printHint: "Clicca → scegli 'Salva come PDF' → attiva 'Grafica di sfondo'",
    title: "7 errori di branding che allontanano i tuoi clienti",
    subtitle: "La guida pratica per costruire un brand che ispira fiducia — e che vende, dal primo sguardo.",
    toc: ["Un logo troppo complesso","Colori scelti a caso","Stile inconsistente","Copiare i concorrenti","Visual di bassa qualità","Dimenticare l'emozione","Senza identità scritta"],
    stats: [{value:"20+",label:"brand supportati"},{value:"80+",label:"visual consegnati"},{value:"48h",label:"tempi di consegna"}],
    errors: [
      { kicker:"Il logo", title:"Un logo che cerca di dire tutto",
        problemLabel:"Il problema", problem:"Troppi dettagli, troppo testo, sfumature complicate… Molti brand vogliono che il logo 'racconti tutta l'azienda' in un'immagine. Risultato: diventa illeggibile quando ridotto (foto profilo, timbro, etichetta).",
        costLabel:"Perché ti costa clienti", cost:"Un logo confuso dà un'impressione amatoriale e non resta in mente. Se il tuo pubblico non riesce a identificarlo in un secondo, non si ricorderà di te.",
        solutionLabel:"La soluzione", solution:"Punta alla semplicità: un logo deve restare nitido e riconoscibile anche a 16 pixel. Testalo in piccolo e in bianco e nero prima di approvarlo.",
        tipLabel:"Consiglio pratico", tip:"Riduci il tuo logo alla dimensione di un'icona di app sul telefono. Se non lo riconosci più, semplificalo." },
      { kicker:"I colori", title:"Colori scelti 'perché ci piacciono'",
        problemLabel:"Il problema", problem:"I colori vengono scelti per gusto personale, senza logica, e cambiano da un post all'altro. Eppure ogni colore trasmette un messaggio inconscio: fiducia, lusso, energia, serietà…",
        costLabel:"Perché ti costa clienti", cost:"Colori incoerenti confondono la tua immagine e inviano il segnale emotivo sbagliato. Un brand wellness che usa colori aggressivi, ad esempio, spaventa prima ancora che si legga il messaggio.",
        solutionLabel:"La soluzione", solution:"Definisci una palette di 2–3 colori (uno principale, uno secondario, uno neutro) e usali ovunque, senza eccezioni.",
        tipLabel:"Consiglio pratico", tip:"Scegli i tuoi colori in base all'emozione desiderata, non alle tue preferenze. Annota i codici esatti (es. var(--ds-accent)) per non improvvisare mai." },
      { kicker:"Coerenza", title:"Cambiare stile a ogni post",
        problemLabel:"Il problema", problem:"Un font qui, un filtro diverso lì, un layout diverso ogni volta. Ogni visual sembra provenire da un brand diverso.",
        costLabel:"Perché ti costa clienti", cost:"Senza coerenza, il tuo pubblico non ti riconosce nel feed. Ripetere lo stesso universo visivo è esattamente ciò che crea la sensazione di 'brand serio e affermato'.",
        solutionLabel:"La soluzione", solution:"Crea template riutilizzabili: stessi font, stessi colori, stessi margini. Guadagni tempo E credibilità.",
        tipLabel:"Consiglio pratico", tip:"Guarda i tuoi ultimi 9 post a griglia. Se non sembrano della stessa famiglia, è ora di unificare il tuo stile." },
      { kicker:"Differenziazione", title:"Copiare i concorrenti",
        problemLabel:"Il problema", problem:"Si guarda cosa fa 'il leader del mercato' e si imita, pensando sia una scelta sicura. Si finisce per assomigliare a tutti.",
        costLabel:"Perché ti costa clienti", cost:"Quando tutti i brand si assomigliano, nessuno si nota. Diventi intercambiabile — e il cliente sceglie solo sul prezzo.",
        solutionLabel:"La soluzione", solution:"Identifica ciò che ti rende unico (la tua storia, il tuo tono, la tua specialità) e mettilo in evidenza senza complessi.",
        tipLabel:"Consiglio pratico", tip:"Completa questa frase: 'A differenza degli altri, noi…'. La risposta è il cuore del tuo posizionamento." },
      { kicker:"Qualità", title:"Trascurare la qualità dei visual",
        problemLabel:"Il problema", problem:"Foto sfocate, screenshot pixelati, montaggi frettolosi. 'Andrà bene'… ma non va mai bene.",
        costLabel:"Perché ti costa clienti", cost:"Il cliente giudica la qualità del tuo prodotto o servizio dalla qualità delle tue immagini. Un visual trascurato dà l'impressione di un'offerta trascurata.",
        solutionLabel:"La soluzione", solution:"Investi in visual curati e ad alta risoluzione. È la tua vetrina: lavora per te 24 ore su 24.",
        tipLabel:"Consiglio pratico", tip:"Tre visual eccellenti valgono più di dieci mediocri. La qualità batte sempre la quantità." },
      { kicker:"Emozione", title:"Dimenticare l'emozione e la storia",
        problemLabel:"Il problema", problem:"La comunicazione parla solo di prodotti, prezzi e caratteristiche. Nessuna storia, nessuna emozione, nessun 'perché'.",
        costLabel:"Perché ti costa clienti", cost:"Le persone non comprano un prodotto: comprano ciò che rappresenta e ciò che li fa sentire. Un brand senza narrazione resta freddo e dimenticabile.",
        solutionLabel:"La soluzione", solution:"Racconta il 'perché' del tuo brand: la sua origine, la sua missione, le persone dietro. Questo è ciò che crea l'attaccamento.",
        tipLabel:"Consiglio pratico", tip:"Condividi regolarmente i backstage: il fondatore, la realizzazione, un cliente soddisfatto. L'umano crea la connessione." },
      { kicker:"Brand guidelines", title:"Non avere un'identità scritta",
        problemLabel:"Il problema", problem:"Nessun documento fissa le regole del brand. Ogni nuovo visual, ogni nuovo fornitore riparte da zero e interpreta a modo suo.",
        costLabel:"Perché ti costa clienti", cost:"Senza un quadro di riferimento, la tua immagine si diluisce nel tempo e perde forza. Perdi anche tempo prezioso a ri-spiegare il tuo universo a ogni collaborazione.",
        solutionLabel:"La soluzione", solution:"Crea un mini brand guide: logo e varianti, colori esatti, font, tono di comunicazione.",
        tipLabel:"Consiglio pratico", tip:"Anche una guida di una sola pagina è sufficiente per iniziare. L'importante è che esista e che tutti la seguano." },
    ],
    cta: { title:"Pronto a correggere questi ", highlight:"errori?", lead:"INOV Digital Services supporta i brand nel loro branding, dalla A alla Z. Ci occupiamo di tutto — tu ti concentri sulla tua attività.", chips:["Logo & identità","Packaging","Poster & flyer","Motion design","Siti vetrina","Promozione online"], footer:"© INOV Digital Services — Grazie per la vostra fiducia." },
  },

  de: {
    lang: "de", dir: "ltr",
    badge: "Gratis-Guide",
    printBtn: "Als PDF speichern",
    printHint: "Klicken → 'Als PDF speichern' wählen → 'Hintergrundgrafiken' aktivieren",
    title: "7 Branding-Fehler, die Ihre Kunden vertreiben",
    subtitle: "Der praktische Leitfaden für eine Marke, die Vertrauen weckt — und die beim ersten Blick überzeugt.",
    toc: ["Ein zu komplexes Logo","Farben ohne Konzept","Inkonsistenter Stil","Konkurrenten kopieren","Minderwertige Visuals","Emotion vergessen","Keine schriftliche Identität"],
    stats: [{value:"20+",label:"Marken begleitet"},{value:"80+",label:"Visuals geliefert"},{value:"48h",label:"Lieferzeit"}],
    errors: [
      { kicker:"Das Logo", title:"Ein Logo, das alles sagen will",
        problemLabel:"Das Problem", problem:"Zu viele Details, zu viel Text, komplizierte Verläufe… Viele Marken wollen, dass ihr Logo 'das ganze Unternehmen' in einem Bild erzählt. Das Ergebnis: Es wird unleserlich, sobald es verkleinert wird (Profilbild, Stempel, Etikett).",
        costLabel:"Warum das Kunden kostet", cost:"Ein verwirrendes Logo wirkt unprofessionell und bleibt nicht im Gedächtnis. Wenn Ihre Zielgruppe es nicht in einer Sekunde erkennen kann, wird sie sich nicht an Sie erinnern.",
        solutionLabel:"Die Lösung", solution:"Setzen Sie auf Einfachheit: Ein Logo muss auch bei 16 Pixeln klar und erkennbar bleiben. Testen Sie es klein und in Schwarz-Weiß, bevor Sie es freigeben.",
        tipLabel:"Praktischer Tipp", tip:"Verkleinern Sie Ihr Logo auf die Größe eines App-Icons auf Ihrem Telefon. Wenn es nicht mehr erkennbar ist, vereinfachen Sie es." },
      { kicker:"Farben", title:"Farben gewählt, 'weil wir sie mögen'",
        problemLabel:"Das Problem", problem:"Farben werden nach persönlichem Geschmack gewählt, ohne Logik, und wechseln von Post zu Post. Dabei sendet jede Farbe eine unbewusste Botschaft: Vertrauen, Luxus, Energie, Seriosität…",
        costLabel:"Warum das Kunden kostet", cost:"Inkonsistente Farben verwirren Ihr Image und senden das falsche emotionale Signal. Eine Wellnessmarke, die aggressive Farben verwendet, schreckt zum Beispiel ab, bevor man die Botschaft überhaupt liest.",
        solutionLabel:"Die Lösung", solution:"Definieren Sie eine Palette aus 2–3 Farben (eine Hauptfarbe, eine Sekundärfarbe, eine Neutralfarbe) und verwenden Sie sie überall, ausnahmslos.",
        tipLabel:"Praktischer Tipp", tip:"Wählen Sie Ihre Farben anhand der gewünschten Emotion, nicht nach Ihrem Geschmack. Notieren Sie die genauen Codes (z.B. var(--ds-accent)), um nie improvisieren zu müssen." },
      { kicker:"Konsistenz", title:"Mit jedem Post den Stil wechseln",
        problemLabel:"Das Problem", problem:"Eine Schriftart hier, ein anderer Filter dort, jedes Mal ein anderes Layout. Jedes Visual wirkt, als käme es von einer anderen Marke.",
        costLabel:"Warum das Kunden kostet", cost:"Ohne Konsistenz erkennt Ihre Zielgruppe Sie im Feed nicht. Dieselbe visuelle Welt zu wiederholen ist genau das, was das Gefühl einer 'seriösen, etablierten Marke' erzeugt.",
        solutionLabel:"Die Lösung", solution:"Erstellen Sie wiederverwendbare Vorlagen: dieselben Schriften, dieselben Farben, dieselben Abstände. Sie sparen Zeit UND gewinnen an Glaubwürdigkeit.",
        tipLabel:"Praktischer Tipp", tip:"Schauen Sie sich Ihre letzten 9 Posts in der Rasteransicht an. Wenn sie nicht wie eine Familie aussehen, ist es Zeit, Ihren Stil zu vereinheitlichen." },
      { kicker:"Differenzierung", title:"Die Konkurrenz kopieren",
        problemLabel:"Das Problem", problem:"Man schaut, was der 'Marktführer' macht, und ahmt es nach, weil man das für eine sichere Wahl hält. Man sieht am Ende aus wie alle anderen.",
        costLabel:"Warum das Kunden kostet", cost:"Wenn alle Marken gleich aussehen, fällt keine auf. Sie werden austauschbar — und der Kunde wählt nur nach dem Preis.",
        solutionLabel:"Die Lösung", solution:"Identifizieren Sie, was Sie einzigartig macht (Ihre Geschichte, Ihr Ton, Ihre Spezialität) und stellen Sie es ohne Scheu in den Vordergrund.",
        tipLabel:"Praktischer Tipp", tip:"Vervollständigen Sie diesen Satz: 'Im Gegensatz zu anderen sind wir…'. Die Antwort ist das Herzstück Ihrer Positionierung." },
      { kicker:"Qualität", title:"Die Qualität der Visuals vernachlässigen",
        problemLabel:"Das Problem", problem:"Unscharfe Fotos, verpixelte Screenshots, hastige Montagen. 'Das reicht schon'… aber es reicht nie.",
        costLabel:"Warum das Kunden kostet", cost:"Kunden beurteilen die Qualität Ihres Produkts oder Ihrer Dienstleistung an der Qualität Ihrer Bilder. Ein nachlässiges Visual erweckt den Eindruck eines nachlässigen Angebots.",
        solutionLabel:"Die Lösung", solution:"Investieren Sie in gepflegte, hochauflösende Visuals. Es ist Ihr Schaufenster: Es arbeitet 24 Stunden am Tag für Sie.",
        tipLabel:"Praktischer Tipp", tip:"Drei hervorragende Visuals sind mehr wert als zehn mittelmäßige. Qualität schlägt immer Quantität." },
      { kicker:"Emotion", title:"Emotion und Geschichte vergessen",
        problemLabel:"Das Problem", problem:"Die Kommunikation spricht nur über Produkte, Preise und Eigenschaften. Keine Geschichte, keine Emotion, kein 'Warum'.",
        costLabel:"Warum das Kunden kostet", cost:"Menschen kaufen kein Produkt: Sie kaufen, was es repräsentiert und was es ihnen gibt. Eine Marke ohne Erzählung bleibt kalt und vergesslich.",
        solutionLabel:"Die Lösung", solution:"Erzählen Sie das 'Warum' Ihrer Marke: ihre Entstehung, ihre Mission, die Menschen dahinter. Das schafft Bindung.",
        tipLabel:"Praktischer Tipp", tip:"Teilen Sie regelmäßig Einblicke hinter die Kulissen: den Gründer, die Entstehung, einen zufriedenen Kunden. Das Menschliche schafft Verbindung." },
      { kicker:"Brand Guide", title:"Keine schriftliche Identität haben",
        problemLabel:"Das Problem", problem:"Kein Dokument legt die Regeln der Marke fest. Jedes neue Visual, jeder neue Dienstleister fängt bei null an und interpretiert auf seine eigene Weise.",
        costLabel:"Warum das Kunden kostet", cost:"Ohne Rahmen verwässert Ihr Image mit der Zeit und verliert an Stärke. Sie verlieren auch wertvolle Zeit damit, Ihr Universum bei jeder Zusammenarbeit neu zu erklären.",
        solutionLabel:"Die Lösung", solution:"Erstellen Sie einen Mini-Brand-Guide: Logo und Varianten, genaue Farben, Schriften, Kommunikationston.",
        tipLabel:"Praktischer Tipp", tip:"Selbst ein einseitiger Guide reicht zum Anfang. Das Wichtigste ist, dass er existiert und alle ihn befolgen." },
    ],
    cta: { title:"Bereit, diese ", highlight:"Fehler zu beheben?", lead:"INOV Digital Services begleitet Marken bei ihrem Branding, von A bis Z. Wir kümmern uns um alles — Sie konzentrieren sich auf Ihr Geschäft.", chips:["Logo & Identität","Packaging","Plakate & Flyer","Motion Design","Webseiten","Online-Werbung"], footer:"© INOV Digital Services — Vielen Dank für Ihr Vertrauen." },
  },

  ar: {
    lang: "ar", dir: "rtl",
    badge: "دليل مجاني",
    printBtn: "حفظ بصيغة PDF",
    printHint: "انقر → اختر 'حفظ بصيغة PDF' → فعّل 'رسومات الخلفية'",
    title: "7 أخطاء في العلامة التجارية تُنفّر عملاءك",
    subtitle: "الدليل العملي لبناء علامة تجارية تُلهم الثقة — وتبيع، من النظرة الأولى.",
    toc: ["شعار معقد للغاية","ألوان عشوائية","أسلوب غير متسق","تقليد المنافسين","مرئيات رديئة الجودة","نسيان العاطفة","لا هوية مكتوبة"],
    stats: [{value:"20+",label:"علامة تجارية مدعومة"},{value:"80+",label:"مرئي تم تسليمه"},{value:"48h",label:"وقت التسليم"}],
    errors: [
      { kicker:"الشعار", title:"شعار يحاول قول كل شيء",
        problemLabel:"المشكلة", problem:"تفاصيل كثيرة جداً، نص كثير، تدرجات معقدة… تريد كثير من العلامات التجارية أن يحكي شعارها 'قصة الشركة كلها' في صورة واحدة. النتيجة: يصبح غير مقروء عند التصغير (صورة الملف الشخصي، الختم، الملصق).",
        costLabel:"لماذا يُكلّفك عملاء", cost:"الشعار المربك يبدو غير احترافي ولا يظل في الذاكرة. إذا لم يتمكن جمهورك من التعرف عليه في ثانية، فلن يتذكرك.",
        solutionLabel:"الحل", solution:"استهدف البساطة: يجب أن يبقى الشعار واضحاً وقابلاً للتمييز حتى بحجم 16 بكسل. اختبره بحجم صغير وبالأبيض والأسود قبل اعتماده.",
        tipLabel:"نصيحة عملية", tip:"قلّص شعارك إلى حجم أيقونة التطبيق على هاتفك. إذا لم تعد تتعرف عليه، فبسّطه." },
      { kicker:"الألوان", title:"ألوان تُختار 'لأننا نحبها'",
        problemLabel:"المشكلة", problem:"تُختار الألوان وفق الذوق الشخصي، دون منطق، وتتغير من منشور لآخر. مع ذلك، كل لون يرسل رسالة لاواعية: ثقة، فخامة، طاقة، جدية…",
        costLabel:"لماذا يُكلّفك عملاء", cost:"الألوان غير المتسقة تُشوّش صورتك وترسل الإشارة العاطفية الخاطئة. علامة العافية التي تستخدم ألواناً صارخة، مثلاً، تُنفّر قبل أن يقرأ أحد الرسالة.",
        solutionLabel:"الحل", solution:"حدّد لوحة من 2-3 ألوان (رئيسي وثانوي ومحايد) واستخدمها في كل مكان، دون استثناء.",
        tipLabel:"نصيحة عملية", tip:"اختر ألوانك بناءً على المشاعر التي تريد إيصالها، لا وفق تفضيلاتك. سجّل رموزها الدقيقة (مثل var(--ds-accent)) حتى لا تضطر للارتجال." },
      { kicker:"الاتساق", title:"تغيير الأسلوب مع كل منشور",
        problemLabel:"المشكلة", problem:"خط هنا، فلتر مختلف هناك، تصميم مختلف في كل مرة. كل مرئي يبدو وكأنه من علامة تجارية مختلفة.",
        costLabel:"لماذا يُكلّفك عملاء", cost:"بدون اتساق، لن يتعرف جمهورك عليك في الخلاصة. تكرار نفس العالم البصري هو بالضبط ما يخلق إحساس 'العلامة الجادة والراسخة'.",
        solutionLabel:"الحل", solution:"أنشئ قوالب قابلة للاستخدام المتكرر: نفس الخطوط، نفس الألوان، نفس الهوامش. توفر الوقت وتكسب المصداقية.",
        tipLabel:"نصيحة عملية", tip:"انظر إلى آخر 9 منشورات لك في عرض الشبكة. إذا لم تبدُ كعائلة واحدة، حان وقت توحيد أسلوبك." },
      { kicker:"التميّز", title:"تقليد المنافسين",
        problemLabel:"المشكلة", problem:"تنظر إلى ما يفعله 'رائد السوق' وتقلده، ظناً منك أنه خيار آمن. فتنتهي وأنت تشبه الجميع.",
        costLabel:"لماذا يُكلّفك عملاء", cost:"عندما تتشابه كل العلامات التجارية، لا تبرز أي منها. تصبح قابلاً للاستبدال — ويختار العميل فقط بناءً على السعر.",
        solutionLabel:"الحل", solution:"حدّد ما يجعلك فريداً (قصتك، أسلوبك، تخصصك) وأبرزه بثقة.",
        tipLabel:"نصيحة عملية", tip:"أكمل هذه الجملة: 'على عكس الآخرين، نحن…'. الإجابة هي جوهر تموضعك." },
      { kicker:"الجودة", title:"إهمال جودة المرئيات",
        problemLabel:"المشكلة", problem:"صور ضبابية، لقطات شاشة مُتقطّعة، مونتاج متسرع. 'ستكفي'… لكنها لا تكفي أبداً.",
        costLabel:"لماذا يُكلّفك عملاء", cost:"يحكم العميل على جودة منتجك أو خدمتك من خلال جودة صورك. المرئي المهمل يعطي انطباعاً بعرض مهمل.",
        solutionLabel:"الحل", solution:"استثمر في مرئيات مصقولة وعالية الدقة. إنها واجهتك: تعمل لصالحك 24 ساعة في اليوم.",
        tipLabel:"نصيحة عملية", tip:"ثلاثة مرئيات ممتازة تساوي أكثر من عشرة متوسطة. الجودة تتفوق دائماً على الكمية." },
      { kicker:"العاطفة", title:"نسيان العاطفة والقصة",
        problemLabel:"المشكلة", problem:"التواصل يتحدث فقط عن المنتجات والأسعار والمميزات. لا قصة، لا عاطفة، لا 'لماذا'.",
        costLabel:"لماذا يُكلّفك عملاء", cost:"الناس لا يشترون منتجاً: يشترون ما يمثله وما يشعرون به. العلامة التجارية بدون سرد تبقى باردة ومنسية.",
        solutionLabel:"الحل", solution:"احكِ 'لماذا' علامتك التجارية: أصلها، مهمتها، الأشخاص وراءها. هذا ما يخلق الارتباط.",
        tipLabel:"نصيحة عملية", tip:"شارك الكواليس بانتظام: المؤسس، التصنيع، عميل سعيد. الإنسان يخلق التواصل." },
      { kicker:"دليل العلامة", title:"عدم وجود هوية مكتوبة",
        problemLabel:"المشكلة", problem:"لا يوجد مستند يحدد قواعد العلامة التجارية. كل مرئي جديد، كل مورد جديد يبدأ من الصفر ويفسّر بطريقته.",
        costLabel:"لماذا يُكلّفك عملاء", cost:"بدون إطار، تتخفف صورتك بمرور الوقت وتفقد قوتها. كما تضيع وقتاً ثميناً في إعادة شرح عالمك مع كل تعاون.",
        solutionLabel:"الحل", solution:"أنشئ دليل علامة تجارية مصغراً: الشعار وتنويعاته، الألوان الدقيقة، الخطوط، نبرة التواصل.",
        tipLabel:"نصيحة عملية", tip:"حتى دليل من صفحة واحدة كافٍ للبداية. المهم أن يوجد وأن يتبعه الجميع." },
    ],
    cta: { title:"مستعد لتصحيح هذه ", highlight:"الأخطاء؟", lead:"INOV Digital Services ترافق العلامات التجارية في برندنغها من الألف إلى الياء. نتولى كل شيء — أنت تركّز على نشاطك.", chips:["الشعارات والهوية","التغليف","الملصقات والمنشورات","موشن ديزاين","المواقع الإلكترونية","الترويج الإلكتروني"], footer:"© INOV Digital Services — شكراً لثقتكم." },
  },
}

const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" style="width:17px;height:17px;vertical-align:-3px;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`

// Demonstrative icons (one per branding mistake) — Lucide-style line icons.
const IC = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;">${paths}</svg>`
const ERROR_ICONS = [
  IC(`<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>`), // logo — pen tool
  IC(`<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`), // colours — palette
  IC(`<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`), // consistency — layers
  IC(`<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`), // differentiation — compass
  IC(`<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`), // quality — image
  IC(`<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>`), // emotion — heart
  IC(`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`), // guidelines — book
]

function buildGuidePages(d: GuideData, assetOrigin?: string): string {
  const origin = assetOrigin ?? window.location.origin
  const logoLight = `${origin}/guide-logo-light.webp`
  const logoDark = `${origin}/guide-logo-dark.webp`

  const errorPages = d.errors.map((e, i) => {
    const num = String(i + 1).padStart(2, "0")
    return `
    <section class="page">
      <div class="err">
        <div class="err-num">${num}</div>
        <div class="err-head">
          <img class="content-logo" src="${logoDark}" alt="INOV Digital Services" />
          <div class="err-pill">${d.errors.length > 1 ? `${num} / 0${d.errors.length}` : num}</div>
        </div>
        <div class="err-icon">${ERROR_ICONS[i] ?? ERROR_ICONS[0]}</div>
        <div class="err-kicker">${e.kicker}</div>
        <h2>${e.title}</h2>
        <div class="block"><div class="label">${e.problemLabel}</div><p>${e.problem}</p></div>
        <div class="block"><div class="label cost">${e.costLabel}</div><p>${e.cost}</p></div>
        <div class="solution"><div class="label">${e.solutionLabel}</div><p>${e.solution}</p></div>
        <div class="tip"><div class="bulb"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg></div><div><div class="label">${e.tipLabel}</div><p>${e.tip}</p></div></div>
        <div class="err-foot"><span>INOV Digital Services</span><span>${num}</span></div>
      </div>
    </section>`
  }).join("\n")

  const chips = d.cta.chips.map(c => `<span class="chip">${c}</span>`).join("")
  const tocItems = d.toc.map((t, i) => `<li><b>0${i + 1}</b> ${t}</li>`).join("")
  const statsHtml = d.stats.map(s => `<div class="s"><b>${s.value}</b><span>${s.label}</span></div>`).join("")

  return `
<section class="page">
  <div class="cover">
    <div class="num">7</div>
    <img class="brand-logo" src="${logoLight}" alt="INOV Digital Services"/>
    <div style="margin-top:56px;">
      <div class="accent-line" style="margin-bottom:22px;"></div>
      <div class="kicker" style="margin-bottom:16px;">${d.badge}</div>
      <h1>${d.title}</h1>
      <p class="lead" style="margin-top:22px;">${d.subtitle}</p>
    </div>
    <div class="stats" style="margin-top:40px;">${statsHtml}</div>
    <div class="toc" style="margin-top:44px;padding-top:28px;">
      <div class="toc-title">${d.lang === "ar" ? "المحتويات" : d.lang === "de" ? "Inhalt" : d.lang === "it" ? "Sommario" : d.lang === "pt" ? "Índice" : d.lang === "ht" ? "Kontni" : d.lang === "es" ? "Contenido" : d.lang === "en" ? "Contents" : "Au sommaire"}</div>
      <ol>${tocItems}</ol>
    </div>
    <div class="cover-foot" style="margin-top:auto;padding-top:40px;">
      <span class="row">${WA_SVG} +509 3625-5920</span>
    </div>
  </div>
</section>

${errorPages}

<section class="page">
  <div class="final">
    <div class="num">✓</div>
    <img class="brand-logo" src="${logoLight}" alt="INOV Digital Services" style="margin-bottom:56px;"/>
    <div class="accent-line" style="margin-bottom:24px;"></div>
    <h3>${d.cta.title}<span>${d.cta.highlight}</span></h3>
    <p class="lead">${d.cta.lead}</p>
    <div class="services">${chips}</div>
    <div class="contacts">
      <span class="row">${WA_SVG} WhatsApp <span>&nbsp;+509 3625-5920</span></span>
    </div>
    <div class="final-foot">${d.cta.footer}</div>
  </div>
</section>`
}

const GUIDE_CSS = `
:root{--orange:var(--ds-accent);--red:var(--ds-accent-hover);--ink:#16161c;--black:#0b0b0f;--muted:#4a4a58;--soft:#f6f6f9;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:#e9e9ef;}
body{font-family:'Outfit',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:24px;}
.toolbar{max-width:794px;margin:0 auto 24px;background:#fff;border-radius:16px;padding:20px 28px;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;box-shadow:0 4px 20px rgba(0,0,0,.10);}
.toolbar-text{display:flex;flex-direction:column;gap:3px;}
.toolbar-text strong{font-size:15px;font-weight:800;color:var(--ink);}
.toolbar-text span{font-size:13px;color:#5f5f6b;}
.toolbar button{font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;color:#fff;cursor:pointer;border:none;border-radius:12px;padding:14px 28px;background:linear-gradient(135deg,var(--orange),var(--red));display:inline-flex;align-items:center;gap:8px;white-space:nowrap;box-shadow:0 4px 16px rgba(247,96,27,.35);}
.toolbar button:hover{opacity:0.9;}
.page{width:794px;height:1123px;margin:0 auto 24px;background:#fff;position:relative;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.14);display:flex;flex-direction:column;}
.brand-logo{height:58px;width:172px;object-fit:contain;display:block;}
.content-logo{height:30px;width:89px;object-fit:contain;display:block;}
.icon{width:17px;height:17px;vertical-align:-3px;flex-shrink:0;}
.row{display:inline-flex;align-items:center;gap:9px;}
.cover{background:radial-gradient(120% 85% at 100% 0%,rgba(247,96,27,.30) 0%,rgba(247,96,27,0) 55%),var(--black);color:#fff;padding:76px 64px 60px;flex:1;display:flex;flex-direction:column;}
.cover .num{position:absolute;right:-30px;top:20px;font-size:440px;font-weight:900;color:rgba(247,96,27,.15);line-height:1;pointer-events:none;}
.accent-line{width:64px;height:5px;border-radius:5px;background:linear-gradient(135deg,var(--orange),var(--red));}
.cover .kicker{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);}
.cover h1{font-size:52px;font-weight:900;line-height:1.05;letter-spacing:-.02em;max-width:14ch;}
.cover .lead{font-size:17px;font-weight:500;line-height:1.6;color:rgba(255,255,255,.78);max-width:48ch;}
.toc{border-top:1px solid rgba(255,255,255,.14);}
.toc-title{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:16px;}
.toc ol{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:11px 40px;}
.toc li{display:flex;align-items:baseline;gap:12px;font-size:14px;font-weight:600;color:rgba(255,255,255,.9);}
.toc li b{color:var(--orange);font-weight:800;font-family:'Space Grotesk',sans-serif;}
.stats{display:flex;gap:34px;}
.stats .s b{display:block;font-size:30px;font-weight:900;color:var(--orange);line-height:1;}
.stats .s span{font-size:12.5px;color:rgba(255,255,255,.6);font-weight:500;}
.cover-foot{display:flex;gap:26px;flex-wrap:wrap;font-size:14px;font-weight:600;color:rgba(255,255,255,.8);}
.err{padding:56px 64px 40px;flex:1;display:flex;flex-direction:column;}
.err-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;}
.err-pill{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:var(--orange);background:rgba(247,96,27,.10);border:1px solid rgba(247,96,27,.28);padding:6px 14px;border-radius:100px;letter-spacing:.04em;}
.err-num{position:absolute;right:30px;top:96px;font-size:300px;font-weight:900;color:rgba(247,96,27,.06);line-height:1;pointer-events:none;}
.err-icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--orange),var(--red));color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:18px;box-shadow:0 8px 20px rgba(247,96,27,.32);position:relative;z-index:1;}
.err-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--orange);margin-bottom:10px;}
.err h2{font-size:38px;font-weight:900;line-height:1.08;letter-spacing:-.015em;max-width:15ch;margin-bottom:36px;}
.block{margin-bottom:26px;position:relative;z-index:1;}
.block .label{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);margin-bottom:8px;}
.block .label.cost{color:var(--red);}
.block p{font-size:15.5px;line-height:1.68;color:var(--muted);max-width:60ch;}
.solution{background:var(--soft);border-left:4px solid var(--orange);border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:22px;position:relative;z-index:1;}
.solution .label{color:var(--orange);}
.solution p{color:var(--ink);font-weight:600;font-size:15.5px;line-height:1.6;}
.tip{margin-top:auto;background:var(--black);color:#fff;border-radius:14px;padding:22px 26px;display:flex;gap:16px;align-items:flex-start;}
.tip .bulb{width:26px;height:26px;color:var(--orange);flex-shrink:0;}
.tip .label{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);margin-bottom:5px;}
.tip p{font-size:14.5px;line-height:1.6;color:rgba(255,255,255,.82);}
.err-foot{display:flex;align-items:center;justify-content:space-between;margin-top:26px;padding-top:16px;border-top:1px solid rgba(0,0,0,.08);font-size:12px;color:#8a8a96;font-weight:500;}
.final{background:var(--black);color:#fff;flex:1;padding:90px 64px;display:flex;flex-direction:column;}
.final .num{position:absolute;left:-40px;bottom:-60px;font-size:420px;font-weight:900;color:rgba(247,96,27,.10);line-height:1;pointer-events:none;}
.final h3{font-size:46px;font-weight:900;line-height:1.06;letter-spacing:-.02em;margin-bottom:20px;max-width:16ch;}
.final h3 span{background:linear-gradient(135deg,var(--orange),#ff8a4c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.final .lead{font-size:18px;line-height:1.65;color:rgba(255,255,255,.78);max-width:52ch;margin-bottom:34px;}
.final .services{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:40px;}
.final .chip{font-size:14px;font-weight:600;color:#fff;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);padding:9px 16px;border-radius:100px;}
.final .contacts{display:flex;flex-direction:column;gap:14px;font-size:17px;font-weight:700;}
.final .contacts span{color:#ff8a4c;}
.final-foot{margin-top:auto;font-size:13px;color:rgba(255,255,255,.5);}
@page{size:A4;margin:0;}
@media print{body{padding:0;background:#fff;}.toolbar{display:none;}.page{box-shadow:none;margin:0;width:100%;height:100vh;page-break-after:always;}.page:last-child{page-break-after:auto;}}`

// Full standalone HTML document (used by the "open in tab" fallback and by the
// static-PDF build script — pass `assetOrigin` when rendering outside the browser).
function buildGuideHTML(d: GuideData, assetOrigin?: string): string {
  return `<!doctype html>
<html lang="${d.lang}" dir="${d.dir}">
<head>
<meta charset="UTF-8"/>
<title>INOV — ${d.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${GUIDE_CSS}</style>
</head>
<body>
${buildGuidePages(d, assetOrigin)}
</body>
</html>`
}

// Exposed for the offline static-PDF generator (scripts/gen-guide-pdfs.mjs).
export { DATA, GUIDE_CSS, buildGuideHTML }
export type { GuideData }

// Immediate PDF download (no print dialog) — jsPDF + html2canvas.
export async function downloadGuidePDF(lang: Lang): Promise<void> {
  const d = DATA[lang] ?? DATA.fr
  await downloadHtmlPagesAsPdf(
    buildGuidePages(d),
    GUIDE_CSS,
    `Guide-INOV-7-erreurs-branding-${lang}.pdf`,
  )
}

export function openGuidePDF(lang: Lang): void {
  const d = DATA[lang] ?? DATA.fr
  const html = buildGuideHTML(d)
  const win = window.open("", "_blank")
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}
