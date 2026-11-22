import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  TYPOGRAPHY_PARTS,
  Tokens,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { ListContext, ListContextValue, ListVariant } from './types';

/** Props for {@link List}. */
export interface ListProps extends ViewProps {
  /** Surface: bare rows, an inset rounded group, or a card. Defaults to `plain`. */
  variant?: ListVariant;
  /** Rows draw dividers between them. Defaults to `true`. */
  dividers?: boolean;
  /** Divider start inset in points. Defaults to `16`. */
  dividerInset?: number;
  /** Small heading above the rows. */
  header?: string;
  /**
   * Animates the rows when one is shown, hidden or removed: it fades in or
   * out and the rows after it slide to their new place. The rows the list
   * starts with do not animate. Off with the OS's reduced-motion setting.
   * Defaults to `false`.
   */
  animateChanges?: boolean;
  /** Styled slots. */
  styled?: {
    /** The list surface. */
    style?: StyledProp<ViewStyle>;
    /** The header text. */
    styleHeader?: StyledProp<TextStyle>;
  };
}

/**
 * A container for `ListItem` rows: dividers, an optional header and a plain,
 * inset or card surface. Static rows only — data-bound lists use `FlatList`
 * with a `ListItem` template. With `animateChanges`, a row that is shown or
 * hidden (a `_visible` binding) fades and its neighbours slide.
 *
 * @example
 * ```tsx
 * <List variant="inset" header="Account">
 *   <ListItem title="Profile" leadingIconName="person-outline" trailing="chevron" />
 *   <ListItem title="Notifications" trailing="switch" value={on} onValueChange={setOn} />
 * </List>
 * ```
 *
 * @public
 */
const List: ForwardRefExoticComponent<
  PropsWithChildren<ListProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<ListProps>>(
  (
    {
      variant = 'plain',
      dividers = true,
      dividerInset = 16,
      header,
      animateChanges = false,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const elevation = useElevation();
    // Rows that mount with the list are its first rows; later ones are new.
    const settled = useRef(false);
    useEffect(() => {
      settled.current = true;
    }, []);
    const isSettled = useCallback(() => settled.current, []);
    const context = useMemo<ListContextValue>(
      () => ({ dividers, dividerInset, variant, animateChanges, isSettled }),
      [animateChanges, dividerInset, dividers, isSettled, variant],
    );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="list"
        styled={{
          style: [
            { alignSelf: 'stretch', gap: 8 },
            variant === 'inset' && { marginHorizontal: 16 },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {header ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.overline}
            style={[
              {
                color: tones.resolve(Tokens.color.textSecondary),
                marginStart: variant === 'plain' ? dividerInset : 8,
              },
              styled?.styleHeader,
            ]}
          >
            {header}
          </Typography>
        ) : null}
        <ListContext.Provider value={context}>
          <StyledView
            styled={{
              style: [
                variant !== 'plain' && {
                  borderRadius:
                    variant === 'card' ? shape.radius.lg : shape.radius.md,
                  backgroundColor: tones.resolve(Tokens.color.surface),
                  overflow: 'hidden',
                  borderWidth:
                    variant === 'card' || tones.isDark
                      ? shape.borderWidth(1)
                      : 0,
                  borderColor: tones.outline,
                },
                variant === 'card' && { boxShadow: elevation },
              ],
            }}
          >
            {children}
          </StyledView>
        </ListContext.Provider>
      </StyledView>
    );
  },
);
List.displayName = 'List';

export default List;
