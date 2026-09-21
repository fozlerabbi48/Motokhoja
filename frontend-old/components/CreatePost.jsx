import { useRef, useState } from "react";
import { Camera, Bike } from "lucide-react";

const API_URL = "http://localhost:3000";

function CreatePost({ onPostCreated }) {

    const fileInput = useRef(null);

    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [bikeBrand, setBikeBrand] = useState("");
    const [bikeModel, setBikeModel] = useState("");
    const [bikeCC, setBikeCC] = useState("");
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);

    const [preview, setPreview] = useState("");
    const [publishing, setPublishing] = useState(false);

    const handleImage = (file) => {

        if (!file) return;

        setImage(file);

        setPreview(
            URL.createObjectURL(file)
        );
    };

    const submitPost = async (e) => {

        e.preventDefault();

        if (
            !name ||
            !bikeBrand ||
            !bikeModel ||
            !image
        ) {
            alert("Please fill all required fields.");
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("bikeBrand", bikeBrand);
        formData.append("bikeModel", bikeModel);
        formData.append("bikeCC", bikeCC);
        formData.append("caption", caption);
        formData.append("image", image);

        try {

            setPublishing(true);

            const response = await fetch(
                `${API_URL}/api/posts`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create post"
                );
            }

            setName("");
            setBikeBrand("");
            setBikeModel("");
            setBikeCC("");
            setCaption("");
            setImage(null);
            setPreview("");

            setOpen(false);

            onPostCreated();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to create post"
            );

        } finally {

            setPublishing(false);
        }
    };

    return (
        <>
            <section className="create-post">

                <div className="create-top">

                    <div className="generic-avatar">
                        🏍️
                    </div>

                    <button
                        className="post-input"
                        onClick={() => setOpen(true)}
                    >
                        What's on your mind, rider?
                    </button>

                </div>


                <div className="create-actions">

                    <button
                        onClick={() =>
                            fileInput.current.click()
                        }
                    >
                        <Camera size={20} />
                        Photo
                    </button>

                    <button
                        onClick={() => setOpen(true)}
                    >
                        <Bike size={20} />
                        Motorcycle
                    </button>

                </div>

                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                        handleImage(e.target.files[0])
                    }
                />

            </section>


            {open && (
                <div
                    className="modal-overlay"
                    onClick={() => setOpen(false)}
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <h2>
                                Create Motorcycle Post
                            </h2>

                            <button
                                onClick={() =>
                                    setOpen(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={submitPost}
                            className="post-form"
                        >

                            <input
                                type="text"
                                placeholder="Rider name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />


                            <div className="bike-inputs">

                                <input
                                    type="text"
                                    placeholder="Bike brand"
                                    value={bikeBrand}
                                    onChange={(e) =>
                                        setBikeBrand(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Bike model"
                                    value={bikeModel}
                                    onChange={(e) =>
                                        setBikeModel(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="CC"
                                    value={bikeCC}
                                    onChange={(e) =>
                                        setBikeCC(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <textarea
                                placeholder="Write something about your motorcycle..."
                                value={caption}
                                onChange={(e) =>
                                    setCaption(
                                        e.target.value
                                    )
                                }
                                rows="4"
                            />


                            <label className="upload-area">

                                <Camera size={30} />

                                <strong>
                                    Add Motorcycle Photo
                                </strong>

                                <span>
                                    Select a photo from your computer
                                </span>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleImage(
                                            e.target.files[0]
                                        )
                                    }
                                    required={!image}
                                />

                            </label>


                            {preview && (
                                <img
                                    className="preview-image"
                                    src={preview}
                                    alt="Preview"
                                />
                            )}


                            <button
                                className="publish-button"
                                type="submit"
                                disabled={publishing}
                            >
                                {publishing
                                    ? "Publishing..."
                                    : "Publish Post"}
                            </button>

                        </form>

                    </div>

                </div>
            )}

        </>
    );
}

export default CreatePost;