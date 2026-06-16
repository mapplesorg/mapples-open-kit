/// <reference types="jest" />
import { Action, NavigationDocument } from '@mapples/types';

import { toNavigationCommand } from './actionCommands';
import { NavigationActionType } from './constants';

// A tabs root over two stacks that each own an `index` route — the duplicate
// route-name case that bare `navigate('index')` cannot disambiguate.
const doc: NavigationDocument = {
  version: 1,
  rootNavigatorId: 'root',
  navigators: {
    root: {
      id: 'root',
      type: 'tabs',
      name: 'Root',
      routes: [
        {
          id: 't-home',
          name: 'HomeTab',
          target: { kind: 'navigator', navigatorId: 'nav-home' },
        },
        {
          id: 't-shop',
          name: 'ShopTab',
          target: { kind: 'navigator', navigatorId: 'nav-shop' },
        },
      ],
    },
    'nav-home': {
      id: 'nav-home',
      type: 'stack',
      name: 'HomeStack',
      routes: [
        {
          id: 'h-index',
          name: 'index',
          target: { kind: 'page', pageUuid: 'page-home' },
        },
        {
          id: 'h-detail',
          name: 'Detail',
          target: { kind: 'page', pageUuid: 'page-detail' },
        },
      ],
    },
    'nav-shop': {
      id: 'nav-shop',
      type: 'stack',
      name: 'ShopStack',
      routes: [
        {
          id: 's-index',
          name: 'index',
          target: { kind: 'page', pageUuid: 'page-shop' },
        },
      ],
    },
  },
};

const action = (type: string, data?: Record<string, unknown>): Action => ({
  time: 0,
  type,
  payload: data ? { data } : undefined,
});

describe('toNavigationCommand', () => {
  it('navigates by qualified routeName, passing params', () => {
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, {
          routeName: 'HomeStack:Detail',
          params: { id: 7 },
        }),
        doc,
      ),
    ).toEqual({
      kind: 'navigate',
      routeName: 'HomeStack:Detail',
      params: { id: 7 },
    });
  });

  it('disambiguates two `index` routes by their qualified names', () => {
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { routeName: 'HomeStack:index' }),
        doc,
      ),
    ).toEqual({
      kind: 'navigate',
      routeName: 'HomeStack:index',
      params: undefined,
    });
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { routeName: 'ShopStack:index' }),
        doc,
      ),
    ).toEqual({
      kind: 'navigate',
      routeName: 'ShopStack:index',
      params: undefined,
    });
  });

  it('falls back to the first match for a bare legacy route name (with a warning)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { routeName: 'index' }),
        doc,
      ),
    ).toEqual({
      kind: 'navigate',
      routeName: 'HomeStack:index',
      params: undefined,
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('resolves a pageUuid navigate target to its qualified route name', () => {
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { pageUuid: 'page-shop' }),
        doc,
      ),
    ).toEqual({
      kind: 'navigate',
      routeName: 'ShopStack:index',
      params: undefined,
    });
  });

  it('returns null when a navigate target cannot be resolved', () => {
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { pageUuid: 'missing' }),
        doc,
      ),
    ).toBeNull();
    expect(
      toNavigationCommand(
        action(NavigationActionType.Navigate, { routeName: 'Nope:nope' }),
        doc,
      ),
    ).toBeNull();
    expect(
      toNavigationCommand(action(NavigationActionType.Navigate), doc),
    ).toBeNull();
  });

  it('maps the simple commands', () => {
    expect(
      toNavigationCommand(action(NavigationActionType.GoBack), doc),
    ).toEqual({ kind: 'goBack' });
    expect(
      toNavigationCommand(action(NavigationActionType.OpenDrawer), doc),
    ).toEqual({ kind: 'openDrawer' });
    expect(
      toNavigationCommand(action(NavigationActionType.CloseDrawer), doc),
    ).toEqual({ kind: 'closeDrawer' });
  });

  it('switches tab by qualified name only', () => {
    expect(
      toNavigationCommand(
        action(NavigationActionType.SwitchTab, { routeName: 'Root:ShopTab' }),
        doc,
      ),
    ).toEqual({ kind: 'switchTab', routeName: 'Root:ShopTab' });
    expect(
      toNavigationCommand(action(NavigationActionType.SwitchTab), doc),
    ).toBeNull();
  });

  it('ignores non-navigation actions', () => {
    expect(toNavigationCommand(action('BUTTON_PRESSED'), doc)).toBeNull();
    expect(toNavigationCommand({ time: 0 }, doc)).toBeNull();
  });
});
