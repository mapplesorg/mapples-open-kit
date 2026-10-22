import {
  forwardRef,
  PropsWithChildren,
  useContext,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

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
  TYPOGRAPHY_PARTS,
  Tokens,
  Tone,
  useShape,
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
import Badge from '../../feedback/Badge';
import Checkbox from '../../inputs/Checkbox';
import Switch from '../../inputs/Switch';
import { SwitchSize } from '../../inputs/Switch/types';
import Avatar from '../Avatar';
import { ListContext } from '../List/types';

import { defaults } from './defaults';
import {
  LIST_ITEM_HEIGHT,
  LIST_ITEM_RADIO_DIAMETER,
  ListItemLeading,
  ListItemLeadingShape,
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
  /** Outline of the start avatar or photo. Defaults to `circle` for `avatar`, `rounded` for `image`. */
  leadingShape?: ListItemLeadingShape;
  /** Text at the start — a rank or number column ("01", "#3") (with `leading: 'text'`). */
  leadingText?: string;
  /** Strikes the title through while the row's checkbox is checked (done rows). */
  strikeWhenChecked?: boolean;
  /** What the row shows at its end. Defaults to `none`. */
  trailing?: ListItemTrailing;
  /** Text at the end (with `trailing: 'text'`, `'link'` or `'badge'`). */
  trailingText?: string;
  /** Glyph at the end (with `trailing: 'icon'`). */
  trailingIconName?: string;
  /** Colour role of the trailing badge (with `trailing: 'badge'`). Defaults to `primary`. */
  trailingTone?: Tone;
  /** Adds a chevron after the trailing text, link, badge or glyph (settings rows). */
  trailingChevron?: boolean;
  /** Track size of the trailing switch. Defaults to `sm`. */
  switchSize?: SwitchSize;
  /** State of the switch, checkbox (leading or trailing) or radio (controlled). */
  value?: boolean;
  /** Fires with the next switch/checkbox/radio state. */
  onValueChange?: (value: boolean) => void;
  /** Fires when the trailing glyph or link is pressed. */
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
    /** The leading rank/number text. */
    styleLeadingText?: StyledProp<TextStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The title while checked (with `strikeWhenChecked`). */
    styleTitleChecked?: StyledProp<TextStyle>;
    /** The subtitle (and the description, under `styleDescription`). */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The description (over `styleSubtitle`). */
    styleDescription?: StyledProp<TextStyle>;
    /** The trailing slot. */
    styleTrailing?: StyledProp<ViewStyle>;
    /** The trailing text and link. */
    styleTrailingText?: StyledProp<TextStyle>;
    /** The glyphs, leading and trailing (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The trailing chevron and glyph (`color`, over `styleIcon`). */
    styleTrailingIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The trailing radio ring. */
    styleRadio?: StyledProp<ViewStyle>;
    /** The trailing badge pill. */
    styleBadge?: StyledProp<ViewStyle>;
    /** The trailing badge label. */
    styleBadgeLabel?: StyledProp<TextStyle>;
    /** The divider. */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

/**
 * One list row: a leading glyph, avatar, photo, checkbox or rank text; a
 * title with supporting text; a trailing chevron, text, glyph, switch,
 * checkbox, radio, link or badge (text, link and badge can take a chevron
 * after them). Rows compose inside `List`, which adds the dividers and the
 * surface.
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
const ListItem: ForwardRefExoticComponent<
  PropsWithChildren<ListItemProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ListItemProps>>(
  (
    {
      title,
      subtitle,
      description,
      leading,
      leadingIconName,
      leadingName,
      source,
      leadingShape,
      leadingText,
      strikeWhenChecked = false,
      trailing = 'none',
      trailingText,
      trailingIconName,
      trailingTone = 'primary',
      trailingChevron = false,
      switchSize = 'sm',
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
    const shape = useShape();
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
    const trailingGlyphColor = useSlotColor(
      styled?.styleTrailingIcon,
      'color',
      glyphColor,
    );
    const showDivider = divider ?? list?.dividers ?? false;
    const dividerInset = list?.dividerInset ?? 16;
    const toggles =
      trailing === 'switch' ||
      trailing === 'checkbox' ||
      leadingKind === 'checkbox';
    const isRadio = trailing === 'radio';
    const interactive = !!onPress || toggles || isRadio;
    const struck = strikeWhenChecked && checked;
    const chevronAfter = trailingChevron && trailing !== 'chevron';
    const primary = tones.tone('primary');

    const handlePress: PressableProps['onPress'] = (event) => {
      if (isRadio && !onPress) {
        if (!checked) setChecked(true);
      } else if (toggles && !onPress) setChecked(!checked);
      onPress?.(event);
    };

    const photoEdge = size === 'lg' ? 56 : 40;
    const photoRadius =
      leadingShape === 'circle'
        ? photoEdge / 2
        : leadingShape === 'square'
          ? 0
          : shape.radius.sm;

    const renderLeading = () => {
      switch (leadingKind) {
        case 'none':
          return null;
        case 'icon':
          return (
            <Icon
              iconName={leadingIconName ?? 'ellipse-outline'}
              size={24}
              color={glyphColor}
            />
          );
        case 'avatar':
          return (
            <Avatar
              source={source}
              name={leadingName}
              iconName={leadingIconName}
              size={size === 'lg' ? 'lg' : 'md'}
              shape={leadingShape}
            />
          );
        case 'image':
          return (
            <StyledImage
              source={source}
              contentFit="cover"
              styled={{
                style: [
                  {
                    width: photoEdge,
                    height: photoEdge,
                    borderRadius: photoRadius,
                    backgroundColor: tones.fill,
                  },
                  styled?.styleImage,
                ],
              }}
            />
          );
        case 'checkbox':
          return (
            <Checkbox
              value={checked}
              onValueChange={setChecked}
              disabled={isDisabled}
            />
          );
        case 'text':
          return (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[{ color: secondary }, styled?.styleLeadingText]}
            >
              {leadingText}
            </Typography>
          );
        default:
          throw new Error(
            `ListItem: unknown leading "${String(leadingKind satisfies never)}"`,
          );
      }
    };

    const renderTrailing = () => {
      switch (trailing) {
        case 'none':
          return null;
        case 'chevron':
          return (
            <Glyph name="chevronRight" size={20} color={trailingGlyphColor} />
          );
        case 'text':
          return (
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={[{ color: secondary }, styled?.styleTrailingText]}
            >
              {trailingText}
            </Typography>
          );
        case 'icon':
          return (
            <StyledPressable
              accessibilityRole="button"
              disabled={!onTrailingPress}
              hitSlop={8}
              onPress={onTrailingPress}
            >
              <Icon
                iconName={trailingIconName ?? 'ellipsis-horizontal'}
                size={22}
                color={trailingGlyphColor}
              />
            </StyledPressable>
          );
        case 'switch':
          return (
            <Switch
              value={checked}
              onValueChange={setChecked}
              disabled={isDisabled}
              size={switchSize}
            />
          );
        case 'checkbox':
          return (
            <Checkbox
              value={checked}
              onValueChange={setChecked}
              disabled={isDisabled}
            />
          );
        case 'radio':
          return (
            <StyledPressable
              accessibilityRole="radio"
              accessibilityState={{ checked, disabled: isDisabled }}
              disabled={isDisabled}
              hitSlop={8}
              onPress={() => {
                if (!checked) setChecked(true);
              }}
              styled={{
                style: [
                  defaults.radio,
                  {
                    width: LIST_ITEM_RADIO_DIAMETER,
                    height: LIST_ITEM_RADIO_DIAMETER,
                    borderRadius: LIST_ITEM_RADIO_DIAMETER / 2,
                    borderColor: checked ? primary.ink : tones.outlineStrong,
                  },
                  styled?.styleRadio,
                ],
              }}
            >
              {checked ? (
                <StyledView
                  pointerEvents="none"
                  styled={{
                    style: {
                      width: LIST_ITEM_RADIO_DIAMETER / 2,
                      height: LIST_ITEM_RADIO_DIAMETER / 2,
                      borderRadius: LIST_ITEM_RADIO_DIAMETER / 4,
                      backgroundColor: primary.ink,
                    },
                  }}
                />
              ) : null}
            </StyledPressable>
          );
        case 'link':
          return (
            <StyledPressable
              accessibilityRole="button"
              disabled={isDisabled || !onTrailingPress}
              hitSlop={8}
              onPress={onTrailingPress}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.link}
                style={[{ color: primary.ink }, styled?.styleTrailingText]}
              >
                {trailingText}
              </Typography>
            </StyledPressable>
          );
        case 'badge':
          return (
            <Badge
              label={trailingText}
              variant="text"
              tone={trailingTone}
              styled={{
                style: styled?.styleBadge,
                styleLabel: styled?.styleBadgeLabel,
              }}
            />
          );
        default:
          throw new Error(
            `ListItem: unknown trailing "${String(trailing satisfies never)}"`,
          );
      }
    };

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole={
          isRadio ? 'radio' : interactive ? 'button' : undefined
        }
        accessibilityState={{
          disabled: isDisabled,
          selected,
          checked: toggles || isRadio ? checked : undefined,
        }}
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
              {renderLeading()}
            </StyledView>
          ) : null}
          <StyledView styled={{ style: defaults.texts }}>
            {title ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.body}
                numberOfLines={1}
                style={[
                  { color: text },
                  struck && {
                    color: secondary,
                    textDecorationLine: 'line-through',
                  },
                  styled?.styleTitle,
                  struck && styled?.styleTitleChecked,
                ]}
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
                style={[
                  { color: secondary },
                  styled?.styleSubtitle,
                  styled?.styleDescription,
                ]}
              >
                {description}
              </Typography>
            ) : null}
          </StyledView>
          {trailing !== 'none' || chevronAfter ? (
            <StyledView
              styled={{
                style: [
                  defaults.trailing,
                  chevronAfter && defaults.trailingWithChevron,
                  styled?.styleTrailing,
                ],
              }}
            >
              {renderTrailing()}
              {chevronAfter ? (
                <Glyph
                  name="chevronRight"
                  size={20}
                  color={trailingGlyphColor}
                />
              ) : null}
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
