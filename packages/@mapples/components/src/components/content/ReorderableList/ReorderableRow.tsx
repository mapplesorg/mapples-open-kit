import { FC, useLayoutEffect, useState } from 'react';

import {
  StyledImage,
  StyledPressable,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  TYPOGRAPHY_PARTS,
  Tokens,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  AccessibilityActionEvent,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  DURATION,
  EASING,
  Glyph,
  NATIVE_DRIVER,
  useInteractionState,
  useReduceMotion,
  useSlotColor,
} from '../../../internal';

import { defaults } from './defaults';
import {
  REORDERABLE_LIST_LIFT_SCALE,
  REORDERABLE_LIST_ROW_HEIGHT,
  REORDERABLE_LIST_THUMBNAIL,
  ReorderableListItem,
} from './types';

import type { ReorderableListProps } from './index';

export interface ReorderableRowProps {
  /** The row's data. */
  item: ReorderableListItem;
  /** Index of the row in the current order. */
  position: number;
  /** How many rows the list has. */
  count: number;
  /** This row is the one being dragged (lifted). */
  dragging: boolean;
  /** Some row of the list is being dragged; displacement then eases. */
  active: boolean;
  /** Points the row slides aside to make room for the dragged row. */
  shift: number;
  /** Translation of the dragged row, driven by the gesture. */
  dragY: Animated.Value;
  /** Draws the bottom divider. */
  divider: boolean;
  /** The list's author slots. */
  styled: ReorderableListProps['styled'];
  /** Reports the measured row height. */
  onHeight: (id: string, height: number) => void;
  /** The handle drag began. */
  onDragStart: (id: string) => void;
  /** The handle moved `dy` points from where the drag began. */
  onDragMove: (dy: number) => void;
  /** The handle was released (or the gesture was cancelled). */
  onDragEnd: () => void;
  /** Moves the row one place up (`-1`) or down (`1`) — the accessible path. */
  onMove: (id: string, direction: -1 | 1) => void;
  /** Fires when the row is pressed; unset, the row is not pressable. */
  onPress?: (id: string) => void;
}

/**
 * One row of a `ReorderableList`: thumbnail, title, subtitle, meta and a drag
 * handle. The handle drags the row; screen readers get "Move up" / "Move
 * down" actions instead.
 */
const ReorderableRow: FC<ReorderableRowProps> = ({
  item,
  position,
  count,
  dragging,
  active,
  shift,
  dragY,
  divider,
  styled,
  onHeight,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMove,
  onPress,
}) => {
  const tones = useTones();
  const shape = useShape();
  const elevation = useElevation();
  const reduceMotion = useReduceMotion();
  const interaction = useInteractionState({}, !onPress);
  const text = tones.resolve(Tokens.color.text);
  const secondary = tones.resolve(Tokens.color.textSecondary);
  const handleColor = useSlotColor(styled?.styleHandle, 'color', secondary);

  // Rows ease aside while a drag is in progress; on the drop the new order
  // takes their place, so the shift snaps back before the frame is painted.
  const [offset] = useState(() => new Animated.Value(shift));
  useLayoutEffect(() => {
    if (!active || reduceMotion) {
      offset.setValue(shift);
      return;
    }
    const animation = Animated.timing(offset, {
      toValue: shift,
      duration: DURATION.base,
      easing: EASING,
      useNativeDriver: NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
  }, [active, offset, reduceMotion, shift]);

  const drag = Gesture.Pan()
    .minDistance(0)
    .runOnJS(true)
    .onStart(() => onDragStart(item.id))
    .onUpdate((event) => onDragMove(event.translationY))
    .onFinalize(() => onDragEnd());

  const actions = [
    ...(position > 0 ? [{ name: 'moveUp', label: 'Move up' }] : []),
    ...(position < count - 1 ? [{ name: 'moveDown', label: 'Move down' }] : []),
  ];
  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    const name = event.nativeEvent.actionName;
    if (name === 'moveUp') onMove(item.id, -1);
    else if (name === 'moveDown') onMove(item.id, 1);
  };

  const label = [
    item.title,
    item.subtitle,
    item.meta,
    `position ${position + 1} of ${count}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Animated.View
      onLayout={(event: LayoutChangeEvent) =>
        onHeight(item.id, event.nativeEvent.layout.height)
      }
      style={{
        zIndex: dragging ? 1 : 0,
        transform: [
          { translateY: dragging ? dragY : offset },
          { scale: dragging ? REORDERABLE_LIST_LIFT_SCALE : 1 },
        ],
      }}
    >
      <StyledPressable
        accessible
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={label}
        accessibilityActions={actions}
        onAccessibilityAction={onAccessibilityAction}
        disabled={!onPress}
        onPress={onPress ? () => onPress(item.id) : undefined}
        {...interaction.handlers}
        styled={{
          style: [
            dragging && {
              backgroundColor: tones.resolve(Tokens.color.surface),
              borderRadius: shape.radius.md,
              boxShadow: elevation,
            },
            styled?.styleRow,
            dragging && styled?.styleDragging,
          ],
        }}
      >
        {onPress &&
        !dragging &&
        (interaction.pressed || interaction.hovered) ? (
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
        <StyledView
          styled={{
            style: [defaults.row, { minHeight: REORDERABLE_LIST_ROW_HEIGHT }],
          }}
        >
          {item.imageSource !== undefined ? (
            <StyledImage
              source={item.imageSource}
              contentFit="cover"
              styled={{
                style: [
                  {
                    width: REORDERABLE_LIST_THUMBNAIL,
                    height: REORDERABLE_LIST_THUMBNAIL,
                    borderRadius: shape.radius.sm,
                    backgroundColor: tones.fill,
                  },
                  styled?.styleImage,
                ],
              }}
            />
          ) : null}
          <StyledView styled={{ style: defaults.texts }}>
            <Typography
              variant={TYPOGRAPHY_PARTS.body}
              numberOfLines={1}
              style={[{ color: text }, styled?.styleTitle]}
            >
              {item.title}
            </Typography>
            {item.subtitle ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={1}
                style={[{ color: secondary }, styled?.styleSubtitle]}
              >
                {item.subtitle}
              </Typography>
            ) : null}
          </StyledView>
          {item.meta ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[{ color: secondary }, styled?.styleMeta]}
            >
              {item.meta}
            </Typography>
          ) : null}
          <GestureDetector gesture={drag}>
            <StyledView
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              styled={{ style: [defaults.handle, styled?.styleHandle] }}
            >
              <Glyph name="dragHandle" size={24} color={handleColor} />
            </StyledView>
          </GestureDetector>
        </StyledView>
        {divider && !dragging ? (
          <StyledView
            styled={{
              style: [
                defaults.divider,
                { backgroundColor: tones.divider },
                styled?.styleDivider,
              ],
            }}
          />
        ) : null}
      </StyledPressable>
    </Animated.View>
  );
};

export default ReorderableRow;
