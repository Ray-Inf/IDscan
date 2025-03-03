import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/class_schedule';

const ClassSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    class_name: "",
    instructor: "",
    department: "",
    room: "",
    start_time: "",
    end_time: "",
    days: [],
    year: "",
    teacher_id: "", // Initialize teacher_id as empty string
    division: "",
    admission_year: (new Date()).getFullYear().toString(),
  });
  const [filter, setFilter] = useState({
    department: "",
    day: "",
    year: "",
    division: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [testUserData, setTestUserData] = useState({
    card_id: "", 
    name: "",
    role: "" // Default role for testing
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Added Sunday for testing
  const departments = ["Computer Science", "Engineering", "Arts", "Business", "Science"];
  const years = ["1", "2", "3", "4"];
  const divisions = ["A", "B", "C", "D"];
  const roles = ["teacher", "student", "admin", "guest_teacher"];

  // Add a function to handle API errors
  const handleApiError = (err, message) => {
    console.error(`${message}:`, err);
    // Check for specific error types
    if (err.response) {
      // Server responded with an error status code
      setError(`${message} - ${err.response.data.error || err.response.statusText}`);
    } else if (err.request) {
      // Request was made but no response received
      setError(`${message} - Server unreachable. Please check your connection.`);
    } else {
      // Something else went wrong
      setError(`${message} - ${err.message}`);
    }
  };

  // Effect to load user data from localStorage or create test data
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.card_id) {
        setTestUserData(userData);
        // Set teacher_id in form data when user data loads
        setFormData(prev => ({
          ...prev,
          teacher_id: userData.card_id
        }));
      } else {
        // Store test user data to localStorage
        localStorage.setItem("user", JSON.stringify(testUserData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Store test user data to localStorage
      localStorage.setItem("user", JSON.stringify(testUserData));
    }
  }, []);

  // Update form data when testUserData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      teacher_id: testUserData.card_id
    }));
  }, [testUserData.card_id]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Log to check what's happening
      console.log("Fetching classes...");
      const response = await axios.get("/classes");
      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setClasses(response.data.classes || []);
        setFilteredClasses(response.data.classes || []);
      } else {
        console.error("Failed to fetch classes:", response.data.error);
        setError(response.data.error || "Failed to fetch classes. Please check the console for more details.");
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch class schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...classes];

    if (filter.department) {
      result = result.filter(cls => cls.department === filter.department);
    }

    if (filter.day) {
      // Handle case where days might not be an array
      result = result.filter(cls => {
        if (Array.isArray(cls.days)) {
          return cls.days.includes(filter.day);
        } else if (typeof cls.days === 'string') {
          try {
            const daysArray = JSON.parse(cls.days);
            return daysArray.includes(filter.day);
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    }

    if (filter.year) {
      result = result.filter(cls => cls.year === filter.year);
    }

    if (filter.division) {
      result = result.filter(cls => cls.division === filter.division);
    }

    setFilteredClasses(result);
  }, [filter, classes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDayChange = (day) => {
    const updatedDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days: updatedDays });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleTestUserChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...testUserData, [name]: value };
    setTestUserData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.class_name || !formData.instructor || !formData.start_time || !formData.end_time || formData.days.length === 0) {
      setError("Please fill all required fields");
      return;
    }

    try {
      // Always use the current testUserData.card_id for teacher_id
      const classData = {
        ...formData,
        teacher_id: testUserData.card_id, // Ensure teacher_id is set from testUserData
        admission_year: formData.admission_year || (new Date()).getFullYear().toString()
      };

      console.log("Submitting class data:", classData);

      if (isEditing) {
        // Update existing class
        const response = await axios.put(`/classes/${editId}`, classData);
        if (response.data.success) {
          fetchClasses(); // Refresh the list
          setIsFormVisible(false);
          setIsEditing(false);
          setEditId(null);
        } else {
          setError(response.data.error || "Failed to update class");
        }
      } else {
        // Create new class
        const response = await axios.post("/classes", classData);
        if (response.data.success) {
          fetchClasses(); // Refresh the list
          setIsFormVisible(false);
          resetForm();
        } else {
          setError(response.data.error || "Failed to add class");
        }
      }
    } catch (err) {
      handleApiError(err, "Failed to submit class");
    }
  };

  // Add a dedicated reset form function to avoid issues
  const resetForm = () => {
    setFormData({
      class_name: "",
      instructor: "",
      department: "",
      room: "",
      start_time: "",
      end_time: "",
      days: [],
      year: "",
      division: "",
      teacher_id: testUserData.card_id, // Use testUserData.card_id instead of userData.card_id
      admission_year: (new Date()).getFullYear().toString(),
    });
  };

  const handleEdit = (cls) => {
    // Handle case where days might be a JSON string
    let days = cls.days;
    if (typeof cls.days === 'string') {
      try {
        days = JSON.parse(cls.days);
      } catch (e) {
        days = [];
      }
    }

    setFormData({
      class_name: cls.class_name,
      instructor: cls.instructor,
      department: cls.department,
      room: cls.room || "",
      start_time: cls.start_time,
      end_time: cls.end_time,
      days: days,
      year: cls.year,
      division: cls.division,
      teacher_id: cls.teacher_id || testUserData.card_id, // Preserve existing teacher_id or use current if not available
      admission_year: cls.admission_year || (new Date()).getFullYear().toString(),
    });
    setIsEditing(true);
    setEditId(cls.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/classes/${id}`);
      if (response.data.success) {
        fetchClasses(); // Refresh the list
      } else {
        setError(response.data.error || "Failed to delete class");
      }
    } catch (err) {
      handleApiError(err, "Failed to delete class");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Class Schedule</h1>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <select
            name="department"
            value={filter.department}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            name="day"
            value={filter.day}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">Select Day</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            name="division"
            value={filter.division}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">Select Division</option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isFormVisible && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Edit Class" : "Add New Class"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="class_name"
              placeholder="Class Name"
              value={formData.class_name}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="text"
              name="instructor"
              placeholder="Instructor"
              value={formData.instructor}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            />
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="room"
              placeholder="Room"
              value={formData.room}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
            />
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Days</h3>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="form-checkbox h-4 w-4"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
                <input
                  type="number"
                  name="admission_year"
                  value={formData.admission_year}
                  onChange={handleInputChange}
                  className="p-2 border rounded w-full"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isEditing ? "Update Class" : "Add Class"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormVisible(false);
                  setIsEditing(false);
                  setEditId(null);
                  setFormData({
                    class_name: "",
                    instructor: "",
                    department: "",
                    room: "",
                    start_time: "",
                    end_time: "",
                    days: [],
                    year: "",
                    division: "",
                    admission_year: (new Date()).getFullYear().toString(),
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Form Button */}
      {!isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add New Class
        </button>
      )}

      {/* Class Table */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Class List</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-lg">Loading...</div>
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">Class</th>
                  <th className="py-2 px-4 border text-left">Instructor</th>
                  <th className="py-2 px-4 border text-left">Department</th>
                  <th className="py-2 px-4 border text-left">Room</th>
                  <th className="py-2 px-4 border text-left">Time</th>
                  <th className="py-2 px-4 border text-left">Days</th>
                  <th className="py-2 px-4 border text-left">Year/Division</th>
                  <th className="py-2 px-4 border text-left">Admission Year</th>
                  <th className="py-2 px-4 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => {
                  // Handle days display considering it might be a string
                  let daysDisplay = "";
                  if (Array.isArray(cls.days)) {
                    daysDisplay = cls.days.join(", ");
                  } else if (typeof cls.days === "string") {
                    try {
                      const daysArray = JSON.parse(cls.days);
                      daysDisplay = daysArray.join(", ");
                    } catch (e) {
                      daysDisplay = cls.days;
                    }
                  }

                  return (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{cls.class_name}</td>
                      <td className="py-2 px-4 border">{cls.instructor}</td>
                      <td className="py-2 px-4 border">{cls.department}</td>
                      <td className="py-2 px-4 border">{cls.room || "-"}</td>
                      <td className="py-2 px-4 border">
                        {cls.start_time} - {cls.end_time}
                      </td>
                      <td className="py-2 px-4 border">{daysDisplay}</td>
                      <td className="py-2 px-4 border">
                        Year {cls.year}, Division {cls.division}
                      </td>
                      <td className="py-2 px-4 border">
                        {cls.admission_year || (new Date()).getFullYear()}
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(cls)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this class?")) {
                                handleDelete(cls.id);
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded border text-center">
            <p className="text-lg text-gray-500">No classes found for the selected filters.</p>
            <button
              onClick={() => setFilter({
                department: "",
                day: "",
                year: "",
                division: "",
              })}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <div className="text-lg font-semibold">Total Classes</div>
            <div className="text-3xl font-bold">{classes.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <div className="text-lg font-semibold">Filtered Classes</div>
            <div className="text-3xl font-bold">{filteredClasses.length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <div className="text-lg font-semibold">Departments</div>
            <div className="text-3xl font-bold">
              {new Set(classes.map(cls => cls.department)).size}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded border border-purple-200">
            <div className="text-lg font-semibold">User Role</div>
            <div className="text-2xl font-bold">{testUserData.role}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p>Class Schedule Management System</p>
        <p>User: {testUserData.name} ({testUserData.card_id})</p>
      </div>
    </div>
  );
};

export default ClassSchedule;