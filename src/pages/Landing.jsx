import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Instagram,
  Layers3,
  Linkedin,
  Link2,
  Menu,
  Play,
  Share2,
  Sparkles,
  Store,
  TrendingUp,
  Twitter,
  Users,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import AudienceArchCarousel from '../components/AudienceArchCarousel';
import '../styles/Landing.css';

gsap.registerPlugin(ScrollTrigger);

const showcaseImages = [
  {
    title: 'Build Collections',
    kicker: 'Collections',
    src: '/videos/Dropp_Collections_Video_Generation.mp4',
    color: '#7c4dff',
  },
  {
    title: 'Design Your Profile',
    kicker: 'Creator Profile',
    src: '/videos/Dropp_Creator_Profile_Video_Generation.mp4',
    color: '#ffc247',
  },
  {
    title: 'Share Product Pages',
    kicker: 'Product Pages',
    src: '/videos/Dropp_Product_Page_Video_Generation.mp4',
    color: '#00d7b9',
  },
  {
    title: 'Explore New Drops',
    kicker: 'Explore',
    src: '/videos/Dropp_Explore_Feature_Video_Generation.mp4',
    color: '#ff4b2f',
  },
];

const galleryImages = [
  { src: '/img/editorial/beauty-flatlay.jpg', title: 'Soft Flatlay', tag: 'Beauty edit' },
  { src: '/img/editorial/makeup-vanity.jpg', title: 'Vanity Story', tag: 'Creator shelf' },
  { src: '/img/editorial/cosmetic-lineup.jpg', title: 'Lineup Glow', tag: 'Product story' },
  { src: '/img/editorial/skincare-drop.jpg', title: 'Skin Ritual', tag: 'Routine save' },
  { src: '/img/editorial/minimal-skincare.jpg', title: 'Clean System', tag: 'Minimal care' },
  { src: '/img/editorial/beauty-tools.jpg', title: 'Tool Moment', tag: 'GRWM pick' },
];

const heroCards = [
  { src: '/img/dropp%201.jpg', title: 'Dropp Edit 01', tag: 'Statement pick', badge: 'Trend Drop', color: '#c9ff4f', position: 'center center' },
  { src: '/img/dropp2.jpg', title: 'Dropp Edit 02', tag: 'Creator staple', badge: 'Daily Find', color: '#ff2f92', position: 'center center' },
  { src: '/img/dropp3.jpg', title: 'Dropp Edit 03', tag: 'Style save', badge: 'Outfit Cue', color: '#00d7b9', position: 'center center' },
  { src: '/img/dropp4.jpg', title: 'Dropp Edit 04', tag: 'Wishlist ready', badge: 'Hot Pick', color: '#ffc247', position: 'center center' },
  { src: '/img/dropp5.jpg', title: 'Dropp Edit 05', tag: 'Taste signal', badge: 'Mood Match', color: '#7c4dff', position: 'center center' },
  { src: '/img/dropp6.jpg', title: 'Dropp Edit 06', tag: 'Made to share', badge: 'Fresh Drop', color: '#ff4b2f', position: 'center center' },
  { src: '/img/dropp7.jpg', title: 'Dropp Edit 07', tag: 'Shop the vibe', badge: 'Vibe Check', color: '#18c7a7', position: 'center center' },
  { src: '/img/dropp8.jpg', title: 'Dropp Edit 08', tag: 'Curated crush', badge: 'Creator Pick', color: '#ff8cc8', position: 'center center' },
  { src: '/img/dropp9.jpg', title: 'Dropp Edit 09', tag: 'Add to drop', badge: 'Shelf Star', color: '#9d8cff', position: 'center center' },
  { src: '/img/dropp10.jpg', title: 'Dropp Edit 10', tag: 'Product story', badge: 'Style Note', color: '#ffb000', position: 'center center' },
  { src: '/img/dropp11.jpg', title: 'Dropp Edit 11', tag: 'Audience bait', badge: 'Click Magnet', color: '#00d7b9', position: 'center center' },
  { src: '/img/dropp12.jpg', title: 'Dropp Edit 12', tag: 'Ready to recommend', badge: 'Final Find', color: '#ff4b2f', position: 'center center' },
];

const heroCardTilts = [-4, 2, -2, 4, -3, 3, -1, 2, -4, 3, -2, 4];

const heroTicker = [
  'No generic storefronts',
  'Tailor-made drops',
  'Post-as-you-please',
  'Fast creator setup',
  'Tracked earnings',
  'Products with taste',
];

const features = [
  {
    icon: Layers3,
    title: 'Shoppable Collections',
    copy: 'Turn your taste into curated storefronts with drop-ready cards, categories, and product stories.',
    accent: '#ff2f92',
    metric: 'Curate',
    chips: ['Boards', 'Drops', 'Links'],
  },
  {
    icon: Share2,
    title: 'Share Anywhere',
    copy: 'Publish your picks across socials with clean links, tracked journeys, and creator-first attribution.',
    accent: '#00d7b9',
    metric: 'Amplify',
    chips: ['Social', 'Track', 'Convert'],
  },
  {
    icon: BarChart3,
    title: 'Creator Analytics',
    copy: 'See what people click, save, love, and buy so every recommendation gets sharper.',
    accent: '#7c4dff',
    metric: 'Measure',
    chips: ['Clicks', 'Saves', 'Sales'],
  },
  {
    icon: Store,
    title: 'Brand Campaigns',
    copy: 'Give brands a smarter way to find creators, launch campaigns, and move products through trust.',
    accent: '#ffc247',
    metric: 'Launch',
    chips: ['Briefs', 'Creators', 'ROI'],
  },
];

const workflow = [
  {
    step: '01',
    icon: WandSparkles,
    title: 'Curate the look',
    copy: 'Collect products from brands you love and arrange them like a visual story.',
  },
  {
    step: '02',
    icon: Link2,
    title: 'Drop the link',
    copy: 'Share one clean profile, one product, or a full collection everywhere your audience already lives.',
  },
  {
    step: '03',
    icon: CircleDollarSign,
    title: 'Earn on action',
    copy: 'Track revenue, campaign performance, and audience intent without messy spreadsheets.',
  },
];

const audienceCards = [
  { group: 'creator', title: 'Personal storefront', img: '/img/cards/hq_personal_storefront.png', tone: 'light' },
  { group: 'creator', title: 'Curated collections', img: '/img/cards/hq_curated_collections.png', tone: 'light' },
  { group: 'creator', title: 'Affiliate revenue', img: '/img/cards/hq_affiliate_revenue.png', tone: 'light' },
  { group: 'creator', title: 'Audience analytics', img: '/img/cards/hq_audience_analytics.png', tone: 'light' },
  { group: 'brand', title: 'Creator discovery', img: '/img/cards/hq_creator_discovery.png', tone: 'light' },
  { group: 'brand', title: 'Campaign workflows', img: '/img/cards/hq_campaign_workflows.png', tone: 'light' },
  { group: 'brand', title: 'Product pages', img: '/img/cards/hq_product_pages.png', tone: 'light' },
  { group: 'brand', title: 'Performance insights', img: '/img/cards/hq_performance_insights.png', tone: 'light' },
];

const audienceGroups = [
  {
    id: 'creator',
    index: '01',
    label: 'Creators',
    lead: 'Curate culture.',
    tagline: 'Storefronts, collections, and affiliate revenue, one home for your taste.',
  },
  {
    id: 'brand',
    index: '02',
    label: 'Brands',
    lead: 'Find your fit.',
    tagline: 'Discover creators, run campaigns, and track what actually converts.',
  },
];

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'Product', href: '/products' },
      { label: 'Workflow', href: '#workflow' },
      { label: 'Creators', href: '#creators' },
    ],
  },
  {
    title: 'Dropp',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Login', href: '/login' },
      { label: 'Join', href: '/waitlist' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const footerSocials = [
  { label: 'Instagram', href: 'https://www.instagram.com/dropp_app?igsh=MXE5dTFyYWVmYTd1Mw==', Icon: Instagram },
  { label: 'X', href: 'https://x.com/ondroppapp', Icon: Twitter },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ondropp/', Icon: Linkedin },
];

const spring = { type: 'spring', stiffness: 240, damping: 24 };
const MotionMain = motion.main;
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionArticle = motion.article;
const MotionImg = motion.img;

const Landing = () => {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const atelierRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedFeatureCards, setFlippedFeatureCards] = useState({});
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: atelierProgress } = useScroll({
    target: atelierRef,
    offset: ['start 82%', 'end 38%'],
  });
  const heroCopyY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const atelierCardOneY = useTransform(atelierProgress, [0, 0.28], [150, 0]);
  const atelierCardOneRotate = useTransform(atelierProgress, [0, 0.28], [-9, 0]);
  const atelierCardOneOpacity = useTransform(atelierProgress, [0, 0.16], [0, 1]);
  const atelierCardTwoY = useTransform(atelierProgress, [0.18, 0.52], [170, 0]);
  const atelierCardTwoRotate = useTransform(atelierProgress, [0.18, 0.52], [7, 0]);
  const atelierCardTwoOpacity = useTransform(atelierProgress, [0.18, 0.34], [0, 1]);
  const atelierCardThreeY = useTransform(atelierProgress, [0.38, 0.76], [190, 0]);
  const atelierCardThreeRotate = useTransform(atelierProgress, [0.38, 0.76], [-6, 0]);
  const atelierCardThreeOpacity = useTransform(atelierProgress, [0.38, 0.52], [0, 1]);
  const toggleFeatureCard = (title) => {
    setFlippedFeatureCards((cards) => ({
      ...cards,
      [title]: !cards[title],
    }));
  };

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        '.gsap-reveal',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.dropp-showcase',
            start: 'top 72%',
          },
        },
      );

      gsap.to('.dropp-marquee-track', {
        xPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.dropp-marquee',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.7,
        },
      });

      gsap.fromTo(
        '.workflow-card',
        { opacity: 0, y: 60, rotateX: 9 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.workflow-grid',
            start: 'top 76%',
          },
        },
      );
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <MotionMain
      ref={rootRef}
      className="dropp-landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <nav className="dropp-nav" aria-label="Landing navigation">
        <Link to="/landing" className="dropp-logo" aria-label="Dropp home">
          <img src="/img/dropp-logo-wordmark.png" alt="Dropp" />
        </Link>

        <div className={`dropp-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Product</Link>
          <Link to="/brand" onClick={() => setMenuOpen(false)}>Brand</Link>
          <Link to="/creators" onClick={() => setMenuOpen(false)}>Creators</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>

        <div className="dropp-nav-actions">
          <Link to="/waitlist" className="dropp-button dropp-button-sm dropp-button-primary">
            Join
            <ArrowRight size={15} />
          </Link>
          <button
            className="dropp-menu-button"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <section ref={heroRef} className="dropp-hero">
        <div className="dropp-hero-grid" />
        <div className="dropp-hero-sun" />

        <MotionDiv className="dropp-hero-content" style={{ y: heroCopyY }}>
          <MotionDiv
            className="dropp-pill"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...spring }}
          >
            <Sparkles size={15} />
            Creator commerce, made magnetic
          </MotionDiv>

          <div className="dropp-hero-title-wrap">
            <MotionH1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>DROPP</span>
              <span>ON DEMAND</span>
            </MotionH1>
            <MotionDiv
              className="dropp-hero-note"
              initial={{ opacity: 0, rotate: -18, scale: 1.18, y: -150, filter: 'blur(5px)' }}
              animate={{
                opacity: [0, 1, 1, 1],
                rotate: [-18, 9, 3, 6],
                scale: [1.18, 0.9, 1.05, 1],
                y: [-150, 18, -8, 0],
                filter: ['blur(5px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
              }}
              transition={{
                delay: 2.9,
                duration: 0.72,
                times: [0, 0.48, 0.72, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span>Hello, I am</span>
              <strong>Your taste, monetized</strong>
            </MotionDiv>
            <MotionDiv
              className="dropp-hero-stamp"
              initial={{ opacity: 0, scale: 0.7, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              transition={{ delay: 0.56, ...spring }}
            >
              <img src="/img/no-boring-drops-stamp.png" alt="No boring drops dropp stamp" />
            </MotionDiv>
          </div>

          <MotionP
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            Curate products people want, share your taste everywhere, and earn when recommendations move.
          </MotionP>

          <MotionDiv
            className="dropp-hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/waitlist" className="dropp-button dropp-button-primary">
              Join Waitlist
              <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="dropp-button dropp-button-ghost">
              Explore Products
              <ChevronRight size={18} />
            </Link>
          </MotionDiv>

        </MotionDiv>

        <MotionDiv
          className="dropp-hero-card-strip"
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dropp-hero-card-track">
            {Array.from({ length: 2 }).map((_, group) => (
              <div className="dropp-hero-card-set" key={group} aria-hidden={group === 1}>
                {heroCards.map((card, index) => (
                  <MotionArticle
                    className="dropp-demand-card"
                    key={`${group}-${card.title}-${card.badge}`}
                    style={{
                      '--card-dot': card.color,
                      '--card-position': card.position,
                      '--card-tilt': `${heroCardTilts[index % heroCardTilts.length]}deg`,
                    }}
                    whileHover={{ y: -14, rotate: 0, scale: 1.025 }}
                    transition={spring}
                  >
                    <img src={card.src} alt="" />
                    <span className="dropp-card-dot" />
                    <div className="dropp-demand-card-copy">
                      <span>{card.badge}</span>
                      <strong>{card.tag}</strong>
                    </div>
                  </MotionArticle>
                ))}
              </div>
            ))}
          </div>
        </MotionDiv>

        <div className="dropp-hero-ticker" aria-hidden="true">
          <div className="dropp-hero-ticker-track">
            {Array.from({ length: 2 }).map((_, group) => (
              <div className="dropp-hero-ticker-row" key={group}>
                {heroTicker.map((item) => (
                  <span key={`${group}-${item}`}>{item}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

      </section>

      <section ref={atelierRef} className="dropp-atelier" aria-label="Landing highlights">
        <MotionDiv
          className="atelier-card atelier-card-dark"
          style={{ y: atelierCardOneY, rotate: atelierCardOneRotate, opacity: atelierCardOneOpacity }}
        >
          <span>Visual commerce</span>
          <strong>Editorial collections that sell without feeling salesy.</strong>
        </MotionDiv>
        <MotionDiv
          className="atelier-card"
          style={{ y: atelierCardTwoY, rotate: atelierCardTwoRotate, opacity: atelierCardTwoOpacity }}
        >
          <span>Creator trust</span>
          <strong>Recommendations wrapped in identity, taste, and proof.</strong>
        </MotionDiv>
        <MotionDiv
          className="atelier-card atelier-card-green"
          style={{ y: atelierCardThreeY, rotate: atelierCardThreeRotate, opacity: atelierCardThreeOpacity }}
        >
          <span>Performance layer</span>
          <strong>Clicks, saves, sales, and campaign signal in one clean view.</strong>
        </MotionDiv>
      </section>

      <section className="dropp-marquee" aria-label="Dropp value loop">
        <div className="dropp-marquee-track">
          {Array.from({ length: 2 }).map((_, group) => (
            <div className="dropp-marquee-row" key={group}>
              <span>CURATE</span>
              <span>SHARE</span>
              <span>EARN</span>
              <span>DISCOVER</span>
              <span>COLLECT</span>
              <span>LAUNCH</span>
            </div>
          ))}
        </div>
      </section>

      <section id="showcase" className="dropp-showcase">
        <div className="dropp-section-heading gsap-reveal">
          <span className="dropp-eyebrow">Product universe</span>
          <h2>Everything feels alive, shoppable, and creator owned.</h2>
          <p>
            Dropp brings profiles, products, collections, campaigns, and analytics into one beautiful surface.
          </p>
        </div>

        <div className="dropp-video-grid">
          {showcaseImages.map((item, index) => (
            <MotionArticle
              className="dropp-video-card"
              key={item.title}
              initial={{ opacity: 0, y: 42, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.015 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ delay: index * 0.08, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              style={{ '--card-accent': item.color }}
            >
              <motion.video
                src={item.src}
                aria-label={item.title}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1.03 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ delay: index * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="video-card-content">
                <span>{item.kicker}</span>
                <h3>{item.title}</h3>
              </div>
              <div className="video-card-index">{String(index + 1).padStart(2, '0')}</div>
            </MotionArticle>
          ))}
        </div>

      </section>

      <section className="dropp-features">
        <div className="dropp-feature-shell">
          <div className="dropp-feature-copy">
            <span className="dropp-eyebrow">Modern toolkit</span>
            <h2>Built like a premium creator OS.</h2>
            <p>
              Polished components, fast interactions, rich previews, and clear data make the whole experience feel like a product creators want to open daily.
            </p>
            <Link to="/waitlist" className="dropp-button dropp-button-dark">
              Get early access
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="dropp-feature-grid">
            {features.map(({ title, copy, accent, metric, chips }, index) => (
              <MotionArticle
                className={`dropp-feature-card ${flippedFeatureCards[title] ? 'is-flipped' : ''}`}
                key={title}
                style={{ '--feature-accent': accent }}
                initial={{ opacity: 0, y: 38, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                whileHover={{ y: -12, rotateX: 2, rotateY: index % 2 === 0 ? -2 : 2 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                role="button"
                tabIndex={0}
                aria-pressed={Boolean(flippedFeatureCards[title])}
                aria-label={`${title}. ${flippedFeatureCards[title] ? 'Hide details' : 'Show details'}`}
                onClick={() => toggleFeatureCard(title)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleFeatureCard(title);
                  }
                }}
              >
                <div className="feature-card-inner">
                  <div className="feature-card-face feature-card-front">
                    <div className="feature-card-bg-text">0{index + 1}</div>
                    <div className="feature-card-scan" />
                    <div className="feature-card-top">
                      <span className="feature-badge">{metric}</span>
                    </div>
                    <div className="feature-card-body">
                      <h3>{title}</h3>
                    </div>
                    <div className="feature-chip-row">
                      {chips.map((chip) => (
                        <span key={chip}>{chip}</span>
                      ))}
                    </div>
                  </div>

                  <div className="feature-card-face feature-card-back">
                    <div className="feature-card-bg-text">0{index + 1}</div>
                    <div className="feature-card-scan" />
                    <div className="feature-card-top">
                      <span className="feature-badge">{metric}</span>
                    </div>
                    <div className="feature-card-body">
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </div>
                </div>
              </MotionArticle>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="dropp-workflow">
        <div className="dropp-section-heading">
          <span className="dropp-eyebrow">The flow</span>
          <h2>From taste to transaction in three moves.</h2>
        </div>

        <div className="workflow-grid">
          {workflow.map(({ step, icon: Icon, title, copy }) => (
            <article className="workflow-card" key={title}>
              <div className="workflow-step">{step}</div>
              <div className="workflow-icon">{React.createElement(Icon, { size: 24 })}</div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="creators" className="dropp-gallery-section">
        <div className="dropp-gallery-copy">
          <span className="dropp-eyebrow">Visual first</span>
          <h2>Curated drops that look like culture, not catalogs.</h2>
          <p>
            Mix editorial collections, social proof, and commerce mechanics into a storefront that feels unmistakably yours.
          </p>
        </div>

        <MotionDiv
          className="dropp-gallery-marquee"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dropp-gallery-marquee-track">
            {Array.from({ length: 2 }).map((_, group) => (
              <div className="dropp-gallery-marquee-set" key={group} aria-hidden={group === 1}>
                {galleryImages.map((item) => (
                  <article className="gallery-tile" key={`${group}-${item.title}`}>
                    <img src={item.src} alt={item.title} loading="lazy" decoding="async" draggable={false} />
                    <div className="gallery-tile-shine" aria-hidden="true" />
                    <div className="gallery-tile-meta">
                      <span>{item.tag}</span>
                      <strong>{item.title}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </MotionDiv>
      </section>

      <section className="dropp-audience">
        <MotionDiv className="dropp-section-heading">
          <span className="dropp-eyebrow">Who it's for</span>
          <h2>Built for creators and brands.</h2>
          <p>Whether you're a creator monetizing your taste or a brand finding authentic reach <br /> <strong>Dropp has the tools.</strong></p>
        </MotionDiv>

        <div className="dropp-audience-carousels">
          {audienceGroups.map(({ id, index, label, lead, tagline }, groupIndex) => (
            <MotionDiv
              className={`dropp-audience-group dropp-audience-group--${id}`}
              key={id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: groupIndex * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="dropp-audience-group-head">
                <MotionDiv
                  className="dropp-audience-label-row"
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + groupIndex * 0.06, duration: 0.55 }}
                >
                  <span className="dropp-audience-index">{index}</span>
                  <span className="dropp-audience-rule" aria-hidden="true" />
                </MotionDiv>
                <motion.h3
                  className="dropp-audience-display"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.16 + groupIndex * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="dropp-audience-display-for">for </span>
                  <em>{label}</em>
                  <span className="dropp-audience-display-lead">{lead}</span>
                </motion.h3>
                <MotionP
                  className="dropp-audience-tagline"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.22 + groupIndex * 0.06, duration: 0.55 }}
                >
                  {tagline}
                </MotionP>
              </div>
              <AudienceArchCarousel cards={audienceCards.filter((c) => c.group === id)} />
            </MotionDiv>
          ))}
        </div>
      </section>

      <div className="dropp-creator-bar" aria-hidden="true">
        <span>For Creators.</span>
        <span>For Brands.</span>
        <span>Only on <em>Dropp.</em></span>
      </div>

      <section className="dropp-final">
        <div className="dropp-final-media">
          <img src="/img/editorial/minimal-skincare.jpg" alt="Creator product collection styled as an editorial flatlay" />
        </div>
        <div className="dropp-final-copy">
          <span className="dropp-pill">
            <TrendingUp size={15} />
            Ready for launch energy
          </span>
          <h2>Make every recommendation worth clicking.</h2>
          <p>
            Join creators and brands building the next generation of social commerce on Dropp.
          </p>
          <div className="dropp-final-actions">
            <Link to="/waitlist" className="dropp-button dropp-button-primary">
              Join Dropp
              <Zap size={18} />
            </Link>
            <Link to="/login" className="dropp-button dropp-button-ghost-dark">
              I already have access
              <Users size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="dropp-footer">
        <div className="dropp-footer-shell">
          <div className="dropp-footer-cta">
            <div>
              <span className="dropp-footer-kicker">
                <Sparkles size={15} />
                Built for taste that moves
              </span>
              <h2>Drop the link. Own the moment.</h2>
            </div>
            <Link to="/waitlist" className="dropp-button dropp-button-primary">
              Start on Dropp
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="dropp-footer-main">
            <div className="dropp-footer-brand">
              <Link to="/landing" className="dropp-footer-logo" aria-label="Dropp home">
                <img src="/img/dropp-logo-wordmark.png" alt="Dropp" />
              </Link>
              <p>
                The creator commerce layer for tastemakers, brands, collections, and product stories worth clicking.
              </p>
              <div className="dropp-footer-socials">
                {footerSocials.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            <div className="dropp-footer-links">
              {footerColumns.map((column) => (
                <div className="dropp-footer-column" key={column.title}>
                  <h3>{column.title}</h3>
                  {column.links.map((link) => (
                    link.href.startsWith('#') ? (
                      <a key={link.label} href={link.href}>{link.label}</a>
                    ) : (
                      <Link key={link.label} to={link.href}>{link.label}</Link>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="dropp-footer-wordmark" aria-hidden="true">DROPP</div>

          <div className="dropp-footer-bottom">
            <span>© {new Date().getFullYear()} Dropp. All rights reserved.</span>
            <span>Creator commerce, made magnetic.</span>
          </div>
        </div>
      </footer>
    </MotionMain>
  );
};

export default Landing;
