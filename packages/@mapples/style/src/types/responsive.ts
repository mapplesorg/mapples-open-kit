/** Breakpoint identifier type - can be predefined or custom string */
type Breakpoint = 'mobile' | 'tablet' | 'desktop' | string;

/**
 * Configuration for a single breakpoint with min and max width values.
 * Defines the range of screen widths that trigger this breakpoint.
 */
export interface BreakpointConfig {
  /** Minimum width (inclusive) for this breakpoint */
  min: number;
  /** Maximum width (inclusive) for this breakpoint */
  max: number;
}

/**
 * Responsive configuration for breakpoint management.
 * Defines available breakpoints and their width ranges.
 */
export interface ResponsiveConfig {
  /** Default breakpoint to use when no breakpoint matches */
  default: Breakpoint;
  /** Map of breakpoint names to their configuration */
  breakpoints: Record<Breakpoint, BreakpointConfig>;
}
