import { useEffect, useMemo, useRef, useState } from "react";

import {
  Camera,
  Heart,
  Home,
  ImagePlus,
  MessageCircle,
  Search,
  Send,
  User,
  X,
  MessageSquare,
  LogOut,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  Globe,
  Phone,
  Edit3,
  ArrowLeft,
  Users,
  UserCircle,
  Save,
  Image as ImageIcon
} from "lucide-react";

import Auth from "./Auth";
import "./App.css";

const API_URL = "http://127.0.0.1:3000";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("motomedia_user");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("motomedia_token") || "";
  });

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const [commentText, setCommentText] = useState({});
  const [commentMessage, setCommentMessage] = useState({});

  const [messengerOpen, setMessengerOpen] = useState(false);
  const [chatUser, setChatUser] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  const [page, setPage] = useState("home");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    location: "",
    phone: "",
    education: "",
    university: "",
    profession: "",
    skills: "",
    about: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    profilePhoto: null,
    coverPhoto: null
  });

  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [viewedUserId, setViewedUserId] = useState("");

  const [form, setForm] = useState({
    name: "",
    bikeBrand: "",
    bikeModel: "",
    bikeCC: "",
    caption: "",
    image: null
  });

  const [preview, setPreview] = useState("");

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentUser = user?.name || "";

  const currentUserId = String(
    user?.id || user?._id || ""
  );

  useEffect(() => {
    if (token && user) {
      setForm((previous) => ({
        ...previous,
        name: user.name || ""
      }));

      loadPosts();
      loadMyProfile();
    }
  }, [token, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [chatMessages]);

  useEffect(() => {
    const keyword = search.trim();

    if (!keyword || page !== "home") {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(keyword);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, page]);

  function logout() {
    localStorage.removeItem("motomedia_token");
    localStorage.removeItem("motomedia_user");

    setToken("");
    setUser(null);
    setPosts([]);
    setProfile(null);
    setMessengerOpen(false);
    setChatUser("");
    setChatMessages([]);
  }

  function authHeaders() {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  async function loadPosts() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/posts`
      );

      if (!response.ok) {
        throw new Error("Failed to load posts");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("LOAD POSTS ERROR:", error);
      setMessage("Backend server পাওয়া যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  }

  async function loadMyProfile() {
    try {
      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          headers: authHeaders()
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Profile load failed"
        );
      }

      setProfile(data.user);

      const updatedUser = {
        ...user,
        ...data.user,
        id: data.user._id || data.user.id
      };

      setUser(updatedUser);

      localStorage.setItem(
        "motomedia_user",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error("MY PROFILE ERROR:", error);
    }
  }

  async function loadUserProfile(userId) {
    if (!userId) return;

    try {
      setProfileLoading(true);
      setPage("profile");
      setViewedUserId(userId);

      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          headers: authHeaders()
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Profile load failed"
        );
      }

      setProfile(data.user);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      console.error("USER PROFILE ERROR:", error);

      setMessage(
        error.message || "Profile load করা যায়নি।"
      );
    } finally {
      setProfileLoading(false);
    }
  }

  function openMyProfile() {
    setViewedUserId(currentUserId);
    loadMyProfile();
    setPage("profile");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function openUserProfile(userId) {
    if (String(userId) === currentUserId) {
      openMyProfile();
      return;
    }

    loadUserProfile(userId);
    setSearch("");
    setUserResults([]);
  }

  function startEditingProfile() {
    if (!profile) return;

    setProfileForm({
      name: profile.name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      phone: profile.phone || "",
      education: profile.education || "",
      university: profile.university || "",
      profession: profile.profession || "",
      skills: profile.skills || "",
      about: profile.about || "",
      facebook: profile.socialLinks?.facebook || "",
      instagram: profile.socialLinks?.instagram || "",
      linkedin: profile.socialLinks?.linkedin || "",
      website: profile.socialLinks?.website || "",
      profilePhoto: null,
      coverPhoto: null
    });

    setProfilePreview(
      profile.profilePhoto
        ? `${API_URL}${profile.profilePhoto}`
        : ""
    );

    setCoverPreview(
      profile.coverPhoto
        ? `${API_URL}${profile.coverPhoto}`
        : ""
    );

    setEditingProfile(true);
  }

  function handleProfileTextChange(event) {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileForm((previous) => ({
      ...previous,
      profilePhoto: file
    }));

    setProfilePreview(URL.createObjectURL(file));
  }

  function handleCoverPhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileForm((previous) => ({
      ...previous,
      coverPhoto: file
    }));

    setCoverPreview(URL.createObjectURL(file));
  }

  async function saveProfile(event) {
    event.preventDefault();

    try {
      setProfileSaving(true);
      setMessage("");

      const formData = new FormData();

      formData.append("name", profileForm.name.trim());
      formData.append("bio", profileForm.bio);
      formData.append("location", profileForm.location);
      formData.append("phone", profileForm.phone);
      formData.append("education", profileForm.education);
      formData.append("university", profileForm.university);
      formData.append("profession", profileForm.profession);
      formData.append("skills", profileForm.skills);
      formData.append("about", profileForm.about);

      formData.append("facebook", profileForm.facebook);
      formData.append("instagram", profileForm.instagram);
      formData.append("linkedin", profileForm.linkedin);
      formData.append("website", profileForm.website);

      if (profileForm.profilePhoto) {
        formData.append(
          "profilePhoto",
          profileForm.profilePhoto
        );
      }

      if (profileForm.coverPhoto) {
        formData.append(
          "coverPhoto",
          profileForm.coverPhoto
        );
      }

      const response = await fetch(
        `${API_URL}/api/users/me/profile`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: formData
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Profile update failed"
        );
      }

      setProfile(data.user);

      const updatedUser = {
        ...user,
        ...data.user,
        id: data.user.id || data.user._id
      };

      setUser(updatedUser);

      localStorage.setItem(
        "motomedia_user",
        JSON.stringify(updatedUser)
      );

      setEditingProfile(false);

      setProfileForm((previous) => ({
        ...previous,
        profilePhoto: null,
        coverPhoto: null
      }));

      setMessage("Profile successfully updated.");

      await loadPosts();
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);

      setMessage(
        error.message || "Profile update করা যায়নি।"
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function searchUsers(keyword) {
    try {
      const response = await fetch(
        `${API_URL}/api/users/search?q=${encodeURIComponent(
          keyword
        )}&currentUserId=${encodeURIComponent(
          currentUserId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "User search failed"
        );
      }

      setUserResults(data.users || []);
    } catch (error) {
      console.error("USER SEARCH ERROR:", error);
      setUserResults([]);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((previous) => ({
      ...previous,
      image: file
    }));

    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setForm((previous) => ({
      ...previous,
      image: null
    }));

    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function createPost(event) {
    event.preventDefault();

    if (!form.bikeBrand.trim()) {
      setMessage("Bike brand দিন।");
      return;
    }

    if (!form.bikeModel.trim()) {
      setMessage("Bike model দিন।");
      return;
    }

    if (!form.image) {
      setMessage("Bike photo select করুন।");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const formData = new FormData();

      formData.append("bikeBrand", form.bikeBrand);
      formData.append("bikeModel", form.bikeModel);
      formData.append("bikeCC", form.bikeCC);
      formData.append("caption", form.caption);
      formData.append("image", form.image);

      const response = await fetch(
        `${API_URL}/api/posts`,
        {
          method: "POST",
          headers: authHeaders(),
          body: formData
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Post creation failed"
        );
      }

      setForm({
        name: currentUser,
        
        caption: "",
        image: null
      });

      setPreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Post successfully created.");

      await loadPosts();
    } catch (error) {
      console.error("CREATE POST ERROR:", error);

      setMessage(
        error.message || "Post তৈরি করা যায়নি।"
      );
    } finally {
      setCreating(false);
    }
  }

  async function toggleLike(postId) {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: authHeaders()
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Like update failed"
        );
      }

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes:
                  typeof data.likes === "number"
                    ? data.likes
                    : post.likes,
                likedBy:
                  data.likedBy || post.likedBy
              }
            : post
        )
      );
    } catch (error) {
      console.error("LIKE ERROR:", error);
    }
  }

  async function addComment(postId) {
    const text = commentText[postId]?.trim();

    if (!text) {
      setCommentMessage((previous) => ({
        ...previous,
        [postId]: "Comment লিখুন।"
      }));

      return;
    }

    try {
      setCommentMessage((previous) => ({
        ...previous,
        [postId]: ""
      }));

      const response = await fetch(
        `${API_URL}/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            text
          })
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Comment failed"
        );
      }

      setCommentText((previous) => ({
        ...previous,
        [postId]: ""
      }));

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments:
                  data.comments || post.comments
              }
            : post
        )
      );
    } catch (error) {
      console.error("COMMENT ERROR:", error);

      setCommentMessage((previous) => ({
        ...previous,
        [postId]:
          error.message || "Comment করা যায়নি।"
      }));
    }
  }

  async function openChat(userName) {
    setChatUser(userName);
    setMessengerOpen(true);
    setChatMessages([]);

    await loadMessages(userName);
  }

  async function loadMessages(userName) {
    if (!userName) return;

    try {
      setChatLoading(true);

      const response = await fetch(
        `${API_URL}/api/messages/${encodeURIComponent(
          currentUser
        )}/${encodeURIComponent(userName)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load messages"
        );
      }

      setChatMessages(data.messages || []);
    } catch (error) {
      console.error("LOAD MESSAGES ERROR:", error);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  }

  async function sendChatMessage(event) {
    event?.preventDefault();

    const text = chatMessage.trim();

    if (!text || !chatUser || chatSending) {
      return;
    }

    try {
      setChatSending(true);

      const response = await fetch(
        `${API_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            sender: currentUser,
            receiver: chatUser,
            text
          })
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Message send failed"
        );
      }

      setChatMessages((previous) => [
        ...previous,
        data.data
      ]);

      setChatMessage("");
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    } finally {
      setChatSending(false);
    }
  }

  const chatUsers = useMemo(() => {
    const users = posts
      .map((post) => post.name)
      .filter(
        (name) =>
          name &&
          name.trim() &&
          name.trim() !== currentUser
      );

    return [...new Set(users)];
  }, [posts, currentUser]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return posts;
    }

    return posts.filter((post) => {
      return (
        post.name?.toLowerCase().includes(keyword) ||
        post.bikeBrand?.toLowerCase().includes(keyword) ||
        post.bikeModel?.toLowerCase().includes(keyword) ||
        post.caption?.toLowerCase().includes(keyword)
      );
    });
  }, [posts, search]);

  const profilePosts = useMemo(() => {
    if (!profile) return [];

    const profileId = String(
      profile._id || profile.id || ""
    );

    return posts.filter((post) => {
      if (post.userId) {
        return String(post.userId) === profileId;
      }

      return (
        post.name?.toLowerCase() ===
        profile.name?.toLowerCase()
      );
    });
  }, [posts, profile]);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function imageUrl(path) {
    if (!path) return "";

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_URL}${path}`;
  }

  function renderPost(post) {
    const postUserId = String(
      user?.id || user?._id || ""
    );

    const hasLiked = post.likedBy?.some(
      (id) => String(id) === postUserId
    );

    return (
      <article className="post-card" key={post._id}>
        <div className="post-header">
          <button
            className="post-avatar-button"
            onClick={() => {
              if (post.userId) {
                openUserProfile(post.userId);
              }
            }}
          >
            {post.name?.charAt(0)?.toUpperCase() || "A"}
          </button>

          <div className="post-user">
            <h3>{post.name}</h3>

            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        

        {post.caption && (
          <p className="post-caption">
            {post.caption}
          </p>
        )}

        {post.image && (
          <div className="post-image">
            <img
              src={imageUrl(post.image)}
              alt={`${post.bikeBrand || ""} ${
                post.bikeModel || ""
              }`}
            />
          </div>
        )}

        <div className="post-stats">
          <span>
            <Heart
              size={16}
              fill={
                post.likes > 0
                  ? "currentColor"
                  : "none"
              }
            />

            {post.likes || 0}{" "}
            {(post.likes || 0) === 1
              ? "Like"
              : "Likes"}
          </span>

          <span>
            <MessageCircle size={16} />

            {post.comments?.length || 0}{" "}
            {(post.comments?.length || 0) === 1
              ? "Comment"
              : "Comments"}
          </span>
        </div>

        <div className="post-actions">
          <button
            className={
              hasLiked ? "liked-action" : ""
            }
            onClick={() => toggleLike(post._id)}
          >
            <Heart
              size={20}
              fill={
                hasLiked
                  ? "currentColor"
                  : "none"
              }
            />
            Like
          </button>

          <button
            onClick={() =>
              document
                .getElementById(
                  `comment-${post._id}`
                )
                ?.focus()
            }
          >
            <MessageCircle size={20} />
            Comment
          </button>
        </div>

        {post.comments &&
          post.comments.length > 0 && (
            <div className="comments-list">
              {post.comments.map((comment) => (
                <div
                  className="comment-item"
                  key={comment._id}
                >
                  <div className="comment-avatar">
                    {comment.name
                      ?.charAt(0)
                      ?.toUpperCase() || "A"}
                  </div>

                  <div className="comment-content">
                    <strong>
                      {comment.name}
                    </strong>

                    <p>{comment.text}</p>

                    <span>
                      {formatDate(
                        comment.createdAt
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        <div className="comment-box">
          <MessageCircle size={17} />

          <input
            id={`comment-${post._id}`}
            type="text"
            placeholder="Write a comment..."
            value={
              commentText[post._id] || ""
            }
            onChange={(event) =>
              setCommentText((previous) => ({
                ...previous,
                [post._id]:
                  event.target.value
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addComment(post._id);
              }
            }}
          />

          <button
            type="button"
            onClick={() =>
              addComment(post._id)
            }
          >
            <Send size={17} />
          </button>
        </div>

        {commentMessage[post._id] && (
          <div className="comment-message">
            {commentMessage[post._id]}
          </div>
        )}
      </article>
    );
  }

  function renderProfile() {
    if (profileLoading) {
      return (
        <section className="profile-loading-card">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </section>
      );
    }

    if (!profile) {
      return (
        <section className="empty-card">
          <UserCircle size={55} />
          <h3>Profile not found</h3>
        </section>
      );
    }

    const profileId = String(
      profile._id || profile.id || ""
    );

    const isOwnProfile =
      profileId === currentUserId;

    const socialLinks = profile.socialLinks || {};

    return (
      <section className="profile-page">
        <button
          className="profile-back"
          onClick={() => {
            setPage("home");
            setViewedUserId("");
          }}
        >
          <ArrowLeft size={19} />
          Back to Home
        </button>

        <div className="profile-card">
          <div className="cover-area">
            {profile.coverPhoto ? (
              <img
                src={imageUrl(profile.coverPhoto)}
                alt="Cover"
              />
            ) : (
              <div className="cover-placeholder">
                <div className="ayna-empty-logo small">
                  <span className="ayna-logo-shape"></span>
                </div>
                <span>Add a cover photo</span>
              </div>
            )}

            {isOwnProfile && (
              <button
                className="cover-edit-button"
                onClick={startEditingProfile}
              >
                <Camera size={17} />
                Edit Cover
              </button>
            )}
          </div>

          <div className="profile-main">
            <div className="profile-photo-wrapper">
              {profile.profilePhoto ? (
                <img
                  className="profile-photo"
                  src={imageUrl(
                    profile.profilePhoto
                  )}
                  alt={profile.name}
                />
              ) : (
                <div className="profile-photo profile-photo-placeholder">
                  {profile.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-title-row">
              <div>
                <h1>{profile.name}</h1>

                {profile.profession && (
                  <p className="profile-profession">
                    {profile.profession}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <button
                  className="edit-profile-button"
                  onClick={startEditingProfile}
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="profile-bio">
                {profile.bio}
              </p>
            )}

            <div className="profile-meta">
              {profile.location && (
                <span>
                  <MapPin size={17} />
                  {profile.location}
                </span>
              )}

              {profile.university && (
                <span>
                  <GraduationCap size={17} />
                  {profile.university}
                </span>
              )}

              {profile.profession && (
                <span>
                  <Briefcase size={17} />
                  {profile.profession}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-left-column">
            <div className="profile-info-card">
              <div className="profile-section-heading">
                <h2>About</h2>

                {isOwnProfile && (
                  <button
                    onClick={startEditingProfile}
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>

              <div className="info-list">
                {profile.about && (
                  <div className="info-row about-row">
                    <UserCircle size={20} />

                    <div>
                      <span>About</span>
                      <p>{profile.about}</p>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="info-row">
                    <MapPin size={20} />

                    <div>
                      <span>Location</span>
                      <p>{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile.phone && (
                  <div className="info-row">
                    <Phone size={20} />

                    <div>
                      <span>Phone</span>
                      <p>{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div className="info-row">
                    <GraduationCap size={20} />

                    <div>
                      <span>Education</span>
                      <p>{profile.education}</p>
                    </div>
                  </div>
                )}

                {profile.university && (
                  <div className="info-row">
                    <GraduationCap size={20} />

                    <div>
                      <span>University</span>
                      <p>{profile.university}</p>
                    </div>
                  </div>
                )}

                {profile.profession && (
                  <div className="info-row">
                    <Briefcase size={20} />

                    <div>
                      <span>Profession</span>
                      <p>{profile.profession}</p>
                    </div>
                  </div>
                )}

                {profile.skills && (
                  <div className="info-row">
                    <Code2 size={20} />

                    <div>
                      <span>Skills</span>
                      <p>{profile.skills}</p>
                    </div>
                  </div>
                )}

                {!profile.about &&
                  !profile.location &&
                  !profile.phone &&
                  !profile.education &&
                  !profile.university &&
                  !profile.profession &&
                  !profile.skills && (
                    <div className="empty-profile-info">
                      <UserCircle size={35} />
                      <p>
                        No profile information
                        added yet.
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {(socialLinks.facebook ||
              socialLinks.instagram ||
              socialLinks.linkedin ||
              socialLinks.website) && (
              <div className="profile-info-card">
                <div className="profile-section-heading">
                  <h2>Social Links</h2>
                </div>

                <div className="social-links">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-link-icon">
                        f
                      </span>
                      Facebook
                    </a>
                  )}

                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-link-icon">
                        ◎
                      </span>
                      Instagram
                    </a>
                  )}

                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-link-icon linkedin-icon">
                        in
                      </span>
                      LinkedIn
                    </a>
                  )}

                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe size={19} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-post-column">
            <div className="profile-post-heading">
              <div>
                <h2>Posts</h2>
                <span>
                  {profilePosts.length} posts
                </span>
              </div>
            </div>

            {profilePosts.length === 0 ? (
              <div className="empty-card">
                <div className="ayna-empty-logo">
                  <span className="ayna-logo-shape"></span>
                </div>

                <h3>No posts yet</h3>

                <p>
                  This user has not created
                  any posts.
                </p>
              </div>
            ) : (
              <div className="posts">
                {profilePosts.map(renderPost)}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  function renderHome() {
    return (
      <>
        <div className="mobile-title">
          <h2>Home</h2>
          <span>{posts.length} posts</span>
        </div>

        <section
          className="create-card"
          id="create-post"
        >
          <div className="card-heading">
            <div className="heading-avatar">
              {profile?.profilePhoto ? (
                <img
                  src={imageUrl(
                    profile.profilePhoto
                  )}
                  alt={currentUser}
                />
              ) : (
                <User size={22} />
              )}
            </div>

            <div>
              <h2>Create Post</h2>
              <p>
                Share your motorcycle with
                the community
              </p>
            </div>
          </div>

          <form onSubmit={createPost}>
            <div className="form-grid">
              <input
                type="text"
                name="name"
                placeholder="Rider name"
                value={form.name}
                readOnly
              />

              <input
                type="text"
                name="bikeBrand"
                placeholder="Bike brand"
                value={form.bikeBrand}
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="bikeModel"
                placeholder="Bike model"
                value={form.bikeModel}
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="bikeCC"
                placeholder="Engine CC"
                value={form.bikeCC}
                onChange={handleInputChange}
              />
            </div>

            <textarea
              name="caption"
              placeholder="What's on your mind?"
              value={form.caption}
              onChange={handleInputChange}
              rows="3"
            />

            {preview && (
              <div className="preview-box">
                <img
                  src={preview}
                  alt="Preview"
                />

                <button
                  type="button"
                  className="remove-preview"
                  onClick={removeImage}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="create-bottom">
              <button
                type="button"
                className="photo-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Camera size={20} />
                <span>Add Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              <button
                className="post-button"
                type="submit"
                disabled={creating}
              >
                <Send size={18} />

                {creating
                  ? "Posting..."
                  : "Post"}
              </button>
            </div>

            {message && (
              <div className="form-message">
                {message}
              </div>
            )}
          </form>
        </section>

        <div className="feed-heading">
          <div>
            <h2>Latest Posts</h2>

            <p>
              {search
                ? `${filteredPosts.length} result found`
                : "Real posts from Ayna database"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-card">
            <div className="loader"></div>
            <p>Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-card">
            <div className="ayna-empty-logo">
              <span className="ayna-logo-shape"></span>
            </div>

            <h3>No posts found</h3>

            <p>
              {search
                ? "Try another search."
                : "Create the first motorcycle post."}
            </p>
          </div>
        ) : (
          <div className="posts">
            {filteredPosts.map(renderPost)}
          </div>
        )}
      </>
    );
  }

  if (!token || !user) {
    return (
      <Auth
        onLogin={(loggedInUser, loggedInToken) => {
          setUser(loggedInUser);
          setToken(loggedInToken);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="brand"
            onClick={() => {
              setPage("home");
              setSearch("");
            }}
          >
            <div className="brand-icon ayna-logo">
              <span className="ayna-logo-shape"></span>
            </div>

            <div>
              <h1>Ayna</h1>
              <span>Social Community</span>
            </div>
          </button>

          <div className="search-wrapper">
            <div className="search-box">
              <Search size={20} />

              <input
                type="text"
                placeholder="Search riders, bikes or posts..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setUserResults([]);
                  }}
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {userResults.length > 0 && (
              <div className="user-search-results">
                <div className="search-result-title">
                  <Users size={16} />
                  People
                </div>

                {userResults.map((foundUser) => (
                  <button
                    className="search-user-item"
                    key={foundUser._id}
                    onClick={() =>
                      openUserProfile(
                        foundUser._id
                      )
                    }
                  >
                    {foundUser.profilePhoto ? (
                      <img
                        src={imageUrl(
                          foundUser.profilePhoto
                        )}
                        alt={foundUser.name}
                      />
                    ) : (
                      <div className="search-avatar">
                        {foundUser.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <strong>
                        {foundUser.name}
                      </strong>

                      <span>
                        {foundUser.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`header-nav-button ${
              page === "home"
                ? "selected"
                : ""
            }`}
            onClick={() => setPage("home")}
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          <button
            className={`header-nav-button ${
              page === "profile"
                ? "selected"
                : ""
            }`}
            onClick={openMyProfile}
          >
            <User size={20} />
            <span>Profile</span>
          </button>

          <button
            className="messenger-button"
            onClick={() => {
              setMessengerOpen(true);

              if (
                chatUsers.length > 0 &&
                !chatUser
              ) {
                openChat(chatUsers[0]);
              }
            }}
          >
            <MessageSquare size={20} />
            <span>Messenger</span>
          </button>

          <button
            className="profile-mini"
            onClick={openMyProfile}
          >
            {profile?.profilePhoto ? (
              <img
                src={imageUrl(
                  profile.profilePhoto
                )}
                alt={currentUser}
              />
            ) : (
              <User size={19} />
            )}

            <span>{currentUser}</span>
          </button>

          <button
            className="logout-button"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <button
              className={`side-item ${
                page === "home"
                  ? "active"
                  : ""
              }`}
              onClick={() => setPage("home")}
            >
              <Home size={20} />
              <span>Home</span>
            </button>

            <button
              className="side-item"
              onClick={() => {
                setPage("home");

                setTimeout(() => {
                  document
                    .getElementById("create-post")
                    ?.scrollIntoView({
                      behavior: "smooth"
                    });
                }, 50);
              }}
            >
              <ImagePlus size={20} />
              <span>Create Post</span>
            </button>

            <button
              className={`side-item ${
                page === "profile"
                  ? "active"
                  : ""
              }`}
              onClick={openMyProfile}
            >
              <UserCircle size={20} />
              <span>My Profile</span>
            </button>

            <button
              className="side-item"
              onClick={() =>
                setMessengerOpen(true)
              }
            >
              <MessageSquare size={20} />
              <span>Messenger</span>
            </button>
          </div>

          <div className="sidebar-note">
            <div className="ayna-mini-logo">
              <span className="ayna-logo-shape"></span>
            </div>

            <strong>Ayna</strong>

            <p>
              Share your moments with
              the community.
            </p>
          </div>
        </aside>

        <section className="feed">
          {page === "profile"
            ? renderProfile()
            : renderHome()}
        </section>
      </main>

      {editingProfile && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <div>
                <h2>Edit Profile</h2>
                <span>
                  Update your Ayna profile
                </span>
              </div>

              <button
                onClick={() =>
                  setEditingProfile(false)
                }
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="profile-edit-form"
              onSubmit={saveProfile}
            >
              <div className="edit-cover-section">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                  />
                ) : (
                  <div className="edit-cover-empty">
                    <ImageIcon size={35} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    coverInputRef.current?.click()
                  }
                >
                  <Camera size={17} />
                  Change Cover
                </button>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCoverPhotoChange}
                />
              </div>

              <div className="edit-profile-photo-section">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                  />
                ) : (
                  <div className="edit-profile-photo-placeholder">
                    {profileForm.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    profileInputRef.current?.click()
                  }
                >
                  <Camera size={17} />
                  Profile Photo
                </button>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleProfilePhotoChange
                  }
                />
              </div>

              <div className="edit-form-grid">
                <div className="field">
                  <label>Name</label>
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={
                      handleProfileTextChange
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="+880..."
                  />
                </div>

                <div className="field full">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={profileForm.bio}
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="Tell people something about yourself..."
                  />
                </div>

                <div className="field">
                  <label>Location</label>
                  <input
                    name="location"
                    value={
                      profileForm.location
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="Bogra, Bangladesh"
                  />
                </div>

                <div className="field">
                  <label>Education</label>
                  <input
                    name="education"
                    value={
                      profileForm.education
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="BSc in CSE"
                  />
                </div>

                <div className="field">
                  <label>University</label>
                  <input
                    name="university"
                    value={
                      profileForm.university
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="University name"
                  />
                </div>

                <div className="field">
                  <label>Profession</label>
                  <input
                    name="profession"
                    value={
                      profileForm.profession
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="Full Stack Developer"
                  />
                </div>

                <div className="field full">
                  <label>Skills</label>
                  <input
                    name="skills"
                    value={
                      profileForm.skills
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="React, Node.js, MongoDB..."
                  />
                </div>

                <div className="field full">
                  <label>About</label>
                  <textarea
                    name="about"
                    rows="4"
                    value={profileForm.about}
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="Write something about yourself..."
                  />
                </div>

                <div className="social-edit-heading">
                  <h3>Social Links</h3>
                  <p>
                    Add your own social media
                    profiles.
                  </p>
                </div>

                <div className="field">
                  <label>Facebook</label>
                  <input
                    name="facebook"
                    type="url"
                    value={
                      profileForm.facebook
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="field">
                  <label>Instagram</label>
                  <input
                    name="instagram"
                    type="url"
                    value={
                      profileForm.instagram
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="field">
                  <label>LinkedIn</label>
                  <input
                    name="linkedin"
                    type="url"
                    value={
                      profileForm.linkedin
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="field">
                  <label>Website</label>
                  <input
                    name="website"
                    type="url"
                    value={
                      profileForm.website
                    }
                    onChange={
                      handleProfileTextChange
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="cancel-profile-button"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-button"
                  disabled={profileSaving}
                >
                  <Save size={18} />

                  {profileSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {messengerOpen && (
        <div className="messenger-overlay">
          <div className="messenger-window">
            <div className="messenger-header">
              <div>
                <MessageSquare size={22} />

                <div>
                  <h2>Messenger</h2>
                  <span>Ayna Community</span>
                </div>
              </div>

              <button
                onClick={() =>
                  setMessengerOpen(false)
                }
              >
                <X size={21} />
              </button>
            </div>

            <div className="messenger-body">
              <div className="chat-users">
                <div className="chat-users-title">
                  <strong>Chats</strong>
                </div>

                {chatUsers.length === 0 ? (
                  <div className="no-users">
                    <User size={35} />

                    <p>
                      No other riders found.
                    </p>

                    <span>
                      Create a post with
                      another rider name
                      first.
                    </span>
                  </div>
                ) : (
                  chatUsers.map((userName) => (
                    <button
                      className={`chat-user ${
                        chatUser === userName
                          ? "selected"
                          : ""
                      }`}
                      key={userName}
                      onClick={() =>
                        openChat(userName)
                      }
                    >
                      <div className="chat-avatar">
                        {userName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {userName}
                        </strong>

                        <span>
                          Click to open chat
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="chat-area">
                {chatUser ? (
                  <>
                    <div className="chat-top">
                      <div className="chat-avatar">
                        {chatUser
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {chatUser}
                        </strong>

                        <span>Messenger</span>
                      </div>
                    </div>

                    <div className="messages-area">
                      {chatLoading ? (
                        <div className="chat-loading">
                          Loading messages...
                        </div>
                      ) : chatMessages.length ===
                        0 ? (
                        <div className="empty-chat">
                          <MessageSquare
                            size={42}
                          />

                          <h3>
                            No messages yet
                          </h3>

                          <p>
                            Start the
                            conversation.
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const mine =
                            msg.sender ===
                            currentUser;

                          return (
                            <div
                              className={`message-row ${
                                mine
                                  ? "mine"
                                  : "other"
                              }`}
                              key={msg._id}
                            >
                              <div className="message-bubble">
                                <p>
                                  {msg.text}
                                </p>

                                <span>
                                  {formatDate(
                                    msg.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}

                      <div ref={chatEndRef}></div>
                    </div>

                    <form
                      className="chat-input"
                      onSubmit={
                        sendChatMessage
                      }
                    >
                      <input
                        type="text"
                        placeholder="Write a message..."
                        value={chatMessage}
                        onChange={(event) =>
                          setChatMessage(
                            event.target.value
                          )
                        }
                      />

                      <button
                        type="submit"
                        disabled={chatSending}
                      >
                        <Send size={19} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="select-chat">
                    <MessageSquare size={55} />

                    <h2>
                      Select a chat
                    </h2>

                    <p>
                      Select a rider from
                      the left to start
                      messaging.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;