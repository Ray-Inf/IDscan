import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ExamForm = ({ type, data, setOpen, relatedData }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    // Convert lessonId to integer
    if (payload.lessonId) payload.lessonId = parseInt(payload.lessonId);

    try {
      const endpoint = type === "create" ? "http://127.0.0.1:5000/api/exams" : `http://127.0.0.1:5000/api/exams/${data.id}`;
      const method = type === "create" ? "post" : "put";

      const response = await axios[method](endpoint, payload);

      if (response.data) {
        toast.success(`Exam ${type === "create" ? "created" : "updated"} successfully!`);
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
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          defaultValue={data?.title}
          required
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={data?.startTime}
          type="datetime-local"
          required
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={data?.endTime}
          type="datetime-local"
          required
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            name="lessonId"
            defaultValue={data?.lessonId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            required
          >
            <option value="">Select Lesson</option>
            {relatedData?.lessons?.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
        </div>
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

export default ExamForm;