import {
  ComponentType,
  ForwardedRef,
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
} from 'react';

import { FlatList, FlatListProps, ListRenderItem } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import useMotionEnabled from '../hooks/useMotionEnabled';
import useStyledProps from '../hooks/useStyledProps';
import { StyledProps } from '../types';

/** How long a row takes to appear, leave or move when the data changes, in ms. */
export const LIST_CHANGE_DURATION = 250;

const ROW_LAYOUT = LinearTransition.duration(LIST_CHANGE_DURATION);
const ROW_ENTERING = FadeIn.duration(LIST_CHANGE_DURATION);
const ROW_EXITING = FadeOut.duration(LIST_CHANGE_DURATION);

/**
 * Props for the StyledFlatList component.
 */
export type StyledFlatListProps<T extends object> = FlatListProps<T> & {
  /** Styled props for advanced styling with theme and responsive support */
  styled?: Partial<StyledProps<FlatListProps<T>>>;
  /**
   * Animates the rows when the data changes: a new row fades in, a removed
   * one fades out and the rows after it slide to their new place. The first
   * render is not animated. Rows are matched by key, so the items need an
   * `id` or a `key` (or the list a `keyExtractor`): with index keys the last
   * row is the one that leaves. Single-column lists only (`numColumns`
   * above 1 throws); off with the OS's reduced-motion setting.
   */
  animateChanges?: boolean;
};

/**
 * Styled FlatList component that supports theme and responsive styling.
 * This component extends the standard FlatList with styled props support.
 *
 * @param props - The component props
 * @param props.styled - Styled props for advanced styling
 * @param props.data - Array of data items to render
 * @param props.renderItem - Function to render each item
 *
 * @example
 * ```tsx
 * import { StyledFlatList } from '@mapples/style';
 *
 * const MyComponent = () => {
 *   const data = [{ id: 1, title: 'Item 1' }, { id: 2, title: 'Item 2' }];
 *
 *   return (
 *     <StyledFlatList
 *       data={data}
 *       renderItem={({ item }) => <Text>{item.title}</Text>}
 *       styled={{
 *         contentContainerStyle: {
 *           backgroundColor: 'theme.colors.background',
 *           padding: 'sizing.md'
 *         }
 *       }}
 *     />
 *   );
 * };
 * ```
 */
const StyledFlatListComponent = forwardRef(
  <T extends object>(
    { styled, animateChanges = false, ...props }: StyledFlatListProps<T>,
    ref: ForwardedRef<FlatList<T>>,
  ) => {
    const styledProps = useStyledProps(styled);
    const motionEnabled = useMotionEnabled();
    const reducedMotion = useReducedMotion() || !motionEnabled;
    const { renderItem } = props;

    // Each row in a view of its own that fades in and out; Reanimated's
    // list moves the cells around it.
    const renderAnimatedItem = useCallback<ListRenderItem<T>>(
      (info) => (
        <Animated.View entering={ROW_ENTERING} exiting={ROW_EXITING}>
          {renderItem?.(info)}
        </Animated.View>
      ),
      [renderItem],
    );

    if (!animateChanges || reducedMotion) {
      return <FlatList ref={ref} {...props} {...styledProps} />;
    }

    if ((props.numColumns ?? 1) > 1) {
      throw new Error(
        'StyledFlatList: animateChanges works in a single-column list only (numColumns is above 1)',
      );
    }

    // Reanimated types its list for animated props and shared values; the
    // props given here are the plain `FlatList` ones.
    const AnimatedList = Animated.FlatList as unknown as ComponentType<
      FlatListProps<T> & {
        ref?: Ref<FlatList<T>>;
        itemLayoutAnimation: typeof ROW_LAYOUT;
        skipEnteringExitingAnimations: boolean;
      }
    >;

    return (
      <AnimatedList
        ref={ref}
        {...props}
        {...styledProps}
        renderItem={renderAnimatedItem}
        itemLayoutAnimation={ROW_LAYOUT}
        skipEnteringExitingAnimations
      />
    );
  },
);
StyledFlatListComponent.displayName = 'Styled(FlatList)';

const StyledFlatList = StyledFlatListComponent as <T extends object>(
  props: StyledFlatListProps<T> & { ref?: Ref<FlatList<T>> },
) => ReactElement;

export default StyledFlatList;
