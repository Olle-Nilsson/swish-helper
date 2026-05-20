import { type SecureContextOptions } from 'tls';
/**
 * Validates TLS options by attempting to create a secure context.
 * @throws {Error} If the configuration is malformed or the key does not match the certificate.
 */
export declare function validateTlsConfig(tlsOptions: SecureContextOptions): void;
//# sourceMappingURL=validateTlsConfig.d.ts.map