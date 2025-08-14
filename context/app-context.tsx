"use client";

import { createContext, useState, useCallback, useEffect } from "react";
import { api, QTI_API_BASE_URL } from "../utils/api";
import { useToast } from "../components/toast/toast-context";

export const AppContext = createContext("light");

export const AppProvider = ({ children }) => {
  const { addToast }: any = useToast();
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || null;
    }
    return null;
  });
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
      return "dashboard";
    }
    return "login";
  });
  const [baseUrl, setBaseUrl] = useState();
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingCourseComponentId, setEditingCourseComponentId] =
    useState(null);
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allCourseComponents, setAllCourseComponents] = useState([]); // New state for all components
  const [coursePagination, setCoursePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [resourcePagination, setResourcePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [allCourseComponentsPagination, setAllCourseComponentsPagination] =
    useState({
      // New pagination state
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    });
  const [isLoading, setIsLoading] = useState(false);

  const handleApiCall = useCallback(
    async (apiFunction, ...args) => {
      setIsLoading(true);
      try {
        const result = await apiFunction(...args, authToken);
        setIsLoading(false);
        return result;
      } catch (err) {
        // Check if error is 401 (Unauthorized) and logout
        if (err.status === 401 || err.statusCode === 401 || 
            err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          logout();
          addToast("Session expired. Please login again.", "error");
        } else {
          addToast(err.message, "error");
        }
        setIsLoading(false);
        throw err;
      }
    },
    [authToken, addToast]
  );

  const fetchCourses = useCallback(
    async (page = 1, limit = coursePagination.limit) => {
      try {
        const offset = (page - 1) * limit;
        const result = await handleApiCall(api.getCourses, { limit, offset });
        if (result && result.courses) {
          const formattedCourses = result.courses.map((course) => ({
            id: course.sourcedId,
            title: course.title,
            units: [],
          }));
          setCourses(formattedCourses);
          setCoursePagination({
            currentPage: page,
            totalCount: result.totalCount || 0,
            totalPages: Math.ceil((result.totalCount || 0) / limit),
            limit,
          });
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    },
    [handleApiCall, coursePagination.limit]
  );

  const fetchResources = useCallback(
    async (page = 1, limit = resourcePagination.limit) => {
      try {
        const offset = (page - 1) * limit;
        const result = await handleApiCall(api.getResources, { limit, offset });
        if (result && result.resources) {
          setResources(result.resources);
          setResourcePagination({
            currentPage: page,
            totalCount: result.totalCount || 0,
            totalPages: Math.ceil((result.totalCount || 0) / limit),
            limit,
          });
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    },
    [handleApiCall, resourcePagination.limit]
  );
 
  // New function to fetch all course components
  const fetchAllCourseComponents = useCallback(
    async (page = 1, limit = allCourseComponentsPagination.limit) => {
      try {
        const offset = (page - 1) * limit;
        // Filter for active components directly in the API call
        const result = await handleApiCall(api.getAllCourseComponents, {
          limit,
          offset,
          filter: "status='active'",
        });
        if (result && result.courseComponents) {
          setAllCourseComponents(result.courseComponents);
          setAllCourseComponentsPagination({
            currentPage: page,
            totalCount: result.totalCount || 0,
            totalPages: Math.ceil((result.totalCount || 0) / limit),
            limit,
          });
        }
      } catch (err) {
        console.error("Failed to fetch all course components:", err);
      }
    },
    [handleApiCall, allCourseComponentsPagination.limit]
  );

  useEffect(() => {
    if (authToken) {
      fetchCourses(1, coursePagination.limit);
      fetchResources(1, resourcePagination.limit);
      fetchAllCourseComponents(1, allCourseComponentsPagination.limit); // Fetch all components on auth
    }
  }, [authToken, fetchCourses, fetchResources, fetchAllCourseComponents]);

  const login = (token) => {
    setAuthToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
    setView("dashboard");
  };

  const logout = () => {
    setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
    setView("login");
    setCourses([]);
    setAllCourseComponents([]); // Clear all components on logout
  };

  const addResource = async (resourceData: any) => {
    try {
     const metadata = JSON.parse(JSON.stringify(resourceData.metadata));

// Convert string to array of numbers for grades
if (metadata.grades && typeof metadata.grades === "string") {
  metadata.grades = metadata.grades
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10));
}

// Convert keywords to array of trimmed strings
if (metadata.keywords && typeof metadata.keywords === "string") {
  metadata.keywords = metadata.keywords.split(",").map((s) => s.trim());
}

// Convert numeric fields if they exist and are strings
const numberFields = ["xp", "pageCount", "wordLength"];
numberFields.forEach((field) => {
  if (metadata[field] && typeof metadata[field] === "string") {
    const num = Number(metadata[field]);
    if (!Number.isNaN(num)) {
      metadata[field] = num;
    }
  }
});

    

      const finalPayload = {
        resource: {
          status: "active",
          title: resourceData.title,
          vendorResourceId: resourceData.vendorResourceId,
          vendorId: resourceData.vendorId,
          applicationId: resourceData.applicationId,
          roles: resourceData.roles.split(",").map((s: any) => s.trim()),
          importance: resourceData.importance,
          metadata: metadata,
        },
      };

      if (finalPayload.resource.metadata.type === "qti") {
        const qtiIdentifier = `qti-ui-${Date.now()}`;

        if (finalPayload.resource.metadata.subType === "qti-stimulus") {
          const stimulusData = {
            identifier: qtiIdentifier,
            title: resourceData.title,
            content: resourceData.qtiContent,
          };
          const stimulus = await handleApiCall(
            api.createStimulus,
            stimulusData
          );
        } else if (finalPayload.resource.metadata.subType === "qti-") {
          const testData = {
            identifier: qtiIdentifier,
            title: resourceData.title,
            "qti-test-part": [],
          };
          const test = await handleApiCall(api.createAssessmentTest, testData);
        }

        finalPayload.resource.vendorResourceId = qtiIdentifier;
      }

      const newResourceResult = await handleApiCall(
        api.createOneRosterResource,
        finalPayload
      );
      if (newResourceResult) {
        addToast("Resource created successfully!", "success");
        fetchResources();
        return newResourceResult;
      }
    } catch (err) {
      console.error("Failed to add resource:", err);
    }
  };

  const addCourse = async (courseData) => {
    try {
      const newCoursePayload = {
        course: {
          ...courseData,
          status: "active",
          dateLastModified: new Date().toISOString(),
          metadata: { timebackVisible: "true" },
          grades: courseData.grades.split(",").map((s) => s.trim()),
          subjects: courseData.subjects.split(",").map((s) => s.trim()),
          subjectCodes: courseData.subjectCodes.split(",").map((s) => s.trim()),
        },
      };

      const result = await handleApiCall(api.createCourse, newCoursePayload);
      if (result && result.course) {
        addToast("Course created successfully!", "success");
        fetchCourses(1);
      }
    } catch (err) {
      console.error("Failed to create course:", err);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await handleApiCall(api.deleteCourse, courseId);
      addToast("Course deleted successfully!", "success");
      fetchCourses(coursePagination.currentPage);
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const updateCourse = async (courseId, componentsToCreate) => {
    try {
      for (const component of componentsToCreate) {
        const componentPayload = {
          courseComponent: {
            ...component,
            courseSourcedId: courseId,
            course: { sourcedId: courseId },
            parentComponent: component.parentId
              ? { sourcedId: component.parentId }
              : null,
          },
        };
        await handleApiCall(api.createCourseComponent, componentPayload);
      }

      addToast("Course structure updated successfully!", "success");
      fetchAllCourseComponents(allCourseComponentsPagination.currentPage); // Refresh all components after creating
    } catch (err) {
      console.error("Failed to update course:", err);
      addToast("Failed to update course structure.", "error");
    }
  };

  // New function to create a global course component
  const createGlobalCourseComponent = async (componentData) => {
    try {
      const componentPayload = {
        courseComponent: {
          ...componentData,
          status: "active",
          dateLastModified: new Date().toISOString(),
          // No courseSourcedId or parentComponent for global creation initially
        },
      };
      const result = await handleApiCall(
        api.createCourseComponent,
        componentPayload
      );
      if (result && result.courseComponent) {
        addToast("Component created successfully!", "success");
        fetchAllCourseComponents(1); // Refresh all components list
      }
    } catch (err) {
      console.error("Failed to create global course component:", err);
      addToast("Failed to create component.", "error");
    }
  };

  const associateResource = async (componentId, resourceId, title, sortOrder = 1) => {
    try {
      const payload = {
        componentResource: {
          sourcedId: `comp-res-${componentId}-${resourceId}-${Date.now()}`,
          status: "active",
          title: title,
          sortOrder: sortOrder,
          courseComponent: { sourcedId: componentId },
          resource: { sourcedId: resourceId },
        },
      };
      const result = await handleApiCall(api.associateResourceToCourse, payload);
      addToast("Resource associated successfully!", "success");
      return result;
    } catch (err) {
      console.error("Failed to associate resource:", err);
      addToast("Failed to associate resource.", "error");
      throw err;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      const result = await handleApiCall(api.deleteResource, resourceId);
      addToast("Resource deleted successfully!", "success");
      fetchResources(resourcePagination.currentPage);
      return result;
    } catch (err) {
      console.error("Failed to delete resource:", err);
      addToast("Failed to delete resource.", "error");
      throw err;
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      const result = await handleApiCall(api.updateOneRosterResource, resourceId, resourceData);
      addToast("Resource updated successfully!", "success");
      fetchResources(resourcePagination.currentPage);
      return result;
    } catch (err) {
      console.error("Failed to update resource:", err);
      addToast("Failed to update resource.", "error");
      throw err;
    }
  };

  const navigateTo = async (viewName, id = null) => {
    if (viewName === "courseComponentsViewss" && id) {
      setIsLoading(true);
      try {
        const courseData = courses.find((c) => c.id === id);
        if (!courseData) {
          addToast("Course not found.", "error");
          setIsLoading(false);
          return;
        }

        const componentsResult = await handleApiCall(
          api.getCourseComponents,
          id,
          { limit: 100, offset: 0 }
        );
        const components = componentsResult?.courseComponents || [];

        // const resourcesResult = await handleApiCall(
        //   api.getCourseComponentResources,
        //   id,
        //   {
        //     limit: 100,
        //     offset: 0,
        //   }
        // );
        // const associatedResources = resourcesResult?.componentResources || [];

        // const resourceMap = new Map(
        //   resources.map((res) => [res.sourcedId, res])
        // );

        const componentResourcesMap = new Map();
        // associatedResources.forEach((assoc) => {
        //   if (assoc.courseComponent?.sourcedId && assoc.resource?.sourcedId) {
        //     const resDetails = resourceMap.get(assoc.resource.sourcedId);
        //     if (resDetails) {
        //       if (!componentResourcesMap.has(assoc.courseComponent.sourcedId)) {
        //         componentResourcesMap.set(assoc.courseComponent.sourcedId, []);
        //       }
        //       componentResourcesMap
        //         .get(assoc.courseComponent.sourcedId)
        //         .push(resDetails);
        //     }
        //   }
        // });

        const componentMap = new Map(
          components.map((c) => [
            c.sourcedId,
            { ...c, children: [], resources: [] },
          ])
        );
        const rootComponents = [];

        components.forEach((component) => {
          const currentComponent = componentMap.get(component.sourcedId);
          if (currentComponent) {
            //@ts-ignore
            currentComponent.resources =
              componentResourcesMap.get(component.sourcedId) || [];

            if (component.parentComponent?.sourcedId) {
              const parent = componentMap.get(
                component.parentComponent.sourcedId
              );
              if (parent) {
                //@ts-ignore
                parent.children.push(currentComponent);
              } else {
                rootComponents.push(currentComponent);
              }
            } else {
              rootComponents.push(currentComponent);
            }
          }
        });

        rootComponents.forEach((unit) => {
          unit.children.sort((a, b) => a.sortOrder - b.sortOrder);
        });
        rootComponents.sort((a, b) => a.sortOrder - b.sortOrder);

        setEditingCourse({ ...courseData, units: rootComponents });
        setEditingCourseComponentId(null);
        setView(viewName);
      } catch (err) {
        console.error("Failed to fetch course components or resources:", err);
        addToast("Failed to load course details.", "error");
      } finally {
        setIsLoading(false);
      }
    } else if (viewName === "editCourseComponent" && id) {
      setEditingCourseComponentId(id);
      setView(viewName);
    } else if (viewName === "createGlobalCourseComponent") {
      // New case for global component creation
      setEditingCourse(null);
      setEditingCourseComponentId(null);
      setView(viewName);
    } else {
      setEditingCourse(null);
      setEditingCourseComponentId(id);
      setView(viewName);
    }
  };
  const fetchResourceBySourcedId = async (sourcedId: string) => {
    try {
      const result = await handleApiCall(api.getResource, sourcedId);
      if (result && result.resource) {
        return result.resource;
      }
      return null;
    } catch (err) {
      console.error("Error fetching resource by sourcedId:", err);
      addToast("Failed to fetch resource", "error");
      return null;
    }
  };

  const fetchComponentBySourcedId = async (sourcedId: string) => {
    try {
      const result = await handleApiCall(api.getCourseComponentById, sourcedId);
      if (result && result.courseComponent) {
        return result.courseComponent;
      }
      return null;
    } catch (err) {
      console.error("Error fetching component by sourcedId:", err);
      addToast("Failed to fetch component", "error");
      return null;
    }
  };
  const createUnit = async (unitData) => {
    try {
      console.log(unitData)
      const result = await handleApiCall(api.createCourseComponent, 
       unitData
      );
      console.log(result, "Response from createUnit");
      if (result && result.sourcedIdPairs) {
        addToast("Unit created successfully!", "success");
        fetchAllCourseComponents(1); // Refresh all components list
        return result;
      }
    } catch (err) {
      console.error("Failed to create unit:", err);
      addToast("Failed to create unit.", "error");
    }
  };
  const deleteQtiQuestion = async (identifier) => {
    try {
      await handleApiCall(api.deleteAssessmentItem, identifier);
      addToast("QTI question deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete QTI question:", err);
      addToast("Failed to delete QTI question.", "error");  
    }
  };
  const contextValue = {
    baseUrl,
    setBaseUrl,
    view,
    navigateTo,
    resources,
    addResource,
    deleteResource,
    updateResource,
    courses,
    addCourse,
    deleteCourse,
    updateCourse,
    editingCourse,
    editingCourseComponentId,
    login,
    logout,
    authToken,
    isLoading,
    coursePagination,
    fetchCourses,
    setCoursePagination,
    resourcePagination,
    fetchResources,
    setResourcePagination,
    allCourseComponents, // Expose all components
    allCourseComponentsPagination, // Expose all components pagination
    fetchAllCourseComponents, // Expose fetch function
    createGlobalCourseComponent, // Expose global component creation
    associateResource,
    handleApiCall,
    fetchResourceBySourcedId, // New function to fetch resource by sourcedId
    fetchComponentBySourcedId, // New function to fetch component by sourcedId
    createUnit, // New function to create a unit
    deleteQtiQuestion
  };
  return (
    //@ts-ignore

    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
