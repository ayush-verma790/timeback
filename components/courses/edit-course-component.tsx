"use client"

import { useState, useContext, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { InputField } from "../common/input-field"
import { useToast } from "../toast/toast-context"
import { api } from "../../utils/api"

export const EditCourseComponent = () => {
  const { navigateTo, handleApiCall, editingCourseComponentId, editingCourse } :any= useContext(AppContext)
  const { addToast } :any= useToast()
  const [componentData, setComponentData] = useState(null)
  const [isLoadingComponent, setIsLoadingComponent] = useState(true)

  useEffect(() => {
    const fetchComponentDetails = async () => {
      // if (editingCourseComponentId) {
      //   setIsLoadingComponent(true)
      //   try {
      //     const result = await handleApiCall(api.getCourseComponent, editingCourseComponentId)
      //     if (result && result.courseComponent) {
      //       setComponentData(result.courseComponent)
      //     } else {
      //       addToast("Course component not found.", "error")
      //       navigateTo("courseComponentsView", editingCourse?.id) // Go back if not found
      //     }
      //   } catch (err) {
      //     console.error("Failed to fetch course component details:", err)
      //     addToast("Failed to load component details.", "error")
      //     navigateTo("courseComponentsView", editingCourse?.id) // Go back on error
      //   } finally {
      //     setIsLoadingComponent(false)
      //   }
      // } else {
      //   // If no component ID is set, navigate back to the course view
      //   navigateTo("courseComponentsView", editingCourse?.id)
      // }
      console.log("object")
                  navigateTo("courseComponentsView", editingCourse?.id) // Go back if not found

    }

    fetchComponentDetails()
  }, [editingCourseComponentId, handleApiCall, navigateTo, addToast, editingCourse])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setComponentData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) : value,
    }))
  }

  const handleSave = async () => {
    if (!componentData) return

    // In a real application, you would send an update request to the API here.
    // For now, we'll just simulate a save and show a toast.
    // The OneRoster API typically uses PUT for updates to existing resources.
    // You would need an `updateCourseComponent` function in `utils/api.tsx`
    // and a corresponding handler in `AppContext`.

    // Example of what an update payload might look like (simplified):
    const updatePayload = {
      courseComponent: {
        sourcedId: componentData.sourcedId,
        title: componentData.title,
        sortOrder: componentData.sortOrder,
        status: componentData.status,
        unlockDate: componentData.unlockDate,
        // ... other fields you want to update
      },
    }

    try {
      // Simulate API call
      // await handleApiCall(api.updateCourseComponent, componentData.sourcedId, updatePayload);
      addToast("Component details saved (simulated)!", "success")
      // After saving, you might want to navigate back or refresh the parent view
      navigateTo("courseComponentsView", editingCourse?.id)
    } catch (err) {
      addToast("Failed to save component details.", "error")
      console.error("Error saving component:", err)
    }
  }

  if (isLoadingComponent) {
    return <div className="text-center py-12">Loading component details...</div>
  }

  if (!componentData) {
    return <div className="text-center py-12 text-slate-500">No component selected or found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateTo("courseComponentsView", editingCourse?.id)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Components
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
        >
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-slate-800">Edit {componentData.title}</h2>

      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Sourced ID</label>
          <p className="mt-1 text-sm p-2 bg-slate-100 rounded-md text-slate-600">{componentData.sourcedId}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <p className="mt-1 text-sm p-2 bg-slate-100 rounded-md text-slate-600">{componentData.type}</p>
        </div>

        <InputField label="Title" name="title" value={componentData.title} onChange={handleChange} />
        <InputField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={componentData.sortOrder}
          onChange={handleChange}
        />
        <InputField
          label="Status"
          name="status"
          value={componentData.status}
          onChange={handleChange}
          required={false}
        />
        <InputField
          label="Unlock Date (ISO String)"
          name="unlockDate"
          value={componentData.unlockDate || ""}
          onChange={handleChange}
          required={false}
        />
        {/* Add more fields as needed for editing */}
      </div>
    </div>
  )
}
