const COOKIE_NAME = "blogtube_search_auth";
const TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

export type SearchAuthType = "normal" | "channel";

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(value)
    );

    return bytesToBase64(new Uint8Array(signature));
}

export async function createAuthToken(
    type: SearchAuthType,
    secret: string
): Promise<string> {
    const payload = `${type}.${Date.now()}`;
    const signature = await sign(payload, secret);
    return `${btoa(payload)}.${signature}`;
}

export async function verifyAuthToken(
    token: string | undefined,
    type: SearchAuthType,
    secret: string
): Promise<boolean> {
    if (!token) return false;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return false;

    try {
        const payload = new TextDecoder().decode(
            base64ToBytes(encodedPayload)
        );
        const [tokenType, timestamp] = payload.split(".");

        if (tokenType !== type) return false;

        const time = Number(timestamp);
        if (!Number.isFinite(time) || Date.now() - time > TOKEN_TTL) {
            return false;
        }

        const expected = await sign(payload, secret);
        if (expected.length !== signature.length) return false;

        let mismatch = 0;
        for (let i = 0; i < expected.length; i++) {
            mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
        }

        return mismatch === 0;
    } catch {
        return false;
    }
}

export function getAuthCookie(request: Request): string | undefined {
    const cookies = request.headers.get("Cookie") ?? "";

    for (const part of cookies.split(";")) {
        const [name, ...value] = part.trim().split("=");
        if (name === COOKIE_NAME) return value.join("=");
    }

    return undefined;
}

export function authCookie(token: string): string {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TOKEN_TTL / 1000}`;
}
