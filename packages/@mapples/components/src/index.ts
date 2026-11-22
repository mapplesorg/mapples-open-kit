/**
 * @fileoverview entry point for the @mapples/components package
 *
 * A neutral, theme-driven component library for Mapples apps: actions,
 * inputs, content, navigation, feedback and overlay components that paint
 * themselves from the project theme and register with the render pipeline
 * through the `Components` registry.
 *
 * @packageDocumentation
 * @public
 */

export * from './schematics';
export * from './animationControl';
export { default as MotionActionHandler } from './MotionActionHandler';
export * from './deviceActions';
export { default as DeviceActionHandler } from './DeviceActionHandler';
export * from './components/actions';
export * from './components/inputs';
export * from './components/content';
export * from './components/navigation';
export * from './components/feedback';
export * from './components/overlays';
export * from './components/animated';
