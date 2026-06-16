/// <reference types="jest" />
import type { Action } from '@mapples/types';

import { createNavigationDispatch } from './navigationDispatch';

const routes = {
  'drawer:Test': '/(mapples)/(drawer)/Test',
  Home: '/(mapples)/Home',
};

const makeAction = (type: string, data?: Record<string, unknown>): Action => ({
  time: 0,
  type,
  payload: data ? { data } : undefined,
});

const makeDeps = (canGoBack = true) => {
  const router = {
    push: jest.fn(),
    canGoBack: jest.fn(() => canGoBack),
    back: jest.fn(),
  };
  const navigation = { dispatch: jest.fn() };
  return { router, navigation };
};

describe('createNavigationDispatch', () => {
  it('mapples:navigate pushes the resolved href with params', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(
      makeAction('mapples:navigate', {
        routeName: 'Home',
        params: { id: '1' },
      }),
    );
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(mapples)/Home',
      params: { id: '1' },
    });
  });

  it('mapples:switchTab pushes the resolved href', () => {
    const { router } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      makeDeps().navigation,
    )(makeAction('mapples:switchTab', { routeName: 'drawer:Test' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(mapples)/(drawer)/Test',
      params: undefined,
    });
  });

  it('navigate with an unmapped routeName is a no-op', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:navigate', { routeName: 'Unknown' }));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('navigate with no routeName is a no-op', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:navigate'));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('mapples:goBack calls back() when canGoBack() is true', () => {
    const { router, navigation } = makeDeps(true);
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:goBack'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('mapples:goBack is a no-op when canGoBack() is false', () => {
    const { router, navigation } = makeDeps(false);
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:goBack'));
    expect(router.back).not.toHaveBeenCalled();
  });

  it('mapples:openDrawer dispatches OPEN_DRAWER', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:openDrawer'));
    expect(navigation.dispatch).toHaveBeenCalledWith({ type: 'OPEN_DRAWER' });
  });

  it('mapples:closeDrawer dispatches CLOSE_DRAWER', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('mapples:closeDrawer'));
    expect(navigation.dispatch).toHaveBeenCalledWith({ type: 'CLOSE_DRAWER' });
  });

  it('unknown action types are ignored', () => {
    const { router, navigation } = makeDeps();
    createNavigationDispatch(
      routes,
      router,
      navigation,
    )(makeAction('some:other', { routeName: 'Home' }));
    expect(router.push).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
    expect(navigation.dispatch).not.toHaveBeenCalled();
  });
});
