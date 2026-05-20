import { SWISH_BASE_URLS, buildEndpointUrl } from "./endpoints.js";
import { transport, } from "./transport.js";
import { resolveTlsOptions } from "../tls/resolveTlsOptions.js";
import { validateTlsConfig } from "../tls/validateTlsConfig.js";
import { createECommercePayment, createMCommercePayment, } from "../payments/paymentRequest.js";
/** Client for interacting with the Swish payment API. */
export class SwishClient {
    tlsOptions;
    environment;
    swishNumber;
    _baseUrl;
    /**
     * Creates a new {@link SwishClient}.
     * @param options - Configuration options including a {@link TlsConfig}.
     */
    constructor(options) {
        this.tlsOptions = resolveTlsOptions(options.tls);
        this.environment = options.environment ?? 'test';
        this._baseUrl = options.baseUrl ?? SWISH_BASE_URLS[this.environment];
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
    endpointUrl(version, path) {
        return buildEndpointUrl(this._baseUrl, version, path);
    }
    /**
     * Makes an authenticated HTTPS request to the Swish API.
     * @param options - Request options including method, path, body, and headers.
     * @param url - The full endpoint URL (use {@link endpointUrl} to build it).
     * @returns The parsed response body and raw response headers.
     * @throws {SwishApiError} If the server returns a non-2xx status code.
     */
    request(options, url) {
        return transport(this.tlsOptions, options.method, url, options.body);
    }
    /**
     * Creates an e-commerce payment request.
     * @param request - The payment request options, including the payer's Swish number.
     * @returns The instruction ID and the `location` URL of the created resource.
     * @throws {Error} If `payeeAlias` is not set on the client or in the request.
     * @throws {SwishApiError} If the Swish API returns a non-2xx response.
     */
    createECommercePayment(request) {
        return createECommercePayment(this, request);
    }
    /**
     * Creates an m-commerce payment request.
     * @param request - The payment request options.
     * @returns The instruction ID and the `paymentRequestToken` to launch the Swish app.
     * @throws {Error} If `payeeAlias` is not set on the client or in the request.
     * @throws {SwishApiError} If the Swish API returns a non-2xx response.
     */
    createMCommercePayment(request) {
        return createMCommercePayment(this, request);
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
    static fromEnv() {
        const environment = process.env.SWISH_ENV === 'production' ? 'production' : 'test';
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
        throw new Error('No valid TLS environment configuration found. ' +
            'Set SWISH_PFX_PATH for PFX mode, or both SWISH_CERT_PATH and SWISH_KEY_PATH for PEM mode.');
    }
}
//# sourceMappingURL=SwishClient.js.map