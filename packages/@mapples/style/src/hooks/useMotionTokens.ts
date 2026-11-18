import { MotionTokens } from '../types';

import useStyle from './useStyle';

/**
 * The project's easing tokens and keyframe sets where the component renders:
 * `themeConfig.motion` of the nearest `StyleProvider` (`undefined` when the
 * project defines none, where only the presets and the named timing
 * functions resolve).
 */
const useMotionTokens = (): MotionTokens | undefined =>
  useStyle().themeConfig.motion;

export default useMotionTokens;
