import { forwardRef, PropsWithChildren, useContext } from 'react';

import {
  StyledImage,
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  DISABLED_OPACITY,
  Icon,
  RADII,
  Tokens,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  ImageStyle,
  PressableProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import {
  Glyph,
  useControllableState,
  useInteractionState,
  useSlotColor,
} from '../../../internal';
import Checkbox from '../../inputs/Checkbox';
import Switch from '../../inputs/Switch';
import Avatar from '../Avatar';
import { ListContext } from '../List/types';

import { defaults } from './defaults';
import {
  LIST_ITEM_HEIGHT,
  ListItemLeading,
  ListItemSize,
  ListItemTone,
  ListItemTrailing,
} from './types';

/** Props for {@link ListItem}. */
export interface ListItemProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Primary text. */
  title?: string;
  /** Secondary text under the title. */
  subtitle?: string;
  /** Third line under the subtitle. */
  description?: string;
  /** What the row shows at its start. Defaults to `icon` when `leadingIconName` is set, else `none`. */
  leading?: ListItemLeading;
  /** Glyph at the start (project icon family). */
  leadingIconName?: string;
  /** Name whose initials fill the start avatar (with `leading: 'avatar'`). */
  leadingName?: string;
  /** Photo at the start (with `leading: 'avatar'` or `'image'`). */
  source?: ImageProps['source'];
  /** What the row shows at its end. Defaults to `none`. */
  trailing?: ListItemTrailing;
  /** Text at the end (with `trailing: 'text'`). */
  trailingText?: string;
  /** Glyph at the end (with `trailing: 'icon'`). */
  trailingIconName?: string;
  /** State of the trailing switch/checkbox (controlled). */
  value?: boolean;
  /** Fires with the next trailing switch/checkbox state. */
  onValueChange?: (value: boolean) => void;
  /** Fires when the trailing glyph is pressed. */
  onTrailingPress?: () => void;
  /** Paints the selected state. */
  selected?: boolean;
  /** Colour role of the text; `error` for destructive rows. Defaults to `default`. */
  tone?: ListItemTone;
  /** Minimum height: `sm` 44, `md` 56, `lg` 72. Defaults to `md`. */
  size?: ListItemSize;
  /** Draws a bottom divider (a `List` sets this for its rows). */
  divider?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** The row while selected. */
    styleSelected?: StyledProp<ViewStyle>;
    /** The leading slot. */
    styleLeading?: StyledProp<ViewStyle>;
    /** The leading photo. */
    styleImage?: StyledProp<ImageStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle and description. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The trailing slot. */
    styleTrailing?: StyledProp<ViewStyle>;
    /** The trailing text. */
    styleTrailingText?: StyledProp<TextStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The divider. */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

/**
 * One list row: a leading glyph, avatar or photo; a title with supporting
 * text; a trailing chevron, text, glyph, switch or checkbox. Rows compose
 * inside `List`, which adds the dividers and the surface.
 *
 * @example
 * ```tsx
 * <ListItem
 *   title="Dark mode"
 *   subtitle="Follows the system setting"
 *   leadingIconName="moon-outline"
 *   trailing="switch"
 *   value={dark}
 *   onValueChange={setDark}
 * />
 * ```
 *
 * @public
 */
const ListItem = forwardRef<View, PropsWithChildren<ListItemProps>>(
  (
    {
      title,
      subtitle,
      description,
      leading,
      leadingIconName,
      leadingName,
      source,
      trailing = 'none',
      trailingText,
      trailingIconName,
      value,
      onValueChange,
      onTrailingPress,
      selected = false,
      tone = 'default',
      size = 'md',
      divider,
      disabled,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const list = useContext(ListContext);
    const isDisabled = !!disabled;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      isDisabled,
    );
    const [checked, setChecked] = useControllableState<boolean>({
      value,
      defaultValue: false,
      onChange: onValueChange,
    });

    const leadingKind: ListItemLeading =
      leading ?? (leadingIconName ? 'icon' : 'none');
    const text =
      tone === 'error'
        ? tones.tone('error').main
        : tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', secondary);
    const showDivider = divider ?? list?.dividers ?? false;
    const dividerInset = list?.dividerInset ?? 16;
    const toggles = trailing === 'switch' || trailing === 'checkbox';
    const interactive = !!onPress || toggles;

    const handlePress: PressableProps['onPress'] = (event) => {
      if (toggles && !onPress) setChecked(!checked);
      onPress?.(event);
    };

    const photoEdge = size === 'lg' ? 56 : 40;

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole={interactive ? 'button' : undefined}
        accessibilityState={{ disabled: isDisabled, selected }}
        disabled={isDisabled || !interactive}
        onPress={handlePress}
        {...interaction.handlers}
        styled={{
          style: [
            defaults.root,
            selected && { backgroundColor: tones.tone('primary').container },
            styled?.style,
            selected && styled?.styleSelected,
            isDisabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {interactive && (interaction.pressed || interaction.hovered) ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    tones.resolve(Tokens.color.text),
                    interaction.pressed ? 'pressed' : 'hover',
                  ),
                },
              ],
            }}
          />
        ) : null}
        <StyledView
          styled={{
            style: [defaults.row, { minHeight: LIST_ITEM_HEIGHT[size] }],
          }}
        >
          {leadingKind !== 'none' ? (
            <StyledView
              styled={{ style: [defaults.leading, styled?.styleLeading] }}
            >
              {leadingKind === 'icon' ? (
                <Icon
                  iconName={leadingIconName ?? 'ellipse-outline'}
                  size={24}
                  color={glyphColor}
                />
              ) : leadingKind === 'avatar' ? (
                <Avatar
                  source={source}
                  name={leadingName}
                  iconName={leadingIconName}
                  size={size === 'lg' ? 'lg' : 'md'}
                />
              ) : (
                <StyledImage
                  source={source}
                  contentFit="cover"
                  styled={{
                    style: [
                      {
                        width: photoEdge,
                        height: photoEdge,
                        borderRadius: RADII.sm,
                        backgroundColor: tones.fill,
                      },
                      styled?.styleImage,
                    ],
                  }}
                />
              )}
            </StyledView>
          ) : null}
          <StyledView styled={{ style: defaults.texts }}>
            {title ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.body}
                numberOfLines={1}
                style={[{ color: text }, styled?.styleTitle]}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={size === 'lg' ? 2 : 1}
                style={[{ color: secondary }, styled?.styleSubtitle]}
              >
                {subtitle}
              </Typography>
            ) : null}
            {description ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={2}
                style={[{ color: secondary }, styled?.styleSubtitle]}
              >
                {description}
              </Typography>
            ) : null}
          </StyledView>
          {trailing !== 'none' ? (
            <StyledView
              styled={{ style: [defaults.trailing, styled?.styleTrailing] }}
            >
              {trailing === 'chevron' ? (
                <Glyph name="chevronRight" size={20} color={glyphColor} />
              ) : trailing === 'text' ? (
                <Typography
                  variant={TYPOGRAPHY_PARTS.helper}
                  style={[{ color: secondary }, styled?.styleTrailingText]}
                >
                  {trailingText}
                </Typography>
              ) : trailing === 'icon' ? (
                <StyledPressable
                  accessibilityRole="button"
                  disabled={!onTrailingPress}
                  hitSlop={8}
                  onPress={onTrailingPress}
                >
                  <Icon
                    iconName={trailingIconName ?? 'ellipsis-horizontal'}
                    size={22}
                    color={glyphColor}
                  />
                </StyledPressable>
              ) : trailing === 'switch' ? (
                <Switch
                  value={checked}
                  onValueChange={setChecked}
                  disabled={isDisabled}
                  size="sm"
                />
              ) : (
                <Checkbox
                  value={checked}
                  onValueChange={setChecked}
                  disabled={isDisabled}
                />
              )}
            </StyledView>
          ) : null}
        </StyledView>
        {showDivider ? (
          <StyledView
            styled={{
              style: [
                defaults.divider,
                { marginStart: dividerInset, backgroundColor: tones.divider },
                styled?.styleDivider,
              ],
            }}
          />
        ) : null}
      </StyledPressable>
    );
  },
);
ListItem.displayName = 'ListItem';

export default ListItem;
