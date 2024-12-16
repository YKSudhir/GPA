import bcrypt from "bcrypt";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken"; // Import jwt for creating the token
import cookie from "cookie"; // Import cookie to handle cookies

export async function POST(req) {
  try {
    // Check if the user is already logged in by checking the cookie
    const cookies = req.headers.get("cookie");
    const parsedCookies = cookie.parse(cookies || "");
    if (parsedCookies.user) {
      const decodedToken = jwt.verify(
        parsedCookies.user,
        process.env.JWT_SECRET_KEY
      );
      // If the token is valid, return an error message that the user is already logged in
      return new Response(
        JSON.stringify({ message: "You are already logged in" }),
        { status: 200 }
      );
    }

    // Parse the request body for login credentials
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 400,
      });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 400,
      });
    }

    // Create JWT token with the user's ID and email
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY, // Your JWT secret
      { expiresIn: "7d" } // Token expiration (7 days for example)
    );

    // Set the JWT token in a secure, HTTP-only cookie
    const cookieOptions = {
      httpOnly: true, // Makes the cookie accessible only by the server
      secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
      maxAge: 60 * 60 * 24 * 7, // Cookie expires in 7 days
      path: "/", // Cookie is accessible for the entire domain
    };

    const cookieHeader = cookie.serialize("user", token, cookieOptions);

    // Respond with success and user data (excluding password)
    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          semester: user.semester,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieHeader, // Set the cookie header
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/login route:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
