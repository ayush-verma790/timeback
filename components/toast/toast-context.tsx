"use client"

import { useState, createContext, useContext, useMemo, useEffect, useCallback } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

const ToastContext = createContext("light")

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    //@ts-ignore
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const typeClasses = {
    success: "border-green-500",
    error: "border-red-500",
    info: "bg-blue-500",
  }

  const Icon = {
    success: <CheckCircle className="h-6 w-11 text-white" />,
    error: <AlertCircle className="h-6 w-6 text-white" />,
    info: <AlertCircle className="h-6 w-6 text-white" />,
  }

  return (
   <div
  className={`w-full bg-white shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all animate-in slide-in-from-top-full`}
  style={{ minWidth: '300px', maxWidth: '100%' }}
>

      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 p-2 rounded-full ${typeClasses[type] || "bg-gray-500"}`}>{Icon[type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-gray-900">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={onClose} className="inline-flex text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
