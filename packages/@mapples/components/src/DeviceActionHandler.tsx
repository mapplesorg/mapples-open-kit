import { FC, useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';
import { followUpData, useDataState } from '@mapples/state';
import type { SetStateFollowUp } from '@mapples/state';
import type { Action } from '@mapples/types';
import { Platform, Share } from 'react-native';

import {
  CopyCommand,
  HapticCommand,
  ShareCommand,
  toCopyCommand,
  toHapticCommand,
  toShareCommand,
} from './deviceActions';

// `expo-haptics` and `expo-clipboard` are optional peers: an app that never
// vibrates or copies does not install them. Each is loaded when the module
// loads and asked for when an action needs it.
let Haptics: typeof import('expo-haptics') | null = null;
let hapticsLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require('expo-haptics');
} catch (error) {
  hapticsLoadError = error;
}

let Clipboard: typeof import('expo-clipboard') | null = null;
let clipboardLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Clipboard = require('expo-clipboard');
} catch (error) {
  clipboardLoadError = error;
}

const missingPackageMessage = (
  action: string,
  dependency: string,
  label: string,
  cause: unknown,
) =>
  `${action}: ${dependency} could not be loaded (the "${label}" package). ` +
  'Creator-first app: enable it in Project settings → Packages. ' +
  'Code-first app: run `mapples sync` (it adds the package to package.json), ' +
  'then the install command the sync names; rebuild the native app afterwards. ' +
  `Cause: ${String(cause)}`;

const playHaptic = async ({ style }: HapticCommand): Promise<void> => {
  // A browser has no haptics engine to ask.
  if (Platform.OS === 'web') return;
  if (!Haptics) {
    throw new Error(
      missingPackageMessage(
        'mapples:haptic',
        'expo-haptics',
        'Haptics',
        hapticsLoadError,
      ),
    );
  }
  switch (style) {
    case 'selection':
      return Haptics.selectionAsync();
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'heavy':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case 'success':
      return Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    case 'warning':
      return Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      );
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/** Writes the text to the clipboard; `false` when the browser refused. */
const copyText = async ({ text }: CopyCommand): Promise<boolean> => {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // A browser may refuse the clipboard (no permission, a page that is
      // not focused, an embedded frame). That is the browser's answer, not
      // a defect of the app: nothing was copied, so the steps that would
      // say "Copied" do not run.
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.warn(
          '[@mapples/components] mapples:copy: the browser refused the clipboard',
        );
        return false;
      }
      throw error;
    }
  }
  if (!Clipboard) {
    throw new Error(
      missingPackageMessage(
        'mapples:copy',
        'expo-clipboard',
        'Clipboard',
        clipboardLoadError,
      ),
    );
  }
  await Clipboard.setStringAsync(text);
  return true;
};

/** Opens the share sheet; `false` when the person dismissed it. */
const shareContent = async ({
  text,
  url,
  title,
}: ShareCommand): Promise<boolean> => {
  if (Platform.OS === 'web') {
    if (typeof navigator.share !== 'function') {
      throw new Error(
        'mapples:share: this browser has no share sheet (navigator.share is missing)',
      );
    }
    try {
      await navigator.share({ text, url, title });
      return true;
    } catch (error) {
      // Closing the sheet is an answer, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false;
      }
      throw error;
    }
  }

  // Android's sheet takes one message, so the link rides in it; iOS has a
  // field of its own for the link.
  const message =
    Platform.OS === 'ios' ? text : [text, url].filter(Boolean).join(' ');
  const result = await Share.share(
    {
      ...(message ? { message } : null),
      ...(Platform.OS === 'ios' && url ? { url } : null),
      ...(title ? { title } : null),
    } as Parameters<typeof Share.share>[0],
    title ? { dialogTitle: title, subject: title } : undefined,
  );
  return result.action !== Share.dismissedAction;
};

/**
 * Bridges the `@mapples/action` store to the device: `mapples:haptic`
 * (haptic feedback; nothing on the web), `mapples:copy` (text to the
 * clipboard) and `mapples:share` (the system share sheet). Each may carry a
 * `then` follow-up, re-emitted with the triggering action's event once the
 * device has answered (for a share, unless the sheet was dismissed), so a
 * button can copy a code, show "Copied" and flip back after a
 * `mapples:delay`. A browser that refuses the clipboard is an answer like a
 * dismissed sheet: it is logged and the follow-up does not run. Any other
 * failure (a missing package) rejects and is reported by the runtime's
 * error handling. Renders nothing.
 *
 * Mount once, inside `ActionProvider` and the state providers the texts are
 * read from, next to the other handlers.
 */
const DeviceActionHandler: FC = () => {
  const actionStore = useActionStore();
  const { getStateValue } = useDataState();

  // The subscription outlives state changes; the latest resolver is read
  // through a ref (see `StateActionHandler`).
  const latest = useRef(getStateValue);
  useLayoutEffect(() => {
    latest.current = getStateValue;
  }, [getStateValue]);

  useEffect(() => {
    const emit = (followUp: SetStateFollowUp | undefined, action: Action) => {
      if (!followUp) return;
      const originalEventData = action.payload?.originalEventData;
      actionStore.next({
        time: Date.now(),
        type: followUp.type,
        payload: {
          data: followUpData(followUp),
          ...(originalEventData ? { originalEventData } : {}),
        },
      });
    };

    const subscription = actionStore.subscribe((action) => {
      const getValue = (path: string) => latest.current(path);

      const haptic = toHapticCommand(action);
      if (haptic) {
        void playHaptic(haptic).then(() => emit(haptic.then, action));
        return;
      }

      const copy = toCopyCommand(action, getValue);
      if (copy) {
        void copyText(copy).then((copied) => {
          if (copied) emit(copy.then, action);
        });
        return;
      }

      const share = toShareCommand(action, getValue);
      if (share) {
        void shareContent(share).then((shared) => {
          if (shared) emit(share.then, action);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [actionStore]);

  return null;
};

export default DeviceActionHandler;
