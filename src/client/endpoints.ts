import type { SwishEnvironment } from '../tls/types.ts';

/** Default base URLs (without version segment) for each environment. */
export const SWISH_BASE_URLS: Record<SwishEnvironment, string> = {
	test: 'https://mss.cpc.getswish.net/swish-cpcapi/api',
	production: 'https://cpc.getswish.net/swish-cpcapi/api',
};

/**
 * Builds a versioned Swish API endpoint URL.
 * @param baseUrl - The base URL without a version segment.
 * @param version - The API version string, e.g. `'v1'` or `'v2'`.
 * @param path - The path segment, e.g. `'paymentrequests'` or `'/paymentrequests'`.
 * @returns The full URL, e.g. `'https://mss.cpc.getswish.net/swish-cpcapi/api/v1/paymentrequests'`.
 */
export function buildEndpointUrl(
	baseUrl: string,
	version: string,
	path: string,
): string {
	const base = baseUrl.replace(/\/$/, '');
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base}/${version}${p}`;
}
