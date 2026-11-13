/**
 * RiveAnimation picks its platform file at bundle time: Metro resolves
 * `./RiveAnimation` to `RiveAnimation.native.tsx` (@rive-app/react-native)
 * on iOS/Android and to `RiveAnimation.tsx` (@rive-app/canvas) on web, so
 * neither bundle imports the other platform's runtime. TypeScript resolves
 * the plain `RiveAnimation.tsx`; both share the props in `types.ts`.
 */
export { default } from './RiveAnimation';
