import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vertical: {
    flexDirection: 'column',
  },
  stepHorizontal: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  stepVertical: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  indicatorRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rail: {
    alignItems: 'center',
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorHorizontal: {
    flex: 1,
  },
  connectorVertical: {
    flex: 1,
    minHeight: 16,
    marginVertical: 4,
  },
  textsHorizontal: {
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  textsVertical: {
    flex: 1,
    gap: 2,
  },
  centred: {
    textAlign: 'center',
  },
  number: {
    fontSize: 12,
    lineHeight: 16,
  },
});
