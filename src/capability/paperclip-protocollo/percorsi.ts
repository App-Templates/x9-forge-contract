import { z } from 'zod';

// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:52,77-80.
export const PAPERCLIP_RUN_ID_HEADER = 'X-Paperclip-Run-Id' as const;

export const paperclipPercorsi = {
  agenteMe(): string {
    return '/api/agents/me';
  },

  // Paperclip server/dist/routes/issues.js:5728-5739.
  contesto(id: string, wakeCommentId?: string): string {
    const path = `/api/issues/${z.guid().parse(id)}/heartbeat-context`;
    return wakeCommentId === undefined
      ? path
      : `${path}?wakeCommentId=${z.guid().parse(wakeCommentId)}`;
  },

  commenti(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/comments`;
  },

  checkout(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/checkout`;
  },

  // Paperclip server/dist/routes/issues.js:8401.
  figli(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/children`;
  },

  incarico(id: string): string {
    return `/api/issues/${z.guid().parse(id)}`;
  },

  // Paperclip server/dist/routes/issues.js:6900.
  piano(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/documents/plan`;
  },

  // Paperclip server/dist/routes/issues.js:11271.
  interazioni(id: string): string {
    return `/api/issues/${z.guid().parse(id)}/interactions`;
  },
};
