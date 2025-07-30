"use client"

import { useContext } from "react"
import { ArrowLeft } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { ComponentForm } from "./component-form"

export const CreateGlobalCourseComponent = () => {
  const { navigateTo, createGlobalCourseComponent }:any = useContext(AppContext)

  const handleSave = (formData:any) => {
    // For global component creation, we assume it's a 'unit' type initially
    // as topics require a parent. The user can later associate it with a course.
    createGlobalCourseComponent({ ...formData, type: "unit" })
    navigateTo("courses") // Navigate back to course builder after creation
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
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Global Component (Unit)</h2>
        <ComponentForm
          type="Unit" // Default to Unit for global creation
          onSave={handleSave}
          onCancel={() => navigateTo("courses")}
          // No parentId for global components
        />
        <p className="text-sm text-slate-500 mt-4">
          This will create a new top-level course component (Unit). You can associate it with a course later.
        </p>
      </div>
    </div>
  )
}
