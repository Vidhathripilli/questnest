"use client";

import { ApiClientLms } from "@/service/ApiUserAccount";
import { setUser } from "@/store/authSlice";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";

export default function Course_and_note({ onResourcesSelected }) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Course");
  const [courses, setCourses] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [noteContent, setNoteContent] = useState("");
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resourcesToWatch, setResourcesToWatch] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const user = useSelector((state) => state.auth?.user) || {};

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.selectedEntity) {
        setLoading(false);
        return;
      }
console.log("ffffffff")
      const res = await ApiClientLms.post(
        `/courses/get-by-module-id`,
        { module_id: id },
        { withCredentials: true }
      );
      if (res.status === 200) {
        console.log("kkkkkkkkkkkkkkkkkkkk",res)
        if (user.selectedEntityRole === "entity_user") {
          setCourses(res.data.course);
          setSelectedCourse(res.data.course);
        } else {
          setCourses(res.data);
          setSelectedCourse(res.data);
        }
      }
    } catch (err) {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.selectedEntity, id]);

  const fetchNotes = async (lessonId) => {
    try {
      const res = await ApiClientLms.get(
        `/api/lesson/notes?lesson_id=${lessonId}&user=${user.userId || 1}`,
        {
          withCredentials: true,
        }
      );
      const fetchedNotes = res.data || [];
      setNotes(fetchedNotes);

      if (fetchedNotes.length > 0) {
        const mostRecentNote = fetchedNotes[0];
        setNoteContent(mostRecentNote.content || "");
        setNoteToEdit(mostRecentNote);
        setIsFavorite(!!mostRecentNote.bookmark); // Set based on backend data
      } else {
        setNoteContent("");
        setNoteToEdit(null);
        setIsFavorite(false);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setNotes([]);
      setNoteContent("");
      setNoteToEdit(null);
      setIsFavorite(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      setUser(userInfo);
    }
  }, []);

  useEffect(() => {
    if (user?.selectedEntity) {
      fetchCourses();
    }
  }, [fetchCourses, user]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const selectLesson = (lesson, chapter) => {
    setSelectedLesson(lesson);
    setSelectedChapter(chapter);
    onResourcesSelected?.(lesson?.resources || []);
    setResourcesToWatch(lesson.resources || []);
    if (activeTab === "Note") {
      fetchNotes(lesson.id);
    }
  };

  const switchToNotes = () => {
    setActiveTab("Note");
    if (selectedLesson) fetchNotes(selectedLesson.id);
  };

  const saveNote = async () => {
    if (!selectedLesson || !noteContent.trim()) return;

    try {
      const payload = {
        lesson_id: selectedLesson.id,
        title: noteToEdit?.title || "Note from LMS",
        content: noteContent,
        user: user.userId || 1,
      };

      if (noteToEdit && isEditing) {
        payload.note_id = noteToEdit.id;
        const res = await ApiClientLms.patch(`/api/lesson/notes`, payload, {
          withCredentials: true,
        });
        if (res.status === 200) await fetchNotes(selectedLesson.id);
      } else {
        const res = await ApiClientLms.post(`/api/lesson/notes`, payload, {
          withCredentials: true,
        });
        if (res.status === 200 || res.status === 201)
          await fetchNotes(selectedLesson.id);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const clearNote = () => {
    setNoteContent("");
    setIsEditing(false);
  };

  const openDeleteConfirmation = (note) => {
    setNoteToDelete(note);
    setIsDeleteConfirmModalOpen(true);
  };

  const deleteNote = async () => {
    if (!noteToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await ApiClientLms.delete(`/api/lesson/notes`, {
        data: {
          note_id: noteToDelete.id,
          lesson_id: selectedLesson.id,
          user: user.userId || 1,
        },
        withCredentials: true,
      });
      if (response.status === 200 || response.status === 204) {
        await fetchNotes(selectedLesson.id);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setIsDeleteConfirmModalOpen(false);
      setNoteToDelete(null);
      setDeleteLoading(false);
    }
  };

  const startEditing = () => setIsEditing(true);

  const toggleFavorite = async () => {
    if (!noteToEdit) return;

    try {
      const newFavoriteStatus = !isFavorite;
      const payload = {
        note_id: noteToEdit.id,
        lesson_id: selectedLesson.id,
        user: user.userId || 1,
        bookmark: newFavoriteStatus,
      };

      console.log("Toggling bookmark with payload:", payload);

      const res = await ApiClientLms.patch(`/api/lesson/notes`, payload, {
        withCredentials: true,
      });

      if (res.status === 200) {
        // Fetch the latest notes to ensure UI is in sync with backend
        await fetchNotes(selectedLesson.id);
        console.log('worked')
        console.log(res)
      } else {
        console.error("Failed to toggle bookmark: Unexpected status", res.status);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      // No need to revert isFavorite here since fetchNotes will set it based on backend data
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getTimeSinceUpdate = (updatedAt) => {
    const updatedTime = new Date(updatedAt);
    const now = new Date();
    const diffMins = Math.floor((now - updatedTime) / (1000 * 60));
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getTotalLessonsCount = (course) => {
    if (!course || !course.chapters) return 0;
    return course.chapters.reduce(
      (total, chapter) => total + (chapter.Lessons?.length || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-4 font-sans">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-full mb-5 overflow-hidden">
        <button
          className={`flex-1 py-2.5 text-center ${
            activeTab === "Course"
              ? "bg-indigo-700 text-white rounded-full"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("Course")}
        >
          Course
        </button>
        <button
          className={`flex-1 py-2.5 text-center cursor-pointer ${
            activeTab === "Note"
              ? "bg-indigo-700 text-white rounded-full"
              : "text-gray-600"
          }`}
          onClick={() => (selectedLesson ? switchToNotes() : null)}
        >
          Note
        </button>
      </div>

      {/* Course Content */}
      {activeTab === "Course" && (
        <div className="course-content">
          {courses ? (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="font-semibold text-lg">{courses.name}</h2>
                <div className="text-sm text-gray-500 mt-1">
                  Course Content
                  <span className="ml-4">
                    {getTotalLessonsCount(courses)} lessons ·{" "}
                    {formatDuration(courses.duration)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                {courses.chapters?.map((chapter, index) => (
                  <div key={chapter.id || index} className="mb-3">
                    <div
                      className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium">
                        {chapter.chapter_title}
                      </div>
                      <div className="text-xs text-gray-500 mr-2">
                        {formatDuration(chapter.duration)}
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transform transition ${
                          expandedChapters[chapter.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                        {chapter.Lessons?.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id || `lesson-${lessonIndex}`}
                            className={`p-3 ${
                              selectedLesson?.id === lesson.id
                                ? "bg-indigo-700 text-white"
                                : "bg-white hover:bg-gray-50"
                            } cursor-pointer border-b border-gray-100 last:border-b-0 transition`}
                            onClick={() => selectLesson(lesson, chapter)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-sm mr-2">
                                  Lesson {lessonIndex + 1} ·
                                </span>
                                <span className="text-sm font-medium">
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`text-xs ${
                                    selectedLesson?.id === lesson.id
                                      ? "text-white"
                                      : "text-gray-500"
                                  } mr-2`}
                                >
                                  {formatDuration(lesson.duration)}
                                </span>
                                {selectedLesson?.id === lesson.id && (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
              No courses available
            </div>
          )}
        </div>
      )}

      {/* Notes Content */}
      {activeTab === "Note" && (
        <div className="notes-content">
          {selectedLesson ? (
            <>
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="font-medium text-base">
                  Notes for: {selectedLesson.title}
                </h3>
              </div>

              <div className="p-4">
                {/* Inline Note Editor */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    Notes: Chapter ({selectedChapter?.name || "1"}) / Lesson{" "}
                    {selectedLesson.title}{" "}
                    <button
                      onClick={toggleFavorite}
                      className={`ml-1 text-sm font-medium focus:outline-none transition ${
                        isFavorite
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                      aria-pressed={isFavorite}
                      title={isFavorite ? "Unmark Favorite" : "Mark as Favorite"}
                    >
                      ★ {isFavorite ? "Favourited" : "Make Favourite"}
                    </button>
                  </p>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="When sharing thoughtful points..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {noteToEdit && !isEditing && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {getTimeSinceUpdate(noteToEdit.updated_at)}
                    </p>
                  )}
                  <div className="flex justify-end mt-2 space-x-2">
                    {noteToEdit && !isEditing ? (
                      <>
                        <button
                          className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
                          onClick={() => openDeleteConfirmation(noteToEdit)}
                        >
                          Delete
                        </button>
                        <button
                          className="px-4 py-1 bg-indigo-700 text-white rounded-full text-sm hover:bg-indigo-800 transition"
                          onClick={startEditing}
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
                          onClick={clearNote}
                        >
                          Clear
                        </button>
                        <button
                          className="px-4 py-1 bg-indigo-700 text-white rounded-full text-sm hover:bg-indigo-800 transition"
                          onClick={saveNote}
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
              Please select a lesson to view or add notes.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-lg">
            <h3 className="font-semibold text-lg mb-4">Delete Note</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition"
                onClick={() => {
                  setIsDeleteConfirmModalOpen(false);
                  setNoteToDelete(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition ${
                  deleteLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={deleteNote}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}