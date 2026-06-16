/**
 * Action `type` strings handled by the navigation runtime. Components wire these
 * to interactions via `RenderComponentType.actionProps` and emit them through
 * the `@mapples/action` store.
 */
export const NavigationActionType = {
  /** Navigate to a route or page. `payload.data: { routeName?, pageUuid?, params? }`. */
  Navigate: 'mapples:navigate',
  /** Pop the current screen. */
  GoBack: 'mapples:goBack',
  /** Open the nearest drawer. */
  OpenDrawer: 'mapples:openDrawer',
  /** Close the nearest drawer. */
  CloseDrawer: 'mapples:closeDrawer',
  /** Switch to a sibling tab. `payload.data: { routeName }`. */
  SwitchTab: 'mapples:switchTab',
} as const;

export type NavigationActionTypeValue =
  (typeof NavigationActionType)[keyof typeof NavigationActionType];
