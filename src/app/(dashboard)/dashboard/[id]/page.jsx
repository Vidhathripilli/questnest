"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClientLms } from "@/src/service/ApiUserAccount";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "@/store/authSlice";
import Image from "next/image";
import upload from "../../../../assets/icons/social_media_icons/upload.png";
import Chapters from "@/src/components/Chapters"; // Import the Chapters component

export default function SingleCoursePage() {
  const { id } = useParams();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [school, setSchool] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const [courseModel, setCourseModel] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [courseId, setCourseId] = useState("");
   const [resourceButtonEnabled, setResourceButtonEnabled] = useState(false); // To enable resource form after lesson is created
    const [saveButtonEnabled, setSaveButtonEnabled] = useState(true); // To enable/disable the save button
  

  // Add lesson modal state
  const [lessonModal, setLessonModal] = useState(false);

  const user = useSelector((state) => state.auth.user);
  // const {courseId} = user.courseId;
  console.log("user",user);
  
  const dispatch = useDispatch();
  const router = useRouter();

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

  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    video_url: null,            // should be null, not ""
    resource_type: null,  
    chapterId: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setLessonData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleAddResource = () => {
    setLessonData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "Getting Started Video.Mp3", url: "" }],
    }));
  };


  const handleResourceChange1 = (e) => {
    const files = Array.from(e.target.files);
  
    const resourcesWithType = files.map(file => {
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

      console.log("type",type);
      
  
      return {
        file,
        type,
      };
    });
  
    setLessonData(prev => ({
      ...prev,
      resource_type: resourcesWithType,
    }));
  };
  
  


  const handleRemoveResource = (index) => {
    setLessonData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };
  console.log("id of the course", id);
  

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await ApiClientLms.post(`/courses/get-by-module-id`,
          { module_id: id },  
           {
          withCredentials: true,
        });
        console.log("response of the course", response.status);

        setCourse(response.data);
        const fetchedCourses = response.data.courses || [];
        const fetchedSchool = response.data.school || null;
        setCoursesData(fetchedCourses);
        setSchool(fetchedSchool);
        setCourseId(response.data.id);
        setChapters(response.data.chapters || []); // Sync chapters from API response

        const UserDetails = {
          ...user,
          courseId: response.data.id,
        };

        dispatch(setUserInfo(UserDetails));
      } catch (err) {
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course) {
      setFormData({
        school: course.school || "",
        module_id: course.module_id || "",
        publish_to_school: course.publish_to_school || false,
        publish_to_marketplace: course.publish_to_marketplace || null,
        name: course.name || "",
        description: course.description || "",
        created_by: course.created_by || user?.userId || null,
        updated_by: course.updated_by || user?.userId || null,
      });
    }
  }, [course, user]);


  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const courseData = {
      school: school,
      module_id: parseInt(formData.module_id, 10),
      publish_to_school: true,
      publish_to_marketplace: formData.publish_to_marketplace,
      name: formData.name,
      description: formData.description,
      created_by: formData.created_by,
      updated_by: formData.updated_by,
    };
    console.log("update course",courseData);
    

    try {
      const response = await ApiClientLms.patch(`/courses/${courseId}`, courseData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setCourseModel(false);
        setCourse(response.data);
        setResourceButtonEnabled(true);
        setSaveButtonEnabled(false); // Disable save button after lesson is created
      }
    } catch (error) {
      console.log("Update error:", error);
      setError("Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

const handlePublishCourse = async() => {
  // Set the formData to have publish_to_school as true (publish state)
  const updatedFormData = {
    ...formData,
    publish_to_school: true,
  };
  try{

    const response = await ApiClientLms.patch(`/courses/${courseId}`, updatedFormData, {
      withCredentials: true,
    });
    if(response.status == 200){
      alert("course data updated successfully");
      setFormData(updatedFormData);
      router.push("/dashboard/Course_card");
      console.log("Publishing course with data:", updatedFormData);
      

    }

  }catch(error){
    console.log("error",error);
    
  }

};

const handleSubmitDraft = async() => {
  // Set the formData to have publish_to_school as true (publish state)
  const updatedFormData = {
    ...formData,
    publish_to_school: false,
  };
  try{

    const response = await ApiClientLms.patch(`/courses/${courseId}`, updatedFormData, {
      withCredentials: true,
    });
    if(response.status == 200){
      alert("course data updated successfully");
      setFormData(updatedFormData);
      router.push("/dashboard/Course_card");
    }

  }catch(error){
    console.log("error",error);
    
  }
  console.log("Publishing course with data:", updatedFormData);

};


  const saveResource = async () => {
    alert("saveResource called");
    setLoading(true);
    setError(null);
  
    try {
      if (!lessonId) throw new Error("Lesson ID is missing.");
  
      // Upload video separately if available
      // if (lessonData.video_url) {
      //   const formData = new FormData();
      //   formData.append("lesson", lessonId);
      //   formData.append("about", lessonData.description || "");
      //   formData.append("created_by", lessonData.created_by);
      //   formData.append("updated_by", lessonData.updated_by);
  
      //   formData.append("file", lessonData.video_url); // 👈 changed to "file"
      //   formData.append("resource_type", "video"); // 👈 hardcoded to "video"
  
      //   const response = await ApiClientLms.post("/resource", formData, {
      //     headers: { "Content-Type": "multipart/form-data" },
      //     withCredentials: true,
      //   });
  
      //   if (response.status !== 201) {
      //     throw new Error("Video upload failed");
      //   }
      // }
  
      // Upload resource files
      if (lessonData.resource_type && lessonData.resource_type.length > 0) {
        for (const { file, type } of lessonData.resource_type) {

          const formData = new FormData();
        
          formData.append("lesson", lessonId);
        
          formData.append("about", lessonData.description || "");
        
          formData.append("file", file); 
        
          formData.append("resource_type", type);
         
          console.log("lesson", lessonId);
        
          console.log("about", lessonData.description);
        
          console.log("file", file);
        
          console.log("resource_type", type);
         
          const response = await ApiClientLms.post("/resource", formData, {
        
            headers: { "Content-Type": "multipart/form-data" },
        
            withCredentials: true,
        
          });
         
          console.log("respose",response);
          
          if (response.status !== 201) {
        
            throw new Error(`Failed to upload ${file.name}`);
        
          }
        
        }
        
         
      }
  
      alert("All resources uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload resource(s).");
    } finally {
      setLoading(false);
    }
  };
  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleDelete = async (e) => {
    try {
      const response = await ApiClientLms.delete(`/courses/${id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert("deleted");
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setLessonModal(false);
  };

  const handleEditLesson = (chapterId, lessonId) => {
    setActiveChapter(chapterId);
    setActiveLesson(lessonId);
    setLessonModal(true);
  };

  

  return (
    <div className="w-full mx-auto p-2 sm:p-4">
      <h2 className="text-lg font-bold text-[#402BA3]">Course Update</h2>
      <div className="rounded-lg overflow-hidden">
        {/* Course Information Section */}
        <div className="p-3 sm:p-6 bg-white border border-gray-300 mb-8 rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Course Information</h2>
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
        <Image src={upload} className="h-[3.125rem] w-[3.2rem]" />
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
      name="description"  // Set name for the description field
      className="w-full p-1 sm:p-2 border rounded-md resize-none h-20 sm:h-24 md:h-32"
      rows="lg:rows-5 sm:rows-3"
      value={formData.description || ""}  // Use formData state for description
      onChange={handleCourseChange}  // Handle changes
    ></textarea>
  </div>
</div>

        </div>
        <div className="flex sm:mt-4">
          <button className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-indigo-700">
            + Invite Coach
          </button>
        </div>
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
                <button
                  type="button"
                  onClick={() => setLessonModal(false)}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
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






// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { ApiClientLms } from "@/src/service/ApiUserAccount";
// import { useDispatch, useSelector } from "react-redux";
// import { Router } from "next/router";
// import Chapters from "@/src/components/Chapters";
// import Que_n_Ans from "@/components/Que_n_Ans";
// import { setUserInfo } from "@/store/authSlice";

// export default function SingleCoursePage() {
//   const { id } = useParams();
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [school, setSchool] = useState(null);
//   const [chapterModel , setChapterModel] = useState(false)
//   const [chapters, setChapters] = useState([]);

//   const [courseModel, setCourseModel] = useState(false);
//   const [coursesData, setCoursesData] = useState([]);
//   const [courseId, setCourseId] = useState('')

//   const user = useSelector((state) => state.auth.user);
//   const dispatch = useDispatch();
//   const route =useRouter()
//   const [formData, setFormData] = useState({
//     school: "",
//     module_id: "",
//     publish_to_school: false,
//     publish_to_marketplace: null,
//     name: "",
//     description: "",
//     created_by: user?.userId
//     || null,
//     updated_by: user?.userId
//     || null,
//   });
//   const [chapterData, setChapterData] = useState({
    
//     chapter_title: "",
//     id:id,
//     course:courseId,
//     description: "",
//     created_by: user?.userId
//     || null,
//     updated_by: user?.userId
//     || null,
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const updatedValue = type === "checkbox" ? checked : value;
  
//     // Optional: also update formData if needed
//     setFormData((prev) => ({
//       ...prev,
//       [name]: updatedValue,
//     }));
  
//     // Update chapterData for creating the new chapter
//     setChapterData((prev) => ({
//       ...prev,
//       [name]: updatedValue,
//     }));
//   };
  


//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         const response = await ApiClientLms.get(`/courses/${id}`, {
//           withCredentials: true,
//         });
//         // console.log(response)
//         if(response.status === 200){
//           console.log(response)
//         }
//         setCourse(response.data);
//         const fetchedCourses = response.data.courses || [];
//         const fetchedSchool = response.data.school || null;
//         console.log(fetchedSchool)
//         setCoursesData(fetchedCourses);
//         setSchool(fetchedSchool);
//         setCourseId(response.data.id)
//         const UserDetails = {
//           ...user,
//           courseId: response.data.id,}
//           dispatch(setUserInfo(UserDetails));
//       } catch (err) {
//         setError("Failed to load course details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchCourse();
//   }, [id]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;

//   const handleUpdate = async (e) => {
//     e.preventDefault(); // Prevent form reload
//     setLoading(true);
//     setError(null);
  
//     const courseData = {
//       school: school,
//       module_id: parseInt(formData.module_id, 10),
//       publish_to_school: formData.publish_to_school,
//       publish_to_marketplace: formData.publish_to_marketplace,
//       name: formData.name,
//       description: formData.description,
//       created_by: formData.created_by,
//       updated_by: formData.updated_by,
//     };
  
//     try {
//       const response = await ApiClientLms.patch(`/courses/${id}`, courseData, {
//         withCredentials: true,
//       });
  
//       console.log("Update response:", response);
  
//       if (response.status === 200) {
//         setCourseModel(false); // Close modal
//         setCourse(response.data); // Optionally update course state
//       }
//     } catch (error) {
//       console.log("Update error:", error);
//       setError("Failed to update course.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // console.log(course)

//   const handleDelete =async (e)=>{
//     try{

//       const response = await ApiClientLms.delete(`/courses/${id}`,{
//         withCredentials: true,
//       })
//       if(response.status === 200){
//         alert('deleted')
//         route.push('/dashboard')
//       }
//     }catch(error){
//       console.log(error)
//     }

//   }
//   const handleCreate = async (e) => {
//     e.preventDefault();
//     console.log(chapterData)
//     try {
//       const response = await ApiClientLms.post(
//         "/chapters",
//         {
//           ...chapterData,
//           course: courseId,
//         },
//         {
//           withCredentials: true,
//         }
//       );
//       console.log(chapterData)
  
//       if (response.status === 200 || response.status === 201) {
//         console.log("Chapter is created:", response.data);
//         // const courseRes = await ApiClientLms.get(`/courses/${id}`, {
//         //   withCredentials: true,

//         console.log("response of the chapters",response.data);
        
//         // });
        
//         setCourse((prevCourse) => ({
//           ...prevCourse,
//           chapters: [response.data, ...(prevCourse.chapters || [])],
//         }));
//         // console.log("courses",course);
        
//         // ✅ Add the new chapter to the beginning of the list
//         // setChapters(prev => [response.data, ...prev]);
  
//         // Reset and close modal
//         setChapterModel(false);
//         setChapterData({
//           chapter_title: "",
//           description: "",
//           created_by: user?.id || null,
//           updated_by: user?.id || null,
//         });
//       }
  
//     } catch (error) {
//       console.log("Chapter creation error:", error.response?.data || error.message);
//       setError("Failed to create chapter");
//     }
//   };
  
  
  

//   return (
//     <>
//     <div className="grid grid-cols-5">
//     <div className="p-6 col-span-3 h-64 border border-black mt-5 rounded-2xl">
//       <div className="flex">
//       <h1 className="text-2xl font-bold mb-4">{course.name}</h1>
//       <button onClick={() => setChapterModel(true)} className="p-2 bg-blue-500 ml-auto rounded-xl text-white cursor-pointer" >Create Chapter</button>
//       </div>
//       <p className="text-gray-700 mb-2">{course.description}</p>

      

//       <img
//         src={
//           course.coverImage ||
//           "https://via.placeholder.com/800x300"
//         }
//         alt={course.name}
//         className="w-full h-8 object-cover rounded-lg mb-4"
//       />
//       <div className="mt-4">
//         <strong>Mentor:</strong> {course.mentorName}
//       </div>
//       <div className="flex">
//       <div className="mt-2 text-lg font-semibold text-green-700">
//         ${course.price || "0"}
//       </div>
//       <div className="ml-auto space-x-2">
//       <button className=" p-2 bg-blue-500 text-white rounded-xl" onClick={()=>{setCourseModel(true)}}>Update</button>
//       {courseModel && (
//           <div className="fixed inset-0 bg-gray-300 bg-opacity-40 flex justify-center items-center z-50">
//             <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
//               <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
//               <form onSubmit={handleUpdate} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     School
//                   </label>
//                   <input
//                     type="text"
//                     name="school"
//                     value={
//                       school?.name
//                         ? `${school.name} (${formData.school})`
//                         : "Loading..."
//                     }
//                     disabled
//                     className="w-full px-4 py-2 border rounded-lg"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Module ID
//                   </label>
//                   <input
//                     type="number"
//                     name="module_id"
//                     value={formData.module_id}
//                     onChange={handleChange}
//                     placeholder="Enter module ID"
//                     className="w-full px-4 py-2 border rounded-lg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Publish to School
//                   </label>
//                   <input
//                     type="checkbox"
//                     name="publish_to_school"
//                     checked={formData.publish_to_school}
//                     onChange={handleChange}
//                     className="ml-2"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Publish to Marketplace
//                   </label>
//                   <select
//                     name="publish_to_marketplace"
//                     value={formData.publish_to_marketplace ?? ""}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-lg"
//                   >
//                     <option value="">Select</option>
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Course Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Enter course name"
//                     className="w-full px-4 py-2 border rounded-lg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Enter course description"
//                     className="w-full px-4 py-2 border rounded-lg"
//                   />
//                 </div>

//                 {error && (
//                   <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                     {error}
//                   </div>
//                 )}

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setCourseModel(false)}
//                     className="px-4 py-2 text-red-500 hover:underline"
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Save Course"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       <button className=" p-2 bg-blue-500 text-white rounded-xl" onClick={()=>handleDelete()}>Delete</button>
//       </div>
//       {
//         chapterModel && (
//           <div className="fixed inset-0 bg-gray-300 bg-opacity-40 flex justify-center items-center z-50">
//             <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
//               <h2 className="text-xl font-semibold mb-4">Create New Chapter</h2>
//               <form onSubmit={handleCreate} className="space-y-4">
                

                

                

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Chapter Name
//                   </label>
//                   <input
//                     type="text"
//                     name="chapter_title"
//                     value={chapterData.chapter_title}
//                     onChange={handleChange}
//                     placeholder="Enter course name"
//                     className="w-full px-4 py-2 border rounded-lg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     value={chapterData.description}
//                     onChange={handleChange}
//                     placeholder="Enter course description"
//                     className="w-full px-4 py-2 border rounded-lg"
//                   />
//                 </div>

//                 {error && (
//                   <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                     {error}
//                   </div>
//                 )}

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setCourseModel(false)}
//                     className="px-4 py-2 text-red-500 hover:underline"
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : "Save Course"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )
//       }
//       </div>
      
//     </div>
//     <div className="col-span-2">
//     <Chapters chapters={course?.chapters || []} />

//     </div>
//     <div className="col-span-3"><Que_n_Ans/></div>
//     </div>
   
//     </>
    
    
//   );
// }