import { request as httpsRequest } from 'https';
import type { SecureContextOptions } from 'tls';

import { SwishApiError } from '../errors/errors.ts';

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
 * @returns The parsed JSON response body, or `null` for empty responses (e.g. 201 with no body).
 * @throws {SwishApiError} If the server returns a non-2xx status code.
 */
export function transport<T>(
	tlsOptions: SecureContextOptions,
	method: HttpMethod,
	url: string,
	body?: unknown,
): Promise<T | null> {
	return new Promise((resolve, reject) => {
		const payload = body !== undefined ? JSON.stringify(body) : undefined;

		const parsedUrl = new URL(url);

		const req = httpsRequest(
			{
				hostname: parsedUrl.hostname,
				port: parsedUrl.port || 443,
				path: parsedUrl.pathname + parsedUrl.search,
				method,
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					...(payload !== undefined && {
						'Content-Length': Buffer.byteLength(payload),
					}),
				},
				...tlsOptions,
			},
			(res) => {
				const chunks: Buffer[] = [];

				res.on('data', (chunk: Buffer) => chunks.push(chunk));

				res.on('end', () => {
					const raw = Buffer.concat(chunks).toString('utf8').trim();
					const statusCode = res.statusCode ?? 0;

					if (statusCode < 200 || statusCode >= 300) {
						let parsed: unknown = raw;
						try {
							parsed = JSON.parse(raw);
						} catch {
							// keep raw string
						}
						reject(new SwishApiError(statusCode, parsed));
						return;
					}

					if (!raw) {
						resolve(null);
						return;
					}

					try {
						resolve(JSON.parse(raw) as T);
					} catch {
						reject(
							new Error(
								`Failed to parse Swish API response: ${raw}`,
							),
						);
					}
				});

				res.on('error', reject);
			},
		);

		req.on('error', reject);

		if (payload !== undefined) {
			req.write(payload);
		}

		req.end();
	});
}
