// Elements of @mapples/style an app writes directly (`<StyledView>`,
// `<Typography>`): the canvas knows each one under the type of its
// @mapples/ui wrapper, which renders the same element. The file keeps the
// element as written; only the canvas reads it as the @mapples/ui type.

import type { ImportedName } from './parse.js';

export const STYLE_ELEMENT_MODULE = '@mapples/style';

export interface StyleElement {
  /** The @mapples/ui type the canvas renders it as. */
  type: string;
  /**
   * The @mapples/ui type renders its copy from `text` only (Typography): the
   * element's text children are that prop on the canvas, and a Creator text
   * change is written back as the children.
   */
  textChildren: boolean;
}

const STYLE_ELEMENTS: Readonly<Record<string, StyleElement>> = {
  StyledView: { type: 'View', textChildren: false },
  StyledSafeAreaView: { type: 'SafeAreaView', textChildren: false },
  StyledScrollView: { type: 'ScrollView', textChildren: false },
  StyledPressable: { type: 'Pressable', textChildren: false },
  StyledTextInput: { type: 'TextInput', textChildren: false },
  StyledText: { type: 'Text', textChildren: false },
  Typography: { type: 'Typography', textChildren: true },
};

/** The canvas reading of a tag imported from @mapples/style, or null. */
export function styleElementOf(
  origin: ImportedName | undefined,
): StyleElement | null {
  if (origin?.module !== STYLE_ELEMENT_MODULE) return null;
  return Object.hasOwn(STYLE_ELEMENTS, origin.exportName)
    ? STYLE_ELEMENTS[origin.exportName]!
    : null;
}
