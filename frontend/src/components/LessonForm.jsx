import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LessonForm = ({ type, data, setOpen }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    try {
      const endpoint = type === "create" ? "http://127.0.0.1:5000/api/lessons" : `http://127.0.0.1:5000/api/lessons/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      if (response.data) {
        toast.success(`Lesson ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
        navigate(0); // Refresh the page
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Lesson Name" name="name" defaultValue={data?.name} required />
        <InputField label="Description" name="description" defaultValue={data?.description} />
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md" disabled={loading}>
        {loading ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LessonForm;