import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  ELEVATION,
  IconButton,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import {
  I18nManager,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import GlyphButton from './GlyphButton';
import {
  readTopAppBarActions,
  TOP_APP_BAR_BUTTON_SIZE,
  TOP_APP_BAR_LARGE_HEIGHT,
  TOP_APP_BAR_ROW_HEIGHT,
  TopAppBarAction,
  TopAppBarVariant,
} from './types';

/** Props for {@link TopAppBar}. */
export interface TopAppBarProps extends Omit<ViewProps, 'children'> {
  /** The page title. */
  title?: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** Shows a back arrow at the start, firing `onBackPress`. Defaults to `false`. */
  showBack?: boolean;
  /** A project glyph at the start instead of the back arrow ('menu'), firing `onBackPress`. */
  leadingIconName?: string;
  /** Up to three trailing glyph buttons. */
  actions?: TopAppBarAction[];
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
  /** Styled slots for every visual part. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
    /** The title text. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle text. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The trailing actions row. */
    styleActions?: StyledProp<ViewStyle>;
    /** Each glyph button. */
    styleAction?: StyledProp<ViewStyle>;
  };
}

/**
 * An in-content app bar: back arrow or menu glyph, title and subtitle, and
 * up to three trailing actions. Use it only when the navigator's own header
 * is hidden; the page owns the safe area above it.
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
const TopAppBar = forwardRef<View, PropsWithChildren<TopAppBarProps>>(
  (
    {
      title,
      subtitle,
      showBack = false,
      leadingIconName,
      actions,
      variant = 'small',
      elevated = false,
      transparent = false,
      tone = 'neutral',
      backLabel = 'Back',
      leadingLabel = 'Menu',
      onActionPress,
      onBackPress,
      onTitlePress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const items = readTopAppBarActions(actions);
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.tone(tone).main,
    );
    const textColor = tones.resolve(Tokens.color.text);
    const secondaryColor = tones.resolve(Tokens.color.textSecondary);
    const hasLeading = showBack || !!leadingIconName;
    const large = variant === 'large';
    const centred = variant === 'center';
    // Centred titles need balanced flanks: both sides reserve the wider one.
    const flankWidth = centred
      ? TOP_APP_BAR_BUTTON_SIZE * Math.max(hasLeading ? 1 : 0, items.length)
      : undefined;

    const renderAction = (action: TopAppBarAction) => (
      <IconButton
        key={action.value}
        iconName={action.iconName}
        variant="standard"
        size="md"
        accessibilityLabel={action.label ?? action.value}
        onPress={() => onActionPress?.(action.value)}
        styled={{
          style: styled?.styleAction,
          styleSvg: { color: glyphColor },
        }}
      />
    );

    const titleText = title ? (
      <Typography
        variant={large ? TYPOGRAPHY_PARTS.headline : TYPOGRAPHY_PARTS.title}
        accessibilityRole="header"
        numberOfLines={1}
        style={[
          centred && defaults.centred,
          { color: textColor },
          styled?.styleTitle,
        ]}
      >
        {title}
      </Typography>
    ) : null;
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
              boxShadow: ELEVATION,
              borderBottomWidth: 1,
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
          </StyledView>
        </StyledView>
        {large ? titles : null}
      </StyledView>
    );
  },
);
TopAppBar.displayName = 'TopAppBar';

export default TopAppBar;
