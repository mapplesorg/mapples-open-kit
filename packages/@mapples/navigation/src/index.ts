/**
 * @fileoverview Runtime interpreter for the Mapples `NavigationDocument`.
 *
 * Renders a navigation document with React Navigation (stack / tabs / drawer)
 * and bridges navigation actions emitted through `@mapples/action`.
 */

export { default as MapplesNavigation } from './MapplesNavigation';
export { default as NavigationActionHandler } from './NavigationActionHandler';
export { default as RouteScreen, RouteGuard } from './RouteScreen';
export { default as useRefResolvers } from './useRefResolvers';
export { NavigatorView } from './buildNavigator';
export {
  NavigationHooksContext,
  useNavigationHooks,
  type NavigationActions,
  type NavigationBackend,
  type NavigationHooks,
} from './backend';
export type { NavigatorBuildContext } from './buildNavigator';
export * from './chrome';

export * from './types';
export * from './constants';
export * from './refs';
export * from './model';
export * from './mappers';
export * from './actionCommands';
