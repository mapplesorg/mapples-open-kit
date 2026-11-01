import { FC } from 'react';

import { StyledView, Typography } from '@mapples/style';
import { TYPOGRAPHY_PARTS, useShape, useTones } from '@mapples/ui';

export interface ChromeNoticeProps {
  /** What the element is and where it works. */
  message: string;
}

/**
 * What a navigator-chrome element (`TabBarItems`, `DrawerItems`) draws when
 * no navigator is providing it routes: the component it sits in is not yet a
 * navigator's design, or the element was dropped on an ordinary screen.
 *
 * A visible notice rather than a throw, deliberately: canvas frames carry no
 * error boundary, so a throw would blank the editing surface instead of
 * telling the designer what to attach.
 */
const ChromeNotice: FC<ChromeNoticeProps> = ({ message }) => {
  const tones = useTones();
  const shape = useShape();
  return (
    <StyledView
      accessibilityRole="text"
      styled={{
        style: {
          alignSelf: 'stretch',
          minHeight: 48,
          justifyContent: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderRadius: shape.radius.sm,
          borderColor: tones.outlineStrong,
        },
      }}
    >
      <Typography
        variant={TYPOGRAPHY_PARTS.helper}
        color={tones.resolve('theme.text.secondary')}
      >
        {message}
      </Typography>
    </StyledView>
  );
};

export default ChromeNotice;
