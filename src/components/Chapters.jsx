import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ApiClientLms } from "../service/ApiUserAccount";
import Lessons from "../app/(dashboard)/lessons/page";
import { useSelector } from "react-redux";
import Image from "next/image";
import edit from '../assets/icons/social_media_icons/editFrame.png';
 
import deleteFrame from '../assets/icons/social_media_icons/deleteFrame.png';
 
 
const Chapters = ({ chapters: initialChapters, courseId, onChapterUpdate, onLessonEdit }) => {
  const { id } = useParams();
  const [chapters, setChapters] = useState(initialChapters || []);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
 
  const [chapterModel, setChapterModel] = useState(false); // Toggle between list and form
  const [currentLessons, setCurrentLessons] = useState([]);
  const [chapterData, setChapterData] = useState({
    chapter_title: "",
    description: "",
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });
  console.log("OOOOOOOOOOOOOOOOOOOOOOOOOO",chapters);
  
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;
 
    setChapterData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };
 
  const toggleChapter = (index) => {
    const isOpen = openIndex === index;
    setOpenIndex(isOpen ? null : index);
 
    if (!isOpen) {
      const selectedChapter = chapters[index];
      setCurrentLessons(selectedChapter?.Lessons || []);
    }
  };
 
  useEffect(() => {
    setChapters(initialChapters || []);
  }, [initialChapters]);
 
  const handleEditClick = (chapter) => {
    setChapterModel(true);
    setCurrentChapterId(chapter.id);
    setChapterData({
      chapter_title: chapter.chapter_title,
      description: chapter.description,
      created_by: user?.userId || null,
      updated_by: user?.userId || null,
    });
  };
 
  const handleDelete = async (chapterId) => {
    try {
      const response = await ApiClientLms.delete(`/chapters/${chapterId}`, {
        withCredentials: true,
      });
 
      if (response.status === 204) {
        const courseRes = await ApiClientLms.get(`/courses/${id}`, {
          withCredentials: true,
        });
        const updatedChapters = courseRes.data.chapters || [];
        setChapters(updatedChapters);
        onChapterUpdate(updatedChapters); // Sync with parent
      }
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
    }
  };
 
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
 
    try {
      const endpoint = currentChapterId ? `/chapters/${currentChapterId}` : `/chapters`;
      const method = currentChapterId ? "patch" : "post";
 
      const response = await ApiClientLms[method](
        endpoint,
        {
          ...chapterData,
          course: courseId,
        },
        {
          withCredentials: true,
        }
      );
 
      if (response.status === 200 || response.status === 201) {
        const courseRes = await ApiClientLms.post(`/courses/get-by-module-id`,
          {
            module_id: id,
          }, {
          withCredentials: true,
        });
        const updatedChapters = courseRes.data.chapters || [];
        setChapters(updatedChapters);
        onChapterUpdate(updatedChapters); // Sync with parent
 
        setChapterModel(false);
        setCurrentChapterId(null);
        setChapterData({
          chapter_title: "",
          description: "",
          created_by: user?.userId || null,
          updated_by: user?.userId || null,
        });
      }
    } catch (error) {
      console.log(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleCloseForm = () => {
    setChapterModel(false);
    setChapterData({
      chapter_title: "",
      description: "",
      created_by: user?.id || null,
      updated_by: user?.id || null,
    });
    setCurrentChapterId(null);
    setError(null);
  };
 

  return (
    <div className="mt-1">
      <div className="bg-white rounded-lg shadow-sm border-b pb-4">
        <div className="flex justify-between items-center px-4 py-2 ">
          <h2 className="text-lg font-medium text-[#402BA3]">Course Curriculum</h2>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-md"
            onClick={() => {
              setChapterModel(true);
              setCurrentChapterId(null);
            }}
          >
            + Add Chapter
          </button>
        </div>

        {chapterModel ? (
          <div className="border border-gray-300 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Chapter: {chapterData.chapter_title || "(0 Lessons)"}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chapter Name</label>
                <input
                  type="text"
                  name="chapter_title"
                  value={chapterData.chapter_title}
                  onChange={handleChange}
                  placeholder="Enter chapter name"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={chapterData.description}
                  onChange={handleChange}
                  placeholder="Enter chapter description"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-red-500 hover:underline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Saving..." : currentChapterId ? "Update Chapter" : "Save Chapter"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {chapters.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-4 text-center">
                <h3 className="text-lg font-medium mb-2">No Chapters added yet</h3>
                <p className="text-gray-500 mb-4">Add your first chapter to start building your course curriculum</p>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-md"
                  onClick={() => {
                    setChapterModel(true);
                    setCurrentChapterId(null);
                  }}
                >
                  + Add First Chapter
                </button>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div key={chapter.id} className=" ">
                  <div
                    className="flex text-[#402BA3] items-center border rounded-lg justify-between px-4 py-3 cursor-pointer"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className=" items-center ">
                      {/* <span className="mr-2 text-gray-600 text-sm">{openIndex === index ? "▼" : "▶"}</span> */}
                      <div className="flex">
                        <h3 className="font-medium mr-3">Chapter {index + 1}: {chapter.chapter_title}</h3>
                        <p className="text-xs mt-2 text-[#402BA3]">({chapter.Lessons?.length || 0} Lessons)</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(chapter);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <span className="flex items-center justify-center w-6 h-6"><Image src={edit}></Image></span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(chapter.id);
                        }}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <span className="flex items-center justify-center w-6 h-6"><Image src={deleteFrame}></Image></span>
                      </button>
                    </div>
                  </div>

                  {openIndex === index && (
                    <div className="px-4 py-2 bg-white">
                      <div className="mb-2">
                        <h4 className="text-sm font-medium mb-2">Lessons</h4>
                        <Lessons
                          lessons={chapter.Lessons}
                          chapterId={chapter.id}
                          courseId={chapter.course}
                          onEdit={onLessonEdit}
                        />
                      </div>
                      {/* <button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-md">
                        + Add Lesson
                      </button> */}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* <div className="flex justify-between px-4 py-4 mt-4">
          <button className="px-4 py-2 text-red-600 font-medium">Delete</button>
          <div className="space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Save draft
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
              Save Changes
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Chapters;