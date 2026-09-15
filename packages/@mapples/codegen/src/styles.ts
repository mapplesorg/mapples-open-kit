// Hoisting generated styles: every object under a node's `styled` becomes an
// entry of one `const styles = Styler.create({…})` dictionary at the bottom
// of the file, and the tag reads `styled={{ style: styles.signInText }}`.
// Keys come from what the element shows (its text, label, placeholder…) and
// what it is, so a developer can find a style by reading the JSX.

import type { RenderDomNode } from '@mapples/sid-ast';

/** Where `Styler` comes from in app code. */
export const STYLE_MODULE = '@mapples/style';

/** `styled` keys that hold a style object, and the word appended to the entry key for each. */
const STYLED_SUFFIX: Record<string, string> = {
  style: '',
  styleImage: 'Picture',
  styleTypography: 'Label',
  styleSvg: 'Glyph',
  contentContainerStyle: 'Content',
};

/** The word for a node type inside an entry key. */
const TYPE_WORD: Record<string, string> = {
  View: 'view',
  SafeAreaView: 'screen',
  ScrollView: 'scroll',
  FlatList: 'list',
  FormView: 'form',
  Text: 'text',
  Image: 'image',
  Button: 'button',
  SubmitButton: 'button',
  TextInput: 'input',
  TextField: 'input',
  Vector: 'icon',
  Icon: 'icon',
  Custom: 'custom',
};

/** Props whose text names an element well enough to name its style. */
const HINT_PROPS = [
  'text',
  'label',
  'placeholder',
  'title',
  'alt',
  'fieldName',
];

export interface HoistedStyles {
  dictName: string;
  /** Dictionary entries in document order: `[key, style object]`. */
  entries: [string, unknown][];
  /** The expression a node's `styled` key prints as, or undefined to print the literal. */
  refFor: (
    node: RenderDomNode,
    key: string,
    value: unknown,
  ) => string | undefined;
}

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "Please enter username and password" -> "pleaseEnterUsername". Words are
 * letters only — a price like "0.99$" names nothing — and the result is a
 * valid identifier start or empty.
 */
function hintWords(text: string): string {
  const words = text
    .replace(/[^A-Za-z ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w.toLowerCase());
  if (words.length === 0) return '';
  return words[0]! + words.slice(1).map(capitalize).join('');
}

function typeWord(node: RenderDomNode): string {
  if (node.type === 'Custom') {
    const name = node.props.name;
    return typeof name === 'string' && name !== ''
      ? name.charAt(0).toLowerCase() + name.slice(1)
      : 'custom';
  }
  return (
    TYPE_WORD[node.type] ??
    node.type.charAt(0).toLowerCase() + node.type.slice(1)
  );
}

/**
 * The words an element's style keys are built from: `stem` is what it shows
 * (`signIn`, `companyLogo`) or what it is when it shows nothing (`view`);
 * `style` adds the type to a shown stem (`signInText`), the other `styled`
 * keys add their own word to the stem (`signInLabel`, `companyLogoPicture`).
 */
function keyWords(
  node: RenderDomNode,
  isRoot: boolean,
): { stem: string; style: string } {
  if (isRoot) return { stem: 'root', style: 'root' };
  const props =
    node.type === 'Custom'
      ? ((node.props.layout as Record<string, unknown>) ?? {})
      : node.props;
  const type = typeWord(node);
  for (const prop of HINT_PROPS) {
    const v = props[prop];
    if (typeof v === 'string' && v.trim() !== '') {
      const hint = hintWords(v);
      if (hint !== '')
        return { stem: hint, style: `${hint}${capitalize(type)}` };
    }
  }
  return { stem: type, style: type };
}

function styledOf(node: RenderDomNode): Record<string, unknown> | null {
  const styled =
    node.type === 'Custom'
      ? ((node.props.layout as Record<string, unknown> | undefined) ?? {})
          .styled
      : node.props.styled;
  return typeof styled === 'object' && styled !== null && !Array.isArray(styled)
    ? (styled as Record<string, unknown>)
    : null;
}

export function hoistStyles(
  root: RenderDomNode,
  dictName = 'styles',
): HoistedStyles {
  const entries: [string, unknown][] = [];
  const taken = new Set<string>();
  const refs = new Map<string, string>(); // `${sid}|${styledKey}` -> entry key

  const unique = (key: string): string => {
    let candidate = key;
    for (let n = 2; taken.has(candidate); n += 1) candidate = `${key}${n}`;
    taken.add(candidate);
    return candidate;
  };

  const visit = (node: RenderDomNode, isRoot: boolean): void => {
    const styled = styledOf(node);
    if (styled) {
      const words = keyWords(node, isRoot);
      for (const [styledKey, value] of Object.entries(styled)) {
        if (!(styledKey in STYLED_SUFFIX)) continue;
        if (typeof value !== 'object' || value === null || Array.isArray(value))
          continue;
        if (Object.keys(value).length === 0) continue;
        const suffix = STYLED_SUFFIX[styledKey]!;
        const key = unique(
          suffix === '' ? words.style : `${words.stem}${suffix}`,
        );
        entries.push([key, value]);
        refs.set(`${node.sid}|${styledKey}`, key);
      }
    }
    for (const child of node.children) visit(child, false);
  };
  visit(root, true);

  return {
    dictName,
    entries,
    refFor: (node, key) => {
      const entry = refs.get(`${node.sid}|${key}`);
      return entry === undefined ? undefined : `${dictName}.${entry}`;
    },
  };
}
