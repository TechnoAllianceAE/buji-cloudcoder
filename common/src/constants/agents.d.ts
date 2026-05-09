export declare const AGENT_PERSONAS: {
    readonly base: {
        readonly displayName: "Buffy the Base Agent";
        readonly purpose: "Base agent that orchestrates the full response.";
    };
    readonly ask: {
        readonly displayName: "Ask Mode Agent";
        readonly purpose: "Base ask-mode agent that orchestrates the full response.";
    };
    readonly thinker: {
        readonly displayName: "Theo the Theorizer";
        readonly purpose: "Does deep thinking given the current messages and a specific prompt to focus on. Use this to help you solve a specific problem.";
    };
    readonly 'file-explorer': {
        readonly displayName: "Dora The File Explorer";
        readonly purpose: "Expert at exploring a codebase and finding relevant files.";
    };
    readonly 'file-picker': {
        readonly displayName: "Fletcher the File Fetcher";
        readonly purpose: "Expert at finding relevant files in a codebase.";
    };
    readonly researcher: {
        readonly displayName: "Reid Searcher the Researcher";
        readonly purpose: "Expert at researching topics using web search and documentation.";
    };
    readonly planner: {
        readonly displayName: "Peter Plan";
        readonly purpose: "Agent that formulates a comprehensive plan to a prompt.";
        readonly hidden: true;
    };
    readonly reviewer: {
        readonly displayName: "Nit Pick Nick the Reviewer";
        readonly purpose: "Reviews file changes and responds with critical feedback. Use this after making any significant change to the codebase; otherwise, no need to use this agent for minor changes since it takes a second.";
    };
    readonly 'agent-builder': {
        readonly displayName: "Bob the Agent Builder";
        readonly purpose: "Creates new agent templates for the BCP multi-agent system";
        readonly hidden: false;
    };
};
export declare const AGENT_IDS: (keyof typeof AGENT_PERSONAS)[];
export declare const AGENT_ID_PREFIX = "BCPAI/";
export declare const AGENT_NAMES: Record<keyof typeof AGENT_PERSONAS, string>;
export type AgentName = (typeof AGENT_PERSONAS)[keyof typeof AGENT_PERSONAS]['displayName'];
export declare const UNIQUE_AGENT_NAMES: ("Buffy the Base Agent" | "Ask Mode Agent" | "Theo the Theorizer" | "Dora The File Explorer" | "Fletcher the File Fetcher" | "Reid Searcher the Researcher" | "Peter Plan" | "Nit Pick Nick the Reviewer" | "Bob the Agent Builder")[];
export declare const AGENT_NAME_TO_TYPES: Record<string, string[]>;
export declare const MAX_AGENT_STEPS_DEFAULT = 100;
//# sourceMappingURL=agents.d.ts.map