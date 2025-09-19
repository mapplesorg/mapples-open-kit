type Breakpoint = 'mobile' | 'tablet' | 'desktop' | string;

export interface BreakpointConfig {
  min: number;
  max: number;
}

export interface ResponsiveConfig {
  default: Breakpoint;
  breakpoints: Record<Breakpoint, BreakpointConfig>;
}
