import type { z } from 'zod';
import type { EndpointAuthType } from '../auth/auth-headers.js';

/**
 * Metadata for an endpoint contract. Used by createBridgeClient typed methods
 * and by runtime Fastify schema integration (Phase 04-03).
 *
 * Key design: `EndpointContract` is a structural type used for documentation
 * and runtime validation, NOT a generic wrapper that every endpoint must
 * instantiate. Each endpoint file exports its own schemas and a `contract`
 * const object whose shape conforms to this interface.
 *
 * @see src/http/endpoints/*.ts
 */
export interface EndpointContract<
  TMethod extends 'GET' | 'POST',
  TPath extends string,
  TAuth extends EndpointAuthType,
  TParams extends z.ZodType = z.ZodUndefined,
  TBody extends z.ZodType = z.ZodUndefined,
  TResponse extends z.ZodType = z.ZodUnknown,
> {
  readonly method: TMethod;
  readonly path: TPath;
  readonly authType: TAuth;
  readonly paramsSchema?: TParams;
  readonly bodySchema?: TBody;
  readonly responseSchema: TResponse;
}
