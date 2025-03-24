import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import WebCam from "./WebCam";
import { dataURLtoBlob } from "../../dataURLtoBlob";

const StudentForm = ({ type, data = {}, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [idCardImage, setIdCardImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      // Create form data from the form
      const formData = new FormData(e.target);
      
      // Upload ID Card Image if provided
      if (idCardImage) {
        const idCardFormData = new FormData();
        idCardFormData.append("file", dataURLtoBlob(idCardImage), "idcard.jpg");
        idCardFormData.append("user_type", "student");
        idCardFormData.append("card_id", formData.get("cardId"));
        idCardFormData.append("id_card", "true");
        
        const idCardResponse = await axios.post(
          "http://127.0.0.1:5000/api/upload-image", 
          idCardFormData
        );
        formData.append("idCardImage", idCardResponse.data.file_path);
      }
  
      // Upload Face Image if provided
      if (faceImage) {
        const faceFormData = new FormData();
        faceFormData.append("file", dataURLtoBlob(faceImage), "face.jpg");
        faceFormData.append("user_type", "student");
        faceFormData.append("card_id", formData.get("cardId"));
        faceFormData.append("face_image", "true");
        
        const faceImageResponse = await axios.post(
          "http://127.0.0.1:5000/api/upload-image", 
          faceFormData
        );
        formData.append("faceImage", faceImageResponse.data.file_path);
      }
      
      // Debug data before sending
      console.log("🚀 FormData before sending:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value, `(Type: ${typeof value})`);
      }
      
      // Submit the form data
      const response = await axios.post(
        "http://127.0.0.1:5000/api/students", 
        formData
      );
  
      if (response.data) {
        toast.success("Student registered successfully!");
        if (setOpen) setOpen(false);
        else navigate("/students");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.error || err.message || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Card ID" name="cardId" defaultValue={data?.cardId || ""} inputProps={{ required: true }} />
        <InputField label="Username" name="username" defaultValue={data?.username || ""} inputProps={{ required: true }} />
        <InputField label="First Name" name="name" defaultValue={data?.name || ""} inputProps={{ required: true }} />
        <InputField label="Last Name" name="surname" defaultValue={data?.surname || ""} inputProps={{ required: true }} />
        <InputField label="Email" name="email" defaultValue={data?.email || ""} type="email" inputProps={{ required: true }} />
        <InputField label="Phone" name="phone" defaultValue={data?.phone || ""} />
        <InputField label="Address" name="address" defaultValue={data?.address || ""} />
        <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType || ""} />
        <InputField label="Birthday" name="birthday" defaultValue={data?.birthday || ""} type="date" />
        <InputField label="Parent ID" name="parentId" defaultValue={data?.parentId || ""} inputProps={{ required: true }} />
        <InputField label="Class ID" name="classId" defaultValue={data?.classId || 0} type="number" inputProps={{ required: true }} />
        <InputField label="Grade ID" name="gradeId" defaultValue={data?.gradeId || 0} type="number" inputProps={{ required: true }} />
        <InputField label="Template ID" name="templateId" defaultValue={data?.templateId || ""} inputProps={{ required: true }} />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            name="sex"
            defaultValue={data?.sex || ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      {/* ID Card Image */}
      <div className="mb-4">
        <h3 className="font-bold">ID Card Image *</h3>
        {!idCardImage ? (
          <WebCam onCapture={(imageData) => setIdCardImage(imageData)} />
        ) : (
          <div>
            <img src={idCardImage} alt="ID Card" className="w-64 h-64 object-cover" />
            <button type="button" onClick={() => setIdCardImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
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
            <button type="button" onClick={() => setFaceImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
              Retake Image
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md" disabled={loading}>
        {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;