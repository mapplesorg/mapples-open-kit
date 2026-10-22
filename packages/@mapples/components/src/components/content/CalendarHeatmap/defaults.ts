import { Styler } from '@mapples/style';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  rootWeeks: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  rootMonth: {
    alignSelf: 'stretch',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
  },
  column: {},
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCell: {
    flex: 1,
    aspectRatio: 1,
  },
  weekday: {
    textAlign: 'center',
  },
  weekdaySide: {
    textAlign: 'left',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  legendLabel: {
    marginHorizontal: 2,
  },
});
