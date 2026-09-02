"use client";

import { useState } from "react";

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

function formatPublishedTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffSeconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(duration: string) {
    const match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );

    if (!match) return "0:00";

    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2] ?? 0);
    const seconds = Number(match[3] ?? 0);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function VideoCard({
    video,
}: {
    video: Video;
}) {
    const [copied, setCopied] = useState(false);
    async function copyVideoLink() {
        const url = `https://www.youtube.com/watch?v=${video.id}`;

        try {
            await navigator.clipboard.writeText(url);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to copy video link:", error);
        }
    }
    return (
        <article className="group cursor-pointer" onClick={copyVideoLink}>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#282a2b]">
                <img
                    src={`/api/thumbnail/${video.id}`}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(video.duration)}
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
                    {formatPublishedTime(video.publishedAt)}
                </p>
            </div>
            {copied && (
                <div className="fixed bottom-6 right-1 z-50 -translate-x-1/2 rounded-lg bg-[#ff5540] px-4 py-2 text-sm text-white shadow-lg">
                    Link copied!
                </div>
            )}
        </article>
    );
}