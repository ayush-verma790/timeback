"use client"

import { useContext, useState } from "react"
import { Plus, BookOpen, Video, FileText, Trash2, X, Edit } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"
import { ResourceData, createDefaultResourceData } from "@/types/resource"
import { UpdateResourceModal } from "./update-resource-modal"

export const ResourceLibrary = () => {
  const { resources, navigateTo, resourcePagination, fetchResources, setResourcePagination, deleteResource, updateResource, fetchResourceBySourcedId } :any= useContext(AppContext)
  
  // Modal state for delete functionality
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal state for update functionality
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateId, setUpdateId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [updateData, setUpdateData] = useState(() => ({
    title: "",
    metadata: {
      type: "",
      subject: "",
      language: "",
      xp: 0,
      format: "",
      pageCount: 0,
      url: "",
      grades: [],
      keywords: [],
    },
    importance: "",
    vendorResourceId: "",
    vendorId: "",
    applicationId: "",
    roles: [],
  }))

  const handleLimitChange = (newLimit) => {
    setResourcePagination((prev) => ({ ...prev, limit: newLimit }))
    fetchResources(1, newLimit)
  }

  // Helper function to create default metadata structure
  const createDefaultMetadata = () => ({
    // Common metadata
    type: "",
    subType: "",
    subject: "",
    grades: [],
    language: "",
    xp: 0,
    url: "",
    keywords: [],
    learningObjectiveSet: [],
    
    // Text/Course Material specific
    format: "",
    author: "",
    pageCount: 0,
    wordLength: 0,
    timeLength: 0,
    activityType: "",
    instructionalMethod: "",
    
    // QTI specific
    questionType: "",
    difficulty: "",
    teks: "",
    keyConcepts: "",
    underlyingTheme: "",
    lessonType: "",
    
    // Video/Audio specific
    duration: "",
    captionsAvailable: false,
    speaker: "",
    
    // Interactive specific
    launchUrl: "",
    toolProvider: "",
    
    // Visual specific
    resolution: "",
    
    // Assessment Bank specific
    resources: []
  })

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

  // TypeScript interfaces for the UpdateModal
  interface ResourceMetadata {
    // Common fields
    type?: string
    subType?: string
    subject?: string
    grades?: string[]
    learningObjectiveSet?: any[]
    xp?: number
    url?: string
    language?: string
    keywords?: string[]
    wordLength?: number
    timeLength?: number
    
    // QTI specific
    lessonType?: string
    
    // Text/Course Material specific
    activityType?: string
    format?: string
    author?: string
    pageCount?: number
    instructionalMethod?: string
    
    // Audio/Video specific
    duration?: string
    captionsAvailable?: boolean
    speaker?: string
    
    // Interactive specific
    launchUrl?: string
    toolProvider?: string
    
    // Visual specific
    resolution?: string
    
    // Assessment Bank specific
    resources?: string[]
  }

  interface ResourceData {
    title: string
    metadata: ResourceMetadata
    importance: string
    vendorId: string
    vendorResourceId: string
    applicationId: string
    roles: string[]
  }

  interface UpdateModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdate?: (id: string, data: ResourceData) => Promise<void>
    onGetResource?: (id: string) => Promise<ResourceData | null>
  }

  const createDefaultResourceData = (): ResourceData => ({
    title: "",
    metadata: {
      type: "",
      subType: "",
      subject: "",
      grades: [],
      learningObjectiveSet: [],
      xp: 0,
      url: "",
      language: "",
      keywords: [],
      wordLength: 0,
      timeLength: 0,
      lessonType: "",
      activityType: "",
      format: "",
      author: "",
      pageCount: 0,
      instructionalMethod: "",
      duration: "",
      captionsAvailable: false,
      speaker: "",
      launchUrl: "",
      toolProvider: "",
      resolution: "",
      resources: [],
    },
    importance: "",
    vendorId: "",
    vendorResourceId: "",
    applicationId: "",
    roles: [],
  })

  const UpdateModal = () => {
    const [modalUpdateId, setModalUpdateId] = useState("")
    const [modalUpdateData, setModalUpdateData] = useState<ResourceData>(createDefaultResourceData())
    const [modalIsLoading, setModalIsLoading] = useState(false)
    const [dynamicFields, setDynamicFields] = useState<string[]>([])
    const [renderKey, setRenderKey] = useState(0) // Force re-render
    
    

    // Test function to populate mock data
    const populateMockData = () => {
      const mockData: ResourceData = {
        title: "Test Resource Title",
        metadata: {
          type: "text",
          subType: "",
          subject: "Mathematics",
          grades: ["3", "4", "5"],
          learningObjectiveSet: [],
          xp: 100,
          url: "https://example.com/resource",
          language: "en-US",
          keywords: ["math", "algebra", "test"],
          wordLength: 1500,
          timeLength: 3600,
          lessonType: "",
          activityType: "Practice",
          format: "pdf",
          author: "John Doe",
          pageCount: 25,
          instructionalMethod: "direct-instruction",
          duration: "",
          captionsAvailable: false,
          speaker: "",
          launchUrl: "",
          toolProvider: "",
          resolution: "",
          resources: [],
        },
        importance: "primary",
        vendorId: "TEST-VENDOR",
        vendorResourceId: "TEST-123",
        applicationId: "APP-456",
        roles: ["primary", "secondary"],
      }
      
      const mockFields = ['type', 'subject', 'grades', 'xp', 'url', 'language', 'keywords', 'format', 'author', 'pageCount', 'importance', 'vendorId', 'vendorResourceId', 'applicationId', 'roles']
      
      console.log("🧪 Setting mock data:", mockData)
      setDynamicFields(mockFields)
      setModalUpdateData(mockData)
      setRenderKey(prev => prev + 1)
    }

    const handleGetResourceForUpdate = async () => {
      if (!modalUpdateId.trim()) return

      setModalIsLoading(true)
      
      try {
        console.log("🔄 Starting API call...")
        const apiResponse = await fetchResourceBySourcedId(modalUpdateId)
        console.log("📥 Raw API response:", apiResponse)
        
        // Extract resource data
        const resourceData = apiResponse?.resource || apiResponse
        
        if (resourceData && resourceData.title) {
          console.log("✅ Valid resource data found")
          
          // Extract all available fields synchronously
          const availableFields = []
          
          // Add metadata fields
          if (resourceData.metadata) {
            Object.keys(resourceData.metadata).forEach(key => {
              if (!['tenantId', 'clientAppId', 'sourcedId'].includes(key)) {
                availableFields.push(key)
              }
            })
          }
          
          // Add root level fields that exist
          ['importance', 'vendorId', 'vendorResourceId', 'applicationId'].forEach(field => {
            if (resourceData[field] !== undefined) {
              availableFields.push(field)
            }
          })
          
          if (resourceData.roles !== undefined) {
            availableFields.push('roles')
          }
          
          console.log("🔍 Available fields:", availableFields)
          
          // Create the complete data structure
          const completeData: ResourceData = {
            title: String(resourceData.title),
            metadata: {},
            importance: String(resourceData.importance || ""),
            vendorId: String(resourceData.vendorId || ""),
            vendorResourceId: String(resourceData.vendorResourceId || ""),
            applicationId: String(resourceData.applicationId || ""),
            roles: Array.isArray(resourceData.roles) ? resourceData.roles : []
          }
          
          // Populate metadata
          if (resourceData.metadata) {
            availableFields.forEach(field => {
              if (resourceData.metadata[field] !== undefined) {
                completeData.metadata[field] = resourceData.metadata[field]
              }
            })
          }
          
          console.log("🎯 Complete data structure:", completeData)
          
          // Set everything at once - no async issues
          console.log("🔄 Setting fields and data...")
          console.log("🔄 Before setState - Current modalUpdateData:", modalUpdateData.title)
          
          setDynamicFields([...availableFields])
          setModalUpdateData(completeData)
          setRenderKey(prev => prev + 1) // Force immediate re-render
          
          console.log("🔄 After setState - Should be:", completeData.title)
          console.log("✅ Data and fields set successfully!")
          
          // Force a small delay to verify state change
          setTimeout(() => {
            console.log("📊 Current state verification:", {
              fields: availableFields,
              titleInState: completeData.title,
              typeInState: completeData.metadata.type
            })
          }, 50)
          
        } else {
          console.error("❌ Invalid resource data")
          alert("Resource not found or has no title")
        }
        
      } catch (error) {
        console.error("💥 Error:", error)
        alert(`Error: ${error.message}`)
      } finally {
        setModalIsLoading(false)
      }
    }

    // Dynamic form field renderer - moved inside UpdateModal
    const renderDynamicField = (fieldName: string, value: any) => {
      console.log(`🎨 Rendering field: ${fieldName} = ${value}`)
      console.log(`🎨 Value type: ${typeof value}, is null: ${value === null}, is undefined: ${value === undefined}`)
      
      const safeValue = value !== undefined && value !== null ? value : ""
      console.log(`🎨 Safe value for ${fieldName}: "${safeValue}"`)
      
      const handleFieldChange = (newValue: any) => {
        console.log(`🔄 ${fieldName}: ${safeValue} → ${newValue}`)
        
        setModalUpdateData(currentData => {
          const newData = { ...currentData }
          
          if (fieldName === 'title') {
            newData.title = newValue
          } else if (['importance', 'vendorId', 'vendorResourceId', 'applicationId'].includes(fieldName)) {
            newData[fieldName as keyof ResourceData] = newValue
          } else if (fieldName === 'roles') {
            newData.roles = typeof newValue === 'string' ? newValue.split(',').map(r => r.trim()).filter(r => r) : newValue
          } else {
            newData.metadata = { ...newData.metadata, [fieldName]: newValue }
          }
          
          return newData
        })
      }

      // Simple text input for all fields - no complex logic
      const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')
      
      return (
        <div key={fieldName} className="col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">{displayName}</label>
          <input
            type="text"
            value={String(safeValue)}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={modalIsLoading}
            placeholder={`Enter ${displayName.toLowerCase()}...`}
          />
          <div className="text-xs text-gray-500 mt-1">Value: "{String(safeValue)}"</div>
        </div>
      )
    }

    const handleUpdateResource = async () => {
      if (!modalUpdateId.trim()) return

      setModalIsLoading(true)
      try {
        await updateResource(modalUpdateId, { resource: modalUpdateData })
        handleClose()
        alert("Resource updated successfully")
      } catch (error) {
        console.error("Error updating resource:", error)
        alert("Error updating resource")
      } finally {
        setModalIsLoading(false)
      }
    }

    const handleClose = () => {
      setModalUpdateId("")
      setModalUpdateData(createDefaultResourceData())
      setIsUpdateModalOpen(false)
    }

    // Function to determine which fields to show based on resource type
  // Dynamic field detection based on API response
  const getDynamicFields = (resourceData: any) => {
    const fields: string[] = []
    
    // Check which metadata fields exist in the API response
    if (resourceData?.metadata) {
      const metadataKeys = Object.keys(resourceData.metadata)
      fields.push(...metadataKeys.filter(key => 
        !['tenantId', 'clientAppId', 'sourcedId'].includes(key) // Exclude internal fields
      ))
    }
    
    // Check which root level fields exist
    const rootFields = ['importance', 'vendorId', 'vendorResourceId', 'applicationId']
    rootFields.forEach(field => {
      if (resourceData?.[field] !== undefined) {
        fields.push(field)
      }
    })
    
    return [...new Set(fields)] // Remove duplicates
  }

  // Create dynamic resource data structure based on API response
  const createDynamicResourceData = (resourceData: any): ResourceData => {
    const dynamicMetadata: any = {}
    
    // Populate only the metadata fields that exist in the API response
    if (resourceData?.metadata) {
      Object.keys(resourceData.metadata).forEach(key => {
        if (!['tenantId', 'clientAppId', 'sourcedId'].includes(key)) {
          let value = resourceData.metadata[key]
          
          // Handle arrays
          if (Array.isArray(value)) {
            dynamicMetadata[key] = value
          }
          // Convert strings that look like arrays to actual arrays
          else if (typeof value === 'string' && (key === 'grades' || key === 'keywords')) {
            dynamicMetadata[key] = value.split(',').map(v => v.trim()).filter(v => v)
          }
          // Handle numbers
          else if (key === 'xp' || key === 'pageCount' || key === 'wordLength' || key === 'timeLength') {
            dynamicMetadata[key] = Number(value) || 0
          }
          // Handle booleans
          else if (key === 'captionsAvailable') {
            dynamicMetadata[key] = Boolean(value)
          }
          // Default to string
          else {
            dynamicMetadata[key] = value || ""
          }
        }
      })
    }
    
    return {
      title: resourceData.title || "",
      metadata: dynamicMetadata,
      importance: resourceData.importance || "",
      vendorId: resourceData.vendorId || "",
      vendorResourceId: resourceData.vendorResourceId || "",
      applicationId: resourceData.applicationId || "",
      roles: Array.isArray(resourceData.roles) ? resourceData.roles : 
             (resourceData.roles ? String(resourceData.roles).split(',').map(r => r.trim()).filter(r => r) : []),
    }
  }

    if (!isUpdateModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Update Resource</h3>
            <button onClick={handleClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resource ID Input */}
          <div className="mb-4">
            <div className="flex gap-3 mb-2">
              <div className="flex-grow">
                <label htmlFor="updateId" className="block text-sm font-medium text-slate-700 mb-2">
                  Resource ID
                </label>
                <input
                  type="text"
                  id="updateId"
                  value={modalUpdateId}
                  onChange={(e) => setModalUpdateId(e.target.value)}
                  placeholder="Enter resource ID to update..."
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={modalIsLoading}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleGetResourceForUpdate}
                  disabled={!modalUpdateId.trim() || modalIsLoading}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {modalIsLoading ? "Loading..." : "Get Data"}
                </button>
                <button
                  onClick={populateMockData}
                  disabled={modalIsLoading}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  Test Data
                </button>
              </div>
            </div>
            
            {/* Loading/Status Indicator */}
            {modalIsLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                <span className="text-sm text-blue-600">Fetching resource data...</span>
              </div>
            )}
            
            {!modalIsLoading && modalUpdateData.title && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <div className="text-sm text-green-700">
                      <strong>✓ Data loaded successfully!</strong>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Resource: "{modalUpdateData.title}" | Type: {modalUpdateData.metadata.type} | Fields prefilled and ready for editing
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {modalUpdateId.trim() && !modalIsLoading && !modalUpdateData.title && (
              <div className="text-sm text-gray-500">
                Auto-fetching data... (or click "Get Data" button)
              </div>
            )}
          </div>

          {/* Current Form State Display */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              <strong>� Current State:</strong>
              <div className="mt-1 text-xs font-mono">
                <div>Title: "{modalUpdateData.title}"</div>
                <div>Fields: [{dynamicFields.join(', ')}]</div>
                <div>Form Data Ready: {modalUpdateData.title ? 'YES' : 'NO'}</div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6" key={`form-${renderKey}-${modalUpdateData.title}`}>
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-slate-800 mb-4">Resource Information</h4>
              
              {/* Title Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {renderDynamicField('title', modalUpdateData.title)}
              </div>
              
              {/* Dynamic Fields */}
              {dynamicFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicFields.map(fieldName => {
                    let fieldValue
                    
                    if (['importance', 'vendorId', 'vendorResourceId', 'applicationId'].includes(fieldName)) {
                      fieldValue = modalUpdateData[fieldName as keyof ResourceData]
                    } else if (fieldName === 'roles') {
                      fieldValue = modalUpdateData.roles
                    } else {
                      fieldValue = modalUpdateData.metadata[fieldName]
                    }
                    
                    return renderDynamicField(fieldName, fieldValue)
                  })}
                </div>
              )}
              
              {dynamicFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Click "Get Data" to load resource fields</p>
                </div>
              )}
            </div>
          </div>          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              disabled={modalIsLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateResource}
              disabled={!modalUpdateId.trim() || modalIsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {modalIsLoading ? "Updating..." : "Update Resource"}
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
      
      {/* Update Modal */}
      <UpdateModal />
    </div>
  )
}
