import type { CompanyBoardUnit } from "./company-board.js";
import type { BoardRuleInput } from "./company-board-rule.js";
/** Set only after the laptop-session proof (5734, point 3). */
export declare const PAUSE_STOPS_LAPTOP_SESSION: boolean | null;
export declare const OWNER_ACTION_NOT_OWNER_REASON = "Le azioni le fa il proprietario dell'azienda";
export type BoardUnitActionsInput = Pick<BoardRuleInput, 'agent' | 'issues'> & Pick<CompanyBoardUnit, 'state' | 'computerSession'>;
export type BoardUnitActionPerson = 'collegata' | 'mancante' | 'non_nota';
export type BoardUnitActionsDerivation = Pick<CompanyBoardUnit, 'actions' | 'pauseWarning'>;
/** Pure availability rules; pause wording remains owned by deriveUnitState.
 * `ora` is supplied with the other board derivations; availability has no time threshold.
 * The optional proof value allows all three laptop outcomes to be exercised before 5734.
 */
export declare function deriveUnitActions(reparto: BoardUnitActionsInput, persona: BoardUnitActionPerson, _ora: Date, { pauseStopsLaptopSession }?: {
    pauseStopsLaptopSession?: boolean | null;
}): BoardUnitActionsDerivation;
//# sourceMappingURL=company-board-unit-actions.d.ts.map