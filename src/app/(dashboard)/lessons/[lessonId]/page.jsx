"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiClientLms } from "@/service/ApiUserAccount";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);

  const [file, setFile] = useState(null);
  const [about, setAbout] = useState("");
  const [fileType, setFileType] = useState("video");
  const [resourceId, setResourceId] = useState(null); // for update
  const [chapterId, setChapterId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch lesson & resources

  const fetchCourse = async () => {
    try {
      const res = await ApiClientLms.get(`/courses/${lessonId}`, {
        withCredentials: true,
      });
      const chapter = res.data.chapters[0];
      // setLessons(chapter.Lessons || []);
      setCourseId(chapter.course);
      setChapterId(chapter.id);
    } catch (err) {
      console.error("Fetch course error:", err);
    }
  };

  useEffect(() => {
    if (lessonId) fetchCourse();
  }, [lessonId]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const resetForm = () => {
    setFile(null);
    setAbout("");
    setFileType("video");
    setResourceId(null);
  };

  useEffect(() => {
    const fetchLessonAndResources = async () => {
      try {
        const lessonRes = await ApiClientLms.get(`/lessons/${lessonId}`, {
          withCredentials: true,
        });
        setLesson(lessonRes);
        //console.log(lessonRes.data.resources);
        setResources(lessonRes.data.resources);
        // const resourceRes = await ApiClientLms.get(`/resources/?lesson=${lessonId}`, {
        //   withCredentials: true,
        // });
        // setResources(resourceRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    if (lessonId) {
      fetchLessonAndResources();
    }
  }, [lessonId]);
  //console.log(resources);

  const handleSubmit = async () => {
    if (!about || (!file && !resourceId)) {
      alert("About and file are required.");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("file_name", file?.name || "");
    formData.append("about", about);
    formData.append("file_type", fileType);
    formData.append("lesson", lessonId);

    setLoading(true);
    setMessage("");

    try {
      let res;
      if (resourceId) {
        // If resourceId exists, we are updating the resource
        res = await ApiClientLms.patch(`/resource/${resourceId}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Resource updated!");
      } else {
        // Otherwise, we are creating a new resource
        res = await ApiClientLms.post("/resource", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Resource uploaded!");
      }

      // Optionally update the resource list
      const lessonRes = await ApiClientLms.get(`/lessons/${lessonId}`, {
        withCredentials: true,
      });
      setResources(lessonRes.data.resources);

      // Reset form
      resetForm();
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (res) => {
    setAbout(res.about);
    setFileType(res.file_type);
    setResourceId(res.id);
    setMessage("Edit mode");
  };

  const handleDelete = async (resourceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lesson?"
    );
    if (!confirmDelete) return;

    setLoading(true);
    // setError(null);

    try {
      const res = await ApiClientLms.delete(`/resource/${resourceId}`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        //console.log("Lesson deleted:", lessonId);
        const lessonRes = await ApiClientLms.get(`/lessons/${lessonId}`, {
          withCredentials: true,
        });
        setResources(lessonRes.data.resources);

        // setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
      }
    } catch (err) {
      console.error("Delete lesson error:", err);
      // setError("Failed to delete lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Lesson Header */}
      {lesson ? (
        <div>
          <h1 className="text-2xl font-bold mb-1">{lesson.title}</h1>
          <p className="text-gray-700">{lesson.description}</p>
        </div>
      ) : (
        <p>Loading lesson...</p>
      )}

      {/* Upload / Update Form */}
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">
          {resourceId ? "Update Resource" : "Upload Resource"}
        </h2>

        <div className="space-y-3">
          <input type="file" onChange={handleFileChange} className="block" />
          <textarea
            placeholder="About this file"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading
              ? resourceId
                ? "Updating..."
                : "Uploading..."
              : resourceId
              ? "Update"
              : "Upload"}
          </button>

          {resourceId && (
            <button onClick={resetForm} className="text-sm text-red-600 ml-4">
              Cancel edit
            </button>
          )}

          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </div>

      {/* Resource List */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Resources</h2>
        {resources.length === 0 ? (
          <p className="text-gray-500">No resources uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {resources.map((res) => (
              <li
                key={res.id}
                className="border p-3 rounded flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{res.file_name}</p>
                  <p className="text-sm text-gray-600">{res.about}</p>
                </div>

                <div className="flex gap-2">
                  {res.file_type === "video" ? (
                    // If it's a video, display a video player
                    <video controls className="w-32 h-32 object-cover">
                      <source src={res.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : res.file_type === "image" ? (
                    // If it's an image, display an image
                    <img
                      src={res.video_url} // Ensure this is an image URL
                      alt={res.file_name}
                      className="w-32 h-32 object-cover"
                    />
                  ) : (
                    // Handle other types, such as PDFs or other resources
                    <a
                      href={res.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      View
                    </a>
                  )}

                  <button
                    onClick={() => handleEdit(res)}
                    className="text-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
