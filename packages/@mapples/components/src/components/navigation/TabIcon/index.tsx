import {
  forwardRef,
  PropsWithChildren,
  useMemo,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { useOptionalNavigatorChromeItem } from '@mapples/render';
import {
  StyledProp,
  StyledView,
  Styler,
  Typography,
  useStyled,
} from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Animated, View, ViewProps, ViewStyle } from 'react-native';

import {
  ChromeNotice,
  DURATION,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import { TAB_ICON_SIZE } from './types';

/** Props for {@link TabIcon}. */
export interface TabIconProps extends Omit<ViewProps, 'children'> {
  /** Glyph size. Defaults to 24. */
  size?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The box around the glyph, and the glyph's `color`. */
    style?: StyledProp<ViewStyle & { color?: string }>;
    /** The same while the tab is active. */
    styleActive?: StyledProp<ViewStyle & { color?: string }>;
    /** A mark behind the glyph that fades in while the tab is active. Drawn once it sets anything. */
    styleIndicator?: StyledProp<ViewStyle>;
  };
}

/** A slot's own keys with `color` taken out — the box never paints it. */
const boxOf = (slot: StyledProp<object> | undefined): object | undefined => {
  const flat = Styler.flatten(slot as never) as
    | Record<string, unknown>
    | undefined;
  if (!flat) return undefined;
  const { color: _color, ...box } = flat;
  return box;
};

/**
 * The icon of the tab a `TabTemplate` template is repeated for, in the colour
 * its slots give: `style` while inactive, `styleActive` while active
 * (primary when neither sets one). A tab whose route has no icon shows the
 * first letter of its label instead, so an icon-only bar never has a blank
 * tab.
 *
 * Outside a `TabTemplate` it shows a notice saying where it belongs.
 *
 * @example
 * ```tsx
 * <TabTemplate>
 *   <TabIcon size={24} styled={{ styleActive: { color: 'theme.primary.main' } }} />
 * </TabTemplate>
 * ```
 *
 * @public
 */
const TabIcon: ForwardRefExoticComponent<
  PropsWithChildren<TabIconProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TabIconProps>>(
  (
    {
      size = TAB_ICON_SIZE,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const scope = useOptionalNavigatorChromeItem();
    const tones = useTones();
    const active = scope?.item.active === true;

    const progress = useTimingValue(active ? 1 : 0, {
      duration: DURATION.fast,
    });
    const resolved = useStyled({ indicator: styled?.styleIndicator }) as {
      indicator?: ViewStyle;
    };
    const inactiveColor = useSlotColor(
      styled?.style,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );
    const ownColor = useSlotColor(
      styled?.style,
      'color',
      tones.tone('primary').ink,
    );
    const activeColor = useSlotColor(styled?.styleActive, 'color', ownColor);
    const box = useMemo(() => boxOf(styled?.style), [styled?.style]);
    const boxActive = useMemo(
      () => boxOf(styled?.styleActive),
      [styled?.styleActive],
    );
    const hasIndicator = useMemo(
      () =>
        Object.keys(Styler.flatten(styled?.styleIndicator as never) ?? {})
          .length > 0,
      [styled?.styleIndicator],
    );

    if (!scope) {
      return (
        <ChromeNotice message="Tab icon — draws the tab's icon inside a Tab template." />
      );
    }

    const { item } = scope;
    const color = active ? activeColor : inactiveColor;

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, box, active && boxActive] }}
        {...rest}
      >
        {hasIndicator ? (
          <Animated.View
            pointerEvents="none"
            style={[
              defaults.indicator,
              resolved.indicator,
              { opacity: progress },
            ]}
          />
        ) : null}
        {item.renderIcon ? (
          item.renderIcon({ color, size })
        ) : (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            color={color}
            style={[
              defaults.monogram,
              { width: size, lineHeight: size, fontSize: size * 0.6 },
            ]}
          >
            {item.label.slice(0, 1).toUpperCase()}
          </Typography>
        )}
      </StyledView>
    );
  },
);
TabIcon.displayName = 'TabIcon';

export default TabIcon;
