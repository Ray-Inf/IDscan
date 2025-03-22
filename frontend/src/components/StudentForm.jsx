
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import InputField from "./InputField";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import WebCam from "./WebCam";

// const StudentForm = ({ type, data = {}, setOpen, relatedData }) => {
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const [idCardImage, setIdCardImage] = useState(null);
//   const [faceImage, setFaceImage] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const formData = new FormData(e.target);
//       const payload = Object.fromEntries(formData);

//       // Convert IDs to integers if they exist and are not empty
//       if (payload.gradeId && payload.gradeId !== "") payload.gradeId =payload.gradeId;
//       if (payload.classId && payload.classId !== "") payload.classId =payload.classId;

//       // Remove the password field (it doesn't exist in the schema)
//       delete payload.password;

//       // Ensure parentId is provided and properly formatted
//       if (!payload.parentId || payload.parentId === "") {
//         throw new Error("Parent ID is required");
//       }

//       // Convert birthday to a valid ISO-8601 DateTime format
//       if (payload.birthday) {
//         payload.birthday = new Date(payload.birthday).toISOString();
//       }

//       // Prepare the payload for Prisma
//       const prismaPayload = {
//         id: payload.id,  // Use payload.id instead of data.id
//         username: payload.username,
//         email: payload.email,
//         name: payload.name,
//         surname: payload.surname,
//         phone: payload.phone,
//         address: payload.address,
//         bloodType: payload.bloodType,
//         birthday: payload.birthday,
//         sex: payload.sex,
//         parentId: payload.parentId,
//         gradeId: payload.gradeId,
//         classId: payload.classId,
//         img: payload.profileImage || null,
//       };

//       console.log("🛠️ Processed Data for Creation:", prismaPayload);

//       // Construct the endpoint
//       const endpoint = type === "create" 
//         ? "http://127.0.0.1:5000/api/register-student" 
//         : `http://127.0.0.1:5000/api/students/${payload.id}`;

//       const method = type === "create" ? "post" : "put";

//       const response = await axios[method](endpoint, prismaPayload);

//       if (response.data) {
//         toast.success(`Student ${type === "create" ? "created" : "updated"} successfully!`);
//         setOpen(false);
//         navigate(0); // Refresh the page
//       }
//     } catch (err) {
//       console.error("Form submission error:", err);
//       setError(err.response?.data?.error || err.message || "An error occurred while submitting the form");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new student" : "Update the student"}
//       </h1>
//       {error && <div className="text-red-500 text-sm">{error}</div>}

//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Student ID"
//           name="id"
//           defaultValue={data?.id || ""}
//           type="number"
//           inputProps={{ required: true }} // Make it mandatory
//         />
//         <InputField
//           label="Username"
//           name="username"
//           defaultValue={data?.username || ""}
//           inputProps={{ required: true }}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email || ""}
//           type="email"
//           inputProps={{ required: true }}
//         />
//         <InputField
//           label="Password"
//           name="password"
//           type="password"
//           defaultValue=""
//           inputProps={{ 
//             required: type === "create",
//             placeholder: type === "update" ? "Leave blank to keep current password" : ""
//           }}
//         />
//         <InputField
//           label="First Name"
//           name="name"
//           defaultValue={data?.name || ""}
//           inputProps={{ required: true }}
//         />
//         <InputField
//           label="Last Name"
//           name="surname"
//           defaultValue={data?.surname || ""}
//           inputProps={{ required: true }}
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           defaultValue={data?.phone || ""}
//         />
//         <InputField
//           label="Address"
//           name="address"
//           defaultValue={data?.address || ""}
//         />
//         <InputField
//           label="Blood Type"
//           name="bloodType"
//           defaultValue={data?.bloodType || ""}
//         />
//         <InputField
//           label="Birthday"
//           name="birthday"
//           defaultValue={data?.birthday || ""}
//           type="date"
//         />
//         <InputField
//           label="Parent ID"
//           name="parentId"
//           defaultValue={data?.parentId || ""}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Sex</label>
//           <select
//             name="sex"
//             defaultValue={data?.sex || ""}
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             required
//           >
//             <option value="">Select Gender</option>
//             <option value="MALE">Male</option>
//             <option value="FEMALE">Female</option>
//           </select>
//         </div>
//         <InputField
//           label="Grade ID"
//           name="gradeId"
//           defaultValue={data?.gradeId || ""}
//           type="number"
//           inputProps={{ required: true }}
//         />
//         <InputField
//           label="Class ID"
//           name="classId"
//           defaultValue={data?.classId || ""}
//           type="number"
//           inputProps={{ required: true }}
//         />
//       </div>

//       {/* ID Card Image */}
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

//       {/* Face Image */}
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

//       <button
//         type="submit"
//         className="bg-blue-400 text-white p-2 rounded-md"
//         disabled={loading}
//       >
//         {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
//       </button>
//     </form>
//   );
// };

// export default StudentForm;
import React, { useState, useEffect } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import WebCam from "./WebCam";

const StudentForm = ({ type, data = {}, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [idCardImage, setIdCardImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [debugResponse, setDebugResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugResponse(null);

    try {
      // Validate required images
      if (!idCardImage) {
        throw new Error("ID Card image is required");
      }
      if (!faceImage) {
        throw new Error("Face image is required");
      }

      const formData = new FormData();
      
      // Extract form values
      const formElement = e.target;
      
      // Add all basic fields to formData
      formData.append('id', formElement.id.value);
      formData.append('username', formElement.username.value);
      formData.append('email', formElement.email.value);
      formData.append('name', formElement.name.value);
      formData.append('surname', formElement.surname.value);
      formData.append('phone', formElement.phone.value || '');
      formData.append('address', formElement.address.value || '');
      formData.append('bloodType', formElement.bloodType.value || '');
      formData.append('sex', formElement.sex.value);
      formData.append('parentId', formElement.parentId.value);
      formData.append('gradeId', formElement.gradeId.value);
      formData.append('classId', formElement.classId.value);
      
      // Use the student ID as the card ID
      formData.append('cardId', formElement.id.value);
      
      // Format birthday
      if (formElement.birthday.value) {
        const birthday = new Date(formElement.birthday.value);
        formData.append('birthday', birthday.toISOString().split('T')[0]);
      }
      
      // Convert base64 images to blobs
      const idCardBlob = await fetch(idCardImage).then(r => r.blob());
      const faceBlob = await fetch(faceImage).then(r => r.blob());
      
      formData.append('id_card', idCardBlob, 'id_card.jpg');
      formData.append('face_image', faceBlob, 'face_image.jpg');
      
      // Log the formData for debugging
      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? 'Blob data' : pair[1]));
      }

      // Construct the endpoint
      const endpoint = type === "create" 
        ? "http://127.0.0.1:5000/api/register-student" 
        : `http://127.0.0.1:5000/api/students/${formElement.id.value}`;

      // For debugging, let's log the exact structure
      console.log("Sending request to:", endpoint);
      console.log("Request method:", type === "create" ? "post" : "put");

      const response = await axios({
        method: type === "create" ? "post" : "put",
        url: endpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success(`Student ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
        navigate(0); // Refresh the page
      }
    } catch (err) {
      console.error("Form submission error:", err);
      
      // Capture more detailed error information
      setDebugResponse({
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
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
      
      {/* Debug information section */}
      {debugResponse && (
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugResponse, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Student ID"
          name="id"
          defaultValue={data?.id || ""}
          type="text"
          inputProps={{ required: true }}
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
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ""}
          type="date"
        />
        <InputField
          label="Parent ID"
          name="parentId"
          defaultValue={data?.parentId || ""}
          inputProps={{ required: true }}
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
          type="text"
          inputProps={{ required: true }}
        />
        <InputField
          label="Class ID"
          name="classId"
          defaultValue={data?.classId || ""}
          type="text"
          inputProps={{ required: true }}
        />
      </div>

      {/* ID Card Image */}
      <div className="mb-4">
        <h3 className="font-bold">ID Card Image *</h3>
        {!idCardImage ? (
          <WebCam onCapture={(imageData) => setIdCardImage(imageData)} />
        ) : (
          <div>
            <img src={idCardImage} alt="ID Card" className="w-64 h-64 object-cover" />
            <button 
              type="button"
              onClick={() => setIdCardImage(null)} 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
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
            <button 
              type="button"
              onClick={() => setFaceImage(null)} 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
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