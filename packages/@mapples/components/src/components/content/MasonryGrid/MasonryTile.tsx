import { FC } from 'react';

import {
  StyledImage,
  StyledPressable,
  StyledView,
  Typography,
} from '@mapples/style';
import { TYPOGRAPHY_PARTS, Tokens, useShape, useTones } from '@mapples/ui';

import { useInteractionState } from '../../../internal';

import { defaults } from './defaults';
import { MASONRY_GRID_TITLE_LINES, MasonryGridItem } from './types';

import type { MasonryGridProps } from './index';

export interface MasonryTileProps {
  /** The tile's data. */
  item: MasonryGridItem;
  /** Index of the tile in `items` (names untitled photos for screen readers). */
  index: number;
  /** The grid's author slots. */
  styled: MasonryGridProps['styled'];
  /** Fires when pressed; unset, the tile is a still image. */
  onPress?: (id: string) => void;
}

/**
 * One tile of a `MasonryGrid`: the photo at its own aspect ratio, an
 * optional tag pill on its bottom-start corner and an optional title under
 * it.
 */
const MasonryTile: FC<MasonryTileProps> = ({
  item,
  index,
  styled,
  onPress,
}) => {
  const tones = useTones();
  const shape = useShape();
  const interaction = useInteractionState({}, !onPress);
  const text = tones.resolve(Tokens.color.text);

  return (
    <StyledPressable
      accessible
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={[item.title ?? `Photo ${index + 1}`, item.tag]
        .filter(Boolean)
        .join(', ')}
      disabled={!onPress}
      onPress={onPress ? () => onPress(item.id) : undefined}
      {...interaction.handlers}
      styled={{ style: [defaults.tile, styled?.styleTile] }}
    >
      <StyledView
        styled={{
          style: [defaults.media, { borderRadius: shape.radius.lg }],
        }}
      >
        <StyledImage
          source={item.source}
          contentFit="cover"
          styled={{
            style: [
              defaults.image,
              { aspectRatio: item.aspectRatio, backgroundColor: tones.fill },
              styled?.styleImage,
            ],
          }}
        />
        {onPress && (interaction.pressed || interaction.hovered) ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: tones.stateLayer(
                  text,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            }}
          />
        ) : null}
        {item.tag ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.tag,
                {
                  borderRadius: shape.radius.pill,
                  backgroundColor: tones.resolve(Tokens.color.surface),
                },
                styled?.styleTag,
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[{ color: text }, styled?.styleTagLabel]}
            >
              {item.tag}
            </Typography>
          </StyledView>
        ) : null}
      </StyledView>
      {item.title ? (
        <Typography
          variant={TYPOGRAPHY_PARTS.body}
          numberOfLines={MASONRY_GRID_TITLE_LINES}
          style={[{ color: text }, styled?.styleTitle]}
        >
          {item.title}
        </Typography>
      ) : null}
    </StyledPressable>
  );
};

export default MasonryTile;
