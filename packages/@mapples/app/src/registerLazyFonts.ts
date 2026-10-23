/**
 * Declares fonts for the browser to fetch on first use. Native loads every
 * library face up front (see `splitLibraryFonts`), so there is nothing to do.
 */
export const registerLazyFonts = (_fonts: Record<string, number>): void => {};
