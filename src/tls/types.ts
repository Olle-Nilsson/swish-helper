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
