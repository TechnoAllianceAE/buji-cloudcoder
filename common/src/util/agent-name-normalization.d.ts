export declare const DEFAULT_ORG_PREFIX = "bcp/";
/**
 * Resolves an agent ID by trying multiple strategies:
 * 1. Direct lookup in registry
 * 2. Try with DEFAULT_ORG_PREFIX for spawnable agents
 * 3. Return null if not found
 *
 * This provides a more robust alternative to string concatenation
 * and handles the common case where users reference spawnable agents
 * without the org prefix.
 */
export declare function resolveAgentId(agentId: string, agentRegistry: Record<string, any>): string | null;
//# sourceMappingURL=agent-name-normalization.d.ts.map