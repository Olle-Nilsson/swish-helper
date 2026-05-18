import { createSecureContext, type SecureContextOptions } from 'tls';

/**
 * Validates TLS options by attempting to create a secure context.
 * @throws {Error} If the configuration is malformed or the key does not match the certificate.
 */
export function validateTlsConfig(tlsOptions: SecureContextOptions): void {
	try {
		createSecureContext(tlsOptions);
	} catch (err) {
		throw new Error(`Invalid TLS configuration: ${(err as Error).message}`);
	}
}
