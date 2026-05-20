/** Base error class for all Swish SDK errors. */
export declare class SwishError extends Error {
    constructor(message: string);
}
/** Thrown when the Swish API returns a non-2xx HTTP response. */
export declare class SwishApiError extends SwishError {
    readonly statusCode: number;
    /** The raw response body, if available. */
    readonly body: unknown;
    constructor(statusCode: number, body: unknown);
}
//# sourceMappingURL=errors.d.ts.map