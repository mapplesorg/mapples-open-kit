import { Styler } from '@mapples/style';
import { StyleSheet } from 'react-native';

import { BOTTOM_NAVIGATION_DOT_SIZE, BOTTOM_NAVIGATION_EXPAND } from './types';

/** Gap between the label (or glyph) and the `dot` indicator. */
const DOT_GAP = 2;

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
  },
  /** A floating `expand` bar hugs its items, centred. */
  rootHug: {
    alignSelf: 'center',
  },
  items: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  /** Items sized to their content (`expand`), spread over the free width. */
  itemsFit: {
    justifyContent: 'space-evenly',
    gap: BOTTOM_NAVIGATION_EXPAND.itemGap,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  /** Every item shares the width equally (all marks but `expand`). */
  itemFill: {
    flex: 1,
  },
  /** An `expand` item: as wide as its pill, shrinking only when the bar overflows. */
  itemFit: {
    flexShrink: 1,
    minWidth: 0,
  },
  /** The `expand` pill: glyph, then the label that slides out beside it. */
  expandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: BOTTOM_NAVIGATION_EXPAND.paddingHorizontal,
  },
  /** Clips the `expand` label while its width animates. */
  expandClip: {
    alignSelf: 'stretch',
    flexShrink: 1,
    overflow: 'hidden',
  },
  /** The `expand` label, laid out at its natural width so it can be measured. */
  expandLabel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: BOTTOM_NAVIGATION_EXPAND.gap,
    justifyContent: 'center',
    maxWidth: BOTTOM_NAVIGATION_EXPAND.labelMaxWidth,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  labelText: {
    flexShrink: 1,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  barTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotAnchor: {
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '100%',
  },
  dotTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -(BOTTOM_NAVIGATION_DOT_SIZE + DOT_GAP),
    alignItems: 'center',
  },
  dot: {
    width: BOTTOM_NAVIGATION_DOT_SIZE,
    height: BOTTOM_NAVIGATION_DOT_SIZE,
    borderRadius: BOTTOM_NAVIGATION_DOT_SIZE / 2,
  },
  icon: {
    overflow: 'visible',
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAnchored: {
    position: 'absolute',
    top: -4,
    end: -6,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
});
