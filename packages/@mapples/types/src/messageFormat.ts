/**
 * @fileoverview The message template format of the locales document: an
 * ICU MessageFormat subset, parsed once and formatted with `Intl`.
 *
 * Supported:
 * - `{name}` — a placeholder; `name` is a binding path (`vars.user.name`).
 * - `{n, number}` / `{n, number, integer|percent|compact|currency/USD}`.
 * - `{d, date}` / `{d, time}` with `short|medium|long|full`.
 * - `{n, plural, =0 {…} one {…} other {…}}` with `#` and `offset:N`.
 * - `{n, selectordinal, one {#st} other {#th}}`.
 * - `{g, select, a {…} other {…}}`.
 * - `''` for a literal apostrophe, `'{…}'` for literal braces.
 *
 * The same value formats are exposed on their own through
 * {@link formatValue}, which is what a binding's `format` uses.
 */

/** A value format: what `{arg, kind, style}` and a binding format name. */
export interface ValueFormat {
  kind: 'number' | 'date' | 'time';
  style?: string;
}

export type MessagePart =
  | string
  | { type: 'value'; arg: string }
  | { type: 'format'; arg: string; format: ValueFormat }
  | {
      type: 'plural';
      arg: string;
      ordinal: boolean;
      offset: number;
      options: Record<string, MessagePart[]>;
    }
  | { type: 'select'; arg: string; options: Record<string, MessagePart[]> }
  | { type: 'pound' };

/** A template that does not parse; `position` is the offending index. */
export class MessageSyntaxError extends Error {
  readonly position: number;

  constructor(message: string, position: number) {
    super(`${message} at ${position}`);
    this.name = 'MessageSyntaxError';
    this.position = position;
  }
}

const DATE_STYLES: ReadonlySet<string> = new Set([
  'short',
  'medium',
  'long',
  'full',
]);
const NUMBER_STYLES: ReadonlySet<string> = new Set([
  'integer',
  'percent',
  'compact',
]);
const CURRENCY_STYLE = /^currency\/[A-Z]{3}$/;
const ARG_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)*$/;
const PLURAL_SELECTOR = /^(=\d+|zero|one|two|few|many|other)$/;

const assertStyle = (format: ValueFormat, position: number): void => {
  const { kind, style } = format;
  if (style === undefined) return;
  const known =
    kind === 'number'
      ? NUMBER_STYLES.has(style) || CURRENCY_STYLE.test(style)
      : DATE_STYLES.has(style);
  if (!known) {
    throw new MessageSyntaxError(`Unknown ${kind} style "${style}"`, position);
  }
};

/**
 * Parse a value format as written in a binding: `number`,
 * `number, currency/USD`, `date, long`.
 */
export const parseValueFormat = (source: string): ValueFormat => {
  const [kind, style, ...rest] = source.split(',').map((part) => part.trim());
  if (
    rest.length > 0 ||
    (kind !== 'number' && kind !== 'date' && kind !== 'time')
  ) {
    throw new MessageSyntaxError(`Unknown format "${source}"`, 0);
  }
  const format: ValueFormat = style ? { kind, style } : { kind };
  assertStyle(format, 0);
  return format;
};

class Parser {
  private index = 0;

  constructor(private readonly source: string) {}

  parse(): MessagePart[] {
    const parts = this.parseParts(false, false);
    if (this.index < this.source.length) {
      throw new MessageSyntaxError('Unmatched "}"', this.index);
    }
    return parts;
  }

  /** Parts up to the end of input, or to the `}` closing a nested block. */
  private parseParts(nested: boolean, inPlural: boolean): MessagePart[] {
    const parts: MessagePart[] = [];
    let text = '';
    const flush = () => {
      if (text) parts.push(text);
      text = '';
    };
    while (this.index < this.source.length) {
      const char = this.source[this.index];
      if (char === "'") {
        text += this.parseQuoted(inPlural);
      } else if (char === '{') {
        flush();
        parts.push(this.parseArgument(inPlural));
      } else if (char === '}') {
        if (!nested) break;
        flush();
        return parts;
      } else if (char === '#' && inPlural) {
        flush();
        parts.push({ type: 'pound' });
        this.index += 1;
      } else {
        text += char;
        this.index += 1;
      }
    }
    if (nested) throw new MessageSyntaxError('Missing "}"', this.index);
    flush();
    return parts;
  }

  /**
   * An apostrophe: `''` is a literal one; before `{`, `}` (or `#` inside a
   * plural) it quotes text up to the next lone apostrophe; elsewhere it is
   * itself.
   */
  private parseQuoted(inPlural: boolean): string {
    const next = this.source[this.index + 1];
    if (next === "'") {
      this.index += 2;
      return "'";
    }
    if (next !== '{' && next !== '}' && !(next === '#' && inPlural)) {
      this.index += 1;
      return "'";
    }
    this.index += 1;
    let quoted = '';
    while (this.index < this.source.length) {
      const char = this.source[this.index];
      if (char === "'") {
        if (this.source[this.index + 1] === "'") {
          quoted += "'";
          this.index += 2;
          continue;
        }
        this.index += 1;
        return quoted;
      }
      quoted += char;
      this.index += 1;
    }
    throw new MessageSyntaxError('Unclosed quote', this.index);
  }

  private skipSpace(): void {
    while (/\s/.test(this.source[this.index] ?? '')) this.index += 1;
  }

  /** Read up to (not including) any of `stops`, trimmed. */
  private readUntil(stops: string): string {
    const start = this.index;
    while (
      this.index < this.source.length &&
      !stops.includes(this.source[this.index])
    ) {
      this.index += 1;
    }
    return this.source.slice(start, this.index).trim();
  }

  private expect(char: string): void {
    if (this.source[this.index] !== char) {
      throw new MessageSyntaxError(`Expected "${char}"`, this.index);
    }
    this.index += 1;
  }

  private parseArgument(inPlural: boolean): MessagePart {
    const start = this.index;
    this.expect('{');
    const arg = this.readUntil(',}');
    if (!ARG_NAME.test(arg)) {
      throw new MessageSyntaxError(`Invalid placeholder "${arg}"`, start);
    }
    if (this.source[this.index] === '}') {
      this.index += 1;
      return { type: 'value', arg };
    }
    this.expect(',');
    const kind = this.readUntil(',}');
    if (kind === 'number' || kind === 'date' || kind === 'time') {
      const format: ValueFormat = { kind };
      if (this.source[this.index] === ',') {
        this.index += 1;
        format.style = this.readUntil('}');
      }
      assertStyle(format, start);
      this.expect('}');
      return { type: 'format', arg, format };
    }
    if (kind === 'plural' || kind === 'selectordinal' || kind === 'select') {
      this.expect(',');
      const isPlural = kind !== 'select';
      let offset = 0;
      this.skipSpace();
      if (isPlural && this.source.startsWith('offset:', this.index)) {
        this.index += 'offset:'.length;
        const raw = this.readUntil(' \n\t{');
        offset = Number(raw);
        if (!Number.isInteger(offset)) {
          throw new MessageSyntaxError(`Invalid offset "${raw}"`, start);
        }
      }
      const options = this.parseOptions(isPlural, isPlural || inPlural, start);
      this.expect('}');
      return isPlural
        ? {
            type: 'plural',
            arg,
            ordinal: kind === 'selectordinal',
            offset,
            options,
          }
        : { type: 'select', arg, options };
    }
    throw new MessageSyntaxError(`Unknown format "${kind}"`, start);
  }

  private parseOptions(
    isPlural: boolean,
    inPlural: boolean,
    start: number,
  ): Record<string, MessagePart[]> {
    const options: Record<string, MessagePart[]> = {};
    for (;;) {
      this.skipSpace();
      if (this.source[this.index] === '}' || this.index >= this.source.length) {
        break;
      }
      const selector = this.readUntil('{}');
      if (!selector || (isPlural && !PLURAL_SELECTOR.test(selector))) {
        throw new MessageSyntaxError(
          `Invalid selector "${selector}"`,
          this.index,
        );
      }
      this.expect('{');
      options[selector] = this.parseParts(true, inPlural);
      this.expect('}');
    }
    if (!options.other) {
      throw new MessageSyntaxError('Missing "other" option', start);
    }
    return options;
  }
}

/** Parse a message template; throws {@link MessageSyntaxError}. */
export const parseMessage = (source: string): MessagePart[] =>
  new Parser(source).parse();

/** The placeholder paths a template reads, in first-use order. */
export const messageArguments = (parts: MessagePart[]): string[] => {
  const args = new Set<string>();
  const walk = (list: MessagePart[]) => {
    for (const part of list) {
      if (typeof part === 'string' || part.type === 'pound') continue;
      args.add(part.arg);
      if (part.type === 'plural' || part.type === 'select') {
        Object.values(part.options).forEach(walk);
      }
    }
  };
  walk(parts);
  return [...args];
};

const formatters = new Map<
  string,
  Intl.NumberFormat | Intl.DateTimeFormat | Intl.PluralRules
>();

const cached = <
  T extends Intl.NumberFormat | Intl.DateTimeFormat | Intl.PluralRules,
>(
  cacheKey: string,
  create: () => T,
): T => {
  const hit = formatters.get(cacheKey);
  if (hit) return hit as T;
  const made = create();
  formatters.set(cacheKey, made);
  return made;
};

const numberOptions = (style?: string): Intl.NumberFormatOptions => {
  if (style === undefined) return {};
  if (style === 'integer') return { maximumFractionDigits: 0 };
  if (style === 'percent') return { style: 'percent' };
  if (style === 'compact') return { notation: 'compact' };
  return { style: 'currency', currency: style.slice('currency/'.length) };
};

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/**
 * Format one value for a locale (`undefined`: the host's own). A value the format cannot read (a
 * non-numeric string as a number, an unparsable date) is returned as its
 * plain text, so a wrong binding shows the raw data instead of `NaN`.
 */
export const formatValue = (
  value: unknown,
  format: ValueFormat,
  locale: string | undefined,
): string => {
  if (isNil(value) || value === '') return '';
  const { kind, style } = format;
  if (kind === 'number') {
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(number)) return String(value);
    return cached(
      `number|${locale}|${style ?? ''}`,
      () => new Intl.NumberFormat(locale, numberOptions(style)),
    ).format(number);
  }
  const date = toDate(value);
  if (!date) return String(value);
  const length = (style ?? 'medium') as Intl.DateTimeFormatOptions['dateStyle'];
  return cached(
    `${kind}|${locale}|${length}`,
    () =>
      new Intl.DateTimeFormat(
        locale,
        kind === 'date' ? { dateStyle: length } : { timeStyle: length },
      ),
  ).format(date);
};

/** Reads the value of a placeholder path. */
export type MessageResolver = (arg: string) => unknown;

const formatParts = (
  parts: MessagePart[],
  locale: string,
  resolve: MessageResolver,
  pound: number | null,
): string =>
  parts
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part.type === 'pound') {
        return pound === null
          ? '#'
          : formatValue(pound, { kind: 'number' }, locale);
      }
      const value = resolve(part.arg);
      if (part.type === 'value') return isNil(value) ? '' : String(value);
      if (part.type === 'format') {
        return formatValue(value, part.format, locale);
      }
      if (part.type === 'select') {
        const chosen = part.options[String(value)] ?? part.options.other;
        return formatParts(chosen, locale, resolve, pound);
      }
      const count = Number(value);
      const shifted = count - part.offset;
      const category = cached(
        `plural|${locale}|${part.ordinal}`,
        () =>
          new Intl.PluralRules(locale, {
            type: part.ordinal ? 'ordinal' : 'cardinal',
          }),
      ).select(shifted);
      const chosen =
        part.options[`=${count}`] ??
        part.options[category] ??
        part.options.other;
      return formatParts(chosen, locale, resolve, shifted);
    })
    .join('');

/** Format a parsed template for a locale. */
export const formatMessage = (
  parts: MessagePart[],
  locale: string,
  resolve: MessageResolver,
): string => formatParts(parts, locale, resolve, null);
