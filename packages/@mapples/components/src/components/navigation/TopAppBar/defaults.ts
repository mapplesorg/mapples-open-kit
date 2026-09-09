import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    paddingHorizontal: 4,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titles: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 2,
  },
  titlesCentred: {
    alignItems: 'center',
  },
  centred: {
    textAlign: 'center',
  },
  largeTitles: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'flex-end',
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
});
