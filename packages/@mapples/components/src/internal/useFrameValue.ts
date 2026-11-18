import { useEffect, useRef, useState } from 'react';

import { useReduceMotion } from './animation';

export interface FrameValueOptions {
  /** Whether the value eases at all; `false` returns the target as it is. */
  animate: boolean;
  /** Where the first run starts from. */
  from: number;
  /** How long one run takes, in ms. */
  duration: number;
  /** How long the first run waits before it starts, in ms. */
  delay: number;
}

/** Ease-out cubic: fast at first, settling into the end. */
const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

/**
 * A number that eases to `target` in React state, one step per frame: from
 * `from` when the component appears (after `delay`), and from wherever it
 * stands whenever `target` changes. For values an SVG attribute takes
 * (a stroke offset): React Native's `Animated` on an SVG element passes
 * props the DOM rejects on web. With reduced motion, or `animate` off, the
 * value is the target.
 */
const useFrameValue = (
  target: number,
  { animate, from, duration, delay }: FrameValueOptions,
): number => {
  const reduceMotion = useReduceMotion();
  const still = !animate || reduceMotion || duration === 0;
  const [shown, setShown] = useState(still ? target : from);
  // Where the next run starts: the value on screen, even mid-run.
  const shownRef = useRef(shown);
  const firstRun = useRef(true);

  useEffect(() => {
    const start = shownRef.current;
    const show = (next: number) => {
      shownRef.current = next;
      setShown(next);
    };
    const wait = firstRun.current ? delay : 0;
    firstRun.current = false;

    if (still || start === target) {
      show(target);
      return undefined;
    }

    let frame = 0;
    let startedAt: number | null = null;
    const step = (now: number) => {
      startedAt ??= now + wait;
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
      show(start + (target - start) * easeOut(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
    // `delay` only shapes the first run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, still, target]);

  return still ? target : shown;
};

export default useFrameValue;
