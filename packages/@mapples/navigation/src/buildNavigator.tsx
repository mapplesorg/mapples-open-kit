import {
  ComponentType,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import {
  NavigationDocument,
  routeHeaderVisible,
  routeItemLabel,
  routeTitle,
} from '@mapples/types';
import { Text, View } from 'react-native';

// The navigators come from the host's React Navigation (`ctx.backend`).
import { NavigationBackend } from './backend';
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
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
  DrawerContentComponentProps,
  DrawerNavigationOptions,
} from './reactNavigation';
import RouteScreen, { RouteGuard } from './RouteScreen';
import { MapplesNavigationProps, RefResolvers } from './types';

/** Everything a navigator needs to resolve its screens. */
export interface NavigatorBuildContext {
  /** The document being rendered — route guards resolve their fallback in it. */
  document: NavigationDocument;
  pages: MapplesNavigationProps['pages'];
  fallback?: MapplesNavigationProps['fallback'];
  /** The custom chrome components, by the uuid the navigator options name. */
  chrome?: MapplesNavigationProps['chrome'];
  resolvers: RefResolvers;
  /** The React Navigation the navigators are built with. */
  backend: NavigationBackend;
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

/**
 * The build context for the screens' components, which read it at render
 * rather than closing over it — see {@link useScreenComponents}.
 */
const NavigatorBuildReactContext = createContext<NavigatorBuildContext | null>(
  null,
);

/** Hands the screens of every navigator below it their build context. */
export const NavigatorBuildProvider = NavigatorBuildReactContext.Provider;

const useNavigatorBuildContext = (): NavigatorBuildContext => {
  const ctx = useContext(NavigatorBuildReactContext);
  if (!ctx) {
    throw new Error(
      '[@mapples/navigation] a navigator screen rendered outside NavigatorBuildProvider',
    );
  }
  return ctx;
};

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

/**
 * The component a screen renders: its nested navigator, or its page (looked
 * up in the pages map, else the fallback) under the route's params, on-enter
 * action and guard. It reads the build context at render, so it depends on
 * the screen alone.
 */
const screenComponent = (screen: ScreenModel): ComponentType => {
  if (screen.target.kind === 'navigator') {
    const child = screen.target.child;
    const Child: ComponentType = () => {
      const ctx = useNavigatorBuildContext();
      // A guard on the route entering a nested navigator protects the whole
      // area under it.
      return screen.route.guard ? (
        <RouteGuard route={screen.route} document={ctx.document}>
          <NavigatorView model={child} ctx={ctx} />
        </RouteGuard>
      ) : (
        <NavigatorView model={child} ctx={ctx} />
      );
    };
    Child.displayName = `NavigatorScreen(${screen.routeName})`;
    return Child;
  }

  const { pageUuid } = screen.target;
  const Routed: ComponentType = () => {
    const ctx = useNavigatorBuildContext();
    const Page = ctx.pages[pageUuid];
    if (Page) {
      return (
        <RouteScreen route={screen.route} document={ctx.document}>
          <Page />
        </RouteScreen>
      );
    }
    if (ctx.fallback) {
      const Fallback = ctx.fallback;
      return <Fallback pageUuid={pageUuid} />;
    }
    return null;
  };
  Routed.displayName = `RouteScreen(${screen.routeName})`;
  return Routed;
};

/**
 * Each screen's component, in `model.screens` order, made once per navigator
 * model. React Navigation
 * takes a screen's `component` as its type: a new function on every render
 * would remount the focused screen whenever the navigator re-renders (a
 * theme change, a host re-render), losing its state and redrawing whatever
 * it loads after mount.
 */
const useScreenComponents = (model: NavigatorModel): ComponentType[] =>
  useMemo(() => model.screens.map(screenComponent), [model.screens]);

/**
 * The header visibility and title every navigator type gives a screen — the
 * shared `@mapples/types` rules the canvas frame chrome and the CLI's
 * generated layouts apply too. A route entering a nested navigator draws no
 * header (the nested one does), so Play never stacks two bars. The title is
 * always set: left unset, React Navigation would show the navigator-qualified
 * screen name (`<navigator>:<route>`).
 */
const sharedScreenOptions = (
  model: NavigatorModel,
  screen: ScreenModel,
): { headerShown: boolean; title: string } => ({
  headerShown: routeHeaderVisible(model.node, screen.route),
  title: routeTitle(model.node, screen.route),
});

const StackNavigatorView = ({
  model,
  ctx,
}: {
  model: NavigatorModel;
  ctx: NavigatorBuildContext;
}) => {
  const { createNativeStackNavigator } = ctx.backend;
  const Stack = useMemo(
    () => createNativeStackNavigator(),
    [createNativeStackNavigator],
  );
  const screens = useScreenComponents(model);
  return (
    <Stack.Navigator
      initialRouteName={model.initialRouteName}
      screenOptions={mapHeaderOptions(
        resolveNavigatorHeader(model.node.options?.header),
        ctx.resolvers,
      )}
    >
      {model.screens.length ? (
        model.screens.map((screen, index) => {
          const options = mapStackScreenOptions(screen.route, ctx.resolvers);
          Object.assign(options, sharedScreenOptions(model, screen));
          return (
            <Stack.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screens[index]}
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
  const { createBottomTabNavigator } = ctx.backend;
  const Tabs = useMemo(
    () => createBottomTabNavigator(),
    [createBottomTabNavigator],
  );
  const screens = useScreenComponents(model);
  const Chrome = chromeComponent(
    ctx,
    model,
    model.node.options?.tabBar?.componentUuid,
  );
  const floating = model.node.options?.tabBar?.floating === true;
  const tabBar = useCallback(
    (props: BottomTabBarProps) =>
      Chrome ? (
        <TabBarHost {...props} Chrome={Chrome} floating={floating} />
      ) : null,
    [Chrome, floating],
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
        model.screens.map((screen, index) => {
          const options = mapTabItemOptions(
            screen.route,
            ctx.resolvers,
          ) as BottomTabNavigationOptions;
          Object.assign(options, sharedScreenOptions(model, screen), {
            tabBarLabel: routeItemLabel('tabs', screen.route),
          });
          return (
            <Tabs.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screens[index]}
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
  const { createDrawerNavigator } = ctx.backend;
  const Drawer = useMemo(
    () => createDrawerNavigator(),
    [createDrawerNavigator],
  );
  const screens = useScreenComponents(model);
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
        model.screens.map((screen, index) => {
          const options = mapDrawerItemOptions(
            screen.route,
            ctx.resolvers,
          ) as DrawerNavigationOptions;
          Object.assign(options, sharedScreenOptions(model, screen), {
            drawerLabel: routeItemLabel('drawer', screen.route),
          });
          return (
            <Drawer.Screen
              key={screen.routeId}
              name={screen.routeName}
              component={screens[index]}
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
