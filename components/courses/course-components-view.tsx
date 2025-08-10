// "use client";

// import { useState, useContext, useEffect } from "react";
// import { ArrowLeft, Save, Plus } from "lucide-react";
// import { AppContext } from "../../context/app-context";
// import { ComponentForm } from "./component-form";
// import { CourseComponentCard } from "./course-component-card";

// export const CourseComponentsView = () => {
//   const {
//     navigateTo,
//     editingCourse,
//     updateCourse,
//     editingCourseComponentId,
//   }: any = useContext(AppContext);
//   const [courseState, setCourseState] = useState(editingCourse);
//   const [pendingNewComponents, setPendingNewComponents] = useState([]);
//   const [showUnitForm, setShowUnitForm] = useState(false);
//   console.log(editingCourseComponentId, "dndndjdjdjdjdj");
//   useEffect(() => {
//     if (editingCourse) {
//       setCourseState(JSON.parse(JSON.stringify(editingCourse)));
//     }
//   }, [editingCourse]);

//   // if (!courseState) return <div className="text-center">Loading course details...</div>

//   const handleAddUnit = (unitData) => {
//     const newUnit = { ...unitData, type: "unit", children: [], resources: [] };
//     setCourseState((prev) => ({
//       ...prev,
//       units: [...(prev?.units || []), newUnit],
//     }));
//     setPendingNewComponents((prev) => [...prev, newUnit]);
//     setShowUnitForm(false);
//   };

//   const handleAddTopic = (topicData) => {
//     const updatedCourse = { ...courseState };
//     const findAndAddTopic = (components, parentId, topic) => {
//       if (!components) return false;
//       for (const comp of components) {
//         if (comp.sourcedId === parentId) {
//           const newTopic = {
//             ...topic,
//             type: "topic",
//             children: [],
//             resources: [],
//           };
//           comp.children.push(newTopic);
//           setPendingNewComponents((prev) => [...prev, newTopic]);
//           return true;
//         }
//         if (comp.children && findAndAddTopic(comp.children, parentId, topic)) {
//           return true;
//         }
//       }
//       return false;
//     };

//     findAndAddTopic(updatedCourse.units, topicData.parentId, topicData);
//     setCourseState(updatedCourse);
//   };

//   const handleSaveCourse = async () => {
//     await updateCourse(courseState.id, pendingNewComponents);
//     setPendingNewComponents([]);
//     navigateTo("courseComponentsView", courseState.id);
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-4">
//         <button
//           onClick={() => navigateTo("courses")}
//           className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
//         >
//           <ArrowLeft className="w-4 h-4" /> Back
//         </button>
//          <button
//             onClick={() => navigateTo("createGlobalCourseComponent")} // New button to create global component
//             className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
//           >
//             <Plus className="w-5 h-5" /> Create Component
//           </button>
//         <button
//           onClick={handleSaveCourse}
//           className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
//         >
//           <Save className="w-5 h-5" /> Save Course
//         </button>
//       </div>

//       <h2 className="text-3xl font-bold mb-6 text-slate-800">
//         {courseState?.title}
//       </h2>
//     </div>
//   );
// };
"use client";

import { useState, useContext, useEffect } from "react";
import { ArrowLeft, Save, Plus, ClipboardCopy } from "lucide-react";
import { AppContext } from "../../context/app-context";
import { ComponentForm } from "./component-form";
import { CourseComponentCard } from "./course-component-card";

export const CourseComponentsView = () => {
  const {
    navigateTo,
    editingCourse,
    updateCourse,
    editingCourseComponentId,
    createGlobalCourseComponent,
    createUnit
  }: any = useContext(AppContext);
  const [courseState, setCourseState] = useState(editingCourse);
  const [pendingNewComponents, setPendingNewComponents] = useState([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showGlobalComponentForm, setShowGlobalComponentForm] = useState(false);
  const [showSubcomponentForm, setShowSubcomponentForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    sortOrder: 1,
    unlockDate: "",
    prerequisiteCriteria: "ALL",
    prerequisites: [],
  });
  const [subcomponentFormData, setSubcomponentFormData] = useState({
    title: "",
    sortOrder: 1,
    unlockDate: "",
    prerequisiteCriteria: "ALL",
    prerequisites: [],
    parentComponent: "",
  });
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setCourseState(JSON.parse(JSON.stringify(editingCourse)));
    }
  }, [editingCourse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubcomponentInputChange = (e) => {
    const { name, value } = e.target;
    setSubcomponentFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateGlobalComponent = async () => {
    try {
      const payload = {
        courseComponent: {
          ...formData,
          sourcedId: `new-${Date.now()}`,
          status: "active",
          dateLastModified: new Date().toISOString(),
          courseSourcedId: editingCourseComponentId,
          course: { sourcedId: editingCourseComponentId },
          parentComponent: null,
          prerequisites: formData.prerequisites,
          prerequisiteCriteria: formData.prerequisiteCriteria,
          unlockDate: formData.unlockDate
            ? new Date(formData.unlockDate).toISOString()
            : null,
        },
      };

      const res = await createUnit(payload);
      setResponse(res); // Save the response to state
      setCopied(false); // Reset copied state
      setShowGlobalComponentForm(false);
      setFormData({
        title: "",
        sortOrder: 1,
        unlockDate: "",
        prerequisiteCriteria: "ALL",
        prerequisites: [],
      });
    } catch (error) {
      // toast.error("Failed to create global component");
      console.error(error);
    }
  };

  const handleCreateSubcomponent = async () => {
    // Validate that parent component is provided
    if (!subcomponentFormData.parentComponent || !subcomponentFormData.parentComponent.trim()) {
      alert("Parent Component is required for subcomponents");
      return;
    }

    try {
      const payload = {
        courseComponent: {
          ...subcomponentFormData,
          sourcedId: `new-${Date.now()}`,
          status: "active",
          dateLastModified: new Date().toISOString(),
          courseSourcedId: editingCourseComponentId,
          course: { sourcedId: editingCourseComponentId },
          parent: subcomponentFormData.parentComponent 
            ? { sourcedId: subcomponentFormData.parentComponent }
            : null,
          prerequisites: subcomponentFormData.prerequisites,
          prerequisiteCriteria: subcomponentFormData.prerequisiteCriteria,
          unlockDate: subcomponentFormData.unlockDate
            ? new Date(subcomponentFormData.unlockDate).toISOString()
            : null,
        },
      };

      const res = await createUnit(payload);
      setResponse(res); // Save the response to state
      setCopied(false); // Reset copied state
      setShowSubcomponentForm(false);
      setSubcomponentFormData({
        title: "",
        sortOrder: 1,
        unlockDate: "",
        prerequisiteCriteria: "ALL",
        prerequisites: [],
        parentComponent: "",
      });
    } catch (error) {
      // toast.error("Failed to create subcomponent");
      console.error(error);
    }
  };

  const handleCopyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
    }
  };

  // ... rest of your existing functions (handleAddUnit, handleAddTopic, handleSaveCourse)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateTo("courses")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => setShowGlobalComponentForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Component
          </button>
          <button
            onClick={() => setShowSubcomponentForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Subcomponent
          </button>
          <button
            // onClick={handleSaveCourse}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
          >
            <Save className="w-5 h-5" /> Save Course
          </button>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-slate-800">
        {courseState?.title}
      </h2>

      {/* Show response if available */}
      {response && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Response</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{JSON.stringify(response.sourcedIdPairs.allocatedSourcedId, null, 2)}</code>
          </pre>
          {!copied ? (
            <button
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
              onClick={handleCopyResponse}
            >
              <ClipboardCopy className="w-4 h-4" /> Copy Response
            </button>
          ) : (
            <button
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm cursor-default"
              disabled
            >
              Copied!
            </button>
          )}
          {/* Only show "Back" and "Save" after copy */}
          {copied && (
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setResponse(null)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                // Add your save logic here if needed
                onClick={() => {
                  // Example: handleSaveCourse();
                  setResponse(null);
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Component Form Modal */}
      {showGlobalComponentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create Global Component</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unlock Date
                </label>
                <input
                  type="datetime-local"
                  name="unlockDate"
                  value={formData.unlockDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisite Criteria
                </label>
                <select
                  name="prerequisiteCriteria"
                  value={formData.prerequisiteCriteria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">ALL</option>
                  <option value="ANY">ANY</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

              {/* Note: You might want to add a more sophisticated way to handle prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites (comma separated IDs)
                </label>
                <input
                  type="text"
                  name="prerequisites"
                  value={formData.prerequisites.join(",")}
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .filter((id) => id.trim());
                    setFormData((prev) => ({
                      ...prev,
                      prerequisites: ids,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="comp1,comp2,comp3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGlobalComponentForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGlobalComponent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcomponent Form Modal */}
      {showSubcomponentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create Subcomponent</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={subcomponentFormData.title}
                  onChange={handleSubcomponentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Component <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="parentComponent"
                  value={subcomponentFormData.parentComponent}
                  onChange={handleSubcomponentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter parent component ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={subcomponentFormData.sortOrder}
                  onChange={handleSubcomponentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unlock Date
                </label>
                <input
                  type="datetime-local"
                  name="unlockDate"
                  value={subcomponentFormData.unlockDate}
                  onChange={handleSubcomponentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisite Criteria
                </label>
                <select
                  name="prerequisiteCriteria"
                  value={subcomponentFormData.prerequisiteCriteria}
                  onChange={handleSubcomponentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">ALL</option>
                  <option value="ANY">ANY</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites (comma separated IDs)
                </label>
                <input
                  type="text"
                  name="prerequisites"
                  value={subcomponentFormData.prerequisites.join(",")}
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .filter((id) => id.trim());
                    setSubcomponentFormData((prev) => ({
                      ...prev,
                      prerequisites: ids,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="comp1,comp2,comp3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSubcomponentForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubcomponent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Subcomponent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
