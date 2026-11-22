import { ElementType, forwardRef, useEffect } from 'react';

import { useDataState } from '@mapples/state';
import { DataProps } from '@mapples/types';

import { useElementBindings } from '../hooks/useElementBindings';
import { ActionPropsMap, RefPropsMap, StateCondition } from '../types';
import { applyRefProps } from '../utils/applyRefProps';
import { applyStateVariants } from '../utils/applyStateVariants';

import ElementErrorBoundary from './ElementErrorBoundary';

/**
 * Props of {@link MapplesElement}: the element it renders and the Creator
 * sidecars of a synced file, as the `$data` / `$actions` / `$refs` /
 * `$states` JSX attributes carry them. Every other prop is the element's own.
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
  /**
   * The data states the element's `key::state` style variants render under,
   * by state key — the document's `state` entries those variants name.
   */
  $states?: Record<string, Pick<StateCondition, 'condition'>>;
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
 * Style variants resolve here too (`applyStateVariants`): `style::<key>`
 * applies while the condition `$states` gives that key holds on the app's
 * data state, and `style::$pressed` becomes the selector values the style
 * runtime switches on. The plugin wraps an element with such a variant even
 * when it carries no other sidecar.
 *
 * An authored action replaces a code handler for the same event — the
 * canvas never runs the code one — and says so once, so a duplicate
 * `onPress` (an old habit of writing `router.push` next to a navigate
 * action) is visible rather than silently doubled.
 *
 * A render error of the element stays its own: it is reported and the
 * element left out, so one bound chart handed a value it refuses does not
 * end the app.
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
      $states,
      ...props
    } = elementProps as MapplesElementProps;
    const { getConditionResult } = useDataState();
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

    // A variant under a data state applies while the condition `$states`
    // gives it holds; an interaction state (`style::$pressed`) is left to the
    // touch, as the selector values the style runtime switches on.
    const styled = props.styled;
    const elementPropsWithStates =
      typeof styled === 'object' && styled !== null && !Array.isArray(styled)
        ? {
            ...props,
            styled: applyStateVariants(
              styled as Record<string, unknown>,
              (state) => {
                const declared = $states?.[state];
                return declared !== undefined
                  ? getConditionResult(declared.condition)
                  : false;
              },
            ),
          }
        : props;

    return (
      <ElementErrorBoundary
        label={`<${elementName(As)}${sid ? ` $sid="${String(sid)}"` : ''}>`}
      >
        <As
          ref={ref}
          {...applyRefProps(
            { ...elementPropsWithStates, ...dataProps },
            refProps,
          )}
          {...actionHandlers}
        />
      </ElementErrorBoundary>
    );
  },
);
MapplesElement.displayName = 'MapplesElement';

export default MapplesElement;
