import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Import jwt to generate the token
import cookie from "cookie"; // Import cookie to manage cookies

export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse the request body
    const body = await req.json();

    // Extract fields
    const { name, email, password, semester } = body;

    // Validate required fields
    if (!name || !email || !password || !semester) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password, // Note: In a real application, hash the password before saving
      semester, // Initialize as an empty array
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Create a JWT token with the user ID or email
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET_KEY, // Your JWT secret
      { expiresIn: "7d" } // Token expiration (7 days for example)
    );

    // Set the token in the cookies
    const cookieOptions = {
      httpOnly: true, // To make it accessible only by the server
      secure: process.env.NODE_ENV === "production", // Ensure secure cookie in production
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    };

    const cookieHeader = cookie.serialize("user", token, cookieOptions);

    // Return the response with the cookie
    return NextResponse.json(
      { user: { name: savedUser.name, email: savedUser.email } }, // Return user info without password
      {
        status: 201,
        headers: {
          "Set-Cookie": cookieHeader, // Set cookie header
        },
      }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "An error occurred while registering the user" },
      { status: 500 }
    );
  }
}
