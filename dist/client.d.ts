/** The Swish API environment to target. */
export type SwishEnvironment = 'test' | 'production';
/** PEM TLS config supplied as raw certificate content. */
export type PemTlsRawConfig = {
    type: 'pem';
    /** PEM-encoded client certificate. */
    cert: string | Buffer;
    /** PEM-encoded private key. */
    key: string | Buffer;
    /** PEM-encoded CA certificate. Optional — omit to use system/platform trust store. */
    ca?: string | Buffer;
};
/** PEM TLS config supplied as file paths. */
export type PemTlsPathConfig = {
    type: 'pem';
    /** Path to the PEM-encoded client certificate file. */
    certPath: string;
    /** Path to the PEM-encoded private key file. */
    keyPath: string;
    /** Path to the PEM-encoded CA certificate file. Optional. */
    caPath?: string;
};
/** PFX/P12 TLS config supplied as raw binary content. */
export type PfxTlsRawConfig = {
    type: 'pfx';
    /** PFX/P12 archive as a Buffer or base64-encoded string. */
    pfx: string | Buffer;
    /** Passphrase to decrypt the PFX archive. */
    passphrase?: string;
    /** PEM-encoded CA certificate. Optional. */
    ca?: string | Buffer;
};
/** PFX/P12 TLS config supplied as a file path. */
export type PfxTlsPathConfig = {
    type: 'pfx';
    /** Path to the PFX/P12 archive file. */
    pfxPath: string;
    /** Passphrase to decrypt the PFX archive. */
    passphrase?: string;
    /** Path to the PEM-encoded CA certificate file. Optional. */
    caPath?: string;
};
/** PEM-based TLS configuration (raw content or file paths). */
export type PemTlsConfig = PemTlsRawConfig | PemTlsPathConfig;
/** PFX/P12-based TLS configuration (raw content or file path). */
export type PfxTlsConfig = PfxTlsRawConfig | PfxTlsPathConfig;
/** TLS configuration for the Swish client. */
export type TlsConfig = PemTlsConfig | PfxTlsConfig;
/** Options for configuring a {@link SwishClient}. */
/** Default base URLs (without version segment) for each environment. */
export declare const SWISH_BASE_URLS: Record<SwishEnvironment, string>;
export type SwishClientOptions = {
    /** Your Swish merchant phone number. */
    swishNumber?: string;
    /** TLS configuration. Use {@link PemTlsConfig} or {@link PfxTlsConfig}. */
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
    private readonly tlsOptions;
    private readonly environment;
    private readonly swishNumber?;
    private readonly _baseUrl;
    /**
     * Validates the resolved TLS options by attempting to create a TLS context.
     * @throws {Error} If the configuration is malformed or the key does not match the certificate.
     */
    private validateTlsConfig;
    /**
     * Creates a new {@link SwishClient}.
     * @param options - Configuration options including a {@link TlsConfig}.
     */
    constructor(options: SwishClientOptions);
    /**
     * Builds a versioned Swish API endpoint URL.
     * @param version - The API version string, e.g. `'v1'` or `'v2'`.
     * @param path - The path segment, e.g. `'/paymentrequests'`.
     * @returns The full URL, e.g. `'https://mss.cpc.getswish.net/swish-cpcapi/api/v1/paymentrequests'`.
     */
    endpointUrl(version: string, path: string): string;
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
     * @throws {Error} If neither a valid PFX nor a complete PEM configuration is found in the environment.
     */
    static fromEnv(): SwishClient;
}
//# sourceMappingURL=client.d.ts.map