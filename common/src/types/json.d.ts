import z from 'zod/v4';
export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export declare const jsonValueSchema: z.ZodType<JSONValue>;
export declare const jsonObjectSchema: z.ZodType<JSONObject>;
export type JSONObject = {
    [key in string]: JSONValue;
};
export declare const jsonArraySchema: z.ZodType<JSONArray>;
export type JSONArray = JSONValue[];
//# sourceMappingURL=json.d.ts.map