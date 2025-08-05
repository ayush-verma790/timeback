// @ts-nocheck
"use client";

import { useState, useContext } from "react";
import { ArrowLeft, Check, Copy, Save } from "lucide-react";
import { AppContext } from "../../context/app-context";
import { InputField } from "../common/input-field";

const resourceTypeFields = {
  common: [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "vendorResourceId",
      label: "Vendor Resource ID",
      type: "text",
      required: true,
    },
    { name: "vendorId", label: "Vendor ID", type: "text", required: true },
    {
      name: "applicationId",
      label: "Application ID",
      type: "text",
      required: true,
    },
    {
      name: "roles",
      label: "Roles (comma-separated)",
      type: "select",
      options: ["primary", "secondary"],

      required: false,
    },
    {
      name: "importance",
      label: "Importance",
      type: "select",
      options: ["primary", "secondary"],
      required: true,
    },
    { name: "importance", label: "Importance", type: "text", required: false },
  ],
  metadata: {
    // Common metadata fields
    all: [
      {
        name: "metadata.subject",
        label: "Subject",
        type: "text",
        required: false,
      },
      {
        name: "metadata.grades",
        label: "Grades (comma-separated)",
        type: "text",
        required: false,
      },
      {
        name: "metadata.language",
        label: "Language (e.g., en-US)",
        type: "text",
        required: false,
      },
      {
        name: "metadata.keywords",
        label: "Keywords (comma-separated)",
        type: "text",
        required: false,
      },
      {
        name: "metadata.xp",
        label: "Experience Points (XP)",
        type: "number",
        required: false,
      },
      {
        name: "metadata.url",
        label: "Resource URL",
        type: "url",
        required: false,
      },
    ],
    // QTI specific fields
    qti: [
      {
        name: "metadata.subType",
        label: "Sub Type",
        type: "select",
        options: ["qti-question", "qti-test", "qti-test-bank", "qti-stimulus"],
        required: true,
      },
      {
        name: "metadata.lessonType",
        label: "Lesson Type",
        type: "select",
        options: ["powerpath-100", "quiz", "test-out", "placement"],
        required: false,
      },
    ],
    // Textual specific fields
    text: [
      {
        name: "metadata.format",
        label: "Format",
        type: "select",
        options: ["pdf", "epub", "docx", "html"],
        required: false,
      },
      {
        name: "metadata.author",
        label: "Author",
        type: "text",
        required: false,
      },
      {
        name: "metadata.pageCount",
        label: "Page Count",
        type: "number",
        required: false,
      },
      {
        name: "metadata.wordLength",
        label: "Word Length",
        type: "number",
        required: false,
      },
    ],
    // Audio specific fields
    audio: [
      {
        name: "metadata.duration",
        label: "Duration (HH:MM:SS)",
        type: "text",
        required: false,
      },
      {
        name: "metadata.format",
        label: "Format",
        type: "select",
        options: ["mp3", "wav"],
        required: false,
      },
      {
        name: "metadata.speaker",
        label: "Speaker",
        type: "text",
        required: false,
      },
    ],
    // Video specific fields
    video: [
      {
        name: "metadata.duration",
        label: "Duration (HH:MM:SS)",
        type: "text",
        required: false,
      },
      {
        name: "metadata.captionsAvailable",
        label: "Captions Available",
        type: "checkbox",
        required: false,
      },
      {
        name: "metadata.format",
        label: "Format",
        type: "select",
        options: ["mp4", "webm", "mov"],
        required: false,
      },
    ],
    // Interactive specific fields
    interactive: [
      {
        name: "metadata.launchUrl",
        label: "Launch URL",
        type: "url",
        required: false,
      },
      {
        name: "metadata.toolProvider",
        label: "Tool Provider",
        type: "text",
        required: false,
      },
      {
        name: "metadata.activityType",
        label: "Activity Type",
        type: "text",
        required: false,
      },
      {
        name: "metadata.instructionalMethod",
        label: "Instructional Method",
        type: "text",
        required: false,
      },
    ],
    // Visual specific fields
    visual: [
      {
        name: "metadata.format",
        label: "Format",
        type: "select",
        options: ["png", "jpeg", "svg", "pdf"],
        required: false,
      },
      {
        name: "metadata.resolution",
        label: "Resolution (e.g., 1920x1080)",
        type: "text",
        required: false,
      },
    ],
    // Course material specific fields
    "course-material": [
      {
        name: "metadata.subType",
        label: "Sub Type",
        type: "select",
        options: ["unit", "course", "resource-collection"],
        required: false,
      },
      {
        name: "metadata.author",
        label: "Author",
        type: "text",
        required: false,
      },
      {
        name: "metadata.format",
        label: "Format",
        type: "select",
        options: ["docx", "pdf", "cc"],
        required: false,
      },
      {
        name: "metadata.instructionalMethod",
        label: "Instructional Method",
        type: "text",
        required: false,
      },
    ],
    // Assessment bank specific fields
    "assessment-bank": [
      {
        name: "metadata.resources",
        label: "Resource IDs (comma-separated)",
        type: "text",
        required: true,
      },
    ],
  },
};

export const CreateResource = ({ initialType = "qti" }) => {
  const { navigateTo, addResource }: any = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: "",
    roles: "primary",
    importance: "primary",
    vendorResourceId: `test-ui-${Date.now()}`,
    vendorId: "alpha-incept",
    applicationId: "incept",
    metadata: {
      type: initialType,
      subType: null,
      language: "en-US",
      subject: "",
      grades: "",
      keywords: "",
      url: "",
      xp: 10,
      pageCount: 0,
    },
    qtiContent: "",
  });
  const [createdResource, setCreatedResource] = useState(null);
  const [copied, setCopied] = useState(false);
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
const fieldValue =
  type === "checkbox"
    ? checked
    : type === "number"
    ? Number(value)
    : value;

    if (name.startsWith("metadata.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: fieldValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("Current form data:", formData); // Add this line

    const processedData = {
      ...formData,
      metadata: {
        ...formData.metadata,
        grades: formData.metadata.grades
          ? formData.metadata.grades.split(",").map((g) => Number(g.trim()))
          : [],
        keywords: formData.metadata.keywords
          ? formData.metadata.keywords.split(",").map((k) => k.trim())
          : [],
      },
    };
    const resp = await addResource(processedData);
    console.log(resp.sourcedIdPairs.allocatedSourcedId, "resp");
    setCreatedResource(resp?.sourcedIdPairs.allocatedSourcedId);
    setCopied(false);
    // navigateTo("library");
  };
  const handleCopy = () => {
    if (!createdResource) return;
    console.log(createdResource);
    navigator.clipboard.writeText(createdResource);
    setCopied(true);
    // toast.success("Copied to clipboard!")

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const renderInputField = (field: any) => {
    const { name, label, type, options, required } = field;
    // @ts-ignore
    const value = name.startsWith("metadata.")
      ? formData.metadata[name.split(".")[1]]
      : formData[name];

    if (type === "select") {
      return (
        <div key={name}>
          <label
            htmlFor={name}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={handleChange}
            required={required}
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm"
          >
            <option value="">Select an option</option>
            {options.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (type === "checkbox") {
      return (
        <div key={name} className="flex items-center">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value ? true : false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor={name} className="ml-2 block text-sm text-slate-700">
            {label}
          </label>
        </div>
      );
    } else {
      return (
        <InputField
          key={name}
          label={label}
          name={name}
          type={type}
          value={value || ""}
          onChange={handleChange}
          required={required}
        />
      );
    }
  };

  const renderQtiContentField = () => {
    if (
      formData.metadata.type === "qti" &&
      formData.metadata.subType === "qti-stimulus"
    ) {
      // return (
      //   <div className="col-span-2">
      //     <label
      //       htmlFor="qtiContent"
      //       className="block text-sm font-medium text-slate-700"
      //     >
      //       QTI Stimulus Content (HTML)
      //     </label>
      //     <textarea
      //       id="qtiContent"
      //       name="qtiContent"
      //       value={formData.qtiContent}
      //       onChange={handleChange}
      //       rows={6}
      //       className="mt-1 block w-full p-2 border border-slate-300 rounded-md font-mono text-sm"
      //     />
      //   </div>
      // );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigateTo("library")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-6"
      >
        <h2 className="text-2xl font-bold text-slate-800">
          Create New Resource
        </h2>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceTypeFields.common.map((field) => renderInputField(field))}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">
            Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="metadata.type"
                className="block text-sm font-medium text-slate-700"
              >
                Resource Type
              </label>
              <select
                name="metadata.type"
                id="metadata.type"
                value={formData.metadata.type}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm"
              >
                <option value="qti">QTI</option>
                <option value="text">Textual</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="interactive">Interactive</option>
                <option value="visual">Visual</option>
                <option value="course-material">Course Material</option>
                <option value="assessment-bank">Assessment Bank</option>
              </select>
            </div>

            {/* Common metadata fields */}
            {resourceTypeFields.metadata.all.map((field) =>
              renderInputField(field)
            )}

            {/* Type-specific metadata fields */}
            {resourceTypeFields.metadata[formData.metadata.type]?.map(
              (field: any) => renderInputField(field)
            )}

            {/* Special fields */}
            {renderQtiContentField()}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save className="w-5 h-5" /> Save Resource
          </button>
        </div>
      </form>
      {createdResource && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Resource Created Successfully!
          </h3>

          <div className="flex items-center justify-between p-3 bg-white border border-green-300 rounded-md">
            <code className="text-sm text-gray-800">ID: {createdResource}</code>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Full Response:</h4>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
              {JSON.stringify(createdResource, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
