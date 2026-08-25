/**
 * Workspace-wide ambient declarations.
 *
 * Every package resolves its siblings through the `paths` mappings in
 * `tsconfig.base.json`, so a type-check of one package pulls another's `src`
 * into the same program. A per-package copy of this declaration is invisible
 * to that program — it has to live in one place every tsconfig includes.
 */

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}
