import type { SecureContextOptions } from 'tls';
import type { TlsConfig } from './types.ts';
/**
 * Normalises PEM content: trims surrounding whitespace and converts Windows
 * line endings (CRLF) to Unix (LF), then returns a Buffer.
 *
 * Do NOT use this for binary PFX/P12 data.
 * @param value - PEM-encoded string or Buffer to normalise.
 * @returns A normalised Buffer with Unix line endings.
 */
export declare function normalizePemContent(value: string | Buffer): Buffer;
/**
 * Reads a file from disk and returns its raw contents as a Buffer.
 * @param path - Absolute or relative path to the file.
 * @returns The file contents as a Buffer.
 * @throws {Error} If the file does not exist at the given path.
 */
export declare function loadCertFromFile(path: string): Buffer;
/**
 * Resolves a {@link TlsConfig} into a `SecureContextOptions` object suitable
 * for passing directly to `tls.createSecureContext` or `https.Agent`.
 * @param tls - The TLS configuration to resolve.
 * @returns A `SecureContextOptions` object with cert/key/pfx fields populated.
 * @throws {Error} If `tls.type` is not `'pem'` or `'pfx'`.
 */
export declare function resolveTlsOptions(tls: TlsConfig): SecureContextOptions;
//# sourceMappingURL=resolveTlsOptions.d.ts.map