import type { SecureContextOptions } from 'tls';

import { SWISH_BASE_URLS, buildEndpointUrl } from './endpoints.ts';
import { transport, type RequestOptions } from './transport.ts';
import { resolveTlsOptions } from '../tls/resolveTlsOptions.ts';
import { validateTlsConfig } from '../tls/validateTlsConfig.ts';
import type { TlsConfig, SwishEnvironment } from '../tls/types.ts';

/** Options for configuring a {@link SwishClient}. */
export type SwishClientOptions = {
	/** Your Swish merchant phone number. */
	swishNumber?: string;
	/** TLS configuration. Use a {@link PemTlsConfig} or {@link PfxTlsConfig}. */
	tls: TlsConfig;
	/**
	 * The Swish API environment to target.
	 * @defaultValue `'test'`
	 */
	environment?: SwishEnvironment;
	/**
	 * Override the Swish API base URL (without version segment).
	 * Useful for proxies or future API host changes.
	 * Defaults to the standard URL for the selected `environment`.
	 * @example `'https://mss.cpc.getswish.net/swish-cpcapi/api'`
	 */
	baseUrl?: string;
};

/** Client for interacting with the Swish payment API. */
export class SwishClient {
	readonly tlsOptions: SecureContextOptions;
	readonly environment: SwishEnvironment;
	readonly swishNumber?: string;
	private readonly _baseUrl: string;

	/**
	 * Creates a new {@link SwishClient}.
	 * @param options - Configuration options including a {@link TlsConfig}.
	 */
	constructor(options: SwishClientOptions) {
		this.tlsOptions = resolveTlsOptions(options.tls);
		this.environment = options.environment ?? 'test';
		this._baseUrl = options.baseUrl ?? SWISH_BASE_URLS[this.environment]!;
		if (options.swishNumber !== undefined) {
			this.swishNumber = options.swishNumber;
		}
		validateTlsConfig(this.tlsOptions);
	}

	/**
	 * Builds a versioned Swish API endpoint URL.
	 * @param version - The API version string, e.g. `'v1'` or `'v2'`.
	 * @param path - The path segment, e.g. `'paymentrequests'`.
	 * @returns The full URL.
	 */
	endpointUrl(version: string, path: string): string {
		return buildEndpointUrl(this._baseUrl, version, path);
	}

	/**
	 * Makes an authenticated HTTPS request to the Swish API.
	 * @param options - Request options including method, path, body, and headers.
	 * @param url - The full endpoint URL (use {@link endpointUrl} to build it).
	 * @returns The parsed response body, or `null` for empty responses.
	 * @throws {SwishApiError} If the server returns a non-2xx status code.
	 */
	request<T>(options: RequestOptions, url: string): Promise<T | null> {
		return transport<T>(this.tlsOptions, options.method, url, options.body);
	}

	/**
	 * Creates a {@link SwishClient} from environment variables.
	 *
	 * **PFX mode** (takes priority when `SWISH_PFX_PATH` is set):
	 *
	 * | Variable                | Option        |
	 * |-------------------------|---------------|
	 * | `SWISH_PFX_PATH`        | `pfxPath`     |
	 * | `SWISH_PFX_PASSPHRASE`  | `passphrase`  |
	 * | `SWISH_CA_PATH`         | `caPath`      |
	 *
	 * **PEM mode** (requires both `SWISH_CERT_PATH` and `SWISH_KEY_PATH`):
	 *
	 * | Variable           | Option        |
	 * |--------------------|---------------|
	 * | `SWISH_CERT_PATH`  | `certPath`    |
	 * | `SWISH_KEY_PATH`   | `keyPath`     |
	 * | `SWISH_CA_PATH`    | `caPath`      |
	 *
	 * **Shared:**
	 *
	 * | Variable           | Option        |
	 * |--------------------|---------------|
	 * | `SWISH_NUMBER`     | `swishNumber` |
	 * | `SWISH_ENV`        | `environment` |
	 *
	 * @throws {Error} If neither a valid PFX nor a complete PEM configuration is found.
	 */
	static fromEnv(): SwishClient {
		const environment: SwishEnvironment =
			process.env.SWISH_ENV === 'production' ? 'production' : 'test';

		const swishNumber = process.env.SWISH_NUMBER;

		if (process.env.SWISH_PFX_PATH) {
			return new SwishClient({
				tls: {
					type: 'pfx',
					pfxPath: process.env.SWISH_PFX_PATH,
					...(process.env.SWISH_PFX_PASSPHRASE && {
						passphrase: process.env.SWISH_PFX_PASSPHRASE,
					}),
					...(process.env.SWISH_CA_PATH && {
						caPath: process.env.SWISH_CA_PATH,
					}),
				},
				...(swishNumber && { swishNumber }),
				environment,
			});
		}

		if (process.env.SWISH_CERT_PATH && process.env.SWISH_KEY_PATH) {
			return new SwishClient({
				tls: {
					type: 'pem',
					certPath: process.env.SWISH_CERT_PATH,
					keyPath: process.env.SWISH_KEY_PATH,
					...(process.env.SWISH_CA_PATH && {
						caPath: process.env.SWISH_CA_PATH,
					}),
				},
				...(swishNumber && { swishNumber }),
				environment,
			});
		}

		throw new Error(
			'No valid TLS environment configuration found. ' +
				'Set SWISH_PFX_PATH for PFX mode, or both SWISH_CERT_PATH and SWISH_KEY_PATH for PEM mode.',
		);
	}
}
