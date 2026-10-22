import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  column: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  value: {
    marginBottom: 4,
    textAlign: 'center',
  },
  labels: {
    flexDirection: 'row',
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
