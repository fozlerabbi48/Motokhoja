import { Heart, MessageCircle } from "lucide-react";

const API_URL = "http://localhost:3000";

function PostCard({ post, onLike }) {

    const imageUrl =
        `${API_URL}${post.image}`;

    const initials =
        post.name
            ? post.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "MM";

    const date =
        post.createdAt
            ? new Date(
                post.createdAt
            ).toLocaleString()
            : "";

    return (
        <article className="post-card">

            <div className="post-header">

                <div className="avatar">
                    {initials}
                </div>

                <div className="post-user">

                    <strong>
                        {post.name}
                    </strong>

                    <span>
                        {date}
                    </span>

                </div>

            </div>


            {post.caption && (
                <p className="caption">
                    {post.caption}
                </p>
            )}


            <div className="bike-info">

                <span className="bike-icon">
                    🏍️
                </span>

                <div>

                    <strong>
                        {post.bikeBrand}{" "}
                        {post.bikeModel}
                    </strong>

                    <small>
                        {post.bikeCC
                            ? `${post.bikeCC} CC`
                            : "Motorcycle"}
                    </small>

                </div>

            </div>


            <img
                className="post-image"
                src={imageUrl}
                alt={`${post.bikeBrand} ${post.bikeModel}`}
            />


            <div className="post-stats">

                <span>
                    ❤️ {post.likes || 0}
                </span>

            </div>


            <div className="post-actions">

                <button
                    className={
                        post.likedByMe
                            ? "liked"
                            : ""
                    }
                    onClick={() =>
                        onLike(post._id)
                    }
                >

                    <Heart
                        size={19}
                        fill={
                            post.likedByMe
                                ? "currentColor"
                                : "none"
                        }
                    />

                    {post.likedByMe
                        ? "Liked"
                        : "Like"}

                </button>


                <button>

                    <MessageCircle
                        size={19}
                    />

                    Comment

                </button>

            </div>

        </article>
    );
}

export default PostCard;