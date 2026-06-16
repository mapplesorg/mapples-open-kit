/// <reference types="jest" />
import { readFileSync } from 'fs';
import { join } from 'path';

import { NavigationDocument } from '@mapples/types';

import {
  buildNavigationModel,
  buildScreenNavigateTarget,
  collectDescendantRouteIds,
  findRouteNameForPage,
} from './model';

const FIXTURE_PATH = join(
  __dirname,
  '..',
  '..',
  'types',
  'test',
  'fixtures',
  'navigation',
  'basic.json',
);

const loadFixture = (): NavigationDocument =>
  JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as NavigationDocument;

describe('buildNavigationModel', () => {
  it('expands the fixture into a tabs root with three nested stacks', () => {
    const model = buildNavigationModel(loadFixture());

    expect(model).not.toBeNull();
    expect(model!.type).toBe('tabs');
    // Screen names are navigator-qualified (`<navigator>:<route>`).
    expect(model!.initialRouteName).toBe('Root:HomeTab');
    expect(model!.screens).toHaveLength(3);

    expect(model!.screens.map((s) => s.routeName)).toEqual([
      'Root:HomeTab',
      'Root:SearchTab',
      'Root:ProfileTab',
    ]);

    const home = model!.screens[0];
    expect(home.target.kind).toBe('navigator');
    if (home.target.kind === 'navigator') {
      expect(home.target.child.type).toBe('stack');
      expect(home.target.child.initialRouteName).toBe('HomeStack:Feed');
      // The Home stack carries the modal route from the fixture.
      const compose = home.target.child.screens.find(
        (s) => s.routeName === 'HomeStack:Compose',
      );
      expect(compose?.route.presentation).toBe('modal');
      // The bare route name remains available on the route node for display.
      expect(compose?.route.name).toBe('Compose');
    }
  });

  it('defaults initialRouteName to the first screen when unset', () => {
    const doc = loadFixture();
    delete doc.navigators['nav-search'].initialRouteId;
    const model = buildNavigationModel(doc);
    const search = model!.screens[1];
    if (search.target.kind === 'navigator') {
      expect(search.target.child.initialRouteName).toBe('SearchStack:Search');
    }
  });

  it('finds the qualified route name referencing a page', () => {
    const doc = loadFixture();
    const feedPage =
      doc.navigators['nav-home'].routes[0].target.kind === 'page'
        ? (doc.navigators['nav-home'].routes[0].target as { pageUuid: string })
            .pageUuid
        : '';
    expect(findRouteNameForPage(doc, feedPage)).toBe('HomeStack:Feed');
    expect(findRouteNameForPage(doc, 'no-such-page')).toBeNull();
  });
});

describe('buildScreenNavigateTarget', () => {
  it('nests a screen inside its parent navigators', () => {
    // "Feed" lives in the Home stack, reached via the root tabs "HomeTab" route.
    expect(buildScreenNavigateTarget(loadFixture(), 'HomeStack:Feed')).toEqual({
      name: 'Root:HomeTab',
      params: { screen: 'HomeStack:Feed', params: undefined },
    });
  });

  it('carries params into the innermost screen', () => {
    expect(
      buildScreenNavigateTarget(loadFixture(), 'HomeStack:PostDetail', {
        id: 7,
      }),
    ).toEqual({
      name: 'Root:HomeTab',
      params: { screen: 'HomeStack:PostDetail', params: { id: 7 } },
    });
  });

  it('returns a flat target for a top-level screen and null for unknown', () => {
    expect(buildScreenNavigateTarget(loadFixture(), 'Root:HomeTab')).toEqual({
      name: 'Root:HomeTab',
      params: undefined,
    });
    expect(buildScreenNavigateTarget(loadFixture(), 'Nope:nope')).toBeNull();
  });
});

describe('collectDescendantRouteIds', () => {
  it('collects screens under a navigator-route, and none under a leaf', () => {
    const doc = loadFixture();
    expect(collectDescendantRouteIds(doc, 'route-tab-home')).toEqual(
      new Set(['route-home-feed', 'route-home-detail', 'route-home-compose']),
    );
    expect(collectDescendantRouteIds(doc, 'route-home-feed').size).toBe(0);
  });

  it('collects the whole subtree for a navigator id', () => {
    const ids = collectDescendantRouteIds(loadFixture(), 'nav-root');
    expect(ids.has('route-tab-home')).toBe(true);
    expect(ids.has('route-home-feed')).toBe(true);
    expect(ids.has('route-profile-settings')).toBe(true);
  });
});
