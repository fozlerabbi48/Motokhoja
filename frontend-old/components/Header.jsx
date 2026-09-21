import { Search, Home } from "lucide-react";

function Header({ search, setSearch }) {
    return (
        <header className="topbar">

            <div className="logo">

                <div className="logo-icon">
                    🏍️
                </div>

                <div>
                    <h1>
                        MotoMedia
                    </h1>

                    <span>
                        Ride • Share • Connect
                    </span>
                </div>

            </div>


            <div className="search-box">

                <Search size={18} />

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search riders, bikes or posts..."
                />

            </div>


            <button className="home-button">
                <Home size={20} />
            </button>

        </header>
    );
}

export default Header;