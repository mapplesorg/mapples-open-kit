/** The cameras a `CameraView` can show. */
export const CAMERA_VIEW_FACINGS = ['back', 'front'] as const;

export type CameraViewFacing = (typeof CAMERA_VIEW_FACINGS)[number];

/** Props shared by the web and native camera views. */
export interface CameraViewBaseProps {
  /** Whether the camera runs. Defaults to `true`; off, the camera stops and the box goes black. */
  active?: boolean;
  /**
   * Which camera to show. Defaults to `'back'`. On the web the browser picks
   * the camera that faces this way when there is more than one.
   */
  facing?: CameraViewFacing;
  /** Flips the picture left to right, like a mirror. Defaults to `true` for the front camera. */
  mirror?: boolean;
  /** Fires when the person refuses the camera (the screen can offer another way on). */
  onPermissionDenied?: () => void;
}

/** Throws on props a camera view cannot work with. */
export const assertCameraViewProps = ({
  facing,
}: Pick<CameraViewBaseProps, 'facing'>): void => {
  if (
    facing !== undefined &&
    !(CAMERA_VIEW_FACINGS as readonly string[]).includes(facing)
  ) {
    throw new Error(
      `CameraView: facing must be ${CAMERA_VIEW_FACINGS.join(' or ')} (got ${String(facing)})`,
    );
  }
};
