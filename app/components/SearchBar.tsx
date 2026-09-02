"use client";

import { Search } from "iconoir-react";

type SearchBarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
};

export default function SearchBar({
    search,
    onSearchChange,
    onSearch,
}: SearchBarProps) {
    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Enter") {
            onSearch();
        }
    }

    return (
        <div className="flex w-full items-center gap-3">
            {/* Input */}
            <div className="relative flex-1">
                <Search
                    width={20}
                    height={20}
                    strokeWidth={2}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Search videos..."
                    className="
                        w-full
                        rounded-xl
                        border border-zinc-700
                        bg-[#1e2020]
                        py-3
                        pl-12
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition
                        placeholder:text-zinc-500
                        focus:border-[#ff5540]
                    "
                />
            </div>

            {/* Search button */}
            <button
                type="button"
                onClick={onSearch}
                aria-label="Search"
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#ff5540]
                    text-black
                    transition
                    hover:brightness-110
                    active:scale-95
                "
            >
                <Search
                    width={21}
                    height={21}
                    strokeWidth={2}
                />
            </button>
        </div>
    );
}