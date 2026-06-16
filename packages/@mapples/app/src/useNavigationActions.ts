import type { Action } from '@mapples/types';
import { useRouter, useNavigation } from 'expo-router';

import { useNavigationMap } from './NavigationContext';
import {
  createNavigationDispatch,
  NavigationLike,
  RouterLike,
} from './navigationDispatch';

/**
 * Hook that bridges Mapples **navigation** actions to expo-router. It reads the
 * {@link NavigationMap} from context and uses expo-router's `useRouter` +
 * `useNavigation`. Generated route wrappers call this and feed the result into
 * the Mapplet's `onAction` (composed with general action dispatch).
 *
 * Scope: navigation actions only (`mapples:navigate`, `mapples:switchTab`,
 * `mapples:goBack`, `mapples:openDrawer`, `mapples:closeDrawer`). Unknown or
 * unmapped routes are no-ops.
 *
 * Only imported from generated route wrappers, which render inside the
 * expo-router context — non-navigation apps never reach this module, hence
 * `expo-router` is an optional peer dependency.
 *
 * @returns A handler `(action: Action) => void`.
 */
export const useNavigationActions = (): ((action: Action) => void) => {
  const { routes } = useNavigationMap();
  const router = useRouter() as unknown as RouterLike;
  const navigation = useNavigation() as unknown as NavigationLike;

  return createNavigationDispatch(routes, router, navigation);
};
