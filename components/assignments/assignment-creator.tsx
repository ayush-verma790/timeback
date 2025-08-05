"use client";
//@ts-ignore
import { useState, useContext, useEffect } from "react";
import {
  Plus,
  Save,
  ClipboardCopy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Database,
  Settings,
  FileText,
} from "lucide-react";
//@ts-ignore
import { AppContext, type AppContextType } from "../../context/app-context";
import { useToast } from "../toast/toast-context";
import { InputField } from "../common/input-field";
import { api, QTI_API_BASE_URL } from "../../utils/api";
import { pages } from "next/dist/build/templates/app-page";

const QUESTION_TYPES = [
  "choice",
  "match",
  "associate",
  "order",
  "select-point",
  "graphic-order",
  "graphic-associate",
  "graphic-gap-match",
  "hotspot",
  "hottext",
  "slider",
  "drawing",
  "media",
  "upload",
  "xml",
];

// Enhanced prefilled examples for each question type
const getPrefilledQuestion = (type: string) => {
  const baseExample = {
    identifier: `${type}-example-${Date.now()}`,
    title: "",
    metadata: {
      subject: "Mathematics",
      grade: "5",
      standard: "Common Core",
      lesson: "Basic Operations",
      difficulty: "medium",
    },
    prompt: "",
    stimulusIdentifier: "", // Now references an existing stimulus by ID
    // Choice/Inline Choice
    choices: [
      { identifier: "A", content: "Option A", feedbackInline: "Try again!" },
      {
        identifier: "B",
        content: "Option B",
        feedbackInline: "Correct! Well done.",
      },
    ],
    correctAnswer: "B",
    shuffle: false,
    maxChoices: 1,
    // Match/Associate
    sourceChoices: [
      { identifier: "C1", content: "France" },
      { identifier: "C2", content: "Germany" },
    ],
    targetChoices: [
      { identifier: "T1", content: "Paris" },
      { identifier: "T2", content: "Berlin" },
    ],
    correctPairs: [
      ["C1", "T1"],
      ["C2", "T2"],
    ],
    maxAssociations: 2,
    // Order
    orderChoices: [
      { identifier: "C1", content: "First step" },
      { identifier: "C2", content: "Second step" },
      { identifier: "C3", content: "Third step" },
    ],
    correctOrder: ["C1", "C2", "C3"],
    orientation: "vertical",
    // Select Point / Graphic interactions
    imageUrl: "https://example.com/sample-image.jpg",
    imageWidth: 800,
    imageHeight: 600,
    correctPoints: ["200 300", "400 500"],
    minChoices: 1,
    objectData: "data:image/png;base64,PLACEHOLDER",
    objectWidth: 800,
    objectHeight: 600,
    objectType: "image/png",
    // Hotspot
    hotspots: [
      { identifier: "REGION1", shape: "rect", coords: "100,100,200,200" },
      { identifier: "REGION2", shape: "circle", coords: "300,300,50" },
    ],
    // Hottext
    hottextContent:
      '<p>Select the <hottext identifier="H1">correct</hottext> word in this <hottext identifier="H2">sentence</hottext>.</p>',
    hottextIdentifiers: ["H1", "H2"],
    // Slider
    lowerBound: 0,
    upperBound: 100,
    step: 5,
    sliderOrientation: "horizontal",
    correctValue: 75,
    // Drawing
    canvasWidth: 600,
    canvasHeight: 400,
    // Media
    mediaUrl: "https://example.com/sample-video.mp4",
    mediaType: "video/mp4",
    mediaWidth: 640,
    mediaHeight: 360,
    autostart: false,
    loop: false,
    minPlays: 1,
    maxPlays: 3,
    // Upload
    allowedTypes: ["application/pdf", "image/jpeg"],
    maxSize: 5242880,
    maxFiles: 1,
    // Graphic Order
    graphicOrderChoices: [
      {
        identifier: "EVENT1",
        label: "World War I (1914)",
        shape: "rect",
        coords: "50,50,150,100",
      },
      {
        identifier: "EVENT2",
        label: "Great Depression (1929)",
        shape: "rect",
        coords: "200,50,300,100",
      },
      {
        identifier: "EVENT3",
        label: "Moon Landing (1969)",
        shape: "rect",
        coords: "350,50,450,100",
      },
    ],
    // Graphic Associate
    associableHotspots: [
      {
        identifier: "C1",
        shape: "circle",
        coords: "100,100,10",
        matchMax: 1,
        label: "City Hall",
      },
      {
        identifier: "C2",
        shape: "circle",
        coords: "200,200,10",
        matchMax: 1,
        label: "Museum",
      },
    ],
  };

  const examples = {
    choice: {
      ...baseExample,
      title: "Basic Addition Problem",
      prompt: "What is 15 + 27?",
      choices: [
        {
          identifier: "A",
          content: "40",
          feedbackInline: "Close, but not quite right.",
        },
        {
          identifier: "B",
          content: "42",
          feedbackInline: "Excellent! That's correct.",
        },
        {
          identifier: "C",
          content: "44",
          feedbackInline: "Too high, try again.",
        },
      ],
      correctAnswer: "B",
    },
    match: {
      ...baseExample,
      title: "Robust Country-Capital Match Question",
      prompt: "Match each country with its capital.",
      metadata: {
        subject: "Geography",
        grade: "6",
        standard: "World Capitals",
        lesson: "European Geography",
        difficulty: "medium",
      },
      sourceChoices: [
        { identifier: "C1", content: "France" },
        { identifier: "C2", content: "Germany" },
        { identifier: "C3", content: "Italy" },
        { identifier: "C4", content: "Spain" },
      ],
      targetChoices: [
        { identifier: "T1", content: "Paris" },
        { identifier: "T2", content: "Berlin" },
        { identifier: "T3", content: "Rome" },
        { identifier: "T4", content: "Madrid" },
      ],
      correctPairs: [
        ["C1", "T1"],
        ["C2", "T2"],
        ["C3", "T3"],
        ["C4", "T4"],
      ],
      maxAssociations: 4,
      shuffle: true,
    },
    associate: {
      ...baseExample,
      title: "Associate Animals with Habitats",
      prompt: "Connect each animal with its natural habitat.",
      sourceChoices: [
        { identifier: "C1", content: "Fish" },
        { identifier: "C2", content: "Bird" },
      ],
      targetChoices: [
        { identifier: "T1", content: "Ocean" },
        { identifier: "T2", content: "Sky" },
      ],
      correctPairs: [
        ["C1", "T1"],
        ["C2", "T2"],
      ],
    },
    order: {
      ...baseExample,
      title: "Robust Historical Events Ordering Question",
      prompt:
        "Place these historical events in chronological order (earliest to latest).",
      metadata: {
        subject: "History",
        grade: "7",
        standard: "Chronology",
        lesson: "American History Timeline",
        difficulty: "medium",
      },
      orderChoices: [
        { identifier: "C1", content: "Declaration of Independence (1776)" },
        { identifier: "C2", content: "Constitution Ratified (1788)" },
        { identifier: "C3", content: "Louisiana Purchase (1803)" },
        { identifier: "C4", content: "Civil War Begins (1861)" },
      ],
      correctOrder: ["C1", "C2", "C3", "C4"],
      shuffle: true,
    },
    "select-point": {
      ...baseExample,
      title: "Robust Map Location Selection Question",
      prompt: "Select two major cities on the map.",
      metadata: {
        subject: "Geography",
        grade: "6",
        standard: "Map Skills",
        lesson: "Major World Cities",
        difficulty: "medium",
      },
      correctPoints: ["200 300", "400 500"],
      maxChoices: 2,
      minChoices: 1,
    },
    "graphic-order": {
      ...baseExample,
      title: "Robust Timeline Graphic Order Question",
      prompt:
        "Order these 20th-century events chronologically on the timeline.",
      metadata: {
        subject: "History",
        grade: "8",
        standard: "Chronology",
        lesson: "20th Century Events",
        difficulty: "medium",
      },
      graphicOrderChoices: [
        {
          identifier: "EVENT1",
          label: "World War I (1914)",
          shape: "rect",
          coords: "50,50,150,100",
        },
        {
          identifier: "EVENT2",
          label: "Great Depression (1929)",
          shape: "rect",
          coords: "200,50,300,100",
        },
        {
          identifier: "EVENT3",
          label: "Moon Landing (1969)",
          shape: "rect",
          coords: "350,50,450,100",
        },
      ],
      correctOrder: ["EVENT1", "EVENT2", "EVENT3"],
      shuffle: true,
    },
    "graphic-associate": {
      ...baseExample,
      title: "Robust Map Landmark Association Question",
      prompt: "Match city markers to landmarks.",
      metadata: {
        subject: "Geography",
        grade: "7",
        standard: "Cartography",
        lesson: "Landmark Identification",
        difficulty: "medium",
      },
      associableHotspots: [
        {
          identifier: "C1",
          shape: "circle",
          coords: "100,100,10",
          matchMax: 1,
          label: "City Hall",
        },
        {
          identifier: "C2",
          shape: "circle",
          coords: "200,200,10",
          matchMax: 1,
          label: "Museum",
        },
      ],
      maxAssociations: 4,
      shuffle: false,
    },
    hotspot: {
      ...baseExample,
      title: "Robust Region Selection Hotspot Question",
      prompt:
        "Select the two regions that are known for their historical landmarks.",
      metadata: {
        subject: "Geography",
        grade: "5",
        standard: "Map Skills",
        lesson: "Landmark Regions",
        difficulty: "easy",
      },
      hotspots: [
        { identifier: "REGION1", shape: "rect", coords: "100,100,200,200" },
        { identifier: "REGION2", shape: "circle", coords: "300,300,50" },
        {
          identifier: "REGION3",
          shape: "poly",
          coords: "500,100,600,100,550,200",
        },
      ],
      maxChoices: 2,
    },
    hottext: {
      ...baseExample,
      title: "Identify Key Terms",
      prompt: "Select the scientific terms in the following passage.",
      hottextContent:
        '<p>The <hottext identifier="H1">photosynthesis</hottext> process allows plants to convert <hottext identifier="H2">carbon dioxide</hottext> into oxygen.</p>',
      hottextIdentifiers: ["H1", "H2"],
    },
    slider: {
      ...baseExample,
      title: "Set Temperature",
      prompt: "Set the slider to room temperature (approximately 20°C).",
      lowerBound: 0,
      upperBound: 50,
      correctValue: 20,
    },
    drawing: {
      ...baseExample,
      title: "Robust Drawing Task",
      prompt: "Draw a simple house with a door and two windows.",
      metadata: {
        subject: "Art",
        grade: "6",
        standard: "Creative Expression",
        lesson: "Basic Shapes",
        difficulty: "easy",
      },
      canvasWidth: 800,
      canvasHeight: 600,
    },
    media: {
      ...baseExample,
      title: "Robust Media Analysis Question",
      prompt: "Watch the video and identify the key concept.",
      metadata: {
        subject: "Science",
        grade: "8",
        standard: "Physics – Motion",
        lesson: "Newton's Laws",
        difficulty: "medium",
      },
      mediaUrl: "https://example.com/sample-video.mp4",
      correctAnswer: "Inertia",
      autostart: true,
      minPlays: 0,
      maxPlays: 2,
      loop: false,
    },
    upload: {
      ...baseExample,
      title: "Robust File Upload Question",
      prompt: "Upload your completed persuasive essay as a PDF.",
      metadata: {
        subject: "English",
        grade: "7",
        standard: "Writing Assessment",
        lesson: "Persuasive Essay",
        difficulty: "hard",
      },
      allowedTypes: ["application/pdf"],
      maxSize: 10485760,
      maxFiles: 1,
      stimulusIdentifier: "Stimulus-Upload1", // Now references an existing stimulus by ID
    },
    xml: {
      format: "xml",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
  identifier="xml-choice-item-1"
  title="Sample Choice Question"
  adaptive="false"
  time-dependent="false">

  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/>
  <qti-outcome-declaration identifier="FEEDBACK-INLINE" cardinality="single" base-type="identifier"/>

  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-prompt>What is 2 + 2?</qti-prompt>
      <qti-simple-choice identifier="A">
        3
        <qti-feedback-inline outcome-identifier="FEEDBACK-INLINE" identifier="A" show-hide="show">
          <span style="color: #D9534F;">Incorrect: Try counting again.</span>
        </qti-feedback-inline>
      </qti-simple-choice>
      <qti-simple-choice identifier="B">
        4
        <qti-feedback-inline outcome-identifier="FEEDBACK-INLINE" identifier="B" show-hide="show">
          <span style="color: #2E8B57;">Correct: Well done!</span>
        </qti-feedback-inline>
      </qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="match_correct">
    <qti-response-condition>
      <qti-response-if>
        <qti-match>
          <qti-variable identifier="RESPONSE"/>
          <qti-correct identifier="RESPONSE"/>
        </qti-match>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-base-value base-type="identifier">CORRECT</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="FEEDBACK">
          <qti-base-value base-type="identifier">INCORRECT</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>

  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="CORRECT" show-hide="show">
    <qti-content-body>
      <p><strong>Correct!</strong> Well done.</p>
    </qti-content-body>
  </qti-modal-feedback>

  <qti-modal-feedback outcome-identifier="FEEDBACK" identifier="INCORRECT" show-hide="show">
    <qti-content-body>
      <p><strong>Incorrect.</strong> Please review and try again.</p>
    </qti-content-body>
  </qti-modal-feedback>
</qti-assessment-item>`,
      metadata: {
        subject: "Math",
        grade: "5",
        standard: "Number Operations",
        lesson: "Basic Addition",
        difficulty: "hard",
      },
    },
  };

  return examples[type] || baseExample;
};

// Prefilled example for stimulus creation
const getPrefilledStimulus = () => ({
  identifier: `stimulus-example-${Date.now()}`,
  title: "Sample Stimulus Title",
  content:
    "<p>This is a sample stimulus content. It can contain <strong>HTML</strong>.</p>",
});

export const AssignmentCreator = () => {
  const { handleApiCall, deleteQtiQuestion } = useContext(
    AppContext
  ) as AppContextType;
  const { addToast }: any = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState("create");

  // Question Bank State with Pagination
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionsPagination, setQuestionsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    offset: 0,
  });

  // Stimulus Bank State with Pagination
  const [stimuli, setStimuli] = useState<any[]>([]);
  const [stimuliPagination, setStimuliPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 1000,
    offset: 0,
  });
  const [stimulusForm, setStimulusForm] = useState(getPrefilledStimulus());

  // Tests State with Pagination
  const [tests, setTests] = useState<any[]>([]);
  const [testsPagination, setTestsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 100,
    offset: 0,
  });

  // Test Creation State - Enhanced
  const [testConfig, setTestConfig] = useState({
    identifier: "",
    title: "Sample Assessment Test",
    qtiVersion: "3.0",
    toolName: "EduPlatform",
    toolVersion: "1.0",
    timeLimit: 60,
    maxAttempts: 3,
    toolsEnabled: {
      calculator: true,
      dictionary: false,
      notepad: true,
    },
    metadata: {
      subject: "Mathematics",
      grade: "5",
      difficulty: "medium",
    },
    navigationMode: "linear",
    submissionMode: "individual",
    sectionTitle: "Main Assessment Section",
    sectionVisible: true,
    sectionRequired: true,
    sectionFixed: false,
  });

  // Created IDs tracking
  const [createdIds, setCreatedIds] = useState<{
    questions: string[];
    tests: string[];
    stimuli: string[];
  }>({
    questions: [],
    tests: [],
    stimuli: [],
  });

  // Dynamic Question Builder State
  const [questionType, setQuestionType] = useState("choice");
  const [questionForm, setQuestionForm] = useState(
    getPrefilledQuestion("choice")
  );

  // Helper function to extract and normalize items from API responses
  const extractAndNormalizeItems = (apiResult: any, key: string) => {
    if (!apiResult) {
      return [];
    }

    let items: any[] = [];

    // Attempt to find the items array or single item under various common keys
    if (apiResult[key]) {
      // e.g., {"qti-assessment-stimulus": {...}} or {"qti-assessment-stimulus": [...]}
      items = Array.isArray(apiResult[key]) ? apiResult[key] : [apiResult[key]];
    } else if (apiResult[`${key}s`]) {
      // e.g., {"qti-assessment-stimuli": [...]}
      items = Array.isArray(apiResult[`${key}s`])
        ? apiResult[`${key}s`]
        : [apiResult[`${key}s`]];
    } else if (apiResult.items) {
      // e.g., {items: [...]}
      items = Array.isArray(apiResult.items)
        ? apiResult.items
        : [apiResult.items];
    } else if (apiResult.data) {
      // e.g., {data: [...]}
      items = Array.isArray(apiResult.data) ? apiResult.data : [apiResult.data];
    } else if (Array.isArray(apiResult)) {
      // e.g., [...]
      items = apiResult;
    } else if (typeof apiResult === "object") {
      // e.g., {...} (assume it's a single item)
      items = [apiResult];
    } else {
      console.warn(
        "extractAndNormalizeItems: Unrecognized API result structure:",
        apiResult
      );
      return [];
    }

    // Now, iterate through the potentially wrapped items and unwrap them if necessary
    const unwrappedItems = items.map((item) => {
      if (item && typeof item === "object" && item[key] !== undefined) {
        // If the item itself is a wrapper object, unwrap it
        return item[key];
      }
      // Otherwise, return the item as is (it's already unwrapped or a primitive)
      return item;
    });

    // Filter out any null or undefined items that might have resulted from unwrapping or initial extraction
    return unwrappedItems.filter((item) => item !== null && item !== undefined);
  };

  // Load questions with pagination using the API utility
  const loadQuestions = async (page = 1, limit = 3000) => {
    try {
      const offset = page - 1;
      const result = await handleApiCall(api.getAssessmentItems, {
        page,
        limit,
      });

      if (result) {
        const items = extractAndNormalizeItems(result, "qti-assessment-item");
        const totalCount = result.total || items.length;
        const pages = result.pages;
        setQuestions(items);

        setQuestionsPagination({
          currentPage: page,
          totalPages: pages,
          totalCount,
          limit,
          offset,
        });
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      addToast("Failed to load questions", "error");
    }
  };

  // Load stimuli with pagination using the API utility
  const loadStimuli = async (page = 1, limit = stimuliPagination.limit) => {
    try {
      const offset = (page - 1) * limit;
      const result = await handleApiCall(api.getStimuli, { offset, limit });

      if (result) {
        const items = extractAndNormalizeItems(
          result,
          "qti-assessment-stimulus"
        );
        const totalCount = result.totalCount || result.total || items.length;

        setStimuli(items);
        setStimuliPagination({
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          offset,
        });
      }
    } catch (err) {
      console.error("Failed to load stimuli:", err);
      addToast("Failed to load stimuli", "error");
    }
  };

  // Load tests with pagination using the API utility
  const loadTests = async (page = 1, limit = testsPagination.limit) => {
    try {
      const offset = (page - 1) * limit;
      const result = await handleApiCall(api.getAssessmentTests, {
        offset,
        limit,
      });

      if (result) {
        const items = extractAndNormalizeItems(result, "qti-assessment-test");
        const totalCount = result.totalCount || result.total || items.length;

        setTests(items);
        setTestsPagination({
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          offset,
        });
      }
    } catch (err) {
      console.error("Failed to load tests:", err);
      addToast("Failed to load tests", "error");
    }
  };

  useEffect(() => {
    loadQuestions();
    loadStimuli();
    loadTests();
  }, []);

  const handleQuestionTypeChange = (newType: string) => {
    setQuestionType(newType);
    setQuestionForm(getPrefilledQuestion(newType));
  };

  const copyToClipboard = (text: string, label: string) => {
    console.log(text);
    navigator.clipboard?.writeText(text).then(() => {
      addToast(`${label} copied to clipboard!`, "success");
    });
  };

  const addChoice = () => {
    const nextId = String.fromCharCode(65 + questionForm.choices.length);
    setQuestionForm((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        { identifier: nextId, content: "", feedbackInline: "" },
      ],
    }));
  };

  const updateChoice = (index: number, field: string, value: string) => {
    const updatedChoices = [...questionForm.choices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setQuestionForm((prev) => ({ ...prev, choices: updatedChoices }));
  };

  const removeChoice = (index: number) => {
    if (questionForm.choices.length > 1) {
      const updatedChoices = questionForm.choices.filter((_, i) => i !== index);
      setQuestionForm((prev) => ({ ...prev, choices: updatedChoices }));
    }
  };

  const addSourceChoice = () => {
    const nextId = `C${questionForm.sourceChoices.length + 1}`;
    setQuestionForm((prev) => ({
      ...prev,
      sourceChoices: [
        ...prev.sourceChoices,
        { identifier: nextId, content: "" },
      ],
    }));
  };

  const updateSourceChoice = (index: number, field: string, value: string) => {
    const updated = [...questionForm.sourceChoices];
    updated[index] = { ...updated[index], [field]: value };
    setQuestionForm((prev) => ({ ...prev, sourceChoices: updated }));
  };

  const removeSourceChoice = (index: number) => {
    const updated = questionForm.sourceChoices.filter((_, i) => i !== index);
    setQuestionForm((prev) => ({ ...prev, sourceChoices: updated }));
  };

  const addTargetChoice = () => {
    const nextId = `T${questionForm.targetChoices.length + 1}`;
    setQuestionForm((prev) => ({
      ...prev,
      targetChoices: [
        ...prev.targetChoices,
        { identifier: nextId, content: "" },
      ],
    }));
  };

  const updateTargetChoice = (index: number, field: string, value: string) => {
    const updated = [...questionForm.targetChoices];
    updated[index] = { ...updated[index], [field]: value };
    setQuestionForm((prev) => ({ ...prev, targetChoices: updated }));
  };

  const removeTargetChoice = (index: number) => {
    const updated = questionForm.targetChoices.filter((_, i) => i !== index);
    setQuestionForm((prev) => ({ ...prev, targetChoices: updated }));
  };

  const addCorrectPair = () => {
    setQuestionForm((prev) => ({
      ...prev,
      correctPairs: [...prev.correctPairs, ["", ""]],
    }));
  };

  const updateCorrectPair = (
    index: number,
    pairIndex: 0 | 1,
    value: string
  ) => {
    const updatedPairs = [...questionForm.correctPairs];
    updatedPairs[index][pairIndex] = value;
    setQuestionForm((prev) => ({ ...prev, correctPairs: updatedPairs }));
  };

  const removeCorrectPair = (index: number) => {
    const updatedPairs = questionForm.correctPairs.filter(
      (_, i) => i !== index
    );
    setQuestionForm((prev) => ({ ...prev, correctPairs: updatedPairs }));
  };

  const addOrderChoice = () => {
    const nextId = `C${questionForm.orderChoices.length + 1}`;
    setQuestionForm((prev) => ({
      ...prev,
      orderChoices: [...prev.orderChoices, { identifier: nextId, content: "" }],
    }));
  };

  const addHotspot = () => {
    const nextId = `REGION${questionForm.hotspots.length + 1}`;
    setQuestionForm((prev) => ({
      ...prev,
      hotspots: [
        ...prev.hotspots,
        { identifier: nextId, shape: "rect", coords: "100,100,200,200" },
      ],
    }));
  };

  // const generateQuestionPayload = () => {
  //   const basePayload: any = {
  //     format: "json",
  //     identifier: questionForm.identifier || `${questionType}-${Date.now()}`,
  //     type: questionType,
  //     title: questionForm.title,
  //     metadata: questionForm.metadata,
  //     interaction: {
  //       type: questionType,
  //       responseIdentifier: "RESPONSE",
  //       questionStructure: {
  //         prompt: questionForm.prompt,
  //       },
  //     },
  //     responseDeclarations: [],
  //     outcomeDeclarations: [
  //       { identifier: "FEEDBACK", cardinality: "single", baseType: "identifier" },
  //       { identifier: "FEEDBACK-INLINE", cardinality: "single", baseType: "identifier" },
  //     ],
  //     responseProcessing: {
  //       templateType: "match_correct",
  //       responseDeclarationIdentifier: "RESPONSE",
  //       outcomeIdentifier: "FEEDBACK",
  //       correctResponseIdentifier: "CORRECT",
  //       incorrectResponseIdentifier: "INCORRECT",
  //     },
  //     feedbackBlock: [
  //       {
  //         outcomeIdentifier: "FEEDBACK",
  //         identifier: "CORRECT",
  //         showHide: "show",
  //         content: "<p><strong>Correct!</strong> Well done.</p>",
  //       },
  //       {
  //         outcomeIdentifier: "FEEDBACK",
  //         identifier: "INCORRECT",
  //         showHide: "show",
  //         content: "<p><strong>Incorrect.</strong> Please review and try again.</p>",
  //       },
  //     ],
  //     rubrics: [
  //       {
  //         use: "ext:criteria",
  //         view: "scorer",
  //         body: "<p>Grading Criteria: Standard rubric applies.</p>",
  //       },
  //     ],
  //   }

  //   // Add stimulus reference if provided
  //   if (questionForm.stimulusIdentifier) {
  //     basePayload.stimulus = {
  //       identifier: questionForm.stimulusIdentifier,
  //       href: `${QTI_API_BASE_URL}/stimuli/${questionForm.stimulusIdentifier}.xml`,
  //     }
  //   }

  //   switch (questionType) {
  //     case "choice":
  //       basePayload.interaction.questionStructure.choices = questionForm.choices.map((c) => ({
  //         ...c,
  //         feedbackOutcomeIdentifier: "FEEDBACK-INLINE",
  //       }))
  //       basePayload.interaction.shuffle = questionForm.shuffle
  //       basePayload.interaction.maxChoices = questionForm.maxChoices
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "single",
  //         baseType: "identifier",
  //         correctResponse: { value: [questionForm.correctAnswer] },
  //       })
  //       break

  //     case "match":
  //     case "associate": // Both match and associate use similar structure for choices and pairs
  //       basePayload.interaction.questionStructure.sourceChoices = questionForm.sourceChoices
  //       basePayload.interaction.questionStructure.targetChoices = questionForm.targetChoices
  //       basePayload.interaction.shuffle = questionForm.shuffle
  //       basePayload.interaction.maxAssociations = questionForm.maxAssociations
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "multiple",
  //         baseType: "directedPair",
  //         correctResponse: { value: questionForm.correctPairs },
  //       })
  //       break

  //     case "order":
  //       basePayload.interaction.questionStructure.choices = questionForm.orderChoices
  //       basePayload.interaction.shuffle = questionForm.shuffle
  //       basePayload.interaction.orientation = questionForm.orientation
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "ordered",
  //         baseType: "identifier",
  //         correctResponse: { value: questionForm.correctOrder },
  //       })
  //       break

  //     case "select-point":
  //       basePayload.interaction.maxChoices = questionForm.maxChoices
  //       basePayload.interaction.minChoices = questionForm.minChoices
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.imageUrl,
  //         width: questionForm.imageWidth,
  //         height: questionForm.imageHeight,
  //         type: "image/jpeg",
  //         mediaType: "image/jpeg",
  //       }
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "multiple",
  //         baseType: "point",
  //         correctResponse: { value: questionForm.correctPoints },
  //       })
  //       break

  //     case "graphic-order":
  //       basePayload.interaction.shuffle = questionForm.shuffle
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.objectData,
  //         width: questionForm.objectWidth,
  //         height: questionForm.objectHeight,
  //         type: questionForm.objectType,
  //         mediaType: questionForm.objectType,
  //       }
  //       basePayload.interaction.questionStructure.orderChoices = questionForm.graphicOrderChoices
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "ordered",
  //         baseType: "identifier",
  //         correctResponse: { value: questionForm.correctOrder },
  //       })
  //       break

  //     case "graphic-associate":
  //       basePayload.interaction.maxAssociations = questionForm.maxAssociations
  //       basePayload.interaction.shuffle = questionForm.shuffle
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.objectData,
  //         width: questionForm.objectWidth,
  //         height: questionForm.objectHeight,
  //         type: questionForm.objectType,
  //         mediaType: questionForm.objectType,
  //       }
  //       basePayload.interaction.questionStructure.associableHotspots = questionForm.associableHotspots
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "multiple",
  //         baseType: "directedPair",
  //         correctResponse: { value: questionForm.correctPairs }, // Ensure this is correctly populated from UI
  //       })
  //       break

  //     case "hotspot":
  //       basePayload.interaction.maxChoices = questionForm.maxChoices
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.objectData,
  //         width: questionForm.objectWidth,
  //         height: questionForm.objectHeight,
  //         type: questionForm.objectType,
  //         mediaType: questionForm.objectType,
  //       }
  //       basePayload.interaction.questionStructure.hotspots = questionForm.hotspots
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "multiple",
  //         baseType: "identifier",
  //         correctResponse: { value: questionForm.hotspots.slice(0, questionForm.maxChoices).map((h) => h.identifier) },
  //       })
  //       break

  //     case "hottext":
  //       basePayload.interaction.questionStructure.text = questionForm.hottextContent
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "multiple",
  //         baseType: "identifier",
  //         correctResponse: { value: questionForm.hottextIdentifiers },
  //       })
  //       break

  //     case "slider":
  //       basePayload.interaction["lower-bound"] = questionForm.lowerBound
  //       basePayload.interaction["upper-bound"] = questionForm.upperBound
  //       basePayload.interaction.step = questionForm.step
  //       basePayload.interaction.orientation = questionForm.sliderOrientation
  //       if (questionForm.imageUrl) {
  //         basePayload.interaction.questionStructure.object = {
  //           data: questionForm.imageUrl,
  //           width: questionForm.imageWidth,
  //           height: questionForm.imageHeight,
  //           type: "image/jpeg",
  //           mediaType: "image/jpeg",
  //         }
  //       }
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "single",
  //         baseType: "float",
  //         correctResponse: { value: [questionForm.correctValue.toString()] },
  //       })
  //       break

  //     case "drawing":
  //       basePayload.interaction.questionStructure.canvas = {
  //         width: questionForm.canvasWidth,
  //         height: questionForm.canvasHeight,
  //       }
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.objectData,
  //         width: questionForm.canvasWidth,
  //         height: questionForm.canvasHeight,
  //         type: "image/png",
  //         mediaType: "image/png",
  //       }
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "single",
  //         baseType: "file",
  //         correctResponse: { value: [""] },
  //       })
  //       basePayload.responseProcessing.templateType = "map_response"
  //       break

  //     case "media":
  //       basePayload.interaction.autostart = questionForm.autostart
  //       basePayload.interaction.minPlays = questionForm.minPlays
  //       basePayload.interaction.maxPlays = questionForm.maxPlays
  //       basePayload.interaction.loop = questionForm.loop
  //       basePayload.interaction.questionStructure.object = {
  //         data: questionForm.mediaUrl,
  //         width: questionForm.mediaWidth,
  //         height: questionForm.mediaHeight,
  //         type: questionForm.mediaType,
  //         mediaType: questionForm.mediaType,
  //       }
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "single",
  //         baseType: "string",
  //         correctResponse: { value: [questionForm.correctAnswer] },
  //       })
  //       break

  //     case "upload":
  //       basePayload.interaction.questionStructure.allowedTypes = questionForm.allowedTypes
  //       basePayload.interaction.questionStructure.maxSize = questionForm.maxSize
  //       basePayload.interaction.questionStructure.maxFiles = questionForm.maxFiles
  //       basePayload.responseDeclarations.push({
  //         identifier: "RESPONSE",
  //         cardinality: "single",
  //         baseType: "string",
  //         correctResponse: { value: [""] },
  //       })
  //       basePayload.responseProcessing.templateType = "map_response"
  //       break
  //   }

  //   return basePayload
  // }
  const generateQuestionPayload = () => {
    // Default values for common fields
    const defaultPayload = {
      format: "json",
      identifier: questionForm.identifier || `${questionType}-${Date.now()}`,
      type: questionType,
      title: questionForm.title || "Untitled Question",
      metadata: {
        subject: questionForm.metadata?.subject || "General",
        grade: questionForm.metadata?.grade || "NA",
        standard: questionForm.metadata?.standard || "NA",
        lesson: questionForm.metadata?.lesson || "NA",
        difficulty: questionForm.metadata?.difficulty || "medium",
      },
      interaction: {
        type: questionType,
        responseIdentifier: "RESPONSE",
        shuffle: questionForm.shuffle || false,
        maxChoices: questionForm.maxChoices || 1,
        minChoices: questionForm.minChoices || 0,
        maxAssociations: questionForm.maxAssociations || 1,
        attributes: {},
      },
      responseDeclarations: [
        {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "string",
          correctResponse: { value: [""] },
        },
      ],
      outcomeDeclarations: [
        {
          identifier: "FEEDBACK",
          cardinality: "single",
          baseType: "identifier",
        },
        {
          identifier: "FEEDBACK-INLINE",
          cardinality: "single",
          baseType: "identifier",
        },
      ],
      responseProcessing: {
        templateType: "match_correct",
        responseDeclarationIdentifier: "RESPONSE",
        outcomeIdentifier: "FEEDBACK",
        correctResponseIdentifier: "CORRECT",
        incorrectResponseIdentifier: "INCORRECT",
      },
      feedbackBlock: [
        {
          outcomeIdentifier: "FEEDBACK",
          identifier: "CORRECT",
          showHide: "show",
          content: "<p><strong>Correct!</strong> Well done.</p>",
        },
        {
          outcomeIdentifier: "FEEDBACK",
          identifier: "INCORRECT",
          showHide: "show",
          content:
            "<p><strong>Incorrect.</strong> Please review and try again.</p>",
        },
      ],
      feedbackInline: [],
      modalFeedback: [],
      rubrics: [
        {
          use: "ext:criteria",
          view: "scorer",
          body: "<p>Grading Criteria: Standard rubric applies.</p>",
        },
      ],
    };

    // Merge user-provided values with defaults
    const payload = {
      ...defaultPayload,
      ...(questionForm.identifier && { identifier: questionForm.identifier }),
      ...(questionForm.title && { title: questionForm.title }),
      metadata: {
        ...defaultPayload.metadata,
        ...(questionForm.metadata?.subject && {
          subject: questionForm.metadata.subject,
        }),
        ...(questionForm.metadata?.grade && {
          grade: questionForm.metadata.grade,
        }),
        ...(questionForm.metadata?.standard && {
          standard: questionForm.metadata.standard,
        }),
        ...(questionForm.metadata?.lesson && {
          lesson: questionForm.metadata.lesson,
        }),
        ...(questionForm.metadata?.difficulty && {
          difficulty: questionForm.metadata.difficulty,
        }),
      },
    };

    // Add stimulus reference if provided
    if (questionForm.stimulusIdentifier) {
      //@ts-ignore
      payload.stimulus = {
        identifier: questionForm.stimulusIdentifier,
      };
    }
 if (questionType === "xml") {
    return {
      format: "xml",
      xml: questionForm.xml,
      metadata: questionForm.metadata
    };
  }
    // Question type specific configurations
    switch (questionType) {
      case "choice":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Select the correct answer:",
          choices: (questionForm.choices || []).map((choice) => ({
            identifier:
              choice.identifier ||
              `CHOICE_${Math.random().toString(36).substr(2, 5)}`,
            content: choice.content || "Option",
          })),
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "identifier",
          correctResponse: { value: [questionForm.correctAnswer || "A"] },
        };
        if (questionForm.choices?.some((c) => c.feedbackInline)) {
          payload.feedbackInline = questionForm.choices
            .filter((c) => c.feedbackInline)
            .map((c) => ({
              outcomeIdentifier: "FEEDBACK-INLINE",
              identifier: c.identifier,
              showHide: "show",
              content: `<span>${c.feedbackInline}</span>`,
            }));
        }
        break;

      case "match":
      case "associate":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Match the items:",
          sourceChoices: questionForm.sourceChoices || [],
          targetChoices: questionForm.targetChoices || [],
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "multiple",
          baseType: "directedPair",
          correctResponse: {
            value: (questionForm.correctPairs || []).map((pair) => [
              pair[0] || "A",
              pair[1] || "1",
            ]),
          },
        };
        break;

      case "order":
      case "graphic-order":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Arrange in correct order:",
          choices:
            (questionType === "order"
              ? questionForm.orderChoices
              : questionForm.graphicOrderChoices) || [],
        };
        if (questionType === "graphic-order") {
          //@ts-ignore
          payload.interaction.questionStructure.object = {
            data:
              questionForm.objectData || "data:image/png;base64,PLACEHOLDER",
            width: questionForm.objectWidth || 800,
            height: questionForm.objectHeight || 600,
            type: questionForm.objectType || "image/png",
            mediaType: questionForm.objectType || "image/png",
          };
        }
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "ordered",
          baseType: "identifier",
          correctResponse: { value: questionForm.correctOrder || [] },
        };
        break;

      case "select-point":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Select the correct point(s):",
          object: {
            data: questionForm.imageUrl || "data:image/png;base64,PLACEHOLDER",
            width: questionForm.imageWidth || 800,
            height: questionForm.imageHeight || 600,
            type: "image/jpeg",
            mediaType: "image/jpeg",
          },
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "multiple",
          baseType: "point",
          correctResponse: { value: questionForm.correctPoints || [] },
        };
        break;

      case "graphic-associate":
      case "graphic-gap-match":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Associate the items:",
          object: {
            data:
              questionForm.objectData || "data:image/png;base64,PLACEHOLDER",
            width: questionForm.objectWidth || 800,
            height: questionForm.objectHeight || 600,
            type: questionForm.objectType || "image/png",
            mediaType: questionForm.objectType || "image/png",
          },
        };
        if (questionType === "graphic-associate") {
          //@ts-ignore
          payload.interaction.questionStructure.associableHotspots =
            questionForm.associableHotspots || [];
        } else {
          //@ts-ignore
          payload.interaction.questionStructure.gapImgs =
            questionForm.gapImgs || [];
          //@ts-ignore
          payload.interaction.questionStructure.associableHotspots =
            questionForm.associableHotspots || [];
        }
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "multiple",
          baseType: "directedPair",
          correctResponse: {
            value: (questionForm.correctPairs || []).map((pair) => [
              pair[0] || "A",
              pair[1] || "1",
            ]),
          },
        };
        break;

      case "hotspot":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Select the correct area(s):",
          object: {
            data:
              questionForm.objectData || "data:image/png;base64,PLACEHOLDER",
            width: questionForm.objectWidth || 800,
            height: questionForm.objectHeight || 600,
            type: questionForm.objectType || "image/png",
            mediaType: questionForm.objectType || "image/png",
          },
          hotspots: questionForm.hotspots || [],
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "multiple",
          baseType: "identifier",
          correctResponse: {
            value: (questionForm.hotspots || [])
              .slice(0, questionForm.maxChoices || 1)
              .map((h) => h.identifier || "HOTSPOT_1"),
          },
        };
        break;

      case "hottext":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Select the correct text:",
          text:
            questionForm.hottextContent ||
            '<p>Select the <hottext identifier="H1">correct</hottext> word.</p>',
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "multiple",
          baseType: "identifier",
          correctResponse: { value: questionForm.hottextIdentifiers || ["H1"] },
        };
        break;

      case "slider":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Set the slider to the correct value:",
          "lower-bound": questionForm.lowerBound || 0,
          "upper-bound": questionForm.upperBound || 100,
          step: questionForm.step || 1,
          orientation: questionForm.sliderOrientation || "horizontal",
        };
        if (questionForm.imageUrl) {
          //@ts-ignore
          payload.interaction.questionStructure.object = {
            data: questionForm.imageUrl,
            width: questionForm.imageWidth || 800,
            height: questionForm.imageHeight || 100,
            type: "image/jpeg",
            mediaType: "image/jpeg",
          };
        }
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "float",
          correctResponse: {
            value: [questionForm.correctValue?.toString() || "50"],
          },
        };
        break;

      case "drawing":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Draw your answer:",
          canvas: {
            width: questionForm.canvasWidth || 800,
            height: questionForm.canvasHeight || 600,
          },
        };
        if (questionForm.objectData) {
          //@ts-ignore
          payload.interaction.questionStructure.object = {
            data: questionForm.objectData,
            width: questionForm.canvasWidth || 800,
            height: questionForm.canvasHeight || 600,
            type: "image/png",
            mediaType: "image/png",
          };
        }
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "file",
          correctResponse: { value: [""] },
        };
        payload.responseProcessing.templateType = "map_response";
        break;

      case "media":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Answer the question about the media:",
          object: {
            data: questionForm.mediaUrl || "https://example.com/sample.mp4",
            width: questionForm.mediaWidth || 640,
            height: questionForm.mediaHeight || 360,
            type: questionForm.mediaType || "video/mp4",
            mediaType: questionForm.mediaType || "video/mp4",
          },
          autostart: questionForm.autostart || false,
          minPlays: questionForm.minPlays || 0,
          maxPlays: questionForm.maxPlays || 1,
          loop: questionForm.loop || false,
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "string",
          correctResponse: {
            value: [questionForm.correctAnswer || "Correct answer"],
          },
        };
        break;

      case "upload":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Upload your file:",
          allowedTypes: questionForm.allowedTypes || ["application/pdf"],
          maxSize: questionForm.maxSize || 5242880, // 5MB
          maxFiles: questionForm.maxFiles || 1,
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "string",
          correctResponse: { value: [""] },
        };
        payload.responseProcessing.templateType = "map_response";
        break;

      case "text-entry":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Enter your answer:",
        };
        payload.interaction.attributes = {
          "expected-length": questionForm.expectedLength || 10,
          "pattern-mask": questionForm.patternMask || "[A-Za-z0-9]+",
          placeholder: questionForm.placeholder || "Type your answer here",
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "string",
          correctResponse: {
            value: [questionForm.correctResponse || "correctanswer"],
          },
        };
        break;

      case "extended-text":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Write your answer:",
          expectedLength: questionForm.expectedLength || 500,
          expectedLines: questionForm.expectedLines || 10,
          format: questionForm.format || "plain",
          maxStrings: questionForm.maxStrings || 1,
          minStrings: questionForm.minStrings || 1,
          patternMask: questionForm.patternMask || "[a-zA-Z0-9\\s\\p{P}]*",
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "string",
          correctResponse: { value: [""] },
        };
        payload.responseProcessing.templateType = "map_response";
        payload.modalFeedback = [
          {
            outcomeIdentifier: "SCORE",
            identifier: "COMPLETED",
            showHide: "show",
            title: "Essay Submitted",
            content:
              "<p>Your essay has been submitted and will be scored shortly.</p>",
          },
        ];
        break;

      case "inline-choice":
        //@ts-ignore
        payload.interaction.questionStructure = {
          prompt: questionForm.prompt || "Select the correct answer:",
          inlineChoices: questionForm.inlineChoices || [
            { identifier: "A", content: "Option 1" },
            { identifier: "B", content: "Option 2" },
          ],
        };
        payload.responseDeclarations[0] = {
          identifier: "RESPONSE",
          cardinality: "single",
          baseType: "identifier",
          correctResponse: { value: [questionForm.correctAnswer || "A"] },
        };
        break;
    }

    return payload;
  };
  const addQuestionToBank = async () => {
    // if (!questionForm.title || !questionForm.prompt) {
    //   addToast("Question title and prompt are required.", "error");
    //   return;
    // }

    try {
      const payload = generateQuestionPayload();
      const result = await handleApiCall(api.createAssessmentItem, payload);

      if (result) {
        const questionId = result.identifier || payload.identifier;
        setCreatedIds((prev) => ({
          ...prev,
          questions: [...prev.questions, questionId],
        }));
        addToast("Question created successfully!", "success");
        setQuestionForm(getPrefilledQuestion(questionType)); // Reset with new prefilled data
        loadQuestions(questionsPagination.currentPage); // Reload current page
      }
    } catch (err) {
      console.error("Failed to create question:", err);
    }
  };

  const addStimulusToLibrary = async () => {
    if (
      !stimulusForm.identifier ||
      !stimulusForm.title ||
      !stimulusForm.content
    ) {
      addToast(
        "Stimulus identifier, title, and content are required.",
        "error"
      );
      return;
    }

    try {
      const payload = {
        identifier: stimulusForm.identifier,
        title: stimulusForm.title,
        content: stimulusForm.content,
      };
      const result = await handleApiCall(api.createStimulus, payload);

      if (result) {
        const stimulusId = result.identifier || payload.identifier;
        setCreatedIds((prev) => ({
          ...prev,
          stimuli: [...prev.stimuli, stimulusId],
        }));
        addToast("Stimulus created successfully!", "success");
        setStimulusForm(getPrefilledStimulus()); // Reset with new prefilled data
        loadStimuli(stimuliPagination.currentPage); // Reload current page
      }
    } catch (err) {
      console.error("Failed to create stimulus:", err);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreateTest = async () => {
    if (!testConfig.title) {
      addToast("Test title is required.", "error");
      return;
    }
    if (selectedQuestions.length === 0) {
      addToast("Please select at least one question for the test.", "error");
      return;
    }

    try {
      // Generate unique identifier if not provided
      const testIdentifier = testConfig.identifier || `test-${Date.now()}`;

      // Create assessment item references
      const assessmentItemRefs = selectedQuestions.map((questionId) => ({
        identifier: questionId,
        href: `${QTI_API_BASE_URL}/assessment-items/${questionId}.xml`,
      }));

      const testPayload = {
        identifier: testIdentifier,
        title: testConfig.title,
        qtiVersion: testConfig.qtiVersion,
        toolName: testConfig.toolName,
        toolVersion: "1.0",
        timeLimit: testConfig.timeLimit,
        maxAttempts: 3,
        toolsEnabled: testConfig.toolsEnabled,
        metadata: testConfig.metadata,
        "qti-test-part": [
          {
            identifier: "part1",
            navigationMode: testConfig.navigationMode,
            submissionMode: testConfig.submissionMode,
            "qti-assessment-section": [
              {
                identifier: "section1",
                title: testConfig.sectionTitle,
                visible: testConfig.sectionVisible,
                required: testConfig.sectionRequired,
                fixed: testConfig.sectionFixed, // Ensure this uses the state value
                sequence: 1,
                "qti-assessment-item-ref": assessmentItemRefs,
              },
            ],
          },
        ],
        "qti-outcome-declaration": [
          {
            identifier: "SCORE",
            cardinality: "single",
            baseType: "float",
            // normalMaximum: selectedQuestions.length,
            // normalMinimum: 0,
            defaultValue: {
              value: "0",
            },
          },
          {
            identifier: "MAXSCORE",
            cardinality: "single",
            baseType: "float",
            // normalMaximum: selectedQuestions.length,
            // normalMinimum: 0,
            defaultValue: {
              value: selectedQuestions.length.toString(),
            },
          },
        ],
      };

      const result = await handleApiCall(api.createAssessmentTest, testPayload);
      if (result) {
        const createdTestId = result.identifier || testIdentifier;
        setCreatedIds((prev) => ({
          ...prev,
          tests: [...prev.tests, createdTestId],
        }));
        addToast("Assessment Test created successfully!", "success");

        // Reset test config with prefilled values
        setTestConfig({
          identifier: "",
          title: "Sample Assessment Test",
          qtiVersion: "3.0",
          toolName: "EduPlatform",
          toolVersion: "1.0",
          timeLimit: 60,
          maxAttempts: 3,
          toolsEnabled: {
            calculator: true,
            dictionary: false,
            notepad: true,
          },
          metadata: {
            subject: "Mathematics",
            grade: "5",
            difficulty: "medium",
          },
          navigationMode: "linear",
          submissionMode: "individual",
          sectionTitle: "Main Assessment Section",
          sectionVisible: true,
          sectionRequired: true,
          sectionFixed: false,
        });
        setSelectedQuestions([]);
        loadTests(testsPagination.currentPage); // Reload tests
      }
    } catch (err) {
      console.error("Failed to create assessment test:", err);
    }
  };

  const renderQuestionForm = () => {
    switch (questionType) {
      case "choice":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.shuffle}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      shuffle: e.target.checked,
                    }))
                  }
                />
                Shuffle choices
              </label>
              {/* @ts-ignore */}
              <InputField
                label="Max Choices"
                type="number"
                value={questionForm.maxChoices}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxChoices: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <h4 className="font-medium">Choices</h4>
            {questionForm.choices.map((choice, index) => (
              <div key={index} className="border p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    Choice {choice.identifier}
                  </span>
                  {questionForm.choices.length > 1 && (
                    <button
                      onClick={() => removeChoice(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* @ts-ignore */}
                <InputField
                  label="Content"
                  value={choice.content}
                  onChange={(e) =>
                    updateChoice(index, "content", e.target.value)
                  }
                />
                {/* @ts-ignore */}
                <InputField
                  label="Feedback"
                  value={choice.feedbackInline}
                  onChange={(e) =>
                    updateChoice(index, "feedbackInline", e.target.value)
                  }
                  required={false}
                />
              </div>
            ))}
            <button
              onClick={addChoice}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Choice
            </button>
            {/* @ts-ignore */}
            <InputField
              label="Correct Answer Identifier (A, B, C, etc.)"
              value={questionForm.correctAnswer}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  correctAnswer: e.target.value,
                }))
              }
            />
          </div>
        );

      case "match":
      case "associate":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.shuffle}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      shuffle: e.target.checked,
                    }))
                  }
                />
                Shuffle choices
              </label>
              {/* @ts-ignore */}
              <InputField
                label="Max Associations"
                type="number"
                value={questionForm.maxAssociations}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxAssociations: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Source Choices</h4>
                {questionForm.sourceChoices.map((choice, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    {/* @ts-ignore */}
                    <InputField
                      label={`Source ${choice.identifier}`}
                      value={choice.content}
                      onChange={(e) =>
                        updateSourceChoice(index, "content", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeSourceChoice(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSourceChoice}
                  className="text-blue-600 text-sm"
                >
                  + Add Source
                </button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Target Choices</h4>
                {questionForm.targetChoices.map((choice, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    {/* @ts-ignore */}
                    <InputField
                      label={`Target ${choice.identifier}`}
                      value={choice.content}
                      onChange={(e) =>
                        updateTargetChoice(index, "content", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeTargetChoice(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTargetChoice}
                  className="text-blue-600 text-sm"
                >
                  + Add Target
                </button>
              </div>
            </div>
            <h4 className="font-medium mt-4">
              Correct Pairs (Source ID, Target ID)
            </h4>
            {questionForm.correctPairs.map((pair, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border p-2 rounded-lg bg-slate-50"
              >
                {/* @ts-ignore */}
                <InputField
                  label="Source ID"
                  value={pair[0]}
                  onChange={(e) => updateCorrectPair(index, 0, e.target.value)}
                />
                {/* @ts-ignore */}
                <InputField
                  label="Target ID"
                  value={pair[1]}
                  onChange={(e) => updateCorrectPair(index, 1, e.target.value)}
                />
                <button
                  onClick={() => removeCorrectPair(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addCorrectPair}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Correct Pair
            </button>
          </div>
        );

      case "order":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.shuffle}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      shuffle: e.target.checked,
                    }))
                  }
                />
                Shuffle choices
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Orientation
                </label>
                <select
                  value={questionForm.orientation}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      orientation: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div>
            </div>
            <h4 className="font-medium">Order Choices</h4>
            {questionForm.orderChoices.map((choice, index) => (
              <div key={index} className="border p-3 rounded-lg bg-slate-50">
                {/* @ts-ignore */}
                <InputField
                  label={`Choice ${choice.identifier}`}
                  value={choice.content}
                  onChange={(e) => {
                    const updated = [...questionForm.orderChoices];
                    updated[index].content = e.target.value;
                    setQuestionForm((prev) => ({
                      ...prev,
                      orderChoices: updated,
                    }));
                  }}
                />
              </div>
            ))}
            <button onClick={addOrderChoice} className="text-blue-600 text-sm">
              + Add Order Choice
            </button>
            {/* @ts-ignore */}
            <InputField
              label="Correct Order (comma-separated identifiers)"
              value={questionForm.correctOrder.join(", ")}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  correctOrder: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
            />
          </div>
        );

      case "select-point":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Min Choices"
                type="number"
                value={questionForm.minChoices}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    minChoices: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Max Choices"
                type="number"
                value={questionForm.maxChoices}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxChoices: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            {/* @ts-ignore */}
            <InputField
              label="Image URL"
              value={questionForm.imageUrl}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Image Width"
                type="number"
                value={questionForm.imageWidth}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    imageWidth: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Image Height"
                type="number"
                value={questionForm.imageHeight}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    imageHeight: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            {/* @ts-ignore */}
            <InputField
              label="Correct Points (space-separated coordinates)"
              value={questionForm.correctPoints.join(", ")}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  correctPoints: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
            />
          </div>
        );

      case "graphic-order":
        return (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={questionForm.shuffle}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    shuffle: e.target.checked,
                  }))
                }
              />
              Shuffle choices
            </label>
            {/* @ts-ignore */}
            <InputField
              label="Object Data (Base64 or URL)"
              value={questionForm.objectData}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  objectData: e.target.value,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Object Width"
                type="number"
                value={questionForm.objectWidth}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    objectWidth: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Object Height"
                type="number"
                value={questionForm.objectHeight}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    objectHeight: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <h4 className="font-medium">Graphic Order Choices</h4>
            {questionForm.graphicOrderChoices.map((choice, index) => (
              <div key={index} className="border p-3 rounded-lg bg-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Identifier"
                    value={choice.identifier}
                    onChange={(e) => {
                      const updated = [...questionForm.graphicOrderChoices];
                      updated[index].identifier = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        graphicOrderChoices: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Label"
                    value={choice.label}
                    onChange={(e) => {
                      const updated = [...questionForm.graphicOrderChoices];
                      updated[index].label = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        graphicOrderChoices: updated,
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Shape"
                    value={choice.shape}
                    onChange={(e) => {
                      const updated = [...questionForm.graphicOrderChoices];
                      updated[index].shape = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        graphicOrderChoices: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Coordinates"
                    value={choice.coords}
                    onChange={(e) => {
                      const updated = [...questionForm.graphicOrderChoices];
                      updated[index].coords = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        graphicOrderChoices: updated,
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
            {/* @ts-ignore */}
            <InputField
              label="Correct Order (comma-separated identifiers)"
              value={questionForm.correctOrder.join(", ")}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  correctOrder: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
            />
          </div>
        );

      case "graphic-associate":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.shuffle}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      shuffle: e.target.checked,
                    }))
                  }
                />
                Shuffle choices
              </label>
              {/* @ts-ignore */}
              <InputField
                label="Max Associations"
                type="number"
                value={questionForm.maxAssociations}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxAssociations: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            {/* @ts-ignore */}
            <InputField
              label="Object Data (Base64 or URL)"
              value={questionForm.objectData}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  objectData: e.target.value,
                }))
              }
            />
            <h4 className="font-medium">Associable Hotspots</h4>
            {questionForm.associableHotspots.map((hotspot, index) => (
              <div key={index} className="border p-3 rounded-lg bg-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Identifier"
                    value={hotspot.identifier}
                    onChange={(e) => {
                      const updated = [...questionForm.associableHotspots];
                      updated[index].identifier = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        associableHotspots: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Label"
                    value={hotspot.label}
                    onChange={(e) => {
                      const updated = [...questionForm.associableHotspots];
                      updated[index].label = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        associableHotspots: updated,
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Shape"
                    value={hotspot.shape}
                    onChange={(e) => {
                      const updated = [...questionForm.associableHotspots];
                      updated[index].shape = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        associableHotspots: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Coordinates"
                    value={hotspot.coords}
                    onChange={(e) => {
                      const updated = [...questionForm.associableHotspots];
                      updated[index].coords = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        associableHotspots: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Match Max"
                    type="number"
                    value={hotspot.matchMax}
                    onChange={(e) => {
                      const updated = [...questionForm.associableHotspots];
                      updated[index].matchMax = Number.parseInt(e.target.value);
                      setQuestionForm((prev) => ({
                        ...prev,
                        associableHotspots: updated,
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
            <h4 className="font-medium mt-4">
              Correct Pairs (Source ID, Target ID)
            </h4>
            {questionForm.correctPairs.map((pair, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border p-2 rounded-lg bg-slate-50"
              >
                {/* @ts-ignore */}
                <InputField
                  label="Source ID"
                  value={pair[0]}
                  onChange={(e) => updateCorrectPair(index, 0, e.target.value)}
                />
                {/* @ts-ignore */}
                <InputField
                  label="Target ID"
                  value={pair[1]}
                  onChange={(e) => updateCorrectPair(index, 1, e.target.value)}
                />
                <button
                  onClick={() => removeCorrectPair(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addCorrectPair}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Correct Pair
            </button>
          </div>
        );

      case "hotspot":
        return (
          <div className="space-y-4">
            {/* @ts-ignore */}
            <InputField
              label="Max Choices"
              type="number"
              value={questionForm.maxChoices}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  maxChoices: Number.parseInt(e.target.value),
                }))
              }
            />
            {/* @ts-ignore */}
            <InputField
              label="Object Data (Base64 or URL)"
              value={questionForm.objectData}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  objectData: e.target.value,
                }))
              }
            />
            <h4 className="font-medium">Hotspots</h4>
            {questionForm.hotspots.map((hotspot, index) => (
              <div key={index} className="border p-3 rounded-lg bg-slate-50">
                <div className="grid grid-cols-3 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Identifier"
                    value={hotspot.identifier}
                    onChange={(e) => {
                      const updated = [...questionForm.hotspots];
                      updated[index].identifier = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        hotspots: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Shape"
                    value={hotspot.shape}
                    onChange={(e) => {
                      const updated = [...questionForm.hotspots];
                      updated[index].shape = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        hotspots: updated,
                      }));
                    }}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Coordinates"
                    value={hotspot.coords}
                    onChange={(e) => {
                      const updated = [...questionForm.hotspots];
                      updated[index].coords = e.target.value;
                      setQuestionForm((prev) => ({
                        ...prev,
                        hotspots: updated,
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
            <button onClick={addHotspot} className="text-blue-600 text-sm">
              + Add Hotspot
            </button>
          </div>
        );

      case "hottext":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Hottext Content (HTML)
              </label>
              <textarea
                value={questionForm.hottextContent}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    hottextContent: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md font-mono text-sm"
                placeholder='<p>This is a <hottext identifier="H1">sample</hottext> text.</p>'
              />
            </div>
            {/* @ts-ignore */}
            <InputField
              label="Correct Hottext Identifiers (comma-separated)"
              value={questionForm.hottextIdentifiers.join(", ")}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  hottextIdentifiers: e.target.value
                    .split(",")
                    .map((s) => s.trim()),
                }))
              }
            />
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Lower Bound"
                type="number"
                value={questionForm.lowerBound}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    lowerBound: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Upper Bound"
                type="number"
                value={questionForm.upperBound}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    upperBound: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Step"
                type="number"
                value={questionForm.step}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    step: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Correct Value"
                type="number"
                value={questionForm.correctValue}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    correctValue: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            {/** @ts-ignore */}
            <InputField
              label="Background Image URL (optional)"
              value={questionForm.imageUrl}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
              required={false}
            />
          </div>
        );

      case "drawing":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Canvas Width"
                type="number"
                value={questionForm.canvasWidth}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    canvasWidth: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Canvas Height"
                type="number"
                value={questionForm.canvasHeight}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    canvasHeight: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            {/* @ts-ignore */}
            <InputField
              label="Background Object Data (optional)"
              value={questionForm.objectData}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  objectData: e.target.value,
                }))
              }
              required={false}
            />
          </div>
        );

      case "media":
        return (
          <div className="space-y-4">
            {/* @ts-ignore */}
            <InputField
              label="Media URL"
              value={questionForm.mediaUrl}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  mediaUrl: e.target.value,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Media Type
                </label>
                <select
                  value={questionForm.mediaType}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      mediaType: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
                >
                  <option value="video/mp4">Video (MP4)</option>
                  <option value="audio/mp3">Audio (MP3)</option>
                  <option value="audio/wav">Audio (WAV)</option>
                </select>
              </div>
              {/* @ts-ignore */}
              <InputField
                label="Correct Answer"
                value={questionForm.correctAnswer}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    correctAnswer: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Min Plays"
                type="number"
                value={questionForm.minPlays}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    minPlays: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Max Plays"
                type="number"
                value={questionForm.maxPlays}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxPlays: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.autostart}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      autostart: e.target.checked,
                    }))
                  }
                />
                Autostart
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={questionForm.loop}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      loop: e.target.checked,
                    }))
                  }
                />
                Loop
              </label>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-4">
            <InputField
              label="Allowed File Types (comma-separated)"
              value={questionForm.allowedTypes.join(", ")}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  allowedTypes: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
              // @ts-ignore
              placeholder="application/pdf, image/jpeg, image/png"
            />
            <div className="grid grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Max File Size (bytes)"
                type="number"
                value={questionForm.maxSize}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxSize: Number.parseInt(e.target.value),
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Max Files"
                type="number"
                value={questionForm.maxFiles}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    maxFiles: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        );
      case "xml":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                XML Content
              </label>
              <textarea
                value={questionForm.xml}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    xml: e.target.value,
                  }))
                }
                rows={20}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm font-mono text-xs"
                placeholder="Paste your QTI XML here..."
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Metadata</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["subject", "grade", "standard", "lesson", "difficulty"].map(
                  (field) => (
                    //@ts-ignore
                    <InputField
                      key={field}
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={
                        questionForm.metadata[
                          field as keyof typeof questionForm.metadata
                        ]
                      }
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            [field]: e.target.value,
                          },
                        }))
                      }
                      required={false}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Form for {questionType} question type is coming soon...
            </p>
          </div>
        );
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  // Enhanced Pagination Component
  const PaginationControls = ({
    pagination,
    onPageChange,
    onLimitChange,
    label,
  }) => {
    const getPageNumbers = () => {
      const pages = [];
      const { currentPage, totalPages } = pagination;
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
          pages.push(1);
          if (startPage > 2) pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }

        if (endPage < totalPages) {
          if (endPage < totalPages - 1) pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pages = getPageNumbers();

    return (
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-t rounded-b-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalCount
            )}{" "}
            of {pagination.totalCount} {label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Per page:</label>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number.parseInt(e.target.value))}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {pages.map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 py-1 text-sm text-slate-500">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    pagination.currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">
          QTI Assignment Creator
        </h2>

        {/* Created IDs Display */}
        {(createdIds.questions.length > 0 ||
          createdIds.tests.length > 0 ||
          createdIds.stimuli.length > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">
              Recently Created IDs:
            </h4>
            {createdIds.questions.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-green-700">Questions: </span>
                {createdIds.questions.slice(-3).map((id) => (
                  <button
                    key={id}
                    onClick={() => copyToClipboard(id, "Question ID")}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 hover:bg-green-200"
                  >
                    {id} <ClipboardCopy className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
            {createdIds.stimuli.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-green-700">Stimuli: </span>
                {createdIds.stimuli.slice(-3).map((id) => (
                  <button
                    key={id}
                    onClick={() => copyToClipboard(id, "Stimulus ID")}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 hover:bg-green-200"
                  >
                    {id} <ClipboardCopy className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
            {createdIds.tests.length > 0 && (
              <div>
                <span className="text-sm text-green-700">Tests: </span>
                {createdIds.tests.slice(-3).map((id) => (
                  <button
                    key={id}
                    onClick={() => copyToClipboard(id, "Test ID")}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 hover:bg-green-200"
                  >
                    {id} <ClipboardCopy className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <TabButton
          id="create"
          label="Create Questions"
          icon={BookOpen}
          isActive={activeTab === "create"}
          onClick={() => setActiveTab("create")}
        />
        <TabButton
          id="bank"
          label="Question Bank"
          icon={Database}
          isActive={activeTab === "bank"}
          onClick={() => setActiveTab("bank")}
        />
        <TabButton
          id="stimulus"
          label="Stimulus Library"
          icon={FileText}
          isActive={activeTab === "stimulus"}
          onClick={() => setActiveTab("stimulus")}
        />
        <TabButton
          id="test"
          label="Build Tests"
          icon={Settings}
          isActive={activeTab === "test"}
          onClick={() => setActiveTab("test")}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "create" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">Create New Question</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* @ts-ignore */}
              <InputField
                label="Identifier"
                value={questionForm.identifier}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    identifier: e.target.value,
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Title"
                value={questionForm.title}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prompt
              </label>
              <textarea
                value={questionForm.prompt}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Stimulus Identifier Field */}
            <div>
              <label
                htmlFor="stimulusIdentifier"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Stimulus Identifier (Optional)
              </label>
              <select
                id="stimulusIdentifier"
                value={questionForm.stimulusIdentifier}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    stimulusIdentifier: e.target.value,
                  }))
                }
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select an existing stimulus --</option>
                {stimuli.map((s) => (
                  <option key={s.identifier} value={s.identifier}>
                    {s.title} ({s.identifier})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select an existing stimulus or leave blank if no stimulus is
                needed.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Metadata</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["subject", "grade", "standard", "lesson", "difficulty"].map(
                  (field) => (
                    // @ts-ignore
                    <InputField
                      key={field}
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={
                        questionForm.metadata[
                          field as keyof typeof questionForm.metadata
                        ]
                      }
                      onChange={(e) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            [field]: e.target.value,
                          },
                        }))
                      }
                      required={false}
                    />
                  )
                )}
              </div>
            </div>

            <div className="border-t pt-4">{renderQuestionForm()}</div>

            <button
              onClick={addQuestionToBank}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" /> Create Question
            </button>
          </div>
        </div>
      )}

      {activeTab === "bank" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Question Bank</h3>
            <span className="text-sm text-slate-500">
              {questionsPagination.totalCount} total questions
            </span>
          </div>

          <div className="space-y-2 h-96 overflow-y-auto mb-4">
            {questions.map((q) => (
              <div
                key={q.identifier}
                onClick={() => toggleQuestionSelection(q.identifier)}
                className={`p-4 rounded-lg cursor-pointer border-2 flex items-center gap-3 ${
                  selectedQuestions.includes(q.identifier)
                    ? "bg-blue-100 border-blue-500"
                    : "bg-slate-50 border-transparent hover:border-blue-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(q.identifier)}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-grow">
                  <div className="font-medium">{q.title}</div>
                  <div className="text-sm text-slate-500">
                    {q.type} • {q.identifier}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQtiQuestion(q.identifier);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(q.identifier, "Question ID");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No questions found
              </p>
            )}
          </div>

          {/* Pagination */}
          {questionsPagination.totalCount > 0 && (
            <PaginationControls
              pagination={questionsPagination}
              onPageChange={(page) => loadQuestions(page)}
              onLimitChange={(limit) => loadQuestions(1, limit)}
              label="questions"
            />
          )}

          {selectedQuestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                {selectedQuestions.length} question
                {selectedQuestions.length !== 1 ? "s" : ""} selected for test
                creation
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "stimulus" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">Stimulus Library</h3>

          {/* Create New Stimulus Form */}
          <div className="p-4 border border-slate-200 rounded-lg mb-6 bg-slate-50">
            <h4 className="font-medium mb-3">Create New Stimulus</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* @ts-ignore */}
              <InputField
                label="Identifier"
                value={stimulusForm.identifier}
                onChange={(e) =>
                  setStimulusForm((prev) => ({
                    ...prev,
                    identifier: e.target.value,
                  }))
                }
              />
              {/* @ts-ignore */}
              <InputField
                label="Title"
                value={stimulusForm.title}
                onChange={(e) =>
                  setStimulusForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content (HTML)
              </label>
              <textarea
                value={stimulusForm.content}
                onChange={(e) =>
                  setStimulusForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={5}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm font-mono text-sm"
                placeholder="Enter HTML content for the stimulus here..."
              />
            </div>
            <button
              onClick={addStimulusToLibrary}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" /> Create Stimulus
            </button>
          </div>

          {/* Existing Stimuli List */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-slate-700">Existing Stimuli</h4>
            <span className="text-sm text-slate-500">
              {stimuliPagination.totalCount} total stimuli
            </span>
          </div>

          <div className="space-y-2 h-96 overflow-y-auto mb-4">
            {stimuli.map((s) => (
              <div
                key={s.identifier}
                className="p-4 rounded-lg border-2 flex items-center gap-3 bg-slate-50"
              >
                <div className="flex-grow">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-slate-500">{s.identifier}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">
                    {s.content}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(s.identifier, "Stimulus ID");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </div>
            ))}
            {stimuli.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No stimuli found
              </p>
            )}
          </div>

          {/* Pagination */}
          {stimuliPagination.totalCount > 0 && (
            <PaginationControls
              pagination={stimuliPagination}
              onPageChange={(page) => loadStimuli(page)}
              onLimitChange={(limit) => loadStimuli(1, limit)}
              label="stimuli"
            />
          )}
        </div>
      )}

      {activeTab === "test" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-xl font-semibold mb-4">Build Assessment Test</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">Test Configuration</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* @ts-ignore */}
                <InputField
                  label="Test Identifier (optional)"
                  value={testConfig.identifier}
                  onChange={(e) =>
                    setTestConfig((prev) => ({
                      ...prev,
                      identifier: e.target.value,
                    }))
                  }
                  required={false}
                />
                {/* @ts-ignore */}
                <InputField
                  label="Test Title"
                  value={testConfig.title}
                  onChange={(e) =>
                    setTestConfig((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* @ts-ignore */}
                <InputField
                  label="Time Limit (minutes)"
                  type="number"
                  value={testConfig.timeLimit}
                  onChange={(e) =>
                    setTestConfig((prev) => ({
                      ...prev,
                      timeLimit: Number.parseInt(e.target.value),
                    }))
                  }
                />
                {/* @ts-ignore */}
                <InputField
                  label="Max Attempts"
                  type="number"
                  value={testConfig.maxAttempts}
                  onChange={(e) =>
                    setTestConfig((prev) => ({
                      ...prev,
                      maxAttempts: Number.parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Navigation Mode
                  </label>
                  <select
                    value={testConfig.navigationMode}
                    onChange={(e) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        navigationMode: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="linear">Linear</option>
                    <option value="nonlinear">Non-linear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Submission Mode
                  </label>
                  <select
                    value={testConfig.submissionMode}
                    onChange={(e) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        submissionMode: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="individual">Individual</option>
                    <option value="simultaneous">Simultaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Tools Enabled</h5>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(testConfig.toolsEnabled).map(
                    ([tool, enabled]) => (
                      <label
                        key={tool}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            setTestConfig((prev) => ({
                              ...prev,
                              toolsEnabled: {
                                ...prev.toolsEnabled,
                                [tool]: e.target.checked,
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        {tool.charAt(0).toUpperCase() + tool.slice(1)}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Test Metadata</h5>
                <div className="grid grid-cols-3 gap-4">
                  {/* @ts-ignore */}
                  <InputField
                    label="Subject"
                    value={testConfig.metadata.subject}
                    onChange={(e) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, subject: e.target.value },
                      }))
                    }
                    required={false}
                  />
                  {/* @ts-ignore */}
                  <InputField
                    label="Grade"
                    value={testConfig.metadata.grade}
                    onChange={(e) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, grade: e.target.value },
                      }))
                    }
                    required={false}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={testConfig.metadata.difficulty}
                      onChange={(e) =>
                        setTestConfig((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            difficulty: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Questions & Actions */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">
                Selected Questions ({selectedQuestions.length})
              </h4>

              <div className="h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {selectedQuestions.length > 0 ? (
                  selectedQuestions.map((questionId) => {
                    const question = questions.find(
                      (q) => q.identifier === questionId
                    );
                    return (
                      <div
                        key={questionId}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded mb-2"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {question?.title || questionId}
                          </div>
                          <div className="text-xs text-slate-500">
                            {questionId}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleQuestionSelection(questionId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    No questions selected. Go to Question Bank tab to select
                    questions.
                  </p>
                )}
              </div>

              <button
                onClick={handleCreateTest}
                disabled={selectedQuestions.length === 0 || !testConfig.title}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-sm transition-colors"
              >
                <Save className="w-5 h-5" /> Create Assessment Test
              </button>
            </div>
          </div>

          {/* Created Tests List */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-slate-700">Created Tests</h4>
              <span className="text-sm text-slate-500">
                {testsPagination.totalCount} total tests
              </span>
            </div>

            <div className="space-y-2 h-48 overflow-y-auto">
              {tests.map((test) => (
                <div
                  key={test.identifier}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-sm text-slate-500">
                      {test.identifier}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${QTI_API_BASE_URL}/assessment-tests/${test.identifier}`,
                        "Test URL"
                      )
                    }
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy URL <ClipboardCopy className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {tests.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No tests found
                </p>
              )}
            </div>

            {/* Tests Pagination */}
            {testsPagination.totalCount > 0 && (
              <PaginationControls
                pagination={testsPagination}
                onPageChange={(page) => loadTests(page)}
                onLimitChange={(limit) => loadTests(1, limit)}
                label="tests"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
