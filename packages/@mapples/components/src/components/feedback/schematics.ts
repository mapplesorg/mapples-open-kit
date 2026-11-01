import { RegisteredComponents } from '@mapples/types';

import { ActivityRingsSchematic } from './ActivityRings/schematic';
import { BadgeSchematic } from './Badge/schematic';
import { BannerSchematic } from './Banner/schematic';
import { BreathingGuideSchematic } from './BreathingGuide/schematic';
import { CountdownTimerSchematic } from './CountdownTimer/schematic';
import { EmptyStateSchematic } from './EmptyState/schematic';
import { ProgressBarSchematic } from './ProgressBar/schematic';
import { ProgressCircleSchematic } from './ProgressCircle/schematic';
import { SkeletonSchematic } from './Skeleton/schematic';
import { SnackbarSchematic } from './Snackbar/schematic';
import { SpinnerSchematic } from './Spinner/schematic';

/** Runtime registry of the feedback components. */
export const FeedbackSchematics: RegisteredComponents = {
  [BadgeSchematic.type]: BadgeSchematic,
  [ProgressBarSchematic.type]: ProgressBarSchematic,
  [ProgressCircleSchematic.type]: ProgressCircleSchematic,
  [CountdownTimerSchematic.type]: CountdownTimerSchematic,
  [ActivityRingsSchematic.type]: ActivityRingsSchematic,
  [BreathingGuideSchematic.type]: BreathingGuideSchematic,
  [SpinnerSchematic.type]: SpinnerSchematic,
  [SkeletonSchematic.type]: SkeletonSchematic,
  [BannerSchematic.type]: BannerSchematic,
  [SnackbarSchematic.type]: SnackbarSchematic,
  [EmptyStateSchematic.type]: EmptyStateSchematic,
};
