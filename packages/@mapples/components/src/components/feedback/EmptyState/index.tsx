import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledImage,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  Button,
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useTones,
} from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  ImageStyle,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  EMPTY_STATE_GEOMETRY,
  EMPTY_STATE_PADDING,
  EmptyStateSize,
} from './types';

/** Props for {@link EmptyState}. */
export interface EmptyStateProps extends Omit<ViewProps, 'children'> {
  /** Heading ('No results'). */
  title?: string;
  /** Supporting text under the heading. */
  message?: string;
  /** Glyph in a tinted circle above the heading (project icon family). */
  iconName?: string;
  /** Illustration shown instead of the glyph (a uri string or an expo-image source). */
  imageSource?: ImageProps['source'];
  /** Label of the filled action; omit to hide it. */
  actionLabel?: string;
  /** Fires when the action is pressed. */
  onActionPress?: () => void;
  /** Label of the text action; omit to hide it. */
  secondaryActionLabel?: string;
  /** Fires when the secondary action is pressed. */
  onSecondaryActionPress?: () => void;
  /** Vertical padding: `sm` 24, `md` 40, `lg` 64. Defaults to `md`. */
  size?: EmptyStateSize;
  /** Colour role of the glyph circle and the actions. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The column. */
    style?: StyledProp<ViewStyle>;
    /** The tinted circle behind the glyph (its `color` is the glyph colour). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The illustration. */
    styleImage?: StyledProp<ImageStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The message. */
    styleMessage?: StyledProp<TextStyle>;
    /** The actions row. */
    styleActions?: StyledProp<ViewStyle>;
    /** Each action button. */
    styleAction?: StyledProp<ViewStyle>;
  };
}

/**
 * A centred placeholder for a screen or list with nothing to show yet — a
 * glyph or illustration, a title, a short explanation and up to two actions
 * that lead somewhere useful.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   iconName="search"
 *   title="No results"
 *   message="Try a different spelling or fewer filters."
 *   actionLabel="Clear filters"
 *   onActionPress={clearFilters}
 * />
 * ```
 *
 * @public
 */
const EmptyState: ForwardRefExoticComponent<
  PropsWithChildren<EmptyStateProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<EmptyStateProps>>(
  (
    {
      title,
      message,
      iconName,
      imageSource,
      actionLabel,
      onActionPress,
      secondaryActionLabel,
      onSecondaryActionPress,
      size = 'md',
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', palette.main);

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            { paddingVertical: EMPTY_STATE_PADDING[size] },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {imageSource ? (
          <StyledImage
            source={imageSource}
            contentFit="contain"
            accessibilityIgnoresInvertColors
            styled={{ style: [defaults.image, styled?.styleImage] }}
          />
        ) : iconName ? (
          <StyledView
            styled={{
              style: [
                defaults.icon,
                { backgroundColor: palette.container },
                styled?.styleIcon,
              ],
            }}
          >
            <Icon
              iconName={iconName}
              size={EMPTY_STATE_GEOMETRY.icon}
              color={glyphColor}
            />
          </StyledView>
        ) : null}
        {title ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.title}
            accessibilityRole="header"
            style={[
              defaults.title,
              { color: tones.resolve(Tokens.color.text) },
              styled?.styleTitle,
            ]}
          >
            {title}
          </Typography>
        ) : null}
        {message ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.body}
            style={[
              defaults.message,
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleMessage,
            ]}
          >
            {message}
          </Typography>
        ) : null}
        {actionLabel || secondaryActionLabel ? (
          <StyledView
            styled={{ style: [defaults.actions, styled?.styleActions] }}
          >
            {actionLabel ? (
              <Button
                label={actionLabel}
                variant="filled"
                tone={tone}
                styled={{ style: styled?.styleAction }}
                onPress={onActionPress}
              />
            ) : null}
            {secondaryActionLabel ? (
              <Button
                label={secondaryActionLabel}
                variant="text"
                tone={tone}
                styled={{ style: styled?.styleAction }}
                onPress={onSecondaryActionPress}
              />
            ) : null}
          </StyledView>
        ) : null}
      </StyledView>
    );
  },
);
EmptyState.displayName = 'EmptyState';

export default EmptyState;
