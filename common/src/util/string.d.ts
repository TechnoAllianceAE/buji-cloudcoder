export declare const truncateString: (str: string, maxLength: number) => string;
export declare const truncateStringWithMessage: ({ str, maxLength, message, remove, }: {
    str: string;
    maxLength: number;
    message?: string;
    remove?: "END" | "START" | "MIDDLE";
}) => string;
/**
 * Check if a character is a whitespace character according
 * to the XML spec (space, carriage return, line feed or tab)
 *
 * @param character Character to check
 * @return Whether the character is whitespace or not
 */
export declare const isWhitespace: (character: string) => boolean;
export declare const randBoolFromStr: (str: string) => boolean;
export declare const pluralize: (count: number, word: string, { includeCount }?: {
    includeCount?: boolean;
}) => string;
/**
 * Safely replaces all occurrences of a search string with a replacement string,
 * escaping special replacement patterns (like $) in the replacement string.
 */
export declare const capitalize: (str: string) => string;
/**
 * Converts a snake_case string to Title Case
 * Example: "add_subgoal" -> "Add Subgoal"
 */
export declare const snakeToTitleCase: (str: string) => string;
/**
 * Ensures a URL has the appropriate protocol (http:// or https://)
 * Uses http:// for localhost and local IPs, https:// for all other domains
 */
export declare const ensureUrlProtocol: (url: string) => string;
export declare const safeReplace: (content: string, searchStr: string, replaceStr: string) => string;
/**
 * Extracts a JSON field from a string, transforms it, and puts it back.
 * Handles both array and object JSON values.
 * @param content The string containing JSON-like content
 * @param field The field name to find and transform
 * @param transform Function to transform the parsed JSON value
 * @param fallback String to use if parsing fails
 * @returns The content string with the transformed JSON field
 */
export declare function transformJsonInString<T = unknown>(content: string, field: string, transform: (json: T) => unknown, fallback: string): string;
/**
 * Generates a compact unique identifier by combining timestamp bits with random bits.
 * Uses 40 bits of timestamp (enough for ~34 years) and 24 random bits for exactly 64 total bits.
 * Encodes in base64url for compact, URL-safe strings (~11 chars).
 * @param prefix Optional prefix to add to the ID
 * @returns A unique string ID
 * @example
 * generateCompactId()      // => "1a2b3c4d5e6"
 * generateCompactId('msg-') // => "msg-1a2b3c4d5e6"
 */
export declare const generateCompactId: (prefix?: string) => string;
/**
 * Removes null characters from a string
 */
export declare const stripNullChars: (str: string) => string;
export declare function stripColors(str: string): string;
export declare function stripAnsi(str: string): string;
export declare function includesMatch(array: (string | RegExp)[], value: string): boolean;
/**
 * Finds the longest substring that is **both** a suffix of `source`
 * **and** a prefix of `next`.
 * Useful when concatenating strings while avoiding duplicate overlap.
 *
 * @example
 * ```ts
 * suffixPrefixOverlap('foobar', 'barbaz'); // ➜ 'bar'
 * suffixPrefixOverlap('abc', 'def');       // ➜ ''
 * ```
 *
 * @param source  The string whose **suffix** is inspected.
 * @param next    The string whose **prefix** is inspected.
 * @returns       The longest overlapping edge, or an empty string if none exists.
 */
export declare function suffixPrefixOverlap(source: string, next: string): string;
export declare const escapeString: (str: string) => string;
//# sourceMappingURL=string.d.ts.map