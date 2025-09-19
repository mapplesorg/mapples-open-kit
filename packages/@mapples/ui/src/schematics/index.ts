/**
 * @fileoverview Main schematics configuration for UI components
 * 
 * This module exports the complete registry of UI components and their organizational groups
 * for use in visual editors and component libraries.
 * 
 * @public
 */

import {
  RegisteredComponents,
  RegisteredComponentsGroup,
} from '@mapples/types';

import Icon from '../assets';
import { InputsSchematics } from '../components/inputs';
import { MediaSchematics } from '../components/media';
import { TypographySchematics } from '../components/typography';
import { ViewsSchematics } from '../components/views';

/**
 * Complete registry of all available UI components.
 * 
 * This object contains all component schematics organized by component type,
 * including Views, Typography, Inputs, and Media components.
 * 
 * @public
 */
export const Components: RegisteredComponents = {
  ...ViewsSchematics,
  ...TypographySchematics,
  ...InputsSchematics,
  ...MediaSchematics,
};

/**
 * Component groups for organizing UI components in visual editors.
 * 
 * Each group represents a category of related components with an associated
 * icon and label for display purposes.
 * 
 * @public
 */
export const Groups: RegisteredComponentsGroup[] = [
  {
    id: 'view-group',
    label: 'View',
    Icon: Icon.Views,
  },
  {
    id: 'typography-group',
    label: 'Typography',
    Icon: Icon.Typography,
  },
  {
    id: 'media-group',
    label: 'Media',
    Icon: Icon.Media,
  },
  {
    id: 'input-group',
    label: 'Inputs',
    Icon: Icon.Inputs,
  },
];
