import { mapValues } from 'lodash';

import { RefPropsMap } from '../types';

import useRender from './useRender';

/**
 * Hook that resolves ref properties by looking up assets from the render context.
 *
 * Ref properties are strings that reference assets in the format `ref(assetType:uuid:name)`.
 * This hook resolves these references to their actual asset values from the render context.
 *
 * @param refProps - Optional map of ref property names to ref strings
 * @returns Map of resolved asset values, with undefined values filtered out
 *
 * @example
 * ```tsx
 * const refProps = {
 *   image: 'ref(image:123:logo)',
 *   icon: 'ref(icon:456:home)',
 * };
 *
 * const resolved = useRefProps(refProps);
 * // Returns: { image: <ImageAsset>, icon: <IconAsset> }
 * ```
 *
 * @internal
 */
const useRefProps = (refProps?: RefPropsMap) => {
  const { assets } = useRender();

  return mapValues(refProps, (value) => {
    if (!value) return;

    return assets[value];
  });
};

export default useRefProps;
