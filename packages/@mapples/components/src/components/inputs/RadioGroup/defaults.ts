import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'flex-start',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    flexShrink: 1,
    gap: 2,
  },
  labelsGrow: {
    flexGrow: 1,
  },
  card: {
    padding: 16,
  },
  divider: {
    height: 1,
  },
});
