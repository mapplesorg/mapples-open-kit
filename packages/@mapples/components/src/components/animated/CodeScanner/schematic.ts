import { RegisteredComponent } from '@mapples/types';

import CodeScanner from './index';

/** Registers {@link CodeScanner} under the `'CodeScanner'` type key. */
export const CodeScannerSchematic: RegisteredComponent = {
  type: 'CodeScanner',
  Component: CodeScanner,
};
