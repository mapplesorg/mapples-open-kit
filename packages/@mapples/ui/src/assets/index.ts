/**
 * @fileoverview SVG icon assets for UI components
 * 
 * This module exports all SVG icons used throughout the UI package,
 * organized by component type and functionality.
 * 
 * @public
 */

import Button from './Button.svg';
import Checkbox from './Checkbox.svg';
import Container from './Container.svg';
import FlatList from './FlatList.svg';
import Grid2 from './Grid2.svg';
import Grid3 from './Grid3.svg';
import Grid4 from './Grid4.svg';
import HorizontalScroll from './HorizontalScroll.svg';
import Image from './Image.svg';
import ImageBackground from './ImageBackground.svg';
import Inputs from './Inputs.svg';
import Media from './Media.svg';
import RadioButton from './RadioButton.svg';
import Text from './Text.svg';
import TextInput from './TextInput.svg';
import Typography from './Typography.svg';
import VerticalScroll from './VerticalScroll.svg';
import Video from './Video.svg';
import VideoBackground from './VideoBackground.svg';
import View from './View.svg';
import Views from './Views.svg';

/**
 * Collection of SVG icons for UI components.
 * 
 * Each icon is a React component that can be used in visual editors
 * and component libraries to represent different UI elements.
 * 
 * @public
 */
const Icon = {
  Media,
  Views,
  Typography,
  Inputs,
  Container,
  ImageBackground,
  VideoBackground,
  View,
  HorizontalScroll,
  VerticalScroll,
  Text,
  Video,
  Image,
  Button,
  TextInput,
  RadioButton,
  Checkbox,
  FlatList,
  Grid2,
  Grid3,
  Grid4,
};

/**
 * Type representing all available icon names.
 * 
 * @public
 */
export type IconType = keyof typeof Icon;

export default Icon;
