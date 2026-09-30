import { ElementType, forwardRef, useEffect } from 'react';

import { DataProps } from '@mapples/types';

import { useElementBindings } from '../hooks/useElementBindings';
import { ActionPropsMap, RefPropsMap } from '../types';

/**
 * Props of {@link MapplesElement}: the element it renders and the Creator
 * sidecars of a synced file, as the `$data` / `$actions` / `$refs` JSX
 * attributes carry them. Every other prop is the element's own.
 */
export interface MapplesElementProps {
  /** The component the element renders (`Button`, a Creator component, …). */
  $as: ElementType;
  /** Data bindings per prop — the canvas node's `dataProps`. */
  $data?: DataProps;
  /** Actions per event — the canvas node's `actionProps`. */
  $actions?: ActionPropsMap;
  /** Asset references per prop — the canvas node's `refProps`. */
  $refs?: RefPropsMap;
  [prop: string]: unknown;
}

/** A readable name for the wrapped component, for diagnostics. */
const elementName = (As: ElementType): string =>
  typeof As === 'string'
    ? As
    : ((As as { displayName?: string; name?: string }).displayName ??
      (As as { name?: string }).name ??
      'element');

/**
 * An element of a synced page or component file that carries Creator
 * behaviour. `babel-plugin-mapples-sid` rewrites
 * `<Button $data={…} $actions={…} label="Go" />` into
 * `<MapplesElement $as={Button} $data={…} $actions={…} label="Go" />` at
 * build time, so the file itself keeps the attributes the two-way sync reads
 * and writes, while the running app resolves them exactly as the canvas does
 * (`useElementBindings`): bound values over the element's own props, a falsy
 * `_visible` hides it, each action emits onto the app's action bus.
 *
 * An authored action replaces a code handler for the same event — the
 * canvas never runs the code one — and says so once, so a duplicate
 * `onPress` (an old habit of writing `router.push` next to a navigate
 * action) is visible rather than silently doubled.
 */
const MapplesElement = forwardRef<unknown, MapplesElementProps>(
  (elementProps, ref) => {
    // `forwardRef` strips the named members of an index-signature props
    // type; read them through the declared shape.
    const {
      $as: As,
      $data,
      $actions,
      $refs,
      ...props
    } = elementProps as MapplesElementProps;
    const { hidden, dataProps, refProps, actionHandlers } = useElementBindings(
      $data,
      $actions,
      $refs,
    );

    const sid = props.$sid;
    useEffect(() => {
      const shadowed = Object.keys($actions ?? {}).filter(
        (event) => typeof props[event] === 'function',
      );
      if (shadowed.length === 0) return;
      console.warn(
        `[mapples] <${elementName(As)}${sid ? ` $sid="${String(sid)}"` : ''}>: the Creator action on ${shadowed.join(', ')} ` +
          'replaces the handler written in code — remove one of them.',
      );
      // Once per mount: the warning is about the file, not about renders.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (hidden) return null;

    return (
      <As
        ref={ref}
        {...props}
        {...dataProps}
        {...refProps}
        {...actionHandlers}
      />
    );
  },
);
MapplesElement.displayName = 'MapplesElement';

export default MapplesElement;
