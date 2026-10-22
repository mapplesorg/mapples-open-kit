import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    padding: 16,
    gap: 4,
  },
  rootPlain: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  unit: {
    marginBottom: 3,
  },
  valueIcon: {
    alignSelf: 'center',
    marginEnd: 2,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  captionInline: {
    flexShrink: 1,
    marginStart: 4,
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
