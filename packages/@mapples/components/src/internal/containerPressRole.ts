import { Platform } from 'react-native';

/**
 * Accessibility role of a pressable that holds the author's children
 * (`Card`, `TicketCard`). react-native-web renders `role="button"` as a
 * `<button>`, so a button among the children would nest inside it — invalid
 * HTML and a React hydration error. On the web the container is therefore a
 * plain focusable element (click and Enter still press it, its label is
 * kept, the buttons inside stay reachable); native keeps the button role.
 */
export const CONTAINER_PRESS_ROLE =
  Platform.OS === 'web' ? undefined : ('button' as const);
