import { Home } from "lucide-react";

function Sidebar() {
    return (
        <aside className="sidebar">

            <button className="sidebar-item active">

                <Home size={21} />

                <span>
                    Home
                </span>

            </button>

        </aside>
    );
}

export default Sidebar;