/**
 * Parse agent ID to extract publisher, agent name, and version
 * Supports formats:
 * - publisher/agentId[@version]
 * - agentId[@version] (no publisher)
 */
export declare function parseAgentId(fullAgentId: string): {
    publisherId?: string;
    agentId?: string;
    version?: string;
    givenAgentId: string;
};
/**
 * Parse published agent ID to extract publisher, agent name, and optionally version
 *
 * If the agent ID is not in the publisher/agent format, return null
 */
export declare function parsePublishedAgentId(fullAgentId: string): {
    publisherId: string;
    agentId: string;
    version?: string;
} | null;
//# sourceMappingURL=agent-id-parsing.d.ts.map