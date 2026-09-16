export * from './types.js';
export { extract } from './extract.js';
export { patch } from './patch.js';
export {
  printChild,
  printElement,
  printNode,
  printTree,
  visibilityGuard,
  printValue,
  printAttr,
  type ExprAt,
  type PrintOptions,
} from './print.js';
export { normalizeJsxText } from './parse.js';
export { deepEqual } from './equal.js';
export { upsertImports, type ImportNeed } from './imports.js';
export { extractExportedObjects, type ExportedObjects } from './exports.js';
export {
  codemodAdopt,
  scanComponents,
  type AdoptedElement,
  type CodemodOptions,
  type CodemodResult,
  type ScanInfo,
} from './codemod.js';
export {
  negateCondition,
  PROPS_SCOPE,
  propOfCondition,
  propStateForCondition,
  propTestCode,
  type PropState,
} from './propConditions.js';
export {
  extractPropsSignature,
  type PropsBindings,
  type PropsParam,
  type PropsParamKind,
  type PropsSignature,
} from './signature.js';
export { findSyntaxErrors, type SyntaxProblem } from './syntax.js';
