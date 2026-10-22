import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  wrap: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollRoot: {
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
  },
  grid: {
    alignSelf: 'stretch',
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCell: {
    flex: 1,
  },
  gridSpacer: {
    flex: 1,
  },
});
