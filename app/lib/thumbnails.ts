import type { R2Bucket } from "@cloudflare/workers-types";

export async function getThumbnail(
    bucket: R2Bucket,
    videoId: string
): Promise<Response> {
    const key = `youtube/thumbnails/${videoId}.jpg`;

    // Check R2 first
    const existing = await bucket.get(key);

    if (existing) {
        const image = await existing.arrayBuffer();

        return new Response(image, {
            headers: {
                "Content-Type":
                    existing.httpMetadata?.contentType ?? "image/jpeg",
                "Cache-Control":
                    "public, max-age=31536000, immutable",
            },
        });
    }

    // Not in R2 → fetch from YouTube
    const youtubeUrl =
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const response = await fetch(youtubeUrl);

    if (!response.ok) {
        return new Response("Thumbnail unavailable", {
            status: 404,
        });
    }

    const image = await response.arrayBuffer();

    // Store in R2
    await bucket.put(key, image, {
        httpMetadata: {
            contentType:
                response.headers.get("content-type") ?? "image/jpeg",
            cacheControl:
                "public, max-age=31536000, immutable",
        },
    });

    // Return the same image to browser
    return new Response(image, {
        headers: {
            "Content-Type":
                response.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control":
                "public, max-age=31536000, immutable",
        },
    });
}