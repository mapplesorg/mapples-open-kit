import { RouteNode } from '@mapples/types';

import {
  DrawerItemOptionsPatch,
  RefResolvers,
  StackScreenOptionsPatch,
  TabItemOptionsPatch,
} from '../types';

import { mapHeaderOptions } from './headerOptions';

/**
 * Per-route native-stack options: the route's header overrides
 * ({@link RouteNode.options} extends `Partial<HeaderOptions>`) plus its
 * `presentation`.
 */
export const mapStackScreenOptions = (
  route: RouteNode,
  resolvers: RefResolvers,
): StackScreenOptionsPatch => {
  const patch: StackScreenOptionsPatch = {
    ...mapHeaderOptions(route.options, resolvers),
  };
  if (route.presentation !== undefined) patch.presentation = route.presentation;
  return patch;
};

/** Per-route bottom-tabs item options (label + icon). */
export const mapTabItemOptions = (
  route: RouteNode,
  resolvers: RefResolvers,
): TabItemOptionsPatch => {
  const patch: TabItemOptionsPatch = {};
  if (route.options?.tabLabel !== undefined) {
    patch.tabBarLabel = route.options.tabLabel;
  }
  const icon = resolvers.resolveIcon(route.options?.tabIcon);
  if (icon) patch.tabBarIcon = icon;
  return patch;
};

/** Per-route drawer item options (label + icon). */
export const mapDrawerItemOptions = (
  route: RouteNode,
  resolvers: RefResolvers,
): DrawerItemOptionsPatch => {
  const patch: DrawerItemOptionsPatch = {};
  if (route.options?.drawerLabel !== undefined) {
    patch.drawerLabel = route.options.drawerLabel;
  }
  const icon = resolvers.resolveIcon(route.options?.drawerIcon);
  if (icon) patch.drawerIcon = icon;
  return patch;
};
