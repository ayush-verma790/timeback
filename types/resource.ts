export interface ResourceMetadata {
  type: string
  subType: string
  subject: string
  grades: string[]
  learningObjectiveSet: string[]
  xp: number
  url: string
  language: string
  keywords: string[]
  wordLength: number
  timeLength: number
  lessonType: string
  activityType: string
  format: string
  author: string
  pageCount?: number
  instructionalMethod?: string
  duration?: string
  captionsAvailable?: boolean
  speaker?: string
  launchUrl?: string
  toolProvider?: string
  resolution?: string
  resources?: string[]
}

export interface ResourceData {
  title: string
  metadata: ResourceMetadata
  importance: string
  vendorId: string
  vendorResourceId: string
  applicationId: string
  roles: string[]
}

export const createDefaultResourceData = (): ResourceData => ({
  title: "",
  metadata: {
    type: "",
    subType: "",
    subject: "",
    grades: [],
    learningObjectiveSet: [],
    xp: 0,
    url: "",
    language: "",
    keywords: [],
    wordLength: 0,
    timeLength: 0,
    lessonType: "",
    activityType: "",
    format: "",
    author: "",
    pageCount: 0,
    instructionalMethod: "",
    duration: "",
    captionsAvailable: false,
    speaker: "",
    launchUrl: "",
    toolProvider: "",
    resolution: "",
    resources: [],
  },
  importance: "",
  vendorId: "",
  vendorResourceId: "",
  applicationId: "",
  roles: [],
})
