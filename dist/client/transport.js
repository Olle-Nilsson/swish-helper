import { request as httpsRequest } from 'https';
import { SwishApiError } from "../errors/errors.js";
/**
 * Makes an mTLS HTTPS request to the Swish API.
 *
 * @param tlsOptions - The resolved TLS options used to authenticate the request.
 * @param method - The HTTP method.
 * @param url - The full endpoint URL.
 * @param body - Optional request body. Will be serialised to JSON.
 * @returns The parsed response body and raw response headers.
 * @throws {SwishApiError} If the server returns a non-2xx status code.
 */
export function transport(tlsOptions, method, url, body) {
    return new Promise((resolve, reject) => {
        const payload = body !== undefined ? JSON.stringify(body) : undefined;
        const parsedUrl = new URL(url);
        const req = httpsRequest({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(payload !== undefined && {
                    'Content-Length': Buffer.byteLength(payload),
                }),
            },
            ...tlsOptions,
        }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf8').trim();
                const statusCode = res.statusCode ?? 0;
                if (statusCode < 200 || statusCode >= 300) {
                    let parsed = raw;
                    try {
                        parsed = JSON.parse(raw);
                    }
                    catch {
                        // keep raw string
                    }
                    reject(new SwishApiError(statusCode, parsed));
                    return;
                }
                if (!raw) {
                    resolve({ body: null, headers: res.headers });
                    return;
                }
                try {
                    resolve({
                        body: JSON.parse(raw),
                        headers: res.headers,
                    });
                }
                catch {
                    reject(new Error(`Failed to parse Swish API response: ${raw}`));
                }
            });
            res.on('error', reject);
        });
        req.on('error', reject);
        if (payload !== undefined) {
            req.write(payload);
        }
        req.end();
    });
}
//# sourceMappingURL=transport.js.map