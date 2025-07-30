"use client"

import { useState } from "react"
import { InputField } from "../common/input-field"

export const ComponentForm = ({ type, parentId = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sourcedId: `${type.toLowerCase()}-ui-${Date.now()}`,
    title: "",
    sortOrder: 1,
    unlockDate: "",
  })

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target
    setFormData((prev) => ({ ...prev, [name]: inputType === "number" ? Number.parseInt(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalData = {
      ...formData,
      status: "active",
      dateLastModified: new Date().toISOString(),
      unlockDate: formData.unlockDate ? new Date(formData.unlockDate).toISOString() : null,
      ...(parentId && { parentId: parentId }),
    }
    onSave(finalData)
  }

  return (
    <div className="bg-slate-100 p-4 rounded-lg mt-4 border border-slate-300">
      <h5 className="font-bold mb-3 text-slate-700">New {type}</h5>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Sourced ID (Non-editable)</label>
          <p className="mt-1 text-sm p-2 bg-slate-200 rounded-md text-slate-600">{formData.sourcedId}</p>
        </div>

        <InputField label="Title" name="title" value={formData.title} onChange={handleChange} />
        <InputField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={handleChange}
        />
        <InputField
          label="Unlock Date (Optional)"
          name="unlockDate"
          type="datetime-local"
          value={formData.unlockDate}
          onChange={handleChange}
          required={false}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-slate-700 px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm font-semibold"
          >
            Save {type}
          </button>
        </div>
      </form>
    </div>
  )
}
