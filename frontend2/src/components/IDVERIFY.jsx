import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Replace with your backend URL

function IDVERIFY() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [result, setResult] = useState('');

  const handleRegisterTemplate = async () => {
    if (!file || !templateName) {
      alert('Please upload a file and enter a template name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('template_name', templateName);

    try {
      const response = await axios.post(`${API_URL}/register-id-template`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.message);
    } catch (error) {
      setResult('Error registering ID card template.');
    }
  };

  const handleVerifyIDCard = async () => {
    if (!file) {
      alert('Please upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/verify-id-card`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.message);
    } catch (error) {
      setResult('Error verifying ID card.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ID Card Verification System</h1>

      <div>
        <h2>Register ID Card Template</h2>
        <input type="text" placeholder="Template Name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleRegisterTemplate}>Register Template</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Verify ID Card</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleVerifyIDCard}>Verify ID Card</button>
      </div>

      {result && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{result}</p>}
    </div>
  );
}

export default IDVERIFY;