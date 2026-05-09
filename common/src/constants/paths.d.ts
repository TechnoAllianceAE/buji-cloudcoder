export declare const STOP_MARKER: string;
export declare const FIND_FILES_MARKER: string;
export declare const AGENT_TEMPLATES_DIR = ".agents/";
export declare const AGENT_DEFINITION_FILE = "agent-definition.d.ts";
export declare const API_KEY_ENV_VAR = "BCP_API_KEY";
export declare const INVALID_AUTH_TOKEN_MESSAGE = "Invalid auth token. You may have been logged out from the web portal. Please log in again.";
export declare const DEFAULT_IGNORED_PATHS: string[];
export declare const ASKED_CONFIG = "asked_config";
export declare const SHOULD_ASK_CONFIG = "should_ask_config";
export declare const ONE_TIME_TAGS: readonly [];
export declare const ONE_TIME_LABELS: readonly ["asked_config", "should_ask_config"];
export declare const FILE_READ_STATUS: {
    readonly DOES_NOT_EXIST: "[FILE_DOES_NOT_EXIST]";
    readonly IGNORED: "[BLOCKED]";
    readonly TEMPLATE: "[TEMPLATE]";
    readonly OUTSIDE_PROJECT: "[FILE_OUTSIDE_PROJECT]";
    readonly TOO_LARGE: "[FILE_TOO_LARGE]";
    readonly ERROR: "[FILE_READ_ERROR]";
};
export declare const HIDDEN_FILE_READ_STATUS: ("[FILE_DOES_NOT_EXIST]" | "[BLOCKED]" | "[FILE_OUTSIDE_PROJECT]" | "[FILE_TOO_LARGE]" | "[FILE_READ_ERROR]")[];
export declare function toOptionalFile(file: string | null): string;
export declare const TEST_USER_ID = "test-user-id";
//# sourceMappingURL=paths.d.ts.map