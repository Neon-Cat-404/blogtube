import { CHANNELS } from "./channels";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export type Video = {
    id: string;
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnail: string;
    duration: string;
    views: number;
};

type YouTubeChannelResponse = {
    items?: {
        id: string;
        contentDetails: {
            relatedPlaylists: {
                uploads: string;
            };
        };
    }[];
};

type PlaylistItem = {
    contentDetails: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
    };
};

type PlaylistResponse = {
    items?: PlaylistItem[];
};

type VideoDetails = {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
    };
    contentDetails: {
        duration: string;
    };
    statistics: {
        viewCount?: string;
    };
};

type VideosResponse = {
    items?: VideoDetails[];
};

async function youtube<T>(
    apiKey: string,
    endpoint: string,
    params: Record<string, string>
): Promise<T> {
    const searchParams = new URLSearchParams({
        ...params,
        key: apiKey,
    });

    const response = await fetch(
        `${API_BASE}/${endpoint}?${searchParams.toString()}`
    );

    if (!response.ok) {
        const text = await response.text();

        throw new Error(
            `YouTube API error: ${response.status} ${text}`
        );
    }

    return response.json() as Promise<T>;
}

/**
 * Get the uploads playlist for a channel.
 */
async function getUploadsPlaylist(
    apiKey: string,
    channelId: string
): Promise<string> {
    const data = await youtube<YouTubeChannelResponse>(
        apiKey,
        "channels",
        {
            part: "contentDetails",
            id: channelId,
        }
    );

    const playlist =
        data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!playlist) {
        throw new Error(
            `Could not find uploads playlist for ${channelId}`
        );
    }

    return playlist;
}

/**
 * Get recent videos from a channel.
 */
async function getChannelVideos(
    apiKey: string,
    channelId: string,
    maxResults = 50
): Promise<Video[]> {
    const uploadsPlaylist = await getUploadsPlaylist(
        apiKey,
        channelId
    );

    const playlist = await youtube<PlaylistResponse>(
        apiKey,
        "playlistItems",
        {
            part: "snippet,contentDetails",
            playlistId: uploadsPlaylist,
            maxResults: String(maxResults),
        }
    );

    const items = playlist.items ?? [];

    if (items.length === 0) {
        return [];
    }

    const videoIds = items
        .map((item) => item.contentDetails.videoId)
        .filter(Boolean);

    if (videoIds.length === 0) {
        return [];
    }

    const details = await youtube<VideosResponse>(
        apiKey,
        "videos",
        {
            part: "snippet,contentDetails,statistics",
            id: videoIds.join(","),
        }
    );

    return (details.items ?? []).map((video) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
        duration: video.contentDetails.duration,
        views: Number(video.statistics.viewCount ?? 0),
    }));
}

/**
 * Get the latest videos across ALL configured channels.
 */
export async function getFeedVideos(
    apiKey: string,
    period: "today" | "week"
): Promise<Video[]> {
    const now = Date.now();

    const cutoff =
        period === "today"
            ? now - 24 * 60 * 60 * 1000
            : now - 7 * 24 * 60 * 60 * 1000;

    const results = await Promise.all(
        CHANNELS.map((channel) =>
            getChannelVideos(apiKey, channel.id, 50)
        )
    );

    const videos = results
        .flat()
        .filter(
            (video) =>
                new Date(video.publishedAt).getTime() >= cutoff
        );

    videos.sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
    );

    return videos.slice(0, 12);
}

/**
 * Get the latest 8 videos from ONE channel.
 */
export async function getChannelLatestVideos(
    apiKey: string,
    channelId: string
): Promise<Video[]> {
    const videos = await getChannelVideos(
        apiKey,
        channelId,
        50
    );

    videos.sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
    );

    return videos.slice(0, 8);
}