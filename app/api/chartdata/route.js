import { NextResponse } from "next/server";
import cookie from "cookie"; // For cookie parsing
import jwt from "jsonwebtoken"; // For JWT verification
import Semester from "../../../models/semester"; // Import the Semester model
import CurrentSemester from "../../../models/predict_semester"; // Import the Semester model
import connectToDatabase from "../../../lib/dbConnect"; // Import the connection function


// Grade-to-grade points mapping
const gradePointsMap = {
  A: 10,
  "A-": 9,
  B: 8,
  "B-": 7,
  C: 6,
  "C-": 5,
  D: 4,
  F: 0,
};

// Calculate SGPA for a given semester
function calculateSGPA(courses) {
  const filteredCourses = courses.filter((course) => course.grade !== "S");

  const totalCredits = filteredCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );
  const weightedPoints = filteredCourses.reduce(
    (sum, course) => sum + course.credits * course.gradePoints,
    0
  );

  return totalCredits > 0
    ? (weightedPoints / totalCredits).toFixed(3)
    : "0.000";
}

// Calculate CGPA for all semesters
function calculateCGPA(semesters) {
  let totalCredits = 0;
  let weightedPoints = 0;

  for (const sem in semesters) {
    semesters[sem].forEach((course) => {
      if (course.grade !== "S") {
        totalCredits += course.credits;
        weightedPoints += course.credits * course.gradePoints;
      }
    });
  }

  return totalCredits > 0
    ? (weightedPoints / totalCredits).toFixed(3)
    : "0.000";
}

function calculateCGPA_particular(semesters, sem) {
  let totalCredits = 0;
  let weightedPoints = 0;

  // Iterate through semesters up to the given number
  for (let i = 1; i <= sem; i++) {
    const semesterKey = `semester${i}`;
    if (semesters[semesterKey]) {
      semesters[semesterKey].forEach((course) => {
        if (course.grade !== "S") {
          totalCredits += course.credits;
          weightedPoints += course.credits * course.gradePoints;
        }
      });
    }
  }

  return totalCredits > 0
    ? (weightedPoints / totalCredits).toFixed(3)
    : "0.000";
}

// Optimized grade combination generator
function generateOptimizedCombinations(
  sem4,
  targetCGPA,
  targetSGPA,
  semesters
) {
  const possibleGrades = [
    "A",
    "A-",
    "B",
    "B-",
    "C",
    "C-",
    "D",
    "D-",
    "E",
    "E-",
  ]; // Limit to higher grades

  // Initialize all Semester 4 courses with the lowest grade in the range
  sem4.forEach((course) => {
    course.grade = "C";
    course.gradePoints = gradePointsMap["C"];
  });

  const results = [];

  function recurse(index) {
    if (index === sem4.length) {
      // Compute SGPA and CGPA for the current combination
      const updatedSem4 = sem4.map((course) => ({ ...course }));
      const sgpa = parseFloat(calculateSGPA(updatedSem4));
      const allSemesters = { ...semesters, semester4: updatedSem4 };
      const cgpa = parseFloat(calculateCGPA(allSemesters));

      // Check if the combination meets the targets
      if (sgpa >= targetSGPA && cgpa >= targetCGPA) {
        results.push({ updatedSem4, sgpa, cgpa });
      }

      return;
    }

    for (const grade of possibleGrades) {
      sem4[index].grade = grade;
      sem4[index].gradePoints = gradePointsMap[grade];

      // Early stopping if results exceed a safe limit
      if (results.length > 20000) return;

      recurse(index + 1);
    }
  }

  recurse(0);
  return results;
}

function saveSemesterData(semestersData) {
  // Transform the data into the required format
  const semesters = {};

  semestersData.forEach((semester, index) => {
    const semesterKey = `semester${index + 1}`; // Create keys like semester1, semester2, etc.
    const courses = semester.courses.map((course) => ({
      code: course.code,
      credits: course.credits,
      grade: course.grade,
      gradePoints: course.gradePoints,
    }));

    semesters[semesterKey] = courses;
  });

  return semesters; // Return the semesters object after the loop completes
}

export async function GET(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the current user from cookies
    const cookies = req.headers.get("cookie");
    if (!cookies) {
      return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }

    const parsedCookies = cookie.parse(cookies);
    const userToken = parsedCookies.user;

    if (!userToken) {
      return NextResponse.json(
        { error: "No user token found" },
        { status: 401 }
      );
    }

    // Verify and decode the JWT token to get the user ID
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET_KEY); // Verify and decode JWT

    // Find the user semester document
    const userSemester = await Semester.findOne({ userId: decodedUser.id });

    if (!userSemester) {
      return NextResponse.json(
        { error: "No semester data found for the user" },
        { status: 404 }
      );
    }

    // Return the semester data for the user
    const data = userSemester.semesters;
    const modified_data = saveSemesterData(data);
    const current_semester_data = await CurrentSemester.findOne({
      userId: decodedUser.id,
    });
    function transformData(sem) {
      let modified_data = {};

      // Ensure that the semesters array exists
      if (sem && sem.semesters && sem.semesters.length > 0) {
        sem.semesters.forEach((semester, index) => {
          const semesterKey = `semester${index + 1}`; // Dynamic key for semester (semester1, semester2, etc.)

          // Map the courses to include only code and credits
          modified_data[semesterKey] = semester.courses.map((course) => ({
            code: course.code,
            credits: course.credits,
          }));
        });
      }

      return modified_data;
    }
    const transformedData = transformData(current_semester_data);
    let firstKey = Object.keys(transformedData)[0];
    modified_data["semester4"] = transformedData[firstKey];
    // Add semester4 data
    // modified_data["semester4"] = [
    //   { code: "APL105", credits: 4 },
    //   { code: "ASL385", credits: 3 },
    //   { code: "TXL211", credits: 3 },
    //   { code: "TXL221", credits: 4 },
    //   { code: "TXL231", credits: 4 },
    //   { code: "TXL241", credits: 4.5 },
    // ];

    // // Use the correct semester name as a string key
    // modified_data["semester4"] = [
    //   { code: "APL105", credits: 4 },
    //   { code: "ASL385", credits: 3 },
    //   { code: "TXL211", credits: 3 },
    //   { code: "TXL221", credits: 4 },
    //   { code: "TXL231", credits: 4 },
    //   { code: "TXL241", credits: 4.5 },
    // ];

    // console.log(modified_data); 
    // Check the updated modified_data
    const semesters = modified_data;
    const sgpaSem1 = calculateSGPA(semesters.semester1);
    const sgpaSem2 = calculateSGPA(semesters.semester2);
    const sgpaSem3 = calculateSGPA(semesters.semester3);
    const cgpa = calculateCGPA_particular(semesters, 3);

    // Define targets
    const targetSGPA = 8;
    const targetCGPA = 7;

    const optimizedCombinations = generateOptimizedCombinations(
      semesters.semester4, // Assuming this data is available
      targetCGPA, // Assuming this data is available
      targetSGPA, // Assuming this data is available
      semesters // Assuming this data is available
    );

    const getDistributionData = (combinations, key) => {
      const distribution = {};
      combinations.forEach((combination) => {
        const value = combination[key];
        distribution[value] = distribution[value] ? distribution[value] + 1 : 1;
      });
      return Object.keys(distribution).map((value) => ({
        name: value,
        count: distribution[value],
      }));
    };

    let chartData = [];

    let sgpaChartData = [];

    const cgpaDistribution = getDistributionData(optimizedCombinations, "cgpa");
    chartData = cgpaDistribution;

    const sgpaDistribution = getDistributionData(optimizedCombinations, "sgpa");
    sgpaChartData = sgpaDistribution;

    const responseData = {
      cgpaDistribution,
      sgpaDistribution,
    };
    // Send the response with status 200
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching semester data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching semester data" },
      { status: 500 }
    );
  }
}
