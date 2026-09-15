// A component's declared props as instance fields: what the Creator shows in
// the inspector for an instance of a component whose file types its props
// (`function Card({ title, variant }: Props)`), and what the AI is told.

import type { PropsSignature } from '@mapples/sid-ast';

export type InstancePropKind = 'text' | 'number' | 'switch' | 'select' | 'code';

export interface InstancePropSpec {
  key: string;
  /** "Product title" from `productTitle`. */
  label: string;
  kind: InstancePropKind;
  /** The choices of a string-literal union. */
  options?: string[];
  optional: boolean;
  /** The type as written in the file. */
  typeText: string;
}

export interface InstancePropsDef {
  fields: InstancePropSpec[];
  /** Function-typed props, in declaration order: the events an instance can wire actions to. */
  actions: string[];
  warnings: string[];
}

/** Props the file owns entirely — never instance fields. */
const RESERVED = new Set(['children', 'style', 'styled']);

export function labelFor(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Inspector fields and events from a props signature (null → none). */
export function instancePropsDef(
  signature: PropsSignature | null,
): InstancePropsDef {
  const def: InstancePropsDef = { fields: [], actions: [], warnings: [] };
  if (signature === null) return def;
  for (const param of signature.params) {
    if (RESERVED.has(param.name)) continue;
    if (param.kind === 'function') {
      def.actions.push(param.name);
      continue;
    }
    const base = {
      key: param.name,
      label: labelFor(param.name),
      optional: param.optional,
      typeText: param.typeText,
    };
    switch (param.kind) {
      case 'string':
        def.fields.push({ ...base, kind: 'text' });
        break;
      case 'number':
        def.fields.push({ ...base, kind: 'number' });
        break;
      case 'boolean':
        def.fields.push({ ...base, kind: 'switch' });
        break;
      case 'literals':
        def.fields.push({
          ...base,
          kind: 'select',
          options: param.literals ?? [],
        });
        break;
      default:
        def.fields.push({ ...base, kind: 'code' });
        def.warnings.push(
          `prop \`${param.name}\` (${param.typeText}) is edited as JSON — only strings, numbers, booleans, string unions and functions map to inspector controls`,
        );
    }
  }
  return def;
}
