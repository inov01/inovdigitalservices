import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router"
import type { Session } from "@supabase/supabase-js"
import {
  ArrowLeft, LogOut, Copy, Check, Gift, Users, Package,
  Loader2, Share2, Images, Search, Play,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"
import { useSessionTimeout, CLIENT_SESSION_POLICY } from "../hooks/useSessionTimeout"
import { useSettings } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import {
  accountsApi, type Profile, type AccountOrder, type ReferralRow, type ReferralStats,
} from "../lib/accounts"
import { albums, workPoster } from "../data/portfolio"
import SmartImage from "../components/SmartImage"

type Copy = {
  back: string
  title: string; sub: string
  login: string; signup: string; loginTab: string; signupTab: string
  name: string; email: string; password: string
  toLogin: string; toSignup: string
  checkEmail: string; logout: string; hi: string
  ambTitle: string; ambDesc: string; ambCta: string; ambActive: string
  yourLink: string; linkHint: string; copied: string; share: string
  statOrders: string; statReferred: string; statConfirmed: string; statCredit: string
  ordersTitle: string; ordersEmpty: string
  refTitle: string; refEmpty: string
  colDate: string; colSource: string; colStatus: string; colTotal: string
  loading: string; err: string
  forgot: string; resetTitle: string; resetSub: string; sendReset: string; resetSent: string
  newPassword: string; savePassword: string; pwUpdated: string; backToLogin: string
}

const COPY: Record<Lang, Copy> = {
  fr: {
    back: "Retour au site",
    title: "Mon espace", sub: "Suivez vos demandes et gérez votre programme ambassadeur.",
    login: "Se connecter", signup: "Créer un compte", loginTab: "Connexion", signupTab: "Inscription",
    name: "Nom complet", email: "E-mail", password: "Mot de passe",
    toLogin: "Déjà un compte ? Se connecter", toSignup: "Pas encore de compte ? S'inscrire",
    checkEmail: "Bienvenue chez INOV Digital Services{name} ! Votre compte a bien été créé. Vérifiez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.",
    logout: "Déconnexion", hi: "Bonjour",
    ambTitle: "Devenez ambassadeur", ambDesc: "Recommandez INOV avec votre lien unique. Chaque commande confirmée d'un filleul vous rapporte un crédit.",
    ambCta: "Activer mon lien de parrainage", ambActive: "Programme ambassadeur activé",
    yourLink: "Votre lien de parrainage", linkHint: "Partagez ce lien : toute personne qui vous suit est automatiquement rattachée à votre compte.",
    copied: "Copié !", share: "Partager",
    statOrders: "Mes demandes", statReferred: "Filleuls", statConfirmed: "Confirmés", statCredit: "Crédit gagné",
    ordersTitle: "Mes demandes & commandes", ordersEmpty: "Aucune demande pour l'instant. Vos devis et paiements apparaîtront ici.",
    refTitle: "Mes filleuls", refEmpty: "Aucun filleul pour l'instant. Partagez votre lien pour commencer.",
    colDate: "Date", colSource: "Type", colStatus: "Statut", colTotal: "Montant",
    loading: "Chargement…", err: "Une erreur est survenue. Réessayez.",
    forgot: "Mot de passe oublié ?", resetTitle: "Réinitialiser le mot de passe",
    resetSub: "Entrez votre e-mail : nous vous enverrons un lien pour créer un nouveau mot de passe.",
    sendReset: "Envoyer le lien", resetSent: "Si un compte INOV Digital Services existe pour cet e-mail, un lien de réinitialisation vient de vous être envoyé. Vérifiez votre boîte de réception.",
    newPassword: "Nouveau mot de passe", savePassword: "Enregistrer le mot de passe",
    pwUpdated: "Mot de passe mis à jour ✓ Vous êtes connecté.", backToLogin: "Retour à la connexion",
  },
  en: {
    back: "Back to site",
    title: "My account", sub: "Track your requests and manage your ambassador program.",
    login: "Log in", signup: "Create account", loginTab: "Log in", signupTab: "Sign up",
    name: "Full name", email: "Email", password: "Password",
    toLogin: "Already have an account? Log in", toSignup: "No account yet? Sign up",
    checkEmail: "Welcome to INOV Digital Services{name}! Your account has been created. Check your inbox to confirm your address, then log in.",
    logout: "Log out", hi: "Hello",
    ambTitle: "Become an ambassador", ambDesc: "Recommend INOV with your unique link. Every confirmed order from a referral earns you a credit.",
    ambCta: "Activate my referral link", ambActive: "Ambassador program active",
    yourLink: "Your referral link", linkHint: "Share this link: anyone who follows it is automatically tied to your account.",
    copied: "Copied!", share: "Share",
    statOrders: "My requests", statReferred: "Referrals", statConfirmed: "Confirmed", statCredit: "Earned credit",
    ordersTitle: "My requests & orders", ordersEmpty: "No requests yet. Your quotes and payments will show up here.",
    refTitle: "My referrals", refEmpty: "No referrals yet. Share your link to get started.",
    colDate: "Date", colSource: "Type", colStatus: "Status", colTotal: "Amount",
    loading: "Loading…", err: "Something went wrong. Please try again.",
    forgot: "Forgot password?", resetTitle: "Reset your password",
    resetSub: "Enter your email and we'll send you a link to create a new password.",
    sendReset: "Send the link", resetSent: "If an INOV Digital Services account exists for this email, a reset link has just been sent to you. Check your inbox.",
    newPassword: "New password", savePassword: "Save password",
    pwUpdated: "Password updated ✓ You're now signed in.", backToLogin: "Back to sign in",
  },
  es: {
    back: "Volver al sitio",
    title: "Mi cuenta", sub: "Sigue tus solicitudes y gestiona tu programa de embajador.",
    login: "Iniciar sesión", signup: "Crear cuenta", loginTab: "Iniciar sesión", signupTab: "Registrarse",
    name: "Nombre completo", email: "Correo", password: "Contraseña",
    toLogin: "¿Ya tienes cuenta? Inicia sesión", toSignup: "¿Sin cuenta? Regístrate",
    checkEmail: "¡Bienvenido a INOV Digital Services{name}! Tu cuenta ha sido creada. Revisa tu correo para confirmar tu dirección y luego inicia sesión.",
    logout: "Cerrar sesión", hi: "Hola",
    ambTitle: "Conviértete en embajador", ambDesc: "Recomienda INOV con tu enlace único. Cada pedido confirmado de un referido te da un crédito.",
    ambCta: "Activar mi enlace", ambActive: "Programa de embajador activo",
    yourLink: "Tu enlace de referido", linkHint: "Comparte este enlace: quien lo use quedará vinculado a tu cuenta.",
    copied: "¡Copiado!", share: "Compartir",
    statOrders: "Mis solicitudes", statReferred: "Referidos", statConfirmed: "Confirmados", statCredit: "Crédito ganado",
    ordersTitle: "Mis solicitudes y pedidos", ordersEmpty: "Aún no hay solicitudes. Tus presupuestos y pagos aparecerán aquí.",
    refTitle: "Mis referidos", refEmpty: "Aún no hay referidos. Comparte tu enlace para empezar.",
    colDate: "Fecha", colSource: "Tipo", colStatus: "Estado", colTotal: "Importe",
    loading: "Cargando…", err: "Ocurrió un error. Inténtalo de nuevo.",
    forgot: "¿Olvidaste tu contraseña?", resetTitle: "Restablecer la contraseña",
    resetSub: "Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.",
    sendReset: "Enviar el enlace", resetSent: "Si existe una cuenta de INOV Digital Services con este correo, acabamos de enviarte un enlace de restablecimiento. Revisa tu bandeja.",
    newPassword: "Nueva contraseña", savePassword: "Guardar la contraseña",
    pwUpdated: "Contraseña actualizada ✓ Ya iniciaste sesión.", backToLogin: "Volver al inicio de sesión",
  },
  ht: {
    back: "Retounen sou sit la",
    title: "Espas mwen", sub: "Swiv demann ou yo epi jere pwogram anbasadè ou.",
    login: "Konekte", signup: "Kreye yon kont", loginTab: "Koneksyon", signupTab: "Enskripsyon",
    name: "Non konplè", email: "Imèl", password: "Modpas",
    toLogin: "Gen yon kont deja? Konekte", toSignup: "Poko gen kont? Enskri",
    checkEmail: "Byenveni nan INOV Digital Services{name} ! Kont ou kreye. Tcheke bwat imèl ou pou konfime adrès ou, apre sa konekte.",
    logout: "Dekonekte", hi: "Bonjou",
    ambTitle: "Vin yon anbasadè", ambDesc: "Rekòmande INOV ak lyen inik ou. Chak kòmand konfime yon filyèl fè ou genyen yon kredi.",
    ambCta: "Aktive lyen parennaj mwen", ambActive: "Pwogram anbasadè aktive",
    yourLink: "Lyen parennaj ou", linkHint: "Pataje lyen sa a: nenpòt moun ki swiv li ap ratache ak kont ou otomatikman.",
    copied: "Kopye!", share: "Pataje",
    statOrders: "Demann mwen", statReferred: "Filyèl", statConfirmed: "Konfime", statCredit: "Kredi genyen",
    ordersTitle: "Demann & kòmand mwen", ordersEmpty: "Poko gen demann. Devi ak peman ou ap parèt isit la.",
    refTitle: "Filyèl mwen", refEmpty: "Poko gen filyèl. Pataje lyen ou pou kòmanse.",
    colDate: "Dat", colSource: "Tip", colStatus: "Estati", colTotal: "Montan",
    loading: "Ap chaje…", err: "Gen yon erè. Eseye ankò.",
    forgot: "Ou bliye modpas ou ?", resetTitle: "Reyinisyalize modpas ou",
    resetSub: "Mete imèl ou : n ap voye yon lyen pou w kreye yon nouvo modpas.",
    sendReset: "Voye lyen an", resetSent: "Si gen yon kont INOV Digital Services pou imèl sa a, nou fèk voye yon lyen reyinisyalizasyon ba ou. Tcheke bwat resepsyon ou.",
    newPassword: "Nouvo modpas", savePassword: "Anrejistre modpas la",
    pwUpdated: "Modpas chanje ✓ Ou konekte kounye a.", backToLogin: "Tounen nan koneksyon",
  },
  pt: {
    back: "Voltar ao site",
    title: "Minha conta", sub: "Acompanhe seus pedidos e gerencie seu programa de embaixador.",
    login: "Entrar", signup: "Criar conta", loginTab: "Entrar", signupTab: "Cadastrar",
    name: "Nome completo", email: "E-mail", password: "Senha",
    toLogin: "Já tem conta? Entre", toSignup: "Sem conta? Cadastre-se",
    checkEmail: "Bem-vindo à INOV Digital Services{name}! A sua conta foi criada. Verifique o seu e-mail para confirmar o endereço e depois entre.",
    logout: "Sair", hi: "Olá",
    ambTitle: "Torne-se embaixador", ambDesc: "Indique a INOV com seu link único. Cada pedido confirmado de um indicado gera um crédito.",
    ambCta: "Ativar meu link de indicação", ambActive: "Programa de embaixador ativo",
    yourLink: "Seu link de indicação", linkHint: "Compartilhe este link: quem o seguir será vinculado à sua conta.",
    copied: "Copiado!", share: "Compartilhar",
    statOrders: "Meus pedidos", statReferred: "Indicados", statConfirmed: "Confirmados", statCredit: "Crédito ganho",
    ordersTitle: "Meus pedidos", ordersEmpty: "Nenhum pedido ainda. Seus orçamentos e pagamentos aparecerão aqui.",
    refTitle: "Meus indicados", refEmpty: "Nenhum indicado ainda. Compartilhe seu link para começar.",
    colDate: "Data", colSource: "Tipo", colStatus: "Status", colTotal: "Valor",
    loading: "Carregando…", err: "Algo deu errado. Tente novamente.",
    forgot: "Esqueceu a senha?", resetTitle: "Redefinir a senha",
    resetSub: "Digite seu e-mail e enviaremos um link para criar uma nova senha.",
    sendReset: "Enviar o link", resetSent: "Se existir uma conta INOV Digital Services para este e-mail, um link de redefinição acabou de lhe ser enviado. Verifique sua caixa de entrada.",
    newPassword: "Nova senha", savePassword: "Salvar a senha",
    pwUpdated: "Senha atualizada ✓ Você já está conectado.", backToLogin: "Voltar ao login",
  },
  it: {
    back: "Torna al sito",
    title: "Il mio spazio", sub: "Segui le tue richieste e gestisci il tuo programma ambasciatore.",
    login: "Accedi", signup: "Crea account", loginTab: "Accedi", signupTab: "Registrati",
    name: "Nome completo", email: "E-mail", password: "Password",
    toLogin: "Hai già un account? Accedi", toSignup: "Nessun account? Registrati",
    checkEmail: "Benvenuto in INOV Digital Services{name}! Il tuo account è stato creato. Controlla l'e-mail per confermare l'indirizzo, poi accedi.",
    logout: "Esci", hi: "Ciao",
    ambTitle: "Diventa ambasciatore", ambDesc: "Consiglia INOV con il tuo link unico. Ogni ordine confermato di un segnalato ti dà un credito.",
    ambCta: "Attiva il mio link", ambActive: "Programma ambasciatore attivo",
    yourLink: "Il tuo link di segnalazione", linkHint: "Condividi questo link: chi lo segue viene collegato al tuo account.",
    copied: "Copiato!", share: "Condividi",
    statOrders: "Le mie richieste", statReferred: "Segnalati", statConfirmed: "Confermati", statCredit: "Credito guadagnato",
    ordersTitle: "Le mie richieste e ordini", ordersEmpty: "Nessuna richiesta. I tuoi preventivi e pagamenti appariranno qui.",
    refTitle: "I miei segnalati", refEmpty: "Nessun segnalato. Condividi il tuo link per iniziare.",
    colDate: "Data", colSource: "Tipo", colStatus: "Stato", colTotal: "Importo",
    loading: "Caricamento…", err: "Si è verificato un errore. Riprova.",
    forgot: "Password dimenticata?", resetTitle: "Reimposta la password",
    resetSub: "Inserisci la tua e-mail e ti invieremo un link per creare una nuova password.",
    sendReset: "Invia il link", resetSent: "Se esiste un account INOV Digital Services per questa e-mail, ti abbiamo appena inviato un link di reimpostazione. Controlla la posta.",
    newPassword: "Nuova password", savePassword: "Salva la password",
    pwUpdated: "Password aggiornata ✓ Ora sei connesso.", backToLogin: "Torna all'accesso",
  },
  de: {
    back: "Zurück zur Website",
    title: "Mein Bereich", sub: "Verfolgen Sie Ihre Anfragen und verwalten Sie Ihr Botschafter-Programm.",
    login: "Anmelden", signup: "Konto erstellen", loginTab: "Anmelden", signupTab: "Registrieren",
    name: "Vollständiger Name", email: "E-Mail", password: "Passwort",
    toLogin: "Schon ein Konto? Anmelden", toSignup: "Noch kein Konto? Registrieren",
    checkEmail: "Willkommen bei INOV Digital Services{name}! Ihr Konto wurde erstellt. Prüfen Sie Ihren Posteingang, um Ihre Adresse zu bestätigen, und melden Sie sich dann an.",
    logout: "Abmelden", hi: "Hallo",
    ambTitle: "Werden Sie Botschafter", ambDesc: "Empfehlen Sie INOV mit Ihrem eigenen Link. Jede bestätigte Bestellung eines Empfohlenen bringt Ihnen ein Guthaben.",
    ambCta: "Meinen Empfehlungslink aktivieren", ambActive: "Botschafter-Programm aktiv",
    yourLink: "Ihr Empfehlungslink", linkHint: "Teilen Sie diesen Link: Wer ihm folgt, wird automatisch Ihrem Konto zugeordnet.",
    copied: "Kopiert!", share: "Teilen",
    statOrders: "Meine Anfragen", statReferred: "Empfohlene", statConfirmed: "Bestätigt", statCredit: "Verdientes Guthaben",
    ordersTitle: "Meine Anfragen & Bestellungen", ordersEmpty: "Noch keine Anfragen. Ihre Angebote und Zahlungen erscheinen hier.",
    refTitle: "Meine Empfohlenen", refEmpty: "Noch keine Empfohlenen. Teilen Sie Ihren Link, um zu starten.",
    colDate: "Datum", colSource: "Typ", colStatus: "Status", colTotal: "Betrag",
    loading: "Wird geladen…", err: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    forgot: "Passwort vergessen?", resetTitle: "Passwort zurücksetzen",
    resetSub: "Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Link, um ein neues Passwort zu erstellen.",
    sendReset: "Link senden", resetSent: "Falls ein INOV-Digital-Services-Konto für diese E-Mail existiert, wurde Ihnen soeben ein Link zum Zurücksetzen gesendet. Prüfen Sie Ihren Posteingang.",
    newPassword: "Neues Passwort", savePassword: "Passwort speichern",
    pwUpdated: "Passwort aktualisiert ✓ Sie sind jetzt angemeldet.", backToLogin: "Zurück zur Anmeldung",
  },
  ar: {
    back: "العودة إلى الموقع",
    title: "حسابي", sub: "تابع طلباتك وأدر برنامج السفراء الخاص بك.",
    login: "تسجيل الدخول", signup: "إنشاء حساب", loginTab: "دخول", signupTab: "تسجيل",
    name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور",
    toLogin: "لديك حساب؟ سجّل الدخول", toSignup: "لا حساب؟ سجّل الآن",
    checkEmail: "مرحباً بك في INOV Digital Services{name}! تم إنشاء حسابك. تحقق من بريدك لتأكيد عنوانك ثم سجّل الدخول.",
    logout: "تسجيل الخروج", hi: "مرحباً",
    ambTitle: "كن سفيراً", ambDesc: "أوصِ بـ INOV عبر رابطك الخاص. كل طلب مؤكد من مُحال يمنحك رصيداً.",
    ambCta: "تفعيل رابط الإحالة", ambActive: "برنامج السفراء مُفعّل",
    yourLink: "رابط الإحالة الخاص بك", linkHint: "شارك هذا الرابط: كل من يتابعه يُربط تلقائياً بحسابك.",
    copied: "تم النسخ!", share: "مشاركة",
    statOrders: "طلباتي", statReferred: "المُحالون", statConfirmed: "مؤكدون", statCredit: "الرصيد المكتسب",
    ordersTitle: "طلباتي وأوامري", ordersEmpty: "لا طلبات بعد. ستظهر عروض الأسعار والمدفوعات هنا.",
    refTitle: "المُحالون", refEmpty: "لا مُحالين بعد. شارك رابطك للبدء.",
    colDate: "التاريخ", colSource: "النوع", colStatus: "الحالة", colTotal: "المبلغ",
    loading: "جارٍ التحميل…", err: "حدث خطأ. حاول مرة أخرى.",
    forgot: "هل نسيت كلمة المرور؟", resetTitle: "إعادة تعيين كلمة المرور",
    resetSub: "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإنشاء كلمة مرور جديدة.",
    sendReset: "إرسال الرابط", resetSent: "إذا كان لديك حساب في INOV Digital Services بهذا البريد، فقد أُرسل إليك للتو رابط إعادة التعيين. تحقق من بريدك.",
    newPassword: "كلمة مرور جديدة", savePassword: "حفظ كلمة المرور",
    pwUpdated: "تم تحديث كلمة المرور ✓ لقد سجّلت الدخول الآن.", backToLogin: "العودة إلى تسجيل الدخول",
  },
}

const STATUS_LABEL: Record<string, Record<string, string>> = {
  fr: { new: "Nouveau", contacted: "En cours", won: "Confirmé", lost: "Clos" },
  en: { new: "New", contacted: "In progress", won: "Confirmed", lost: "Closed" },
}

// Extra explanatory copy: account is free/no-commitment, reward rate, link is
// always available. Kept separate so we don't have to touch the 8 big blocks above.
const EXTRA: Record<Lang, { free: string; reward: (p: string) => string; anytime: string; ambUnavailable: string; retry: string }> = {
  fr: {
    free: "Créer un compte est gratuit et sans engagement — vous n'êtes pas obligé de devenir ambassadeur. Il vous sert aussi à suivre vos devis et commandes.",
    reward: (p) => `Gagnez ${p}% de crédit sur chaque commande confirmée d'un filleul.`,
    anytime: "Votre lien reste toujours disponible ici : copiez-le et partagez-le à tout moment.",
    ambUnavailable: "Votre lien ambassadeur n'a pas pu être chargé pour le moment. Réessayez dans un instant.",
    retry: "Réessayer",
  },
  en: {
    free: "Creating an account is free with no commitment — you don't have to become an ambassador. It also lets you track your quotes and orders.",
    reward: (p) => `Earn ${p}% credit on every confirmed order from a referral.`,
    anytime: "Your link always stays here: copy and share it anytime.",
    ambUnavailable: "Your ambassador link could not be loaded right now. Please try again in a moment.",
    retry: "Try again",
  },
  es: {
    free: "Crear una cuenta es gratis y sin compromiso — no tienes que ser embajador. También te sirve para seguir tus presupuestos y pedidos.",
    reward: (p) => `Gana un ${p}% de crédito por cada pedido confirmado de un referido.`,
    anytime: "Tu enlace siempre está aquí: cópialo y compártelo cuando quieras.",
    ambUnavailable: "No se pudo cargar tu enlace de embajador ahora mismo. Inténtalo de nuevo en un momento.",
    retry: "Reintentar",
  },
  ht: {
    free: "Kreye yon kont gratis e san angajman — ou pa oblije vin yon anbasadè. Li ede ou swiv devi ak kòmand ou yo tou.",
    reward: (p) => `Genyen ${p}% kredi sou chak kòmand konfime yon filyèl.`,
    anytime: "Lyen ou toujou la: kopye epi pataje l nenpòt lè.",
    ambUnavailable: "Nou pa t ka chaje lyen anbasadè ou kounye a. Tanpri eseye ankò nan yon ti moman.",
    retry: "Eseye ankò",
  },
  pt: {
    free: "Criar uma conta é grátis e sem compromisso — não precisa de ser embaixador. Também serve para acompanhar os seus orçamentos e pedidos.",
    reward: (p) => `Ganhe ${p}% de crédito em cada pedido confirmado de um indicado.`,
    anytime: "O seu link fica sempre aqui: copie e partilhe quando quiser.",
    ambUnavailable: "Não foi possível carregar o seu link de embaixador agora. Tente novamente num instante.",
    retry: "Tentar novamente",
  },
  it: {
    free: "Creare un account è gratuito e senza impegno — non devi diventare ambasciatore. Ti serve anche a seguire preventivi e ordini.",
    reward: (p) => `Guadagni il ${p}% di credito su ogni ordine confermato di un segnalato.`,
    anytime: "Il tuo link resta sempre qui: copialo e condividilo quando vuoi.",
    ambUnavailable: "Non è stato possibile caricare il tuo link ambasciatore in questo momento. Riprova tra un istante.",
    retry: "Riprova",
  },
  de: {
    free: "Ein Konto zu erstellen ist kostenlos und unverbindlich — Sie müssen kein Botschafter werden. Es dient auch der Verfolgung Ihrer Angebote und Bestellungen.",
    reward: (p) => `Erhalten Sie ${p}% Guthaben für jede bestätigte Bestellung eines Empfohlenen.`,
    anytime: "Ihr Link bleibt immer hier: kopieren und teilen Sie ihn jederzeit.",
    ambUnavailable: "Ihr Botschafter-Link konnte gerade nicht geladen werden. Bitte versuchen Sie es gleich erneut.",
    retry: "Erneut versuchen",
  },
  ar: {
    free: "إنشاء حساب مجاني وبدون التزام — لست مضطراً لأن تصبح سفيراً. يساعدك أيضاً على متابعة عروض الأسعار والطلبات.",
    reward: (p) => `اربح ${p}% رصيداً على كل طلب مؤكد من مُحال.`,
    anytime: "يبقى رابطك هنا دائماً: انسخه وشاركه في أي وقت.",
    ambUnavailable: "تعذّر تحميل رابط السفير الخاص بك الآن. يُرجى المحاولة مرة أخرى بعد لحظات.",
    retry: "إعادة المحاولة",
  },
}

// Copy for the "share our designs" gallery. Kept separate from the 8 big COPY
// blocks so we don't have to touch them. The client can share any creation INOV
// produced — their own or another client's — and the shared link carries their
// referral code, so spreading our work also earns them credit.
const SHARE: Record<Lang, {
  title: string; desc: string; search: string; empty: string
  more: string; shareBtn: string; copyBtn: string; copied: string
  madeFor: string; withRef: string; noRef: string; shareText: string
}> = {
  fr: {
    title: "Partagez nos créations", desc: "Faites rayonner votre marque : partagez les visuels que nous avons conçus pour vous — ou d'autres réalisations qui vous inspirent.",
    search: "Rechercher une marque, un projet…", empty: "Aucune création ne correspond à votre recherche.",
    more: "Voir plus de créations", shareBtn: "Partager", copyBtn: "Copier le lien", copied: "Lien copié !",
    madeFor: "Réalisé pour", withRef: "Chaque partage inclut votre lien de parrainage : une commande née d'un partage vous rapporte un crédit.",
    noRef: "Partagez librement nos réalisations autour de vous.",
    shareText: "Découvrez cette création signée INOV Digital Services 🎨",
  },
  en: {
    title: "Share our designs", desc: "Grow your brand: share the visuals we crafted for you — or other work that inspires you.",
    search: "Search a brand, a project…", empty: "No design matches your search.",
    more: "See more designs", shareBtn: "Share", copyBtn: "Copy link", copied: "Link copied!",
    madeFor: "Made for", withRef: "Every share carries your referral link: an order born from a share earns you a credit.",
    noRef: "Feel free to share our work with those around you.",
    shareText: "Check out this design by INOV Digital Services 🎨",
  },
  es: {
    title: "Comparte nuestros diseños", desc: "Haz brillar tu marca: comparte los visuales que creamos para ti — u otros trabajos que te inspiren.",
    search: "Buscar una marca, un proyecto…", empty: "Ningún diseño coincide con tu búsqueda.",
    more: "Ver más diseños", shareBtn: "Compartir", copyBtn: "Copiar enlace", copied: "¡Enlace copiado!",
    madeFor: "Hecho para", withRef: "Cada vez que compartes se incluye tu enlace de referido: un pedido nacido de un compartido te da un crédito.",
    noRef: "Comparte libremente nuestros trabajos con quienes te rodean.",
    shareText: "Descubre este diseño de INOV Digital Services 🎨",
  },
  ht: {
    title: "Pataje kreyasyon nou yo", desc: "Fè mak ou briye : pataje vizyèl nou fè pou ou — oswa lòt reyalizasyon ki enspire ou.",
    search: "Chèche yon mak, yon pwojè…", empty: "Pa gen okenn kreyasyon ki koresponn ak rechèch ou.",
    more: "Wè plis kreyasyon", shareBtn: "Pataje", copyBtn: "Kopye lyen", copied: "Lyen kopye !",
    madeFor: "Fèt pou", withRef: "Chak pataj gen lyen parennaj ou : yon kòmand ki soti nan yon pataj fè ou genyen yon kredi.",
    noRef: "Pataje reyalizasyon nou yo lib ak moun bò kote ou.",
    shareText: "Dekouvri kreyasyon sa a INOV Digital Services fè 🎨",
  },
  pt: {
    title: "Compartilhe nossas criações", desc: "Faça sua marca brilhar: compartilhe os visuais que criamos para você — ou outros trabalhos que inspiram você.",
    search: "Buscar uma marca, um projeto…", empty: "Nenhuma criação corresponde à sua busca.",
    more: "Ver mais criações", shareBtn: "Compartilhar", copyBtn: "Copiar link", copied: "Link copiado!",
    madeFor: "Feito para", withRef: "Cada compartilhamento inclui seu link de indicação: um pedido nascido de um compartilhamento gera um crédito.",
    noRef: "Compartilhe livremente nossos trabalhos com quem está à sua volta.",
    shareText: "Conheça esta criação da INOV Digital Services 🎨",
  },
  it: {
    title: "Condividi le nostre creazioni", desc: "Fai brillare il tuo brand: condividi i visual che abbiamo creato per te — o altri lavori che ti ispirano.",
    search: "Cerca un brand, un progetto…", empty: "Nessuna creazione corrisponde alla tua ricerca.",
    more: "Vedi altre creazioni", shareBtn: "Condividi", copyBtn: "Copia link", copied: "Link copiato!",
    madeFor: "Realizzato per", withRef: "Ogni condivisione include il tuo link di segnalazione: un ordine nato da una condivisione ti dà un credito.",
    noRef: "Condividi liberamente i nostri lavori con chi ti sta intorno.",
    shareText: "Scopri questa creazione firmata INOV Digital Services 🎨",
  },
  de: {
    title: "Teilen Sie unsere Designs", desc: "Lassen Sie Ihre Marke strahlen: Teilen Sie die Visuals, die wir für Sie gestaltet haben — oder andere Arbeiten, die Sie inspirieren.",
    search: "Marke oder Projekt suchen…", empty: "Kein Design entspricht Ihrer Suche.",
    more: "Weitere Designs ansehen", shareBtn: "Teilen", copyBtn: "Link kopieren", copied: "Link kopiert!",
    madeFor: "Erstellt für", withRef: "Jede Freigabe enthält Ihren Empfehlungslink: Eine aus einer Freigabe entstandene Bestellung bringt Ihnen ein Guthaben.",
    noRef: "Teilen Sie unsere Arbeiten gerne mit Ihrem Umfeld.",
    shareText: "Entdecken Sie dieses Design von INOV Digital Services 🎨",
  },
  ar: {
    title: "شارك تصاميمنا", desc: "اجعل علامتك تتألق: شارك التصاميم التي أنشأناها لك — أو أعمالاً أخرى تلهمك.",
    search: "ابحث عن علامة أو مشروع…", empty: "لا يوجد تصميم يطابق بحثك.",
    more: "عرض المزيد من التصاميم", shareBtn: "مشاركة", copyBtn: "نسخ الرابط", copied: "تم نسخ الرابط!",
    madeFor: "صُمّم لـ", withRef: "كل مشاركة تتضمّن رابط الإحالة الخاص بك: أي طلب ينتج عن مشاركة يمنحك رصيداً.",
    noRef: "شارك أعمالنا بحرية مع من حولك.",
    shareText: "اكتشف هذا التصميم من INOV Digital Services 🎨",
  },
}

// Flattened, de-duplicated list of every visual across all portfolio albums,
// each tagged with the client it was made for. This is the pool the client can
// browse and share from.
type ShareDesign = { id: string; img: string; title: string; client: string; category: string; isVideo: boolean }
const DESIGNS: ShareDesign[] = (() => {
  const out: ShareDesign[] = []
  const seen = new Set<string>()
  for (const a of albums) {
    for (const w of a.works) {
      const img = workPoster(w)
      if (!img || seen.has(img)) continue
      seen.add(img)
      out.push({ id: img, img, title: w.title, client: a.client, category: w.category, isVideo: !!w.videoId })
    }
  }
  return out
})()

function fmtDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return iso.slice(0, 10)
  }
}

function statusBadge(status: string, lang: Lang) {
  const label = (STATUS_LABEL[lang] ?? STATUS_LABEL.fr)[status] ?? status
  const color = status === "won" ? "var(--ds-success)" : status === "lost" ? "var(--ds-text-faint)" : "var(--ds-accent-text)"
  const bg = status === "won" ? "var(--ds-success-a12)" : status === "lost" ? "rgba(120,120,120,0.12)" : "var(--ds-accent-a10)"
  return (
    <span style={{
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      color, background: bg, padding: "3px 10px", borderRadius: "var(--r-full)", whiteSpace: "nowrap",
    }}>{label}</span>
  )
}

export default function Compte() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const x = EXTRA[lang] ?? EXTRA.fr

  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  // Auth form
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login")
  // When the user follows the reset link from their inbox, Supabase fires a
  // PASSWORD_RECOVERY event and opens a temporary session; we then show a form
  // to choose a new password instead of the dashboard.
  const [recovery, setRecovery] = useState(false)
  const [newPass, setNewPass] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [authBusy, setAuthBusy] = useState(false)
  const [authMsg, setAuthMsg] = useState<{ kind: "info" | "error"; text: string } | null>(null)

  // Dashboard data
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [rewardPct, setRewardPct] = useState<string>("5")
  const [dataBusy, setDataBusy] = useState(false)
  const [profileErr, setProfileErr] = useState(false)
  const [copied, setCopied] = useState(false)

  // Share-our-designs gallery
  const s = SHARE[lang] ?? SHARE.fr
  const [designQuery, setDesignQuery] = useState("")
  const [designVisible, setDesignVisible] = useState(9)
  const [sharedId, setSharedId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === "PASSWORD_RECOVERY") setRecovery(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Auto sign-out client accounts after inactivity / an absolute session cap.
  useSessionTimeout(!!session, CLIENT_SESSION_POLICY, () => { supabase.auth.signOut() })

  const loadData = useCallback(async () => {
    setDataBusy(true)
    setProfileErr(false)
    // Each call is isolated: a failure of one (e.g. the referral endpoint) must
    // never hide the others. In particular a failed me() used to blank out the
    // whole ambassador zone, so the referral link silently disappeared.
    const [me, ords, refs] = await Promise.all([
      accountsApi.me().catch(() => null),
      accountsApi.myOrders().catch(() => ({ orders: [] })),
      accountsApi.myReferrals().catch(() => null),
    ])
    if (me?.profile) setProfile(me.profile)
    else setProfileErr(true)
    setOrders(ords.orders)
    if (refs) {
      setReferrals(refs.referrals); setStats(refs.stats)
      const cfg = (refs as any).config
      if (cfg && cfg.type === "percent" && typeof cfg.value === "number") setRewardPct(String(cfg.value))
    }
    setDataBusy(false)
  }, [])

  useEffect(() => {
    if (session) loadData()
    else { setProfile(null); setOrders([]); setReferrals([]); setStats(null) }
  }, [session, loadData])

  async function submitAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthBusy(true)
    setAuthMsg(null)
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/compte`,
        })
        if (error) throw error
        setAuthMsg({ kind: "info", text: c.resetSent })
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name } },
        })
        if (error) throw error
        // If email confirmation is required there is no session yet.
        if (!(await supabase.auth.getSession()).data.session) {
          // Personalize with the client's first name when provided.
          const firstName = name.trim() ? ` ${name.trim().split(/\s+/)[0]}` : ""
          setAuthMsg({ kind: "info", text: c.checkEmail.replace("{name}", firstName) })
          setMode("login")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      setAuthMsg({ kind: "error", text: err?.message ?? c.err })
    } finally {
      setAuthBusy(false)
    }
  }

  // Sets the new password during a recovery session, then drops into the dashboard.
  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setAuthBusy(true)
    setAuthMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      setNewPass("")
      setRecovery(false)
      setAuthMsg({ kind: "info", text: c.pwUpdated })
    } catch (err: any) {
      setAuthMsg({ kind: "error", text: err?.message ?? c.err })
    } finally {
      setAuthBusy(false)
    }
  }

  const refLink = profile ? `${window.location.origin}/?ref=${profile.refCode}` : ""

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(refLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* ignore */ }
  }

  async function shareLink() {
    if (navigator.share) {
      try { await navigator.share({ title: "INOV", url: refLink }) } catch { /* cancelled */ }
    } else {
      copyLink()
    }
  }

  // Deep link to the portfolio, carrying the client's referral code when they
  // have one so a share can turn into a credited order.
  const portfolioLink = profile
    ? `${window.location.origin}/?ref=${profile.refCode}#portfolio`
    : `${window.location.origin}/#portfolio`

  async function shareDesign(d: ShareDesign) {
    const text = `${s.shareText}\n${d.title} — ${d.client}`
    if (navigator.share) {
      try { await navigator.share({ title: "INOV Digital Services", text, url: portfolioLink }) } catch { /* cancelled */ }
      return
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${portfolioLink}`)
      setSharedId(d.id)
      setTimeout(() => setSharedId((cur) => (cur === d.id ? null : cur)), 1800)
    } catch { /* ignore */ }
  }

  async function copyDesign(d: ShareDesign) {
    try {
      await navigator.clipboard.writeText(`${s.shareText}\n${d.title} — ${d.client}\n${portfolioLink}`)
      setSharedId(d.id)
      setTimeout(() => setSharedId((cur) => (cur === d.id ? null : cur)), 1800)
    } catch { /* ignore */ }
  }

  const filteredDesigns = (() => {
    const q = designQuery.trim().toLowerCase()
    if (!q) return DESIGNS
    return DESIGNS.filter(
      (d) => d.client.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
    )
  })()

  const creditDisplay = stats
    ? `${stats.credit.toLocaleString(lang)}${stats.currency ? " " + stats.currency : (stats.credit ? " $" : "")}`
    : "—"

  // ── Shell ────────────────────────────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
    <section style={{ minHeight: "100vh", background: "var(--ds-bg)", padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
            color: "var(--ds-text-sec)", textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> {c.back}
        </Link>
        {children}
      </div>
    </section>
  )

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "13px 15px", borderRadius: "var(--r-md)",
    border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)", color: "var(--ds-text)",
    fontFamily: "'Outfit', sans-serif", fontSize: 15, outline: "none",
  }
  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700,
    letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ds-text-sec)", marginBottom: 7,
  }

  if (!ready) {
    return shell(
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ds-text-sec)", fontFamily: "'Outfit', sans-serif" }}>
        <Loader2 size={18} className="spin" /> {c.loading}
      </div>,
    )
  }

  // ── Password recovery: set a new password ─────────────────────────────────
  if (recovery) {
    return shell(
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="section-title" style={{ marginBottom: 10 }}>{c.resetTitle}</h1>
        </div>
        <div className="glass" style={{ padding: 32, borderRadius: "var(--r-xl)" }}>
          <form onSubmit={updatePassword} style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={labelStyle}>{c.newPassword}</label>
              <input style={inputStyle} type="password" required minLength={6} value={newPass}
                onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" autoFocus />
            </div>
            {authMsg && (
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, lineHeight: 1.5, padding: "11px 14px", borderRadius: "var(--r-md)",
                color: authMsg.kind === "error" ? "var(--ds-danger)" : "var(--ds-accent-text)",
                background: authMsg.kind === "error" ? "var(--ds-danger-a10)" : "var(--ds-accent-a08)",
              }}>{authMsg.text}</div>
            )}
            <button type="submit" className="btn-orange" disabled={authBusy} style={{
              padding: "14px 0", borderRadius: "var(--r-md)", border: "none", cursor: authBusy ? "wait" : "pointer",
              color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {authBusy && <Loader2 size={17} className="spin" />}
              {c.savePassword}
            </button>
          </form>
        </div>
      </div>,
    )
  }

  // ── Unauthenticated: auth card ────────────────────────────────────────────
  if (!session) {
    return shell(
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <span className="section-tag"><span className="dot-pulse" />{c.title}</span>
          </div>
          <h1 className="section-title" style={{ marginBottom: 10 }}>{c.title}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--ds-text-sec)", lineHeight: 1.65 }}>{c.sub}</p>
        </div>

        <div className="glass" style={{ padding: 32, borderRadius: "var(--r-xl)" }}>
          {/* Reset intro */}
          {mode === "reset" && (
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 8px" }}>{c.resetTitle}</h2>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.6, color: "var(--ds-text-sec)", margin: 0 }}>{c.resetSub}</p>
            </div>
          )}
          {/* Tabs */}
          {mode !== "reset" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "var(--ds-bg)", padding: 5, borderRadius: "var(--r-md)" }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setAuthMsg(null) }}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                  background: mode === m ? "var(--ds-bg-card)" : "transparent",
                  color: mode === m ? "var(--ds-text)" : "var(--ds-text-sec)",
                  boxShadow: mode === m ? "var(--ds-shadow-sm, 0 1px 3px rgba(0,0,0,0.08))" : "none",
                  transition: "all 0.15s",
                }}
              >
                {m === "login" ? c.loginTab : c.signupTab}
              </button>
            ))}
          </div>
          )}

          <form onSubmit={submitAuth} style={{ display: "grid", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label style={labelStyle}>{c.name}</label>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div>
              <label style={labelStyle}>{c.email}</label>
              <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            {mode !== "reset" && (
            <div>
              <label style={labelStyle}>{c.password}</label>
              <input style={inputStyle} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              {mode === "login" && (
                <button type="button" onClick={() => { setMode("reset"); setAuthMsg(null) }} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "8px 0 0",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-accent-text)", fontWeight: 600,
                }}>
                  {c.forgot}
                </button>
              )}
            </div>
            )}

            {authMsg && (
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, lineHeight: 1.5, padding: "11px 14px", borderRadius: "var(--r-md)",
                color: authMsg.kind === "error" ? "var(--ds-danger)" : "var(--ds-accent-text)",
                background: authMsg.kind === "error" ? "var(--ds-danger-a10)" : "var(--ds-accent-a08)",
              }}>{authMsg.text}</div>
            )}

            <button type="submit" className="btn-orange" disabled={authBusy} style={{
              padding: "14px 0", borderRadius: "var(--r-md)", border: "none", cursor: authBusy ? "wait" : "pointer",
              color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {authBusy && <Loader2 size={17} className="spin" />}
              {mode === "reset" ? c.sendReset : mode === "login" ? c.login : c.signup}
            </button>

            <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setAuthMsg(null) }} style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              fontSize: 13.5, color: "var(--ds-text-sec)", textAlign: "center",
            }}>
              {mode === "reset" ? c.backToLogin : mode === "login" ? c.toSignup : c.toLogin}
            </button>

            {mode === "signup" && (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, lineHeight: 1.6, color: "var(--ds-text-faint)", textAlign: "center", margin: 0 }}>
                {x.free}
              </p>
            )}
          </form>
        </div>
      </div>,
    )
  }

  // ── Authenticated: dashboard ──────────────────────────────────────────────
  const displayName =
    (session.user.user_metadata?.name as string) || session.user.email?.split("@")[0] || ""

  const statCard = (icon: React.ReactNode, value: React.ReactNode, label: string) => (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--ds-accent-text)" }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--ds-text)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-sec)", marginTop: 6 }}>{label}</div>
    </div>
  )

  return shell(
    <>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: 6 }}>{c.hi}, {displayName}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)" }}>{c.sub}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{
          display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)",
          border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)", cursor: "pointer",
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--ds-text-sec)",
        }}>
          <LogOut size={16} /> {c.logout}
        </button>
      </div>

      {/* Referral zone — always visible so the client can find and copy their
          link at any time, with no "activation" step required. */}
      {profile ? (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--ds-text)", marginBottom: 6 }}>{c.ambTitle}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: "var(--ds-text-sec)", lineHeight: 1.6, maxWidth: 620, marginBottom: 8 }}>{c.ambDesc}</p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-accent-text)", marginBottom: 20 }}>
            <Gift size={15} style={{ verticalAlign: "-2px", marginInlineEnd: 6 }} />{x.reward(rewardPct)}
          </p>

          {/* Stats grid */}
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 24 }}>
            {statCard(<Package size={18} />, orders.length, c.statOrders)}
            {statCard(<Users size={18} />, stats?.total ?? 0, c.statReferred)}
            {statCard(<Check size={18} />, stats?.confirmed ?? 0, c.statConfirmed)}
            {statCard(<Gift size={18} />, creditDisplay, c.statCredit)}
          </div>

          {/* Referral link */}
          <label style={labelStyle}>{c.yourLink}</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <input readOnly value={refLink} onFocus={(e) => e.currentTarget.select()} style={{ ...inputStyle, flex: 1, minWidth: 220, fontFamily: "'Space Grotesk', sans-serif" }} />
            <button onClick={copyLink} className="btn-orange" style={{
              padding: "0 20px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", color: "#fff",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
            }}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? c.copied : "Copier"}
            </button>
            <button onClick={shareLink} style={{
              padding: "0 18px", borderRadius: "var(--r-md)", border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)",
              cursor: "pointer", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
            }}>
              <Share2 size={16} /> {c.share}
            </button>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)", lineHeight: 1.6 }}>{c.linkHint}</p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)", lineHeight: 1.6, marginTop: 6 }}>
            {x.anytime} {x.reward(rewardPct)}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)", lineHeight: 1.6, marginTop: 6 }}>{x.free}</p>
        </div>
      ) : profileErr ? (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--ds-text)", marginBottom: 8 }}>{c.ambTitle}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: "var(--ds-text-sec)", lineHeight: 1.6, maxWidth: 620, marginBottom: 18 }}>{x.ambUnavailable}</p>
          <button onClick={loadData} disabled={dataBusy} className="btn-orange" style={{
            padding: "12px 22px", borderRadius: "var(--r-md)", border: "none", cursor: dataBusy ? "wait" : "pointer", color: "#fff",
            fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            {dataBusy ? <Loader2 size={16} className="spin" /> : <Share2 size={16} />} {x.retry}
          </button>
        </div>
      ) : null}

      {/* Share our designs — the client can broadcast any creation we made
          (theirs or another client's); shares carry their referral code. */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Images size={20} style={{ color: "var(--ds-accent-text)" }} />
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", margin: 0 }}>{s.title}</h2>
        </div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.6, maxWidth: 640, marginBottom: 16 }}>{s.desc}</p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 420, marginBottom: 18 }}>
          <Search size={16} style={{ position: "absolute", insetInlineStart: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ds-text-faint)", pointerEvents: "none" }} />
          <input
            value={designQuery}
            onChange={(e) => { setDesignQuery(e.target.value); setDesignVisible(9) }}
            placeholder={s.search}
            style={{ ...inputStyle, paddingInlineStart: 40 }}
          />
        </div>

        {filteredDesigns.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--ds-text-faint)", fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.6 }}>{s.empty}</div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {filteredDesigns.slice(0, designVisible).map((d) => (
                <div key={d.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", aspectRatio: "4 / 3", background: "var(--ds-bg)" }}>
                    <SmartImage
                      src={d.img}
                      alt={`${d.title} — ${d.client}`}
                      loading="lazy"
                      wrapperStyle={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute", top: 8, insetInlineStart: 8, background: "var(--ds-accent)", color: "#fff",
                      borderRadius: "var(--r-full)", padding: "3px 10px", fontFamily: "'Outfit', sans-serif",
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>{d.category}</span>
                    {d.isVideo && (
                      <span style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.28)",
                      }}>
                        <span style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Play size={18} style={{ color: "#fff", marginInlineStart: 2 }} />
                        </span>
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", lineHeight: 1.35 }}>{d.title}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-faint)", marginTop: 3 }}>{s.madeFor} {d.client}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => shareDesign(d)} className="btn-orange" style={{
                        flex: 1, padding: "9px 0", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        {sharedId === d.id ? <Check size={15} /> : <Share2 size={15} />}
                        {sharedId === d.id ? s.copied : s.shareBtn}
                      </button>
                      <button onClick={() => copyDesign(d)} aria-label={s.copyBtn} title={s.copyBtn} style={{
                        padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)",
                        cursor: "pointer", color: "var(--ds-text)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {designVisible < filteredDesigns.length && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button onClick={() => setDesignVisible((n) => n + 9)} style={{
                  padding: "11px 24px", borderRadius: "var(--r-md)", border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)",
                  cursor: "pointer", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                }}>
                  {s.more}
                </button>
              </div>
            )}
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)", lineHeight: 1.6, marginTop: 14 }}>
              {profile ? s.withRef : s.noRef}
            </p>
          </>
        )}
      </section>

      {/* Orders */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", marginBottom: 14 }}>{c.ordersTitle}</h2>
        {dataBusy && orders.length === 0 ? (
          <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 10, color: "var(--ds-text-sec)", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
            <Loader2 size={16} className="spin" /> {c.loading}
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--ds-text-faint)", fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.6 }}>{c.ordersEmpty}</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {orders.map((o, i) => (
              <div key={o.id} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center",
                padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--ds-border)",
              }}>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 600, color: "var(--ds-text)", textTransform: "capitalize" }}>{o.source}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>{fmtDate(o.createdAt, lang)}</div>
                </div>
                {statusBadge(o.status, lang)}
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", whiteSpace: "nowrap", textAlign: "end" }}>
                  {o.total != null ? `${o.total.toLocaleString(lang)}${o.currency ? " " + o.currency : ""}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Referrals */}
      {profile && (
        <section>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", marginBottom: 14 }}>{c.refTitle}</h2>
          {referrals.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--ds-text-faint)", fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.6 }}>{c.refEmpty}</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {referrals.map((r, i) => (
                <div key={r.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center",
                  padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--ds-border)",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 600, color: "var(--ds-text)", textTransform: "capitalize" }}>{r.source}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>{fmtDate(r.createdAt, lang)}</div>
                  </div>
                  {statusBadge(r.status, lang)}
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", whiteSpace: "nowrap", textAlign: "end" }}>
                    {r.total != null ? `${r.total.toLocaleString(lang)}${r.currency ? " " + r.currency : ""}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>,
  )
}
