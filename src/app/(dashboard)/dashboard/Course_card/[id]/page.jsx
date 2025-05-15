"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClientLms } from "@/src/service/ApiUserAccount";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "@/store/authSlice";
import Image from "next/image";
import upload from "../../../../../assets/icons/social_media_icons/upload.png";
import Chapters from "@/src/components/Chapters";
import left from "../../../../../assets/icons/social_media_icons/left.svg";
import add from "../../../../../assets/icons/social_media_icons/add.svg";

export default function SingleCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const selectedUser = user?.selectedEntityRole

  console.log(selectedUser)

  // State management
  const [isenityUser , setentityUser] = useState(true)
  useEffect(() => {
    if (selectedUser === "entity user") {
      setentityUser(false);
    }
  }, [selectedUser]);
  console.log(isenityUser)
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [school, setSchool] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [lessonModal, setLessonModal] = useState(false);
  const [resourceButtonEnabled, setResourceButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStdModalOpen, setIsAddStdModalOpen] = useState(false);
  // Form data states
  const [formData, setFormData] = useState({
    school: "",
    module_id: "",
    publish_to_school: false,
    publish_to_marketplace: null,
    name: "",
    description: "",
    thumbnail_url: "",
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });

  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    video_url: null,
    resource_type: null,
    chapterId: "",
    resources: [],
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });

  // Fetch course data
  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await ApiClientLms.post(
          "/courses/get-by-module-id",
          { module_id: id },
          { withCredentials: true }
        );

        if (response.status === 200 && isMounted) {
          const courseData = response.data.course || response.data;
          setCourse(courseData);
          setSchool(response.data.school || null);
          setCourseId(courseData?.id);
          setChapters(courseData?.chapters || []);

          setFormData({
            school: courseData.school || "",
            module_id: courseData.module_id || "",
            publish_to_school: courseData.publish_to_school || false,
            publish_to_marketplace: courseData.publish_to_marketplace || null,
            name: courseData.name || "",
            description: courseData.description || "",
            thumbnail_url: courseData.thumbnail_url || "",
            created_by: courseData.created_by || user?.userId || null,
            updated_by: user?.userId || null,
          });

          if (user && courseData?.id && user.courseId !== courseData.id) {
            dispatch(setUserInfo({
              ...user,
              courseId: courseData.id,
            }));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching course:", err);
          setError("Failed to load course details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [id, user?.userId]);

  // Event handlers
  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    if (name in formData) {
      setFormData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    }

    if (name in lessonData) {
      setLessonData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    }
  };

  const handleResourceUpload = (e) => {
    const files = Array.from(e.target.files);

    const resourcesWithType = files.map((file) => {
      let type = "";
      if (file.type.startsWith("video/")) {
        type = "video";
      } else if (file.type === "application/pdf") {
        type = "pdf";
      } else if (file.type.startsWith("image/")) {
        type = "image";
      } else {
        type = "other";
      }
      return { file, type };
    });

    setLessonData((prev) => ({
      ...prev,
      resource_type: resourcesWithType,
    }));
  };

  const handleAddResource = () => {
    setLessonData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "New Resource", url: "" }],
    }));
  };

  const handleRemoveResource = (index) => {
    setLessonData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  // API interaction handlers
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

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
      const response = await ApiClientLms.patch(
        `/courses/${courseId}`,
        courseData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setCourse(response.data);
        setResourceButtonEnabled(true);
        setSaveButtonEnabled(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update course.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handlePublishCourse = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const updatedFormData = {
        ...formData,
        publish_to_school: true,
      };

      const response = await ApiClientLms.patch(
        `/courses/${courseId}`,
        updatedFormData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Course published successfully!");
        setFormData(updatedFormData);
        router.push("/dashboard/Course_card");
      }
    } catch (error) {
      console.error("Publishing error:", error);
      setError("Failed to publish course.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const updatedFormData = {
        ...formData,
        publish_to_school: false,
      };

      const response = await ApiClientLms.patch(
        `/courses/${courseId}`,
        updatedFormData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Course saved as draft!");
        setFormData(updatedFormData);
        router.push("/dashboard/Course_card");
      }
    } catch (error) {
      console.error("Save draft error:", error);
      setError("Failed to save draft.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const saveResource = async (lessonId) => {
    if (!lessonId) {
      setError("Cannot upload resources: Lesson ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resources = lessonData.resource_type || [];
      if (resources.length === 0) {
        setError("No resources selected to upload.");
        return;
      }

      const resourcesToUpload = [...resources];
      setLessonData((prev) => ({
        ...prev,
        resource_type: null,
        resources: [],
      }));

      await Promise.all(
        resourcesToUpload.map(async ({ file, type }) => {
          const formData = new FormData();
          formData.append("lesson", lessonId);
          formData.append("about", lessonData.description || "");
          formData.append("file", file);
          formData.append("resource_type", type);

          const response = await ApiClientLms.post("/resource", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          if (response.status !== 201) {
            throw new Error(`Failed to upload ${file.name}`);
          }
        })
      );

      alert("All resources uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload resource(s). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await ApiClientLms.delete(`/courses/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert("Course deleted successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete course.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleCreateLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      const lessonPayload = {
        title: lessonData.title,
        description: lessonData.description,
        chapter: activeChapter,
        created_by: user?.userId,
        updated_by: user?.userId,
      };

      const response = await ApiClientLms.post("/lessons", lessonPayload, {
        withCredentials: true,
      });

      if (response.status === 201) {
        const newLesson = response.data;
        setLessonId(newLesson.id);

        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.id === activeChapter
              ? {
                  ...chapter,
                  lessons: [...(chapter.lessons || []), newLesson],
                }
              : chapter
          )
        );

        if (lessonData.resource_type && lessonData.resource_type.length > 0) {
          await saveResource(newLesson.id);
        }

        setLessonModal(false);
        setLessonData({
          title: "",
          description: "",
          video_url: null,
          resource_type: null,
          chapterId: "",
          resources: [],
          created_by: user?.userId || null,
          updated_by: user?.userId || null,
        });
      }
    } catch (error) {
      console.error("Create lesson error:", error);
      setError(error.response?.data?.message || "Failed to create lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      const lessonPayload = {
        title: lessonData.title,
        description: lessonData.description,
        chapter: activeChapter,
        updated_by: user?.userId,
      };

      const response = await ApiClientLms.patch(
        `/lessons/${lessonId}`,
        lessonPayload,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const updatedLesson = response.data;

        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.id === activeChapter
              ? {
                  ...chapter,
                  lessons: chapter.lessons.map((lesson) =>
                    lesson.id === lessonId ? updatedLesson : lesson
                  ),
                }
              : chapter
          )
        );

        if (lessonData.resource_type && lessonData.resource_type.length > 0) {
          await saveResource(lessonId);
        }

        setLessonModal(false);
        setLessonData({
          title: "",
          description: "",
          video_url: null,
          resource_type: null,
          chapterId: "",
          resources: [],
          created_by: user?.userId || null,
          updated_by: user?.userId || null,
        });
      }
    } catch (error) {
      console.error("Update lesson error:", error);
      setError(error.response?.data?.message || "Failed to update lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    if (activeLesson) {
      await handleEditLesson();
    } else {
      await handleCreateLesson();
    }
    setIsSubmitting(false);
  };

  const handleOpenLessonModal = (chapterId, lessonId = null) => {
    setActiveChapter(chapterId);
    setActiveLesson(lessonId);
    setLessonId(lessonId);

    if (lessonId) {
      const chapter = chapters.find((ch) => ch.id === chapterId);
      const lesson = chapter?.lessons?.find((ls) => ls.id === lessonId);
      if (lesson) {
        setLessonData({
          ...lessonData,
          title: lesson.title || "",
          description: lesson.description || "",
          video_url: lesson.video_url || null,
          resource_type: null,
          resources: lesson.resources || [],
        });
      }
    } else {
      setLessonData({
        title: "",
        description: "",
        video_url: null,
        resource_type: null,
        chapterId: chapterId,
        resources: [],
        created_by: user?.userId || null,
        updated_by: user?.userId || null,
      });
    }

    setLessonModal(true);
  };



  const [newCoach, setNewCoach] = useState({
    courseName: "",
    coachName: "",
    coachEmail: "",
    module_id: "",
  });

  const handleAddCoachChange = (e) => {
    const { name, value } = e.target;
    setNewCoach({
      ...newCoach,
      [name]: value,
    });
  };
  const addCoach = async () => {
    const newUser = {
      name: newCoach.coachName,
      email: newCoach.coachEmail,
      invitation_for: "entity_user",
      entity_id: entityId,
      module_id: newCoach.module_id,
      module_role: "coach",
      status: "Active",
      mobile: "+91 9000000000", // Default placeholder  
      courses: [],
      module_id: newCoach.module_id,
    };
    console.log(newUser)

    try {
      // Send data to the API
      const response = await ApiClientUserAccount.post(
        "/auth/invitation",
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        alert("mail send successfully");

        console.log("data", newUser);

        setUsers([...users, newUser]);
        closeAddModal();

        alert("Email sent successfully");
        if (onSuccess) {
          onSuccess(newUser);
        }
        // Reset form and close modal
        setNewCoach({
          courseName: "",
          coachName: "",
          coachEmail: "",
          module_id: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Failed to send coach invitation:", error);
      // Optionally show an error message to the user here
    }
  };




  const [newStudent, setnewStudent] = useState({
    courseName: "",
    studentName: "",
    studentEmail: "",
    module_id:""

  });

  const addStudent = async() => {
    const newUser = {
      name: newStudent.studentName,
      email: newStudent.studentEmail,
      invitation_for:"entity_user",
      status: "Active",
      entity_id:entityId,
      module_id:newStudent.module_id,
      module_role: "student",
      mobile: "+91 9000000000", // Default placeholder
      courses: [],
      module_id: newStudent.module_id

    };

    console.log("student",newUser);
    

    try {
      const response = await ApiClientUserAccount.post(
        "/auth/invitation",
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
          withCredentials: true, // not inside headers
        }
      );
      
      if(response.status === 201){
        alert("mail send successfully");
        console.log("data",newUser);
        setUsers([...users, newUser]);
        closeAddModal();
      }      
      
    } catch (error) {
      console.error("Failed to send admin invitation:", error);
      // Optionally show an error message to the user here
    }
    
    
  };
  const handleaddStudentChange = (e) => {
    const { name, value } = e.target;
    setnewStudent({
      ...newStudent,
      [name]: value
    });
  };

  if (loading && !course) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
 
 
  return (
    <div className="w-full mx-auto p-2 sm:p-4">
     <h2 className="font-roboto font-bold text-[26px] leading-[100%] tracking-[0] text-[#402BA3] mt-2 mb-5 flex items-center gap-2">
  <Image src={left} alt="Left Arrow" className="w-4 h-4" />
  Course Update
</h2>
 
      <div className="flex justify-end sm:mt-4 gap-[15px]">
        
            {isenityUser && (
              <button
              className="bg-[#402BA3] text-white w-[189px] h-[40px] rounded-lg text-sm hover:bg-indigo-800 mb-5"
              onClick={() => setIsAddModalOpen(true)}>
              <div className="flex items-center justify-center gap-2">
              <Image src={add} alt="Add Icon" className="w-4 h-4" />
              Invite Coach
            </div>
            </button>
            )}
          
        
        {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="mb-6">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Course</span>
                <span className="mx-2">›</span>
                <span className="font-medium">Add Coach</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Select Course</label>
              <div className="relative">
                <select
                  name="module_id"
                  value={newCoach.module_id}
                  onChange={handleAddCoachChange}
                  className="appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a Course</option>
                  {Array.isArray(course) &&
                    course.map((course) => (
                      <option key={course.module_id} value={course.module_id}>
                        {course.name}
                      </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Coach Name</label>
                <input
                  type="text"
                  name="coachName"
                  placeholder="Coach Name"
                  value={newCoach.coachName}
                  onChange={handleAddCoachChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Coach Email</label>
                <input
                  type="email"
                  name="coachEmail"
                  placeholder="Email Id"
                  value={newCoach.coachEmail}
                  onChange={handleAddCoachChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)} // assuming this closes the modal
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addCoach}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
        <button
          className="bg-[#402BA3] text-white w-[189px] h-[40px] rounded-lg text-sm hover:bg-indigo-800"
          onClick={()=>setIsAddStdModalOpen(true)}>
          <div className="flex items-center justify-center gap-2">
            <Image src={add} alt="Add Icon" className="w-4 h-4" />
            Invite Student
          </div>
        </button>
        {isAddStdModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="mb-6">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Course</span>
                <span className="mx-2">›</span>
                <span className="font-medium">Add Students</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Select Course</label>
              <div className="relative">
              <select
              name="module_id"
              value={newStudent.module_id}
              onChange={handleaddStudentChange}
              className="appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a Course</option>
              {Array.isArray(forStudents) && forStudents.map((course) => (
              <option key={course.module_id} value={course.module_id}>
                {course.name}
              </option>
            ))}
            </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  placeholder="Student Name"
                  value={newStudent.studentName}
                  onChange={handleaddStudentChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Student Email</label>
                <input
                  type="email"
                  name="studentEmail"
                  placeholder="Email Id"
                  value={newStudent.studentEmail}
                  onChange={handleaddStudentChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
            <button
                type="button"
                onClick={() => setIsAddStdModalOpen(false)} // assuming this closes the modal
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addStudent}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
 
 
 
      <div className="rounded-lg overflow-hidden">
        {/* Course Information Section */}
        <div className="p-3 sm:p-6 bg-white border border-gray-300 mb-8 rounded-lg">
          <h2 className="font-roboto font-medium text-[26px] leading-[100%] tracking-[0] text-[#402BA3] mb-2 sm:mb-4">
            Course Information
          </h2>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <div>
              {/* Title Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"  // Set name for this field
                    className="w-full p-1 sm:p-2 border rounded-md pr-8"
                    value={formData.name || ""}  // Use formData state
                    onChange={handleCourseChange}  // Handle changes
                  />
                  <button className="absolute right-2 top-1 sm:top-2 text-gray-400">
                    <span>×</span>
                  </button>
                </div>
              </div>
 
              {/* Thumbnail URL Input */}
              <div className="mt-2 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <div className="relative flex">
                  <span className="w-full">
                    <input
                      type="text"
                      name="thumbnail_url"  // Add name for Thumbnail URL (even if it's read-only)
                      className="w-11/12 p-1 sm:p-2 border rounded-md"
                      placeholder="Enter image URL"
                      value={formData.thumbnail_url || ""}  // Set value from state
                      readOnly
                    />
                  </span>
                  <Image
                    src={upload}
                    className="w-[52px] h-[50px] pt-[8px] pr-[12px] pb-[8px] pl-[12px] border-[1.07px] border-[#0000008] rounded-[12px]"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Add a URL or upload an image
                </p>
              </div>
            </div>
 
            {/* Description Textarea */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                className="w-full h-[183px] pt-[8px] pr-[12px] pb-[8px] pl-[12px] border-[1.07px] border-[#0000008] rounded-[8px] resize-none"
                rows="lg:rows-5 sm:rows-3"
                value={formData.description || ""}
                onChange={handleCourseChange}
              />            </div>
          </div>
        </div>
        {/* <div className="flex sm:mt-4">
          <button className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-indigo-700">
            + Invite Coach
          </button>
        </div> */}
        {/* Course Curriculum Section */}
        <div className="p-6 bg-white mt-8 rounded-lg border">
          <Chapters
            chapters={chapters}
            courseId={courseId}
            onChapterUpdate={(updatedChapters) => setChapters(updatedChapters)} // Callback to sync chapters
            onLessonEdit={handleEditLesson}
          />
        </div>
 
        <div className="flex justify-end mt-4 space-x-3 px-4">
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium" onClick={handleSubmitDraft}>
            Save draft
          </button>
          <button className="px-6 py-3 bg-[#402BA3] text-white rounded-md hover:bg-[#3a269b] text-sm font-medium" onClick={handlePublishCourse}>
            Publish Course
          </button>
        </div>
      </div>
 
      {/* Lesson Modal */}
      {lessonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 w-full max-w-xs sm:max-w-md mx-2">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Lesson 2</h2>
            <form onSubmit={handleCreateLesson} className="space-y-2 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={lessonData.title}
                  onChange={handleChange}
                  placeholder="Introduction to QML"
                  className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={lessonData.description}
                  onChange={handleChange}
                  placeholder="Quantum Machine Learning is an advanced field that merges quantum computing with machine learning algorithms"
                  className="w-full p-1 sm:p-2 border rounded-md resize-none text-xs sm:text-sm"
                  rows="2 sm:rows-3"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={lessonData.video_url}
                  onChange={handleChange}
                  placeholder="e.g. https://example.com/video.mp4"
                  className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Resources
                  </label>
                </div>
                {lessonData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center mb-1 sm:mb-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={resource.title}
                        className="w-full p-1 sm:p-2 border rounded-md pr-8 text-xs sm:text-sm"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="absolute right-2 top-1 sm:top-2 text-gray-400"
                      >
                        <span>×</span>
                      </button>
                    </div>
                    <button type="button" className="ml-1 sm:ml-2 text-blue-500">
                      <span>⟳</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                >
                  Add a URL or upload an Video
                </button>
              </div>
              <div className="flex justify-end space-x-2 sm:space-x-3 pt-2 sm:pt-4">
                {/* <button
                  type="button"
                  onClick={() => setLessonModal(false)}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button> */}
                <button
                  type="submit"
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 
 