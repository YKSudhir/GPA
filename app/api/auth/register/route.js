import bcrypt from "bcrypt";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const { name, email, password, semester } = await req.json(); // Parse JSON request body

    if (!name || !email || !password || !semester) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Email already registered" }),
        { status: 400 }
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      semester,
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: newUser,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/register route:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
