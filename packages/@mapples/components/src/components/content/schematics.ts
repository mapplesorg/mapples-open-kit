import { RegisteredComponents } from '@mapples/types';

import { AccordionSchematic } from './Accordion/schematic';
import { AvatarSchematic } from './Avatar/schematic';
import { AvatarGroupSchematic } from './AvatarGroup/schematic';
import { BarChartSchematic } from './BarChart/schematic';
import { CalendarHeatmapSchematic } from './CalendarHeatmap/schematic';
import { CardSchematic } from './Card/schematic';
import { DateTileSchematic } from './DateTile/schematic';
import { DividerSchematic } from './Divider/schematic';
import { ImageCarouselSchematic } from './ImageCarousel/schematic';
import { LineChartSchematic } from './LineChart/schematic';
import { ListSchematic } from './List/schematic';
import { ListItemSchematic } from './ListItem/schematic';
import { MapViewSchematic } from './MapView/schematic';
import { MasonryGridSchematic } from './MasonryGrid/schematic';
import { MediaCardSchematic } from './MediaCard/schematic';
import { MessageBubbleSchematic } from './MessageBubble/schematic';
import { MiniPlayerSchematic } from './MiniPlayer/schematic';
import { PlaybackControlsSchematic } from './PlaybackControls/schematic';
import { ReorderableListSchematic } from './ReorderableList/schematic';
import { SectionHeaderSchematic } from './SectionHeader/schematic';
import { StatTileSchematic } from './StatTile/schematic';
import { TableSchematic } from './Table/schematic';
import { TicketCardSchematic } from './TicketCard/schematic';
import { TimelineSchematic } from './Timeline/schematic';
import { WaveformSeekBarSchematic } from './WaveformSeekBar/schematic';

/** Runtime registry of the content components. */
export const ContentSchematics: RegisteredComponents = {
  [CardSchematic.type]: CardSchematic,
  [MediaCardSchematic.type]: MediaCardSchematic,
  [ListItemSchematic.type]: ListItemSchematic,
  [ListSchematic.type]: ListSchematic,
  [ReorderableListSchematic.type]: ReorderableListSchematic,
  [SectionHeaderSchematic.type]: SectionHeaderSchematic,
  [DividerSchematic.type]: DividerSchematic,
  [AvatarSchematic.type]: AvatarSchematic,
  [AvatarGroupSchematic.type]: AvatarGroupSchematic,
  [AccordionSchematic.type]: AccordionSchematic,
  [StatTileSchematic.type]: StatTileSchematic,
  [TableSchematic.type]: TableSchematic,
  [TimelineSchematic.type]: TimelineSchematic,
  [BarChartSchematic.type]: BarChartSchematic,
  [LineChartSchematic.type]: LineChartSchematic,
  [CalendarHeatmapSchematic.type]: CalendarHeatmapSchematic,
  [DateTileSchematic.type]: DateTileSchematic,
  [MessageBubbleSchematic.type]: MessageBubbleSchematic,
  [ImageCarouselSchematic.type]: ImageCarouselSchematic,
  [MasonryGridSchematic.type]: MasonryGridSchematic,
  [PlaybackControlsSchematic.type]: PlaybackControlsSchematic,
  [WaveformSeekBarSchematic.type]: WaveformSeekBarSchematic,
  [MiniPlayerSchematic.type]: MiniPlayerSchematic,
  [MapViewSchematic.type]: MapViewSchematic,
  [TicketCardSchematic.type]: TicketCardSchematic,
};
