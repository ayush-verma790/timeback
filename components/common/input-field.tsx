"use client"

export const InputField = ({ label, name, value, onChange, type = "text", required = true }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  </div>
)
