import { env } from "cloudflare:workers";
import { getThumbnail } from "@/app/lib/thumbnails";

export async function GET(
    request: Request,
    context: {
        params: Promise<{ videoId: string }>;
    }
) {
    const { videoId } = await context.params;

    if (!videoId) {
        return new Response("Missing video ID", {
            status: 400,
        });
    }

    return getThumbnail(
        env.THUMBNAILS,
        videoId
    );
}