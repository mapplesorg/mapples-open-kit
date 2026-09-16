// Linked component instances: the two languages a page speaks.
//
// In a FILE, a Creator component used on a page is what a developer writes —
// `import ProfileCard from '../mapples/components/ProfileCard'` and
// `<ProfileCard $sid="…" styled={{ … }} />` — which extraction reads as a
// `Custom` node with that import ref. On the CANVAS the same thing is a
// `ComponentInstance` node: `{ componentUuid, componentName, styled }`, the
// Creator's linked instance of the saved component. Base and remote trees
// always speak canvas; a tree read from a file speaks file. `link` and
// `unlink` convert, so the merge compares like with like and the file never
// sees a `ComponentInstance` tag (nothing exports one).
//
// Paths are whatever the resolver understands: `posixResolver` for
// repo-relative POSIX paths (the Creator), the CLI plugs in `node:path`.

import type { ExtractWarning, RenderDomNode } from '@mapples/sid-ast';

import { pageComponentName } from './emit.js';
import { parseImportRef } from './imports.js';
import { dirname, join, normalize, relative } from './paths.js';

export interface InstanceLinker {
  /** File language -> canvas language, in place. Reports what could not link. */
  link(
    dom: RenderDomNode,
    file: string,
    warn: (w: ExtractWarning) => void,
  ): void;
  /** Canvas language -> file language, as a copy. Reports instances with no component. */
  unlink(
    dom: RenderDomNode,
    file: string,
    warn: (w: ExtractWarning) => void,
  ): RenderDomNode;
  /** Does this import, from this file, name a managed component? */
  isLinked(
    origin: { module: string; exportName: string },
    file: string,
  ): boolean;
}

/** Where a Creator component's file lives (the CLI's `.mapples/components.json` row). */
export interface ComponentFile {
  file: string;
  name: string;
}

/** What the linker needs to know about a Creator component. */
export interface LinkableComponent {
  name: string;
  /** The Creator component uuid a page's `ComponentInstance` links to. */
  uuid?: string;
}

/** Relative-import arithmetic between a page file and a component file. */
export interface ModuleResolver {
  /** `../mapples/components/ProfileCard` from `app/profile.tsx` -> `mapples/components/ProfileCard.tsx`; null for a bare module. */
  fileFor(fromFile: string, module: string): string | null;
  /** `mapples/components/ProfileCard.tsx` from `app/profile.tsx` -> `../mapples/components/ProfileCard`. */
  moduleFor(fromFile: string, targetFile: string): string;
}

/** Repo-relative POSIX paths, no filesystem. */
export const posixResolver: ModuleResolver = {
  fileFor(fromFile, module) {
    if (!module.startsWith('.')) return null;
    const resolved = normalize(join(dirname(fromFile), module));
    return resolved.endsWith('.tsx') ? resolved : `${resolved}.tsx`;
  },
  moduleFor(fromFile, targetFile) {
    let rel = relative(dirname(fromFile), targetFile).replace(/\.tsx$/, '');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
  },
};

interface LinkedComponent {
  id: string;
  file: string;
  name: string;
  uuid: string | undefined;
}

export function instanceLinker(
  componentsMap: Record<string, ComponentFile>,
  components: Map<string, LinkableComponent>,
  resolver: ModuleResolver = posixResolver,
): InstanceLinker {
  const byFile = new Map<string, LinkedComponent>();
  const byUuid = new Map<string, LinkedComponent>();
  for (const [id, mapping] of Object.entries(componentsMap)) {
    const entity = components.get(id);
    const linked: LinkedComponent = {
      id,
      file: mapping.file,
      name: entity?.name ?? mapping.name,
      uuid: entity?.uuid,
    };
    byFile.set(linked.file, linked);
    if (linked.uuid) byUuid.set(linked.uuid, linked);
  }

  const componentFor = (
    origin: { module: string; exportName: string },
    file: string,
  ): LinkedComponent | null => {
    if (origin.exportName !== 'default') return null;
    const target = resolver.fileFor(file, origin.module);
    return target ? (byFile.get(target) ?? null) : null;
  };

  return {
    isLinked: (origin, file) => componentFor(origin, file) !== null,

    link(dom, file, warn) {
      const walk = (node: RenderDomNode): void => {
        node.children.forEach(walk);
        if (node.type !== 'Custom') return;
        const { name, importRef, layout } = node.props as {
          name?: unknown;
          importRef?: unknown;
          layout?: unknown;
        };
        if (typeof name !== 'string' || typeof importRef !== 'string') return;
        const component = componentFor(parseImportRef(importRef), file);
        if (!component) return;
        if (!component.uuid) {
          warn({
            kind: 'UNKNOWN_ELEMENT_WITH_SID',
            sid: node.sid,
            detail: `<${name}> is the Creator component “${component.name}”, but that component has no uuid yet — pushed as a Custom placeholder; run \`mapples sync\` again after the component reaches the Creator`,
          });
          return;
        }
        // Literal props on the tag are the instance's props (the master's
        // signature names them); `styled` keeps its own slot.
        const attrs = (layout ?? {}) as Record<string, unknown>;
        const { styled, ...instanceProps } = attrs;
        if (node.children.length > 0) {
          warn({
            kind: 'NON_LITERAL_PROP',
            sid: node.sid,
            prop: 'children',
            severity: 'info',
            detail: `children of <${name}> stay in code only — a Creator component instance has no children`,
          });
        }
        node.type = 'ComponentInstance';
        node.props = {
          ...instanceProps,
          componentUuid: component.uuid,
          componentName: component.name,
          ...(styled !== undefined ? { styled } : {}),
        };
        node.children = [];
      };
      walk(dom);
    },

    unlink(dom, file, warn) {
      // A component the Creator named after its root ("View", "Button"…)
      // cannot share a local name with the primitive the file imports.
      const primitiveTypes = new Set<string>();
      const collectTypes = (node: RenderDomNode): void => {
        if (node.type !== 'Custom' && node.type !== 'ComponentInstance') {
          primitiveTypes.add(node.type);
        }
        node.children.forEach(collectTypes);
      };
      collectTypes(dom);
      const localName = (component: LinkedComponent): string =>
        pageComponentName(component.name, primitiveTypes, 'Component');

      const convert = (node: RenderDomNode): RenderDomNode => {
        const children = node.children.map(convert);
        if (node.type !== 'ComponentInstance') return { ...node, children };
        const { componentUuid, componentName, styled, ...instanceProps } =
          node.props as {
            componentUuid?: unknown;
            componentName?: unknown;
            styled?: unknown;
            [key: string]: unknown;
          };
        const component =
          typeof componentUuid === 'string'
            ? byUuid.get(componentUuid)
            : undefined;
        if (!component) {
          warn({
            kind: 'UNKNOWN_ELEMENT_WITH_SID',
            sid: node.sid,
            detail: `instance of component “${String(componentName ?? componentUuid)}” has no component file to import — left as a ComponentInstance tag`,
          });
          return { ...node, children };
        }
        return {
          ...node,
          type: 'Custom',
          props: {
            name: localName(component),
            importRef: `${resolver.moduleFor(file, component.file)}#default`,
            layout: {
              ...instanceProps,
              ...(styled !== undefined ? { styled } : {}),
            },
          },
          children,
        };
      };
      return convert(dom);
    },
  };
}
