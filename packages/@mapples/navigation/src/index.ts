/**
 * @fileoverview Runtime interpreter for the Mapples `NavigationDocument`.
 *
 * Renders a navigation document with React Navigation (stack / tabs / drawer)
 * and bridges navigation actions emitted through `@mapples/action`.
 */

export { default as MapplesNavigation } from './MapplesNavigation';
export { default as NavigationActionHandler } from './NavigationActionHandler';
export { default as useRefResolvers } from './useRefResolvers';
export { NavigatorView } from './buildNavigator';
export type { NavigatorBuildContext } from './buildNavigator';

export * from './types';
export * from './constants';
export * from './refs';
export * from './model';
export * from './mappers';
export * from './actionCommands';
