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
import { TYPOGRAPHY_PARTS, Tokens, useShape, useTones } from '@mapples/ui';
import {
  PressableProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import Avatar from '../Avatar';
import { AVATAR_EDGE, AvatarSize } from '../Avatar/types';

import { defaults } from './defaults';
import {
  AVATAR_GROUP_RING,
  AvatarGroupItem,
  readAvatarGroupItems,
} from './types';

/** Props for {@link AvatarGroup}. */
export interface AvatarGroupProps extends Omit<ViewProps, 'children'> {
  /** The members: `[{ source?, name? }]`. */
  items?: AvatarGroupItem[];
  /** How many avatars show before the `+N` overflow. Defaults to `3`. */
  max?: number;
  /** Avatar edge: `xs` 24, `sm` 32, `md` 40, `lg` 56, `xl` 80. Defaults to `md`. */
  size?: AvatarSize;
  /** How far each avatar overlaps the previous one, in points. Defaults to `8`. */
  overlap?: number;
  /** Fires when the group is pressed (opens the full member list). */
  onPress?: PressableProps['onPress'];
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** Each avatar's ring (the surface-coloured border). */
    styleAvatar?: StyledProp<ViewStyle>;
    /** The `+N` overflow circle. */
    styleOverflow?: StyledProp<ViewStyle>;
    /** The `+N` text. */
    styleOverflowLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A row of overlapping avatars with a `+N` circle for the members past
 * `max`. Each avatar wears a surface-coloured ring so the overlap reads.
 *
 * @example
 * ```tsx
 * <AvatarGroup
 *   items={[{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { source: { uri } }, { name: 'Grace Hopper' }]}
 *   max={3}
 *   size="sm"
 * />
 * ```
 *
 * @public
 */
const AvatarGroup: ForwardRefExoticComponent<
  PropsWithChildren<AvatarGroupProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<AvatarGroupProps>>(
  (
    {
      items,
      max = 3,
      size = 'md',
      overlap = 8,
      onPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const members = readAvatarGroupItems(items, 'AvatarGroup');
    const shown = members.slice(0, Math.max(0, max));
    const hidden = members.length - shown.length;
    const edge = AVATAR_EDGE[size];
    const surface = tones.resolve(Tokens.color.surface);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const Root = onPress ? StyledPressable : StyledView;

    const names = members.map((member) => member.name).filter(Boolean);
    const accessibilityLabel =
      names.length > 0
        ? hidden > 0
          ? `${names.join(', ')} +${hidden}`
          : names.join(', ')
        : undefined;

    const ringStyle = (index: number) => [
      defaults.ring,
      {
        borderWidth: AVATAR_GROUP_RING,
        borderColor: surface,
        borderRadius: shape.radius.pill,
        marginStart: index > 0 ? -overlap : 0,
      },
      styled?.styleAvatar,
    ];

    return (
      <Root
        ref={ref}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {shown.map((member, index) => (
          <StyledView key={index} styled={{ style: ringStyle(index) }}>
            <Avatar source={member.source} name={member.name} size={size} />
          </StyledView>
        ))}
        {hidden > 0 ? (
          <StyledView styled={{ style: ringStyle(shown.length) }}>
            <StyledView
              styled={{
                style: [
                  defaults.overflow,
                  {
                    width: edge,
                    height: edge,
                    borderRadius: edge / 2,
                    backgroundColor: tones.fillStrong,
                  },
                  styled?.styleOverflow,
                ],
              }}
            >
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[
                  {
                    color: secondary,
                    fontSize: Math.round(edge * 0.4),
                    lineHeight: Math.round(edge * 0.5),
                  },
                  styled?.styleOverflowLabel,
                ]}
              >
                {`+${hidden}`}
              </Typography>
            </StyledView>
          </StyledView>
        ) : null}
      </Root>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

export default AvatarGroup;
