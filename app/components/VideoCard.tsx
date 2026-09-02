"use client";

type Video = {
    id: string;
    title: string;
    channelTitle: string;
    publishedAt: string;
    duration: string;
    views: number;
};

function formatViews(views: number) {
    if (views >= 1_000_000) {
        return `${(views / 1_000_000).toFixed(1)}M views`;
    }

    if (views >= 1_000) {
        return `${(views / 1_000).toFixed(1)}K views`;
    }

    return `${views} views`;
}

function formatTime(date: string) {
    const diff =
        Date.now() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} days ago`;
}

export default function VideoCard({
    video,
}: {
    video: Video;
}) {
    return (
        <article className="group cursor-pointer">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#282a2b]">
                <img
                    src={`/api/thumbnail/${video.id}`}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                    {video.duration}
                </span>
            </div>

            <div className="mt-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                    {video.title}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                    {video.channelTitle}
                </p>

                <p className="text-xs text-gray-500">
                    {formatViews(video.views)} ·{" "}
                    {formatTime(video.publishedAt)}
                </p>
            </div>
        </article>
    );
}