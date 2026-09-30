"use client";

import { useState, useEffect, useRef } from "react";
import {
  ImagePlus,
  Images,
  FolderOpen,
  Trash2,
} from "lucide-react";

export default function AdminGalleryPage() {
  const categories = [
    "Weddings",
    "Birthday",
    "Burials & Memorial",
    "Corporate Events",
  ];

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    coverImage: null,
    images: [],
  });

  const [coverPreview, setCoverPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
  try {
    const res = await fetch("/api/gallery");
    const data = await res.json();

    console.log("Gallery Data:", data);

    setGallery(data);
  } catch (error) {
    console.error(error);
  }
};

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));

    setCoverPreview(URL.createObjectURL(file));
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    setImagePreviews(
      files.map((file) => URL.createObjectURL(file))
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      coverImage: null,
      images: [],
    });

    setCoverPreview("");
    setImagePreviews([]);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.coverImage) {
      alert("Please select a cover image");
      return;
    }

    if (!formData.images.length) {
      alert("Please upload gallery images");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("category", formData.category);

      data.append(
        "coverImage",
        formData.coverImage
      );

      formData.images.forEach((image) => {
        data.append("images", image);
      });

      const res = await fetch("/api/gallery", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      await fetchGallery();
      resetForm();

      alert("Gallery event added successfully");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this gallery event?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/gallery?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setGallery((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Gallery Event Management
        </h1>

        {/* STATS */}

        <div className="grid md:grid-cols-2 gap-5 mb-8">

          <div className="bg-white p-5 rounded-2xl border">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Events
                </p>

                <h2 className="text-3xl font-bold">
                  {gallery.length}
                </h2>
              </div>

              <Images />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Categories
                </p>

                <h2 className="text-3xl font-bold">
                  {
                    [...new Set(
                      gallery.map(
                        (item) => item.category
                      )
                    )].length
                  }
                </h2>
              </div>

              <FolderOpen />
            </div>
          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl border"
        >
          <div className="grid lg:grid-cols-2 gap-8">

            <div className="space-y-5">

              <input
                type="text"
                name="title"
                placeholder="Event Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-xl"
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-xl"
                required
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>

              <div>
                <label className="font-medium block mb-2">
                  Cover Image
                </label>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="w-full border p-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-medium block mb-2">
                  Gallery Images
                </label>

                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  className="w-full border p-3 rounded-xl"
                  required
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <ImagePlus size={18} />

                {loading
                  ? "Uploading..."
                  : "Save Event"}
              </button>

            </div>

            <div className="space-y-6">

              <div>
                <h3 className="font-semibold mb-3">
                  Cover Preview
                </h3>

                <div className="h-64 border rounded-xl overflow-hidden">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No Cover Image
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">
                  Gallery Preview
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map(
                    (img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        className="h-28 w-full object-cover rounded-xl"
                      />
                    )
                  )}
                </div>
              </div>

            </div>

          </div>
        </form>

        {/* EVENTS */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Gallery Events
          </h2>

          {gallery.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border text-center">
              No gallery events found
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {gallery.map((event) => (

                <div
                  key={event._id}
                  className="bg-white border rounded-2xl overflow-hidden"
                >

                  <img
                    src={
                      event.coverImage ||
                      event.images?.[0]?.url ||
                      "/placeholder.jpg"
                    }
                    alt={event.title}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-5">

                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100">
                      {event.category}
                    </span>

                    <h3 className="font-bold text-lg mt-3">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      {event.images?.length || 0} Images
                    </p>

                    <div className="grid grid-cols-4 gap-2 mt-4">

                      {event.images
                        ?.slice(0, 4)
                        .map((img, index) => (
                          <img
                            key={`${event._id}-${index}`}
                            src={img.url}
                            alt=""
                            className="h-16 w-full rounded-lg object-cover"
                          />
                        ))}

                    </div>

                    <button
                      onClick={() =>
                        handleDelete(event._id)
                      }
                      className="mt-5 flex items-center gap-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      Delete Event
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}