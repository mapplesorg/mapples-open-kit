/**
 * Action `type` strings handled by the request runtime. Components wire these
 * to interactions via `actionProps` and emit them through the
 * `@mapples/action` store.
 */
export const RequestActionType = {
  /**
   * Execute an API request. `payload.data: { requestId, onSuccess?,
   * onError? }` — the follow-up actions are re-emitted onto the action bus
   * after the request settles (e.g. a `mapples:navigate`).
   */
  Execute: 'mapples:request',
  /**
   * Forget responses: every `api.*` state, or `payload.data.requestIds`
   * only. What a sign-out runs so the next user never sees the previous
   * user's data; the runtime runs it itself when a session refresh is
   * refused.
   */
  ClearResponses: 'mapples:clearResponses',
} as const;

export type RequestActionTypeValue =
  (typeof RequestActionType)[keyof typeof RequestActionType];
