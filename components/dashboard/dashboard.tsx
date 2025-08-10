"use client"

import { useContext } from "react"
import { Library, Briefcase } from "lucide-react"
import { AppContext } from "../../context/app-context"

export const Dashboard = () => {
  const { navigateTo }:any = useContext(AppContext)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <h2 className="text-3xl font-bold mb-4 text-slate-800">Welcome Back!</h2>
        <p className="text-slate-600 mb-8">
          You are logged in. Use the navigation to manage your resources and courses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigateTo("library")}
            className="group bg-slate-800 text-white p-6 rounded-lg hover:bg-blue-600 transition-all text-left shadow-lg hover:shadow-xl"
          >
            <Library className="w-8 h-8 mb-3 text-sky-300 group-hover:text-white transition-colors" />
            <h3 className="font-bold text-lg">Go to Resource Library</h3>
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Create and manage articles, videos, and quizzes.
            </p>
          </button>

          <button
            onClick={() => navigateTo("courses")}
            className="group bg-slate-800 text-white p-6 rounded-lg hover:bg-blue-600 transition-all text-left shadow-lg hover:shadow-xl"
          >
            <Briefcase className="w-8 h-8 mb-2 text-green-300 group-hover:text-white transition-colors" />
            <h3 className="font-bold text-lg">Go to Course Builder</h3>
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Design courses and assemble lessons.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
