import { LayoutRectangle } from 'react-native';

/**
 * Initial drag coordinates when no drag operation is active.
 * @public
 */
export const initialDragCoords = { x: 0, y: 0 };

/**
 * Initial layout rectangle for overlay elements when no drag operation is active.
 * @public
 */
export const initialOverLayout: LayoutRectangle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
