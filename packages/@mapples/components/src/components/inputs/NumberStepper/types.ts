/** Heights of the stepper pill (from the shared control sizes). */
export const NUMBER_STEPPER_SIZES = ['sm', 'md', 'lg'] as const;
export type NumberStepperSize = (typeof NUMBER_STEPPER_SIZES)[number];
