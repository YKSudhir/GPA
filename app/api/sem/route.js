import { NextResponse } from "next/server";
import cookie from "cookie"; // For cookie parsing
import jwt from "jsonwebtoken"; // For JWT verification
import Semester from "../../../models/semester"; // Import the Semester model
import connectToDatabase from "../../../lib/dbConnect"; // Import the connection function

export async function POST(req) {
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

    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET_KEY); // Verify and decode JWT

    // Parse the request body
    const body = await req.json();
    const { semestersData } = body; // Array of semesters

    const gradePointsMap = {
      A: 10,
      "A-": 9,
      B: 8,
      "B-": 7,
      C: 6,
      "C-": 5,
      D: 4,
      "D-": 3,
      E: 2,
      "E-": 1,
      F: 0,
      S: 0, // Special grade case
    };

    // Process the semestersData
    const processedSemesters = semestersData.map(
      ({ semesterName, courses }) => {
        const filteredCourses = courses
          .filter((course) => {
            // Normalize and validate grade
            const grade = course.grade?.trim().toUpperCase(); // Trim and convert to uppercase
            const credits = parseFloat(course.credits);

            // Check if grade and credits are valid
            const isValidGrade =
              grade && Object.keys(gradePointsMap).includes(grade);
            const allValuesPresent =
              course.code?.trim() !== "" && !isNaN(credits) && grade !== "";
            const creditsValid = credits > 0;

            // Log invalid data for debugging
            if (!allValuesPresent || !creditsValid || !isValidGrade) {
              // console.log("Invalid Course Data:", course);
            }

            return allValuesPresent && creditsValid && isValidGrade;
          })
          .map((course) => {
            const grade = course.grade?.trim().toUpperCase();
            const gradePoint = gradePointsMap[grade] || 0; // Default to 0 for invalid grade

            // Log grade points assignment
            if (!gradePoint) {
              // console.log("Invalid grade for course:", course);
            }

            return {
              ...course,
              gradePoints: gradePoint,
            };
          });

        // Log the filtered courses for debugging
        // console.log("Semester Name:", semesterName);
        // console.log("Filtered Courses:", filteredCourses);

        return {
          semesterName,
          courses: filteredCourses,
        };
      }
    );

    if (processedSemesters.length === 0) {
      return NextResponse.json(
        { error: "No valid semester data provided" },
        { status: 400 }
      );
    }

    // Find the user semester document
    const userSemester = await Semester.findOne({ userId: decodedUser.id });

    if (userSemester) {
      // If semester data exists, we will update it (delete old data and add new)
      userSemester.semesters = [...processedSemesters]; // Spread processed semesters into the array

      // Save the updated semester data
      // console.log(userSemester);
      await userSemester.save();
      return NextResponse.json(userSemester, { status: 200 });
    } else {
      // If no semester data exists, create a new semester entry
      const newSemester = new Semester({
        userId: decodedUser.id,
        semesters: processedSemesters,
      });

      const savedSemester = await newSemester.save();
      return NextResponse.json(processedSemesters, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving semester data:", error);
    return NextResponse.json(
      { error: "An error occurred while saving semester data" },
      { status: 500 }
    );
  }
}
