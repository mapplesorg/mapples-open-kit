// POSIX path arithmetic without `node:path`, so the package runs in a browser.
// Inputs are repo-relative POSIX paths (`app/(mapples)/home.tsx`).

export function dirname(path: string): string {
  const at = path.lastIndexOf('/');
  return at === -1 ? '.' : at === 0 ? '/' : path.slice(0, at);
}

/** Resolve `.`/`..` segments; never escapes above an empty root. */
export function normalize(path: string): string {
  const out: string[] = [];
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      if (out.length > 0 && out[out.length - 1] !== '..') out.pop();
      else out.push('..');
    } else {
      out.push(segment);
    }
  }
  return (path.startsWith('/') ? '/' : '') + out.join('/');
}

export function join(...parts: string[]): string {
  return normalize(parts.filter((p) => p !== '').join('/'));
}

/** `relative('app', 'mapples/components/Card.tsx')` -> `../mapples/components/Card.tsx`. */
export function relative(from: string, to: string): string {
  const a = normalize(from)
    .split('/')
    .filter((s) => s !== '' && s !== '.');
  const b = normalize(to)
    .split('/')
    .filter((s) => s !== '' && s !== '.');
  let common = 0;
  while (common < a.length && common < b.length && a[common] === b[common])
    common += 1;
  const up = a.slice(common).map(() => '..');
  return [...up, ...b.slice(common)].join('/');
}
