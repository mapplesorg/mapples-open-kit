import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
    // The spacing between events lives here so the stretched rail column
    // spans the whole row and the connector meets the next marker.
    paddingBottom: 16,
  },
  textsLast: {
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  time: {
    textAlign: 'right',
  },
  legTexts: {
    flex: 1,
    alignItems: 'flex-start',
    paddingBottom: 16,
  },
  leg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
