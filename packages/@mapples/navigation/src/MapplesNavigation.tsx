import { FC, useMemo } from 'react';

import { NavigatorView } from './buildNavigator';
import { buildNavigationModel } from './model';
import NavigationActionHandler from './NavigationActionHandler';
import { MapplesNavigationProps, MapplesNavigationRef } from './types';
import useRefResolvers from './useRefResolvers';
import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigationIndependentTree,
} from './vendor';

/**
 * Renders a {@link NavigationDocument} with React Navigation and wires the
 * `@mapples/action` store to navigation. Pass `independent` when the host app
 * already owns a navigation container (expo-router / the Creator preview).
 */
const MapplesNavigation: FC<MapplesNavigationProps> = ({
  document,
  pages,
  fallback,
  chrome,
  independent,
  navigationRef: externalRef,
}) => {
  const resolvers = useRefResolvers();
  const model = useMemo(() => buildNavigationModel(document), [document]);
  const internalRef = useMemo(() => createNavigationContainerRef(), []);
  const navigationRef = externalRef ?? internalRef;

  if (!model) return null;
  if (!NavigationContainer || !NavigationIndependentTree) {
    throw new Error(
      'MapplesNavigation needs the NavigationContainer and NavigationIndependentTree that expo-router 58 no longer vendors. ' +
        'Exported apps navigate through expo-router routes (@mapples/app) instead.',
    );
  }

  const ctx = { document, pages, fallback, chrome, resolvers };

  const container = (
    <NavigationContainer ref={navigationRef as typeof internalRef}>
      <NavigatorView model={model} ctx={ctx} />
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
        navigationRef={navigationRef as MapplesNavigationRef}
        document={document}
      />
    </>
  );
};

export default MapplesNavigation;
