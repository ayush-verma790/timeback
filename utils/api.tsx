const QTI_API_BASE_URL = "https://qti.alpha-1edtech.com/api";
const ONEROSTER_API_BASE_URL = "https://api.alpha-1edtech.com";
//@ts-ignore
export const api = {
  authFetch: async (url, options = {}, token) => {
    //@ts-ignore
    const headers = { Accept: "application/json", ...options.headers };
    if (
      //@ts-ignore
      options.method && !["GET", "HEAD"].includes(options.method.toUpperCase())
    ) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "An unknown error occurred" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) return response.json();
    return null;
  },

  // QTI API calls with pagination
  createStimulus: (d, t) =>
    api.authFetch(
      `${QTI_API_BASE_URL}/stimuli`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  getStimuli: (params = {}, t) => {
    const { offset = 0, limit = 10, ...otherParams }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...otherParams,
    });
    return api.authFetch(
      `${QTI_API_BASE_URL}/stimuli?${queryParams.toString()}`,
      {},
      t
    );
  },

  createAssessmentItem: (d, t) =>
    api.authFetch(
      `${QTI_API_BASE_URL}/assessment-items`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  getAssessmentItems: (params = {}, t) => {
    const { offset = 0, limit = 3000, ...otherParams }: any = params;
    const queryParams = new URLSearchParams({
      page: offset.toString(),
      limit: 1000,
      ...otherParams,
    });
    return api.authFetch(
      `${QTI_API_BASE_URL}/assessment-items?${queryParams.toString()}`,
      {},
      t
    );
  },
  deleteAssessmentItem: (identifier, t) =>
    api.authFetch(
      `${QTI_API_BASE_URL}/assessment-items/${identifier}`,
      { method: "DELETE" },
      t
    ),

  createAssessmentTest: (d, t) =>
    api.authFetch(
      `${QTI_API_BASE_URL}/assessment-tests`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  getAssessmentTests: (params = {}, t) => {
    const { offset = 0, limit = 10, ...otherParams }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...otherParams,
    });
    return api.authFetch(
      `${QTI_API_BASE_URL}/assessment-tests?${queryParams.toString()}`,
      {},
      t
    );
  },

  // OneRoster API calls with pagination
  getCourses: (params = {}, t) => {
    const {
      offset = 0,
      limit = 10,
      filter = "status='active' AND metadata.timebackVisible='true'",
      ...otherParams
    }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      filter,
      ...otherParams,
    });
    return api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses?${queryParams.toString()}`,
      {},
      t
    );
  },

  getCourseComponents: (courseId, params = {}, t) => {
    const { offset = 0, limit = 50, ...otherParams }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...otherParams,
    });
    return api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/${courseId}/components?${queryParams.toString()}`,
      {},
      t
    );
  },

  // New API call to get all course components with filter
  getAllCourseComponents: (params = {}, t) => {
    const {
      offset = 0,
      limit = 10,
      filter = "status='active'",
      ...otherParams
    }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      filter,
      ...otherParams,
    });
    return api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/components?${queryParams.toString()}`,
      {},
      t
    );
  },

  getCourseComponentResources: (courseId, params = {}, t) => {
    const { offset = 0, limit = 50, ...otherParams }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...otherParams,
    });
    return api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/component-resources?${queryParams.toString()}&filter=course.sourcedId='${courseId}'`,
      {},
      t
    );
  },

  getCourseComponent: (sourcedId, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/components/${sourcedId}`,
      {},
      t
    ),

  createCourse: (d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  createCourseComponent: (d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/components`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  deleteCourse: (id, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/${id}`,
      { method: "DELETE" },
      t
    ),

  deleteResource: (id, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/resources/v1p2/resources/${id}`,
      { method: "DELETE" },
      t
    ),

  getResources: (params = {}, t) => {
    const {
      offset = 0,
      limit = 10,
      filter = "status='active'",
      ...otherParams
    }: any = params;
    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      filter,
      ...otherParams,
    });
    return api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/resources/v1p2/resources?${queryParams.toString()}`,
      {},
      t
    );
  },

  createOneRosterResource: (d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/resources/v1p2/resources`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),

  associateResourceToCourse: (d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/component-resources`,
      { method: "POST", body: JSON.stringify(d) },
      t
    ),
  getResource: (sourcedId, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/resources/v1p2/resources/${sourcedId}`,
      {},
      t
    ),

  updateOneRosterResource: (sourcedId, d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/resources/v1p2/resources/${sourcedId}`,
      { method: "PUT", body: JSON.stringify(d) },
      t
    ),

  getCourseComponentById: (sourcedId, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/components/${sourcedId}`,
      {},
      t
    ),

  getResourceComponent: (sourcedId, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/component-resources/${sourcedId}`,
      {},
      t
    ),

  updateResourceComponent: (sourcedId, d, t) =>
    api.authFetch(
      `${ONEROSTER_API_BASE_URL}/ims/oneroster/rostering/v1p2/courses/component-resources/${sourcedId}`,
      { method: "PUT", body: JSON.stringify(d) },
      t
    ),
};

export { QTI_API_BASE_URL, ONEROSTER_API_BASE_URL };
