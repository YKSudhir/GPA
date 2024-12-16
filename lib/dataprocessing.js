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
  const filteredCourses = courses.filter(
    (course) => course.grade !== "S" && course.gradePoints !== null
  );

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
      if (course.grade !== "S" && course.gradePoints !== null) {
        totalCredits += course.credits;
        weightedPoints += course.credits * course.gradePoints;
      }
    });
  }

  return totalCredits > 0
    ? (weightedPoints / totalCredits).toFixed(3)
    : "0.000";
}

// Generate optimized grade combinations for a given semester
function generateOptimizedCombinations(
  sem4,
  targetCGPA,
  targetSGPA,
  semesters
) {
  const possibleGrades = ["A", "A-", "B", "B-", "C"];

  // Deep clone sem4 to avoid mutating the original data
  const clonedSem4 = sem4.map((course) => ({
    ...course,
    grade: "C",
    gradePoints: gradePointsMap["C"],
  }));
  const results = [];

  function recurse(index) {
    if (index === clonedSem4.length) {
      const updatedSem4 = clonedSem4.map((course) => ({ ...course }));
      const sgpa = parseFloat(calculateSGPA(updatedSem4));
      const allSemesters = { ...semesters, semester4: updatedSem4 };
      const cgpa = parseFloat(calculateCGPA(allSemesters));

      if (sgpa >= targetSGPA && cgpa >= targetCGPA) {
        results.push({ updatedSem4, sgpa, cgpa });
      }
      return;
    }

    for (const grade of possibleGrades) {
      clonedSem4[index].grade = grade;
      clonedSem4[index].gradePoints = gradePointsMap[grade];

      // Limit the number of results to prevent excessive computation
      if (results.length >= 200) return;

      recurse(index + 1);
    }
  }

  recurse(0);
  return results;
}

// Main function
(async function main() {
  try {
    // Fetch semester data
    const response = await fetch("/api/data"); // Ensure the endpoint is correct
    if (!response.ok) {
      console.error("Failed to fetch semester data:", response.statusText);
      return;
    }
    const resultData = await response.json();

    // Check if the fetched data is valid
    if (!resultData || typeof resultData !== "object") {
      console.error("Invalid semester data fetched. Exiting...");
      return;
    }

    // Assign the fetched data to the semesters object
    const semesters = resultData;
    // SGPA calculations
    const sgpaSem1 = calculateSGPA(semesters.semester1 || []);
    const sgpaSem2 = calculateSGPA(semesters.semester2 || []);

    // CGPA calculation
    const cgpa = calculateCGPA(semesters);

    console.log("SGPA Semester 1:", sgpaSem1);
    console.log("SGPA Semester 2:", sgpaSem2);
    console.log("CGPA:", cgpa);

    // Generate grade optimization combinations for semester 4
    const semester4 = semesters.semester4 || [];
    const targetSGPA = 8; // Example target SGPA
    const targetCGPA = 7; // Example target CGPA

    const optimizedCombinations = generateOptimizedCombinations(
      semester4,
      targetCGPA,
      targetSGPA,
      semesters
    );

    console.log("Possible combinations:", optimizedCombinations.length);
    if (optimizedCombinations.length > 0) {
      console.log("Sample combination:", optimizedCombinations[0]); // Log the first combination
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
})();
