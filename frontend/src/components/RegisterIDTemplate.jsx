import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/register-id-template";

function RegisterIDTemplate() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [organization, setOrganization] = useState("");
  const [templateClass, setTemplateClass] = useState("");
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Map template_class to numeric ID
  const templateClassMapping = {
    student: 1,
    teacher: 2,
    admin: 3,
    librarian: 4,
    "gym-master": 5,
    "hostel-warden": 6,
  };

  const handleRegisterTemplate = async () => {
    if (!file) {
      setErrorMessage("Please upload a file.");
      return;
    }
    if (!templateName.trim()) {
      setErrorMessage("Please enter a template name.");
      return;
    }
    if (!templateClass) {
      setErrorMessage("Please select a template class.");
      return;
    }

    // Get the numeric ID for the template_class
    const templateId = templateClassMapping[templateClass];
    if (!templateId) {
      setErrorMessage("Invalid template class.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_name", templateName);
    formData.append("organization", organization);
    formData.append("template_class", templateClass);
    formData.append("template_id", templateId); // Send the numeric ID to the backend

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data.message);
      setErrorMessage("");

      // Reset form fields
      setTemplateName("");
      setOrganization("");
      setTemplateClass("");
      setFile(null);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "An error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-xl font-bold mb-4">Register ID Card Template</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Template Name</label>
        <input
          type="text"
          placeholder="Enter Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Organization</label>
        <input
          type="text"
          placeholder="Enter Organization Name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Template Class</label>
        <select
          value={templateClass}
          onChange={(e) => setTemplateClass(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select Template Class</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="librarian">Librarian</option>
          <option value="gym-master">Gym Master</option>
          <option value="hostel-warden">Hostel Warden</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload ID Card Template</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <button
        onClick={handleRegisterTemplate}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Register Template
      </button>

      {result && <p className="mt-4 text-green-500">{result}</p>}
      {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
    </div>
  );
}

export default RegisterIDTemplate;