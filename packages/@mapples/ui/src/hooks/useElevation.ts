import { ElevationDirection, resolveElevation, Tokens } from '../tokens';

import useShape from './useShape';
import useTones from './useTones';

/**
 * The `boxShadow` of an elevated surface in this project: the soft
 * {@link ELEVATION} (or {@link ELEVATION_UP} for `direction="up"`) unless the
 * project's sizing sets `shadowOffset` above 0, then a hard shadow offset by
 * that many points with no blur, in the theme's text colour (see
 * {@link resolveElevation}).
 *
 * @example
 * ```tsx
 * const elevation = useElevation();
 * <View style={{ boxShadow: elevation }} />
 * ```
 *
 * @public
 */
const useElevation = (direction: ElevationDirection = 'down'): string => {
  const shape = useShape();
  const tones = useTones();
  return resolveElevation(
    shape.shadowOffset,
    tones.resolve(Tokens.color.text),
    direction,
  );
};

export default useElevation;
