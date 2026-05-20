import type { IncomingHttpHeaders } from 'http';
import type { SecureContextOptions } from 'tls';
/** The full response from a Swish API request, including headers and parsed body. */
export type TransportResponse<T> = {
    /** Parsed response body, or `null` for empty responses (e.g. 201 No Content). */
    body: T | null;
    /** Raw response headers from the Swish API. */
    headers: IncomingHttpHeaders;
};
/** HTTP methods supported by the Swish API. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/** Options for a single Swish API request. */
export type RequestOptions = {
    /** The HTTP method to use. */
    method: HttpMethod;
    /** The path segment relative to the versioned base URL, e.g. `'paymentrequests'`. */
    path: string;
    /** Optional request body. Will be serialised to JSON. */
    body?: unknown;
    /** Additional HTTP headers to include in the request. */
    headers?: Record<string, string>;
};
/**
 * Makes an mTLS HTTPS request to the Swish API.
 *
 * @param tlsOptions - The resolved TLS options used to authenticate the request.
 * @param method - The HTTP method.
 * @param url - The full endpoint URL.
 * @param body - Optional request body. Will be serialised to JSON.
 * @returns The parsed response body and raw response headers.
 * @throws {SwishApiError} If the server returns a non-2xx status code.
 */
export declare function transport<T>(tlsOptions: SecureContextOptions, method: HttpMethod, url: string, body?: unknown): Promise<TransportResponse<T>>;
//# sourceMappingURL=transport.d.ts.map