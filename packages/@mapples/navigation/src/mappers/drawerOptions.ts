import { DrawerOptions } from '@mapples/types';

import { DrawerOptionsPatch, RefResolvers } from '../types';

/** Map {@link DrawerOptions} to a drawer navigator options patch. */
export const mapDrawerOptions = (
  drawer: DrawerOptions | undefined,
  resolvers: RefResolvers,
): DrawerOptionsPatch => {
  const patch: DrawerOptionsPatch = {};
  if (!drawer) return patch;

  if (drawer.position !== undefined) patch.drawerPosition = drawer.position;
  if (drawer.drawerType !== undefined) patch.drawerType = drawer.drawerType;

  const activeTintColor = resolvers.resolveColor(drawer.activeTintColor);
  if (activeTintColor) patch.drawerActiveTintColor = activeTintColor;

  const inactiveTintColor = resolvers.resolveColor(drawer.inactiveTintColor);
  if (inactiveTintColor) patch.drawerInactiveTintColor = inactiveTintColor;

  const style: NonNullable<DrawerOptionsPatch['drawerStyle']> = {};
  const backgroundColor = resolvers.resolveColor(drawer.backgroundColor);
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (drawer.width !== undefined) style.width = drawer.width;
  if (Object.keys(style).length) patch.drawerStyle = style;

  return patch;
};
