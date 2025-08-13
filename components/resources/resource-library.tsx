"use client"

import { useContext, useState } from "react"
import { Plus, BookOpen, Video, FileText, Trash2, X } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"

export const ResourceLibrary = () => {
  const { resources, navigateTo, resourcePagination, fetchResources, setResourcePagination, deleteResource } :any= useContext(AppContext)
  
  // Modal state for delete functionality
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLimitChange = (newLimit) => {
    setResourcePagination((prev) => ({ ...prev, limit: newLimit }))
    fetchResources(1, newLimit)
  }

  const handleDeleteResource = async () => {
    if (!deleteId.trim()) return
    
    setIsDeleting(true)
    try {
      await deleteResource(deleteId.trim())
      setIsDeleteModalOpen(false)
      setDeleteId("")
    } catch (error) {
      console.error('Error deleting resource:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const DeleteModal = () => {
    if (!isDeleteModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete Resource</h3>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeleteId("")
              }}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <label htmlFor="deleteId" className="block text-sm font-medium text-slate-700 mb-2">
              Resource ID
            </label>
            <input
              type="text"
              id="deleteId"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              placeholder="Enter resource ID to delete..."
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isDeleting}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeleteId("")
              }}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteResource}
              disabled={!deleteId.trim() || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete Resource'}
            </button>
          </div>
        </div>
      </div>
    )
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
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
          >
            <Trash2 className="w-5 h-5" /> Delete Resource
          </button>
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

      {/* Delete Modal */}
      <DeleteModal />
    </div>
  )
}
