"use client"

import { useState } from "react"
import { ResourceData, createDefaultResourceData } from "@/types/resource"

interface UpdateResourceModalProps {
  isOpen: boolean
  resourceData: ResourceData | null
  resourceId: string
  onClose: () => void
  onUpdate: (data: ResourceData) => Promise<void>
  isLoading?: boolean
}

export const UpdateResourceModal = ({ 
  isOpen, 
  resourceData, 
  resourceId,
  onClose, 
  onUpdate,
  isLoading = false 
}: UpdateResourceModalProps) => {
  const [formData, setFormData] = useState<ResourceData>(resourceData || createDefaultResourceData())

  // Update form data when resourceData changes
  if (resourceData && resourceData.title && formData.title !== resourceData.title) {
    setFormData(resourceData)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    console.log(`🔄 Field change: ${fieldName} = ${value}`)
    
    setFormData(currentData => {
      const newData = { ...currentData }
      
      if (fieldName === 'title') {
        newData.title = String(value)
      } else if (fieldName === 'importance') {
        newData.importance = String(value)
      } else if (fieldName === 'vendorId') {
        newData.vendorId = String(value)
      } else if (fieldName === 'vendorResourceId') {
        newData.vendorResourceId = String(value)
      } else if (fieldName === 'applicationId') {
        newData.applicationId = String(value)
      } else if (fieldName === 'roles') {
        newData.roles = Array.isArray(value) ? value : String(value).split(',').map(s => s.trim())
      } else {
        // Metadata field
        newData.metadata = { ...newData.metadata, [fieldName]: value }
      }
      
      return newData
    })
  }

  const handleSubmit = async () => {
    if (!resourceId.trim()) return
    await onUpdate(formData)
  }

  const renderField = (fieldName: string, value: any) => {
    console.log(`🎨 Rendering field: ${fieldName} = ${value}`)
    
    const safeValue = value !== undefined && value !== null ? String(value) : ""
    const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')
    
    return (
      <div key={fieldName} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {displayName}
        </label>
        <input
          type="text"
          value={safeValue}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          placeholder={`Enter ${displayName.toLowerCase()}...`}
        />
      </div>
    )
  }

  if (!isOpen) return null

  // Get all available fields from the data
  const getAvailableFields = () => {
    const fields: string[] = []
    
    if (resourceData) {
      // Add title if exists
      if (resourceData.title) fields.push('title')
      
      // Add metadata fields
      if (resourceData.metadata) {
        Object.keys(resourceData.metadata).forEach(key => {
          if (!['tenantId', 'clientAppId', 'sourcedId'].includes(key)) {
            fields.push(key)
          }
        })
      }
      
      // Add root level fields
      ['importance', 'vendorId', 'vendorResourceId', 'applicationId', 'roles'].forEach(field => {
        if (resourceData[field as keyof ResourceData] !== undefined) {
          fields.push(field)
        }
      })
    }
    
    return fields
  }

  const availableFields = getAvailableFields()
  console.log("📋 Available fields for rendering:", availableFields)
  console.log("📦 Current form data:", formData)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <p><strong>Resource ID:</strong> {resourceId}</p>
          <p><strong>Has Data:</strong> {resourceData ? 'YES' : 'NO'}</p>
          <p><strong>Title:</strong> "{formData.title}"</p>
          <p><strong>Fields Count:</strong> {availableFields.length}</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availableFields.map(fieldName => {
            let fieldValue
            
            if (fieldName === 'title') {
              fieldValue = formData.title
            } else if (['importance', 'vendorId', 'vendorResourceId', 'applicationId'].includes(fieldName)) {
              fieldValue = formData[fieldName as keyof ResourceData]
            } else if (fieldName === 'roles') {
              fieldValue = Array.isArray(formData.roles) ? formData.roles.join(', ') : formData.roles
            } else {
              fieldValue = formData.metadata?.[fieldName]
            }
            
            return renderField(fieldName, fieldValue)
          })}
        </div>

        {/* No Fields Message */}
        {availableFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No fields available. Please fetch resource data first.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || availableFields.length === 0}
          >
            {isLoading ? 'Updating...' : 'Update Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}
