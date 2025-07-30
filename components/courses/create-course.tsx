"use client"

import { useState, useContext } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { InputField } from "../common/input-field"

export const CreateCourse = () => {
  const { navigateTo, addCourse } :any= useContext(AppContext)
  const [formData, setFormData] = useState({
    sourcedId: `course-ui-${Date.now()}`,
    title: "1273 AP World History: Modern - PP100",
    courseCode: "APWHM-PP100",
    grades: "09,10,11,12",
    subjects: "Social Studies,History",
    subjectCodes: "1273",
    org: { sourcedId: "alpha-learn-123" },
    level: "AP",
    gradingScheme: "AP_5_POINT",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "org.sourcedId") {
      setFormData((prev) => ({ ...prev, org: { sourcedId: value } }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addCourse(formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigateTo("courses")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Course Builder
      </button>

      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Course</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Sourced ID (Auto-generated)</label>
            <p className="mt-1 text-sm p-2 bg-slate-100 rounded-md text-slate-600">{formData.sourcedId}</p>
          </div>

          <InputField label="Title" name="title" value={formData.title} onChange={handleChange} />
          <InputField label="Course Code" name="courseCode" value={formData.courseCode} onChange={handleChange} />
          <InputField label="Grades (comma-separated)" name="grades" value={formData.grades} onChange={handleChange} />
          <InputField
            label="Subjects (comma-separated)"
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
          />
          <InputField
            label="Subject Codes (comma-separated)"
            name="subjectCodes"
            value={formData.subjectCodes}
            onChange={handleChange}
          />
          <InputField
            label="Organization SourcedId"
            name="org.sourcedId"
            value={formData.org.sourcedId}
            onChange={handleChange}
          />
          <InputField label="Level" name="level" value={formData.level} onChange={handleChange} />
          <InputField
            label="Grading Scheme"
            name="gradingScheme"
            value={formData.gradingScheme}
            onChange={handleChange}
          />

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Save className="w-5 h-5" /> Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
