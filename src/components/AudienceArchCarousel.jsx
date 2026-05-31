import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/AudienceArchCarousel.css';

const CARD_WIDTH = 503;
const CARD_GAP = 28;
const AUTO_SPEED = 0.55;

const AudienceArchCarousel = ({ cards }) => {
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const offsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(0);
  const velocityRef = useRef(0);
  const [stepWidth, setStepWidth] = useState(CARD_WIDTH + CARD_GAP);

  const total = cards.length;
  const loopCards = [...cards, ...cards, ...cards];
  const singleSetWidth = total * stepWidth;

  const updateStepWidth = useCallback(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    const available = container.clientWidth;
    let cardW = CARD_WIDTH;

    if (available < 560) {
      cardW = Math.min(CARD_WIDTH, Math.max(260, available * 0.88));
    } else if (available < 900) {
      cardW = Math.min(CARD_WIDTH, available * 0.78);
    }

    setStepWidth(cardW + CARD_GAP);
  }, []);

  useEffect(() => {
    updateStepWidth();
    window.addEventListener('resize', updateStepWidth);
    return () => window.removeEventListener('resize', updateStepWidth);
  }, [updateStepWidth]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;

    const animateFrame = () => {
      if (!isDraggingRef.current) {
        offsetRef.current -= AUTO_SPEED;
        offsetRef.current += velocityRef.current;
        velocityRef.current *= 0.92;
        if (Math.abs(velocityRef.current) < 0.15) {
          velocityRef.current = 0;
        }
      }

      if (offsetRef.current <= -singleSetWidth) {
        offsetRef.current += singleSetWidth;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= singleSetWidth;
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(animateFrame);
    };

    rafRef.current = requestAnimationFrame(animateFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [singleSetWidth, total]);

  const handlePointerDown = useCallback((e) => {
    isDraggingRef.current = true;
    dragStartRef.current = e.clientX;
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current;
    dragStartRef.current = e.clientX;
    offsetRef.current += dx;
    velocityRef.current = dx;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    offsetRef.current -= e.deltaY * 0.45;
    velocityRef.current = -e.deltaY * 0.12;
  }, []);

  useEffect(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (total === 0) return null;

  const cardDisplayWidth = stepWidth - CARD_GAP;

  return (
    <motion.div
      className="audience-arch-carousel"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="audience-arch-track" ref={trackRef}>
        {loopCards.map((card, index) => (
          <article
            key={`${card.title}-${index}`}
            className={`audience-arch-card audience-arch-card--${card.tone === 'dark' ? 'dark' : 'light'}`}
            style={{ width: cardDisplayWidth }}
          >
            <img src={card.img} alt={card.title} draggable={false} loading="lazy" decoding="async" />
          </article>
        ))}
      </div>
    </motion.div>
  );
};

export default AudienceArchCarousel;
