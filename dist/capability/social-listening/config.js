import { z } from 'zod';
import { AgentConfigVersionSchema, AgentTimeZoneSchema, CapabilityAgentIdSchema, CapabilityUsdSchema, } from "../ricerca/agent-config.js";
import { SOCIAL_TRACKS, SocialTrackSchema } from "./topic.js";
const CLOCK_PATTERN = '^([01]\\d|2[0-3]):[0-5]\\d$';
/** Local time of day, HH:MM, 24 hours. */
export const SocialClockTimeSchema = z.string().regex(new RegExp(CLOCK_PATTERN));
/**
 * Social listening configuration for ONE agent, written with the existing per-agent config PUT (B1 adds no route).
 * No default here: where the round runs and the hand-over to the server are the owner's choices (D9).
 */
export const SocialListeningAgentConfigSchema = z.object({
    agentId: CapabilityAgentIdSchema,
    version: AgentConfigVersionSchema,
    round: z.object({
        runsOn: SocialTrackSchema,
        localTime: SocialClockTimeSchema,
        timezone: AgentTimeZoneSchema,
        fallbackToServer: z.boolean(),
        fallbackTime: SocialClockTimeSchema,
        /** Daily cap for the pay-per-use (server) track. */
        serverDailyCapUsd: CapabilityUsdSchema,
    }).strict().refine(r => r.fallbackTime > r.localTime, { message: 'fallbackTime must be after localTime', path: ['fallbackTime'] }),
    research: z.object({
        maxUsdPerResearch: CapabilityUsdSchema,
        dailyCapUsd: CapabilityUsdSchema,
    }).strict().refine(r => r.maxUsdPerResearch <= r.dailyCapUsd, { message: 'maxUsdPerResearch above dailyCapUsd', path: ['maxUsdPerResearch'] }),
}).strict();
/** Dotted paths of the configuration (B1 keys). */
export const SOCIAL_LISTENING_PARAMETER_KEYS = [
    'round.runsOn',
    'round.fallbackToServer',
    'round.localTime',
    'round.fallbackTime',
    'round.serverDailyCapUsd',
    'research.maxUsdPerResearch',
    'research.dailyCapUsd',
];
const common = {
    editableBy: ['superadmin', 'owner'],
    appliesWhen: 'immediate',
    optional: false,
};
export const SOCIAL_LISTENING_PARAMETERS = {
    consumes: true,
    spendLedger: true,
    parameters: [
        {
            ...common,
            key: 'round.runsOn',
            type: 'enum',
            options: [
                { value: SOCIAL_TRACKS[0], label: 'Sul Mac (la mia sessione)' },
                { value: SOCIAL_TRACKS[1], label: 'Sul server (API a consumo)' },
            ],
            label: 'Dove gira il giro',
            description: 'Dove l’agente fa il giro di ascolto della giornata.',
            explanation: 'Sul Mac usa la tua sessione e non costa a consumo; sul server usa le API e ha un tetto di spesa al giorno.',
            group: 'Giro',
            status: 'proposed',
            reference: 'D9 (17/11): toggle Mac o lato server; scelta del proprietario, da confermare nella P0 (mirino-dettaglio)',
            consumes: false,
        },
        {
            ...common,
            key: 'round.fallbackToServer',
            type: 'boolean',
            label: 'Se il Mac non arriva, passa al server',
            description: 'Se il Mac non ha consegnato all’ora di riserva, il giro passa al server.',
            explanation: 'Il passaggio al server costa a consumo, nei limiti del tetto giornaliero del server.',
            group: 'Giro',
            status: 'proposed',
            reference: 'D9 (17/11): passaggio al server; scelta del proprietario, da confermare nella P0 (mirino-dettaglio)',
            consumes: true,
        },
        {
            ...common,
            key: 'round.localTime',
            type: 'string',
            pattern: CLOCK_PATTERN,
            minLength: 5,
            maxLength: 5,
            platformDefault: '07:00',
            label: 'Ora del giro',
            description: 'Ora locale (HH:MM) alla quale parte il giro di ogni giorno.',
            explanation: 'Si legge nel fuso orario dell’agente.',
            group: 'Giro',
            unit: 'HH:MM',
            status: 'decided',
            reference: 'D20: ogni giorno alle 07:00 (mirino-dettaglio)',
            consumes: false,
        },
        {
            ...common,
            key: 'round.fallbackTime',
            type: 'string',
            pattern: CLOCK_PATTERN,
            minLength: 5,
            maxLength: 5,
            platformDefault: '08:00',
            label: 'Ora di riserva',
            description: 'Ora locale (HH:MM) dopo la quale il giro passa al server, se il Mac non ha consegnato.',
            explanation: 'Deve essere dopo l’ora del giro.',
            group: 'Giro',
            unit: 'HH:MM',
            status: 'proposed',
            reference: 'D9, regola provvisoria di mirino-dettaglio: 08:00, da sostituire con la P0',
            consumes: false,
        },
        {
            ...common,
            key: 'round.serverDailyCapUsd',
            type: 'number',
            min: 0.01,
            platformDefault: 2,
            label: 'Tetto giornaliero del server',
            description: 'Spesa massima al giorno del giro sul server.',
            explanation: 'Raggiunto il tetto il giro si ferma e lo stato dice «tetto raggiunto».',
            group: 'Spesa',
            unit: 'USD',
            status: 'decided',
            reference: 'D24 (Stefano 17/11, «Si»): 2 $ al giorno per agente (mirino-dettaglio)',
            consumes: true,
        },
        {
            ...common,
            key: 'research.maxUsdPerResearch',
            type: 'number',
            min: 0.01,
            platformDefault: 0.3,
            label: 'Tetto per ricerca',
            description: 'Spesa massima di una ricerca approfondita su un argomento.',
            explanation: 'Non può superare il tetto giornaliero delle ricerche.',
            group: 'Spesa',
            unit: 'USD',
            status: 'decided',
            reference: 'D18: 0,30 $ a ricerca (mirino-dettaglio)',
            consumes: true,
        },
        {
            ...common,
            key: 'research.dailyCapUsd',
            type: 'number',
            min: 0.01,
            platformDefault: 1,
            label: 'Tetto giornaliero delle ricerche',
            description: 'Spesa massima al giorno delle ricerche approfondite.',
            explanation: 'Il tetto si controlla prima di ogni chiamata.',
            group: 'Spesa',
            unit: 'USD',
            status: 'decided',
            reference: 'D18: 1 $ al giorno (mirino-dettaglio)',
            consumes: true,
        },
    ],
};
//# sourceMappingURL=config.js.map