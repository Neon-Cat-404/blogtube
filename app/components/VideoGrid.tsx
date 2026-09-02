"use client";

import VideoCard from "./VideoCard";

type Video = {
    id: string;
    title: string;
    channelTitle: string;
    publishedAt: string;
    duration: string;
    views: number;
};

export default function VideoGrid({
    videos,
    loading,
}: {
    videos: Video[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-video animate-pulse rounded-xl bg-[#282a2b]" />
                        <div className="mt-3 h-4 animate-pulse rounded bg-[#282a2b]" />
                        <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-[#282a2b]" />
                    </div>
                ))}
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="py-20 text-center text-gray-500">
                No videos found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                />
            ))}
        </div>
    );
}