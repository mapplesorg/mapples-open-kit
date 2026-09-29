/**
 * @mapples/app
 *
 * A React Native component library that provides the core Mapples ecosystem functionality.
 * This package includes the main MapplesApp component and utility functions for asset management.
 *
 * @packageDocumentation
 */

export { default } from './MapplesApp';
export type { MapplesAppProps } from './MapplesApp';
export {
  normalizeKey,
  remapFonts,
  resolveAssets,
  toStyleContext,
} from './utils';
export type { CliAssetEntry, CliAssetModule, CliThemeModule } from './utils';
export { default as MapplesAppProvider } from './MapplesAppProvider';
export type { NavigationMap } from './NavigationContext';
export {
  NavigationContext,
  NavigationProvider,
  useNavigationMap,
} from './NavigationContext';
export { useNavigationActions } from './useNavigationActions';
export { createNavigationDispatch } from './navigationDispatch';
export type { RouterLike, NavigationLike } from './navigationDispatch';
