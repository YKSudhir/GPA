import { NextResponse } from "next/server";
import cookie from "cookie"; // For cookie parsing
import jwt from "jsonwebtoken"; // For JWT verification
import Semester from "../../../models/predict_semester"; // Import the Semester model
import connectToDatabase from "../../../lib/dbConnect"; // Import the connection function

export async function POST(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Retrieve cookies
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

    // Verify and decode JWT
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET_KEY);

    // Parse the request body
    const { semesterData } = await req.json();

    if (!semesterData || !semesterData.courses) {
      return NextResponse.json(
        { error: "Invalid or missing semester data" },
        { status: 400 }
      );
    }

    // Grade-to-gradePoints mapping
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

    // Filter and validate courses
    const filteredCourses = semesterData.courses.map((course) => {
      const grade = course.grade?.trim().toUpperCase();
      const credits = parseFloat(course.credits);

      const isValidGrade = grade && gradePointsMap.hasOwnProperty(grade);
      const isValidCourse =
        course.code?.trim() &&
        !isNaN(credits) &&
        credits > 0 &&
        isValidGrade;

      return isValidCourse
        ? { ...course, gradePoints: gradePointsMap[grade] || 0 }
        : null;
    }).filter(Boolean);

    if (filteredCourses.length === 0) {
      return NextResponse.json(
        { error: "No valid course data provided" },
        { status: 400 }
      );
    }

    // Save or update semester data
    const semester = await Semester.findOneAndUpdate(
      { userId: decodedUser.id },
      { $set: { semesters: [{ ...semesterData, courses: filteredCourses }] } },
      { new: true, upsert: true }
    );

    return NextResponse.json(semester, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
