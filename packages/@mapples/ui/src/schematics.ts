/**
 * @fileoverview Main schematics configuration for UI components
 *
 * This module exports the complete registry of UI components and their organizational groups
 * for use in visual editors and component libraries.
 *
 * @public
 */

import { InputsSchematics } from './components/inputs';
import { MediaSchematics } from './components/media';
import { TypographySchematics } from './components/typography';
import { ViewsSchematics } from './components/views';

/**
 * Complete registry of all available UI components.
 *
 * This object contains all component schematics organized by component type,
 * including Views, Typography, Inputs, and Media components.
 *
 * @public
 */
export const Components = {
  ...ViewsSchematics,
  ...TypographySchematics,
  ...InputsSchematics,
  ...MediaSchematics,
} as const;
