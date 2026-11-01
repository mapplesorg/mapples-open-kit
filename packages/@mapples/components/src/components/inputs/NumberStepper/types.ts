/** Heights of the stepper pill (from the shared control sizes). */
export const NUMBER_STEPPER_SIZES = ['sm', 'md', 'lg'] as const;
export type NumberStepperSize = (typeof NUMBER_STEPPER_SIZES)[number];

/** Layouts: one shared pill track, or two separate buttons around the value. */
export const NUMBER_STEPPER_LAYOUTS = ['pill', 'split'] as const;
export type NumberStepperLayout = (typeof NUMBER_STEPPER_LAYOUTS)[number];
