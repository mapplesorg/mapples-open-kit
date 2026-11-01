import { FC } from 'react';

import { useRefResolvers } from '@mapples/navigation';
import { ColorValue } from 'react-native';

interface RouteIconProps {
  /** A route's `tabIcon` / `drawerIcon`: `ref(glyph:<family>:<name>)` or `ref(icon:<uuid>:<file>)`. */
  icon: string;
  color?: ColorValue;
  size?: number;
}

/**
 * A tab or drawer item icon as the Creator stores it, resolved the way the
 * Play runtime resolves it (`useRefResolvers`): a built-in glyph through the
 * registered `Icon` element, an uploaded icon through the synced asset map.
 * CLI-generated layouts render it from `tabBarIcon` / `drawerIcon`.
 */
export const RouteIcon: FC<RouteIconProps> = ({ icon, color, size }) => {
  const { resolveIcon } = useRefResolvers();
  const render = resolveIcon(icon);
  if (!render) {
    throw new Error(
      `[@mapples/app] tab/drawer icon ${icon} does not resolve — is the asset synced?`,
    );
  }
  return <>{render({ color, size })}</>;
};

export default RouteIcon;
