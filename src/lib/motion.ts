/**
 * Shared Framer Motion config: spring physics and easing
 * to avoid generic duration/ease slop and add a more polished feel.
 */
export const spring = {
  /** Snappy UI (buttons, toggles, modals) */
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  /** Gentle (cards, list items) */
  gentle: { type: 'spring' as const, stiffness: 260, damping: 25 },
  /** Slow, smooth (page transitions, overlays) */
  smooth: { type: 'spring' as const, stiffness: 120, damping: 24 },
  /** Exit (minimal bounce) */
  exit: { type: 'spring' as const, stiffness: 400, damping: 40 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: spring.gentle,
};

export const staggerContainer = (delayChildren = 0.06, staggerChildren = 0.05) => ({
  animate: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: spring.gentle,
};
