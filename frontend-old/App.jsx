import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CreatePost from "./components/CreatePost";
import PostCard from "./components/PostCard";

const API_URL = "http://localhost:3000";

function getDeviceId() {
    let deviceId = localStorage.getItem("moto_device_id");

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("moto_device_id", deviceId);
    }

    return deviceId;
}

function App() {
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadPosts() {
        try {
            setLoading(true);
            setError("");

            const deviceId = getDeviceId();

            const response = await fetch(
                `${API_URL}/api/posts?userId=${encodeURIComponent(deviceId)}`
            );

            if (!response.ok) {
                throw new Error("Failed to load posts");
            }

            const data = await response.json();

            setPosts(data);
        } catch (error) {
            console.error(error);
            setError("Backend or MongoDB connection problem.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    async function handleLike(postId) {
        try {
            const deviceId = getDeviceId();

            const response = await fetch(
                `${API_URL}/api/posts/${postId}/like`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: deviceId
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Like failed");
            }

            await loadPosts();
        } catch (error) {
            console.error(error);
        }
    }

    const filteredPosts = posts.filter((post) => {
        const text = `
            ${post.name || ""}
            ${post.bikeBrand || ""}
            ${post.bikeModel || ""}
            ${post.bikeCC || ""}
            ${post.caption || ""}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
    });

    return (
        <>
            <Header
                search={search}
                setSearch={setSearch}
            />

            <div className="layout">

                <Sidebar />

                <main className="feed">

                    <CreatePost
                        onPostCreated={loadPosts}
                    />

                    <div className="feed-header">
                        <h2>Motorcycle Feed</h2>

                        <span>
                            {filteredPosts.length} posts
                        </span>
                    </div>

                    {loading && (
                        <div className="status-card">
                            <div className="spinner"></div>

                            <h3>
                                Loading MotoMedia...
                            </h3>

                            <p>
                                Loading motorcycle posts
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="status-card error">
                            <h3>
                                Unable to load motorcycle posts
                            </h3>

                            <p>
                                {error}
                            </p>

                            <button onClick={loadPosts}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredPosts.length === 0 && (
                            <div className="status-card">
                                <div className="empty-icon">
                                    🏍️
                                </div>

                                <h3>
                                    No motorcycle posts yet
                                </h3>

                                <p>
                                    Be the first rider to share a post.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        filteredPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onLike={handleLike}
                            />
                        ))}

                </main>

            </div>
        </>
    );
}

export default App;