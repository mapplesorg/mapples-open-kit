/** Accordion surfaces. */
export const ACCORDION_VARIANTS = ['plain', 'outlined', 'filled'] as const;
export type AccordionVariant = (typeof ACCORDION_VARIANTS)[number];

/** Minimum header height — a comfortable touch target. */
export const ACCORDION_HEADER_HEIGHT = 52;
