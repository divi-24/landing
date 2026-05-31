import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Gem,
  Instagram,
  Menu,
  MessageSquare,
  PackageCheck,
  Radar,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const signupUrl = 'https://ondropp.app/signup?role=brand';
const loginUrl = 'https://ondropp.app/login';

const creatorStack = [
  { name: 'Mira Jain', handle: '@miraglow', fit: 96, niche: 'Beauty', image: '/img/editorial/makeup-vanity.jpg' },
  { name: 'Ava Sol', handle: '@avashelf', fit: 91, niche: 'Skincare', image: '/img/editorial/minimal-skincare.jpg' },
  { name: 'Nora Kim', handle: '@norarituals', fit: 88, niche: 'Wellness', image: '/img/editorial/skincare-drop.jpg' },
];

const metrics = [
  { value: '42', label: 'taste-fit creators' },
  { value: '3.8x', label: 'save intent lift' },
  { value: '72h', label: 'brief to shortlist' },
];

const productImages = [
  '/img/editorial/beauty-flatlay.jpg',
  '/img/editorial/makeup-vanity.jpg',
  '/img/editorial/cosmetic-lineup.jpg',
  '/img/editorial/skincare-drop.jpg',
  '/img/editorial/minimal-skincare.jpg',
  '/img/editorial/beauty-tools.jpg',
];

const features = [
  {
    icon: Radar,
    title: 'Creator fit graph',
    copy: 'Match creators by taste, category, content language, audience signal, and past campaign behavior.',
  },
  {
    icon: PackageCheck,
    title: 'Product launch room',
    copy: 'Keep briefs, products, approvals, content, timelines, and live links in one polished workspace.',
  },
  {
    icon: BarChart3,
    title: 'Signal analytics',
    copy: 'Track saves, clicks, creator contribution, and product intent while the campaign is still moving.',
  },
];

const workflow = [
  ['01', 'Build the story', 'Create a product brief with deliverables, mood, creator criteria, and budget.'],
  ['02', 'Shortlist by fit', 'Review creators with audience context, visual style, niche tags, and fit score.'],
  ['03', 'Ship the drop', 'Manage product seeding, content approvals, timelines, and campaign threads.'],
  ['04', 'Read demand', 'See what people save, click, and buy so the next launch gets sharper.'],
];

const ticker = ['Creator discovery', 'Product seeding', 'Campaign rooms', 'Approvals', 'Attribution', 'Creator storefronts'];

const MotionMain = motion.main;

const App = () => {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const mockupY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        '.reveal-up',
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.brand-section-start', start: 'top 74%' },
        },
      );

      gsap.fromTo(
        '.workflow-step-card',
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '.workflow-grid', start: 'top 78%' },
        },
      );

      gsap.to('.orbital-ring', {
        rotate: 360,
        duration: 42,
        repeat: -1,
        ease: 'none',
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <MotionMain ref={rootRef} className="brand-landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <nav className="brand-nav" aria-label="Dropp brands navigation">
        <a className="brand-logo" href="#top" aria-label="Dropp brands home">
          <img src="/img/dropp-logo-wordmark.png" alt="Dropp" />
          <span>Brands</span>
        </a>
        <div className={`brand-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>Workflow</a>
          <a href="#proof" onClick={() => setMenuOpen(false)}>Proof</a>
          <a href={loginUrl} onClick={() => setMenuOpen(false)}>Login</a>
        </div>
        <div className="brand-nav-actions">
          <a className="brand-button brand-button-sm brand-button-dark" href={signupUrl}>
            Start
            <ArrowRight size={15} />
          </a>
          <button className="brand-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <section id="top" ref={heroRef} className="hero">
        <div className="hero-noise" />
        <motion.div className="hero-copy" style={{ y: heroY }}>
          <motion.div className="brand-pill" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Sparkles size={15} />
            Creator-led commerce for brands
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.78, ease: [0.16, 1, 0.3, 1] }}>
            Launch products with creators people already trust.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.7 }}>
            Dropp brings creator discovery, product seeding, campaign rooms, and performance signal into one calm operating layer for brand teams.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
            <a className="brand-button brand-button-dark" href={signupUrl}>Launch a brand drop<Zap size={17} /></a>
            <a className="brand-button brand-button-soft" href="#platform">See platform<ChevronRight size={17} /></a>
          </motion.div>
        </motion.div>

        <motion.div className="hero-product" style={{ y: mockupY }} initial={{ opacity: 0, y: 44, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.38, duration: 0.86, ease: [0.16, 1, 0.3, 1] }}>
          <div className="orbital-ring" aria-hidden="true" />
          <div className="app-window">
            <div className="window-top">
              <span />
              <span />
              <span />
            </div>
            <div className="campaign-preview">
              <div>
                <small>Campaign room</small>
                <h2>Summer Skin Drop</h2>
              </div>
              <strong>92 fit</strong>
            </div>
            <div className="creator-stack">
              {creatorStack.map((creator) => (
                <article key={creator.handle}>
                  <img src={creator.image} alt="" />
                  <div>
                    <strong>{creator.name}</strong>
                    <span>{creator.handle} · {creator.niche}</span>
                  </div>
                  <em>{creator.fit}</em>
                </article>
              ))}
            </div>
            <div className="signal-panel">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="brand-marquee" aria-label="Dropp brand platform capabilities">
        <div>
          {Array.from({ length: 2 }).map((_, group) => (
            <div className="marquee-track" key={group}>
              {ticker.map((item) => <span key={`${group}-${item}`}>{item}</span>)}
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="brand-section brand-section-start">
        <div className="section-heading reveal-up">
          <span className="brand-eyebrow">One product layer</span>
          <h2>A beautiful command center for creator-led launches.</h2>
          <p>Designed for teams that care about brand feel, creator quality, and measurable demand.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, copy }) => (
            <motion.article className="feature-card reveal-up" key={title} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="visual-story" id="proof">
        <div className="visual-copy">
          <span className="brand-eyebrow">Product stories</span>
          <h2>Campaign pages that feel editorial and operate like software.</h2>
          <p>Give each launch a visual world creators can collect, share, and sell through.</p>
        </div>
        <div className="image-rail">
          <div className="image-track">
            {Array.from({ length: 2 }).map((_, group) => productImages.map((src, index) => (
              <article className="story-card" key={`${group}-${src}`}>
                <img src={src} alt="" loading="lazy" decoding="async" />
                <div>
                  <span>{index % 2 ? 'Creator edit' : 'Product board'}</span>
                  <strong>{['Beauty drop', 'Ritual kit', 'Launch shelf', 'Signal set', 'Seeding room', 'GRWM brief'][index]}</strong>
                </div>
              </article>
            )))}
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="section-heading">
          <span className="brand-eyebrow">Workflow</span>
          <h2>Move from brief to demand without losing the plot.</h2>
        </div>
        <div className="workflow-grid">
          {workflow.map(([step, title, copy]) => (
            <article className="workflow-step-card" key={title}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="metric-section">
        <div>
          <span className="brand-pill brand-pill-dark"><CircleDollarSign size={15} />Signal, not noise</span>
          <h2>Know which creators actually make people care.</h2>
        </div>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="final-section">
        <div className="final-card">
          <div>
            <span className="brand-eyebrow">Dropp for Brands</span>
            <h2>Build product demand with the creators your audience believes.</h2>
            <p>Start a creator-led launch system with discovery, campaign management, product pages, and signal analytics in one place.</p>
          </div>
          <div className="final-actions">
            <a className="brand-button brand-button-dark" href={signupUrl}>Start brand launch<Send size={17} /></a>
            <a className="brand-button brand-button-soft" href={loginUrl}>Brand login<Users size={17} /></a>
          </div>
        </div>
      </section>

      <footer className="brand-footer">
        <div>
          <img src="/img/dropp-logo-wordmark.png" alt="Dropp" />
          <p>The creator commerce platform for modern brand teams.</p>
        </div>
        <div className="footer-links">
          <a href="#platform">Platform</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
          <a href={loginUrl}>Login</a>
          <a href="https://instagram.com/ondropp" aria-label="Dropp Instagram"><Instagram size={18} /></a>
        </div>
        <span>© {new Date().getFullYear()} Dropp</span>
      </footer>
    </MotionMain>
  );
};

export default App;
