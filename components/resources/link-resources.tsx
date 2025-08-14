"use client"

import { useState, useContext, useEffect } from "react"
import { LinkIcon, RefreshCw, Folder, FileIcon, Search, Copy, Check, Edit, X } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"
import { api } from "../../utils/api"

export const LinkResources = () => {
  const {
    resources,
    allCourseComponents,
    associateResource,
    resourcePagination,
    fetchResources,
    setResourcePagination,
    allCourseComponentsPagination,
    fetchAllCourseComponents,
    setAllCourseComponentsPagination,
    fetchResourceBySourcedId,
    fetchComponentBySourcedId,
    handleApiCall,
    addToast
  } :any= useContext(AppContext)

  const [selectedResource, setSelectedResource] = useState(null)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [resourceSearchId, setResourceSearchId] = useState("")
  const [componentSearchId, setComponentSearchId] = useState("")
  const [isSearchingResource, setIsSearchingResource] = useState(false)
  const [isSearchingComponent, setIsSearchingComponent] = useState(false)
  const [displayedResources, setDisplayedResources] = useState([])
  const [displayedComponents, setDisplayedComponents] = useState([])
  const [sortOrder, setSortOrder] = useState("")
  const [linkResult, setLinkResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateData, setUpdateData] = useState({
    sourcedId: "",
    status: "",
    title: "",
    sortOrder: "",
    courseComponent: { sourcedId: "" },
    resource: { sourcedId: "" }
  })
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [updateResult, setUpdateResult] = useState(null)
  const [rawApiResponse, setRawApiResponse] = useState(null) // For debugging

  useEffect(() => {
    fetchAllCourseComponents(allCourseComponentsPagination.currentPage, allCourseComponentsPagination.limit)
  }, [allCourseComponentsPagination.currentPage, allCourseComponentsPagination.limit, fetchAllCourseComponents])

  useEffect(() => {
    setDisplayedResources(resources)
  }, [resources])

  useEffect(() => {
    setDisplayedComponents(allCourseComponents)
  }, [allCourseComponents])

  const handleCopy = () => {
    if (!linkResult) return
    navigator.clipboard.writeText(JSON.stringify(linkResult, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAssociate = async () => {
    if (selectedResource && selectedComponent && sortOrder.trim()) {
      try {
        const result = await associateResource(
          selectedComponent.sourcedId, 
          selectedResource.sourcedId, 
          selectedResource.title,
          parseInt(sortOrder)
        )
        setLinkResult(result)
        console.log(result)
        setSelectedResource(null)
        setSelectedComponent(null)
        setSortOrder("")
        setCopied(false)
      } catch (error) {
        addToast('Failed to associate resource', 'error')
      }
    }
  }

  const handleResourceLimitChange = (newLimit) => {
    setResourcePagination((prev) => ({ ...prev, limit: newLimit }))
    fetchResources(1, newLimit)
  }

  const handleComponentLimitChange = (newLimit) => {
    setAllCourseComponentsPagination((prev) => ({ ...prev, limit: newLimit }))
    fetchAllCourseComponents(1, newLimit)
  }

  const handleResourceSearch = async () => {
    if (!resourceSearchId.trim()) {
      addToast('Please enter a resource ID', 'warning')
      return
    }
    
    setIsSearchingResource(true)
    try {
      const resource = await fetchResourceBySourcedId(resourceSearchId.trim())
      if (resource) {
        setSelectedResource(resource)
        // Add to displayed resources if not already present
        if (!resources.some(r => r.sourcedId === resource.sourcedId)) {
          setDisplayedResources([resource, ...resources])
        }
        addToast('Resource found!', 'success')
      } else {
        addToast('Resource not found', 'warning')
      }
    } catch (error) {
      addToast('Error searching for resource', 'error')
    } finally {
      setIsSearchingResource(false)
    }
  }

  const handleComponentSearch = async () => {
    if (!componentSearchId.trim()) {
      addToast('Please enter a component ID', 'warning')
      return
    }
    
    setIsSearchingComponent(true)
    try {
      const component = await fetchComponentBySourcedId(componentSearchId.trim())
      if (component) {
        setSelectedComponent(component)
        // Add to displayed components if not already present
        if (!allCourseComponents.some(c => c.sourcedId === component.sourcedId)) {
          setDisplayedComponents([component, ...allCourseComponents])
        }
        addToast('Component found!', 'success')
      } else {
        addToast('Component not found', 'warning')
      }
    } catch (error) {
      addToast('Error searching for component', 'error')
    } finally {
      setIsSearchingComponent(false)
    }
  }

  const handleGetResourceComponent = async () => {
    if (!updateData.sourcedId.trim()) {
      addToast('Please enter a resource component ID', 'warning')
      return
    }

    setIsLoadingUpdate(true)
    try {
      const result = await handleApiCall(api.getResourceComponent, updateData.sourcedId.trim())
      console.log('API Response:', result) // Debug log
      setRawApiResponse(result) // Store for debugging
      
      if (result) {
        // Handle different possible response structures
        const data = result.componentResource || result.resourceComponent || result
        console.log('Extracted data:', data) // Debug log
        
        setUpdateData({
          sourcedId: data.sourcedId || updateData.sourcedId,
          status: data.status || "",
          title: data.title || "",
          sortOrder: data.sortOrder?.toString() || "",
          courseComponent: { 
            sourcedId: data.courseComponent?.sourcedId || "" 
          },
          resource: { 
            sourcedId: data.resource?.sourcedId || "" 
          }
        })
        addToast('Resource component data loaded!', 'success')
      } else {
        addToast('Resource component not found', 'warning')
      }
    } catch (error) {
      console.error('Error fetching resource component:', error)
      addToast('Error fetching resource component', 'error')
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const handleUpdateResourceComponent = async () => {
    if (!updateData.sourcedId.trim()) {
      addToast('Please get data first by entering an ID and clicking Get Data', 'warning')
      return
    }

    setIsLoadingUpdate(true)
    try {
      const payload = {
        componentResource: {
          sourcedId: updateData.sourcedId,
          status: updateData.status,
          title: updateData.title,
          sortOrder: parseInt(updateData.sortOrder),
          courseComponent: { sourcedId: updateData.courseComponent.sourcedId },
          resource: { sourcedId: updateData.resource.sourcedId }
        }
      }

      // This would be an API call to update resource component
      const result = await handleApiCall(api.updateResourceComponent, updateData.sourcedId, payload)
      setUpdateResult(result)
      addToast('Resource component updated successfully!', 'success')
    } catch (error) {
      addToast('Error updating resource component', 'error')
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const resetUpdateModal = () => {
    setUpdateData({
      sourcedId: "",
      status: "",
      title: "",
      sortOrder: "",
      courseComponent: { sourcedId: "" },
      resource: { sourcedId: "" }
    })
    setUpdateResult(null)
    setRawApiResponse(null)
    setIsUpdateModalOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Link Resources to Components</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Edit className="w-5 h-5" /> Update Resource Component
          </button>
          <button
            onClick={() => {
              fetchResources(resourcePagination.currentPage)
              fetchAllCourseComponents(allCourseComponentsPagination.currentPage)
              setResourceSearchId("")
              setComponentSearchId("")
              setLinkResult(null)
              setCopied(false)
              addToast('Lists refreshed', 'success')
            }}
            className="flex items-center gap-2 bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className="w-5 h-5" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resources Column */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold text-slate-700">1. Select a Resource</h3>
            <p className="text-sm text-slate-500">Total: {resourcePagination.totalCount} resources</p>
            
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by sourcedId"
                  value={resourceSearchId}
                  onChange={(e) => setResourceSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResourceSearch()}
                  className="pl-10 w-full py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleResourceSearch}
                disabled={isSearchingResource || !resourceSearchId.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center"
              >
                {isSearchingResource ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2 h-80 overflow-y-auto">
              {displayedResources.map((res) => (
                <div
                  key={res.sourcedId}
                  onClick={() => setSelectedResource(res)}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedResource?.sourcedId === res.sourcedId
                      ? "bg-blue-100 border-blue-500 shadow-md"
                      : "bg-slate-50 border-transparent hover:border-blue-300 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-medium text-slate-800">{res.title}</div>
                  <div className="text-sm text-slate-500">{res.metadata?.type || "Unknown"}</div>
                  <div className="text-xs text-slate-400 font-mono">{res.sourcedId}</div>
                </div>
              ))}
              {displayedResources.length === 0 && (
                <div className="text-center py-8 text-slate-500">No resources found</div>
              )}
            </div>
          </div>

          {resourcePagination.totalCount > 0 && (
            <Pagination
              pagination={resourcePagination}
              onPageChange={(page) => fetchResources(page)}
              onLimitChange={handleResourceLimitChange}
            />
          )}
        </div>

        {/* All Course Components Column */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold text-slate-700">2. Select a Course Component</h3>
            <p className="text-sm text-slate-500">Total: {allCourseComponentsPagination.totalCount} components</p>
            
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by sourcedId"
                  value={componentSearchId}
                  onChange={(e) => setComponentSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComponentSearch()}
                  className="pl-10 w-full py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleComponentSearch}
                disabled={isSearchingComponent || !componentSearchId.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center"
              >
                {isSearchingComponent ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2 h-80 overflow-y-auto">
              {displayedComponents.map((component) => (
                <div
                  key={component.sourcedId}
                  onClick={() => setSelectedComponent(component)}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedComponent?.sourcedId === component.sourcedId
                      ? "bg-blue-100 border-blue-500 shadow-md"
                      : "bg-slate-50 border-transparent hover:border-blue-300 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-medium text-slate-800 flex items-center gap-2">
                    {component.type === "unit" ? (
                      <Folder className="w-4 h-4 text-sky-500" />
                    ) : (
                      <FileIcon className="w-4 h-4 text-slate-400" />
                    )}
                    {component.title}
                  </div>
                  <div className="text-sm text-slate-500">Type: {component.type}</div>
                  <div className="text-xs text-slate-400 font-mono">{component.sourcedId}</div>
                </div>
              ))}
              {displayedComponents.length === 0 && (
                <div className="text-center py-8 text-slate-500">No components found</div>
              )}
            </div>
          </div>

          {allCourseComponentsPagination.totalCount > 0 && (
            <Pagination
              pagination={allCourseComponentsPagination}
              onPageChange={(page) => fetchAllCourseComponents(page)}
              onLimitChange={handleComponentLimitChange}
            />
          )}
        </div>
      </div>

      {/* Association Action */}
      <div className="mt-8 flex justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 w-full max-w-2xl">
          {selectedResource && selectedComponent && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Ready to Associate:</h4>
              <p className="text-sm text-green-700">
                <strong>Resource:</strong> {selectedResource.title}
              </p>
              <p className="text-sm text-green-700">
                <strong>Component:</strong> {selectedComponent.title} ({selectedComponent.type})
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700 mb-2">
              Sort Order *
            </label>
            <input
              type="number"
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="1"
              required
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter sort order (e.g., 1, 2, 3...)"
            />
            <p className="text-xs text-slate-500 mt-1">Required: Determines the order in which resources appear in the component</p>
          </div>

          <button
            onClick={handleAssociate}
            disabled={!selectedResource || !selectedComponent || !sortOrder.trim()}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-md transition-all"
          >
            <LinkIcon className="w-5 h-5" />
            Associate Resource to Component
          </button>
        </div>
      </div>

      {/* Link Result Display */}
      {linkResult && (
        <div className="mt-6 flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Association Successful!
            </h3>

            {/* Display Source IDs if available */}
            {linkResult.sourcedIdPairs && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-white border border-green-300 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Supplied Source ID:</span>
                    <code className="block text-xs text-blue-600 mt-1">{linkResult.sourcedIdPairs.suppliedSourcedId}</code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkResult.sourcedIdPairs.suppliedSourcedId)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border border-green-300 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Allocated Source ID:</span>
                    <code className="block text-xs text-purple-600 mt-1">{linkResult.sourcedIdPairs.allocatedSourcedId}</code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkResult.sourcedIdPairs.allocatedSourcedId)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-white border border-green-300 rounded-md mb-4">
              <span className="text-sm text-gray-700">Copy Full Result</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-700 mb-2">Full Association Result:</h4>
              <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                {JSON.stringify(linkResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Update Resource Component Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Update Resource Component</h3>
              <button
                onClick={resetUpdateModal}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Section */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label htmlFor="updateSourcedId" className="block text-sm font-medium text-slate-700 mb-2">
                Resource Component ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="updateSourcedId"
                  value={updateData.sourcedId}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, sourcedId: e.target.value }))}
                  placeholder="Enter resource component ID..."
                  className="flex-1 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingUpdate}
                />
                <button
                  onClick={handleGetResourceComponent}
                  disabled={!updateData.sourcedId.trim() || isLoadingUpdate}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {isLoadingUpdate ? 'Loading...' : 'Get Data'}
                </button>
              </div>
            </div>

            {/* Data Loaded Indicator */}
            {(updateData.status || updateData.title || updateData.sortOrder || updateData.courseComponent.sourcedId || updateData.resource.sourcedId) && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-2">
                  ✅ Data loaded successfully! You can now edit the fields below.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                  {updateData.status && <div>• Status: {updateData.status}</div>}
                  {updateData.title && <div>• Title: {updateData.title.substring(0, 50)}...</div>}
                  {updateData.sortOrder && <div>• Sort Order: {updateData.sortOrder}</div>}
                  {updateData.courseComponent.sourcedId && <div>• Course Component: {updateData.courseComponent.sourcedId}</div>}
                  {updateData.resource.sourcedId && <div>• Resource: {updateData.resource.sourcedId}</div>}
                </div>
              </div>
            )}

            {/* Debug Section - Raw API Response */}
            {rawApiResponse && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <details>
                  <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
                    🔧 Debug: Raw API Response (Click to expand)
                  </summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(rawApiResponse, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingUpdate}
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="tobedeleted">To Be Deleted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={updateData.title}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter title..."
                  disabled={isLoadingUpdate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={updateData.sortOrder}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sort order..."
                  min="1"
                  disabled={isLoadingUpdate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Component ID
                </label>
                <input
                  type="text"
                  value={updateData.courseComponent.sourcedId}
                  onChange={(e) => setUpdateData(prev => ({ 
                    ...prev, 
                    courseComponent: { ...prev.courseComponent, sourcedId: e.target.value }
                  }))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter course component ID..."
                  disabled={isLoadingUpdate}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resource ID
                </label>
                <input
                  type="text"
                  value={updateData.resource.sourcedId}
                  onChange={(e) => setUpdateData(prev => ({ 
                    ...prev, 
                    resource: { ...prev.resource, sourcedId: e.target.value }
                  }))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter resource ID..."
                  disabled={isLoadingUpdate}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mb-4">
              <button
                onClick={resetUpdateModal}
                className="px-6 py-3 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                disabled={isLoadingUpdate}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateResourceComponent}
                disabled={!updateData.sourcedId.trim() || isLoadingUpdate}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isLoadingUpdate ? 'Updating...' : 'Update Resource Component'}
              </button>
            </div>

            {/* Update Result */}
            {updateResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Update Successful!</h4>
                <div className="bg-white rounded p-3 border border-green-300">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(updateResult, null, 2)}
                  </pre>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(updateResult, null, 2))
                      addToast('Result copied to clipboard!', 'success')
                    }}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Result
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}