"use client"

import { useContext } from "react"
import { Plus, BookOpen, Video, FileText } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"

export const ResourceLibrary = () => {
  const { resources, navigateTo, resourcePagination, fetchResources, setResourcePagination } = useContext(AppContext)

  const handleLimitChange = (newLimit) => {
    setResourcePagination((prev) => ({ ...prev, limit: newLimit }))
    fetchResources(1, newLimit)
  }

  const ResourceCard = ({ resource }) => {
    const getIcon = (type) => {
      switch (type) {
        case "qti":
          return <BookOpen className="w-6 h-6 text-purple-500" />
        case "text":
          return <FileText className="w-6 h-6 text-blue-500" />
        case "video":
          return <Video className="w-6 h-6 text-red-500" />
        default:
          return <FileText className="w-6 h-6 text-slate-500" />
      }
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex items-center gap-4 hover:shadow-lg hover:border-blue-500 transition-all">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg">
          {getIcon(resource.metadata?.type)}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-slate-800">{resource.title}</h3>
          <p className="text-sm text-slate-500">{resource.metadata?.type}</p>
          <p className="text-xs text-slate-400 font-mono">{resource.sourcedId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Resource Library</h2>
          <p className="text-slate-600">Total: {resourcePagination.totalCount} resources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo("createResource")}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Resource
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <ResourceCard key={res.sourcedId} resource={res} />
            ))}
          </div>

          {resources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No resources found</p>
            </div>
          )}
        </div>

        {resourcePagination.totalCount > 0 && (
          <Pagination
            pagination={resourcePagination}
            onPageChange={(page) => fetchResources(page)}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </div>
  )
}
