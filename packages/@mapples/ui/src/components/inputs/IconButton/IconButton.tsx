import {
  ComponentType,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
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
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { SvgProps, SvgUri } from 'react-native-svg';

import useShape from '../../../hooks/useShape';
import useTones from '../../../hooks/useTones';
import {
  DISABLED_OPACITY,
  ICON_BUTTON_SHAPES,
  ICON_BUTTON_SIZES,
  IconButtonShape,
  IconButtonSize,
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
      /** The count badge (position, size, fill). */
      styleBadge?: StyledProp<ViewStyle>;
      /** The badge's number. */
      styleBadgeLabel?: StyledProp<TextStyle>;
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
  /**
   * Square size: `sm` 36, `md` 44, `lg` 52, `xl` 76 points (`xl` is the
   * primary play/pause control). Defaults to `md`.
   */
  size?: IconButtonSize;
  /**
   * Corner shape (themed variants): `auto` is round unless the project is
   * sharp, `circle` is round whatever the project radius, `rounded` takes the
   * project's control corner. Defaults to `auto`.
   */
  shape?: IconButtonShape;
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
const IconButton: ForwardRefExoticComponent<
  PropsWithChildren<IconProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<IconProps>>(
  (
    {
      styled,
      uri,
      iconName,
      variant = 'standard',
      size = 'md',
      shape: cornerShape = 'auto',
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
    const { styleSvg, styleBadge, styleBadgeLabel, ...styledViewProps } =
      styled || {};
    const tones = useTones();
    const shape = useShape();
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

    if (!ICON_BUTTON_SIZES.includes(size)) {
      throw new Error(
        `IconButton: size must be one of ${ICON_BUTTON_SIZES.join(', ')} (got ${String(size)})`,
      );
    }
    if (!ICON_BUTTON_SHAPES.includes(cornerShape)) {
      throw new Error(
        `IconButton: shape must be one of ${ICON_BUTTON_SHAPES.join(', ')} (got ${String(cornerShape)})`,
      );
    }
    const spec = shape.control[size];
    // `auto`: round, unless the project is sharp (its pill radius is 0).
    const corner =
      cornerShape === 'circle'
        ? spec.height / 2
        : cornerShape === 'rounded'
          ? spec.radius
          : Math.min(spec.height / 2, shape.radius.pill);
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
        glyph = isSelected ? palette.ink : palette.onContainer;
        break;
      case 'outlined':
        border = tones.outlineStrong;
        background = isSelected ? palette.container : 'transparent';
        glyph = isSelected ? palette.ink : text;
        break;
      default:
        background = isSelected ? palette.container : 'transparent';
        glyph = isSelected ? palette.ink : text;
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
              borderRadius: corner,
              backgroundColor: background,
              borderWidth: border ? shape.borderWidth(1) : 0,
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
                  borderRadius: corner,
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
                styleBadge,
              ],
            }}
          >
            <Typography
              variant="Caption"
              color={tones.tone('error').contrast}
              style={[styler.badgeText, styleBadgeLabel]}
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
