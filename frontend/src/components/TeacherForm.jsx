import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import InputField from "./InputField";
import WebCam from "./WebCam";
import { dataURLtoBlob } from "../../dataURLtoBlob";

const TeacherForm = ({ type, data = {}, setOpen, relatedData }) => {
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
          user_type: "teacher",
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
          user_type: "teacher",
          card_id: formData.get("cardId"),
          face_image: true,
        }, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        formData.append("faceImage", faceImageResponse.data.file_path);
      }
  
      // Submit the form data
      const response = await axios.post("http://127.0.0.1:5000/api/teachers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data) {
        toast.success("Teacher registered successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Teacher Registration</h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Card ID" name="cardId" inputProps={{ required: true }} />
        <InputField label="Username" name="username" inputProps={{ required: true }} />
        <InputField label="First Name" name="name" inputProps={{ required: true }} />
        <InputField label="Last Name" name="surname" inputProps={{ required: true }} />
        <InputField label="Email" name="email" type="email" inputProps={{ required: true }} />
        <InputField label="Phone" name="phone" inputProps={{ required: true }} />
        <InputField label="Address" name="address" inputProps={{ required: true }} />
        <InputField label="Blood Type" name="bloodType" />
        <InputField label="Department" name="department" />
        <InputField label="Birthday" name="birthday" type="date" inputProps={{ required: true }} />
        <InputField label="Template ID" name="templateId" inputProps={{ required: true }} />
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

export default TeacherForm;