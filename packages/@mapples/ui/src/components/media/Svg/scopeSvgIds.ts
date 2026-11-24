const ID = /(\sid\s*=\s*)(["'])([^"']+)\2/g;
const URL_REFERENCE = /url\(\s*(["']?)#([^"')\s]+)\1\s*\)/g;
const HREF_REFERENCE = /((?:xlink:)?href\s*=\s*)(["'])#([^"']+)\2/g;

/**
 * SVG markup with every `id` it declares, and every reference to one
 * (`url(#id)`, `href="#id"`, `xlink:href="#id"`), prefixed with `scope`.
 *
 * On the web an inline SVG shares the document's id space: two drawings that
 * both declare `id="c"` (generated art does, with one-letter ids) make
 * `clip-path="url(#c)"` in each of them resolve to the first one in the
 * document, so a drawing was clipped and filled by another drawing's
 * definitions. A reference to an id the markup does not declare is left alone.
 *
 * @param xml - The SVG markup
 * @param scope - A prefix unique to the element that draws it
 */
export const scopeSvgIds = (xml: string, scope: string): string => {
  const ids = new Set<string>();
  for (const match of xml.matchAll(ID)) ids.add(match[3]);
  if (ids.size === 0) return xml;

  return xml
    .replace(
      ID,
      (_all, head: string, quote: string, id: string) =>
        `${head}${quote}${scope}${id}${quote}`,
    )
    .replace(URL_REFERENCE, (all: string, quote: string, id: string) =>
      ids.has(id) ? `url(${quote}#${scope}${id}${quote})` : all,
    )
    .replace(
      HREF_REFERENCE,
      (all: string, head: string, quote: string, id: string) =>
        ids.has(id) ? `${head}${quote}#${scope}${id}${quote}` : all,
    );
};
