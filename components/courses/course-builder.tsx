"use client"

import { useContext } from "react"
import { Plus, Eye, Trash2 } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"

export const CourseBuilder = () => {
  const { courses, navigateTo, deleteCourse, coursePagination, fetchCourses, setCoursePagination }:any =
    useContext(AppContext)

  const handleLimitChange = (newLimit) => {
    setCoursePagination((prev) => ({ ...prev, limit: newLimit }))
    fetchCourses(1, newLimit)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Course Builder</h2>
        <div className="flex gap-2">
          {" "}
          {/* Group buttons */}
          {/* <button
            onClick={() => navigateTo("createGlobalCourseComponent")} // New button to create global component
            className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Component
          </button> */}
          <button
            onClick={() => navigateTo("createCourse")}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Course
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="space-y-2 p-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="p-4 rounded-lg flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{course.title}</h3>
                  <p className="text-sm text-slate-500 font-mono">{course.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo("courseComponentsView", course.id)}
                    className="flex items-center gap-2 bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">No active courses found.</p>
          )}
        </div>
        {coursePagination.totalCount > 0 && (
          <Pagination
            pagination={coursePagination}
            onPageChange={(page) => fetchCourses(page)}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </div>
  )
}
