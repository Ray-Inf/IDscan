
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputField from "./InputField";

const TeacherForm = ({ type, data, setOpen, subjects = [], classes = [] }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]); // State for selected classes
  // const [availableSubjects, setAvailableSubjects] = useState(subjects);
  const [availableSubjects, setAvailableSubjects] = useState(Array.isArray(subjects) ? subjects : []);

  const [availableClasses, setAvailableClasses] = useState(classes); // State for available classes

  useEffect(() => {
    // Fetch subjects from the backend if not provided as a prop
    if (availableSubjects.length === 0) {
      axios.get("http://127.0.0.1:5000/api/subjects")
        .then(response => {
          setAvailableSubjects(response.data.data);
        })
        .catch(error => {
          console.error("Error fetching subjects:", error);
        });
    }

    // Fetch classes from the backend if not provided as a prop
    if (availableClasses.length === 0) {
      axios.get("http://127.0.0.1:5000/api/classes")
        .then(response => {
          setAvailableClasses(response.data.data);
        })
        .catch(error => {
          console.error("Error fetching classes:", error);
        });
    }

    // Set selected subjects and classes if updating an existing teacher
    if (type === "update" && data?.subjects) {
      setSelectedSubjects(data.subjects.map(s => s.id.toString()));
    }
    if (type === "update" && data?.classes) {
      setSelectedClasses(data.classes.map(c => c.id.toString()));
    }
  }, [type, data, availableSubjects, availableClasses]);

  const handleSubjectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedSubjects(selectedValues);
  };

  const handleClassChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedClasses(selectedValues);
  };

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
      const payload = Object.fromEntries(formData.entries());

      // Debugging: Log the payload before sending
      console.log("Payload being sent:", payload);

      // Handle image upload
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        try {
          const uploadResponse = await axios.post("http://127.0.0.1:5000/api/upload", imageFormData);
          if (uploadResponse.data && uploadResponse.data.imageUrl) {
            payload.img = uploadResponse.data.imageUrl;
          }
        } catch (uploadErr) {
          console.error("Error uploading image:", uploadErr);
        }
      }

      // Convert subjects and classes to array of numbers
      payload.subjects = selectedSubjects.map(Number);
      payload.classes = selectedClasses.map(Number);

      

      // Format the birthday field as an ISO 8601 string
      if (payload.birthday) {
        const birthdayDate = new Date(payload.birthday);
        payload.birthday = birthdayDate.toISOString();
      }

      // Send the payload directly (without the `data` wrapper)
      const endpoint = type === "create" 
        ? "http://127.0.0.1:5000/api/teachers" 
        : `http://127.0.0.1:5000/api/teachers/${data.id}`;
      
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      // Debugging: Log the backend response
      console.log("Backend response:", response.data);

      if (response.data) {
        toast.success(`Teacher ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
      }
    } catch (err) {
      console.error("Error details:", err);
      setError(err.response?.data?.error || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new teacher" : "Update teacher information"}
        </h1>
        <button 
          type="button" 
          onClick={() => setOpen(false)} 
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
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
        {/* Add ID field for manual input (only for creation) */}
        {type === "create" && (
          <InputField
            label="ID (Manual Input)"
            name="id"
            type="text"
            required
          />
        )}

        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          required
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          type="email"
          required
        />
        
       
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          required
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          required
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
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
        
        {/* Subject Selection */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            name="subjects"
            multiple
            value={selectedSubjects}
            onChange={handleSubjectChange}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            style={{ height: "120px" }}
          >
            {availableSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
        </div>

        {/* Class Selection */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Classes</label>
          <select
            name="classes"
            multiple
            value={selectedClasses}
            onChange={handleClassChange}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            style={{ height: "120px" }}
          >
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple classes</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-gray-300 text-gray-700 p-2 rounded-md px-4"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md px-4"
          disabled={loading}
        >
          {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;