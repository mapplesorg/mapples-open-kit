import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, Tone, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Pressable, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { SectionHeaderVariant } from './types';

/** Props for {@link SectionHeader}. */
export interface SectionHeaderProps extends Omit<ViewProps, 'children'> {
  /** The heading. */
  title?: string;
  /** Supporting text under the heading. */
  subtitle?: string;
  /** Trailing link label ('See all'); omit to hide it. */
  actionLabel?: string;
  /** Fires when the trailing link is pressed. */
  onActionPress?: () => void;
  /** Heading style: a subtitle-sized title or a small overline. Defaults to `plain`. */
  variant?: SectionHeaderVariant;
  /** Colour role of the action link. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** The heading. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The action link. */
    styleAction?: StyledProp<TextStyle>;
  };
}

/**
 * The heading above a rail, list or grid: a title, optional supporting text
 * and a trailing action link.
 *
 * @example
 * ```tsx
 * <SectionHeader title="Popular near you" actionLabel="See all" onActionPress={openAll} />
 * ```
 *
 * @public
 */
const SectionHeader = forwardRef<View, PropsWithChildren<SectionHeaderProps>>(
  (
    {
      title,
      subtitle,
      actionLabel,
      onActionPress,
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
                  color: tones.resolve(
                    variant === 'overline'
                      ? Tokens.color.textSecondary
                      : Tokens.color.text,
                  ),
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
              style={[
                { color: tones.resolve(Tokens.color.textSecondary) },
                styled?.styleSubtitle,
              ]}
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
              style={[{ color: tones.tone(tone).main }, styled?.styleAction]}
            >
              {actionLabel}
            </Typography>
          </Pressable>
        ) : null}
      </StyledView>
    );
  },
);
SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
