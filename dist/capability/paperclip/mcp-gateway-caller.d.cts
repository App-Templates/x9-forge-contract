import { z } from 'zod';
/**
 * Who is calling, when a Paperclip lead uses an X9 tool through Paperclip's MCP gateway.
 * Paperclip tells an external MCP server who calls only through the headers chosen in the connection
 * (`headerPolicy.metadata.forward`); the identity never comes from a request body or a tool argument.
 * Without this shape X9 would hand-write the header names and read the identity from wherever it happens to sit (R-14).
 */
/** Metadata keys Paperclip allows in `headerPolicy.metadata.forward` (Paperclip server/src/services/tool-gateway.ts:376-384). */
export declare const PAPERCLIP_GATEWAY_METADATA_KEYS: readonly ["company_id", "agent_id", "issue_id", "project_id", "run_id", "gateway_session_id", "correlation_id"];
export type PaperclipGatewayMetadataKey = (typeof PAPERCLIP_GATEWAY_METADATA_KEYS)[number];
/**
 * Header a forwarded key becomes: `x-paperclip-<key with dashes>` (tool-gateway.ts:3349-3371). Lowercase because Node
 * exposes incoming header names that way. An agent-sent `x-paperclip-*` is dropped by Paperclip (:471-477), so these
 * can be trusted as Paperclip's own.
 */
export declare function paperclipGatewayHeader(key: PaperclipGatewayMetadataKey): string;
/** Keys X9 asks Paperclip to forward. `correlation_id` is left out: it changes on every call, so it identifies nothing. */
export declare const X9_MCP_FORWARDED_KEYS: readonly ["company_id", "agent_id", "issue_id", "run_id", "project_id", "gateway_session_id"];
/** Keys without which a call is refused. The issue, not the run, is what recognises a repeated request. */
export declare const X9_MCP_REQUIRED_KEYS: readonly ["company_id", "agent_id", "run_id", "issue_id"];
export declare const PaperclipGatewayCallerSchema: z.ZodObject<{
    companyId: z.ZodGUID;
    agentId: z.ZodGUID;
    runId: z.ZodGUID;
    issueId: z.ZodGUID;
    projectId: z.ZodOptional<z.ZodGUID>;
    gatewaySessionId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type PaperclipGatewayCaller = z.infer<typeof PaperclipGatewayCallerSchema>;
export type PaperclipGatewayCallerRead = {
    ok: true;
    caller: PaperclipGatewayCaller;
} | {
    ok: false;
    code: 'caller_header_missing' | 'caller_header_invalid';
    header: string;
};
type Headers = Readonly<Record<string, string | readonly string[] | undefined>>;
/**
 * Reads the caller from request headers only (nothing else is looked at). A required header absent or empty is
 * `caller_header_missing`; a value that is not a single string (doubled header) or fails the schema is
 * `caller_header_invalid`. `header` is the exact header name so the error can name it.
 */
export declare function readPaperclipGatewayCaller(headers: Headers): PaperclipGatewayCallerRead;
/** The key X9 expects from Paperclip: an app key on a link is sent as `Authorization: Bearer <key>` (tool-access.ts:8268-8276). */
export declare const X9_MCP_KEY_HEADER = "authorization";
export declare const X9_MCP_KEY_PREFIX = "Bearer ";
export declare const X9_MCP_PATH = "/mcp/x9-tools";
/**
 * Operator setting `<twin>=<lead>[,…]` (Stefano 19/11: first a twin of the development lead): the twin acts as the
 * lead. Never read from a call. A malformed entry, a repeated twin, two twins for one lead, or a twin that is
 * also a lead (a chain) is rejected.
 */
export declare const PaperclipTwinDeclarationsSchema: z.ZodPipe<z.ZodString, z.ZodTransform<ReadonlyMap<string, string>, string>>;
export {};
//# sourceMappingURL=mcp-gateway-caller.d.ts.map