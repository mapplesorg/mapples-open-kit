import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'flex-start',
    columnGap: 6,
    rowGap: 4,
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
});
