import { readFileSync } from 'fs';
import { join } from 'path';

import { NavigationDocument } from './navigation';
import {
  NavigationValidationCode,
  validateNavigationDocument,
} from './navigationValidator';

const BASIC_FIXTURE_PATH = join(
  __dirname,
  '..',
  'test',
  'fixtures',
  'navigation',
  'basic.json',
);

/** Load a fresh, structurally-valid document for each test to mutate freely. */
function loadBasic(): NavigationDocument {
  return JSON.parse(
    readFileSync(BASIC_FIXTURE_PATH, 'utf-8'),
  ) as NavigationDocument;
}

/** Convenience: the set of error codes produced for a document. */
function codes(doc: NavigationDocument): NavigationValidationCode[] {
  return validateNavigationDocument(doc).errors.map((e) => e.code);
}

describe('validateNavigationDocument', () => {
  it('accepts the basic fixture (tabs root → 3 stacks → pages, one modal)', () => {
    const result = validateNavigationDocument(loadBasic());
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('flags ROOT_MISSING when rootNavigatorId does not resolve', () => {
    const doc = loadBasic();
    doc.rootNavigatorId = 'does-not-exist';
    expect(codes(doc)).toContain('ROOT_MISSING');
  });

  it('flags NAVIGATOR_TARGET_MISSING when a navigator route targets an absent navigator', () => {
    const doc = loadBasic();
    doc.navigators['nav-root'].routes[0].target = {
      kind: 'navigator',
      navigatorId: 'nav-ghost',
    };
    expect(codes(doc)).toContain('NAVIGATOR_TARGET_MISSING');
  });

  it('flags NAVIGATOR_CYCLE for a direct nesting cycle', () => {
    const doc = loadBasic();
    // Make a stack point back at the root tabs navigator: root → home → root.
    doc.navigators['nav-home'].routes.push({
      id: 'route-home-loop',
      name: 'LoopBack',
      target: { kind: 'navigator', navigatorId: 'nav-root' },
    });
    const result = validateNavigationDocument(doc);
    expect(result.errors.map((e) => e.code)).toContain('NAVIGATOR_CYCLE');
    expect(result.valid).toBe(false);
  });

  it('flags NAVIGATOR_CYCLE when one navigator is nested under two routes (not a tree)', () => {
    const doc = loadBasic();
    // Point the Search tab at nav-home as well, so nav-home has two parents.
    doc.navigators['nav-root'].routes[1].target = {
      kind: 'navigator',
      navigatorId: 'nav-home',
    };
    expect(codes(doc)).toContain('NAVIGATOR_CYCLE');
  });

  it('flags INITIAL_ROUTE_INVALID when initialRouteId is not one of the routes', () => {
    const doc = loadBasic();
    doc.navigators['nav-home'].initialRouteId = 'route-not-here';
    expect(codes(doc)).toContain('INITIAL_ROUTE_INVALID');
  });

  it('flags DUPLICATE_ROUTE_NAME for repeated route names within a navigator', () => {
    const doc = loadBasic();
    doc.navigators['nav-home'].routes[1].name =
      doc.navigators['nav-home'].routes[0].name;
    expect(codes(doc)).toContain('DUPLICATE_ROUTE_NAME');
  });

  it('flags PRESENTATION_NOT_STACK when presentation is set under a non-stack navigator', () => {
    const doc = loadBasic();
    // nav-root is a tabs navigator; presentation is only valid under stacks.
    doc.navigators['nav-root'].routes[0].presentation = 'modal';
    expect(codes(doc)).toContain('PRESENTATION_NOT_STACK');
  });

  it('allows presentation on stack routes (the modal in the fixture)', () => {
    const doc = loadBasic();
    expect(codes(doc)).not.toContain('PRESENTATION_NOT_STACK');
  });

  it('collects multiple violations at once rather than failing fast', () => {
    const doc = loadBasic();
    doc.rootNavigatorId = 'missing';
    doc.navigators['nav-home'].routes[1].name =
      doc.navigators['nav-home'].routes[0].name;
    const result = validateNavigationDocument(doc);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(result.errors.map((e) => e.code)).toEqual(
      expect.arrayContaining(['ROOT_MISSING', 'DUPLICATE_ROUTE_NAME']),
    );
  });
});
