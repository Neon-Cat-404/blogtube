import { env } from "cloudflare:workers";
import {
    authCookie,
    createAuthToken,
    type SearchAuthType,
} from "@/app/lib/searchAuth";

type SearchEnv = {
    SEARCH_NORMAL_PASSWORD?: string;
    SEARCH_CHANNEL_PASSWORD?: string;
    SEARCH_AUTH_SECRET?: string;
};

export async function POST(request: Request) {
    try {
        const body = await request.json() as {
            type?: SearchAuthType;
            password?: string;
        };

        if (body.type !== "normal" && body.type !== "channel") {
            return Response.json(
                { error: "Invalid search type" },
                { status: 400 }
            );
        }

        const searchEnv = env as unknown as SearchEnv;

        const expectedPassword =
            body.type === "normal"
                ? searchEnv.SEARCH_NORMAL_PASSWORD
                : searchEnv.SEARCH_CHANNEL_PASSWORD;

        if (!expectedPassword || body.password !== expectedPassword) {
            return Response.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        if (!searchEnv.SEARCH_AUTH_SECRET) {
            throw new Error("SEARCH_AUTH_SECRET is not configured");
        }

        const token = await createAuthToken(
            body.type,
            searchEnv.SEARCH_AUTH_SECRET
        );

        return new Response(
            JSON.stringify({ authorized: true }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie": authCookie(token),
                },
            }
        );
    } catch (error) {
        console.error("AUTH ERROR:", error);

        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 500 }
        );
    }
}
