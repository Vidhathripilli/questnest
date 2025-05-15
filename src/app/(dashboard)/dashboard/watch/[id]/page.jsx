"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClientLms } from "@/src/service/ApiUserAccount";
import { useDispatch, useSelector } from "react-redux";
import { Router } from "next/router";
import Chapters from "@/src/components/Chapters";
import Que_n_Ans from "@/components/Que_n_Ans";
import { setUserInfo } from "@/store/authSlice";
import Course_and_note from "@/components/Course_and_note";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

export default function SingleCoursePage({ params }) {
  const { id } = useParams();
  // const [course, setCourse] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [school, setSchool] = useState(null);
  const [chapterModel, setChapterModel] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [iscoach, setCoach] = useState(false);

  const [courseModel, setCourseModel] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [resourcesToWatch, setResourcesToWatch] = useState([]);

  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleResourcesSelected = (resources) => {
    console.log("resources", resources);

    setResourcesToWatch(resources);
  };
  console.log("resources to watch from watch comp ", resourcesToWatch);

  const user = useSelector((state) => state.auth.user);
  console.log("userrrrrrrrrrrrrrrrrrrr", user);
  const dispatch = useDispatch();
  const route = useRouter();
  const [formData, setFormData] = useState({
    school: "",
    module_id: "",
    publish_to_school: false,
    publish_to_marketplace: null,
    name: "",
    description: "",
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });
  const [chapterData, setChapterData] = useState({
    chapter_title: "",
    id: id,
    course: courseId,
    description: "",
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });
  // console.log("chapterdata",chapterData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    // Optional: also update formData if needed
    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Update chapterData for creating the new chapter
    setChapterData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };
  console.log("courses data", coursesData);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await ApiClientLms.post(
          `/courses/get-by-module-id`,
          { module_id: id },
          {
            withCredentials: true,
          }
        );

        setCoursesData(response.data);
        console.log("response of the course", response);

        if (response.status === 200) {
          if (user.selectedEntityRole !== 'entity_owner') {
            // Check if access token exists before trying to decode it
            if (response.data.access && typeof response.data.access === 'string') {
              try {
                const accessToken = response.data.access;
                const refreshToken = response.data.refresh;
                console.log("accessssssssssssss token", accessToken);
                const decodedToken = jwtDecode(accessToken);
                if (decodedToken.custom_claims && decodedToken.custom_claims.selected_module_role === "coach") {
                  setCoach(true);
                } else {
                  setCoach(false);
                }
              } catch (tokenError) {
                console.error("Error decoding token:", tokenError);
                // Continue execution without setting coach status
              }
            } else {
              console.log("No valid access token found for role:", user.selectedEntityRole);
            }
          }
        }

        let course_id = '';
        console.log("Response structure for " + user.selectedEntityRole + ":", response.data);

        // Fix for entity_admin role: Make sure course data is properly set for all roles
        if (user.selectedEntityRole === 'entity_user') {
          if (response.data.course) {
            setCourse(response.data.course);
            course_id = response.data.course.id;
          }
          console.log("Entity user course data:", response.data.course);
        } else {
          // For entity_admin and other roles
          if (response.data.course) {
            setCourse(response.data.course);
            course_id = response.data.course.id;
            console.log("Admin/other role using course object:", response.data.course);
          } else if (response.data.name) { // Check if it's a direct course object
            setCourse(response.data);
            course_id = response.data.id;
            console.log("Admin/other role using direct response:", response.data);
          } else {
            console.error("Unknown course data structure:", response.data);
            setError("Course data structure is not recognized.");
            // Still try to set some data if possible
            setCourse(response.data);
            course_id = response.data.id || '';
          }
        }

        // Set other state variables with additional error checking
        const fetchedCourses = response.data.courses || [];
        const fetchedSchool = response.data.school || null;
        setCoursesData(fetchedCourses);
        setSchool(fetchedSchool);
        if (course_id) {
          setCourseId(course_id);

          // Update user info in Redux with courseId
          const UserDetails = {
            ...user,
            courseId: course_id
          };
          dispatch(setUserInfo(UserDetails));
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent form reload
    setLoading(true);
    setError(null);

    const courseData = {
      school: school,
      module_id: parseInt(formData.module_id, 10),
      publish_to_school: formData.publish_to_school,
      publish_to_marketplace: formData.publish_to_marketplace,
      name: formData.name,
      description: formData.description,
      created_by: formData.created_by,
      updated_by: formData.updated_by,
    };

    try {
      const response = await ApiClientLms.patch(`/courses/${id}`, courseData, {
        withCredentials: true,
      });

      console.log("Update response:", response);

      if (response.status === 200) {
        setCourseModel(false); // Close modal
        setCourse(response.data); // Optionally update course state
      }
    } catch (error) {
      console.log("Update error:", error);
      setError("Failed to update course.");
    } finally {
      setLoading(false);
    }
  };
  // console.log(course)

  const handleDelete = async (e) => {
    try {
      const response = await ApiClientLms.delete(`/courses/${id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        alert("deleted");
        route.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    console.log(chapterData);
    try {
      const response = await ApiClientLms.post(
        "/chapters",
        {
          ...chapterData,
          course: courseId,
        },
        {
          withCredentials: true,
        }
      );
      console.log(chapterData);

      if (response.status === 200 || response.status === 201) {
        console.log("Chapter is created:", response.data);
        // const courseRes = await ApiClientLms.get(`/courses/${id}`, {
        //   withCredentials: true,

        console.log("response of the chapters", response.data);

        // });

        setCourse((prevCourse) => ({
          ...prevCourse,
          chapters: [response.data, ...(prevCourse.chapters || [])],
        }));
        // console.log("courses",course);

        // ✅ Add the new chapter to the beginning of the list
        // setChapters(prev => [response.data, ...prev]);

        // Reset and close modal
        setChapterModel(false);
        setChapterData({
          chapter_title: "",
          description: "",
          created_by: user?.id || null,
          updated_by: user?.id || null,
        });
      }
    } catch (error) {
      console.log(
        "Chapter creation error:",
        error.response?.data || error.message
      );
      setError("Failed to create chapter");
    }
  };

  return (
    <>
      <div className="grid grid-cols-5">
        <div className={`${iscoach ? "col-span-3" : "col-span-3"} px-4 py-6`}>
          {/* Video Section */}
          <div className="mb-8 bg-black  relative rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 w-full  h-96 flex items-center justify-center">
              {resourcesToWatch ? (
                <>
                  {resourcesToWatch.resource_type === "video" &&
                    resourcesToWatch.video_url ? (
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={resourcesToWatch.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : resourcesToWatch.resource_type === "pdf" &&
                    resourcesToWatch.video_url ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="mb-4 text-lg font-medium">
                        PDF cannot be displayed here.
                      </p>
                      <button
                        onClick={() =>
                          window.open(resourcesToWatch.video_url, "_blank")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                      >
                        Open PDF in new tab
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
                      <p className="text-lg font-medium">
                        No resource available
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
                  <p className="text-lg font-medium">No resource selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Title and Description */}
          {course && (
            <div className="mb-8 ">
              <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
              <p className="text-gray-600 ">{course.description}</p>
              {iscoach && (
                <Link
                  href={`/dashboard/Course_card/${course.module_id}`}
                  className="block"
                >
                  <button
                    className="px-4 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                  // onClick={() => handleOpenEditModal(item)}
                  >
                    Edit
                  </button>
                </Link>
              )}
              <div className="w-full">
                {/* Mentor Section */}
                <div className="flex flex-col items-start space-y-4 mb-6">
                  {course.mentorProfile ? (
                    <img
                      src={course.mentorProfile}
                      alt={course.mentorName || "Instructor"}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      {/* <span className="text-gray-600 font-medium">
                        {course.mentorName ? course.mentorName.charAt(0) : "P"}
                      </span> */}
                    </div>
                  )}

                  <div className="  h-[89px] flex items-center gap-6 p-4 bg-[#F1F0F7] rounded-lg border border-red-700  shadow-sm">
                    {/* Profile Image + Name */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <img
                        src="/mentor.jpg" // dynamic value can go here
                        alt="Mentor"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm text-black">
                          {course.mentorName || "Prof. Raj Verma"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-yellow-200 text-gray-700 rounded-full">
                          Head of Department
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[65.5px] w-[6px] bg-[#402BA3]"></div>

                    {/* Department */}
                    <div className="min-w-[200px]">
                      <p className="text-xs text-gray-500 font-semibold">Department:</p>
                      <p className="text-sm text-black mt-0.5">
                        Quantum Computing & Data Science
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-[65.5px] w-[6px] bg-[#402BA3]"></div>

                    {/* Experience */}
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Experience:</p>
                      <p className="text-sm text-black mt-0.5">
                        10+ years in Quantum Research
                      </p>
                    </div>
                  </div>
                </div>

                {/* 👇 Que_n_Ans component placed directly below */}
                <div className="w-full">
                  <Que_n_Ans />
                </div>
              </div>

              {chapterModel && (
                <div className="fixed inset-0 bg-gray-300 bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4">
                      Create New Chapter
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-">
                          Chapter Name
                        </label>
                        <input
                          type="text"
                          note name="chapter_title"
                          value={chapterData.chapter_title}
                          onChange={handleChange}
                          placeholder="Enter course name"
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={chapterData.description}
                          onChange={handleChange}
                          placeholder="Enter course description"
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
                          onClick={() => setCourseModel(false)}
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
                          {loading ? "Saving..." : "Save Course"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          <div></div>
        </div>
        <div className="col-span-2 mt-5">
          <Course_and_note onResourcesSelected={handleResourcesSelected} />

          {/* <Chapters chapters={course?.chapters || []} /> */}
        </div>
      </div>

    </>
  );
}
