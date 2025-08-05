"use client"

import { useContext } from "react"
import { ToastProvider } from "./components/toast/toast-context"
import { AppProvider, AppContext } from "./context/app-context"
import { LoginScreen } from "./components/auth/login-screen"
import { LoadingSpinner } from "./components/common/loading-spinner"
import { Header } from "./components/common/header"
import { Dashboard } from "./components/dashboard/dashboard"
import { ResourceLibrary } from "./components/resources/resource-library"
import { CreateResource } from "./components/resources/create-resource"
import { LinkResources } from "./components/resources/link-resources"
import { CourseBuilder } from "./components/courses/course-builder"
import { CreateCourse } from "./components/courses/create-course"
import { CourseComponentsView } from "./components/courses/course-components-view"
import { EditCourseComponent } from "./components/courses/edit-course-component"
import { CreateGlobalCourseComponent } from "./components/courses/create-global-course-component" // New import
import { AssignmentCreator } from "./components/assignments/assignment-creator"

const AppContent = () => {
  const { view, authToken, isLoading }:any = useContext(AppContext)

  const renderView = () => {
    if (!authToken) return <LoginScreen />

    switch (view) {
      case "library":
        return <ResourceLibrary />
      case "courses":
        return <CourseBuilder />
      case "linkResources":
        return <LinkResources />
      case "createResource":
        return <CreateResource />
      case "createCourse":
        return <CreateCourse />
      case "courseComponentsView":
        return <CourseComponentsView />
      case "editCourseComponent":
        return <EditCourseComponent />
      case "createGlobalCourseComponent": // New case
        return <CreateGlobalCourseComponent />
      case "assignments":
        return <AssignmentCreator />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      {authToken && <Header />}
      <main className="p-4 sm:p-6 lg:p-8">
        {isLoading && <LoadingSpinner />}
        {renderView()}
      </main>
    </div>
  )
}

const App = () => (
  <ToastProvider>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ToastProvider>
)

export default App
