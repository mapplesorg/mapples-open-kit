/** Where the perforation runs: `horizontal` splits top/bottom, `vertical` puts a stub on the end side. */
export const TICKET_CARD_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type TicketCardOrientation = (typeof TICKET_CARD_ORIENTATIONS)[number];

/** Defaults shared by the component and its canvas schematic. */
export const TICKET_CARD_DEFAULTS = {
  /** Inner padding of each part, in points. */
  padding: 16,
  /** Diameter of the half-circle notches, in points. */
  notchSize: 20,
  /** Smallest stub: its height when horizontal, its width when vertical. */
  stubMinSize: 72,
  /** Stroke width of the perforation line. */
  perforationThickness: 1.5,
  /** Space between a notch and the end of the perforation line. */
  perforationInset: 6,
} as const;

/**
 * The main part's size along the split axis for a `perforationOffset`: a
 * fraction (`0 < x < 1`) of the ticket, or points (`>= 1`). `undefined` lets
 * the parts size to their content.
 */
export const ticketCardMainSize = (
  perforationOffset: number | undefined,
): number | `${number}%` | undefined => {
  if (perforationOffset === undefined) return undefined;
  if (!Number.isFinite(perforationOffset) || perforationOffset <= 0) {
    throw new Error(
      `TicketCard: perforationOffset (${String(perforationOffset)}) must be a fraction between 0 and 1 or a positive number of points`,
    );
  }
  return perforationOffset < 1
    ? `${perforationOffset * 100}%`
    : perforationOffset;
};
