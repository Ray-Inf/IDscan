import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

function RegisterIDTemplate() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [organization, setOrganization] = useState("");
  const [templateClass, setTemplateClass] = useState("");
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegisterTemplate = async () => {
    // Validate inputs
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_name", templateName);
    formData.append("organization", organization);
    formData.append("template_class", templateClass);

    try {
      const response = await axios.post(`${API_URL}/register-id-template`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data.message);
      setErrorMessage(""); // Clear any previous error messages

      // Reset form fields after successful registration
      setTemplateName("");
      setOrganization("");
      setTemplateClass("");
      setFile(null);
    } catch (error) {
      if (error.response) {
        // Backend returned an error response
        setErrorMessage(error.response.data.error || "An error occurred.");
      } else {
        // Network or other errors
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      <h1>Register ID Card Template</h1>

      {/* Form Fields */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input 
        type="text" 
        placeholder="Template Name" 
        value={templateName} 
        onChange={(e) => setTemplateName(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Organization" 
        value={organization} 
        onChange={(e) => setOrganization(e.target.value)} 
      />
      <select value={templateClass} onChange={(e) => setTemplateClass(e.target.value)}>
        <option value="">Select Template Class</option>
        <option value="student">Student</option>
        <option value="staff">Staff</option>
        <option value="faculty">Faculty</option>
      </select>

      {/* Submit Button */}
      <button onClick={handleRegisterTemplate}>Register Template</button>

      {/* Result Messages */}
      {result && <p>{result}</p>}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}

export default RegisterIDTemplate;