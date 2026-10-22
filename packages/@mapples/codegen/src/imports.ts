import type { ImportNeed, RenderDomNode } from '@mapples/sid-ast';

export interface ResolvedImports {
  /** Every canvas element type the tree uses, sorted. */
  uiNames: string[];
  /** The same names by the package they are imported from, packages sorted. */
  primitives: Map<string, string[]>;
  customs: Map<string, { module: string; exportName: string }>; // local name -> origin
}

export const UI_MODULE = '@mapples/ui';
export const COMPONENTS_MODULE = '@mapples/components';

/**
 * The element types `@mapples/components` registers (its `Components`
 * registry); every other canvas type is a `@mapples/ui` primitive. Keep in
 * step with `packages/@mapples/components/src/components/*\/*\/schematic.ts`:
 * a type missing here is imported from the wrong package.
 */
const COMPONENTS_TYPES: ReadonlySet<string> = new Set([
  'Accordion',
  'ActionSheet',
  'ActivityRings',
  'Avatar',
  'AvatarGroup',
  'Badge',
  'Banner',
  'BarChart',
  'BottomActionBar',
  'BottomNavigationBar',
  'BottomSheet',
  'Breadcrumbs',
  'ButtonGroup',
  'CalendarHeatmap',
  'Card',
  'ChatComposer',
  'Checkbox',
  'Chip',
  'ChipGroup',
  'DayPicker',
  'Dialog',
  'Divider',
  'DrawerItems',
  'EmptyState',
  'Fab',
  'ImageCarousel',
  'InputField',
  'LineChart',
  'List',
  'ListItem',
  'MediaCard',
  'MessageBubble',
  'NumberStepper',
  'PageControl',
  'PinInput',
  'ProgressBar',
  'ProgressCircle',
  'RadioGroup',
  'Rating',
  'SearchBar',
  'SectionHeader',
  'SegmentedControl',
  'SelectField',
  'Skeleton',
  'Slider',
  'Snackbar',
  'Spinner',
  'StatTile',
  'Steps',
  'Switch',
  'Table',
  'TabBarItems',
  'TabIcon',
  'TabTemplate',
  'TabLabel',
  'Tabs',
  'TextLink',
  'Timeline',
  'TopAppBar',
]);

/** The package a canvas element type is imported from. */
export function moduleForType(type: string): string {
  return COMPONENTS_TYPES.has(type) ? COMPONENTS_MODULE : UI_MODULE;
}

const byModule = (names: Set<string>): Map<string, string[]> => {
  const grouped = new Map<string, string[]>();
  for (const name of [...names].sort()) {
    const module = moduleForType(name);
    grouped.set(module, [...(grouped.get(module) ?? []), name]);
  }
  return new Map([...grouped].sort(([a], [b]) => (a < b ? -1 : 1)));
};

export function parseImportRef(ref: string): {
  module: string;
  exportName: string;
} {
  const idx = ref.lastIndexOf('#');
  if (idx === -1) throw new Error(`invalid importRef (missing #): ${ref}`);
  return { module: ref.slice(0, idx), exportName: ref.slice(idx + 1) };
}

export function collectImports(root: RenderDomNode): ResolvedImports {
  const uiNames = new Set<string>();
  const customs = new Map<string, { module: string; exportName: string }>();

  const walk = (node: RenderDomNode): void => {
    if (node.type === 'Custom') {
      const name = node.props.name;
      const importRef = node.props.importRef;
      if (typeof name !== 'string' || typeof importRef !== 'string') {
        throw new Error(`Custom node ${node.sid} is missing name/importRef`);
      }
      const origin = parseImportRef(importRef);
      if (origin.module === '') {
        throw new Error(
          `Custom node ${node.sid} (${name}) has a local importRef (${importRef}); cannot emit an import for it`,
        );
      }
      const existing = customs.get(name);
      if (
        existing &&
        (existing.module !== origin.module ||
          existing.exportName !== origin.exportName)
      ) {
        throw new Error(
          `Custom name collision: ${name} maps to both ${existing.module} and ${origin.module}`,
        );
      }
      customs.set(name, origin);
    } else {
      uiNames.add(node.type);
    }
    for (const child of node.children) walk(child);
  };
  walk(root);

  for (const name of customs.keys()) {
    if (uiNames.has(name)) {
      throw new Error(
        `Custom component ${name} collides with a ${moduleForType(name)} primitive of the same name`,
      );
    }
  }

  return {
    uiNames: [...uiNames].sort(),
    primitives: byModule(uiNames),
    customs,
  };
}

export function printImports(resolved: ResolvedImports): string {
  const lines: string[] = [];
  for (const [module, names] of resolved.primitives) {
    lines.push(`import { ${names.join(', ')} } from '${module}';`);
  }
  const byModule = new Map<
    string,
    { defaults: string[]; named: [string, string][] }
  >();
  for (const [local, origin] of resolved.customs) {
    let entry = byModule.get(origin.module);
    if (!entry) {
      entry = { defaults: [], named: [] };
      byModule.set(origin.module, entry);
    }
    if (origin.exportName === 'default') entry.defaults.push(local);
    else entry.named.push([origin.exportName, local]);
  }
  for (const module of [...byModule.keys()].sort()) {
    const entry = byModule.get(module)!;
    const pieces: string[] = [];
    if (entry.defaults.length > 1) {
      throw new Error(
        `two default imports from ${module}: ${entry.defaults.join(', ')}`,
      );
    }
    if (entry.defaults.length === 1) pieces.push(entry.defaults[0]!);
    if (entry.named.length > 0) {
      const named = entry.named
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([exp, local]) => (exp === local ? exp : `${exp} as ${local}`))
        .join(', ');
      pieces.push(`{ ${named} }`);
    }
    lines.push(`import ${pieces.join(', ')} from '${module}';`);
  }
  return lines.join('\n');
}

/** ImportNeeds for @mapples/sid-ast upsertImports, from a merged tree. */
export function importNeedsFor(root: RenderDomNode): ImportNeed[] {
  const { primitives, customs } = collectImportsTolerant(root);
  const needs: ImportNeed[] = [];
  for (const [module, named] of primitives) needs.push({ module, named });
  for (const [local, origin] of customs) {
    if (origin.module === '') continue; // locally-defined component: nothing to import
    needs.push(
      origin.exportName === 'default'
        ? { module: origin.module, defaultName: local }
        : { module: origin.module, named: [origin.exportName] },
    );
  }
  return needs;
}

/** Like collectImports but tolerant of local (#Name) customs — used for healing. */
function collectImportsTolerant(root: RenderDomNode): ResolvedImports {
  const uiNames = new Set<string>();
  const customs = new Map<string, { module: string; exportName: string }>();
  const walk = (node: RenderDomNode): void => {
    if (node.type === 'Custom') {
      const name = node.props.name;
      const importRef = node.props.importRef;
      if (typeof name === 'string' && typeof importRef === 'string') {
        const origin = parseImportRef(importRef);
        if (!customs.has(name)) customs.set(name, origin);
      }
    } else {
      uiNames.add(node.type);
    }
    for (const child of node.children) walk(child);
  };
  walk(root);
  return {
    uiNames: [...uiNames].sort(),
    primitives: byModule(uiNames),
    customs,
  };
}
