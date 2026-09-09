/** Who sent the message. */
export const MESSAGE_DIRECTIONS = ['incoming', 'outgoing'] as const;
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];

/** Delivery state of an outgoing message. */
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

/** Bubble geometry. */
export const MESSAGE_BUBBLE = {
  /** Corner radius. */
  radius: 18,
  /** Radius of the bottom corner on the sender's side while `showTail`. */
  tailRadius: 4,
  /** Widest a bubble grows relative to the row. */
  maxWidth: '80%',
  /** Edge of the status check glyphs. */
  glyph: 14,
} as const;
