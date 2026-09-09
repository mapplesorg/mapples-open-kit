/** Where the snackbar appears. */
export const SNACKBAR_POSITIONS = ['bottom', 'top'] as const;
export type SnackbarPosition = (typeof SNACKBAR_POSITIONS)[number];

/** Snackbar colour roles. */
export const SNACKBAR_TONES = ['neutral', 'success', 'error'] as const;
export type SnackbarTone = (typeof SNACKBAR_TONES)[number];
