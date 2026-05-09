export declare const AuthState: {
    readonly LOGGED_OUT: "LOGGED_OUT";
    readonly LOGGED_IN: "LOGGED_IN";
};
export type AuthState = (typeof AuthState)[keyof typeof AuthState];
export declare const UserState: {
    readonly LOGGED_OUT: "LOGGED_OUT";
    readonly GOOD_STANDING: "GOOD_STANDING";
    readonly ATTENTION_NEEDED: "ATTENTION_NEEDED";
    readonly CRITICAL: "CRITICAL";
    readonly DEPLETED: "DEPLETED";
};
export type UserState = (typeof UserState)[keyof typeof UserState];
export declare function getUserState(isLoggedIn: boolean, credits: number): UserState;
//# sourceMappingURL=ui.d.ts.map