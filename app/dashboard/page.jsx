"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importing the styles
import axios from "axios";
import Link from "next/link"

export default function Gpa() {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semestersData, setSemestersData] = useState({
    semester1: { semesterName: "Semester 1", courses: [] },
    semester2: { semesterName: "Semester 2", courses: [] },
    semester3: { semesterName: "Semester 3", courses: [] },
    semester4: { semesterName: "Semester 4", courses: [] },
  });

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
    setSelectedSemester(event.target.value);
  };

  const handleCourseChange = (courseIndex, event) => {
    const updatedSemestersData = { ...semestersData };
    updatedSemestersData[selectedSemester].courses[courseIndex][
      event.target.name
    ] = event.target.value;

    if (event.target.name === "grade") {
      const grade = event.target.value.toUpperCase();
      if (gradePointsMap[grade] !== undefined) {
        updatedSemestersData[selectedSemester].courses[
          courseIndex
        ].gradePoints = gradePointsMap[grade];
      }
    }

    setSemestersData(updatedSemestersData);
  };

  const addCourse = () => {
    if (!selectedSemester) {
      alert("Please select a semester first.");
      return;
    }

    const updatedSemestersData = { ...semestersData };
    updatedSemestersData[selectedSemester].courses.push({
      code: "",
      credits: "",
      grade: "",
      gradePoints: "",
    });
    setSemestersData(updatedSemestersData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Convert semestersData object into an array for processing
    const semestersArray = Object.values(semestersData);

    const filteredSemestersData = semestersArray
      .map((semester) => {
        const filteredCourses = semester.courses.filter((course) => {
          const allValuesPresent =
            course.code.trim() !== "" &&
            course.credits.trim() !== "" &&
            course.grade.trim() !== "";
          const creditsValid = parseFloat(course.credits) > 0; // Allow decimal credits greater than 0
          const gradeValid = Object.keys(gradePointsMap).includes(
            course.grade.toUpperCase()
          ); // Accept grades only above 'F', except for 'S'

          return allValuesPresent && creditsValid && gradeValid;
        });

        return {
          ...semester,
          courses: filteredCourses,
        };
      })
      .filter((semester) => semester.courses.length > 0); // Ensure semesters with no valid courses are removed

    if (filteredSemestersData.length > 0) {
      // console.log("Filtered Data:", filteredSemestersData);
      try {
        // Send data in the POST request to /api/sem
        await axios.post("/api/sem", { semestersData: filteredSemestersData });

        // Show success message
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
    If you have already entered semester data, go to Analysis. Otherwise, please enter the data.
  </p>

  <a
    href={loading ? "javascript:void(0)" : "/dashboard/data"} // Prevent navigation during loading
    className={`px-6 py-3 rounded mt-6 w-full text-white transition duration-300 ease-in-out 
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
          GPA Calculator
        </h2>
        <p className="mb-6 text-center text-gray-300">
          Fill in your semester and course details below:
        </p>
        <form onSubmit={handleSubmit}>
          {/* Semester Selection */}
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
              <option value="semester1">Semester 1</option>
              <option value="semester2">Semester 2</option>
              <option value="semester3">Semester 3</option>
              <option value="semester4">Semester 4</option>
            </select>
          </div>

          {/* Conditional Course Input Form */}
          {selectedSemester && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Add Courses for {semestersData[selectedSemester].semesterName}
              </h3>

              {semestersData[selectedSemester].courses.map(
                (course, courseIndex) => (
                  <div
                    key={courseIndex}
                    className="grid grid-cols-4 gap-4 mb-4"
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
                      className={`border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        course.credits < 0 ? "border-red-500" : ""
                      }`}
                      placeholder="Credits"
                    />
                    <input
                      type="text"
                      name="grade"
                      value={course.grade}
                      onChange={(e) => handleCourseChange(courseIndex, e)}
                      className="border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Grade"
                      maxLength="2"
                      onInput={(e) =>
                        (e.target.value = e.target.value.toUpperCase())
                      }
                    />
                    <input
                      type="number"
                      name="gradePoints"
                      value={course.gradePoints}
                      readOnly
                      className="border-none p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Grade Points"
                    />
                  </div>
                )
              )}

              <button
                type="button"
                onClick={addCourse}
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition duration-300 ease-in-out"
              >
                Add Course
              </button>
            </div>
          )}

          {/* Submit Button with loading state */}
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className={`bg-blue-600 text-white px-6 py-3 rounded mt-6 w-full hover:bg-blue-700 transition duration-300 ease-in-out ${
              loading ? "bg-blue-400 cursor-wait" : ""
            }`}
          >
            {loading ? (
              <span className="animate-spin">Submitting...</span> // Show loading animation
            ) : (
              "Submit"
            )}
          </button>
        </form>
        {/* Display Filled Semesters */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Grade Sheet</h3>
          {Object.keys(semestersData).map((semester) => {
            const completedCourses = semestersData[semester].courses.filter(
              (course) => course.code && course.credits && course.grade
            );

            return (
              completedCourses.length > 0 && (
                <div key={semester} className="mb-6 ">
                  <h4 className="text-lg font-semibold mb-2">{semester}</h4>
                  {completedCourses.map((course, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-2 bg-gray-700 rounded mb-2 text-sm"
                    >
                      <span>{course.code}</span>
                      <span>{course.credits} Credits</span>
                      <span>{course.grade} Grade</span>
                      <span>{course.gradePoints}</span>
                    </div>
                  ))}
                </div>
              )
            );
          })}
        </div>
        <ToastContainer /> {/* Add ToastContainer to render toast messages */}
      </div>

    </div>
  );
}
