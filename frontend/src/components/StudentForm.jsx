
import React, { useState, useEffect } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // Initialize form data with existing data for update
  useEffect(() => {
    if (type === "update" && data?.profileImage) {
      setImagePreview(data.profileImage);
    }
  }, [type, data]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData);

      // Convert IDs to integers if they exist and are not empty
      if (payload.gradeId && payload.gradeId !== "") payload.gradeId = parseInt(payload.gradeId);
      if (payload.classId && payload.classId !== "") payload.classId = parseInt(payload.classId);

      // Remove the password field (it doesn't exist in the schema)
      delete payload.password;

      // Handle image upload separately if we have a file
      if (imageFile) {
          const imageFormData = new FormData();
          imageFormData.append('image', imageFile);
          
          // Upload the image first
          const uploadResponse = await axios.post("http://127.0.0.1:5000/api/upload", imageFormData);
          if (uploadResponse.data && uploadResponse.data.imageUrl) {
              payload.profileImage = uploadResponse.data.imageUrl;
          }
      }

      // Ensure parentId is provided and properly formatted
      if (!payload.parentId || payload.parentId === "") {
          throw new Error("Parent ID is required");
      }

      // Convert birthday to a valid ISO-8601 DateTime format
      if (payload.birthday) {
          payload.birthday = new Date(payload.birthday).toISOString();
      }

      // Prepare the payload for Prisma
      const prismaPayload = {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          name: payload.name,
          surname: payload.surname,
          phone: payload.phone,
          address: payload.address,
          bloodType: payload.bloodType,
          birthday: payload.birthday, // Ensure this is in ISO-8601 format
          sex: payload.sex,
          parentId: payload.parentId, // Send parentId directly
          gradeId: payload.gradeId,   // Send gradeId directly
          classId: payload.classId,   // Send classId directly
          img: payload.profileImage || null, // Handle profile image
      };

      console.log("🛠️ Processed Data for Creation:", prismaPayload);

      const endpoint = type === "create" 
          ? "http://127.0.0.1:5000/api/students" 
          : `http://127.0.0.1:5000/api/students/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, prismaPayload);

      if (response.data) {
          toast.success(`Student ${type === "create" ? "created" : "updated"} successfully!`);
          setOpen(false);
          navigate(0); // Refresh the page
      }
  } catch (err) {
      console.error("Form submission error:", err);
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
      
      {/* Image Upload Section */}
      <div className="flex flex-col items-center gap-2 w-full">
        <label className="text-xs text-gray-500">Profile Image</label>
        {imagePreview && (
          <div className="mb-2">
            <img 
              src={imagePreview} 
              alt="Profile Preview" 
              className="w-24 h-24 object-cover rounded-full"
            />
          </div>
        )}
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full max-w-xs"
        />
      </div>

      <div className="flex justify-between flex-wrap gap-4">
      <InputField
  label="Student ID"
  name="id"
  defaultValue={data?.id || ""}
  type="number"
  inputProps={{ required: true }} // Make it mandatory
/>

        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username || ""}
          inputProps={{ required: true }}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email || ""}
          type="email"
          inputProps={{ required: true }}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue=""
          inputProps={{ 
            required: type === "create",
            placeholder: type === "update" ? "Leave blank to keep current password" : ""
          }}
        />
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name || ""}
          inputProps={{ required: true }}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname || ""}
          inputProps={{ required: true }}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone || ""}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address || ""}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType || ""}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday || ""}
          type="date"
        />
        <InputField
          label="Parent ID"
          name="parentId"
          defaultValue={data?.parentId || ""}
        />
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
        <InputField
          label="Grade ID"
          name="gradeId"
          defaultValue={data?.gradeId || ""}
          type="number"
          inputProps={{ required: true }}
        />
        <InputField
          label="Class ID"
          name="classId"
          defaultValue={data?.classId || ""}
          type="number"
          inputProps={{ required: true }}
        />
        <InputField
          label="Class ID"
          name="classId"
          defaultValue={data?.classId || ""}
          type="number"
          inputProps={{ required: true }}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={loading}
      >
        {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;