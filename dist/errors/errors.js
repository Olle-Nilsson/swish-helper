/** Base error class for all Swish SDK errors. */
export class SwishError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SwishError';
    }
}
/** Thrown when the Swish API returns a non-2xx HTTP response. */
export class SwishApiError extends SwishError {
    statusCode;
    /** The raw response body, if available. */
    body;
    constructor(statusCode, body) {
        super(`Swish API error: HTTP ${statusCode}`);
        this.name = 'SwishApiError';
        this.statusCode = statusCode;
        this.body = body;
    }
}
//# sourceMappingURL=errors.js.map