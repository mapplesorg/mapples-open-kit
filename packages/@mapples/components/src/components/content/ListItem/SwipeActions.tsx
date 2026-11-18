import { FC } from 'react';

import { StyledPressable, StyledView, Typography } from '@mapples/style';
import { Icon, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';

import { defaults } from './defaults';
import { LIST_ITEM_SWIPE_ACTION_WIDTH, ListItemSwipeAction } from './types';

interface SwipeActionsProps {
  /** The actions of one side, in reading order. */
  actions: ListItemSwipeAction[];
  /** Fires with the pressed action's `value`. */
  onPress: (value: string) => void;
}

/**
 * The tiles a swipe on a `ListItem` reveals at one edge: one per action,
 * filled in its tone, with its glyph and label.
 */
const SwipeActions: FC<SwipeActionsProps> = ({ actions, onPress }) => {
  const tones = useTones();

  return (
    <StyledView styled={{ style: defaults.swipeActions }}>
      {actions.map((action) => {
        const palette = tones.tone(
          action.tone ?? (action.value === 'delete' ? 'error' : 'primary'),
        );

        return (
          <StyledPressable
            key={action.value}
            accessibilityRole="button"
            accessibilityLabel={action.label ?? action.value}
            onPress={() => onPress(action.value)}
            styled={{
              style: [
                defaults.swipeAction,
                {
                  width: LIST_ITEM_SWIPE_ACTION_WIDTH,
                  backgroundColor: palette.main,
                },
              ],
            }}
          >
            {action.iconName ? (
              <Icon
                iconName={action.iconName}
                size={22}
                color={palette.contrast}
              />
            ) : null}
            {action.label ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                // Cut rather than ellipsized: centred in a tile, the text is
                // a fraction of a point narrower than it measures on iOS,
                // and an ellipsis would eat its last letters.
                numberOfLines={1}
                ellipsizeMode="clip"
                style={{ color: palette.contrast }}
              >
                {action.label}
              </Typography>
            ) : null}
          </StyledPressable>
        );
      })}
    </StyledView>
  );
};

export default SwipeActions;
