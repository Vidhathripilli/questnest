"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  BookOpen,
  Users,
  User,
  DollarSign,
  Book,
  Clock,
  PlayCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  ApiClientLms,
  ApiClientUserAccount,
  UserAccountMasterData,
} from "@/service/ApiUserAccount";
import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@/context/SearchContext";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import Bookk from "../../../assets/icons/dashboard_icons/Bookk.svg";
import UsersGroup from "../../../assets/icons/dashboard_icons/UsersGroup.svg";
import Dollar from "../../../assets/icons/dashboard_icons/Dollar.svg";
import { useRouter } from "next/navigation";
import addcourse from "../../../assets/icons/dashboard_icons/addcourse.svg";
import coach from "../../../assets/icons/dashboard_icons/coach.svg";
import addstudent from "../../../assets/icons/dashboard_icons/addstudent.svg";
import CoachPage from "./settings/users/coaches/page";
import Image from "next/image";
// import coach from '../dashboard/settings/users/coaches'
// Admin/Owner dashboard data
const revenueData = [
  { date: "10 Apr", income: 400 },
  { date: "11 Apr", income: 600 },
  { date: "12 Apr", income: 500 },
  { date: "13 Apr", income: 700 },
  { date: "14 Apr", income: 800 },
  { date: "15 Apr", income: 600 },
];

const courseData = [
  { day: "MON", students: 100 },
  { day: "TUE", students: 200 },
  { day: "WED", students: 150 },
  { day: "THU", students: 300 },
  { day: "FRI", students: 2390 },
  { day: "SAT", students: 400 },
];

// User dashboard data
const videoData = [
  { day: "M", minutes: 25 },
  { day: "T", minutes: 30 },
  { day: "W", minutes: 20 },
  { day: "T", minutes: 80 },
  { day: "F", minutes: 15 },
  { day: "S", minutes: 10 },
  { day: "S", minutes: 5 },
];

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [dashboard, setDashboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const authState = useSelector((state) => state.auth.user) || {};
  const user = useSelector((state) => state.auth?.user) || {};
  const entityId = user.selectedEntity;
  const { searchTerm } = useSearch();
  const [activeTab, setActiveTab] = useState("video");
  const [courseModel, setCourseModel] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStdModalOpen, setIsAddStdModalOpen] = useState(false);
  const [entityUser, setEntityUser] = useState(false);
  const [schoolId, setSchoolId] = useState('')
  const selectedEntityRole = user?.selectedEntityRole;
  const isAdminOrOwner = ["entity_owner", "entity_admin"].includes(
    selectedEntityRole
  );
  // const user = useSelector((state) => state.auth.user);
  // // const { selectedEntity } = user;
  // const selectedEntity = user?.selectedEntity;
  const [users, setUsers] = useState([]);
  const [Std_users, setStd_Users] = useState([]);

  const [formData, setFormData] = useState({
    publish_to_school: false,
    publish_to_marketplace: null,
    name: "",
    description: "",
    created_by: user?.userId || null,
    updated_by: user?.userId || null,
  });
  const router = useRouter()

  // Check if user is entity owner - used for conditional rendering
  const isEntityOwner = authState.selectedEntityRole === "entity_owner";
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const handleCoachInvitationSuccess = (newCoach) => {
    console.log("Coach invited successfully:", newCoach);
    // You can add notification logic here
  };

  useEffect(() => {
    if (selectedEntityRole === "entity_user") {
      setEntityUser(true);
    }
  }, [selectedEntityRole]); // Only re-run when selectedEntityRole changes

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await ApiClientUserAccount.get(
          `roles/users-count-under-entity/${entityId}`,
          {
            withCredentials: true,
          }
        );
        setDashboard(response.data);
      } catch (err) {
        console.log("Failed to load dashboard:", err);
      }
    };

    if (entityId && isAdminOrOwner) {
      getDashboard();
    }
  }, [entityId, isAdminOrOwner]);

  const fetchCourses = async () => {
    try {
      const response = await ApiClientLms.get(
        `schools/get-by-entity-id/${entityId}`,
        {
          withCredentials: true,
        }
      );
      setSchoolId(response.data.data[0]?.school)
      console.log('schoooooooooooool', schoolId)
      const responseData = response.data?.data;

      if (selectedEntityRole === "entity_user") {
        setCourses(responseData?.course_details || []);
      } else {
        setCourses(responseData || []);
      }

      console.log("Fetched courses:", responseData);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  console.log('dashboard', courses)
  const forStudents = courses.filter((course) => course.publish_to_school === true)
  console.log(forStudents)


  useEffect(() => {
    if (entityId) {
      fetchCourses();
    }
  }, [entityId, selectedEntityRole]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(
      (course) =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  // Delete course functions
  const handleOpenDeleteModal = (course) => {
    setCourseToDelete(course);
    setDeleteModal(true);
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
        setCourses((prevCourses) =>
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
      setDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  const handleDraftSave = () => {
    // Implementation for draft saving
    setCourseModel(false); // Close modal when Cancel is clicked
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    const courseData = {
      ...formData,
      school_id: schoolId,
      created_by: user?.userId,
      updated_by: user?.userId,
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
          created_by: user?.userId,
          updated_by: user?.userId,
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
    module_id: ""

  });

  const addStudent = async () => {
    const newUser = {
      name: newStudent.studentName,
      email: newStudent.studentEmail,
      invitation_for: "entity_user",
      status: "Active",
      entity_id: entityId,
      module_id: newStudent.module_id,
      module_role: "student",
      mobile: "+91 9000000000", // Default placeholder
      courses: [],
      module_id: newStudent.module_id

    };

    console.log("student", newUser);


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

      if (response.status === 201) {
        alert("mail send successfully");
        console.log("data", newUser);
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
  // Delete Modal Component
  const DeleteConfirmationModal = () => {
    if (!deleteModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">Delete Course</h3>
          <p className="mb-4">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourse}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    );
  };

  // Admin/Owner Dashboard Rendering
  const renderAdminDashboard = () => {
    return (
      <div className="p-6 space-y-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total Courses",
              value: dashboard.total_modules,
              icon: Bookk,
              change: "+13%",
            },
            {
              title: "Total Coaches",
              value: dashboard.total_coaches,
              icon: UsersGroup,
              change: "+3",
            },
            {
              title: "Total Students",
              value: dashboard.total_students,
              icon: UsersGroup,
              change: "+17%",
            },
            {
              title: "Total Income",
              value: "$ 0",
              icon: Dollar,
              change: "+20%",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div className="flex flex-wrap gap-4" key={index}>
                <div className="relative bg-[#EBF1FD] p-4 rounded-[10px] shadow-[0px_1px_2px_0px_#402BA3] flex flex-col justify-between w-[273px] h-[111px]">
                  {/* Left vertical line */}
                  <div className="mt-3 absolute top-4 left-0 h-[54px] w-[3px] rounded-r-md bg-[#402BA3] shadow-[3px_0px_8px_0px_#3270EB]"></div>

                  {/* Icon Circle in top-right */}
                  <div className="absolute top-4 right-4 bg-blue-200 rounded-full p-3 flex items-center justify-center">
                    <Image src={item.icon}></Image>
                  </div>

                  {/* Title */}
                  <div className="text-[#6B6B6A] font-medium font-manrope">
                    {item.title}
                  </div>

                  {/* Number and growth section */}
                  <div className="flex justify-between items-end mt-4">
                    {/* Number value */}
                    <div className="text-3xl font-bold">{item.value}</div>

                    {/* Right-aligned change label */}
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-green-500 text-sm font-semibold">
                        {item.change}
                      </span>
                      <span className="text-green-500 text-[10px] font-medium">
                        {item.title === "Total Coaches" ? "New added" : "This Month"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* Analytics and Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue Analytics */}
          <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 ">Revenue Analytics</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4f46e5"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Access */}
          <div className="w-[300px]  bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Quick Access</h2>
            <button
              className="w-full border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center py-4 gap-2"
              onClick={() => setCourseModel(true)}
            >
              <div className="bg-[#402BA3] text-white rounded-full p-2">
                <Image src={addcourse}/>
              </div>
              <span className="text-sm font-medium text-black">Create Course</span>
            </button>

            <button
              className="w-full border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center py-4 gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <div className="bg-white text-white rounded-full p-2">
              <Image src={coach}/>
              </div>
              <span className="text-sm font-medium text-black">Add Coach</span>
            </button>



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
                        {Array.isArray(courses) &&
                          courses.map((course) => (
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
              className="w-full border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center py-4 gap-2"
              onClick={() => setIsAddStdModalOpen(true)}
            >
              <div className="bg-[#402BA3] text-white rounded-full p-2">
              <Image src={addstudent}/>
              </div>
              <span className="text-sm font-medium text-black">Add Student</span>
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
        </div>

        {/* Courses Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Courses Analysis</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Watch Videos */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Top Watch Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCourses && filteredCourses.length > 0 ? (
              filteredCourses.slice(0, 4).map((course) => (
                <div
                  key={course.id || course.module_id}
                  className="bg-teal-800 text-white rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-1">Intro to</h3>
                    <h3 className="text-sm font-medium">Quantum Computing</h3>
                    <div className="mt-16 flex justify-end">
                      <div className="bg-teal-700 p-2 rounded-full">
                        <PlayCircle size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between bg-white p-3">
                    <Link
                      href={`/dashboard/Course_card/${course.module_id}`}
                      className="block"
                    >
                      <button
                        className="px-4 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                      >
                        Edit
                      </button>
                    </Link>
                    <Link href={`/dashboard/watch/${course.module_id}`} className="block">
                      <button className="px-4 py-1 text-xs bg-indigo-600 rounded text-white hover:bg-indigo-700">
                        Watch
                      </button>
                    </Link>
                    <button
                      className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleOpenDeleteModal(course)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                    </button>
                  </div>
                  <div className="bg-white p-3">
                    <div className="flex items-center text-black">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <span className="text-xs">
                        {course.name || "Data Science for Quantum"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm mt-4">
                No courses available.
              </div>
            )}
          </div>
        </div>
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

        {/* Render the delete confirmation modal */}
        <DeleteConfirmationModal />
      </div>
    );
  };

  // User Dashboard Rendering
  const renderUserDashboard = () => {
    return (
      <div className="min-h-screen p-6">
        {/* Welcome header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white rounded-lg shadow p-6 w-full">
            <h1 className="text-xl font-semibold">Welcome back!</h1>
            <p className="text-gray-500 text-sm">
              You're making great learning today. Here's what's happening
            </p>
          </div>
          <div className="flex items-center">
            {/* Any avatar or header elements would go here */}
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Video stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Video Watch Hours</h2>
              <span className="text-sm text-blue-600 font-medium">Weekly</span>
            </div>

            {/* Chart */}
            <div className="h-48 flex items-end justify-between">
              {videoData.map((item, index) => (
                <div key={index} className="flex flex-col items-center w-8">
                  <div
                    className={`w-6 ${index === 3 ? "bg-blue-700" : "bg-blue-200"
                      }`}
                    style={{ height: `${item.minutes}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Middle column - Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">My Notes</h2>
              <span className="text-xs text-gray-500">May 04</span>
            </div>

            {/* Note list */}
            <div className="space-y-4">
              <div className="p-3 border border-gray-100 rounded-md">
                <div className="flex items-center mb-1">
                  <Book size={14} className="text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Lesson 1: Introduction to QM
                  </span>
                </div>
                <p className="text-sm font-medium">Qubit's Era</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-md">
                <div className="flex items-center mb-1">
                  <Book size={14} className="text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Lesson 3: Superposition
                  </span>
                </div>
                <p className="text-sm font-medium">Superposition states</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-md">
                <div className="flex items-center mb-1">
                  <Book size={14} className="text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Lesson 5: Entanglement
                  </span>
                </div>
                <p className="text-sm font-medium">"Spooky action"</p>
              </div>
            </div>
          </div>

          {/* Right column - Recent Questions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Recent Questions asked</h2>
              <span className="text-xs text-gray-500">May 04</span>
            </div>

            {/* Question list */}
            <div className="space-y-4">
              <div className="p-3">
                <div className="mb-1">
                  <p className="text-sm font-medium">Introduction to React</p>
                  <p className="text-xs text-gray-500">Asked 2 hours ago</p>
                </div>
                <button className="mt-2 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded">
                  View
                </button>
              </div>

              <div className="border-t border-gray-100 pt-4 p-3">
                <div className="mb-1">
                  <p className="text-sm font-medium">Introduction to React</p>
                  <p className="text-xs text-gray-500">Asked 2 hours ago</p>
                </div>
                <button className="mt-2 text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Course recommendations */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-medium">Top watched Videos</h2>
            <a href="#" className="text-sm text-blue-600">
              View All
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">

            {filteredCourses && filteredCourses.length > 0 ? (
              filteredCourses.slice(0, 4).map((course) => (

                <Link
                  key={course.id || course.module_id}
                  href={course.publish_to_school
                    ? `/dashboard/Course_card/${course.module_id}`
                    : `/dashboard/watch/${course.module_id}`}
                  className="block"
                >

                  <div className="bg-teal-800 text-white rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-sm font-medium mb-1">Intro to</h3>
                      <h3 className="text-sm font-medium">
                        {course.title || "Untitled Course"}
                      </h3>
                      <div className="mt-16 flex justify-end">
                        <div className="bg-teal-700 p-2 rounded-full">
                          <PlayCircle size={16} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3">
                      <div className="flex items-center text-black">
                        <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                        <span className="text-xs">
                          {course.name || "Unnamed Module"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-gray-500 text-sm mt-4">
                No courses available.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Conditional rendering based on user role
  return (
    <>
      {isAdminOrOwner ? renderAdminDashboard() : renderUserDashboard()}
      <DeleteConfirmatio jgfhgsdfhghgchgsdhjhsvukhdnModal />
    </>
  );
} 