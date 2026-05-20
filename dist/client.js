import { existsSync, readFileSync } from 'fs';
import { createSecureContext } from 'tls';
/** Options for configuring a {@link SwishClient}. */
/** Default base URLs (without version segment) for each environment. */
export const SWISH_BASE_URLS = {
    test: 'https://mss.cpc.getswish.net/swish-cpcapi/api',
    production: 'https://cpc.getswish.net/swish-cpcapi/api',
};
/**
 * Normalises PEM content: trims surrounding whitespace and converts Windows
 * line endings (CRLF) to Unix (LF), then returns a Buffer.
 *
 * Do NOT use this for binary PFX/P12 data.
 */
function normalizePemContent(value) {
    const pem = Buffer.isBuffer(value) ? value.toString('utf8') : value;
    return Buffer.from(pem.trim().replace(/\r\n/g, '\n'));
}
/**
 * Reads a file from disk and returns its raw contents as a Buffer.
 * @throws {Error} If the file does not exist at the given path.
 */
function loadCertFromFile(path) {
    if (!existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    return readFileSync(path);
}
/**
 * Resolves a {@link TlsConfig} into a `SecureContextOptions` object suitable
 * for passing directly to `tls.createSecureContext` or `https.Agent`.
 */
function resolveTlsOptions(tls) {
    if (tls.type !== 'pem' && tls.type !== 'pfx') {
        throw new Error(`Invalid TLS config: expected type to be "pem" or "pfx", got ${JSON.stringify(tls.type ?? 'undefined')}. Did you forget to add type: "pem"?`);
    }
    if (tls.type === 'pem') {
        if ('cert' in tls) {
            return {
                cert: normalizePemContent(tls.cert),
                key: normalizePemContent(tls.key),
                ...(tls.ca !== undefined && {
                    ca: normalizePemContent(tls.ca),
                }),
            };
        }
        else {
            return {
                cert: loadCertFromFile(tls.certPath),
                key: loadCertFromFile(tls.keyPath),
                ...(tls.caPath !== undefined && {
                    ca: loadCertFromFile(tls.caPath),
                }),
            };
        }
    }
    else {
        if ('pfx' in tls) {
            return {
                pfx: tls.pfx,
                ...(tls.passphrase !== undefined && {
                    passphrase: tls.passphrase,
                }),
                ...(tls.ca !== undefined && {
                    ca: normalizePemContent(tls.ca),
                }),
            };
        }
        else {
            return {
                pfx: loadCertFromFile(tls.pfxPath),
                ...(tls.passphrase !== undefined && {
                    passphrase: tls.passphrase,
                }),
                ...(tls.caPath !== undefined && {
                    ca: loadCertFromFile(tls.caPath),
                }),
            };
        }
    }
}
// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
/** Client for interacting with the Swish payment API. */
export class SwishClient {
    tlsOptions;
    environment;
    swishNumber;
    _baseUrl;
    /**
     * Validates the resolved TLS options by attempting to create a TLS context.
     * @throws {Error} If the configuration is malformed or the key does not match the certificate.
     */
    validateTlsConfig() {
        try {
            createSecureContext(this.tlsOptions);
        }
        catch (err) {
            throw new Error(`Invalid TLS configuration: ${err.message}`);
        }
    }
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
        this.validateTlsConfig();
    }
    /**
     * Builds a versioned Swish API endpoint URL.
     * @param version - The API version string, e.g. `'v1'` or `'v2'`.
     * @param path - The path segment, e.g. `'/paymentrequests'`.
     * @returns The full URL, e.g. `'https://mss.cpc.getswish.net/swish-cpcapi/api/v1/paymentrequests'`.
     */
    endpointUrl(version, path) {
        const base = this._baseUrl.replace(/\/$/, '');
        const p = path.startsWith('/') ? path : `/${path}`;
        return `${base}/${version}${p}`;
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
     * @throws {Error} If neither a valid PFX nor a complete PEM configuration is found in the environment.
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
//# sourceMappingURL=client.js.map