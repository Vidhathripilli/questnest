// src/pages/my-courses.js
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { ApiClientLms } from "@/service/ApiUserAccount";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PlayCircle from "../../../../../../assets/icons/social_media_icons/PlayCircle.svg";
import editSchool from "../../../../../../assets/icons/social_media_icons/editSchool.svg";
import deleteCourse from "../../../../../../assets/icons/social_media_icons/deleteCourse.svg";



const coursesData = [
  {
    id: 1,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
  {
    id: 2,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: false,
  },
  {
    id: 3,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
  {
    id: 4,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
  {
    id: 5,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: false,
  },
  {
    id: 6,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
  {
    id: 7,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
  {
    id: 8,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: false,
  },
  {
    id: 9,
    name: "Data Science for Quantum",
    coach: "Bhanu Chander",
    createDate: "24 April 2025",
    published: true,
  },
];

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector((state) => state.auth.user);
  console.log("user from my account", user);
  const entityId = user?.selectedEntity;
  console.log("entity id from my course", entityId);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const router = useRouter(); 
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await ApiClientLms.get(
          `schools/get-by-entity-id/${entityId}`,
          { withCredentials: true }
        );
        setCourses(response.data.data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };

    if (entityId) {
      getCourses();
    }
  }, [entityId]);

  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };


  const filteredCourses = courses.filter((course) => {
    // Filter by name (search term)
    const matchesSearchTerm = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status (Published or Unpublished)
    const matchesStatus = statusFilter === 'All Status' || 
      (statusFilter === 'Published' && course.publish_to_school === true) || 
      (statusFilter === 'Unpublished' && course.publish_to_school === false);

    // Return true if both filters match
    return matchesSearchTerm && matchesStatus;
  });


  console.log("coures", courses);

  // Handle search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // This would filter the results when connected to an API
  };

  // Handle toggle publication status
  const handleTogglePublish = async (courseId) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const updatedCourse = {
          ...course,
          publish_to_school: !course.publish_to_school,
        };
  
        // API call to persist the change
        updateCoursePublishStatus(courseId, updatedCourse.publish_to_school);
  
        return updatedCourse;
      }
      return course;
    });
  
    setCourses(updatedCourses);
  };
  
  const updateCoursePublishStatus = async (courseId, publishStatus) => {
    try {
      await ApiClientLms.patch(`/courses/${courseId}`, {
        publish_to_school: publishStatus,
        
      },
      {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Failed to update publish status:', error);
      // Optionally revert the UI update or show a toast/error
    }
  };
    

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>My Courses</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Course</h1>
          <p className="text-gray-500">Management for Course</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="mb-4 md:mb-0">
          <select
              className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Unpublished</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Courses"
              className="border border-gray-300 rounded-full px-4 py-2 pl-4 pr-10 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute right-0 top-0 mt-2 mr-3 text-gray-500">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left p-3 text-gray-700 font-medium rounded-l-lg">
                  Course Name
                </th>
                <th className="text-left p-3 text-gray-700 font-medium">
                  Coach
                </th>
                <th className="text-left p-3 text-gray-700 font-medium">
                  Create Date
                </th>
                <th className="text-center p-3 text-gray-700 font-medium">
                  published
                </th>
                <th className="text-center p-3 text-gray-700 font-medium rounded-r-lg">
                  Actions
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-gray-500">for Quantum</div>
                    </td>
                    <td className="p-3">{course.coach}</td>
                    <td className="p-3">{course.createDate}</td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={course.publish_to_school}
                          onChange={() => handleTogglePublish(course.id)}
                        />

                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                      <Link
                        href={`/dashboard/watch/${course.module_id}`} // Link to the course details 
                        
                      >
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-white">
                          <Image src={PlayCircle}/>
                        </button>
                      </Link>
                        <Link
                        href={`/dashboard/Course_card/${course.module_id}`} // Link to the course details 
                        
                      >
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-white">
                          <Image src={editSchool}/>
                        </button>
                      </Link>
                        <button className="w-8 h-8 bg-white  rounded-full flex items-center justify-center text-red-500">
                          <Image src={deleteCourse}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}