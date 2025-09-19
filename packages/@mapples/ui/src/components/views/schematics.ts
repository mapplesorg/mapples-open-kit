import { RegisteredComponents } from '@mapples/types';

import {
  FlatListSchematic,
  GridFourColumnsSchematic,
  GridThreeColumnsSchematic,
  GridTwoColumnsSchematic,
} from './FlatList';
import { ImageBackgroundViewSchematics } from './ImageBackgroundView';
import { SafeAreaViewSchematic } from './SafeAreaView';
import { HorizontalScrollView, ScrollViewSchematic } from './ScrollView';
import { ContainerSchematic, ViewSchematic } from './View';

export const ViewsSchematics: RegisteredComponents = {
  [ViewSchematic.type]: ViewSchematic,
  [ContainerSchematic.type]: ContainerSchematic,
  [SafeAreaViewSchematic.type]: SafeAreaViewSchematic,
  [ScrollViewSchematic.type]: ScrollViewSchematic,
  [HorizontalScrollView.type]: HorizontalScrollView,
  [ImageBackgroundViewSchematics.type]: ImageBackgroundViewSchematics,
  [FlatListSchematic.type]: FlatListSchematic,
  [GridTwoColumnsSchematic.type]: GridTwoColumnsSchematic,
  [GridThreeColumnsSchematic.type]: GridThreeColumnsSchematic,
  [GridFourColumnsSchematic.type]: GridFourColumnsSchematic,
};
