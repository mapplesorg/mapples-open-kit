import { Asset } from 'expo-asset';

const STYLE_ID = 'mapples-lazy-fonts';

/**
 * Declares each font as an `@font-face` rule without loading it: the browser
 * fetches a face only when text on the page uses its family, and swaps it in
 * when it arrives (`font-display: swap`). `expo-font` would fetch every face
 * it is given (`document.fonts.load`), which is what this avoids.
 */
export const registerLazyFonts = (fonts: Record<string, number>): void => {
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  const declared = new Set(style.dataset.families?.split(',') ?? []);
  const rules: string[] = [];
  for (const [family, source] of Object.entries(fonts)) {
    if (declared.has(family)) continue;
    declared.add(family);
    const { uri } = Asset.fromModule(source);
    rules.push(
      `@font-face{font-family:${JSON.stringify(family)};src:url(${JSON.stringify(uri)});font-display:swap}`,
    );
  }
  if (rules.length === 0) return;
  style.appendChild(document.createTextNode(rules.join('\n')));
  style.dataset.families = [...declared].join(',');
};
