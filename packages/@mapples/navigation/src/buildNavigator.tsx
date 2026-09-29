import { ComponentType, useCallback, useMemo } from 'react';

import { NavigationDocument } from '@mapples/types';
import { Text, View } from 'react-native';

// React Navigation is consumed through expo-router's vendored copy, centralized
// in `./vendor` (SDK 56+ blocks external `@react-navigation/*`).
import { DrawerContentHost, TabBarHost } from './chrome';
import { EMPTY_ROUTE_NAME } from './constants';
import {
  mapDrawerItemOptions,
  mapDrawerOptions,
  mapHeaderOptions,
  mapStackScreenOptions,
  mapTabBarOptions,
  mapTabItemOptions,
  resolveNavigatorHeader,
} from './mappers';
import { NavigatorModel, ScreenModel } from './model';
import RouteScreen from './RouteScreen';
import { MapplesNavigationProps, RefResolvers } from './types';
import {
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
  createBottomTabNavigator,
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
  createNativeStackNavigator,
} from './vendor';

/** Everything a navigator needs to resolve its screens. */
export interface NavigatorBuildContext {
  /** The document being rendered — route guards resolve their fallback in it. */
  document: NavigationDocument;
  pages: MapplesNavigationProps['pages'];
  fallback?: MapplesNavigationProps['fallback'];
  /** The custom chrome components, by the uuid the navigator options name. */
  chrome?: MapplesNavigationProps['chrome'];
  resolvers: RefResolvers;
}

/**
 * The saved component a navigator names as its chrome. Naming one the host
 * did not supply is a wiring error — the design would silently be the stock
 * bar otherwise — so it throws rather than falling back.
 */
const chromeComponent = (
  ctx: NavigatorBuildContext,
  model: NavigatorModel,
  componentUuid: string | undefined,
): ComponentType | undefined => {
  if (!componentUuid) return undefined;
  const Chrome = ctx.chrome?.[componentUuid];
  if (!Chrome) {
    throw new Error(
      `[@mapples/navigation] navigator "${model.name}" names chrome component ${componentUuid}, which the host did not provide`,
    );
  }
  return Chrome;
};

const MissingScreen: ComponentType = () => null;

// Blank the header title / tab / drawer label so the internal placeholder route
// name never leaks into the preview chrome.
const EMPTY_SCREEN_OPTIONS = { title: '' };

const EmptyNavigatorScreen: ComponentType = () => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}
  >
    <Text style={{ color: '#8E8E93', fontSize: 13, textAlign: 'center' }}>
      No screens yet. Add a screen to this navigator.
    </Text>
  </View>
);

/** Resolve the component a screen renders (page lookup → pages map / fallback). */
const screenComponent = (
  screen: ScreenModel,
  ctx: NavigatorBuildContext,
): ComponentType => {
  if (screen.target.kind === 'navigator') {
    const child = screen.target.child;
    const Child: ComponentType = () => (
      <NavigatorView model={child} ctx={ctx} />
    );
    return Child;
  }

  const { pageUuid } = screen.target;
  const Page = ctx.pages[pageUuid];
  if (Page) {
    // Every page screen gets its route's params, on-enter action and guard.
    const Routed: ComponentType = () => (
      <RouteScreen route={screen.route} document={ctx.document}>
        <Page />
      </RouteScreen>
    );
    Routed.displayName = `RouteScreen(${screen.routeName})`;
    return Routed;
  }

  if (ctx.fallback) {
    const Fallback = ctx.fallback;
    const FallbackScreen: ComponentType = () => (
      <Fallback pageUuid={pageUuid} />
    );
    return FallbackScreen;
  }
  return MissingScreen;
};

const StackNavigatorView = ({
  model,
  ctx,
}: {
  model: NavigatorModel;
  ctx: NavigatorBuildContext;
}) => {
  const Stack = useMemo(() => createNativeStackNavigator(), []);
  // When neither the navigator nor the route sets a header title, React
  // Navigation falls back to the screen name — which is now navigator-qualified
  // (`<navigator>:<route>`). Default the title to the bare route name in that
  // case so the prefix never surfaces in the UI; a navigator-level title still
  // applies to every screen as before.
  const navHasTitle = model.node.options?.header?.title !== undefined;
  return (
    <Stack.Navigator
      initialRouteName={model.initialRouteName}
      screenOptions={mapHeaderOptions(
        resolveNavigatorHeader(model.node.options?.header),
        ctx.resolvers,
      )}
    >
      {model.screens.length ? (
        model.screens.map((screen) => {
          const options = mapStackScreenOptions(screen.route, ctx.resolvers);
          if (options.title === undefined && !navHasTitle) {
            options.title = screen.route.name;
          }
          return (
            <Stack.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screenComponent(screen, ctx)}
              options={options}
            />
          );
        })
      ) : (
        <Stack.Screen
          name={EMPTY_ROUTE_NAME}
          component={EmptyNavigatorScreen}
          options={EMPTY_SCREEN_OPTIONS}
        />
      )}
    </Stack.Navigator>
  );
};

const TabsNavigatorView = ({
  model,
  ctx,
}: {
  model: NavigatorModel;
  ctx: NavigatorBuildContext;
}) => {
  const Tabs = useMemo(() => createBottomTabNavigator(), []);
  const Chrome = chromeComponent(
    ctx,
    model,
    model.node.options?.tabBar?.componentUuid,
  );
  const tabBar = useCallback(
    (props: BottomTabBarProps) =>
      Chrome ? <TabBarHost {...props} Chrome={Chrome} /> : null,
    [Chrome],
  );
  return (
    <Tabs.Navigator
      initialRouteName={model.initialRouteName}
      tabBar={Chrome ? tabBar : undefined}
      screenOptions={{
        ...mapTabBarOptions(model.node.options?.tabBar, ctx.resolvers),
        // Bottom tabs draw a header of their own. Until these were mapped, a
        // tabs navigator nested in a stack always stacked a second header
        // under its parent's, with no option that could turn it off.
        ...mapHeaderOptions(
          resolveNavigatorHeader(model.node.options?.header),
          ctx.resolvers,
        ),
      }}
    >
      {model.screens.length ? (
        model.screens.map((screen) => {
          const options = mapTabItemOptions(
            screen.route,
            ctx.resolvers,
          ) as BottomTabNavigationOptions;
          // Same guard as the stack: with no explicit title, React Navigation
          // labels the tab and its header with the screen name, which is
          // navigator-qualified (`<navigator>:<route>`). Default to the bare
          // route name so the prefix never reaches the UI.
          if (options.title === undefined) options.title = screen.route.name;
          return (
            <Tabs.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screenComponent(screen, ctx)}
              options={options}
            />
          );
        })
      ) : (
        <Tabs.Screen
          name={EMPTY_ROUTE_NAME}
          component={EmptyNavigatorScreen}
          options={EMPTY_SCREEN_OPTIONS}
        />
      )}
    </Tabs.Navigator>
  );
};

const DrawerNavigatorView = ({
  model,
  ctx,
}: {
  model: NavigatorModel;
  ctx: NavigatorBuildContext;
}) => {
  const Drawer = useMemo(() => createDrawerNavigator(), []);
  const Chrome = chromeComponent(
    ctx,
    model,
    model.node.options?.drawer?.componentUuid,
  );
  const drawerContent = useCallback(
    (props: DrawerContentComponentProps) =>
      Chrome ? <DrawerContentHost {...props} Chrome={Chrome} /> : null,
    [Chrome],
  );
  return (
    <Drawer.Navigator
      initialRouteName={model.initialRouteName}
      drawerContent={Chrome ? drawerContent : undefined}
      screenOptions={{
        ...mapDrawerOptions(model.node.options?.drawer, ctx.resolvers),
        // See the tabs navigator: a drawer draws its own header too.
        ...mapHeaderOptions(
          resolveNavigatorHeader(model.node.options?.header),
          ctx.resolvers,
        ),
      }}
    >
      {model.screens.length ? (
        model.screens.map((screen) => {
          const options = mapDrawerItemOptions(
            screen.route,
            ctx.resolvers,
          ) as DrawerNavigationOptions;
          // See the tabs navigator: the qualified screen name must not become
          // the drawer item's label or its header title.
          if (options.title === undefined) options.title = screen.route.name;
          return (
            <Drawer.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screenComponent(screen, ctx)}
              options={options}
            />
          );
        })
      ) : (
        <Drawer.Screen
          name={EMPTY_ROUTE_NAME}
          component={EmptyNavigatorScreen}
          options={EMPTY_SCREEN_OPTIONS}
        />
      )}
    </Drawer.Navigator>
  );
};

/** Recursively render a {@link NavigatorModel} with the matching React Navigation navigator. */
export const NavigatorView = ({
  model,
  ctx,
}: {
  model: NavigatorModel;
  ctx: NavigatorBuildContext;
}) => {
  switch (model.type) {
    case 'tabs':
      return <TabsNavigatorView model={model} ctx={ctx} />;
    case 'drawer':
      return <DrawerNavigatorView model={model} ctx={ctx} />;
    default:
      return <StackNavigatorView model={model} ctx={ctx} />;
  }
};
