/** Turns free text into a request name (`API_REQUEST_NAME_PATTERN`). */
export const toRequestName = (text: string): string => {
  const words = text.match(/[A-Za-z0-9]+/g) ?? [];
  const name = words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
  if (name === '') return 'request';
  return /^[0-9]/.test(name) ? `_${name}` : name;
};

/** A name from a method + path: `GET /users/{id}` → `getUsersId`. */
export const nameFromRoute = (method: string, path: string): string =>
  toRequestName(`${method.toLowerCase()} ${path}`);

/** Makes `name` unique against `taken` (`users`, `users2`, …) and claims it. */
export const uniqueName = (name: string, taken: Set<string>): string => {
  let candidate = name;
  for (let suffix = 2; taken.has(candidate); suffix += 1) {
    candidate = `${name}${suffix}`;
  }
  taken.add(candidate);
  return candidate;
};
