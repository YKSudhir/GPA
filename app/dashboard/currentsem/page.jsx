"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importing the styles
import axios from "axios";

export default function Gpa() {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesterData, setSemesterData] = useState({ courses: [] });
  const [loading, setLoading] = useState(false);

  const gradePointsMap = {
    A: 10,
    "A-": 9,
    B: 8,
    "B-": 7,
    C: 6,
    "C-": 5,
    D: 4,
    F: 0,
    S: 0,
  };

  const handleSemesterSelect = (event) => {
    const semester = event.target.value;
    if (semester) {
      setSelectedSemester(semester);
      setSemesterData({
        semesterName: `Semester ${semester.slice(-1)}`,
        courses: [],
      });
    }
  };

  const handleCourseChange = (courseIndex, event) => {
    const updatedSemesterData = { ...semesterData };
    updatedSemesterData.courses[courseIndex][event.target.name] =
      event.target.value;

    if (event.target.name === "grade") {
      const grade = event.target.value.toUpperCase();
      if (gradePointsMap[grade] !== undefined) {
        updatedSemesterData.courses[courseIndex].gradePoints =
          gradePointsMap[grade];
      }
    }

    setSemesterData(updatedSemesterData);
  };

  const addCourse = () => {
    if (!selectedSemester) {
      alert("Please select a semester first.");
      return;
    }

    const updatedSemesterData = { ...semesterData };
    updatedSemesterData.courses.push({
      code: "",
      credits: "",
      grade: "",
      gradePoints: "",
    });
    setSemesterData(updatedSemesterData);
  };

  const deleteCourse = (courseIndex) => {
    const updatedSemesterData = { ...semesterData };
    updatedSemesterData.courses.splice(courseIndex, 1);
    setSemesterData(updatedSemesterData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const filteredCourses = semesterData.courses.filter((course) => {
      const allValuesPresent =
        course.code.trim() !== "" &&
        course.credits.trim() !== "" &&
        course.grade.trim() !== "";
      const creditsValid = parseFloat(course.credits) > 0;
      const gradeValid = Object.keys(gradePointsMap).includes(
        course.grade.toUpperCase()
      );

      return allValuesPresent && creditsValid && gradeValid;
    });

    if (filteredCourses.length > 0) {
      try {
        await axios.post("/api/currentsem", {
          semesterData: { ...semesterData, courses: filteredCourses },
        });
        toast.success("Data submitted successfully!");
      } catch (error) {
        console.error("Error making POST request:", error);
        toast.error("An error occurred while submitting the data!");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(
        "Please check the entered values. Credits must be non-negative and grades must be valid."
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center pt-[40px] justify-center pb-20">
       <div className="mb-4 flex flex-col justify-center items-center">
        <p className="text-gray-400 text-center">
          If you have already entered current and old semesters  data, go to Analysis. Otherwise,
          please enter the data.
        </p>

        <a
          href={loading ? "javascript:void(0)" : "/dashboard/data"} // Prevent navigation during loading
          className={`px-6 py-3 rounded mt-6 w-1/2 text-center text-white transition duration-300 ease-in-out 
      ${loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"}`}
          onClick={(e) => {
            if (loading) e.preventDefault(); // Block navigation if loading
          }}
          aria-label={loading ? "Loading, please wait" : "Go to Analysis"} // Accessibility
        >
          {loading ? (
            <span className="animate-spin">Loading...</span> // Loading animation
          ) : (
            "Go to Analysis"
          )}
        </a>
      </div>
      <div className="p-6 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 bg-gray-800 rounded-lg shadow-xl mx-4 md:mx-0">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Current Semester
        </h2>
        <p className="mb-6 text-center text-gray-300">
          Please fill in your current semester and course details below:
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="semester-select"
              className="block text-lg font-semibold mb-2"
            >
              Select Semester
            </label>
            <select
              id="semester-select"
              value={selectedSemester}
              onChange={handleSemesterSelect}
              className="border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-center"
            >
              <option value="">-- Select a Semester --</option>
              <option value="semester2">Semester 2</option>
              <option value="semester3">Semester 3</option>
              <option value="semester4">Semester 4</option>
              <option value="semester5">Semester 5</option>
              <option value="semester6">Semester 6</option>
              <option value="semester7">Semester 7</option>
              <option value="semester8">Semester 8</option>
            </select>
          </div>

          {selectedSemester && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Add Courses for {semesterData.semesterName}
              </h3>

              {semesterData.courses.map((course, courseIndex) => (
                <div
                  key={courseIndex}
                  className="grid grid-cols-5 gap-4 mb-4 items-center"
                >
                  <input
                    type="text"
                    name="code"
                    value={course.code}
                    onChange={(e) => handleCourseChange(courseIndex, e)}
                    className="border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Course Code"
                    required
                    pattern="[A-Za-z0-9]+"
                  />
                  <input
                    type="number"
                    name="credits"
                    value={course.credits}
                    onChange={(e) => handleCourseChange(courseIndex, e)}
                    className="border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Credits"
                  />

                  <button
                    type="button"
                    onClick={() => deleteCourse(courseIndex)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCourse}
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition duration-300 ease-in-out"
              >
                Add Course
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-3 rounded mt-6 w-full hover:bg-blue-700 transition duration-300 ease-in-out ${
              loading ? "bg-blue-400 cursor-wait" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
