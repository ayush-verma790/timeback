"use client"

import { useState, useContext, useEffect } from "react"
import { LinkIcon, RefreshCw, Folder, FileIcon, Search, Copy, Check } from "lucide-react"
import { AppContext } from "../../context/app-context"
import { Pagination } from "../common/pagination"

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Link Resources to Components</h2>
        <div className="flex gap-2">
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
    </div>
  )
}