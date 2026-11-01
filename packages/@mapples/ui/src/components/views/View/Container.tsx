import { forwardRef } from 'react';

import View, { ViewProps } from './View';

/**
 * A generic layout container: a View under the name the visual editor gives
 * its full-size column wrapper. It takes every View prop.
 *
 * @example
 * ```tsx
 * <Container styled={{ style: { flex: 1, padding: 16 } }}>
 *   <Text text="Content inside the container" />
 * </Container>
 * ```
 *
 * @public
 */
const Container = forwardRef((props: ViewProps, ref) => {
  return <View ref={ref} {...props} />;
});
Container.displayName = 'Container';

export default Container;
