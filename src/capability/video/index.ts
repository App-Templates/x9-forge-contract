/**
 * cap-video contracts — sub-path `@x9-forge/contracts/capability/video`.
 *
 * Approved briefs, decided engine jobs and project reads scoped to one tenant, owner and agent.
 * The TypeScript facade resolves presets, budgets and production settings before calling the engine.
 *
 * Consumers (planned): agent-x9 services/cap-video (facade), Officina video engine (project creation).
 *
 * Strict internal boundary (R-14): unknown fields are rejected.
 */
export {
  VideoModeSchema,
  VideoPresetIdSchema,
  VideoBriefRequestSchema,
  VideoProjectIdSchema,
  VideoProjectStateSchema,
  VideoBriefResponseSchema,
  type VideoMode,
  type VideoPresetId,
  type VideoBriefRequest,
  type VideoProjectId,
  type VideoProjectState,
  type VideoBriefResponse,
} from './brief.js';
export {
  VideoEngineSettingsSchema,
  VideoEngineJobSchema,
  VideoEngineJobResponseSchema,
  VideoProjectGetRequestSchema,
  type VideoEngineSettings,
  type VideoEngineJob,
  type VideoEngineJobResponse,
  type VideoProjectGetRequest,
} from './engine.js';
