/** Options for creating a Swish payment request. */
export type CreatePaymentRequestOptions = {
    /**
     * A reference set by the merchant for the payment.
     * Can be used to correlate the payment with an order in your system.
     */
    payeePaymentReference: string;
    /** URL that Swish will call with the payment result. */
    callbackUrl: string;
    /**
     * The merchant's Swish number.
     * Defaults to {@link SwishClientOptions.swishNumber} if set on the client.
     */
    payeeAlias?: string;
    /**
     * The amount to charge, in SEK.
     * Must be between 1 and 999999999999.99.
     * Accepts a number or a string (e.g. `'100.00'`).
     */
    amount: string | number;
    /**
     * The payer's Swish number.
     * Omit for M-Commerce flows (QR code / deep-link).
     */
    payerAlias?: string;
    /**
     * Message shown to the payer. Max 50 characters.
     * Only ASCII characters are allowed.
     */
    message?: string;
    /**
     * A custom identifier used as the `instructionId` (idempotency key).
     * Must be a 32-character uppercase hex string (UUID without dashes).
     * Auto-generated if omitted.
     */
    instructionId?: string;
};
/** The result of a successful {@link SwishClient.createPaymentRequest} call. */
export type PaymentRequestResult = {
    /** The instruction ID (idempotency key) that was sent to Swish. */
    id: string;
    /** The Swish API URL for this payment request. */
    location: string;
};
//# sourceMappingURL=payments.d.ts.map