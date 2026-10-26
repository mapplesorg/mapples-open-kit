import { FC, useMemo } from 'react';

import { useNavigationTheme } from '@mapples/style';

import { NavigationHooksContext } from './backend';
import { NavigatorBuildProvider, NavigatorView } from './buildNavigator';
import { buildNavigationModel } from './model';
import NavigationActionHandler from './NavigationActionHandler';
import type { ParamListBase } from './reactNavigation';
import { MapplesNavigationProps } from './types';
import useRefResolvers from './useRefResolvers';

/**
 * Renders a {@link NavigationDocument} with the host's React Navigation
 * (`backend`) and wires the `@mapples/action` store to navigation. Pass
 * `independent` when the host app already owns a navigation container
 * (expo-router / the Creator preview).
 */
const MapplesNavigation: FC<MapplesNavigationProps> = ({
  document,
  pages,
  fallback,
  chrome,
  backend,
  independent,
  navigationRef: externalRef,
}) => {
  const resolvers = useRefResolvers();
  // The backend's container does not read expo-router's theme context: hand it
  // the theme the surrounding NavigationThemeProvider resolved.
  const theme = useNavigationTheme();
  const model = useMemo(() => buildNavigationModel(document), [document]);
  const internalRef = useMemo(
    () => backend.createNavigationContainerRef<ParamListBase>(),
    [backend],
  );
  const navigationRef = externalRef ?? internalRef;

  if (!model) return null;

  const ctx = { document, pages, fallback, chrome, resolvers, backend };
  const { NavigationContainer, NavigationIndependentTree } = backend;

  const container = (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <NavigationHooksContext.Provider value={backend}>
        <NavigatorBuildProvider value={ctx}>
          <NavigatorView model={model} ctx={ctx} />
        </NavigatorBuildProvider>
      </NavigationHooksContext.Provider>
    </NavigationContainer>
  );

  const tree = independent ? (
    <NavigationIndependentTree>{container}</NavigationIndependentTree>
  ) : (
    container
  );

  return (
    <>
      {tree}
      <NavigationActionHandler
        navigationRef={navigationRef}
        document={document}
        actions={backend}
      />
    </>
  );
};

export default MapplesNavigation;
