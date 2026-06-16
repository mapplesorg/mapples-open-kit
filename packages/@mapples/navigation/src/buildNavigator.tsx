import { ComponentType, useMemo } from 'react';

import { Text, View } from 'react-native';

// React Navigation is consumed through expo-router's vendored copy, centralized
// in `./vendor` (SDK 56+ blocks external `@react-navigation/*`).
import {
  type BottomTabNavigationOptions,
  createBottomTabNavigator,
  createDrawerNavigator,
  type DrawerNavigationOptions,
  createNativeStackNavigator,
} from './vendor';

import {
  mapDrawerItemOptions,
  mapDrawerOptions,
  mapHeaderOptions,
  mapStackScreenOptions,
  mapTabBarOptions,
  mapTabItemOptions,
} from './mappers';
import { NavigatorModel, ScreenModel } from './model';
import { MapplesNavigationProps, RefResolvers } from './types';

/** Everything a navigator needs to resolve its screens. */
export interface NavigatorBuildContext {
  pages: MapplesNavigationProps['pages'];
  fallback?: MapplesNavigationProps['fallback'];
  resolvers: RefResolvers;
}

const MissingScreen: ComponentType = () => null;

/**
 * React Navigation requires every navigator to have at least one screen. A
 * navigator with no routes is a valid intermediate state in the editor (you
 * create it, then add screens), so render a single placeholder rather than
 * crashing.
 */
const EMPTY_ROUTE_NAME = '__mapples_empty__';

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
  if (Page) return Page as ComponentType;

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
        model.node.options?.header,
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
  return (
    <Tabs.Navigator
      initialRouteName={model.initialRouteName}
      screenOptions={mapTabBarOptions(
        model.node.options?.tabBar,
        ctx.resolvers,
      )}
    >
      {model.screens.length ? (
        model.screens.map((screen) => (
          <Tabs.Screen
            key={screen.routeId}
            name={screen.routeName}
            component={screenComponent(screen, ctx)}
            options={
              mapTabItemOptions(
                screen.route,
                ctx.resolvers,
              ) as BottomTabNavigationOptions
            }
          />
        ))
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
  return (
    <Drawer.Navigator
      initialRouteName={model.initialRouteName}
      screenOptions={mapDrawerOptions(
        model.node.options?.drawer,
        ctx.resolvers,
      )}
    >
      {model.screens.length ? (
        model.screens.map((screen) => (
          <Drawer.Screen
            key={screen.routeId}
            name={screen.routeName}
            component={screenComponent(screen, ctx)}
            options={
              mapDrawerItemOptions(
                screen.route,
                ctx.resolvers,
              ) as DrawerNavigationOptions
            }
          />
        ))
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
