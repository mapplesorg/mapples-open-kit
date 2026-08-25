import { FC, PropsWithChildren, useEffect } from 'react';

import { useVariablesState } from './context';
import { VariablesScopeProps } from './types';

/**
 * Mounts a page's page-scoped variables into the surrounding
 * `VariablesProvider` for as long as this subtree is on screen. Unmounting
 * discards the page's runtime values (they reseed from `initialValue` on
 * the next visit) — the page-scope lifecycle, via React lifecycle.
 *
 * Renders children directly; the values live in the root provider so a
 * single `StateActionHandler` can write every mounted variable.
 */
const VariablesScope: FC<PropsWithChildren<VariablesScopeProps>> = ({
  children,
  pageUuid,
}) => {
  const variablesState = useVariablesState();
  const registerScope = variablesState?.registerScope;
  const unregisterScope = variablesState?.unregisterScope;

  useEffect(() => {
    if (!registerScope || !unregisterScope) return;
    registerScope(pageUuid);
    return () => unregisterScope(pageUuid);
  }, [pageUuid, registerScope, unregisterScope]);

  return <>{children}</>;
};

export default VariablesScope;
