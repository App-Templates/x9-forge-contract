import { z } from 'zod';
/**
 * Il destinatario di un incarico, di un commento o di una domanda è l'id dell'agente (Paperclip `assigneeAgentId`,
 * `addresseeAgentId`: validators/issue.ts:713; doc/execution-semantics.md:22-30), mai un nome di reparto o di ruolo
 * in testo libero. Il ruolo si risolve PRIMA, qui, con la mappa del posto, e dentro lo schema resta solo l'id.
 * Le forme con `roleRef` / `assigneeRoleRef` (tools.ts, native-wait.ts) restano per chi le usa oggi e sono ritirate
 * quando lo stack è passato a queste (scheda di adozione).
 */
export const PAPERCLIP_DESTINATARIO_RIFIUTI = ['role_not_configured', 'agent_not_valid'];
/** La risoluzione di un ruolo con la mappa `roleAgents` del posto: chiave esatta, valore GUID, nient'altro. */
export function paperclipDestinatarioPerRuolo(roleAgents, roleRef) {
    if (!Object.hasOwn(roleAgents, roleRef))
        return { ok: false, refusal: 'role_not_configured' };
    const letto = z.uuid().safeParse(roleAgents[roleRef]);
    return letto.success ? { ok: true, agentId: letto.data } : { ok: false, refusal: 'agent_not_valid' };
}
//# sourceMappingURL=recipient.js.map