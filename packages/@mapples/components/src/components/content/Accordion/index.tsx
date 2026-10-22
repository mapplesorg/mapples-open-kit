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
  TYPOGRAPHY_PARTS,
  Tokens,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  LayoutChangeEvent,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  Glyph,
  useControllableState,
  useInteractionState,
  useSlotColor,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import { ACCORDION_HEADER_HEIGHT, AccordionVariant } from './types';

/** Props for {@link Accordion}. */
export interface AccordionProps extends Omit<ViewProps, 'children'> {
  /** Header text. */
  title?: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** Open state (controlled). Omit to let the accordion keep its own state. */
  expanded?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Fires with the next open state — the new value is the first argument. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Glyph before the title (project icon family). */
  leadingIconName?: string;
  /** Disables the header and dims the section. */
  disabled?: boolean;
  /** Surface: bare, outlined or tinted. Defaults to `plain`. */
  variant?: AccordionVariant;
  /** Styled slots for every visual part. */
  styled?: {
    /** The section. */
    style?: StyledProp<ViewStyle>;
    /** The header row. */
    styleHeader?: StyledProp<ViewStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The body holding the children. */
    styleContent?: StyledProp<ViewStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * An expandable section: a header with a rotating chevron and a body that
 * animates open to the height of its children. The open state is controlled
 * through `expanded`/`onExpandedChange` or kept internally.
 *
 * @example
 * ```tsx
 * <Accordion title="Shipping" subtitle="Free over €50" expanded={open} onExpandedChange={setOpen}>
 *   <Typography variant="Body">Orders ship within two business days.</Typography>
 * </Accordion>
 * ```
 *
 * @public
 */
const Accordion: ForwardRefExoticComponent<
  PropsWithChildren<AccordionProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<AccordionProps>>(
  (
    {
      title,
      subtitle,
      expanded,
      defaultExpanded = false,
      onExpandedChange,
      leadingIconName,
      disabled = false,
      variant = 'plain',
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const [isExpanded, setExpanded] = useControllableState<boolean>({
      value: expanded,
      defaultValue: defaultExpanded,
      onChange: onExpandedChange,
    });
    const interaction = useInteractionState({}, disabled);
    const [measured, setMeasured] = useState<number | null>(null);

    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', secondary);

    // Two values, two drivers: the chevron rotates natively, the height is a
    // layout property and must stay on the JS driver.
    const rotation = useTimingValue(isExpanded ? 1 : 0);
    const progress = useTimingValue(isExpanded ? 1 : 0, { native: false });
    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    // Until the body has been measured an open section renders unclipped so
    // the first paint shows its content at the natural height.
    const height =
      measured === null
        ? isExpanded
          ? undefined
          : 0
        : progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, measured],
          });

    const onContentLayout = (event: LayoutChangeEvent) =>
      setMeasured(event.nativeEvent.layout.height);

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            variant !== 'plain' && {
              borderRadius: shape.radius.md,
              borderWidth: variant === 'outlined' || tones.isDark ? 1 : 0,
              borderColor: tones.outline,
              backgroundColor:
                variant === 'filled'
                  ? tones.fill
                  : tones.resolve(Tokens.color.surface),
            },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        <StyledPressable
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ expanded: isExpanded, disabled }}
          disabled={disabled}
          onPress={() => setExpanded(!isExpanded)}
          {...interaction.handlers}
          styled={{
            style: [
              defaults.header,
              { minHeight: ACCORDION_HEADER_HEIGHT },
              styled?.styleHeader,
            ],
          }}
        >
          {interaction.pressed || interaction.hovered ? (
            <StyledView
              pointerEvents="none"
              styled={{
                style: [
                  defaults.stateLayer,
                  {
                    backgroundColor: tones.stateLayer(
                      text,
                      interaction.pressed ? 'pressed' : 'hover',
                    ),
                  },
                ],
              }}
            />
          ) : null}
          {leadingIconName ? (
            <Icon iconName={leadingIconName} size={24} color={glyphColor} />
          ) : null}
          <StyledView styled={{ style: defaults.texts }}>
            {title ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.title}
                numberOfLines={2}
                style={[{ color: text }, styled?.styleTitle]}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={2}
                style={[{ color: secondary }, styled?.styleSubtitle]}
              >
                {subtitle}
              </Typography>
            ) : null}
          </StyledView>
          <Animated.View
            pointerEvents="none"
            style={{ transform: [{ rotate }] }}
          >
            <Glyph name="chevronDown" size={24} color={glyphColor} />
          </Animated.View>
        </StyledPressable>
        <Animated.View
          pointerEvents={isExpanded ? 'auto' : 'none'}
          accessibilityElementsHidden={!isExpanded}
          importantForAccessibility={
            isExpanded ? 'auto' : 'no-hide-descendants'
          }
          style={{ overflow: 'hidden', height }}
        >
          <StyledView
            onLayout={onContentLayout}
            styled={{ style: [defaults.content, styled?.styleContent] }}
          >
            {children}
          </StyledView>
        </Animated.View>
      </StyledView>
    );
  },
);
Accordion.displayName = 'Accordion';

export default Accordion;
