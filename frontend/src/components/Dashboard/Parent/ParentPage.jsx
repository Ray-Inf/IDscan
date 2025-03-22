
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Announcements from "../../Announcements";
import BigCalendarContainer from "../../BigCalendarContainer";

const ParentPage = () => {
  const [students, setStudents] = useState([]);
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get parent ID from the URL (if available)

  useEffect(() => {
    if (id) {
      fetchParentDetails(); // Fetch a specific parent's details
    } else {
      fetchAllStudents(); // Fetch all students with parents
    }
  }, [id]);

  const fetchParentDetails = async () => {
    try {
      setLoading(true);
      // Fetch parent details
      const parentResponse = await axios.get(`http://127.0.0.1:5000/api/parents/${id}`);

      if (!parentResponse.data) {
        throw new Error("Invalid parent data format");
      }

      setParent(parentResponse.data);

      // Fetch students for this specific parent
      const studentsResponse = await axios.get(`http://127.0.0.1:5000/api/parents/students?parentId=${id}`);

      if (!studentsResponse.data || !Array.isArray(studentsResponse.data)) {
        throw new Error("Invalid student data format: Expected an array of students");
      }

      setStudents(studentsResponse.data);
    } catch (err) {
      console.error("Error fetching parent data:", err);
      setError(err.message || "Failed to fetch parent details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
        setLoading(true);
        setParent(null); // ✅ Ensure no previous parent data is shown

        // Fetch all students associated with any parent
        const response = await axios.get("http://127.0.0.1:5000/api/parents/students");

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error("Invalid data format: Expected an array of students");
        }

        setStudents(response.data);
    } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.message || "Failed to fetch students");
    } finally {
        setLoading(false);
    }
};


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* Parent Info (Only if viewing a specific parent) */}
      {parent && (
        <div className="w-full bg-white p-4 rounded-md mb-4 shadow-md">
          <h1 className="text-2xl font-bold mb-2">{parent.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p>
                <span className="font-medium">Email:</span> {parent.email || "N/A"}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {parent.phone || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-medium">Address:</span> {parent.address || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* LEFT - Students' Schedules */}
        <div className="w-full xl:w-2/3">
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.id} className="h-full bg-white p-4 rounded-md mb-4 shadow-md">
                <h1 className="text-xl font-semibold">
                  Schedule ({student.name} {student.surname})
                </h1>
                <BigCalendarContainer type="classId" id={student.classId} />
              </div>
            ))
          ) : (
            <div className="h-full bg-white p-4 rounded-md mb-4 shadow-md">
              <p>No students found.</p>
            </div>
          )}
        </div>

        {/* RIGHT - Announcements */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
