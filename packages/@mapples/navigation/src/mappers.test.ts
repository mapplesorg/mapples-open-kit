/// <reference types="jest" />
import { HeaderOptions, RouteNode } from '@mapples/types';

import {
  mapDrawerOptions,
  mapHeaderOptions,
  mapStackScreenOptions,
  mapTabBarOptions,
  mapTabItemOptions,
} from './mappers';
import { RefResolvers } from './types';

const iconStub = () => null;

// Stub resolvers: theme refs resolve to a marker, raw colours pass through.
const resolvers: RefResolvers = {
  resolveColor: (value) =>
    value === undefined
      ? undefined
      : value.startsWith('ref(')
        ? '#RESOLVED'
        : value,
  resolveIcon: (value) => (value ? iconStub : undefined),
};

describe('mapHeaderOptions', () => {
  it('maps every header field, resolving colours', () => {
    const header: HeaderOptions = {
      visible: true,
      title: 'Home',
      backgroundColor: '#ffffff',
      tintColor: 'ref(theme:u:primary)',
      titleStyle: { fontFamily: 'X', fontSize: 18, color: '#000000' },
      backVisible: false,
      shadowVisible: false,
    };

    expect(mapHeaderOptions(header, resolvers)).toEqual({
      headerShown: true,
      title: 'Home',
      headerStyle: { backgroundColor: '#ffffff' },
      headerTintColor: '#RESOLVED',
      headerTitleStyle: { fontFamily: 'X', fontSize: 18, color: '#000000' },
      headerBackVisible: false,
      headerShadowVisible: false,
    });
  });

  it('emits nothing for an empty/undefined header', () => {
    expect(mapHeaderOptions(undefined, resolvers)).toEqual({});
    expect(mapHeaderOptions({}, resolvers)).toEqual({});
  });
});

describe('mapTabBarOptions', () => {
  it('maps visibility to display:none and resolves tints', () => {
    expect(
      mapTabBarOptions(
        {
          visible: false,
          activeTintColor: '#a',
          labelVisible: true,
          labelStyle: { fontSize: 12 },
        },
        resolvers,
      ),
    ).toEqual({
      tabBarStyle: { display: 'none' },
      tabBarActiveTintColor: '#a',
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize: 12 },
    });
  });
});

describe('mapDrawerOptions', () => {
  it('maps position/type and folds width into drawerStyle', () => {
    expect(
      mapDrawerOptions(
        {
          position: 'right',
          drawerType: 'slide',
          width: 300,
          backgroundColor: '#b',
        },
        resolvers,
      ),
    ).toEqual({
      drawerPosition: 'right',
      drawerType: 'slide',
      drawerStyle: { backgroundColor: '#b', width: 300 },
    });
  });
});

describe('per-route mappers', () => {
  const route: RouteNode = {
    id: 'r1',
    name: 'Compose',
    target: { kind: 'page', pageUuid: 'p1' },
    presentation: 'modal',
    options: {
      title: 'New post',
      tabLabel: 'Home',
      tabIcon: 'ref(icon:u:home)',
    },
  };

  it('maps stack screen options including presentation', () => {
    expect(mapStackScreenOptions(route, resolvers)).toEqual({
      title: 'New post',
      presentation: 'modal',
    });
  });

  it('maps a tab item with a resolved icon renderer', () => {
    const item = mapTabItemOptions(route, resolvers);
    expect(item.tabBarLabel).toBe('Home');
    expect(typeof item.tabBarIcon).toBe('function');
  });
});
