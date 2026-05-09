export declare class StopSequenceHandler {
    private buffer;
    private finished;
    private stopSequences;
    constructor(stopSequences?: string[]);
    process(text: string): {
        text: string;
        endOfStream: boolean;
    } | {
        text: null;
        endOfStream: true;
    };
    flush(): string;
}
//# sourceMappingURL=stop-sequence.d.ts.map