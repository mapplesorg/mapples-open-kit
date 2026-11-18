import {
  forwardRef,
  PropsWithChildren,
  useState,
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
  DISABLED_OPACITY,
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import { useControllableState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  REACTION_BUTTON_GLYPH,
  REACTION_BUTTON_TOUCH_TARGET,
  ReactionButtonSize,
} from './types';

/** Props for {@link ReactionButton}. */
export interface ReactionButtonProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Glyph while the reaction is not given (project icon family). Defaults to `heart-outline`. */
  iconName?: string;
  /** Glyph while it is given. Defaults to `heart`. */
  activeIconName?: string;
  /** Whether the reaction is given (controlled). */
  value?: boolean;
  /** Fires with the next state. */
  onValueChange?: (value: boolean) => void;
  /** A number beside the glyph (likes, saves). Hidden when absent. */
  count?: number;
  /** Colour role of the given state. Defaults to `error` (a red heart). */
  tone?: Tone;
  /** Glyph size: `sm` 20, `md` 24, `lg` 32. Defaults to `md`. */
  size?: ReactionButtonSize;
  /** Disables interaction and dims the button. */
  disabled?: boolean;
  /** Styled slots. */
  styled?: {
    /** The button. */
    style?: StyledProp<ViewStyle>;
    /** The glyph (`color` while the reaction is not given). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The count. */
    styleCount?: StyledProp<TextStyle>;
  };
}

/**
 * A reaction the user toggles with one tap — like, save, bookmark, follow.
 * The glyph switches to its filled form in the tone and pops, so the tap is
 * felt the moment it lands; taking the reaction back is quiet. An optional
 * count sits beside it. It needs an `accessibilityLabel` ('Like').
 *
 * @example
 * ```tsx
 * <ReactionButton
 *   accessibilityLabel="Like"
 *   value={liked}
 *   onValueChange={setLiked}
 *   count={likes}
 * />
 * ```
 *
 * @public
 */
const ReactionButton: ForwardRefExoticComponent<
  PropsWithChildren<ReactionButtonProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<ReactionButtonProps>
>(
  (
    {
      iconName = 'heart-outline',
      activeIconName = 'heart',
      value,
      onValueChange,
      count,
      tone = 'error',
      size = 'md',
      disabled,
      onPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (
      count != null &&
      (typeof count !== 'number' || !Number.isFinite(count))
    ) {
      throw new Error(
        `ReactionButton: count (${String(count)}) must be a finite number`,
      );
    }

    const tones = useTones();
    const isDisabled = !!disabled;
    const [given, setGiven] = useControllableState<boolean>({
      value,
      defaultValue: false,
      onChange: onValueChange,
    });
    // How many times the reaction was given here: each one pops the glyph
    // (a new key replays the animation). A state that arrives given does not.
    const [pops, setPops] = useState(0);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const restColor = useSlotColor(styled?.styleIcon, 'color', secondary);
    const glyph = REACTION_BUTTON_GLYPH[size];

    const handlePress: PressableProps['onPress'] = (event) => {
      if (!given) setPops((current) => current + 1);
      setGiven(!given);
      onPress?.(event);
    };

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="switch"
        accessibilityState={{ checked: given, disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={Math.max(0, (REACTION_BUTTON_TOUCH_TARGET - glyph) / 2)}
        onPress={handlePress}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            isDisabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <StyledView
          key={pops}
          styled={{ style: pops > 0 && given ? defaults.pop : undefined }}
        >
          <Icon
            iconName={given ? activeIconName : iconName}
            size={glyph}
            color={given ? tones.tone(tone).main : restColor}
          />
        </StyledView>
        {count != null ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            // Cut rather than ellipsized: see `LiveIndicator`'s label.
            numberOfLines={1}
            ellipsizeMode="clip"
            style={[
              { color: secondary, fontVariant: ['tabular-nums'] },
              styled?.styleCount,
            ]}
          >
            {String(count)}
          </Typography>
        ) : null}
      </StyledPressable>
    );
  },
);
ReactionButton.displayName = 'ReactionButton';

export default ReactionButton;
