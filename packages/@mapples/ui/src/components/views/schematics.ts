import {
  FlatListSchematic,
  GridFourColumnsSchematic,
  GridThreeColumnsSchematic,
  GridTwoColumnsSchematic,
} from './FlatList';
import { GradientBackgroundSchematic } from './GradientBackground';
import { ImageBackgroundViewSchematics } from './ImageBackgroundView';
import { SafeAreaViewSchematic } from './SafeAreaView';
import { HorizontalScrollView, ScrollViewSchematic } from './ScrollView';
import { ContainerSchematic, ViewSchematic } from './View';

/**
 * Complete registry of all view component schematics.
 *
 * Maps each component type string to its `RegisteredComponent` entry,
 * covering View, Container, SafeAreaView, ScrollView, HorizontalScrollView,
 * ImageBackgroundView, FlatList, and grid layout variants.
 *
 * @public
 */
export const ViewsSchematics = {
  [ViewSchematic.type]: ViewSchematic,
  [ContainerSchematic.type]: ContainerSchematic,
  [GradientBackgroundSchematic.type]: GradientBackgroundSchematic,
  [SafeAreaViewSchematic.type]: SafeAreaViewSchematic,
  [ScrollViewSchematic.type]: ScrollViewSchematic,
  [HorizontalScrollView.type]: HorizontalScrollView,
  [ImageBackgroundViewSchematics.type]: ImageBackgroundViewSchematics,
  [FlatListSchematic.type]: FlatListSchematic,
  [GridTwoColumnsSchematic.type]: GridTwoColumnsSchematic,
  [GridThreeColumnsSchematic.type]: GridThreeColumnsSchematic,
  [GridFourColumnsSchematic.type]: GridFourColumnsSchematic,
} as const;
