import {
  ComponentType,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';

import {
  styled as makeStyled,
  styled,
  StyledPressable,
  StyledProp,
  StyledProps,
  StyledView,
  SvgStyle,
  Styler,
  Typography,
  WithStyledProps,
} from '@mapples/style';
import { SvgSource } from '@mapples/types';
import {
  GestureResponderEvent,
  MouseEvent,
  PressableProps,
  View,
  ViewProps,
} from 'react-native';
import { SvgProps, SvgUri } from 'react-native-svg';

import useTones from '../../../hooks/useTones';
import {
  CONTROL_SIZES,
  ControlSize,
  DISABLED_OPACITY,
  IconButtonVariant,
  Tone,
} from '../../../tokens';
import Icon from '../../media/Icon';

import MockIcon from './MockIcon';

/**
 * Props for the IconButton component.
 *
 * @public
 */
export type IconProps = PropsWithChildren<
  Omit<WithStyledProps<PressableProps>, 'styled'> & {
    /** Styling configuration for the button container and SVG icon */
    styled?: StyledProps<ViewProps> & {
      /** SVG-specific styling */
      styleSvg?: StyledProp<SvgStyle>;
    };
  }
> & {
  /** URI for the SVG icon to display (legacy vector icons) */
  uri?: string | SvgSource;
  /**
   * Glyph name from the project icon family. Set, the button renders as a
   * themed icon button (`variant`, `size`, `tone`, toggle state, badge);
   * unset, it renders the legacy `uri` vector exactly as before.
   */
  iconName?: string;
  /** Themed appearance: `standard` (no fill), `filled`, `tonal` or `outlined`. */
  variant?: IconButtonVariant;
  /** Square size: `sm` 36, `md` 44, `lg` 52 points. */
  size?: ControlSize;
  /** Colour role. Defaults to `primary`. */
  tone?: Tone;
  /** Toggle state (controlled). Omit for an uncontrolled toggle, or leave both unset for a plain button. */
  selected?: boolean;
  /** Fires with the next toggle state after a press. */
  onSelectedChange?: (selected: boolean) => void;
  /** Glyph shown while selected (e.g. the filled heart). */
  selectedIconName?: string;
  /** Count pinned to the top-right corner; hidden at 0. */
  badgeCount?: number;
};

const StyledSvgUri = styled(SvgUri);

const BADGE_MAX = 99;

/**
 * An icon-only button.
 *
 * With `iconName` it is a themed control: a square of `size`, painted by
 * `variant` and `tone`, optionally a toggle (`selected`) with its own glyph,
 * and a count badge. With only `uri` it renders the legacy SVG vector.
 * Icon-only controls need an `accessibilityLabel`.
 *
 * @example
 * ```tsx
 * <IconButton
 *   iconName="heart-outline"
 *   selectedIconName="heart"
 *   variant="standard"
 *   selected={liked}
 *   onSelectedChange={setLiked}
 *   accessibilityLabel="Like"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <IconButton
 *   uri="https://example.com/icon.svg"
 *   onPress={() => console.log('Icon pressed')}
 *   styled={{ styleSvg: { width: 24, height: 24, color: 'blue' } }}
 * />
 * ```
 *
 * @public
 */
const IconButton = forwardRef<View, PropsWithChildren<IconProps>>(
  (
    {
      styled,
      uri,
      iconName,
      variant = 'standard',
      size = 'md',
      tone = 'primary',
      selected,
      onSelectedChange,
      selectedIconName,
      badgeCount,
      disabled = false,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      children,
      ...props
    },
    ref,
  ) => {
    const { styleSvg, ...styledViewProps } = styled || {};
    const tones = useTones();
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [internalSelected, setInternalSelected] = useState(false);

    const ejectStyle = Styler.flatten(styleSvg);

    const isToggle = selected !== undefined || !!onSelectedChange;
    const isSelected = selected ?? internalSelected;

    const handlePress = useCallback(
      (event: GestureResponderEvent) => {
        if (isToggle) {
          const next = !isSelected;
          if (selected === undefined) setInternalSelected(next);
          onSelectedChange?.(next);
        }
        onPress?.(event);
      },
      [isSelected, isToggle, onPress, onSelectedChange, selected],
    );
    const handlePressIn = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      },
      [onPressIn],
    );
    const handlePressOut = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      },
      [onPressOut],
    );
    const handleHoverIn = useCallback(
      (event: MouseEvent) => {
        setHovered(true);
        onHoverIn?.(event);
      },
      [onHoverIn],
    );
    const handleHoverOut = useCallback(
      (event: MouseEvent) => {
        setHovered(false);
        onHoverOut?.(event);
      },
      [onHoverOut],
    );

    if (iconName === undefined) {
      const getUriComponent = (Uri: { default: ComponentType<SvgProps> }) => {
        const StyledSvg = makeStyled(Uri.default);

        return (
          <StyledSvg
            styled={{
              width: ejectStyle?.width as string | number,
              height: ejectStyle?.height as string | number,
              color: ejectStyle?.color,
              style: styleSvg,
            }}
          />
        );
      };

      return (
        <StyledPressable
          ref={ref}
          styled={styledViewProps}
          disabled={disabled}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
          {...props}
        >
          {uri ? (
            <>
              {typeof uri === 'string' ? (
                <StyledSvgUri
                  uri={uri}
                  styled={{
                    width: ejectStyle?.width as string | number,
                    height: ejectStyle?.height as string | number,
                    color: ejectStyle?.color,
                    style: styleSvg,
                  }}
                />
              ) : (
                getUriComponent(uri)
              )}
            </>
          ) : (
            <MockIcon
              styled={{
                width: ejectStyle?.width as string | number,
                height: ejectStyle?.height as string | number,
                color: ejectStyle?.color,
                style: styleSvg,
              }}
            />
          )}
          {children}
        </StyledPressable>
      );
    }

    const spec = CONTROL_SIZES[size];
    const palette = tones.tone(tone);
    const text = tones.resolve('theme.text.primary');
    const isDisabled = !!disabled;

    let background = 'transparent';
    let glyph = text;
    let border: string | undefined;
    switch (variant) {
      case 'filled':
        background = palette.main;
        glyph = palette.contrast;
        break;
      case 'tonal':
        background = palette.container;
        glyph = isSelected ? palette.main : palette.onContainer;
        break;
      case 'outlined':
        border = tones.outlineStrong;
        background = isSelected ? palette.container : 'transparent';
        glyph = isSelected ? palette.main : text;
        break;
      default:
        background = isSelected ? palette.container : 'transparent';
        glyph = isSelected ? palette.main : text;
    }
    const authoredGlyph = ejectStyle?.color;
    const glyphColor =
      typeof authoredGlyph === 'string' ? tones.resolve(authoredGlyph) : glyph;
    const glyphSize =
      (ejectStyle?.width as number | undefined) ?? spec.iconSize + 4;
    const showLayer = !isDisabled && (pressed || hovered);
    const badge =
      typeof badgeCount === 'number' && badgeCount > 0
        ? badgeCount > BADGE_MAX
          ? `${BADGE_MAX}+`
          : String(badgeCount)
        : null;

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          selected: isToggle ? isSelected : undefined,
        }}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        styled={{
          ...styledViewProps,
          style: [
            styler.root,
            {
              width: spec.height,
              height: spec.height,
              borderRadius: spec.height / 2,
              backgroundColor: background,
              borderWidth: border ? 1 : 0,
              borderColor: border ?? 'transparent',
            },
            styledViewProps.style,
            isDisabled && styler.disabled,
          ],
        }}
        {...props}
      >
        {showLayer && (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                styler.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    glyphColor,
                    pressed ? 'pressed' : 'hover',
                  ),
                  borderRadius: spec.height / 2,
                },
              ],
            }}
          />
        )}
        <Icon
          iconName={
            isSelected && selectedIconName ? selectedIconName : iconName
          }
          size={glyphSize}
          color={glyphColor}
          styled={{ styleSvg }}
        />
        {badge !== null && (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                styler.badge,
                { backgroundColor: tones.tone('error').main },
              ],
            }}
          >
            <Typography
              variant="Caption"
              color={tones.tone('error').contrast}
              style={styler.badgeText}
            >
              {badge}
            </Typography>
          </StyledView>
        )}
        {children}
      </StyledPressable>
    );
  },
);
IconButton.displayName = 'IconButton';

const styler = Styler.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});

export default IconButton;
