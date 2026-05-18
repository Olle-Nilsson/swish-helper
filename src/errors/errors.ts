/** Base error class for all Swish SDK errors. */
export class SwishError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SwishError';
	}
}

/** Thrown when the Swish API returns a non-2xx HTTP response. */
export class SwishApiError extends SwishError {
	readonly statusCode: number;
	/** The raw response body, if available. */
	readonly body: unknown;

	constructor(statusCode: number, body: unknown) {
		super(`Swish API error: HTTP ${statusCode}`);
		this.name = 'SwishApiError';
		this.statusCode = statusCode;
		this.body = body;
	}
}
