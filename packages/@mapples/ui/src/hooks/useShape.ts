import { useMemo } from 'react';

import { useSizing } from '@mapples/style';

import { resolveShape, SHAPE_SIZING_KEYS, Shape } from '../tokens';

/**
 * The project's corner radii and control geometry, derived from its sizing
 * (`radius`, `radiusLarge`, `control` — see {@link resolveShape}). A project
 * whose sizing has none of them gets {@link DEFAULT_SHAPE}.
 *
 * @example
 * ```tsx
 * const shape = useShape();
 * <View style={{ borderRadius: shape.radius.lg }} />
 * ```
 *
 * @public
 */
const useShape = (): Shape => {
  const { getSize } = useSizing();

  return useMemo(() => {
    const read = (key: string): number | undefined => {
      const value = getSize(key);
      return typeof value === 'number' ? value : undefined;
    };
    return resolveShape(
      read(SHAPE_SIZING_KEYS.radius),
      read(SHAPE_SIZING_KEYS.radiusLarge),
      read(SHAPE_SIZING_KEYS.control),
    );
  }, [getSize]);
};

export default useShape;
