import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  Icon,
  IconButton,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  I18nManager,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useSlotColor } from '../../../internal';

import AvatarButton from './AvatarButton';
import { defaults } from './defaults';
import GlyphButton from './GlyphButton';
import TextActionButton from './TextActionButton';
import {
  readTopAppBarActions,
  TOP_APP_BAR_BUTTON_SIZE,
  TOP_APP_BAR_GLYPH_SIZE,
  TOP_APP_BAR_LARGE_HEIGHT,
  TOP_APP_BAR_ROW_HEIGHT,
  TopAppBarAction,
  TopAppBarVariant,
} from './types';

/** Props for {@link TopAppBar}. */
export interface TopAppBarProps extends Omit<ViewProps, 'children'> {
  /** Small eyebrow above the title ('Events in', 'THURSDAY 22 OCT'). */
  overline?: string;
  /** The page title. */
  title?: string;
  /** Project glyph right after the title ('chevron-down' for a city picker); pressed through `onTitlePress`. */
  titleIconName?: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** Shows a back arrow at the start, firing `onBackPress`. Defaults to `false`. */
  showBack?: boolean;
  /** A project glyph at the start instead of the back arrow ('menu'), firing `onBackPress`. */
  leadingIconName?: string;
  /** Up to three trailing actions: glyph buttons (badge, toggle) or text buttons (`label` without `iconName`). */
  actions?: TopAppBarAction[];
  /** Display name of a trailing account avatar (its initials show without a photo). */
  avatarName?: string;
  /** Photo of a trailing account avatar; set it or `avatarName` to show the avatar. */
  avatarSource?: ImageProps['source'];
  /** Accessibility label of the trailing avatar. Defaults to `'Account'`. */
  avatarLabel?: string;
  /** Title placement: at the start, centred, or as a headline on a second row. Defaults to `small`. */
  variant?: TopAppBarVariant;
  /** Lifts the bar on a shadow with a bottom hairline. Defaults to `false`. */
  elevated?: boolean;
  /** Removes the background. Defaults to `false`. */
  transparent?: boolean;
  /** Colour role of the glyphs. Defaults to `neutral` (the text colour). */
  tone?: Tone;
  /** Screen-reader label of the leading button. Defaults to `'Back'`. */
  backLabel?: string;
  /** Accessibility label of the `leadingIconName` button. Defaults to `Menu`. */
  leadingLabel?: string;
  /** Fires with the pressed action's `value`. */
  onActionPress?: (value: string) => void;
  /** Fires when the back arrow or leading glyph is pressed. */
  onBackPress?: () => void;
  /** Fires when the title is pressed; set, the title becomes a button. */
  onTitlePress?: () => void;
  /** Fires when the trailing avatar is pressed; set, the avatar becomes a button. */
  onAvatarPress?: () => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
    /** The overline above the title. */
    styleOverline?: StyledProp<TextStyle>;
    /** The title text; its `color` also paints the title glyph. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle text. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The trailing actions row. */
    styleActions?: StyledProp<ViewStyle>;
    /** Each glyph or text button. */
    styleAction?: StyledProp<ViewStyle>;
    /** The text of a text action. */
    styleActionLabel?: StyledProp<TextStyle>;
    /** The trailing avatar. */
    styleAvatar?: StyledProp<ViewStyle>;
  };
}

/**
 * An in-content app bar: back arrow or menu glyph, an overline, the title
 * (optionally with a trailing glyph, e.g. a dropdown chevron) and subtitle,
 * up to three trailing actions (glyphs with badges or toggle state, or text
 * buttons) and an account avatar. Use it only when the navigator's own
 * header is hidden; the page owns the safe area above it.
 *
 * @example
 * ```tsx
 * <TopAppBar
 *   title="Orders"
 *   showBack
 *   onBackPress={goBack}
 *   actions={[{ iconName: 'search', value: 'search', label: 'Search' }]}
 *   onActionPress={(value) => value === 'search' && openSearch()}
 * />
 * ```
 *
 * @public
 */
const TopAppBar: ForwardRefExoticComponent<
  PropsWithChildren<TopAppBarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TopAppBarProps>>(
  (
    {
      overline,
      title,
      titleIconName,
      subtitle,
      showBack = false,
      leadingIconName,
      actions,
      avatarName,
      avatarSource,
      avatarLabel = 'Account',
      variant = 'small',
      elevated = false,
      transparent = false,
      tone = 'neutral',
      backLabel = 'Back',
      leadingLabel = 'Menu',
      onActionPress,
      onBackPress,
      onTitlePress,
      onAvatarPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const elevation = useElevation();
    const items = readTopAppBarActions(actions);
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.tone(tone).ink,
    );
    const textColor = tones.resolve(Tokens.color.text);
    const secondaryColor = tones.resolve(Tokens.color.textSecondary);
    const titleGlyphColor = useSlotColor(
      styled?.styleTitle,
      'color',
      textColor,
    );
    const hasLeading = showBack || !!leadingIconName;
    const hasAvatar = !!avatarName || !!avatarSource;
    const trailingCount = items.length + (hasAvatar ? 1 : 0);
    const large = variant === 'large';
    const centred = variant === 'center';
    // Centred titles need balanced flanks: both sides reserve the wider one.
    const flankWidth = centred
      ? TOP_APP_BAR_BUTTON_SIZE * Math.max(hasLeading ? 1 : 0, trailingCount)
      : undefined;

    const renderAction = (action: TopAppBarAction) =>
      action.iconName ? (
        <IconButton
          key={action.value}
          iconName={action.iconName}
          selectedIconName={action.selectedIconName}
          selected={action.selected}
          badgeCount={action.badgeCount}
          disabled={action.disabled}
          variant="standard"
          size="md"
          tone={tone}
          accessibilityLabel={action.label ?? action.value}
          onPress={() => onActionPress?.(action.value)}
          styled={{
            style: styled?.styleAction,
            styleSvg: { color: glyphColor },
          }}
        />
      ) : (
        <TextActionButton
          key={action.value}
          // readTopAppBarActions guarantees a label when iconName is absent.
          label={action.label as string}
          color={glyphColor}
          disabled={action.disabled}
          styled={styled?.styleAction}
          styledLabel={styled?.styleActionLabel}
          onPress={() => onActionPress?.(action.value)}
        />
      );

    const overlineText = overline ? (
      <Typography
        variant={TYPOGRAPHY_PARTS.overline}
        numberOfLines={1}
        style={[
          centred && defaults.centred,
          { color: secondaryColor },
          styled?.styleOverline,
        ]}
      >
        {overline}
      </Typography>
    ) : null;
    const titleLabel = title ? (
      <Typography
        variant={large ? TYPOGRAPHY_PARTS.headline : TYPOGRAPHY_PARTS.title}
        accessibilityRole="header"
        numberOfLines={1}
        style={[
          centred && defaults.centred,
          !!titleIconName && defaults.titleShrink,
          { color: textColor },
          styled?.styleTitle,
        ]}
      >
        {title}
      </Typography>
    ) : null;
    const titleText = titleIconName ? (
      <StyledView
        styled={{
          style: [defaults.titleRow, centred && defaults.titleRowCentred],
        }}
      >
        {titleLabel}
        <Icon
          iconName={titleIconName}
          size={TOP_APP_BAR_GLYPH_SIZE - 4}
          color={titleGlyphColor}
        />
      </StyledView>
    ) : (
      titleLabel
    );
    const subtitleText = subtitle ? (
      <Typography
        variant={TYPOGRAPHY_PARTS.helper}
        numberOfLines={1}
        style={[
          centred && defaults.centred,
          { color: secondaryColor },
          styled?.styleSubtitle,
        ]}
      >
        {subtitle}
      </Typography>
    ) : null;

    const TitleRoot = onTitlePress ? StyledPressable : StyledView;
    const titles = (
      <TitleRoot
        accessibilityRole={onTitlePress ? 'button' : undefined}
        onPress={onTitlePress}
        styled={{
          style: [
            large ? defaults.largeTitles : defaults.titles,
            large && { height: TOP_APP_BAR_ROW_HEIGHT },
            centred && defaults.titlesCentred,
          ],
        }}
      >
        {overlineText}
        {titleText}
        {subtitleText}
      </TitleRoot>
    );

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            {
              height: large ? TOP_APP_BAR_LARGE_HEIGHT : TOP_APP_BAR_ROW_HEIGHT,
              backgroundColor: transparent
                ? 'transparent'
                : tones.resolve(Tokens.color.background),
            },
            elevated && {
              boxShadow: elevation,
              borderBottomWidth: shape.borderWidth(1),
              borderBottomColor: tones.outline,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <StyledView
          styled={{ style: [defaults.row, { height: TOP_APP_BAR_ROW_HEIGHT }] }}
        >
          <StyledView
            styled={{ style: [defaults.leading, { minWidth: flankWidth }] }}
          >
            {leadingIconName ? (
              <IconButton
                iconName={leadingIconName}
                variant="standard"
                size="md"
                accessibilityLabel={leadingLabel}
                onPress={onBackPress}
                styled={{
                  style: styled?.styleAction,
                  styleSvg: { color: glyphColor },
                }}
              />
            ) : showBack ? (
              <GlyphButton
                name="arrowBack"
                color={glyphColor}
                accessibilityLabel={backLabel}
                mirrored={I18nManager.isRTL}
                styled={styled?.styleAction}
                onPress={onBackPress}
              />
            ) : null}
          </StyledView>
          {large ? <StyledView styled={{ style: { flex: 1 } }} /> : titles}
          <StyledView
            styled={{
              style: [
                defaults.actions,
                { minWidth: flankWidth },
                styled?.styleActions,
              ],
            }}
          >
            {items.map(renderAction)}
            {hasAvatar ? (
              <AvatarButton
                name={avatarName}
                source={avatarSource}
                accessibilityLabel={avatarLabel}
                color={glyphColor}
                styled={styled?.styleAvatar}
                onPress={onAvatarPress}
              />
            ) : null}
          </StyledView>
        </StyledView>
        {large ? titles : null}
      </StyledView>
    );
  },
);
TopAppBar.displayName = 'TopAppBar';

export default TopAppBar;
