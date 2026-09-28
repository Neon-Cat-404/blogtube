import { env } from "cloudflare:workers";

import {
    authCookie,
    createAuthToken,
    type SearchAuthType,
} from "@/app/lib/searchAuth";

type SecretBinding = {
    get(): Promise<string>;
};

type SearchEnv = {
    SEARCH_NORMAL_PASSWORD: SecretBinding;
    SEARCH_CHANNEL_PASSWORD: SecretBinding;
    SEARCH_AUTH_SECRET: SecretBinding;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            type?: SearchAuthType;
            password?: string;
        };

        if (body.type !== "normal" && body.type !== "channel") {
            return Response.json(
                { error: "Invalid search type" },
                { status: 400 },
            );
        }

        const searchEnv = env as unknown as SearchEnv;

        // Get the actual secret values from Cloudflare Secrets Store
        const normalPassword = await searchEnv.SEARCH_NORMAL_PASSWORD.get();

        const channelPassword = await searchEnv.SEARCH_CHANNEL_PASSWORD.get();

        const authSecret = await searchEnv.SEARCH_AUTH_SECRET.get();

        const expectedPassword =
            body.type === "normal" ? normalPassword : channelPassword;

        if (!expectedPassword) {
            return Response.json(
                { error: "Search password is not configured" },
                { status: 500 },
            );
        }

        if (body.password !== expectedPassword) {
            return Response.json(
                { error: "Invalid password" },
                { status: 401 },
            );
        }

        if (!authSecret) {
            return Response.json(
                { error: "SEARCH_AUTH_SECRET is not configured" },
                { status: 500 },
            );
        }

        const token = await createAuthToken(body.type, authSecret);

        return new Response(JSON.stringify({ authorized: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": authCookie(token),
            },
        });
    } catch (error) {
        console.error("AUTH ERROR:", error);

        return Response.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
