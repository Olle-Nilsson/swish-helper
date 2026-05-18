import type { SwishClient } from '../client/SwishClient.ts';
import { transport } from '../client/transport.ts';

/** Shared fields for all Swish payment requests. */
type PaymentRequestBase = {
	/**
	 * A merchant-defined payment reference, shown to the payer in the Swish app.
	 * Max 35 characters.
	 */
	payeePaymentReference: string;
	/** The URL that Swish will POST the payment result to. */
	callbackUrl: string;
	/**
	 * The Swish number of the payee.
	 * Defaults to `swishNumber` on the {@link SwishClient} if not provided.
	 */
	payeeAlias?: string;
	/** The ISO 4217 currency code. Only `'SEK'` is supported. @defaultValue `'SEK'` */
	currency?: 'SEK';
	/** The amount to charge. Must be a positive number with at most two decimal places. */
	amount: string;
	/** A message shown to the payer in the Swish app. Max 50 characters. */
	message?: string;
	/** An identifier for the callback, used to verify its origin. */
	callbackIdentifier?: string;
};

/** Options for an e-commerce payment request (browser/desktop flow). */
export type ECommercePaymentRequest = PaymentRequestBase & {
	/**
	 * The Swish number of the payer. Required for e-commerce since the payer
	 * is not initiating the flow from their own device.
	 */
	payerAlias: string;
};

/** Options for an m-commerce payment request (in-app/mobile flow). */
export type MCommercePaymentRequest = PaymentRequestBase;

/** Result of a successful e-commerce payment request. */
export type ECommercePaymentResult = {
	/** The instruction ID that was generated for this payment request. */
	instructionId: string;
	/**
	 * The URL of the created payment request resource, returned in the
	 * `location` response header.
	 */
	location: string;
};

/** Result of a successful m-commerce payment request. */
export type MCommercePaymentResult = {
	/** The instruction ID that was generated for this payment request. */
	instructionId: string;
	/**
	 * The URL of the created payment request resource, returned in the
	 * `location` response header.
	 */
	location: string;
	/**
	 * The token used to launch the Swish app on the payer's device, returned
	 * in the `paymentrequesttoken` response header.
	 */
	paymentRequestToken: string;
};

function generateInstructionId(): string {
	return crypto.randomUUID().replace(/-/g, '').toUpperCase();
}

/**
 * Creates an e-commerce payment request.
 *
 * Use this flow when the payer is on a different device (browser/desktop).
 * The payer's Swish number (`payerAlias`) is required.
 *
 * @param client - An authenticated {@link SwishClient}.
 * @param request - The payment request options.
 * @returns The instruction ID and the `location` URL of the created resource.
 * @throws {Error} If `payeeAlias` is not set on the client or in the request.
 * @throws {SwishApiError} If the Swish API returns a non-2xx response.
 */
export async function createECommercePayment(
	client: SwishClient,
	request: ECommercePaymentRequest,
): Promise<ECommercePaymentResult> {
	const instructionId = generateInstructionId();
	const payeeAlias = request.payeeAlias ?? client.swishNumber;

	if (!payeeAlias) {
		throw new Error(
			'payeeAlias is required. Provide it in the request or set swishNumber on the SwishClient.',
		);
	}

	const url = client.endpointUrl('v2', `paymentrequests/${instructionId}`);

	const { headers } = await transport(client.tlsOptions, 'PUT', url, {
		payeePaymentReference: request.payeePaymentReference,
		callbackUrl: request.callbackUrl,
		payeeAlias,
		currency: request.currency ?? 'SEK',
		payerAlias: request.payerAlias,
		amount: request.amount,
		...(request.message !== undefined && { message: request.message }),
		...(request.callbackIdentifier !== undefined && {
			callbackIdentifier: request.callbackIdentifier,
		}),
	});

	const location = headers['location'];

	if (!location) {
		throw new Error('Swish API did not return a location header.');
	}

	return {
		instructionId,
		location: Array.isArray(location) ? location[0]! : location,
	};
}

/**
 * Creates an m-commerce payment request.
 *
 * Use this flow when the payer is on the same device as the merchant app.
 * No `payerAlias` is needed — Swish returns a `paymentRequestToken` to launch
 * the Swish app directly.
 *
 * @param client - An authenticated {@link SwishClient}.
 * @param request - The payment request options.
 * @returns The instruction ID and the `paymentRequestToken` to launch the Swish app.
 * @throws {Error} If `payeeAlias` is not set on the client or in the request.
 * @throws {SwishApiError} If the Swish API returns a non-2xx response.
 */
export async function createMCommercePayment(
	client: SwishClient,
	request: MCommercePaymentRequest,
): Promise<MCommercePaymentResult> {
	const instructionId = generateInstructionId();
	const payeeAlias = request.payeeAlias ?? client.swishNumber;

	if (!payeeAlias) {
		throw new Error(
			'payeeAlias is required. Provide it in the request or set swishNumber on the SwishClient.',
		);
	}

	const url = client.endpointUrl('v2', `paymentrequests/${instructionId}`);

	const { headers } = await transport(client.tlsOptions, 'PUT', url, {
		payeePaymentReference: request.payeePaymentReference,
		callbackUrl: request.callbackUrl,
		payeeAlias,
		currency: request.currency ?? 'SEK',
		amount: request.amount,
		...(request.message !== undefined && { message: request.message }),
		...(request.callbackIdentifier !== undefined && {
			callbackIdentifier: request.callbackIdentifier,
		}),
	});

	const token = headers['paymentrequesttoken'];
	const location = headers['location'];

	if (!token) {
		throw new Error(
			'Swish API did not return a paymentrequesttoken header.',
		);
	}

	if (!location) {
		throw new Error('Swish API did not return a location header.');
	}

	return {
		instructionId,
		location: Array.isArray(location) ? location[0]! : location,
		paymentRequestToken: Array.isArray(token) ? token[0]! : token,
	};
}
