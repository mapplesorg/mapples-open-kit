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
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  PressableProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { Glyph, useSlotColor } from '../../../internal';
import Avatar from '../Avatar';

import { defaults } from './defaults';
import { MESSAGE_BUBBLE, MessageDirection, MessageStatus } from './types';

/** Props for {@link MessageBubble}. */
export interface MessageBubbleProps extends Omit<ViewProps, 'children'> {
  /** The message. */
  text?: string;
  /** Received (`incoming`, at the start) or sent (`outgoing`, at the end). Defaults to `incoming`. */
  direction?: MessageDirection;
  /** Timestamp shown inside the bubble ('09:41'). */
  time?: string;
  /** Delivery state, shown on outgoing messages as one or two checks. */
  status?: MessageStatus;
  /** Photo of the sender, shown before incoming bubbles. */
  avatarSource?: ImageProps['source'];
  /** Sender name; its initials show before incoming bubbles without a photo. */
  avatarName?: string;
  /** Sharpens the bottom corner on the sender's side. Defaults to `true`. */
  showTail?: boolean;
  /** Fires when the bubble is pressed. */
  onPress?: PressableProps['onPress'];
  /** Fires when the bubble is long-pressed (reactions, copy). */
  onLongPress?: PressableProps['onLongPress'];
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** The bubble. */
    styleBubble?: StyledProp<ViewStyle>;
    /** The message text. */
    styleText?: StyledProp<TextStyle>;
    /** The time. */
    styleTime?: StyledProp<TextStyle>;
    /** The status checks (`color`). */
    styleStatus?: StyledProp<ViewStyle & { color?: string }>;
    /** The sender avatar. */
    styleAvatar?: StyledProp<ViewStyle>;
  };
}

/**
 * One chat message. Outgoing bubbles sit at the end in the primary colour
 * with a delivery status; incoming ones sit at the start on a neutral fill
 * with an optional sender avatar.
 *
 * @example
 * ```tsx
 * <MessageBubble text="On my way!" direction="outgoing" time="09:41" status="read" />
 * <MessageBubble text="See you there." avatarName="Ada Lovelace" time="09:42" />
 * ```
 *
 * @public
 */
const MessageBubble: ForwardRefExoticComponent<
  PropsWithChildren<MessageBubbleProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<MessageBubbleProps>
>(
  (
    {
      text,
      direction = 'incoming',
      time,
      status,
      avatarSource,
      avatarName,
      showTail = true,
      onPress,
      onLongPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone('primary');
    const outgoing = direction === 'outgoing';
    const pressable = !!onPress || !!onLongPress;
    const Bubble = pressable ? StyledPressable : StyledView;

    const textColor = outgoing
      ? palette.contrast
      : tones.resolve(Tokens.color.text);
    const metaColor = outgoing
      ? palette.contrast
      : tones.resolve(Tokens.color.textSecondary);
    const statusColor = useSlotColor(styled?.styleStatus, 'color', metaColor);
    const showAvatar =
      !outgoing && (avatarSource !== undefined || !!avatarName);
    const showStatus = outgoing && !!status;

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            { justifyContent: outgoing ? 'flex-end' : 'flex-start' },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {showAvatar ? (
          <Avatar
            source={avatarSource}
            name={avatarName}
            size="sm"
            styled={{ style: styled?.styleAvatar }}
          />
        ) : null}
        <Bubble
          accessibilityRole={pressable ? 'button' : 'text'}
          accessibilityLabel={text}
          onPress={onPress}
          onLongPress={onLongPress}
          styled={{
            style: [
              defaults.bubble,
              {
                maxWidth: MESSAGE_BUBBLE.maxWidth,
                borderRadius: MESSAGE_BUBBLE.radius,
                backgroundColor: outgoing ? palette.main : tones.fillStrong,
              },
              showTail &&
                (outgoing
                  ? { borderBottomEndRadius: MESSAGE_BUBBLE.tailRadius }
                  : { borderBottomStartRadius: MESSAGE_BUBBLE.tailRadius }),
              styled?.styleBubble,
            ],
          }}
        >
          {text ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              style={[{ color: textColor }, styled?.styleText]}
            >
              {text}
            </Typography>
          ) : null}
          {time || showStatus ? (
            <StyledView styled={{ style: defaults.meta }}>
              {time ? (
                <Typography
                  variant={TYPOGRAPHY_PARTS.helper}
                  numberOfLines={1}
                  style={[
                    { color: metaColor, opacity: outgoing ? 0.7 : 1 },
                    styled?.styleTime,
                  ]}
                >
                  {time}
                </Typography>
              ) : null}
              {showStatus ? (
                <StyledView
                  accessibilityLabel={status}
                  styled={{
                    style: [
                      defaults.status,
                      { opacity: status === 'read' ? 1 : 0.7 },
                      styled?.styleStatus,
                    ],
                  }}
                >
                  <Glyph
                    name="check"
                    size={MESSAGE_BUBBLE.glyph}
                    color={statusColor}
                  />
                  {status !== 'sent' ? (
                    <Glyph
                      name="check"
                      size={MESSAGE_BUBBLE.glyph}
                      color={statusColor}
                      style={defaults.secondCheck}
                    />
                  ) : null}
                </StyledView>
              ) : null}
            </StyledView>
          ) : null}
        </Bubble>
      </StyledView>
    );
  },
);
MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
