import { TabBarOptions } from '@mapples/types';

import { RefResolvers, TabBarOptionsPatch } from '../types';

/** Map {@link TabBarOptions} to a bottom-tabs navigator options patch. */
export const mapTabBarOptions = (
  tabBar: TabBarOptions | undefined,
  resolvers: RefResolvers,
): TabBarOptionsPatch => {
  const patch: TabBarOptionsPatch = {};
  if (!tabBar) return patch;

  const style: NonNullable<TabBarOptionsPatch['tabBarStyle']> = {};
  if (tabBar.visible !== undefined) {
    style.display = tabBar.visible ? 'flex' : 'none';
  }
  const backgroundColor = resolvers.resolveColor(tabBar.backgroundColor);
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (Object.keys(style).length) patch.tabBarStyle = style;

  const activeTintColor = resolvers.resolveColor(tabBar.activeTintColor);
  if (activeTintColor) patch.tabBarActiveTintColor = activeTintColor;

  const inactiveTintColor = resolvers.resolveColor(tabBar.inactiveTintColor);
  if (inactiveTintColor) patch.tabBarInactiveTintColor = inactiveTintColor;

  if (tabBar.labelVisible !== undefined) {
    patch.tabBarShowLabel = tabBar.labelVisible;
  }

  if (tabBar.labelStyle) {
    const labelStyle: NonNullable<TabBarOptionsPatch['tabBarLabelStyle']> = {};
    if (tabBar.labelStyle.fontFamily) {
      labelStyle.fontFamily = tabBar.labelStyle.fontFamily;
    }
    if (tabBar.labelStyle.fontSize !== undefined) {
      labelStyle.fontSize = tabBar.labelStyle.fontSize;
    }
    if (Object.keys(labelStyle).length) patch.tabBarLabelStyle = labelStyle;
  }

  return patch;
};
