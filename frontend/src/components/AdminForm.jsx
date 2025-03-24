import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import InputField from "./InputField";
import { dataURLtoBlob } from "../../dataURLtoBlob";
import WebCam from "./WebCam";

const AdminForm = () => {
  const [idCardImage, setIdCardImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const formData = new FormData(e.target);
  
      // Upload new ID Card Image if provided
      if (idCardImage) {
        const idCardResponse = await axios.post("http://127.0.0.1:5000/api/upload-image", {
          file: dataURLtoBlob(idCardImage),
          user_type: "admin",
          card_id: formData.get("cardId"),
          id_card: true,
        }, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        formData.append("idCardImage", idCardResponse.data.file_path);
      }
  
      // Upload new Face Image if provided
      if (faceImage) {
        const faceImageResponse = await axios.post("http://127.0.0.1:5000/api/upload-image", {
          file: dataURLtoBlob(faceImage),
          user_type: "admin",
          card_id: formData.get("cardId"),
          face_image: true,
        }, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        formData.append("faceImage", faceImageResponse.data.file_path);
      }
  
      // Submit the form data
      const response = await axios.post("http://127.0.0.1:5000/api/admins", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data) {
        toast.success("Admin registered successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Admin Registration</h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Username" name="username" inputProps={{ required: true }} />
        <InputField label="Card ID" name="cardId" inputProps={{ required: true }} />
        <InputField label="Full Name" name="name" inputProps={{ required: true }} />
        <InputField label="Email" name="email" type="email" inputProps={{ required: true }} />
        <InputField label="Role" name="role" inputProps={{ required: true }} />
        <InputField label="Template ID" name="templateId" inputProps={{ required: true }} />
      </div>

      {/* ID Card Image */}
      <div className="mb-4">
        <h3 className="font-bold">ID Card Image *</h3>
        {!idCardImage ? (
          <WebCam onCapture={(imageData) => setIdCardImage(imageData)} />
        ) : (
          <div>
            <img src={idCardImage} alt="ID Card" className="w-64 h-64 object-cover" />
            <button onClick={() => setIdCardImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
              Retake Image
            </button>
          </div>
        )}
      </div>

      {/* Face Image */}
      <div className="mb-4">
        <h3 className="font-bold">Face Image *</h3>
        {!faceImage ? (
          <WebCam onCapture={(imageData) => setFaceImage(imageData)} />
        ) : (
          <div>
            <img src={faceImage} alt="Face" className="w-64 h-64 object-cover" />
            <button onClick={() => setFaceImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
              Retake Image
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md" disabled={loading}>
        {loading ? "Processing..." : "Register"}
      </button>
    </form>
  );
};

export default AdminForm;