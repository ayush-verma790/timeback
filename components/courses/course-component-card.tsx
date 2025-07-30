"use client"

import { useState, useContext } from "react"
import { Plus, Folder, FileIcon, ClipboardCopy, LinkIcon, Edit } from "lucide-react" // Import Edit icon
import { useToast } from "../toast/toast-context"
import { ComponentForm } from "./component-form"
import { AppContext } from "../../context/app-context" // Import AppContext

export const CourseComponentCard = ({ component, onAddTopic, onSaveCourse }) => {
  const { addToast }:any = useToast()
  const { navigateTo, editingCourse }:any = useContext(AppContext) 
  const [showTopicForm, setShowTopicForm] = useState(false)

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast(`${label} copied to clipboard!`, "success")
    })
  }

  const handleAddTopic = (topicData) => {
    onAddTopic(topicData)
    setShowTopicForm(false)
    onSaveCourse() // Trigger save after adding a new topic
  }

  const handleEditComponent = () => {
    // Navigate to the new edit component view, passing the component's sourcedId
    navigateTo("editCourseComponent", component.sourcedId)
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-lg flex items-center gap-2 text-slate-700">
          {component.type === "unit" ? (
            <Folder className="w-5 h-5 text-sky-600" />
          ) : (
            <FileIcon className="w-5 h-5 text-slate-500" />
          )}
          {component.title}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditComponent} // New edit button
            className="text-slate-400 hover:text-blue-600"
            title={`Edit ${component.type}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => copyToClipboard(component.sourcedId, `${component.type} Sourced ID`)}
            className="text-slate-400 hover:text-slate-600"
            title={`Copy ${component.type} Sourced ID`}
          >
            <ClipboardCopy className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500 font-mono ml-7">{component.sourcedId}</p>

      {component.resources && component.resources.length > 0 && (
        <div className="ml-7 mt-3">
          <h5 className="font-semibold text-sm text-slate-600 mb-1">Associated Resources:</h5>
          <div className="space-y-1">
            {component.resources.map((res) => (
              <div
                key={res.sourcedId}
                className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 p-2 rounded"
              >
                <LinkIcon className="w-3 h-3 text-blue-500" />
                <span>
                  {res.title} ({res.sourcedId})
                </span>
                <button
                  onClick={() => copyToClipboard(res.sourcedId, "Resource Sourced ID")}
                  className="ml-auto text-slate-400 hover:text-slate-600"
                  title="Copy Resource Sourced ID"
                >
                  <ClipboardCopy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pl-8 mt-4 space-y-3">
        {component.children.map((child) => (
          <CourseComponentCard
            key={child.sourcedId}
            component={child}
            onAddTopic={onAddTopic}
            onSaveCourse={onSaveCourse}
          />
        ))}
        {component.type === "unit" && // Only allow adding topics to units
          (showTopicForm ? (
            <ComponentForm
              type="Topic"
              parentId={component.sourcedId}
              onSave={handleAddTopic}
              onCancel={() => setShowTopicForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowTopicForm(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2 font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          ))}
      </div>
    </div>
  )
}
