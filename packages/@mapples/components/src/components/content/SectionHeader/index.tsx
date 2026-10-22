import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Pressable, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { SectionHeaderVariant } from './types';

/** Props for {@link SectionHeader}. */
export interface SectionHeaderProps extends Omit<ViewProps, 'children'> {
  /** Small eyebrow above the heading ('THURSDAY 22 OCT'). */
  overline?: string;
  /** The heading. */
  title?: string;
  /** Supporting text under the heading. */
  subtitle?: string;
  /** Trailing link label ('See all'); omit to hide it. */
  actionLabel?: string;
  /** Fires when the trailing link is pressed. */
  onActionPress?: () => void;
  /** Non-interactive text at the end ('+€3 077.05', '2 left today'); cannot be combined with `actionLabel`. */
  trailingText?: string;
  /** Heading style: a subtitle-sized title or a small overline. Defaults to `plain`. */
  variant?: SectionHeaderVariant;
  /** Colour role of the action link. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** The overline above the heading. */
    styleOverline?: StyledProp<TextStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The action link. */
    styleAction?: StyledProp<TextStyle>;
    /** The trailing text. */
    styleTrailingText?: StyledProp<TextStyle>;
  };
}

/**
 * The heading above a rail, list or grid: an overline, a title, optional
 * supporting text and either a trailing action link or a plain trailing text
 * (a day total, a count).
 *
 * @example
 * ```tsx
 * <SectionHeader title="Popular near you" actionLabel="See all" onActionPress={openAll} />
 * <SectionHeader overline="THURSDAY 22 OCT" title="Today" trailingText="+€3 077.05" />
 * ```
 *
 * @public
 */
const SectionHeader: ForwardRefExoticComponent<
  PropsWithChildren<SectionHeaderProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<SectionHeaderProps>
>(
  (
    {
      overline,
      title,
      subtitle,
      actionLabel,
      onActionPress,
      trailingText,
      variant = 'plain',
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const secondary = tones.resolve(Tokens.color.textSecondary);

    if (trailingText && actionLabel) {
      throw new Error(
        'SectionHeader: set either trailingText or actionLabel, not both',
      );
    }

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            {
              alignSelf: 'stretch',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <StyledView styled={{ style: { flex: 1, gap: 2 } }}>
          {overline ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.overline}
              numberOfLines={1}
              style={[{ color: secondary }, styled?.styleOverline]}
            >
              {overline}
            </Typography>
          ) : null}
          {title ? (
            <Typography
              variant={
                variant === 'overline'
                  ? TYPOGRAPHY_PARTS.overline
                  : TYPOGRAPHY_PARTS.title
              }
              accessibilityRole="header"
              style={[
                {
                  color:
                    variant === 'overline'
                      ? secondary
                      : tones.resolve(Tokens.color.text),
                },
                styled?.styleTitle,
              ]}
            >
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={[{ color: secondary }, styled?.styleSubtitle]}
            >
              {subtitle}
            </Typography>
          ) : null}
        </StyledView>
        {actionLabel ? (
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={onActionPress}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.link}
              style={[{ color: tones.tone(tone).ink }, styled?.styleAction]}
            >
              {actionLabel}
            </Typography>
          </Pressable>
        ) : null}
        {trailingText ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            numberOfLines={1}
            style={[{ color: secondary }, styled?.styleTrailingText]}
          >
            {trailingText}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
