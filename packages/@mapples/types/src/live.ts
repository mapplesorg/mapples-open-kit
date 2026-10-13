/**
 * The live hub — `wss://<canvas host>/canvas/stream?project=…` on canvas-api
 * (service--mapplesorg `api/canvas/hub.py` + `ws.py`, protocol v2). Server →
 * client only; a client sends `pong`, `name` and `focus` and nothing else.
 * Writes never travel here: commits, selection, captures and comments keep
 * their HTTP routes, and the hub tells peers that they happened.
 *
 * Shared by the Creator and the `mapples` CLI, which is why the shapes live
 * in this public package rather than in `@mapplesorg/api`.
 */

/** Who holds a socket on a project, as the hub reports it. */
export type LiveClientKind = 'editor' | 'cli' | 'viewer' | 'mcp';

export interface LiveMember {
  /** Per-connection id, stable for the socket's lifetime. */
  client: string;
  kind: LiveClientKind;
  /** Signed-in members (editor sockets). */
  user?: { uuid: string; name: string | null };
  /** A viewer's self-given name, or a CLI/MCP agent label. */
  name?: string | null;
  /** The agent behind a `cli` / `mcp` member (`claude-code`, `cursor`, …). */
  agent?: string | null;
  /** The page/component the member has open, from its `focus` frames. */
  focus?: string | null;
  since: string;
  lastSeen: string;
}

export interface LiveHelloFrame {
  type: 'hello';
  project: string;
  head: string | null;
  seq: number | null;
  you: {
    client: string;
    kind: LiveClientKind;
    user?: { uuid: string; name: string | null };
    name?: string | null;
  };
  presence: LiveMember[];
  /**
   * The live agent-session lease as a v2 `agent` frame, or null when none is
   * live. Editor and CLI sockets only; absent from viewers and from hubs
   * that predate it, which clients read as "ask the agent-session route".
   */
  agent?: LiveAgentFrame | null;
  /** Unix seconds; the socket closes 4408 then (JWT sockets only). */
  exp?: number;
}

export interface LiveHeadFrame {
  type: 'head' | 'revert';
  project: string;
  head: string;
  seq: number;
}

export interface LiveAgentStep {
  index: number;
  title: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  detail: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

/**
 * An agent-session lease moved. v1 carried only `session`, `status`, `step`
 * and `rev`; v2 adds the full summary so a client can apply it without a
 * GET. Clients treat the optional fields as "v1 hub" when absent.
 */
export interface LiveAgentFrame {
  type: 'agent';
  project: string;
  session: string;
  status: 'active' | 'done' | 'failed' | 'expired' | 'disconnected';
  step: string | null;
  rev: number;
  currentStep?: string | null;
  steps?: LiveAgentStep[];
  expiresAt?: string;
  agent?: string;
  label?: string | null;
}

export interface LivePresenceFrame {
  type: 'presence';
  project: string;
  members: LiveMember[];
}

/** `PUT /projects/{p}/editor-context` landed; `context` null = cleared. */
export interface LiveSelectionFrame {
  type: 'selection';
  project: string;
  context: unknown | null;
}

export interface LiveCaptureFrame {
  type: 'capture';
  project: string;
  id: string;
  status: 'requested' | 'ready' | 'failed';
  requestedAt?: string;
}

export interface LiveCommentFrame {
  type: 'comment';
  project: string;
  op: 'created' | 'updated' | 'deleted';
  /** The comment as the comment routes serialise it; `{uuid}` on delete. */
  comment: { uuid: string } & Record<string, unknown>;
  /** The same clock the list route returns — the next `?since=` cursor. */
  serverTime: string;
}

/** A Paddle webhook moved the workspace's subscription row. */
export interface LiveSubscriptionFrame {
  type: 'subscription';
  workspace: string;
  status: string;
  /** The plan slug, null once the workspace is back on free. */
  plan: string | null;
  updatedAt: string | null;
}

export interface LivePingFrame {
  type: 'ping';
}

export type LiveFrame =
  | LiveHelloFrame
  | LiveHeadFrame
  | LiveAgentFrame
  | LivePresenceFrame
  | LiveSelectionFrame
  | LiveCaptureFrame
  | LiveCommentFrame
  | LiveSubscriptionFrame
  | LivePingFrame;

export type LiveFrameType = LiveFrame['type'];

export type LiveClientFrame =
  | { type: 'pong' }
  | { type: 'name'; name: string }
  | { type: 'focus'; container?: string | null };

/** Close codes the hub uses beyond the standard ones. */
export const LIVE_CLOSE_UNAUTHORIZED = 4401;
export const LIVE_CLOSE_FORBIDDEN = 4403;
export const LIVE_CLOSE_EXPIRED = 4408;
