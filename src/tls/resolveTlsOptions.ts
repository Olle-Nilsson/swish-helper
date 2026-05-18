import { existsSync, readFileSync } from 'fs';
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
export function normalizePemContent(value: string | Buffer): Buffer {
	const pem = Buffer.isBuffer(value) ? value.toString('utf8') : value;
	return Buffer.from(pem.trim().replace(/\r\n/g, '\n'));
}

/**
 * Reads a file from disk and returns its raw contents as a Buffer.
 * @param path - Absolute or relative path to the file.
 * @returns The file contents as a Buffer.
 * @throws {Error} If the file does not exist at the given path.
 */
export function loadCertFromFile(path: string): Buffer {
	if (!existsSync(path)) {
		throw new Error(`File not found: ${path}`);
	}
	return readFileSync(path);
}

/**
 * Resolves a {@link TlsConfig} into a `SecureContextOptions` object suitable
 * for passing directly to `tls.createSecureContext` or `https.Agent`.
 * @param tls - The TLS configuration to resolve.
 * @returns A `SecureContextOptions` object with cert/key/pfx fields populated.
 * @throws {Error} If `tls.type` is not `'pem'` or `'pfx'`.
 */
export function resolveTlsOptions(tls: TlsConfig): SecureContextOptions {
	if (tls.type !== 'pem' && tls.type !== 'pfx') {
		throw new Error(
			`Invalid TLS config: expected type to be "pem" or "pfx", got ${JSON.stringify((tls as Record<string, unknown>).type ?? 'undefined')}. Did you forget to add type: "pem"?`,
		);
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
		} else {
			return {
				cert: loadCertFromFile(tls.certPath),
				key: loadCertFromFile(tls.keyPath),
				...(tls.caPath !== undefined && {
					ca: loadCertFromFile(tls.caPath),
				}),
			};
		}
	} else {
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
		} else {
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
