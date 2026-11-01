export const springControl = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.8,
} as const;

export const springSurface = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.85,
} as const;

export const springDrawer = {
  type: 'spring',
  stiffness: 300,
  damping: 34,
  mass: 1,
} as const;

export const fadeBlock = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -3 },
} as const;

export const fadeTranslation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

export const popover = {
  initial: { opacity: 0, scale: 0.96, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 2 },
} as const;

export const reducedInstant = {
  duration: 0,
} as const;

