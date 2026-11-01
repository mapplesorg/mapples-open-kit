import { HeaderOptions } from '@mapples/types';

import { RefResolvers, StackHeaderOptionsPatch } from '../types';

/**
 * Map {@link HeaderOptions} to a native-stack header options patch. Colour
 * fields are resolved through {@link RefResolvers} (so `ref(theme:…)` becomes a
 * concrete colour). Only explicitly-set fields are emitted; everything else is
 * left to the React Navigation default.
 */
export const mapHeaderOptions = (
  header: Partial<HeaderOptions> | undefined,
  resolvers: RefResolvers,
): StackHeaderOptionsPatch => {
  const patch: StackHeaderOptionsPatch = {};
  if (!header) return patch;

  if (header.visible !== undefined) patch.headerShown = header.visible;
  if (header.title !== undefined) patch.title = header.title;
  if (header.backVisible !== undefined)
    patch.headerBackVisible = header.backVisible;
  if (header.shadowVisible !== undefined) {
    patch.headerShadowVisible = header.shadowVisible;
  }

  const backgroundColor = resolvers.resolveColor(header.backgroundColor);
  if (backgroundColor) patch.headerStyle = { backgroundColor };

  const tintColor = resolvers.resolveColor(header.tintColor);
  if (tintColor) patch.headerTintColor = tintColor;

  if (header.titleStyle) {
    const titleStyle: NonNullable<StackHeaderOptionsPatch['headerTitleStyle']> =
      {};
    if (header.titleStyle.fontFamily) {
      titleStyle.fontFamily = header.titleStyle.fontFamily;
    }
    if (header.titleStyle.fontSize !== undefined) {
      titleStyle.fontSize = header.titleStyle.fontSize;
    }
    const color = resolvers.resolveColor(header.titleStyle.color);
    if (color) titleStyle.color = color;
    if (Object.keys(titleStyle).length) patch.headerTitleStyle = titleStyle;
  }

  return patch;
};

/**
 * Navigator-level header options with the navigator default made explicit.
 *
 * A navigator draws a header unless told otherwise, so an unset `visible` and
 * `visible: true` mean the same thing at runtime — but they do not look the
 * same to an editor, which has to render the tri-state as something. Resolving
 * it here lets editors show a plain on/off that matches what the app does.
 *
 * ONLY for navigator-level options. A route's `visible` must stay tri-state:
 * unset means "inherit the navigator", and defaulting it to `true` would make
 * every route override a navigator that turned its header off.
 */
export const resolveNavigatorHeader = (
  header: HeaderOptions | undefined,
): HeaderOptions => ({ ...header, visible: navigatorHeaderVisible(header) });

/** Whether a navigator with these options draws a header. */
export const navigatorHeaderVisible = (
  header: HeaderOptions | undefined,
): boolean => header?.visible ?? true;
