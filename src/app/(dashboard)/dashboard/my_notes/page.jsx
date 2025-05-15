'use client';
import { ApiClientLms } from '@/service/ApiUserAccount';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// SVG icons for actions (edit, delete, and star)
const EditIcon = () => (
  <svg
    className="h-5 w-5 text-gray-500 cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="h-5 w-5 text-red-500 cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    className="h-5 w-5 text-yellow-400 cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const NotesPage = () => {
  const user = useSelector((state) => state.auth.user || {});
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!user.userId) {
        setError("User ID not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ApiClientLms.get(
          `/dashboard/notes/?user=${user.userId}`,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [user.userId]);

  // Fetch notes after edit
  const fetchNotes = async (lessonId) => {
    try {
      const response = await ApiClientLms.get(
        `/dashboard/notes/?user=${user.userId}&lesson_id=${lessonId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Failed to load notes after update.");
    }
  };

  // Format the date from created_at
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle edit action
  const handleEdit = (note) => {
    setNoteToEdit(note);
    setNoteContent(note.content || '');
    setSelectedLesson({ id: note.lesson_id || 1 }); // Placeholder lesson_id if not available
    setIsEditModalOpen(true);
  };

  // Save note (edit functionality)
  const saveNote = async () => {
    if (!selectedLesson || !noteContent.trim()) {
      alert("Please provide note content.");
      return;
    }

    try {
      const payload = {
        lesson_id: selectedLesson.id,
        title: noteToEdit?.title || "Note from LMS",
        content: noteContent,
        user: user.userId || 1,
      };

      if (noteToEdit) {
        payload.note_id = noteToEdit.id;
        const response = await ApiClientLms.patch(
          `/api/lesson/notes`,
          payload,
          { withCredentials: true }
        );
        if (response.status === 200) {
          await fetchNotes(selectedLesson.id);
          setIsEditModalOpen(false);
          setNoteToEdit(null);
          setNoteContent('');
        }
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note. Please try again.");
    }
  };

  // Handle delete action
  const handleDelete = async (note) => {
    try {
      const response = await ApiClientLms.delete(`/api/lesson/notes`, {
        data: {
          note_id: note.id,
          lesson_id: note.lesson_id || 1,
          user: user.userId || 1,
        },
        withCredentials: true,
      });
      if (response.status === 200 || response.status === 204) {
        setNotes(notes.filter((n) => n.id !== note.id));
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

  // Handle star action
  const handleStar = (noteId) => {
    console.log("Star note:", noteId);
    // Add star functionality here
  };

  // Close modal
  const closeModal = () => {
    setIsEditModalOpen(false);
    setNoteToEdit(null);
    setNoteContent('');
  };

  return (
    <div className="p-6">
      {/* Header with Sort by and New Note button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue="Date"
          >
            <option value="Date">Sort by</option>
            <option value="Date">Date</option>
            <option value="Course">Course</option>
            <option value="Chapter">Chapter</option>
            <option value="Lesson">Lesson</option>
          </select>
        </div>
        {/* <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-indigo-700 transition">
          <span className="h-4 w-4 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs">
            +
          </span>
          New Note
        </button> */}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-600">Loading notes...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-600">No notes found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-600 text-sm">
                <th className="py-2 px-4 font-medium">Date</th>
                <th className="py-2 px-4 font-medium">Course Name</th>
                <th className="py-2 px-4 font-medium">Chapter Name</th>
                <th className="py-2 px-4 font-medium">Lesson</th>
                <th className="py-2 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr
                  key={note.id}
                  className="bg-white rounded-lg shadow-sm text-sm text-gray-800"
                >
                  <td className="py-3 px-4 rounded-l-lg">
                    {formatDate(note.created_at)}
                  </td>
                  <td className="py-3 px-4">
                   {note.course_name} {/* Placeholder */}
                  </td>
                  <td className="py-3 px-4">{note.chapter_name}</td>
                  <td className="py-3 px-4">{note.lesson_name} {/* Placeholder */}</td>
                  <td className="py-3 px-4 rounded-r-lg">
                    <div className="flex items-center gap-3">
                      <span onClick={() => handleEdit(note)}>
                        <EditIcon />
                      </span>
                      <span onClick={() => handleDelete(note)}>
                        <DeleteIcon />
                      </span>
                      {note.bookmarked??(
                        <span onClick={() => handleStar(note.id)}>
                        <StarIcon />
                      </span>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[600px] p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Notes</span>
                <span>&gt;</span>
                <span>Basics of Quantum Computing</span>
                <span>&gt;</span>
                <span>Qubits</span>
                <span>&gt;</span>
                <span>Zero to Hero: Python Mastery</span>
                <span>&gt;</span>
                <span>{formatDate(noteToEdit.created_at)}</span>
              </div>
              <StarIcon />
            </div>

            {/* Textarea */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Enter your note here..."
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;