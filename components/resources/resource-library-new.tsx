"use client"

import { useContext, useState } from "react"
import { Plus, BookOpen, Video, FileText, Trash2, X, Edit } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"
import { ResourceData, createDefaultResourceData } from "@/types/resource"
import { UpdateResourceModal } from "./update-resource-modal"

export const ResourceLibrary = () => {
  const { resources, navigateTo, resourcePagination, fetchResources, setResourcePagination, deleteResource, updateResource, fetchResourceBySourcedId } :any= useContext(AppContext)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  
  // Simple state for update modal
  const [updateResourceId, setUpdateResourceId] = useState("")
  const [updateResourceData, setUpdateResourceData] = useState<ResourceData | null>(null)
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)

  // Delete modal state
  const [deleteId, setDeleteId] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle limit change for pagination
  const handleLimitChange = (newLimit: number) => {
    setResourcePagination({ ...resourcePagination, limit: newLimit })
    fetchResources(1) // Reset to first page with new limit
  }

  // Simple API call function - no useEffect
  const handleFetchResourceData = async (resourceId: string) => {
    if (!resourceId.trim()) return

    setIsLoadingUpdate(true)
    console.log("🔄 Fetching resource data for:", resourceId)
    
    try {
      const apiResponse = await fetchResourceBySourcedId(resourceId)
      console.log("📥 Raw API response:", apiResponse)
      
      // Extract resource data
      const resourceData = apiResponse?.resource || apiResponse
      
      if (resourceData && resourceData.title) {
        console.log("✅ Valid resource data found:", resourceData.title)
        
        // Create clean data structure
        const cleanData: ResourceData = {
          title: String(resourceData.title),
          metadata: resourceData.metadata || {},
          importance: String(resourceData.importance || ""),
          vendorId: String(resourceData.vendorId || ""),
          vendorResourceId: String(resourceData.vendorResourceId || ""),
          applicationId: String(resourceData.applicationId || ""),
          roles: Array.isArray(resourceData.roles) ? resourceData.roles : []
        }
        
        console.log("🎯 Setting clean data:", cleanData)
        setUpdateResourceData(cleanData)
        console.log("✅ Data set successfully!")
        
      } else {
        console.error("❌ Invalid resource data")
        alert("Resource not found or has no title")
        setUpdateResourceData(null)
      }
      
    } catch (error) {
      console.error("💥 Error:", error)
      alert(`Error: ${error.message}`)
      setUpdateResourceData(null)
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  // Handle update
  const handleUpdateResource = async (data: ResourceData) => {
    if (!updateResourceId.trim()) return
    
    setIsLoadingUpdate(true)
    try {
      await updateResource(updateResourceId, { resource: data })
      setIsUpdateModalOpen(false)
      setUpdateResourceId("")
      setUpdateResourceData(null)
      alert("Resource updated successfully!")
      fetchResources() // Refresh the list
    } catch (error) {
      console.error("Error updating resource:", error)
      alert("Error updating resource")
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setUpdateResourceId("")
    setUpdateResourceData(null)
  }

  // Delete Modal Component
  const DeleteModal = () => {
    const handleDeleteResource = async () => {
      if (!deleteId.trim()) return

      setIsDeleting(true)
      try {
        await deleteResource(deleteId)
        setIsDeleteModalOpen(false)
        setDeleteId("")
        alert("Resource deleted successfully!")
      } catch (error) {
        console.error("Error deleting resource:", error)
        alert("Error deleting resource")
      } finally {
        setIsDeleting(false)
      }
    }

    const handleClose = () => {
      setDeleteId("")
      setIsDeleteModalOpen(false)
    }

    if (!isDeleteModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete Resource</h3>
            <button onClick={handleClose} className="text-slate-500 hover:text-slate-700">
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
              onClick={handleClose}
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
              {isDeleting ? "Deleting..." : "Delete Resource"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Update Modal with Input Field
  const UpdateModalWithInput = () => {
    if (!isUpdateModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Update Resource</h3>
            <button onClick={handleCloseUpdateModal} className="text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resource ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={updateResourceId}
                onChange={(e) => setUpdateResourceId(e.target.value)}
                placeholder="Enter resource ID..."
                className="flex-1 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingUpdate}
              />
              <button
                onClick={() => handleFetchResourceData(updateResourceId)}
                disabled={!updateResourceId.trim() || isLoadingUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoadingUpdate ? "Loading..." : "Fetch"}
              </button>
            </div>
          </div>

          {/* Show success message when data is loaded */}
          {updateResourceData && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">
                ✅ <strong>{updateResourceData.title}</strong> loaded successfully!
              </p>
              <button
                onClick={() => {
                  handleCloseUpdateModal()
                  // Open the actual update modal
                  setTimeout(() => setIsUpdateModalOpen(true), 100)
                }}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Open Editor
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCloseUpdateModal}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
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
          
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
          >
            <Edit className="w-5 h-5" /> Update Resource
          </button>

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
      
      {/* Update Modal Input */}
      <UpdateModalWithInput />

      {/* Separate Update Modal Component */}
      <UpdateResourceModal 
        isOpen={!!updateResourceData}
        resourceData={updateResourceData}
        resourceId={updateResourceId}
        onClose={handleCloseUpdateModal}
        onUpdate={handleUpdateResource}
        isLoading={isLoadingUpdate}
      />
    </div>
  )
}
