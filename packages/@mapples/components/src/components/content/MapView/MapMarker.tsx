import { FC } from 'react';

import { StyledPressable, StyledView, Typography } from '@mapples/style';
import {
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import { MAP_MARKER_ICON, MapViewStyled } from './types';

export interface MapMarkerProps {
  /** Price-pin text; without it the pin is a round glyph. */
  label?: string;
  /** Glyph of a round pin; a dot when unset. */
  iconName?: string;
  /** Fills the pin with the tone (and adds the pointer under a price pin). */
  selected?: boolean;
  /** Colour role of the pin. */
  tone: Tone;
  /** The map's pin slots. */
  styled?: Pick<
    MapViewStyled,
    'styleMarker' | 'styleMarkerSelected' | 'styleMarkerLabel'
  >;
  /** Makes the pin itself pressable (web); native maps handle the press on the marker. */
  onPress?: () => void;
}

/**
 * A Mapples-styled map pin: a **price pin** (a pill with `label`; selected
 * fills it with the tone, switches the text to the tone's contrast colour
 * and adds a pointer under it) or a round **glyph pin** (`iconName`, or a
 * dot). Shared by the native map, as a custom marker view, and the static
 * web map.
 */
const MapMarker: FC<MapMarkerProps> = ({
  label,
  iconName,
  selected = false,
  tone,
  styled,
  onPress,
}) => {
  const tones = useTones();
  const shape = useShape();
  const elevation = useElevation();
  const palette = tones.tone(tone);
  const surface = tones.resolve(Tokens.color.surface);
  const text = tones.resolve(Tokens.color.text);
  const pointerColor = useSlotColor(
    styled?.styleMarkerSelected,
    'backgroundColor',
    palette.main,
  );

  const body = [
    {
      backgroundColor: selected ? palette.main : surface,
      borderWidth: selected ? 0 : shape.borderWidth(1),
      borderColor: tones.outline,
      boxShadow: elevation,
    },
    styled?.styleMarker,
    selected && styled?.styleMarkerSelected,
  ];

  const pin =
    label !== undefined ? (
      <StyledView styled={{ style: defaults.pin }}>
        <StyledView styled={{ style: [defaults.pill, ...body] }}>
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            numberOfLines={1}
            style={[
              { color: selected ? palette.contrast : text },
              styled?.styleMarkerLabel,
            ]}
          >
            {label}
          </Typography>
        </StyledView>
        {selected ? (
          <StyledView
            styled={{
              style: [defaults.pointer, { borderTopColor: pointerColor }],
            }}
          />
        ) : null}
      </StyledView>
    ) : (
      <StyledView styled={{ style: [defaults.disc, ...body] }}>
        {iconName ? (
          <Icon
            iconName={iconName}
            size={MAP_MARKER_ICON}
            color={selected ? palette.contrast : palette.ink}
          />
        ) : (
          <StyledView
            styled={{
              style: [
                defaults.dot,
                {
                  backgroundColor: selected ? palette.contrast : palette.main,
                },
              ],
            }}
          />
        )}
      </StyledView>
    );

  if (!onPress) return pin;

  return (
    <StyledPressable
      accessibilityRole="button"
      accessibilityLabel={label ?? iconName ?? 'Map pin'}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      {pin}
    </StyledPressable>
  );
};

export default MapMarker;
