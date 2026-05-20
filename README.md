# swish-helper

A Node.js/TypeScript package for integrating with the [Swish](https://www.swish.nu/) payment API. Handles TLS certificate auth, e-commerce and m-commerce payment requests, and environment-based configuration.

## Requirements

- Node.js 18+
- A Swish merchant certificate (PEM or PFX/P12 format), obtained from your bank. For testing, you can use the test certificates provided in the [Swish developer documentation](https://developer.swish.nu/documentation/environments)

## Installation

Install directly from GitHub:

```bash
npm install github:Olle-Nilsson/swish-helper
```

Or a specific version tag:

```bash
npm install github:Olle-Nilsson/swish-helper#v0.3.0
```

The package will be built automatically during installation.

## Usage

### Create a client with a PFX certificate

```ts
import { SwishClient } from 'swish-helper';

const client = new SwishClient({
	swishNumber: '1234679304',
	environment: 'test', // or 'production'
	tls: {
		type: 'pfx',
		pfxPath: './certs/swish.p12',
		passphrase: 'swish',
	},
});
```

### Create a client with PEM certificates

```ts
const client = new SwishClient({
	swishNumber: '1234679304',
	environment: 'test',
	tls: {
		type: 'pem',
		certPath: './certs/swish.crt',
		keyPath: './certs/swish.key',
		caPath: './certs/swish-ca.crt', // optional
	},
});
```

### Create a client from environment variables

```ts
const client = SwishClient.fromEnv();
```

The following environment variables are supported:

**PFX mode** (used when `SWISH_PFX_PATH` is set):

| Variable               | Description                 |
| ---------------------- | --------------------------- |
| `SWISH_PFX_PATH`       | Path to the PFX/P12 file    |
| `SWISH_PFX_PASSPHRASE` | Passphrase for the PFX file |
| `SWISH_CA_PATH`        | Path to the CA certificate  |

**PEM mode** (used when `SWISH_CERT_PATH` and `SWISH_KEY_PATH` are set):

| Variable          | Description                 |
| ----------------- | --------------------------- |
| `SWISH_CERT_PATH` | Path to the PEM certificate |
| `SWISH_KEY_PATH`  | Path to the PEM private key |
| `SWISH_CA_PATH`   | Path to the CA certificate  |

**Shared:**

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `SWISH_NUMBER` | Your Swish merchant number           |
| `SWISH_ENV`    | `'production'` or `'test'` (default) |

### E-commerce payment (browser/desktop flow)

Use this when the payer is on a different device. The payer's Swish number is required.

```ts
const result = await client.createECommercePayment({
	payeePaymentReference: 'ORDER-123',
	callbackUrl: 'https://example.com/swish/callback',
	payerAlias: '4671234567', // payer's Swish number
	amount: '100.00',
	message: 'Payment for order #123',
});

console.log(result.instructionId); // UUID without dashes
console.log(result.location); // URL to poll for payment status
```

### M-commerce payment (in-app/mobile flow)

Use this when the payer is on the same device. Returns a token to launch the Swish app.

```ts
const result = await client.createMCommercePayment({
	payeePaymentReference: 'ORDER-456',
	callbackUrl: 'https://example.com/swish/callback',
	amount: '250.00',
	message: 'Payment for order #456',
});

console.log(result.paymentRequestToken); // Use to launch the Swish app
console.log(result.location); // URL to poll for payment status
```

### Error handling

```ts
import { SwishApiError } from 'swish-helper';

try {
	await client.createECommercePayment({
		/* ... */
	});
} catch (err) {
	if (err instanceof SwishApiError) {
		console.error(`Swish API error: HTTP ${err.statusCode}`, err.body);
	}
	throw err;
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
