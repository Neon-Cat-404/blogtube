"use client";

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
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            onSearch();
        }
    }

    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    search
                </span>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search videos..."
                    className="w-full rounded-xl border border-zinc-700 bg-[#1e2020] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ff5540]"
                />
            </div>

            <button
                onClick={onSearch}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff5540] text-black transition hover:brightness-110"
                aria-label="Search"
            >
                <span className="material-symbols-outlined">search</span>
            </button>
        </div>
    );
}