import { forwardRef, PropsWithChildren } from 'react';

import { useOptionalNavigatorChromeItem } from '@mapples/render';
import { StyledProp, Typography } from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Text, TextProps, TextStyle } from 'react-native';

import { ChromeNotice, useSlotColor } from '../../../internal';

import { TabLabelShowWhen } from './types';

/** Props for {@link TabLabel}. */
export interface TabLabelProps extends Omit<TextProps, 'children' | 'style'> {
  /** Which tabs show their label. Defaults to `always`. */
  showWhen?: TabLabelShowWhen;
  /** Styled slots for every visual part. */
  styled?: {
    /** The label. */
    style?: StyledProp<TextStyle>;
    /** The same while the tab is active. */
    styleActive?: StyledProp<TextStyle>;
  };
}

/**
 * The label of the tab a `TabTemplate` template is repeated for, in the colour
 * its slots give: `style` while inactive, `styleActive` while active
 * (primary when neither sets one). `showWhen` keeps it to the active tab
 * only, or to the inactive ones.
 *
 * Outside a `TabTemplate` it shows a notice saying where it belongs.
 *
 * @example
 * ```tsx
 * <TabTemplate>
 *   <TabIcon />
 *   <TabLabel showWhen="active" />
 * </TabTemplate>
 * ```
 *
 * @public
 */
const TabLabel = forwardRef<Text, PropsWithChildren<TabLabelProps>>(
  (
    {
      showWhen = 'always',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const scope = useOptionalNavigatorChromeItem();
    const tones = useTones();
    const inactiveColor = useSlotColor(
      styled?.style,
      'color',
      tones.resolve(Tokens.color.textSecondary),
    );
    const ownColor = useSlotColor(
      styled?.style,
      'color',
      tones.tone('primary').main,
    );
    const activeColor = useSlotColor(styled?.styleActive, 'color', ownColor);

    if (!scope) {
      return (
        <ChromeNotice message="Tab label — draws the tab's label inside a Tab template." />
      );
    }

    const { active, label } = scope.item;
    if (
      (showWhen === 'active' && !active) ||
      (showWhen === 'inactive' && active)
    ) {
      return null;
    }

    return (
      <Typography
        ref={ref}
        variant={TYPOGRAPHY_PARTS.helper}
        numberOfLines={1}
        {...rest}
        style={[
          styled?.style,
          active && styled?.styleActive,
          { color: active ? activeColor : inactiveColor },
        ]}
      >
        {label}
      </Typography>
    );
  },
);
TabLabel.displayName = 'TabLabel';

export default TabLabel;
