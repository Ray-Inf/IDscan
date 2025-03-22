// import React, { useState } from "react";
// import WebCam from "./WebCam";
// import axios from "axios";

// const Register = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("");
//   const [department, setDepartment] = useState("");
//   const [templateId, setTemplateId] = useState("");
//   const [cardId, setCardId] = useState("");
//   const [admissionYear, setAdmissionYear] = useState("");
//   const [division, setDivision] = useState("");
//   const [idCardImage, setIdCardImage] = useState(null);
//   const [faceImage, setFaceImage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   const handleRegister = async () => {
//     if (!name || !templateId || !cardId || !idCardImage || !faceImage || !admissionYear) {
//       setErrorMessage("Please fill in all required fields and capture images.");
//       return;
//     }

//     // Validate templateId as an integer
//     const parsedTemplateId = parseInt(templateId, 10);
//     if (isNaN(parsedTemplateId)) {
//       setErrorMessage("Template ID must be a valid number.");
//       return;
//     }

//     // Validate admissionYear as a valid year
//     const parsedAdmissionYear = parseInt(admissionYear, 10);
//     if (isNaN(parsedAdmissionYear) || admissionYear.length !== 4) {
//       setErrorMessage("Admission Year must be a valid 4-digit year.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("email", email);
//     formData.append("role", role);
//     formData.append("department", department);
//     formData.append("template_id", parsedTemplateId);
//     formData.append("card_id", cardId);
//     formData.append("admission_year", admissionYear);
//     formData.append("division", division);
//     formData.append("id_card", dataURLtoBlob(idCardImage));
//     formData.append("face_image", dataURLtoBlob(faceImage));

//     try {
//       const response = await axios.post("http://127.0.0.1:5000/api/register-user", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.message) {
//         setSuccessMessage(response.data.message);
//         setErrorMessage(null);
//         // Clear form fields after successful registration
//         setName("");
//         setEmail("");
//         setRole("");
//         setDepartment("");
//         setTemplateId("");
//         setCardId("");
//         setAdmissionYear("");
//         setDivision("");
//         setIdCardImage(null);
//         setFaceImage(null);
//       }
//     } catch (error) {
//       console.error("Error during registration:", error);
//       setErrorMessage(error.response?.data?.error || "An error occurred while registering. Please try again.");
//     }
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const byteString = atob(dataURL.split(",")[1]);
//     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
//     const arrayBuffer = new ArrayBuffer(byteString.length);
//     const uint8Array = new Uint8Array(arrayBuffer);
//     for (let i = 0; i < byteString.length; i++) {
//       uint8Array[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([arrayBuffer], { type: mimeString });
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Register</h2>
//       <input
//         type="text"
//         placeholder="Enter your name *"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="border p-2 mb-4 w-full"
//         required
//       />
//       <input
//         type="email"
//         placeholder="Enter your email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="border p-2 mb-4 w-full"
//       />
//       <input
//         type="text"
//         placeholder="Enter your role"
//         value={role}
//         onChange={(e) => setRole(e.target.value)}
//         className="border p-2 mb-4 w-full"
//       />
//       <input
//         type="text"
//         placeholder="Enter your department"
//         value={department}
//         onChange={(e) => setDepartment(e.target.value)}
//         className="border p-2 mb-4 w-full"
//       />
//       <input
//         type="number"
//         placeholder="Enter Template ID *"
//         value={templateId}
//         onChange={(e) => setTemplateId(e.target.value)}
//         className="border p-2 mb-4 w-full"
//         required
//       />
//       <input
//         type="text"
//         placeholder="Enter Registration Number (Card ID) *"
//         value={cardId}
//         onChange={(e) => setCardId(e.target.value)}
//         className="border p-2 mb-4 w-full"
//         required
//       />
//       <input
//         type="text"
//         placeholder="Enter Admission Year (YYYY) *"
//         value={admissionYear}
//         onChange={(e) => setAdmissionYear(e.target.value)}
//         className="border p-2 mb-4 w-full"
//         maxLength={4}
//         required
//       />
//       <input
//         type="text"
//         placeholder="Enter Division (if applicable)"
//         value={division}
//         onChange={(e) => setDivision(e.target.value)}
//         className="border p-2 mb-4 w-full"
//       />
//       <div className="mb-4">
//         <h3 className="font-bold">ID Card Image *</h3>
//         {!idCardImage ? (
//           <WebCam onCapture={(imageData) => setIdCardImage(imageData)} />
//         ) : (
//           <div>
//             <img src={idCardImage} alt="ID Card" className="w-64 h-64 object-cover" />
//             <button onClick={() => setIdCardImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
//               Retake Image
//             </button>
//           </div>
//         )}
//       </div>
//       <div className="mb-4">
//         <h3 className="font-bold">Face Image *</h3>
//         {!faceImage ? (
//           <WebCam onCapture={(imageData) => setFaceImage(imageData)} />
//         ) : (
//           <div>
//             <img src={faceImage} alt="Face" className="w-64 h-64 object-cover" />
//             <button onClick={() => setFaceImage(null)} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
//               Retake Image
//             </button>
//           </div>
//         )}
//       </div>
//       {idCardImage && faceImage && (
//         <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-2 rounded">
//           Register
//         </button>
//       )}
//       {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
//       {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
//     </div>
//   );
// };

// export default Register;
import React, { useState, useEffect } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import WebCam from "./WebCam";

const StudentForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [idCardImage, setIdCardImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [cardId, setCardId] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [division, setDivision] = useState("");
  const [address,setAddress] = useState("");
  const [phone,setPhone] = useState("");
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

  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !templateId || !cardId || !idCardImage || !faceImage || !admissionYear) {
      setError("Please fill in all required fields and capture images.");
      setLoading(false);
      return;
    }

    // Validate templateId as an integer
    const parsedTemplateId = parseInt(templateId, 10);
    if (isNaN(parsedTemplateId)) {
      setError("Template ID must be a valid number.");
      setLoading(false);
      return;
    }

    // Validate admissionYear as a valid year
    const parsedAdmissionYear = parseInt(admissionYear, 10);
    if (isNaN(parsedAdmissionYear) || admissionYear.length !== 4) {
      setError("Admission Year must be a valid 4-digit year.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("role", role);
    formData.append("department", department);
    formData.append("template_id", parsedTemplateId);
    formData.append("card_id", cardId);
    formData.append("admission_year", admissionYear);
    formData.append("division", division);
    formData.append("id_card", dataURLtoBlob(idCardImage));
    formData.append("face_image", dataURLtoBlob(faceImage));

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/register-user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message) {
        toast.success("Student registered successfully!");
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

      {/* Name */}
      <InputField
        label="Name *"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        inputProps={{ required: true }}
      />

      {/* Email */}
      <InputField
        label="Email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />

      {/* Role */}
      <InputField
        label="Role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      {/* Department */}
      <InputField
        label="Department"
        name="department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />

      {/* Template ID */}
      <InputField
        label="Template ID *"
        name="templateId"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        type="number"
        inputProps={{ required: true }}
      />

      {/* Card ID */}
      <InputField
        label="Registration Number (Card ID) *"
        name="cardId"
        value={cardId}
        onChange={(e) => setCardId(e.target.value)}
        inputProps={{ required: true }}
      />

      {/* Admission Year */}
      <InputField
        label="Admission Year (YYYY) *"
        name="admissionYear"
        value={admissionYear}
        onChange={(e) => setAdmissionYear(e.target.value)}
        inputProps={{ required: true, maxLength: 4 }}
      />

      {/* Division */}
      <InputField
        label="phone no"
        name="phn"
        value={phone}
        onChange={(e) => setDivision(e.target.value)}
      />
      <InputField
        label="address"
        name="address"
        value={address}
        onChange={(e) => setDivision(e.target.value)}
      />
      <InputField
        label="Division (if applicable)"
        name="division"
        value={division}
        onChange={(e) => setDivision(e.target.value)}
      />

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