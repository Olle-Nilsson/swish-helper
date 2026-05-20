import { createSecureContext } from 'tls';
/**
 * Validates TLS options by attempting to create a secure context.
 * @throws {Error} If the configuration is malformed or the key does not match the certificate.
 */
export function validateTlsConfig(tlsOptions) {
    try {
        createSecureContext(tlsOptions);
    }
    catch (err) {
        throw new Error(`Invalid TLS configuration: ${err.message}`);
    }
}
//# sourceMappingURL=validateTlsConfig.js.map