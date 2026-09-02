"use client";

import { useEffect, useState } from "react";

import SearchBar from "@/app/components/SearchBar";
import VideoGrid from "@/app/components/VideoGrid";

import { CHANNELS } from "@/app/lib/channels";
import type { Video as Videos } from "@/app/lib/youtube";

type FeedResponse = {
  videos: Videos[];
  error?: string;
};

type Video = {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  views: number;
};

type FeedType = "today" | "week" | string;

export default function Home() {
  const [search, setSearch] = useState("");
  const [feed, setFeed] =
    useState<FeedType>("today");

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] =
    useState(true);

  async function loadVideos(type: FeedType) {
    setLoading(true);

    try {
      const isChannel = CHANNELS.some(
        (channel) => channel.id === type
      );

      const url = isChannel
        ? `/api/feed?channel=${encodeURIComponent(type)}`
        : `/api/feed?period=${type}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: FeedResponse = await response.json();

      setVideos(data.videos);
    } catch (error) {
      console.error(error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos(feed);
  }, [feed]);

  async function handleSearch() {
    const query = search.trim();

    if (!query) {
        loadVideos(feed);
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(
            `/api/feed?username=${encodeURIComponent(query)}`
        );

        const data: FeedResponse =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ?? "Channel not found"
            );
        }

        setVideos(data.videos);
    } catch (error) {
        console.error("SEARCH ERROR:", error);
        setVideos([]);
    } finally {
        setLoading(false);
    }
}

  return (
    <div className="min-h-screen bg-[#121414] text-white">

      <main className="pt-1">
        <div className="sticky top-1 z-20 border-b border-white/5 bg-[#121414]/95 px-4 py-4 backdrop-blur-md md:px-6">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            onSearch={handleSearch}
          />

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
  {/* Today */}
  <button
    onClick={() => setFeed("today")}
    className={`shrink-0 rounded-full px-4 py-2 text-sm ${
      feed === "today"
        ? "bg-[#ff5540] text-white"
        : "bg-[#282a2b] text-gray-300"
    }`}
  >
    Today
  </button>

  {/* This week */}
  <button
    onClick={() => setFeed("week")}
    className={`shrink-0 rounded-full px-4 py-2 text-sm ${
      feed === "week"
        ? "bg-[#ff5540] text-white"
        : "bg-[#282a2b] text-gray-300"
    }`}
  >
    This week
  </button>

  {/* Channels */}
  {CHANNELS.map((channel) => (
    <button
      key={channel.id}
      onClick={() => setFeed(channel.id)}
      className={`shrink-0 rounded-full px-4 py-2 text-sm ${
        feed === channel.id
          ? "bg-[#ff5540] text-white"
          : "bg-[#282a2b] text-gray-300"
      }`}
    >
      {channel.name}
    </button>
  ))}
</div>
        </div>

        <section className="p-4 md:p-6">
          <VideoGrid
            videos={videos}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
}