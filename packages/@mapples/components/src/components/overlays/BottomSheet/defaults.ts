import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    padding: 24,
    gap: 12,
  },
  // Fills the free height: a snapping sheet's surface, its scroll area.
  fill: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
});
