// ============================================================
// INOV DIGITAL SERVICES — Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- LANGUAGE MANAGEMENT ---- */
  /* ---- LANGUAGE MANAGEMENT ---- */
  const translations = {
    fr: {
      // Nav
      'nav.services': 'Services',
      'nav.why': 'Pourquoi nous',
      'nav.pricing': 'Tarifs',
      'nav.portfolio': 'Portfolio',
      'nav.contact': 'Contact',
      'nav.cta': 'Démarrer un projet',
      'nav.facture': 'Proforma / Devis',
      // Hero
      'hero.badge': 'Agence Créative & Digitale',
      'hero.title1': 'Transformez votre',
      'hero.title2': 'vision en réalité',
      'hero.title3': 'digitale',
      'hero.desc': "INOV Digital Services vous accompagne dans la création de votre identité visuelle et votre présence en ligne. Design premium, résultats concrets.",
      'hero.cta1': 'Démarrer un projet',
      'hero.cta2': 'Voir nos services',
      'hero.stat1': 'Projets réalisés',
      'hero.stat2': 'Clients satisfaits',
      'hero.stat3': 'Pays servis',
      'hero.stat4': 'Satisfaction',
      // Services
      'services.tag': 'Nos Services',
      'services.title': 'Des solutions créatives pour votre',
      'services.title2': 'croissance digitale',
      'services.subtitle': "Du branding à la promotion en ligne, nous offrons une gamme complète de services pour propulser votre marque.",
      's1.title': 'Branding & Identité',
      's1.desc': "Création d'une identité visuelle forte et cohérente qui reflète les valeurs de votre marque.",
      's2.title': 'Création de Logo',
      's2.desc': "Un logo professionnel, mémorable et unique qui représente votre entreprise.",
      's3.title': 'Animation de Logo',
      's3.desc': "Donnez vie à votre logo avec des animations fluides et percutantes.",
      's4.title': 'Montage Vidéo',
      's4.desc': "Montage professionnel pour vos vidéos promotionnelles, clips et contenus réseaux.",
      's5.title': 'Motion Design',
      's5.desc': "Animations graphiques et effets visuels pour des contenus qui captivent.",
      's6.title': 'Packaging Design',
      's6.desc': "Designs d'emballages attractifs qui boostent vos ventes en rayon et en ligne.",
      's7.title': 'Promotion en Ligne',
      's7.desc': "Stratégies de promotion ciblées pour maximiser votre visibilité digitale.",
      's8.title': 'Marketing Digital',
      's8.desc': "Campagnes de marketing digital complètes pour développer votre audience.",
      // Why us
      'why.tag': 'Pourquoi INOV ?',
      'why.title': 'Ce qui nous distingue de la concurrence',
      'why.subtitle': "Nous ne créons pas juste du design — nous créons des expériences qui convertissent.",
      'f1.title': 'Design Premium',
      'f1.desc': "Chaque projet est traité avec un soin extrême pour un rendu professionnel et moderne.",
      'f2.title': 'Livraison Rapide',
      'f2.desc': "Nous respectons vos délais et livrons dans les temps, sans compromis sur la qualité.",
      'f3.title': 'Support Continu',
      'f3.desc': "Nous restons disponibles après livraison pour toute modification ou question.",
      'm1': 'Projets',
      'm2': 'Clients',
      'm3': 'Satisfaction',
      'm4': 'Pays',
      // Pricing
      'pricing.tag': 'Tarifs',
      'pricing.title': 'Des offres adaptées à votre budget',
      'pricing.subtitle': "Paiement sécurisé via MonCash, NatCash, 2Checkout, CamTransfert et plus.",
      'p1.name': 'Identité Visuelle',
      'p1.title': 'Pack Logo Essentiel',
      'p1.f1': 'Logo vectoriel HD',
      'p1.f2': '3 propositions de design',
      'p1.f3': '2 révisions incluses',
      'p1.f4': 'Fichiers sources (AI, PNG, SVG)',
      'p1.cta': 'Commander maintenant',
      'p2.name': 'Vidéo & Motion',
      'p2.title': 'Pack Vidéo Pro',
      'p2.f1': 'Montage vidéo jusqu\'à 5 min',
      'p2.f2': 'Motion design & effets',
      'p2.f3': 'Sous-titres inclus',
      'p2.f4': 'Export HD 1080p/4K',
      'p2.cta': 'Commander maintenant',
      'p3.name': 'Marketing Digital',
      'p3.title': 'Pack Marketing Complet',
      'p3.f1': 'Stratégie de contenu',
      'p3.f2': 'Gestion réseaux sociaux',
      'p3.f3': 'Publicités Meta/TikTok',
      'p3.f4': 'Rapport mensuel détaillé',
      'p3.cta': 'Commander maintenant',
      // Interactive Cart Translations (FR)
      'pricing.title_graphics': 'Services de Conception Graphique',
      'pricing.subtitle_graphics': 'Des visuels professionnels pour booster votre image. Sélectionnez vos services et commandez en un clic.',
      'pricing.cart_title': 'Votre Sélection',
      'pricing.cart_empty': 'Sélectionnez des services dans le tableau pour les ajouter ici',
      'pricing.subtotal': 'Sous-total',
      'pricing.discount': 'Réduction',
      'pricing.total': 'Total estimé',
      'pricing.discount_badge_5': 'de réduction à partir de <strong>5 services</strong>',
      'pricing.discount_badge_10': 'de réduction à partir de <strong>10 services</strong>',
      'pricing.whatsapp_btn': '📲 Commander via WhatsApp',
      'pricing.quote_btn': '📄 Demander un devis',
      'pricing.other': 'Autre — Conception spécifique',
      'pricing.other_placeholder': 'Décrivez votre projet ici...',
      'pricing.table_title': 'Tarifs des services de conception graphique',
      'pricing.starting_at': 'À partir de',
      'pricing.acompte': 'Acompte 70% requis',
      'pricing.whatsapp_hello': 'Bonjour INOV Digital Services ! Je souhaite commander les services suivants :',
      'pricing.whatsapp_total': 'Total estimé',
      'pricing.whatsapp_other': 'Autre',
      // Services interactive names (FR)
      'ts.s1.name': 'Logo + 2 mockup',
      'ts.s1.desc': 'Variante de couleur principale et N&B, format PNG, JPEG & PDF',
      'ts.s2.name': 'Logo + Branding',
      'ts.s2.desc': '4 mockup, 4 flyer, charte graphique, identité visuelle, imagerie, pattern, révisions 1 mois',
      'ts.s3.name': 'Carte de visite (Design sur-mesure)',
      'ts.s3.desc': 'Design professionnel recto/verso personnalisé',
      'ts.s4.name': 'Étiquette',
      'ts.s4.desc': 'Design d’étiquette produit (pot, bouteille, emballage)',
      'ts.s5.name': 'Étiquette + code-barres + mockup + flyer',
      'ts.s5.desc': 'Pack complet étiquette produit avec visuels promotionnels',
      'ts.s6.name': 'Conception pour les réseaux sociaux',
      'ts.s6.desc': 'Flyer [affiche], Youtube Thumbnails [miniature youtube]',
      'ts.s7.name': 'Conception pour impression petit format',
      'ts.s7.desc': 'Book cover [couverture de livre], badge, certificat, brochure...',
      'ts.s8.name': 'Conception pour impression grand format',
      'ts.s8.desc': 'Banner, roll up, banderole publicitaire...',
      'ts.s9.name': 'Packaging Design Pro',
      'ts.s9.desc': 'Design d’emballage produit, boîte, pot et sac',
      'ts.s10.name': 'Montage vidéo, animation 2D / 3D',
      'ts.s10.desc': 'Montage vidéo pro, clips, pubs et animations 2D/3D',
      'ts.s11.name': 'Animation de Logo (Intro vidéo)',
      'ts.s11.desc': 'Donnez vie à votre logo avec une animation vidéo fluide',
      'ts.s12.name': 'Motion Design (Flyer & Pub)',
      'ts.s12.desc': 'Animations graphiques et visuels animés captivants',
      'ts.s13.name': 'Conception de Dépliant de services',
      'ts.s13.desc': 'Dépliant informatif 2 ou 3 volets imprimable',
      'ts.s14.name': 'Présentation PowerPoint animée',
      'ts.s14.desc': 'Présentation professionnelle animée avec défilement',
      'ts.s15.name': '1 Mois de Promotion sur les Réseaux',
      'ts.s15.desc': 'Campagne de promotion ciblée (10 000 à 50 000 vues)',
      // Portfolio
      'portfolio.tag': 'Portfolio',
      'portfolio.title': 'Quelques-unes de nos réalisations',
      'portfolio.subtitle': "Chaque projet est unique, conçu sur mesure pour nos clients.",
      'portfolio.cta': 'Voir tout le portfolio',
      // Contact
      'contact.tag': 'Contact',
      'contact.title': 'Parlons de votre projet',
      'contact.desc': "Vous avez un projet en tête ? Contactez-nous et obtenez un devis gratuit sous 24h.",
      'form.name': 'Votre nom',
      'form.email': 'Adresse email',
      'form.service': 'Service souhaité',
      'form.budget': 'Budget estimé',
      'form.message': 'Décrivez votre projet...',
      'form.submit': 'Envoyer le message',
      'form.sending': 'Envoi en cours...',
    },
    en: {
      // Nav
      'nav.services': 'Services',
      'nav.why': 'Why Us',
      'nav.pricing': 'Pricing',
      'nav.portfolio': 'Portfolio',
      'nav.contact': 'Contact',
      'nav.cta': 'Start a Project',
      'nav.facture': 'Proforma / Quote',
      // Hero
      'hero.badge': 'Creative & Digital Agency',
      'hero.title1': 'Transform your',
      'hero.title2': 'vision into digital',
      'hero.title3': 'reality',
      'hero.desc': "INOV Digital Services helps you build your visual identity and online presence. Premium design, concrete results.",
      'hero.cta1': 'Start a Project',
      'hero.cta2': 'View Our Services',
      'hero.stat1': 'Projects Done',
      'hero.stat2': 'Happy Clients',
      'hero.stat3': 'Countries',
      'hero.stat4': 'Satisfaction',
      // Services
      'services.tag': 'Our Services',
      'services.title': 'Creative solutions for your',
      'services.title2': 'digital growth',
      'services.subtitle': "From branding to online promotion, we offer a full range of services to elevate your brand.",
      's1.title': 'Branding & Identity',
      's1.desc': "Building a strong, cohesive visual identity that reflects your brand values.",
      's2.title': 'Logo Design',
      's2.desc': "A professional, memorable and unique logo that represents your business.",
      's3.title': 'Logo Animation',
      's3.desc': "Bring your logo to life with smooth, impactful animations.",
      's4.title': 'Video Editing',
      's4.desc': "Professional editing for your promo videos, clips and social content.",
      's5.title': 'Motion Design',
      's5.desc': "Graphic animations and visual effects for content that captivates.",
      's6.title': 'Packaging Design',
      's6.desc': "Eye-catching packaging designs that boost your sales online and in-store.",
      's7.title': 'Online Promotion',
      's7.desc': "Targeted promotion strategies to maximize your digital visibility.",
      's8.title': 'Digital Marketing',
      's8.desc': "Full digital marketing campaigns to grow your audience and sales.",
      // Why us
      'why.tag': 'Why INOV?',
      'why.title': 'What sets us apart from the competition',
      'why.subtitle': "We don't just create design — we create experiences that convert.",
      'f1.title': 'Premium Design',
      'f1.desc': "Every project is crafted with extreme care for a professional and modern result.",
      'f2.title': 'Fast Delivery',
      'f2.desc': "We respect your deadlines and deliver on time, without compromising quality.",
      'f3.title': 'Ongoing Support',
      'f3.desc': "We remain available after delivery for any modifications or questions.",
      'm1': 'Projects',
      'm2': 'Clients',
      'm3': 'Satisfaction',
      'm4': 'Countries',
      // Pricing
      'pricing.tag': 'Pricing',
      'pricing.title': 'Plans tailored to your budget',
      'pricing.subtitle': "Secure payment via MonCash, NatCash, 2Checkout, CamTransfert and more.",
      'p1.name': 'Visual Identity',
      'p1.title': 'Essential Logo Pack',
      'p1.f1': 'HD Vector Logo',
      'p1.f2': '3 Design Proposals',
      'p1.f3': '2 Revisions Included',
      'p1.f4': 'Source Files (AI, PNG, SVG)',
      'p1.cta': 'Order Now',
      'p2.name': 'Video & Motion',
      'p2.title': 'Pro Video Pack',
      'p2.f1': 'Video Editing up to 5 min',
      'p2.f2': 'Motion design & effects',
      'p2.f3': 'Subtitles included',
      'p2.f4': 'HD 1080p/4K Export',
      'p2.cta': 'Order Now',
      'p3.name': 'Digital Marketing',
      'p3.title': 'Full Marketing Pack',
      'p3.f1': 'Content strategy',
      'p3.f2': 'Social media management',
      'p3.f3': 'Meta/TikTok Ads',
      'p3.f4': 'Detailed monthly report',
      'p3.cta': 'Order Now',
      // Interactive Cart Translations (EN)
      'pricing.title_graphics': 'Graphic Design Services',
      'pricing.subtitle_graphics': 'Professional visuals to boost your image. Select your services and order in one click.',
      'pricing.cart_title': 'Your Selection',
      'pricing.cart_empty': 'Select services in the table to add them here',
      'pricing.subtotal': 'Subtotal',
      'pricing.discount': 'Discount',
      'pricing.total': 'Estimated Total',
      'pricing.discount_badge_5': 'discount starting from <strong>5 services</strong>',
      'pricing.discount_badge_10': 'discount starting from <strong>10 services</strong>',
      'pricing.whatsapp_btn': '📲 Order via WhatsApp',
      'pricing.quote_btn': '📄 Request a Quote',
      'pricing.other': 'Other — Specific design request',
      'pricing.other_placeholder': 'Describe your project here...',
      'pricing.table_title': 'Graphic design services rates',
      'pricing.starting_at': 'Starting at',
      'pricing.acompte': '70% Advance payment required',
      'pricing.whatsapp_hello': 'Hello INOV Digital Services! I would like to order the following services:',
      'pricing.whatsapp_total': 'Estimated Total',
      'pricing.whatsapp_other': 'Other',
      // Services interactive names (EN)
      'ts.s1.name': 'Logo + 2 mockups',
      'ts.s1.desc': 'Main color variant & B/W, PNG, JPEG & PDF format',
      'ts.s2.name': 'Logo + Branding',
      'ts.s2.desc': '4 mockups, 4 flyers, brand guidelines, visual identity, pattern, 1 month revisions',
      'ts.s3.name': 'Business Card (Custom Design)',
      'ts.s3.desc': 'Custom professional double-sided design',
      'ts.s4.name': 'Label',
      'ts.s4.desc': 'Product label design (jar, bottle, packaging)',
      'ts.s5.name': 'Label + Barcode + Mockup + Flyer',
      'ts.s5.desc': 'Complete product label pack with promotional visuals',
      'ts.s6.name': 'Social Media Design',
      'ts.s6.desc': 'Flyers [posters], YouTube Thumbnails',
      'ts.s7.name': 'Small Format Print Design',
      'ts.s7.desc': 'Book covers, badges, certificates, brochures...',
      'ts.s8.name': 'Large Format Print Design',
      'ts.s8.desc': 'Banners, roll-ups, advertisement billboards...',
      'ts.s9.name': 'Pro Packaging Design',
      'ts.s9.desc': 'Product packaging design, boxes, jars and bags',
      'ts.s10.name': 'Video Editing & Animation',
      'ts.s10.desc': 'Pro video editing, clips, ads and 2D/3D animations',
      'ts.s11.name': 'Logo Animation (Intro Video)',
      'ts.s11.desc': 'Bring your logo to life with a smooth video animation',
      'ts.s12.name': 'Motion Design (Flyer & Ads)',
      'ts.s12.desc': 'Captivating graphic animations and animated visuals',
      'ts.s13.name': 'Services Leaflet Design',
      'ts.s13.desc': 'Printable 2 or 3 fold informative brochure',
      'ts.s14.name': 'Animated PowerPoint Presentation',
      'ts.s14.desc': 'Professional animated presentation with scrolling',
      'ts.s15.name': '1 Month Social Media Promotion',
      'ts.s15.desc': 'Targeted promotion campaign (10,000 to 50,000 views)',
      // Portfolio
      'portfolio.tag': 'Portfolio',
      'portfolio.title': 'Some of our recent work',
      'portfolio.subtitle': "Every project is unique, crafted specifically for our clients.",
      'portfolio.cta': 'View Full Portfolio',
      // Contact
      'contact.tag': 'Contact',
      'contact.title': "Let's talk about your project",
      'contact.desc': "Have a project in mind? Contact us and get a free quote within 24h.",
      'form.name': 'Your name',
      'form.email': 'Email address',
      'form.service': 'Desired service',
      'form.budget': 'Estimated budget',
      'form.message': 'Describe your project...',
      'form.submit': 'Send Message',
      'form.sending': 'Sending...',
    }
  };

  let currentLang = 'fr';

  function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[lang][key];
        } else {
          el.innerHTML = translations[lang][key];
        }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    document.documentElement.lang = lang;

    // Traduction dynamique des tarifs interactifs
    const tableHeaderTitle = document.querySelector('.tarifs-th-service');
    const tableHeaderPrice = document.querySelector('.tarifs-th-price');
    const otherTitle = document.querySelector('.tarifs-other-info strong');
    const otherInput = document.getElementById('other-input');
    const noteText = document.querySelector('.tarifs-note');
    const cartHeaderTitle = document.querySelector('.tarifs-cart-header h3');
    const badge10Text = document.querySelector('#badge-10 .badge-text');
    const badge30Text = document.querySelector('#badge-30 .badge-text');
    const btnWhatsapp = document.querySelector('.tarifs-btn-whatsapp');
    const btnQuote = document.querySelector('.tarifs-btn-devis');

    if (tableHeaderTitle) tableHeaderTitle.textContent = translations[lang]['pricing.table_title'];
    if (tableHeaderPrice) tableHeaderPrice.textContent = translations[lang]['pricing.starting_at'];
    if (otherTitle) otherTitle.textContent = translations[lang]['pricing.other'];
    if (otherInput) otherInput.placeholder = translations[lang]['pricing.other_placeholder'];
    if (noteText) noteText.innerHTML = `<span>💡</span> ${translations[lang]['pricing.note']}`;
    if (cartHeaderTitle) cartHeaderTitle.textContent = translations[lang]['pricing.cart_title'];
    if (badge10Text) badge10Text.innerHTML = translations[lang]['pricing.discount_badge_5'];
    if (badge30Text) badge30Text.innerHTML = translations[lang]['pricing.discount_badge_10'];
    if (btnWhatsapp) btnWhatsapp.textContent = translations[lang]['pricing.whatsapp_btn'];
    if (btnQuote) btnQuote.textContent = translations[lang]['pricing.quote_btn'];

    // Re-render table and cart to refresh translations inside rows & items
    // Guard: window.tarifsServices is only set after full initialization
    if (window.tarifsServices && typeof renderTarifsTable === 'function') renderTarifsTable();
    if (window.tarifsServices && typeof updateCart === 'function') updateCart();
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  applyLanguage('fr');

  /* ---- NAVBAR SCROLL ---- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ---- MOBILE MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---- TYPEWRITER EFFECT ---- */
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const wordsFr = ['digitale', 'créative', 'impactante', 'unique'];
    const wordsEn = ['digital', 'creative', 'impactful', 'unique'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const words = currentLang === 'fr' ? wordsFr : wordsEn;
      const word = words[wordIndex];
      if (isDeleting) {
        typewriterEl.textContent = word.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = word.substring(0, charIndex + 1);
        charIndex++;
      }
      if (!isDeleting && charIndex === word.length) {
        setTimeout(() => { isDeleting = true; }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
      setTimeout(type, isDeleting ? 60 : 100);
    }
    type();
  }

  /* ---- COUNTER ANIMATION ---- */
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isFloat = el.getAttribute('data-float') === 'true';
    const duration = 2000;
    const start = performance.now();

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ---- INTERSECTION OBSERVER ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Counter
        const counter = entry.target.querySelector('[data-count]');
        if (counter && !counter.classList.contains('counted')) {
          counter.classList.add('counted');
          animateCounter(counter);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // Also animate counters inside metric items
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (!el.classList.contains('counted')) {
          el.classList.add('counted');
          animateCounter(el);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ---- PAYMENT MODAL ---- */
  const modal = document.getElementById('payment-modal');
  const modalServiceTitle = document.getElementById('modal-service-title');
  const modalServicePrice = document.getElementById('modal-service-price');
  const modalServiceEmoji = document.getElementById('modal-service-emoji');

  document.querySelectorAll('[data-open-payment]').forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.getAttribute('data-service');
      const price = btn.getAttribute('data-price');
      const emoji = btn.getAttribute('data-emoji');
      modalServiceTitle.textContent = service;
      modalServicePrice.textContent = price;
      modalServiceEmoji.textContent = emoji;

      const waBtn = document.getElementById('pay-whatsapp');
      if (waBtn) {
        const text = encodeURIComponent(`Bonjour INOV Digital Services, je souhaite commander : ${service} (${price})`);
        waBtn.href = `https://wa.me/50936255920?text=${text}`;
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'fr' ? 'Envoi en cours...' : 'Sending...';
    btn.disabled = true;

    // Simulate send (replace with actual EmailJS or Formspree)
    setTimeout(() => {
      showToast(currentLang === 'fr' ? '✅ Message envoyé ! Nous vous répondrons sous 24h.' : '✅ Message sent! We\'ll reply within 24h.');
      contactForm.reset();
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1800);
  });

  /* ---- TOAST ---- */
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast success';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- PORTFOLIO ITEMS COLORS ---- */
  const portfolioColors = [
    'linear-gradient(135deg, #1a0533, #4a1080)',
    'linear-gradient(135deg, #001a2e, #003d6b)',
    'linear-gradient(135deg, #0d2a1a, #1a5c38)',
    'linear-gradient(135deg, #2a1200, #5c2e00)',
    'linear-gradient(135deg, #1a001a, #4a0040)',
    'linear-gradient(135deg, #00191a, #003d40)',
  ];

  document.querySelectorAll('.portfolio-placeholder').forEach((el, i) => {
    el.style.background = portfolioColors[i % portfolioColors.length];
  });

  /* ---- PARALLAX HERO ---- */
  window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    }
  });

  /* ================================================================
     TARIFS INTERACTIFS — Sélection & Panier
  ================================================================ */
  const tarifsServices = [
    { id: 1, keyName: 'ts.s1.name', keyDesc: 'ts.s1.desc', price: 72, checked: false },
    { id: 2, keyName: 'ts.s2.name', keyDesc: 'ts.s2.desc', price: 540, checked: false },
    { id: 3, keyName: 'ts.s3.name', keyDesc: 'ts.s3.desc', price: 20, checked: false },
    { id: 4, keyName: 'ts.s4.name', keyDesc: 'ts.s4.desc', price: 27, checked: false },
    { id: 5, keyName: 'ts.s5.name', keyDesc: 'ts.s5.desc', price: 54, checked: false },
    { id: 6, keyName: 'ts.s6.name', keyDesc: 'ts.s6.desc', price: 36, checked: false },
    { id: 7, keyName: 'ts.s7.name', keyDesc: 'ts.s7.desc', price: 36, checked: false },
    { id: 8, keyName: 'ts.s8.name', keyDesc: 'ts.s8.desc', price: 45, checked: false },
    { id: 9, keyName: 'ts.s9.name', keyDesc: 'ts.s9.desc', price: 35, checked: false },
    { id: 10, keyName: 'ts.s10.name', keyDesc: 'ts.s10.desc', price: 50, checked: false },
    { id: 11, keyName: 'ts.s11.name', keyDesc: 'ts.s11.desc', price: 35, checked: false },
    { id: 12, keyName: 'ts.s12.name', keyDesc: 'ts.s12.desc', price: 35, checked: false },
    { id: 13, keyName: 'ts.s13.name', keyDesc: 'ts.s13.desc', price: 30, checked: false },
    { id: 14, keyName: 'ts.s14.name', keyDesc: 'ts.s14.desc', price: 35, checked: false },
    { id: 15, keyName: 'ts.s15.name', keyDesc: 'ts.s15.desc', price: 35, checked: false }
  ];

  window.tarifsServices = tarifsServices;

  function renderTarifsTable() {
    const container = document.getElementById('tarifs-body');
    if (!container) return;
    container.innerHTML = '';

    tarifsServices.forEach((service, index) => {
      const row = document.createElement('div');
      row.className = `tarifs-row ${service.checked ? 'selected' : ''}`;
      row.onclick = (e) => {
        if (e.target.tagName !== 'INPUT') {
          const cb = row.querySelector('.tarifs-checkbox');
          cb.checked = !cb.checked;
          service.checked = cb.checked;
          renderTarifsTable();
          updateCart();
        }
      };

      const displayName = translations[currentLang][service.keyName] || service.keyName;
      const displayDesc = translations[currentLang][service.keyDesc] || service.keyDesc;

      row.innerHTML = `
        <div class="tarifs-row-info">
          <input type="checkbox" class="tarifs-checkbox" ${service.checked ? 'checked' : ''} onchange="toggleTarifsService(${index}, this.checked, event)">
          <div class="tarifs-row-text">
            <span class="tarifs-row-name">${displayName}</span>
            <span class="tarifs-row-desc">${displayDesc}</span>
          </div>
        </div>
        <div class="tarifs-row-price">${service.price} $US</div>
      `;
      container.appendChild(row);
    });
  }

  window.toggleTarifsService = function(index, isChecked, event) {
    if (event) event.stopPropagation();
    tarifsServices[index].checked = isChecked;
    renderTarifsTable();
    updateCart();
  };

  window.toggleOther = function() {
    const cb = document.getElementById('other-checkbox');
    const input = document.getElementById('other-input');
    if (cb && input) {
      input.disabled = !cb.checked;
      if (cb.checked) {
        input.focus();
      }
      updateCart();
    }
  };

  window.updateCart = function() {
    const selected = tarifsServices.filter(s => s.checked);
    const otherCb = document.getElementById('other-checkbox');
    const otherInput = document.getElementById('other-input');
    const hasOther = otherCb && otherCb.checked;
    
    let otherLabelDefault = translations[currentLang]['pricing.whatsapp_other'] || 'Autre';
    let otherDetail = (hasOther && otherInput && otherInput.value.trim()) ? otherInput.value.trim() : otherLabelDefault;

    const cartCountEl = document.getElementById('cart-count');
    const cartItemsEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartSummaryEl = document.getElementById('cart-summary');
    const cartActionsEl = document.getElementById('cart-actions');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartDiscountLineEl = document.getElementById('cart-discount-line');
    const cartDiscountLabelEl = document.getElementById('cart-discount-label');
    const cartDiscountAmountEl = document.getElementById('cart-discount-amount');
    const cartTotalEl = document.getElementById('cart-total');
    const badge10 = document.getElementById('badge-10');
    const badge30 = document.getElementById('badge-30');

    let totalCount = selected.length + (hasOther ? 1 : 0);
    if (cartCountEl) cartCountEl.textContent = totalCount;

    if (totalCount === 0) {
      if (cartEmptyEl) cartEmptyEl.style.display = 'block';
      if (cartSummaryEl) cartSummaryEl.style.display = 'none';
      if (cartActionsEl) cartActionsEl.style.display = 'none';
      if (cartItemsEl) {
        cartItemsEl.innerHTML = `
          <div class="tarifs-cart-empty">
            <span>📋</span>
            <p>${translations[currentLang]['pricing.cart_empty']}</p>
          </div>
        `;
      }
      if (badge10) badge10.classList.remove('active');
      if (badge30) badge30.classList.remove('active');
      return;
    }

    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    if (cartSummaryEl) cartSummaryEl.style.display = 'block';
    if (cartActionsEl) cartActionsEl.style.display = 'flex';

    // Build items HTML
    let itemsHTML = '';
    let subtotal = 0;

    selected.forEach((service) => {
      subtotal += service.price;
      const displayName = translations[currentLang][service.keyName] || service.keyName;
      itemsHTML += `
        <div class="tarifs-cart-item">
          <span class="tarifs-cart-item-name">• ${displayName}</span>
          <span class="tarifs-cart-item-price">${service.price} $US</span>
          <button class="tarifs-cart-item-remove" onclick="removeTarifItem(${service.id})" title="Retirer">✕</button>
        </div>
      `;
    });

    if (hasOther) {
      const otherPrice = 20;
      subtotal += otherPrice;
      itemsHTML += `
        <div class="tarifs-cart-item">
          <span class="tarifs-cart-item-name">• ${otherLabelDefault}: ${otherDetail}</span>
          <span class="tarifs-cart-item-price">${otherPrice} $US</span>
          <button class="tarifs-cart-item-remove" onclick="removeOtherItem()" title="Retirer">✕</button>
        </div>
      `;
    }

    if (cartItemsEl) cartItemsEl.innerHTML = itemsHTML;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `${subtotal} $US`;

    // Calculate volume discount (10% for 5+, 30% for 10+)
    let discountPercent = 0;
    if (totalCount >= 10) {
      discountPercent = 30;
      if (badge30) badge30.classList.add('active');
      if (badge10) badge10.classList.remove('active');
    } else if (totalCount >= 5) {
      discountPercent = 10;
      if (badge10) badge10.classList.add('active');
      if (badge30) badge30.classList.remove('active');
    } else {
      if (badge10) badge10.classList.remove('active');
      if (badge30) badge30.classList.remove('active');
    }

    let discountAmount = Math.round((subtotal * discountPercent) / 100);
    let finalTotal = subtotal - discountAmount;
    let acompte = Math.round(finalTotal * 0.7);

    if (discountPercent > 0) {
      if (cartDiscountLineEl) cartDiscountLineEl.style.display = 'flex';
      const discountLabel = translations[currentLang]['pricing.discount'] || 'Réduction';
      if (cartDiscountLabelEl) cartDiscountLabelEl.textContent = `${discountLabel} (${discountPercent}%)`;
      if (cartDiscountAmountEl) cartDiscountAmountEl.textContent = `- ${discountAmount} $US`;
    } else {
      if (cartDiscountLineEl) cartDiscountLineEl.style.display = 'none';
    }

    const subtotalLabel = document.querySelector('.tarifs-cart-line span:first-child');
    if (subtotalLabel) subtotalLabel.textContent = translations[currentLang]['pricing.subtotal'] || 'Sous-total';
    const totalLabel = document.querySelector('.tarifs-cart-total span:first-child');
    if (totalLabel) totalLabel.textContent = translations[currentLang]['pricing.total'] || 'Total estimé';

    if (cartTotalEl) cartTotalEl.textContent = `${finalTotal} $US`;
    const cartAcompteEl = document.getElementById('cart-acompte');
    if (cartAcompteEl) cartAcompteEl.textContent = `${acompte} $US`;
  };

  window.removeTarifItem = function(id) {
    const item = tarifsServices.find(s => s.id === id);
    if (item) {
      item.checked = false;
      renderTarifsTable();
      updateCart();
    }
  };

  window.removeOtherItem = function() {
    const cb = document.getElementById('other-checkbox');
    const input = document.getElementById('other-input');
    if (cb) cb.checked = false;
    if (input) {
      input.disabled = true;
      input.value = '';
    }
    updateCart();
  };

  window.commanderWhatsAppTarifs = function() {
    const selected = tarifsServices.filter(s => s.checked);
    const otherCb = document.getElementById('other-checkbox');
    const otherInput = document.getElementById('other-input');
    const hasOther = otherCb && otherCb.checked;
    let otherLabelDefault = translations[currentLang]['pricing.whatsapp_other'] || 'Autre';
    let otherDetail = (hasOther && otherInput && otherInput.value.trim()) ? otherInput.value.trim() : otherLabelDefault;

    let totalCount = selected.length + (hasOther ? 1 : 0);
    if (totalCount === 0) {
      const errorMsg = currentLang === 'fr' ? 'Veuillez sélectionner au moins un service.' : 'Please select at least one service.';
      showToast(errorMsg);
      return;
    }

    let subtotal = selected.reduce((sum, item) => sum + item.price, 0) + (hasOther ? 20 : 0);
    let discountPercent = totalCount >= 10 ? 30 : (totalCount >= 5 ? 10 : 0);
    let discountAmount = Math.round((subtotal * discountPercent) / 100);
    let finalTotal = subtotal - discountAmount;
    let acompte = Math.round(finalTotal * 0.7);

    let listText = selected.map(s => {
      const displayName = translations[currentLang][s.keyName] || s.keyName;
      return `• ${displayName} (${s.price} $US)`;
    }).join('%0A');

    if (hasOther) {
      listText += (listText ? '%0A' : '') + `• ${otherLabelDefault}: ${otherDetail} (à partir de 20 $US)`;
    }

    let discountTitle = translations[currentLang]['pricing.discount'] || 'Réduction';
    let discountMsg = discountPercent > 0 ? `%0A*${discountTitle} : -${discountPercent}% (-${discountAmount} $US)*` : '';

    let helloMsg = translations[currentLang]['pricing.whatsapp_hello'] || 'Bonjour INOV Digital Services ! Je souhaite commander les services suivants :';
    let totalTitle = translations[currentLang]['pricing.total'] || 'Total estimé';
    let acompteTitle = translations[currentLang]['pricing.acompte'] || 'Acompte 70% requis';

    let message = `${helloMsg}%0A${listText}%0A${discountMsg}%0A*${totalTitle} : ${finalTotal} $US*%0A*${acompteTitle} : ${acompte} $US*`;

    window.open(`https://wa.me/50936255920?text=${message}`, '_blank');
  };

  /* ================================================================
     NUMÉRO DE SÉRIE — Basé sur la date/heure
  ================================================================ */
  function getNextSerial() {
    const now = new Date();
    const year = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `N° PF-${year}-${hh}${mm}${ss}`;
  }

  /* ================================================================
     TÉLÉCHARGEMENT DEVIS PDF
  ================================================================ */
  window.telechargerDevisPDF = function() {
    const selected = tarifsServices.filter(s => s.checked);
    const otherCb = document.getElementById('other-checkbox');
    const otherInput = document.getElementById('other-input');
    const hasOther = otherCb && otherCb.checked;
    let otherLabelDefault = translations[currentLang]['pricing.whatsapp_other'] || 'Autre';
    let otherDetail = (hasOther && otherInput && otherInput.value.trim()) ? otherInput.value.trim() : otherLabelDefault;

    let totalCount = selected.length + (hasOther ? 1 : 0);
    if (totalCount === 0) {
      const errorMsg = currentLang === 'fr' ? 'Veuillez sélectionner au moins un service.' : 'Please select at least one service.';
      showToast(errorMsg);
      return;
    }

    // --- Remplir le template PDF ---
    const clientName = document.getElementById('devis-client-name')?.value.trim() || 'Client';

    // Numéro de série auto-généré à partir de la date/heure
    const serialNumber = getNextSerial();

    // Afficher le numéro dans le champ du panier (lecture seule)
    const devisNumField = document.getElementById('devis-num');
    if (devisNumField) devisNumField.value = serialNumber;

    // Date du jour
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

    // Injecter les données de méta
    const pdfClientEl = document.getElementById('pdf-client-name');
    const pdfDocNumEl = document.getElementById('pdf-doc-num');
    const pdfDateEl = document.getElementById('pdf-date');
    if (pdfClientEl) pdfClientEl.textContent = clientName.toUpperCase();
    if (pdfDocNumEl) pdfDocNumEl.textContent = serialNumber;
    if (pdfDateEl) pdfDateEl.textContent = dateStr;

    // Construire les lignes du tableau de services
    const tbody = document.getElementById('pdf-services-body');
    if (tbody) {
      tbody.innerHTML = '';
      let subtotal = 0;

      selected.forEach((service, i) => {
        subtotal += service.price;
        const displayName = (translations[currentLang][service.keyName] || service.keyName).toUpperCase();
        const bgColor = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="border:1px solid #000;padding:9px 12px;font-size:11px;font-weight:800;color:#000;background:${bgColor};">${displayName}</td>
          <td style="border:1px solid #000;padding:9px 12px;font-size:11px;font-weight:800;color:#000;text-align:right;white-space:nowrap;background:${bgColor};">${service.price} $ US</td>
        `;
        tbody.appendChild(tr);
      });

      if (hasOther) {
        subtotal += 20;
        const bgColor = selected.length % 2 === 0 ? '#ffffff' : '#f9f9f9';
        const trOther = document.createElement('tr');
        trOther.innerHTML = `
          <td style="border:1px solid #000;padding:9px 12px;font-size:11px;font-weight:800;color:#000;background:${bgColor};">${otherLabelDefault.toUpperCase()}: ${otherDetail}</td>
          <td style="border:1px solid #000;padding:9px 12px;font-size:11px;font-weight:800;color:#000;text-align:right;white-space:nowrap;background:${bgColor};">20 $ US</td>
        `;
        tbody.appendChild(trOther);
      }

      // Calcul de la réduction
      let discountPercent = totalCount >= 10 ? 30 : (totalCount >= 5 ? 10 : 0);
      let discountAmount = Math.round((subtotal * discountPercent) / 100);
      let finalTotal = subtotal - discountAmount;
      let acompte = Math.round(finalTotal * 0.7);

      if (discountPercent > 0) {
        // Ligne Sous-total
        const trSubtotal = document.createElement('tr');
        trSubtotal.innerHTML = `
          <td style="border:1px solid #000;padding:8px 12px;font-size:11px;font-weight:800;color:#333;background:#f0f0f5;text-align:right;">Sous-total :</td>
          <td style="border:1px solid #000;padding:8px 12px;font-size:11px;font-weight:800;color:#333;text-align:right;white-space:nowrap;background:#f0f0f5;">${subtotal} $ US</td>
        `;
        tbody.appendChild(trSubtotal);

        // Ligne Réduction
        const trDiscount = document.createElement('tr');
        trDiscount.innerHTML = `
          <td style="border:1px solid #000;padding:8px 12px;font-size:11px;font-weight:800;color:#ff5500;background:#fff6f0;text-align:right;">Réduction (${discountPercent}%) :</td>
          <td style="border:1px solid #000;padding:8px 12px;font-size:11px;font-weight:800;color:#ff5500;text-align:right;white-space:nowrap;background:#fff6f0;">- ${discountAmount} $ US</td>
        `;
        tbody.appendChild(trDiscount);
      }

      // Remplir les badges de réduction dans le PDF
      const pdfBadge5 = document.getElementById('pdf-badge-5');
      const pdfBadge10 = document.getElementById('pdf-badge-10');
      const pdfDiscountText = document.getElementById('pdf-discount-text');
      if (pdfBadge5) pdfBadge5.style.display = (discountPercent === 10) ? 'block' : 'none';
      if (pdfBadge10) pdfBadge10.style.display = (discountPercent === 30) ? 'block' : 'none';
      if (pdfDiscountText) {
        pdfDiscountText.textContent = discountPercent > 0
          ? `Réduction de ${discountPercent}% appliquée (-${discountAmount} $ US)`
          : '';
      }

      const pdfTotalEl = document.getElementById('pdf-total');
      if (pdfTotalEl) pdfTotalEl.textContent = `${finalTotal} $ US`;

      // Acompte 70%
      const pdfAcompteEl = document.getElementById('pdf-acompte');
      if (pdfAcompteEl) pdfAcompteEl.textContent = `${acompte} $ US`;
    }

    // --- Générer le PDF ---
    const element = document.getElementById('devis-pdf-doc');
    const tpl = document.getElementById('devis-pdf-template');
    const filename = `Proforma_INOV_${clientName.replace(/\s+/g, '_')}.pdf`;

    // Mémoriser la position de défilement actuelle de l'utilisateur
    const prevScrollY = window.scrollY || window.pageYOffset || 0;

    // Déplacer temporairement la fenêtre en haut pour une capture html2canvas parfaite sans décalage
    window.scrollTo(0, 0);

    tpl.style.position = 'absolute';
    tpl.style.top = '0px';
    tpl.style.left = '0px';
    tpl.style.opacity = '1';
    tpl.style.zIndex = '99999';

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        tpl.style.opacity = '0';
        tpl.style.zIndex = '-9999';
        window.scrollTo(0, prevScrollY);
        showToast(currentLang === 'fr' ? '✅ Devis PDF téléchargé !' : '✅ PDF quote downloaded!');
      }).catch(err => {
        tpl.style.opacity = '0';
        tpl.style.zIndex = '-9999';
        window.scrollTo(0, prevScrollY);
        console.error('PDF error:', err);
      });
    }, 150);
  };

  // --- FILTRES DU PORTFOLIO ---
  window.filtrerPortfolio = function(cat, btn) {
    document.querySelectorAll('.portfolio-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('#portfolio-grid .portfolio-item').forEach(item => {
      const categories = item.getAttribute('data-category') || '';
      if (cat === 'all' || categories.includes(cat)) {
        item.style.display = 'block';
        item.style.opacity = '1';
      } else {
        item.style.display = 'none';
        item.style.opacity = '0';
      }
    });
  };

  // --- FAQ ACCORDION ---
  window.toggleFAQ = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };

  // Afficher / masquer les champs client & la barre mobile avec le panier
  const origUpdateCart = window.updateCart;
  window.updateCart = function() {
    origUpdateCart();
    const selected = tarifsServices.filter(s => s.checked);
    const otherCb = document.getElementById('other-checkbox');
    const hasOther = otherCb && otherCb.checked;
    const totalCount = selected.length + (hasOther ? 1 : 0);
    const clientFields = document.getElementById('tarifs-client-fields');
    if (clientFields) {
      clientFields.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    // Mise à jour de la barre flottante sur mobile
    const mobileBar = document.getElementById('mobile-cart-bar');
    const mobileCount = document.getElementById('mobile-cart-count');
    const mobileTotal = document.getElementById('mobile-cart-total');
    const cartTotalEl = document.getElementById('cart-total');

    if (mobileBar) {
      if (totalCount > 0) {
        mobileBar.classList.add('active');
        if (mobileCount) mobileCount.textContent = `${totalCount} service(s) sélectionné(s)`;
        if (mobileTotal && cartTotalEl) mobileTotal.textContent = cartTotalEl.textContent;
      } else {
        mobileBar.classList.remove('active');
      }
    }
  };

  // Initialisation de la table des tarifs
  renderTarifsTable();

});
