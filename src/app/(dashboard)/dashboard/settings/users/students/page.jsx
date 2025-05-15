"use client";
import { ApiClientLms, ApiClientUserAccount } from "@/service/ApiUserAccount";
import { useState,useEffect } from "react";
import { useSelector } from "react-redux";

 
export default function StudentPage() {
  const [users, setUsers] = useState([ ]);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [noUsersFound, setNoUsersFound] = useState(false);

  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
const [courses, setCourses] = useState([]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
 
  // Add coach modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setnewStudent] = useState({
    courseName: "",
    studentName: "",
    studentEmail: "",
    module_id:""

  });
 
  // Edit coach functions
  const openEditModal = async(user) => {
    console.log("user",user);
    
    try {
      const response = await ApiClientUserAccount.get(`/auth/user-registration/${user.id}`, {
        withCredentials: true
      });

      console.log("response",response.data);
      
      setSelectedUser(response.data);
      setSelectedStatus(user.status);
      setIsEditModalOpen(true);
      // setUserDetails(response.data); // assuming the details are in response.data
    } catch (err) {
      setError("Failed to fetch user details.");
    } 
  };
 
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };
 
  const user = useSelector((state) => state.auth.user);
// const {selectedEntity} = user;
const selectedEntity = user?.selectedEntity;

// console.log("user ",user);
console.log("seelcted ent",selectedEntity);


  const saveChanges = () => {
    setUsers(users.map(user =>
      user.email === selectedUser.email ? { ...user, status: selectedStatus } : user
    ));
    closeEditModal();
  };
  const getData = async () => {
     try {
       const response = await ApiClientLms.get(`schools/get-by-entity-id/${selectedEntity}`,
         { withCredentials: true }
       );
       setCourses(response.data.data);
     } catch (error) {
       console.log("error", error);
     }
   };

   const getUsers = async () => {
    console.log("hello");
    
    try {
      const response = await ApiClientUserAccount.post(
        `roles/entity-users`,
        { module_role: "student" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      console.log("users",response.data);
      
      setUsers(response.data);
      setNoUsersFound(false);  
    } catch (error) {
      if (
        error.response &&
        error.response.status === 404 &&
        error.response.data?.message === "No entity users found for this entity."
      ) {
        setNoUsersFound(true);
        setUsers([]); // Clear any existing users
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

   useEffect(() => {
     if (selectedEntity) {
       getData();
       getUsers();
     }
   }, [selectedEntity]);
 
   console.log("courses",courses);
  // Add coach functions
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };
 
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setnewStudent({
      courseName: "",
      studentName: "",
      studentEmail: "",
      module_id: ""

    });
  };
 
  const handleaddStudentChange = (e) => {
    const { name, value } = e.target;
    setnewStudent({
      ...newStudent,
      [name]: value
    });
  };
 
  const handleAssignCourse = () => {
    if (!selectedCourseId) return;
  
    const assignedCourse = availableCourses.find(c => c.id === parseInt(selectedCourseId));
  
    const updatedUser = {
      ...selectedUser,
      courses: [
        ...selectedUser.courses,
        { 
          name: assignedCourse.name, 
          date: new Date().toLocaleDateString(), 
          students: 0,
          progress: 15 // Initial progress for new course
        },
      ],
    };
  
    setUsers(users.map(user => 
      user.email === selectedUser.email ? updatedUser : user
    ));
    
    setSelectedUser(updatedUser);
  
    // Close both modals after assigning
    setIsAssignModalOpen(false);
    setIsConfirmModalOpen(false);
  
    // Reset selected course
    setSelectedCourseId('');
  };
  
  const addStudent = async() => {
    const newUser = {
      name: newStudent.studentName,
      email: newStudent.studentEmail,
      invitation_for:"entity_user",
      status: "Active",
      entity_id:selectedEntity,
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
  const forStudents = courses.filter((course)=>course.publish_to_school === true)
  console.log(forStudents)

  // Helper function to get average progress across all courses
  const getAverageProgress = (courses) => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / courses.length);
  };
 
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold text-gray-800">User's › Students</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Admin..."
              className="border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-full flex items-center"
            onClick={openAddModal}
          >
            <span className="mr-2">+</span> Add Student
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              {/* <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600">No Of Cases</th>
        <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600">Status</th> */}
              <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {noUsersFound ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-red-500 text-sm py-6"
                >
                  No entity users found for this entity.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border-b border-gray-200 p-4 text-sm text-gray-800">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      {user.username || "Not Specified"}
                    </div>
                  </td>
                  <td className="border-b border-gray-200 p-4 text-sm text-gray-800">
                    {user.email || "Not Specified"}
                  </td>
                  <td className="border-b border-gray-200 p-4 flex space-x-4">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View More
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

 
      {/* Edit Coach Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Coach</h2>
            
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-gray-500">Coach</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded py-2 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mobile</label>
                <input
                  type="text"
                  value={selectedUser.mobile}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded py-2 px-3 text-sm"
                />
              </div>
            </div>
            
            {/* <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 w-40 border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div> */}
            
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Number of Courses</label>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                  {selectedUser.courses.length}
                </div>
              </div>
            
            </div> */}
            
            {/* <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Assigned Courses</h3>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1 px-3 rounded"
              >
                Assign Course
              </button>
            </div> */}
            
            {/* <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-600">Course Name</th>
                  <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-600">Progress</th>
                  <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.courses.length > 0 ? (
                  selectedUser.courses.map((course, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 p-3 text-sm text-gray-800">{course.name}</td>
                      <td className="border-b border-gray-200 p-3 text-sm text-gray-800">{course.date}</td>
                      <td className="border-b border-gray-200 p-3 text-sm text-gray-800">
                        <div className="w-full flex items-center">
                          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-purple-600" 
                              style={{width: `${course.progress}%`}}
                            ></div>
                          </div>
                          <span>{course.progress}%</span>
                        </div>
                      </td>
                      <td className="border-b border-gray-200 p-3">
                        <button className="text-red-600 hover:text-red-900">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-sm text-gray-600">No courses assigned</td>
                  </tr>
                )}
              </tbody>
            </table> */}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              {/* <button
                onClick={saveChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save Changes
              </button> */}
            </div>
          </div>
        </div>
      )}
 
      {/* Add Coach Modal */}
      {isAddModalOpen && (
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
                onClick={() => setIsAddModalOpen(false)} // assuming this closes the modal
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
 
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Assign Course</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select a Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">-- Select Course --</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
       
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                disabled={!selectedCourseId}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
       
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Are you sure you want to add course?</h2>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCourse}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}