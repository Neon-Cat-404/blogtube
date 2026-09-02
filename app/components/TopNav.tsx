export default function TopNav() {
    return (
        <header className="top-nav">
            <div className="brand">
                <button className="mobile-menu" aria-label="Open menu">
                    ☰
                </button>

                <a href="/" className="brand-link">
                    <span className="brand-icon">▶</span>
                    StreamVision
                </a>
            </div>

            <div className="nav-spacer" />

            <div className="nav-actions">
                <button aria-label="Notifications">🔔</button>
                <button aria-label="Create">▣</button>

                <button className="profile-button" aria-label="Profile">
                    U
                </button>
            </div>
        </header>
    );
}