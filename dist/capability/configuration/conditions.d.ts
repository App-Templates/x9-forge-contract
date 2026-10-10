import { z } from 'zod';
export declare const DayOfWeekSchema: z.ZodEnum<{
    mon: "mon";
    tue: "tue";
    wed: "wed";
    thu: "thu";
    fri: "fri";
    sat: "sat";
    sun: "sun";
}>;
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;
/** Existing rule-engine conditions; transport rejects rather than strips unknown fields. */
export declare const PrimitiveConditionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"always">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"day_of_week">;
    days: z.ZodArray<z.ZodEnum<{
        mon: "mon";
        tue: "tue";
        wed: "wed";
        thu: "thu";
        fri: "fri";
        sat: "sat";
        sun: "sun";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"time_range">;
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"date_range">;
    from: z.ZodUnion<[z.ZodString, z.ZodString]>;
    to: z.ZodUnion<[z.ZodString, z.ZodString]>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"calendar_count">;
    operator: z.ZodEnum<{
        ">": ">";
        "<": "<";
        "=": "=";
        ">=": ">=";
    }>;
    value: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"weather">;
    condition: z.ZodEnum<{
        rain: "rain";
        clear: "clear";
        cold: "cold";
        hot: "hot";
    }>;
    source: z.ZodLiteral<"open-meteo">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"is_dark">;
    value: z.ZodBoolean;
}, z.core.$strict>], "type">;
export type Condition = z.infer<typeof PrimitiveConditionSchema> | {
    type: 'and';
    conditions: Condition[];
} | {
    type: 'or';
    conditions: Condition[];
} | {
    type: 'not';
    condition: Condition;
};
export declare const ConditionSchema: z.ZodType<Condition>;
//# sourceMappingURL=conditions.d.ts.map