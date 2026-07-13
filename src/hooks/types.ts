/** Status of a one-shot async action, for inline user feedback. */
export interface ActionStatus {
  kind: "idle" | "ok" | "error";
  message: string;
}

export const IDLE_STATUS: ActionStatus = { kind: "idle", message: "" };
