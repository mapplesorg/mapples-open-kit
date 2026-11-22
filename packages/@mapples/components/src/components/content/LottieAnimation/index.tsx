/**
 * LottieAnimation picks its platform file at bundle time: Metro resolves
 * `./LottieAnimation` to `LottieAnimation.native.tsx` (lottie-react-native)
 * on iOS/Android and to `LottieAnimation.tsx` (@lottiefiles/dotlottie-react)
 * on web, so neither bundle imports the other platform's player. TypeScript
 * resolves the plain `LottieAnimation.tsx`; both share the props in
 * `types.ts`.
 */
export { default } from './LottieAnimation';
