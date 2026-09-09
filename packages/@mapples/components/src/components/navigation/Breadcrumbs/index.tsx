import { forwardRef, Fragment, PropsWithChildren } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  I18nManager,
  Pressable,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { Glyph, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  BREADCRUMB_GLYPH_SIZE,
  BreadcrumbItem,
  BreadcrumbSeparator,
  readBreadcrumbItems,
} from './types';

/** Props for {@link Breadcrumbs}. */
export interface BreadcrumbsProps extends Omit<ViewProps, 'children'> {
  /** The trail, first ancestor first; the last item is the current page. */
  items?: BreadcrumbItem[];
  /** Glyph between crumbs. Defaults to `chevron`. */
  separator?: BreadcrumbSeparator;
  /** Most crumbs shown before the middle collapses to an ellipsis; `0` shows all. Defaults to `0`. */
  maxItems?: number;
  /** Fires with the pressed crumb's `value` and its index in `items`. */
  onItemPress?: (value: string, index: number) => void;
  /** Colour role of the ancestor links. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The wrapping row. */
    style?: StyledProp<ViewStyle>;
    /** An ancestor link's text. */
    styleItem?: StyledProp<TextStyle>;
    /** The current page's text. */
    styleItemCurrent?: StyledProp<TextStyle>;
    /** The separator glyph or slash (`color`). */
    styleSeparator?: StyledProp<TextStyle>;
  };
}

/** A crumb that renders, or the ellipsis standing in for the collapsed middle. */
type Crumb =
  | { kind: 'item'; item: BreadcrumbItem; index: number }
  | { kind: 'ellipsis' };

/**
 * The visible crumbs. Past `maxItems` the trail keeps the first crumb, an
 * ellipsis and the last `maxItems - 2` crumbs (at least the current page).
 */
const collapse = (items: BreadcrumbItem[], maxItems: number): Crumb[] => {
  const all = items.map<Crumb>((item, index) => ({
    kind: 'item',
    item,
    index,
  }));
  if (maxItems <= 0 || items.length <= maxItems) return all;
  const tail = Math.max(maxItems - 2, 1);
  return [all[0], { kind: 'ellipsis' }, ...all.slice(items.length - tail)];
};

/**
 * A wrapping trail of ancestor links ending in the current page. Ancestors
 * are pressable and report their `value`; the last crumb is plain text.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', value: 'home' },
 *     { label: 'Shoes', value: 'shoes' },
 *     { label: 'Runners', value: 'runners' },
 *   ]}
 *   onItemPress={(value) => navigate(value)}
 * />
 * ```
 *
 * @public
 */
const Breadcrumbs = forwardRef<View, PropsWithChildren<BreadcrumbsProps>>(
  (
    {
      items,
      separator = 'chevron',
      maxItems = 0,
      onItemPress,
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const crumbs = readBreadcrumbItems(items);
    const visible = collapse(crumbs, maxItems);
    const lastIndex = crumbs.length - 1;

    const linkColor = useSlotColor(
      styled?.styleItem,
      'color',
      tones.tone(tone).main,
    );
    const currentColor = useSlotColor(
      styled?.styleItemCurrent,
      'color',
      tones.resolve(Tokens.color.text),
    );
    const separatorColor = useSlotColor(
      styled?.styleSeparator,
      'color',
      tones.resolve(Tokens.color.textTertiary),
    );

    const divider =
      separator === 'chevron' ? (
        <Glyph
          name="chevronRight"
          size={BREADCRUMB_GLYPH_SIZE}
          color={separatorColor}
          style={I18nManager.isRTL ? defaults.mirrored : undefined}
        />
      ) : (
        <Typography
          variant={TYPOGRAPHY_PARTS.label}
          style={[{ color: separatorColor }, styled?.styleSeparator]}
        >
          /
        </Typography>
      );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="none"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {visible.map((crumb, position) => (
          <Fragment key={crumb.kind === 'item' ? crumb.item.value : 'ellipsis'}>
            {position > 0 ? divider : null}
            {crumb.kind === 'ellipsis' ? (
              <Glyph
                name="more"
                size={BREADCRUMB_GLYPH_SIZE}
                color={separatorColor}
              />
            ) : crumb.index === lastIndex ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                accessibilityRole="text"
                style={[
                  { color: currentColor },
                  styled?.styleItem,
                  styled?.styleItemCurrent,
                ]}
              >
                {crumb.item.label}
              </Typography>
            ) : (
              <Pressable
                accessibilityRole="link"
                hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
                onPress={() => onItemPress?.(crumb.item.value, crumb.index)}
              >
                <Typography
                  variant={TYPOGRAPHY_PARTS.label}
                  style={[{ color: linkColor }, styled?.styleItem]}
                >
                  {crumb.item.label}
                </Typography>
              </Pressable>
            )}
          </Fragment>
        ))}
      </StyledView>
    );
  },
);
Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
