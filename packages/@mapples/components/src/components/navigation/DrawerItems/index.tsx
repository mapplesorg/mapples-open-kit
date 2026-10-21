import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { useOptionalNavigatorChrome } from '@mapples/render';
import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { RADII, Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { ChromeNotice, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  DRAWER_ITEMS_ICON_SIZE,
  DRAWER_ITEMS_ROW_HEIGHT,
  DrawerItemsDensity,
} from './types';

/** Props for {@link DrawerItems}. */
export interface DrawerItemsProps extends Omit<ViewProps, 'children'> {
  /** Whether route icons are drawn. Defaults to `true`. */
  showIcons?: boolean;
  /** Row height. Defaults to `comfortable`. */
  density?: DrawerItemsDensity;
  /** Colour role of the active row. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The list. */
    style?: StyledProp<ViewStyle>;
    /** Each row. */
    styleRow?: StyledProp<ViewStyle>;
    /** The active row. */
    styleRowActive?: StyledProp<ViewStyle>;
    /** Inactive icons (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The active icon (`color`). */
    styleIconActive?: StyledProp<ViewStyle & { color?: string }>;
    /** Inactive labels. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
  };
}

/**
 * The routes of the drawer whose custom content this element sits in: one
 * row per route, pressing one navigates there and closes the drawer. It only
 * knows its routes through the navigator-chrome context a host provides —
 * inside a saved component chosen as a drawer navigator's design, at runtime
 * and on the canvas alike. Anywhere else it shows a notice saying so.
 *
 * @example
 * ```tsx
 * <View style={{ flex: 1 }}>
 *   <DrawerHeader />
 *   <DrawerItems density="comfortable" />
 * </View>
 * ```
 *
 * @public
 */
const DrawerItems: ForwardRefExoticComponent<
  PropsWithChildren<DrawerItemsProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<DrawerItemsProps>>(
  (
    {
      showIcons = true,
      density = 'comfortable',
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const chrome = useOptionalNavigatorChrome();
    const tones = useTones();
    const palette = tones.tone(tone);
    const inactiveIcon = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );
    const activeIcon = useSlotColor(
      styled?.styleIconActive,
      'color',
      palette.main,
    );

    if (!chrome || chrome.kind !== 'drawer') {
      return (
        <ChromeNotice message="Drawer items — shows this navigator's screens once the component is chosen as a drawer navigator's content design." />
      );
    }

    const rowHeight = DRAWER_ITEMS_ROW_HEIGHT[density];
    const inactiveLabel = tones.resolve(Tokens.color.text);

    return (
      <StyledView
        ref={ref}
        accessibilityRole="menu"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {chrome.items.map((item) => {
          const iconColor = item.active ? activeIcon : inactiveIcon;
          return (
            <StyledPressable
              key={item.routeId}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.active }}
              onPress={() => chrome.select(item.routeId)}
              styled={{
                style: [
                  defaults.row,
                  {
                    height: rowHeight,
                    borderRadius: RADII.pill,
                  },
                  item.active && { backgroundColor: palette.container },
                  styled?.styleRow,
                  item.active && styled?.styleRowActive,
                ],
              }}
            >
              {showIcons && item.renderIcon ? (
                <StyledView
                  styled={{
                    style: [
                      defaults.icon,
                      {
                        width: DRAWER_ITEMS_ICON_SIZE,
                        height: DRAWER_ITEMS_ICON_SIZE,
                      },
                    ],
                  }}
                >
                  {item.renderIcon({
                    color: iconColor,
                    size: DRAWER_ITEMS_ICON_SIZE,
                  })}
                </StyledView>
              ) : null}
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[
                  defaults.label,
                  { color: item.active ? palette.main : inactiveLabel },
                  styled?.styleLabel,
                  item.active && styled?.styleLabelActive,
                ]}
              >
                {item.label}
              </Typography>
            </StyledPressable>
          );
        })}
      </StyledView>
    );
  },
);
DrawerItems.displayName = 'DrawerItems';

export default DrawerItems;
