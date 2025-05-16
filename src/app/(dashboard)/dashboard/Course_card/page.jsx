"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { ApiClientLms } from "@/src/service/ApiUserAccount";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import calendarr from "../../../../assets/icons/dashboard_icons/calendarr.svg"
import Delete from "../../../../assets/icons/dashboard_icons/Delete.svg";
import { useSearch } from "@/context/SearchContext";
import addfilled from "../../../../assets/icons/dashboard_icons/addfilled.svg";
// import { useSearch } from "@/context/SearchContext";

export default function page() {
  const authState = useSelector((state) => state.auth.user) || {};
  console.log(authState.selectedEntityRole);
  const user = useSelector((state) => state.auth?.user) || {};
  // Use authState in useState initial value instead of trying to set it later
  const [entityUser, setEntityUser] = useState(false);
  const [isUser, setUser] = useState(authState.selectedEntityRole === "entity_user");
  const entity_Id = user.selectedEntity;
  const selectedEntityRole = user?.selectedEntityRole;
  const isAdminOrOwner = ["entity_owner", "entity_admin"].includes(selectedEntityRole);
  console.log('ssssssssssssssssssssssssssssssss', selectedEntityRole);
  const [showFull, setShowFull] = useState(false);
  const { searchTerm, setActiveView } = useSearch();
  // Check if user is entity owner or admin - used for conditional rendering
  const isEntityOwner = selectedEntityRole === "entity_owner";
  const isEntityAdmin = selectedEntityRole === "entity_admin";
  const canManageCourses = isEntityOwner || isEntityAdmin;

  useEffect(() => {
    if (selectedEntityRole === 'entity_user') {
      setEntityUser(true);
    }
  }, [selectedEntityRole]); // Only re-run when selectedEntityRole changes

  console.log('type of user', entityUser);
  const {
    selectedEntity,
    paid_entities = [],
    unpaid_entities = [],
    userId,
  } = authState;

  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  console.log("search params", searchParams);
  console.log("search", search);




  const [courseModel, setCourseModel] = useState(false);
  const [editModel, setEditModel] = useState(false);
  const [deleteModel, setDeleteModel] = useState(false);
  const [currentEditingCourse, setCurrentEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [entityCoursesMap, setEntityCoursesMap] = useState({});
  const [entitySchoolsMap, setEntitySchoolsMap] = useState({});
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dataFetched, setDataFetched] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  // const user = useSelector((state) => state.auth?.user) || {};

  const [formData, setFormData] = useState({
    publish_to_school: false,
    publish_to_marketplace: null,
    name: "",
    description: "",
    created_by: userId || null,
    updated_by: userId || null,
  });
  console.log("jhdjhghtff");

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    created_by: userId || null,
    updated_by: userId || null,
  });

  // Only restore tab selection from sessionStorage
  useEffect(() => {
    try {
      const savedActiveTab = sessionStorage.getItem("dashboard_activeTab");
      if (savedActiveTab) setActiveTab(savedActiveTab);
    } catch (err) {
      console.error("Error loading persisted tab selection:", err);
    }
  }, []);

  // Only persist tab selection to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("dashboard_activeTab", activeTab);
    } catch (err) {
      console.error("Error saving tab selection:", err);
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchCourses = useCallback(
    async (tab = "all") => {
      console.log("Fetching data for:", tab);

      setLoading(true);
      setError(null);
      try {
        if (!user?.selectedEntity) {
          console.log("No selected entity available");
          setLoading(false);
          return;
        }
        console.log("selected ent", selectedEntity);
        console.log("user selected", user.selectedEntity);

        const entityId = selectedEntity || user?.selectedEntity || null;

        // Different API endpoints based on user role
        let response;
        if (authState.selectedEntityRole === "entity_user") {
          // Entity user fetches schools by entity ID
          response = await ApiClientLms.get(`schools/get-by-entity-id/${entityId}`, {
            withCredentials: true,
          });
          // if (selectedEntityRole === "entity_user") {
          setSchool(response?.data.data.course_details || []);
          console.log('courseeeeeeeeeeeeeeee', response?.data.data.course_details)
          // } 
        } else if (["entity_owner", "entity_admin"].includes(authState.selectedEntityRole)) {
          // Both entity owner and admin fetch published or unpublished courses
          const endpoint =
            tab === "all"
              ? `/courses/get-all-published-courses/${entityId}`
              : `/courses/get-all-un-published-courses/${entityId}`;

          response = await ApiClientLms.get(endpoint, {
            withCredentials: true,
          });
          console.log('courseeeeeeeeeeee', response)
        } else {
          // Default fallback in case role is not recognized
          console.log("Unknown role, using default endpoint");
          response = await ApiClientLms.get(`/courses/get-all-published-courses/${entityId}`, {
            withCredentials: true,
          });
        }


        console.log("API response", response);
        let schoolData = []
        if (response.status === 200) {
          if (selectedEntityRole === "entity_user") {
            schoolData = response.data.data.course_details;
          }
          else {
            schoolData = response.data.data;
          }


          // Extract courses data
          let courses = [];
          if (schoolData && schoolData.courses) {
            courses = schoolData.courses;
          } else if (Array.isArray(schoolData)) {
            courses = schoolData;
          }

          const entity_id = entityId; // Use the entityId we already have

          setEntitySchoolsMap((prev) => ({
            ...prev,
            [entity_id]: schoolData,
          }));

          setEntityCoursesMap((prev) => ({
            ...prev,
            [entity_id]: courses ?? [],
          }));

          setSchool(courses); // Assuming school is meant to hold courses data
          setFormData((prev) => ({
            ...prev,
            school: schoolData?.id,
          }));

          setDataFetched(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [user?.selectedEntity, authState.selectedEntityRole, selectedEntity]
  );

  useEffect(() => {
    if (pathname === "/dashboard/Course_card") {
      fetchCourses(activeTab);
    }
  }, [pathname, activeTab, fetchCourses]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      setDataFetched(false);
    };
  }, []);

  const entityId = selectedEntity || user?.selectedEntity || null;

  const currentCourses = useMemo(() => {
    return entityId && entityCoursesMap[entityId]
      ? entityCoursesMap[entityId]
      : [];
  }, [entityCoursesMap, entityId]);

  const currentSchool = useMemo(() => {
    return entityId && entitySchoolsMap[entityId]
      ? entitySchoolsMap[entityId]
      : null;
  }, [entitySchoolsMap, entityId]);

  const filteredCourses = useMemo(() => {
    // For demonstration, create mock courses if none exist
    const schoolCourses = school || [];
    console.log("filtered courses");

    return schoolCourses.filter((item) => {
      if (activeTab === "purchased") return item.isPurchased;
      if (activeTab === "enrolled") return item.isEnrolled;
      if (activeTab === "draft") return item.publish_to_school === false;
      return true;
    });
  }, [school, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    const courseData = {
      ...formData,
      school_id: school?.id,
      created_by: userId,
      updated_by: userId,
    };

    try {
      const response = await ApiClientLms.post("/courses", courseData, {
        withCredentials: true,
      });

      if (response.status === 201) {
        setSuccess(true);
        setSuccessMessage("Course created successfully!");
        await fetchCourses(); // Fetch fresh data after creating a course
        setCourseModel(false);
        setFormData({
          publish_to_school: false,
          publish_to_marketplace: null,
          name: "",
          description: "",
          created_by: userId,
          updated_by: userId,
        });
        console.log('newwwwwwwwwwwwwwwwww', response)
        router.push(`/dashboard/Course_card/${response.data.course.module_id}`)
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create course. Please try again."

      );
      console.log(error)
    } finally {

      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    const courseUpdateData = {
      ...editData,
      updated_by: userId,
    };

    try {
      const response = await ApiClientLms.patch(
        `/courses/${currentEditingCourse.id}`,
        courseUpdateData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSuccess(true);
        setSuccessMessage("Course updated successfully!");
        await fetchCourses(); // Fetch fresh data after updating the course
        setEditModel(false);
        setCurrentEditingCourse(null);
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
        const decodedToken = jwtDecode(accessToken);
        console.log("jjjjjjjjjj ", decodedToken);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    try {
      const response = await ApiClientLms.delete(
        `/courses/${courseToDelete.id}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setFormData((prevCourses) =>
          prevCourses.filter((course) => course.id !== courseToDelete.id)
        );
        setSuccess(true);
        setSuccessMessage("Course deleted successfully!");
        await fetchCourses(); // Fetch fresh data after deletion
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete course. Please try again."
      );
    } finally {
      setLoading(false);
      setDeleteModel(false);
      setCourseToDelete(null);
    }
  };

  const handleOpenEditModal = (course) => {
    setCurrentEditingCourse(course);
    setEditData({
      name: course.name || "",
      description: course.description || "",
      created_by: course.created_by || userId,
      updated_by: userId,
    });
    setEditModel(true);
  };

  const handleOpenDeleteModal = (course) => {
    setCourseToDelete(course);
    setDeleteModel(true);
  };

  const handleDraftSave = () => {
    // Implementation for draft saving
    setCourseModel(false); // Close modal when Cancel is clicked
  };

  // Manual refresh function
  const handleRefreshData = () => {
    fetchCourses();
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Generate mock course ID for display purposes
  const getCourseId = (index) => {
    return index < 10 ? `0${index}` : `${index}`;
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }


  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <div className="w-full min-h-screen">
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-center">{error ? error : "Loading..."}</p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
            <button
              onClick={handleRefreshData}
              className="ml-2 underline text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
          </div>
        )}

        {/* Top nav section */}
        {!entityUser && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Tab Selector */}

            <div className="flex space-x-1 border border-[#0000006B] rounded-full bg-[#F7F7F7] p-1 w-[230px]">
              <button
                className={`px-5 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${activeTab === "all"
                  ? "bg-[#402BA3] text-white shadow-sm"
                  : "text-[#402BA3] bg-transparent hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("all")}
              >
                Course
              </button>
              <div className="flex-1" />
              <button
                className={`px-5 py-1  text-sm font-semibold rounded-full transition-all duration-200 ${activeTab === "draft"
                  ? "bg-[#402BA3] text-white shadow-sm"
                  : "text-[#402BA3] bg-transparent hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("draft")}
              >
                Draft
              </button>
            </div>


            {/* Add Course Button - Visible for entity_owner and entity_admin */}
            {isAdminOrOwner && (
              <button
                onClick={() => setCourseModel(true)}
                className="bg-[#402BA3] ml-2 text-white w-[138px] h-[40px] rounded-[8px] py-1.5 px-4 text-sm font-medium flex items-center shadow-sm transition-colors duration-200"
                disabled={loading}
              >
                <Image src={addfilled} className="mr-2" alt="Add" />
                Add course
              </button>

            )}

          </div>
        )}

        {/* Courses Grid */}
        <div className="w-[1150px] h-[726px] px-4 sm:px-4 lg:px-8 pb-8  ">
          {loading && filteredCourses.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow animate-pulse h-24"
                >
                  <div className="h-24 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
              {filteredCourses.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white  p-2 rounded-lg w-[215px] h-[300px] shadow overflow-hidden border border-red-600"
                >
                  {/* Course card top area with background - UPDATED WITH CONDITIONAL ROUTING */}
                  <Link
                    href={
                      item.publish_to_school === false
                        ? `/dashboard/watch/${item.module_id}`
                        : `/dashboard/Course_card/${item.module_id}`
                    }
                  >
                    <div className="relative h-[110px] bg-gradient-to-r from-orange-50 to-orange-100 flex items-center justify-center ">
                      <div className="text-center rounded-md text-orange-800 font-medium p-2">
                        <div>{item.name}</div>
                      </div>
                      {/* Badge with course number in top right */}
                      {/* <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white text-orange-800 flex items-center justify-center text-xs font-medium">
                          {getCourseId(idx + 1)}
                        </div> */}
                      {/* </div> */}
                    </div>
                  </Link>

                  {/* Course information */}
                  <div className="p-3 text-xs">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-gray-500 mt-1 leading-[1.6]">

                      {/* {item.description.length > 100 && (
                        <button
                          onClick={() => setShowFull(!showFull)}
                          className="text-blue-500 mt-1"
                        >
                          {showFull ? 'Show less' : 'Read more'}
                        </button>
                      )} */}
                    </div>

                    <div className="flex items-center text-gray-500 mt-1 gap-2">
                      <Image
                        src={calendarr}
                        className="h-[20px] w-[20px]"
                        alt="Calendar"
                      />
                      <span>{formatDate(item.created_at)}</span>
                    </div>

                    {/* Action buttons - Visible for entity_owner and entity_admin */}
                    {isAdminOrOwner && (
                      <div className="flex items-center justify-between mt-4 gap-2">
                        <Link href={`/dashboard/Course_card/${item.module_id}`}>
                          <button className=" w-[74px] h-[30px] px-4 py-2 text-sm bg-white border border-[#402BA3] rounded-[4px] text-[#402BA3] font-medium">
                            Edit
                          </button>
                        </Link>

                        <Link href={`/dashboard/watch/${item.module_id}`}>
                          <button className=" w-[74px] h-[30px] px-4 py-2 text-sm bg-[#402BA3] text-white rounded-[4px] font-medium">
                            Watch
                          </button>
                        </Link>

                        <button
                          className="p-2 text-red-500 hover:text-red-700 focus:outline-none rounded-[4px]"
                          onClick={() => handleOpenDeleteModal(item)}
                        >
                          <Image src={Delete} className="w-[24px] h-[24px]" />
                        </button>
                      </div>
                    )}

                    {/* Action buttons for entity_user */}
                    {/* {entityUser && (
                      // <div className="flex items-center justify-end mt-4 gap-1">
                      //   <Link href={`/dashboard/watch/${item.module_id}`} className="block ">
                      //     <button className="px-4 py-1 text-xs bg-indigo-600 rounded text-white hover:bg-indigo-700">
                      //       Watch
                      //     </button>
                      //   </Link>
                      // </div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-4">
                  {loading
                    ? "Loading courses..."
                    : "No courses found. Create your first course!"}
                </p>
                {/* Show create course button to both entity owners and admins */}
                {!loading && isAdminOrOwner && (
                  <button
                    onClick={() => setCourseModel(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create Course
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Course Modal - Accessible by both entity_owner and entity_admin */}
        {courseModel && isAdminOrOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="flex p-5">


                <div className="ml-3 flex-1">
                  <h2 className="text-lg font-semibold text-indigo-700 mb-4">
                    Create New Course
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Name

                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter course name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter course description"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        className="border border-indigo-600 text-indigo-600 px-4 py-2 text-sm rounded-md hover:bg-indigo-50 transition"
                        onClick={handleDraftSave}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 text-sm rounded-md hover:bg-indigo-700 transition"
                        disabled={loading}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal - Accessible by both entity_owner and entity_admin */}
        {editModel && currentEditingCourse && isAdminOrOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="flex p-5">
                <button
                  onClick={() => {
                    setEditModel(false);
                    setCurrentEditingCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="ml-3 flex-1">
                  <h2 className="text-lg font-semibold text-indigo-700 mb-4">
                    Edit Course
                  </h2>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        placeholder="Enter course name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        placeholder="Enter course description"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 text-sm rounded-md hover:bg-indigo-700 transition"
                        disabled={loading}
                      >
                        Update Course
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Only accessible by entity_owner */}
        {deleteModel && courseToDelete && isEntityOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Delete Course
                </h2>
                <p className="text-gray-600 mb-5">
                  Are you sure you want to delete "{courseToDelete.name}"? This
                  action cannot be undone.
                </p>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-5">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModel(false);
                      setCourseToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCourse}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}