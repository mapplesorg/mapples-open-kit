/** The kinds of code a `CodeScanner` can read. */
export const CODE_SCANNER_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'pdf417',
  'aztec',
  'datamatrix',
] as const;

export type CodeScannerType = (typeof CODE_SCANNER_TYPES)[number];

/** How long the scanner waits before reporting the next code, in ms. */
export const CODE_SCANNER_INTERVAL = 1500;

/** What the stand-in scanner reports when it is pressed, unless `sampleValue` says otherwise. */
export const CODE_SCANNER_SAMPLE = 'SAMPLE-CODE';

/** Props shared by the camera scanner and its stand-in. */
export interface CodeScannerBaseProps {
  /** Whether it is looking for codes. Defaults to `true`; off, the camera stops. */
  active?: boolean;
  /** Turns the phone's light on (the flash toggle of a scan screen). */
  torch?: boolean;
  /** The kinds of code to read. Defaults to `['qr']`. */
  codeTypes?: CodeScannerType[];
  /** Milliseconds before the next code is reported. Defaults to `1500`. */
  scanInterval?: number;
  /**
   * What the stand-in reports when pressed: where there is no camera (the
   * Creator's canvas and Play on the web) the scanner is a dark surface,
   * and a press on it stands for a successful scan with this value.
   */
  sampleValue?: string;
  /** Fires with the text of a code and its kind (`qr`, `ean13`, …). */
  onScan?: (value: string, type: string) => void;
  /** Fires when the person refuses the camera (the screen can offer a typed code instead). */
  onPermissionDenied?: () => void;
}

/** Throws on props a scanner cannot work with. */
export const assertCodeScannerProps = ({
  codeTypes,
  scanInterval,
}: Pick<CodeScannerBaseProps, 'codeTypes' | 'scanInterval'>): void => {
  if (codeTypes !== undefined) {
    const unknown = Array.isArray(codeTypes)
      ? codeTypes.filter(
          (type) => !(CODE_SCANNER_TYPES as readonly string[]).includes(type),
        )
      : [String(codeTypes)];
    if (!Array.isArray(codeTypes) || codeTypes.length === 0 || unknown.length) {
      throw new Error(
        `CodeScanner: codeTypes must be a list of ${CODE_SCANNER_TYPES.join(', ')}${unknown.length ? ` (got ${unknown.join(', ')})` : ''}`,
      );
    }
  }
  if (scanInterval !== undefined && !(scanInterval >= 0)) {
    throw new Error(
      `CodeScanner: scanInterval (${scanInterval}) must be 0 or more`,
    );
  }
};
