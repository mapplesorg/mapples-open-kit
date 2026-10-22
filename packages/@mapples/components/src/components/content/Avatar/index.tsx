import {
  forwardRef,
  PropsWithChildren,
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
import { Icon, Tokens, Tone, useShape, useTones } from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  ImageStyle,
  PressableProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import {
  AVATAR_EDGE,
  AvatarShape,
  AvatarSize,
  AvatarStatus,
  initialsOf,
} from './types';

/** Props for {@link Avatar}. */
export interface AvatarProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Photo source (a uri string or an expo-image source). */
  source?: ImageProps['source'];
  /** Display name; its initials show when there is no photo. */
  name?: string;
  /** Glyph shown when there is neither photo nor name (project icon family). */
  iconName?: string;
  /** Edge: `xs` 24, `sm` 32, `md` 40, `lg` 56, `xl` 80. Defaults to `md`. */
  size?: AvatarSize;
  /** Outline shape. Defaults to `circle`. */
  shape?: AvatarShape;
  /** Colour role of the initials background. Defaults to `primary`. */
  tone?: Tone;
  /** Presence dot. Defaults to `none`. */
  status?: AvatarStatus;
  /** Count pinned to the top-right corner; hidden at 0. */
  badgeCount?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The avatar box. */
    style?: StyledProp<ViewStyle>;
    /** The photo. */
    styleImage?: StyledProp<ImageStyle>;
    /** The initials text. */
    styleInitials?: StyledProp<TextStyle>;
    /** The status dot. */
    styleStatus?: StyledProp<ViewStyle>;
    /** The count badge. */
    styleBadge?: StyledProp<ViewStyle>;
  };
}

const BADGE_MAX = 99;

/**
 * A photo, initials or glyph in a circle or rounded square, with an optional
 * presence dot and count badge.
 *
 * @example
 * ```tsx
 * <Avatar name="Ada Lovelace" size="lg" status="online" />
 * ```
 *
 * @public
 */
const Avatar: ForwardRefExoticComponent<
  PropsWithChildren<AvatarProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<AvatarProps>>(
  (
    {
      source,
      name,
      iconName,
      size = 'md',
      shape = 'circle',
      tone = 'primary',
      status = 'none',
      badgeCount,
      onPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const themeShape = useShape();
    const palette = tones.tone(tone);
    const edge = AVATAR_EDGE[size];
    const radius =
      shape === 'circle'
        ? edge / 2
        : shape === 'rounded'
          ? themeShape.radius.sm
          : 0;
    const initials = name ? initialsOf(name) : '';
    const statusColor = {
      none: 'transparent',
      online: tones.tone('success').main,
      offline: tones.resolve(Tokens.color.textTertiary),
      busy: tones.tone('error').main,
    }[status];
    const badge =
      typeof badgeCount === 'number' && badgeCount > 0
        ? badgeCount > BADGE_MAX
          ? `${BADGE_MAX}+`
          : String(badgeCount)
        : null;
    const Root = onPress ? StyledPressable : StyledView;

    return (
      <Root
        ref={ref}
        accessibilityRole={onPress ? 'button' : 'image'}
        accessibilityLabel={name}
        onPress={onPress}
        styled={{
          style: [
            defaults.root,
            {
              width: edge,
              height: edge,
              borderRadius: radius,
              backgroundColor: source ? tones.fill : palette.container,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {source ? (
          <StyledImage
            source={source}
            contentFit="cover"
            styled={{
              style: [
                { width: edge, height: edge, borderRadius: radius },
                styled?.styleImage,
              ],
            }}
          />
        ) : initials ? (
          <Typography
            variant="Label"
            style={[
              {
                color: palette.ink,
                fontSize: Math.round(edge * 0.4),
                lineHeight: Math.round(edge * 0.5),
              },
              styled?.styleInitials,
            ]}
          >
            {initials}
          </Typography>
        ) : (
          <Icon
            iconName={iconName ?? 'person'}
            size={Math.round(edge * 0.55)}
            color={palette.ink}
          />
        )}
        {status !== 'none' ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.status,
                {
                  width: Math.max(8, edge / 4),
                  height: Math.max(8, edge / 4),
                  borderRadius: edge / 8,
                  backgroundColor: statusColor,
                  borderColor: tones.resolve(Tokens.color.surface),
                },
                styled?.styleStatus,
              ],
            }}
          />
        ) : null}
        {badge !== null ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.badge,
                { backgroundColor: tones.tone('error').main },
                styled?.styleBadge,
              ],
            }}
          >
            <Typography
              variant="Caption"
              color={tones.tone('error').contrast}
              style={defaults.badgeText}
            >
              {badge}
            </Typography>
          </StyledView>
        ) : null}
      </Root>
    );
  },
);
Avatar.displayName = 'Avatar';

export default Avatar;
