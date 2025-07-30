"use client"

import { useState, useContext } from "react"
import { ChevronDown, Folder, FileIcon } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { api } from "../../utils/api"

export const CourseComponentSelector = ({ course, selectedComponent, onSelectComponent }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [components, setComponents] = useState([])
  const { handleApiCall } = useContext(AppContext)

  const fetchComponents = async () => {
    if (!isOpen) {
      try {
        const result = await handleApiCall(api.getCourseComponents, course.id)
        if (result && result.courseComponents) {
          const componentMap = new Map(result.courseComponents.map((c) => [c.sourcedId, { ...c, topics: [] }]))
          const units = []

          result.courseComponents.forEach((component) => {
            if (component.parentComponent) {
              const parent = componentMap.get(component.parentComponent.sourcedId)
              if (parent) parent.topics.push(componentMap.get(component.sourcedId))
            } else {
              units.push(componentMap.get(component.sourcedId))
            }
          })

          setComponents(units)
        }
      } catch (err) {
        console.error("Failed to fetch components for course:", course.id, err)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="border-b border-slate-200 py-2">
      <button
        onClick={fetchComponents}
        className="w-full text-left flex justify-between items-center p-2 rounded-md hover:bg-slate-100"
      >
        <span className="font-semibold text-slate-700">{course.title}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="pl-4 mt-2 space-y-2">
          {components.map((unit) => (
            <div key={unit.sourcedId}>
              <h4 className="font-medium text-slate-600 flex items-center gap-2">
                <Folder className="w-4 h-4 text-sky-500" />
                {unit.title}
              </h4>
              <div className="pl-6 space-y-1 mt-1">
                {unit.topics.map((topic) => (
                  <div
                    key={topic.sourcedId}
                    onClick={() => onSelectComponent(topic)}
                    className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${
                      selectedComponent?.sourcedId === topic.sourcedId
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <FileIcon className="w-4 h-4 text-slate-400" />
                    {topic.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
