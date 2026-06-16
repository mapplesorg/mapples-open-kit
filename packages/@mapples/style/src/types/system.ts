/**
 * Utility type that makes all properties of an object type optional recursively.
 * Useful for creating partial configurations where nested objects are also optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * React Navigation theme colors interface.
 * Defines the color properties used by React Navigation components.
 */
export interface NativeThemeColors {
  /** Primary color for navigation elements */
  primary: string;
  /** Background color for navigation screens */
  background: string;
  /** Card background color */
  card: string;
  /** Text color for navigation elements */
  text: string;
  /** Border color for navigation elements */
  border: string;
  /** Notification badge color */
  notification: string;
}
