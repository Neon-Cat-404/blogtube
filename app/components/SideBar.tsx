"use client";

type SidebarProps = {
    activeFeed: string;
    onFeedChange: (feed: string) => void;
};

export default function Sidebar({
    activeFeed,
    onFeedChange,
}: SidebarProps) {
    const items = [
        { id: "today", label: "Home", icon: "home" },
        { id: "week", label: "This week", icon: "schedule" },
        { id: "subscriptions", label: "Subscriptions", icon: "subscriptions" },
        { id: "history", label: "History", icon: "history" },
        { id: "watch-later", label: "Watch Later", icon: "watch_later" },
        { id: "liked", label: "Liked Videos", icon: "thumb_up" },
    ];

    return (
        <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-[#121414] lg:block">
            <nav className="sticky top-16 p-4">
                <div className="space-y-1">
                    {items.map((item) => {
                        const active = activeFeed === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onFeedChange(item.id)}
                                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm transition ${active
                                        ? "bg-[#333535] text-white"
                                        : "text-zinc-400 hover:bg-[#1e2020] hover:text-white"
                                    }`}
                            >
                                <span className="material-symbols-outlined">
                                    {item.icon}
                                </span>

                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="my-5 border-t border-zinc-800" />

                <button
                    onClick={() => onFeedChange("premium")}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-[#1e2020] hover:text-white"
                >
                    <span className="material-symbols-outlined">workspace_premium</span>
                    <span>Go Premium</span>
                </button>
            </nav>
        </aside>
    );
}