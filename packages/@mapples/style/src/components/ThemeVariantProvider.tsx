import { FC, PropsWithChildren, useMemo, useState } from 'react';

import {
  ThemeVariant,
  ThemeVariantContextProvider,
  ThemeVariantContextType,
} from '../context/ThemeVariantContext';

export interface ThemeVariantProviderProps {
  /** The variant to start on; `null` (the default) follows the project's configuration. */
  initialVariant?: ThemeVariant | null;
}

/**
 * Lets the app switch its theme while it runs — `light`, `dark`, or `auto`
 * to follow the device — on every platform, including web, where the
 * `Appearance` module cannot be set. `useTheme` reads the choice over the
 * configured `themeConfig.variant`; `useThemeVariant().setVariant` changes
 * it. Mount it above `StyleProvider`.
 */
const ThemeVariantProvider: FC<
  PropsWithChildren<ThemeVariantProviderProps>
> = ({ children, initialVariant = null }) => {
  const [variant, setVariant] = useState<ThemeVariant | null>(initialVariant);
  const value = useMemo<ThemeVariantContextType>(
    () => ({ variant, setVariant }),
    [variant],
  );
  return (
    <ThemeVariantContextProvider value={value}>
      {children}
    </ThemeVariantContextProvider>
  );
};

export default ThemeVariantProvider;
