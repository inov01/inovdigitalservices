import { lazy, Suspense } from "react"
import Hero from "../components/Hero"
import Services from "../components/Services"
import WhyUs from "../components/WhyUs"
import Pricing from "../components/Pricing"
import BriefLinks from "../components/BriefLinks"
import Contact from "../components/Contact"
import RevealSection from "../components/RevealSection"
import PageNav from "../components/PageNav"
import { useSettings } from "../context/AppSettings"

// Code-split heavy sections — load only when they scroll into view
const About       = lazy(() => import("../components/About"))
const Portfolio   = lazy(() => import("../components/Portfolio"))
const Testimonials = lazy(() => import("../components/Testimonials"))
const Blog        = lazy(() => import("../components/Blog"))
const Referral    = lazy(() => import("../components/Referral"))
const Newsletter  = lazy(() => import("../components/Newsletter"))
const FAQ         = lazy(() => import("../components/FAQ"))
const OnlinePromo = lazy(() => import("../components/OnlinePromo"))

function SectionFallback() {
  return (
    <div style={{ padding: "80px var(--section-px)", overflow: "hidden" }} aria-hidden="true">
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="sk" style={{ height: 14, width: "22%", borderRadius: "var(--r-sm)", marginBottom: 20 }} />
        <div className="sk" style={{ height: 36, width: "55%", borderRadius: "var(--r-md)", marginBottom: 14 }} />
        <div className="sk" style={{ height: 16, width: "38%", borderRadius: "var(--r-sm)", marginBottom: 10 }} />
        <div className="sk" style={{ height: 16, width: "32%", borderRadius: "var(--r-sm)", marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="sk" style={{ height: 220, borderRadius: "var(--r-xl)" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { region } = useSettings()

  return (
    <>
      {/* Above-the-fold — eager, no reveal. Dark format scoped to the hero only. */}
      <div className="dark">
        <Hero />
      </div>

      {/* ── Core conversion funnel ───────────────────────────────────────────
         Ordered so credibility precedes the price ask: what we do (Services) →
         visual proof (Portfolio) → social proof (Testimonials) → differentiators
         (WhyUs) → the price (Pricing) → objection handling right at the moment of
         doubt (FAQ) → conversion actions (BriefLinks). Secondary marketing
         sections follow below so they never dilute this decision path. */}
      <RevealSection delay={0}>
        <Services />
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <Portfolio />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <WhyUs />
      </RevealSection>

      <RevealSection delay={0}>
        <Pricing />
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <FAQ />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <BriefLinks />
      </RevealSection>

      {region === "HT" && (
        <RevealSection delay={0}>
          {/* Offre Haïti ("augmentez votre visibilité") — dark format */}
          <div className="dark">
            <Suspense fallback={<SectionFallback />}>
              <OnlinePromo />
            </Suspense>
          </div>
        </RevealSection>
      )}

      {/* ── Secondary sections — trust tail & engagement, below the funnel ──── */}
      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <About />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <Blog />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <Newsletter />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <Suspense fallback={<SectionFallback />}>
          <Referral />
        </Suspense>
      </RevealSection>

      <RevealSection delay={0}>
        <Contact />
      </RevealSection>

      <PageNav />
    </>
  )
}
