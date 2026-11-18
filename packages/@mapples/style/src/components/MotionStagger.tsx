import { FC, PropsWithChildren, useContext } from 'react';

import MotionStaggerContext from '../context/MotionStaggerContext';

/** Props for {@link MotionStagger}. */
export interface MotionStaggerProps {
  /** How much later the animations inside start, in milliseconds. */
  delay: number;
}

/**
 * Starts the animations of everything inside `delay` milliseconds later, on
 * top of any stagger already in effect. `styled()` wraps the children of an
 * element with `animationStagger` in one each; a list does the same for its
 * rows, which are not its React children.
 *
 * @example
 * ```tsx
 * {rows.map((row, index) => (
 *   <MotionStagger key={row.id} delay={index * 60}>
 *     <Row {...row} />
 *   </MotionStagger>
 * ))}
 * ```
 */
const MotionStagger: FC<PropsWithChildren<MotionStaggerProps>> = ({
  delay,
  children,
}) => {
  const inherited = useContext(MotionStaggerContext);

  return (
    <MotionStaggerContext.Provider value={inherited + delay}>
      {children}
    </MotionStaggerContext.Provider>
  );
};

export default MotionStagger;
