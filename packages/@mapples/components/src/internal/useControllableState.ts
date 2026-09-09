import { useCallback, useState } from 'react';

export interface ControllableStateOptions<T> {
  /** The controlled value; `undefined` leaves the component uncontrolled. */
  value: T | undefined;
  /** Initial value while uncontrolled. */
  defaultValue: T;
  /** Fires with the next value — the new value is always the first argument. */
  onChange?: (next: T) => void;
}

/**
 * Controlled/uncontrolled state in one hook. Controlled while `value` is
 * defined (the parent owns it and `onChange` reports the intent); otherwise
 * the hook keeps the value itself. Either way `onChange(next)` fires, so a
 * canvas two-way binding sees the new value as handler argument 0.
 */
const useControllableState = <T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): [T, (next: T) => void] => {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [current, setValue];
};

export default useControllableState;
