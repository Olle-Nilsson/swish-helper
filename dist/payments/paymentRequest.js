import { transport } from "../client/transport.js";
function generateInstructionId() {
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
export async function createECommercePayment(client, request) {
    const instructionId = generateInstructionId();
    const payeeAlias = request.payeeAlias ?? client.swishNumber;
    if (!payeeAlias) {
        throw new Error('payeeAlias is required. Provide it in the request or set swishNumber on the SwishClient.');
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
        location: Array.isArray(location) ? location[0] : location,
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
export async function createMCommercePayment(client, request) {
    const instructionId = generateInstructionId();
    const payeeAlias = request.payeeAlias ?? client.swishNumber;
    if (!payeeAlias) {
        throw new Error('payeeAlias is required. Provide it in the request or set swishNumber on the SwishClient.');
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
        throw new Error('Swish API did not return a paymentrequesttoken header.');
    }
    if (!location) {
        throw new Error('Swish API did not return a location header.');
    }
    return {
        instructionId,
        location: Array.isArray(location) ? location[0] : location,
        paymentRequestToken: Array.isArray(token) ? token[0] : token,
    };
}
//# sourceMappingURL=paymentRequest.js.map