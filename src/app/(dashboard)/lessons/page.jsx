"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ApiClientLms } from "../../../service/ApiUserAccount";
import { useSelector } from "react-redux";
import Image from "next/image";
import edit from "../../../assets/icons/social_media_icons/editFrame.png";
import deleteFrame from "../../../assets/icons/social_media_icons/deleteFrame.png";
import uploadFrame from "../../../assets/icons/social_media_icons/uploadFrame.png";

const Lessons = ({
  lessons: initialLessons = [],
  chapterId: initialChapterId,
  courseId: initialCourseId,
  onEdit,
}) => {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  console.log('resourceeeeeeeeeeeeeee',user)
  const entity_type = user?.selectedEntityRole
  console.log(entity_type)
  const router = useRouter();

  // State for lessons
  const [lessons, setLessons] = useState(initialLessons || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // IDs tracking
  const [courseIdState, setCourseIdState] = useState(initialCourseId);
  const [chapterIdState, setChapterIdState] = useState(initialChapterId);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  // UI control states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resourceButtonEnabled, setResourceButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);

  // Form data
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    video_url: null,
    resource_type: null,
    chapterId: initialChapterId,
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
    resources: [],
  });

  // Resource management
  const [file, setFile] = useState(null);
  const [about, setAbout] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [resourceId, setResourceId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch course and lessons data
  const fetchCourse = async () => {
    console.log("Fetching course data...");
    try {
      setLoading(true);
      const res = await ApiClientLms.get(
        `/courses/get-by-module-id/${id}`,

        {
          withCredentials: true,
        }
      );
      console.log("Course data:", res.data);

      // Find the relevant chapter
      let chapter = initialChapterId
        ? res.data.chapters.find((c) => c.id === initialChapterId)
        : res.data.chapters[0];

      if (chapter) {
        const chaptersLessons = chapter.Lessons || [];
        console.log("Fetched lessons:", chaptersLessons);
        setLessons(chaptersLessons);
        setCourseIdState(chapter.course);
        setChapterIdState(chapter.id);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Fetch course error:", err);
      setError("Failed to load course data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (
      id &&
      (!initialLessons.length || !initialCourseId || !initialChapterId)
    ) {
      fetchCourse();
    }
  }, [id, initialLessons.length, initialCourseId, initialChapterId]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    setLessonData((prev) => ({
      ...prev,
      video_url: file,
    }));
  };

  const handleResourceChange = (e) => {
    const files = Array.from(e.target.files);

    const resourcesWithType = files
      .map((file) => {
        let type = "";
        if (file.type.startsWith("video/")) {
          type = "video";
        } else if (file.type === "application/pdf") {
          type = "pdf";
        } else {
          return null; // Exclude invalid files
        }
        return { file, type };
      })
      .filter((resource) => resource !== null);

    if (resourcesWithType.length === 0) {
      setMessage("No valid files selected. Please upload PDF or video files.");
    } else {
      setMessage("");
    }

    setLessonData((prev) => ({
      ...prev,
      resource_type: resourcesWithType,
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentLessonId(null);
    setLessonData({
      title: "",
      description: "",
      video_url: null,
      resource_type: null,
      chapterId: initialChapterId,
      created_by: user?.userId || null,
      updated_by: user?.userId || null,
      resources: [],
    });
    setFile(null);
    setAbout("");
    setFileType("pdf");
    setResourceId(null);
    setMessage("");
    setIsEditing(false);
    setSaveButtonEnabled(true);
    setResourceButtonEnabled(false);
  };

  // Close form
  const closeForm = () => {
    resetForm();
    setShowLessonForm(false);
  };

  // Create new lesson
  const addLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const lessonPayload = {
        title: lessonData.title,
        description: lessonData.description,
        course: courseIdState,
        chapter: chapterIdState,
        chapterId: lessonData.chapterId,
        created_by: lessonData.created_by,
        updated_by: lessonData.updated_by,
      };

      const lessonRes = await ApiClientLms.post("/lessons", lessonPayload, {
        withCredentials: true,
      });

      if (lessonRes.status === 200 || lessonRes.status === 201) {
        console.log("Lesson created successfully:", lessonRes.data);
        setCurrentLessonId(lessonRes.data.id);
        setLessons((prev) => [...prev, lessonRes.data]);
        setResourceButtonEnabled(true);
        setSaveButtonEnabled(false);
        setMessage("Lesson created successfully! Now you can add resources.");
      } else {
        throw new Error("Failed to create lesson");
      }
    } catch (err) {
      console.error("Error creating lesson:", err);
      setError("Failed to create lesson.");
    } finally {
      setLoading(false);
    }
  };

  // Save resources
  const saveResource = async () => {
    if (!currentLessonId) {
      setMessage("Please save the lesson first before adding resources.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (lessonData.resource_type && lessonData.resource_type.length > 0) {
        for (const { file, type } of lessonData.resource_type) {
          if (!["pdf", "video"].includes(type)) {
            setMessage(
              `Invalid resource type for ${file.name}. Only PDF or video files are allowed.`
            );
            continue;
          }

          const formData = new FormData();
          formData.append("lesson", currentLessonId);
          formData.append("about", lessonData.description || "");
          formData.append("file", file);
          formData.append("resource_type", type);

          console.log("Uploading resource:", {
            lesson: currentLessonId,
            about: lessonData.description,
            file: file.name,
            type,
          });
          console.log('resourseeeeeeeeeeeeeeeeeeeee',formData)
          const response = await ApiClientLms.post("/resource", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          if (response.status !== 201) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          // Add the new resource to lessonData.resources
          const newResource = {
            id: response.data.id,
            lessons: currentLessonId,
            about: lessonData.description || "",
            resource_type: type,
            file_name: file.name,
            video_url: response.data.video_url || "",
          };
          setLessonData((prev) => ({
            ...prev,
            resources: [...prev.resources, newResource],
          }));

          // Update lessons state
          setLessons((prev) =>
            prev.map((lesson) =>
              lesson.id === currentLessonId
                ? {
                    ...lesson,
                    resources: Array.isArray(lesson.resources)
                      ? [...lesson.resources, newResource]
                      : [newResource],
                  }
                : lesson
            )
          );
        }

        setMessage("All valid resources uploaded successfully!");
      } else {
        setMessage("No valid resources selected to upload.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload resource(s).");
    } finally {
      setLoading(false);
    }
  };

  // Update existing lesson
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatePayload = {
        title: lessonData.title,
        description: lessonData.description,
        updated_by: user?.userId || null,
      };

      const res = await ApiClientLms.patch(
        `/lessons/${currentLessonId}`,
        updatePayload,
        { withCredentials: true }
      );

      if (res.status === 200) {
        console.log("Lesson updated:", res.data);
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === currentLessonId ? res.data : lesson
          )
        );
        setMessage("Lesson updated successfully!");
        setSaveButtonEnabled(false);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update lesson.");
    } finally {
      setLoading(false);
    }
  };

  // Delete lesson
  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await ApiClientLms.delete(`/lessons/${lessonId}`, {
        withCredentials: true,
      });

      if (res.status === 204) {
        setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
        setMessage("Lesson deleted successfully!");
      }
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setError("Failed to delete lesson.");
    } finally {
      setLoading(false);
    }
  };

  // Open update form
  // 1. Fix for openUpdateForm function
  const openUpdateForm = (lesson) => {
    console.log("Opening update form for lesson:", lesson.id);
    setCurrentLessonId(lesson.id);

    // Handle resources properly
    let resourcesArray = [];
    let resourceId = null;

    if (lesson.resources) {
      // Check if resources is an array or a single object
      if (Array.isArray(lesson.resources)) {
        resourcesArray = lesson.resources;
        // Set resourceId to the first resource's ID if available
        if (resourcesArray.length > 0) {
          resourceId = resourcesArray[0].id;
        }
      } else {
        // It's a single object
        resourcesArray = [lesson.resources];
        resourceId = lesson.resources.id;
      }
    }
    setResourceId(resourceId);
    console.log("Resource ID set to:", resourceId);

    setLessonData({
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url || null,
      resource_type: null,
      chapterId: initialChapterId,
      created_by: lesson.created_by,
      updated_by: user?.userId || null,
      resources: resourcesArray,
    });

    setIsEditing(true);
    setShowLessonForm(true);
    setResourceButtonEnabled(true);
    setSaveButtonEnabled(true);
    setAbout("");
    setFileType("pdf");
  };

  // Resource form handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      let type = "";
      if (selectedFile.type.startsWith("video/")) {
        type = "video";
      } else if (selectedFile.type === "application/pdf") {
        type = "pdf";
      } else {
        setMessage("Invalid file type. Please upload a PDF or video file.");
        return;
      }
      setFile(selectedFile);
      setFileType(type);
      setMessage("");
    }
  };

  // Add or update individual resource
  const handleResourceSubmit = async (e) => {
    e.preventDefault();

    if (!currentLessonId) {
      setMessage("Please save the lesson first before adding resources.");
      return;
    }

    const formData = new FormData();

    if (file) {
      formData.append("file", file);
      formData.append("file_name", file.name);
    }

    formData.append("resource_type", fileType);
    formData.append("about", about);
    formData.append("lesson", currentLessonId);

    setLoading(true);
    setMessage("");
    console.log("FormData for resource:", { resourceId, currentLessonId });
    console.log(resourceId);
    try {
      let res;
      if (resourceId) {
        // PATCH request for updating an existing resource
        res = await ApiClientLms.patch(`/resource/${resourceId}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Resource updated successfully!");
        // Update lessonData.resources with the updated resource
        setLessonData((prev) => ({
          ...prev,
          resources: prev.resources.map((r) =>
            r.id === resourceId
              ? {
                  ...r,
                  about,
                  resource_type: fileType,
                  file_name: file ? file.name : r.file_name,
                  video_url: res.data.video_url || r.video_url,
                }
              : r
          ),
        }));
        // Update lessons state
        setLessons((prev) =>
          prev.map((lesson) => {
            if (lesson.id === currentLessonId) {
              // Make sure resources is always an array
              const currentResources = Array.isArray(lesson.resources)
                ? lesson.resources
                : lesson.resources
                ? [lesson.resources]
                : [];

              // Now map through the array safely
              return {
                ...lesson,
                resources: currentResources.map((r) =>
                  r.id === resourceId
                    ? {
                        ...r,
                        about,
                        resource_type: fileType,
                        file_name: file ? file.name : r.file_name,
                        video_url: res.data.video_url || r.video_url,
                      }
                    : r
                ),
              };
            }
            return lesson;
          })
        );
        
        // Close the form after successful update
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        // POST request for creating a new resource
        res = await ApiClientLms.post("/resource", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("POST response:", res.data);
        setMessage("Resource added successfully!");
        // Store resourceId and update lessonData.resources
        const newResource = {
          id: res.data.id,
          lessons: currentLessonId,
          about,
          resource_type: fileType,
          file_name: file ? file.name : "",
          video_url: res.data.video_url || "",
        };
        setResourceId(res.data.id);
        setLessonData((prev) => ({
          ...prev,
          resources: [...prev.resources, newResource],
        }));
        // Update lessons state
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === currentLessonId
              ? {
                  ...lesson,
                  resources: Array.isArray(lesson.resources)
                    ? [...lesson.resources, newResource]
                    : [newResource],
                }
              : lesson
          )
        );
        
        // Close the form after successful resource addition
        setTimeout(() => {
          closeForm();
        }, 1500);
      }

      // Reset form fields but keep resourceId for further edits
      setAbout("");
      setFile(null);
      setFileType("pdf");

      if (document.getElementById("fileInput")) {
        document.getElementById("fileInput").value = "";
      }

      // Fetch course to ensure data consistency
      fetchCourse();
    } catch (err) {
      console.error("Resource operation failed:", err);
      setMessage(
        err.response?.data?.message || "Operation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit resource
  const handleEditResource = (resource) => {
    setAbout(resource.about || "");
    const validType = ["pdf", "video"].includes(resource.resource_type)
      ? resource.resource_type
      : "pdf";
    setFileType(validType);
    setResourceId(resource.id);
    setMessage("Editing resource: " + (resource.file_name || ""));
  };

  // Delete resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClientLms.delete(`/resource/${resourceId}`, {
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 204) {
        setMessage("Resource deleted successfully!");

        // Update lessonData.resources
        setLessonData((prev) => ({
          ...prev,
          resources: prev.resources.filter((r) => r.id !== resourceId),
        }));

        // Update lessons state with proper array handling
        setLessons((prev) =>
          prev.map((lesson) => {
            if (lesson.id === currentLessonId) {
              // Ensure resources is an array
              const currentResources = Array.isArray(lesson.resources)
                ? lesson.resources
                : lesson.resources
                ? [lesson.resources]
                : [];

              return {
                ...lesson,
                resources: currentResources.filter((r) => r.id !== resourceId),
              };
            }
            return lesson;
          })
        );

        // Close the form after successful deletion
        setTimeout(() => {
          closeForm();
        }, 1500);
        
        setResourceId(null);
        fetchCourse();
      }
    } catch (err) {
      console.error("Delete resource error:", err);
      setMessage("Failed to delete resource.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing resource
  const cancelResourceEdit = () => {
    setResourceId(null);
    setAbout("");
    setFile(null);
    setFileType("pdf");
    setMessage("");

    if (document.getElementById("fileInput")) {
      document.getElementById("fileInput").value = "";
    }
  };


  return (
    <div className="lesson-manager">
      {/* Add Lesson Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            setShowLessonForm(true);
            resetForm();
          }}
          className="text-white p-1 ml-auto rounded bg-[#402BA3] hover:bg-[#3a269b] flex items-center text-sm"
        >
          <span className="mr-1">+</span> Add Lesson
        </button>
      </div>

      {/* Empty State */}
      {lessons.length === 0 && !showLessonForm ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-4 text-center">
          <h3 className="text-lg font-medium mb-2">No Lessons added yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first Lesson to start building your course curriculum
          </p>
          <button
            onClick={() => {
              setShowLessonForm(true);
              resetForm();
            }}
            className="bg-[#402BA3] hover:bg-[#3a269b] text-white text-sm px-3 py-1 rounded-md"
          >
            + Add First Lesson
          </button>
        </div>
      ) : (
        <div className="p-3 border mt-4">
          {/* Lesson List */}
          <h3 className="text-sm font-medium mb-2 text-[#402BA3]">Lessons</h3>
          <ul className="space-y-2">
            {lessons.map((lesson, index) => (
              <li
                key={lesson.id || index}
                className="border rounded flex justify-between items-center p-2"
              >
                <div className="flex items-center flex-1">
                  <span className="text-sm">
                    {lesson.title || `Lesson ${index + 1}`}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openUpdateForm(lesson)}
                    className="text-gray-600 hover:text-blue-600 p-1"
                  >
                    <Image src={edit} alt="Edit" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="text-gray-600 hover:text-red-600 p-1"
                  >
                    <Image src={deleteFrame} alt="Delete" className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Lesson Form */}
          {showLessonForm && (
            <div className="mt-4 border border-gray-300 rounded-lg p-3">
              {/* Form Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">
                  {isEditing ? "Edit Lesson" : "Add New Lesson"}
                </h3>
                <button onClick={closeForm} className="text-red-500">
                  ×
                </button>
              </div>

              {/* Success/Error Messages */}
              {message && (
                <div
                  className={`mb-3 p-2 text-sm rounded ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Lesson Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={lessonData.title}
                    onChange={handleChange}
                    placeholder="e.g. Getting Started"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={lessonData.description}
                    onChange={handleChange}
                    placeholder="Lesson Description"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    rows="3"
                  ></textarea>
                </div>

                {/* Save Lesson Button */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={isEditing ? handleUpdate : addLesson}
                    disabled={loading || !saveButtonEnabled}
                    className={`px-4 py-1 rounded text-white ${
                      saveButtonEnabled
                        ? "bg-[#402BA3] hover:bg-[#3a269b]"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading
                      ? "Saving..."
                      : isEditing
                      ? "Update Lesson"
                      : "Save Lesson"}
                  </button>
                </div>
              </div>

              {isEditing &&
                lessonData.resources &&
                lessonData.resources.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">
                      Existing Resources
                    </h3>
                    <ul className="space-y-2">
                      {lessonData.resources.map((resource, idx) => (
                        <li
                          key={resource.id || `resource-${idx}`}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {resource.file_name || "Resource"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {resource.about || resource.resource_type || ""}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => handleEditResource(resource)}
                              className="text-gray-600 hover:text-blue-600 p-1"
                              disabled={!resourceButtonEnabled}
                            >
                              <Image
                                src={edit}
                                alt="Edit"
                                className="w-5 h-5"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-gray-600 hover:text-red-600 p-1"
                              disabled={!resourceButtonEnabled}
                            >
                              <Image
                                src={deleteFrame}
                                alt="Delete"
                                className="w-5 h-5"
                              />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Individual Resource Form */}
              {resourceButtonEnabled && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">
                    {resourceId ? "Edit Resource" : "Add Individual Resource"}
                  </h3>

                  <form className="space-y-3" onSubmit={handleResourceSubmit}>
                    <div>
                      <label
                        htmlFor="fileInput"
                        className="block text-sm font-medium mb-1"
                      >
                        File{" "}
                        {resourceId
                          ? "(Leave empty to keep current file)"
                          : "*"}
                      </label>
                      <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full border rounded px-3 py-2"
                        accept="application/pdf,video/*"
                        required={!resourceId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Resource Type *
                      </label>
                      <select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        About
                      </label>
                      <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                      {resourceId && (
                        <button
                          type="button"
                          onClick={cancelResourceEdit}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-1 bg-[#402BA3] hover:bg-[#3a269b] text-white rounded"
                      >
                        {loading
                          ? "Processing..."
                          : resourceId
                          ? "Update Resource"
                          : "Add Resource"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Lessons;
