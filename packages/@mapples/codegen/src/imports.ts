import type { ImportNeed, RenderDomNode } from '@mapples/sid-ast';

export interface ResolvedImports {
  uiNames: string[]; // named imports from @mapples/ui, sorted
  customs: Map<string, { module: string; exportName: string }>; // local name -> origin
}

export const UI_MODULE = '@mapples/ui';

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
        `Custom component ${name} collides with a @mapples/ui primitive of the same name`,
      );
    }
  }

  return { uiNames: [...uiNames].sort(), customs };
}

export function printImports(resolved: ResolvedImports): string {
  const lines: string[] = [];
  if (resolved.uiNames.length > 0) {
    lines.push(
      `import { ${resolved.uiNames.join(', ')} } from '${UI_MODULE}';`,
    );
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
  const { uiNames, customs } = collectImportsTolerant(root);
  const needs: ImportNeed[] = [];
  if (uiNames.length > 0) needs.push({ module: UI_MODULE, named: uiNames });
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
  return { uiNames: [...uiNames].sort(), customs };
}
