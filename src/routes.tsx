import { createBrowserRouter } from "react-router"
import { lazy, Suspense, type ReactNode } from "react"
import RootLayout from "./layout/RootLayout"
import Home from "./pages/Home"
import RouteError from "./components/RouteError"

// Home stays eager (it's the landing page / LCP). Everything else is code-split
// so transactional & back-office routes don't ship in the initial bundle.
const BlogList = lazy(() => import("./pages/BlogList"))
const BlogArticle = lazy(() => import("./pages/BlogArticle"))
const Legal = lazy(() => import("./pages/Legal"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Admin = lazy(() => import("./pages/Admin"))
const Payer = lazy(() => import("./pages/Payer"))
const Devis = lazy(() => import("./pages/Devis"))
const Compte = lazy(() => import("./pages/Compte"))
const Directions = lazy(() => import("./pages/Directions"))
const Brief = lazy(() => import("./pages/Brief"))
const Formation = lazy(() => import("./pages/Formation"))
const FormationDetail = lazy(() => import("./pages/FormationDetail"))
const Collaborateur = lazy(() => import("./pages/Collaborateur"))

// Minimal fallback — keeps layout height stable while a route chunk loads.
const L = (node: ReactNode) => <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>{node}</Suspense>

export const router = createBrowserRouter([
  { path: "/admin", element: L(<Admin />), errorElement: <RouteError /> },
  { path: "/directions", element: L(<Directions />), errorElement: <RouteError /> },
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: Home },
      { path: "devis", element: L(<Devis />) },
      { path: "blog", element: L(<BlogList />) },
      { path: "blog/:slug", element: L(<BlogArticle />) },
      { path: "paiement", element: L(<Payer />) },
      { path: "compte", element: L(<Compte />) },
      { path: "brief/:service", element: L(<Brief />) },
      { path: "formation", element: L(<Formation />) },
      { path: "formation/:slug", element: L(<FormationDetail />) },
      { path: "collaborateur", element: L(<Collaborateur />) },
      { path: "mentions-legales", element: L(<Legal kind="terms" />) },
      { path: "confidentialite", element: L(<Legal kind="privacy" />) },
      { path: "*", element: L(<NotFound />) },
    ],
  },
])
