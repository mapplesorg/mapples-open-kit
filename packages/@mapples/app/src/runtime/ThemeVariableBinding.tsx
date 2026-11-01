import { FC, useEffect } from 'react';

import { useDataState } from '@mapples/state';
import { ThemeVariant, useThemeVariant } from '@mapples/style';

const VARIANTS: ReadonlySet<string> = new Set(['light', 'dark', 'auto']);

interface ThemeVariableBindingProps {
  /** The state path the theme follows (`vars.theme`). */
  path: string;
}

/**
 * Binds the app's theme to a state path: `light`, `dark` or `auto` there
 * switches the theme, on every platform, and a persisted variable keeps the
 * choice across launches. An empty value follows the project's configured
 * variant; any other value is reported and ignored.
 */
const ThemeVariableBinding: FC<ThemeVariableBindingProps> = ({ path }) => {
  const { getValue } = useDataState();
  const variant = useThemeVariant();
  const value = getValue({ key: path, active: true }, null);
  const setVariant = variant?.setVariant;

  useEffect(() => {
    if (!setVariant) {
      throw new Error(
        '[@mapples/app] themeVariable needs a ThemeVariantProvider above the runtime',
      );
    }
    if (value === null || value === undefined || value === '') {
      setVariant(null);
      return;
    }
    if (typeof value !== 'string' || !VARIANTS.has(value)) {
      console.error(
        `[@mapples/app] ${path} is ${JSON.stringify(value)}; the theme takes "light", "dark" or "auto" and keeps its configured variant`,
      );
      setVariant(null);
      return;
    }
    setVariant(value as ThemeVariant);
  }, [path, setVariant, value]);

  return null;
};

export default ThemeVariableBinding;
