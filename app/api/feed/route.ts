import { env } from "cloudflare:workers";

import {
    getFeedVideos,
    getChannelLatestVideos,
    getChannelIdFromHandle,
    searchVideos,
} from "@/app/lib/youtube";
import {
    getAuthCookie,
    verifyAuthToken,
} from "@/app/lib/searchAuth;

export async function GET(request: Request) {
    const url = new URL(request.url);

    const period = url.searchParams.get("period");
    const channelId = url.searchParams.get("channel");
    const username = url.searchParams.get("username");
    const query = url.searchParams.get("q");

    const searchEnv = env as unknown as {
        SEARCH_AUTH_SECRET?: string;
    };

    try {
        const apiKey = env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error("YOUTUBE_API_KEY is not available");
        }

        // Normal YouTube search requires the normal-search password.
        if (query?.trim()) {
            if (
                !searchEnv.SEARCH_AUTH_SECRET ||
                !(await verifyAuthToken(
                    getAuthCookie(request),
                    "normal",
                    searchEnv.SEARCH_AUTH_SECRET
                ))
            ) {
                return Response.json(
                    { error: "Normal search authorization required", videos: [] },
                    { status: 401 }
                );
            }

            const videos = await searchVideos(
                apiKey,
                query.trim()
            );

            return Response.json({ videos });
        }

        // @channel search requires the separate channel-search password.
        if (username?.trim()) {
            if (
                !searchEnv.SEARCH_AUTH_SECRET ||
                !(await verifyAuthToken(
                    getAuthCookie(request),
                    "channel",
                    searchEnv.SEARCH_AUTH_SECRET
                ))
            ) {
                return Response.json(
                    { error: "Channel search authorization required", videos: [] },
                    { status: 401 }
                );
            }
            const foundChannelId =
                await getChannelIdFromHandle(
                    apiKey,
                    username.trim()
                );

            if (!foundChannelId) {
                return Response.json(
                    {
                        error: "Channel not found",
                        videos: [],
                    },
                    { status: 404 }
                );
            }

            const videos =
                await getChannelLatestVideos(
                    apiKey,
                    foundChannelId
                );

            return Response.json({
                videos,
                channelId: foundChannelId,
            });
        }

        // Existing configured channel
        if (channelId) {
            const videos =
                await getChannelLatestVideos(
                    apiKey,
                    channelId
                );

            return Response.json({ videos });
        }

        // Today / This week
        if (
            period !== "today" &&
            period !== "week"
        ) {
            return Response.json(
                {
                    error:
                        "period must be 'today' or 'week'",
                },
                { status: 400 }
            );
        }

        const videos = await getFeedVideos(
            apiKey,
            period
        );

        return Response.json({ videos });
    } catch (error) {
        console.error("FEED ERROR:", error);

        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                videos: [],
            },
            { status: 500 }
        );
    }
}