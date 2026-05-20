import type { SecureContextOptions } from 'tls';
import { type RequestOptions, type TransportResponse } from './transport.ts';
import type { TlsConfig, SwishEnvironment } from '../tls/types.ts';
import type { ECommercePaymentRequest, ECommercePaymentResult, MCommercePaymentRequest, MCommercePaymentResult } from '../payments/paymentRequest.ts';
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
export declare class SwishClient {
    readonly tlsOptions: SecureContextOptions;
    readonly environment: SwishEnvironment;
    readonly swishNumber?: string;
    private readonly _baseUrl;
    /**
     * Creates a new {@link SwishClient}.
     * @param options - Configuration options including a {@link TlsConfig}.
     */
    constructor(options: SwishClientOptions);
    /**
     * Builds a versioned Swish API endpoint URL.
     * @param version - The API version string, e.g. `'v1'` or `'v2'`.
     * @param path - The path segment, e.g. `'paymentrequests'`.
     * @returns The full URL.
     */
    endpointUrl(version: string, path: string): string;
    /**
     * Makes an authenticated HTTPS request to the Swish API.
     * @param options - Request options including method, path, body, and headers.
     * @param url - The full endpoint URL (use {@link endpointUrl} to build it).
     * @returns The parsed response body and raw response headers.
     * @throws {SwishApiError} If the server returns a non-2xx status code.
     */
    request<T>(options: RequestOptions, url: string): Promise<TransportResponse<T>>;
    /**
     * Creates an e-commerce payment request.
     * @param request - The payment request options, including the payer's Swish number.
     * @returns The instruction ID and the `location` URL of the created resource.
     * @throws {Error} If `payeeAlias` is not set on the client or in the request.
     * @throws {SwishApiError} If the Swish API returns a non-2xx response.
     */
    createECommercePayment(request: ECommercePaymentRequest): Promise<ECommercePaymentResult>;
    /**
     * Creates an m-commerce payment request.
     * @param request - The payment request options.
     * @returns The instruction ID and the `paymentRequestToken` to launch the Swish app.
     * @throws {Error} If `payeeAlias` is not set on the client or in the request.
     * @throws {SwishApiError} If the Swish API returns a non-2xx response.
     */
    createMCommercePayment(request: MCommercePaymentRequest): Promise<MCommercePaymentResult>;
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
    static fromEnv(): SwishClient;
}
//# sourceMappingURL=SwishClient.d.ts.map