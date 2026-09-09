/**
 * `jsbarcode` is an **optional peer dependency** of `@mapples/ui` (Project
 * settings → Packages → "Barcode"): resolved lazily so apps without a barcode
 * element don't have to install it. When absent, encoding throws.
 */
let barcodes: Record<string, unknown> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  barcodes = require('jsbarcode/src/barcodes').default;
} catch {
  barcodes = null;
}

const requireBarcodes = (): Record<string, unknown> => {
  if (!barcodes) {
    throw new Error(
      'BarCode needs jsbarcode: enable the "Barcode" package in Project ' +
        'settings → Packages.',
    );
  }
  return barcodes;
};

/**
 * Supported barcode formats
 */
export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF14'
  | 'MSI'
  | 'pharmacode'
  | 'codabar';

/**
 * Options for barcode encoding
 */
export interface BarcodeEncodeOptions {
  [key: string]: unknown;
}

/**
 * Encoded barcode segment (used for EAN13, EAN8, UPC)
 */
export interface EncodedBarcodeSegment {
  /** Binary string representation where '1' = bar, '0' = space */
  data: string;
  /** Optional text for this segment */
  text?: string;
  /** Optional segment-specific options */
  options?: {
    height?: number | null;
    [key: string]: unknown;
  };
}

/**
 * Encoded barcode data structure
 * Can be a single object (CODE128, CODE39) or array of segments (EAN13, EAN8, UPC)
 */
export type EncodedBarcode =
  | {
      /** The original text value */
      text: string;
      /** Binary string representation where '1' = bar, '0' = space */
      data: string;
    }
  | EncodedBarcodeSegment[];

/**
 * Maps format names to jsbarcode format names
 * Some formats might have different names in jsbarcode
 */
const FORMAT_MAP: Record<BarcodeFormat, string> = {
  CODE128: 'CODE128',
  CODE39: 'CODE39',
  EAN13: 'EAN13',
  EAN8: 'EAN8',
  UPC: 'UPC', // jsbarcode uses 'UPC' not 'UPC-A'
  ITF14: 'ITF14', // jsbarcode uses 'ITF14' not 'ITF'
  MSI: 'MSI',
  pharmacode: 'pharmacode',
  codabar: 'codabar',
};

/**
 * Tries to find the correct format name in jsbarcode
 * Handles case variations and common aliases
 */
const findFormat = (
  format: BarcodeFormat,
  barcodes: Record<string, unknown>,
): string | null => {
  const mappedFormat = FORMAT_MAP[format];
  if (barcodes[mappedFormat]) {
    return mappedFormat;
  }

  const formatLower = format.toLowerCase();
  for (const key in barcodes) {
    if (key.toLowerCase() === formatLower) {
      return key;
    }
  }

  // Try common aliases
  const aliases: Record<string, string[]> = {
    UPC: ['UPC-A', 'UPCA'],
    ITF14: ['ITF', 'ITF-14'],
    EAN13: ['EAN-13', 'EAN_13'],
    EAN8: ['EAN-8', 'EAN_8'],
  };

  const formatAliases = aliases[format];
  if (formatAliases) {
    for (const alias of formatAliases) {
      if (barcodes[alias]) {
        return alias;
      }
    }
  }

  return null;
};

/**
 * Barcode encoder class that wraps jsbarcode functionality
 */
class BarcodeEncoder {
  /**
   * Encodes text into a barcode binary pattern
   *
   * @param text - The text value to encode
   * @param format - The barcode format to use
   * @param options - Additional encoding options
   * @returns Encoded barcode data with text and binary pattern (or array of segments for EAN/UPC)
   * @throws Error if text is invalid, format is not supported, or encoding fails
   */
  encode(
    text: string,
    format: BarcodeFormat,
    options: BarcodeEncodeOptions = {},
  ): EncodedBarcode {
    const barcodes = requireBarcodes();
    // Find the correct format name in jsbarcode
    const jsbarcodeFormat = findFormat(format, barcodes);

    if (!jsbarcodeFormat) {
      const availableFormats = Object.keys(barcodes).join(', ');
      throw new Error(
        `Barcode format "${format}" not found. Available formats: ${availableFormats}`,
      );
    }

    const Encoder = barcodes[jsbarcodeFormat] as new (
      text: string,
      options: BarcodeEncodeOptions,
    ) => {
      valid(): boolean;
      encode():
        | { text?: unknown; data?: unknown }
        | ({ data?: unknown } | null)[];
    };

    if (text.length === 0) {
      throw new Error('Barcode value must be a non-empty string');
    }

    let encoder;

    try {
      encoder = new Encoder(text, options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid barcode format: ${errorMessage}`);
    }

    if (!encoder.valid()) {
      throw new Error('Invalid barcode for selected format.');
    }

    const encoded = encoder.encode();

    // Handle array response (EAN13, EAN8, UPC)
    if (Array.isArray(encoded)) {
      // Validate array structure
      if (
        !encoded.every(
          (segment) =>
            segment &&
            typeof segment === 'object' &&
            typeof segment.data === 'string',
        )
      ) {
        throw new Error('Invalid barcode data structure');
      }
      return encoded as EncodedBarcodeSegment[];
    }

    // Handle single object response (CODE128, CODE39, etc.)
    if (
      encoded &&
      typeof encoded === 'object' &&
      typeof encoded.data === 'string'
    ) {
      return encoded as { text: string; data: string };
    }

    throw new Error('Failed to encode barcode data');
  }

  /**
   * Gets list of available barcode formats
   */
  getAvailableFormats(): string[] {
    return Object.keys(requireBarcodes());
  }
}

export default new BarcodeEncoder();
