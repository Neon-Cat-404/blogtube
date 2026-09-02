import { env } from "cloudflare:workers";

import {
    getFeedVideos,
    getChannelLatestVideos,
} from "@/app/lib/youtube";

export async function GET(request: Request) {
    const url = new URL(request.url);

    const period = url.searchParams.get("period");
    const channelId = url.searchParams.get("channel");

    try {
        const apiKey = env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error("YOUTUBE_API_KEY is not available");
        }

        // Specific channel
        if (channelId) {
            const videos = await getChannelLatestVideos(
                apiKey,
                channelId
            );

            return Response.json({ videos });
        }

        // Today / This week
        if (period !== "today" && period !== "week") {
            return Response.json(
                {
                    error: "period must be 'today' or 'week'",
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
            },
            { status: 500 }
        );
    }
}