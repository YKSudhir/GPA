import cookie from "cookie"; // Import cookie to handle cookies

export async function POST(req) {
  try {
    // Set the 'user' cookie to expire in the past to log the user out
    const cookieHeader = cookie.serialize("user", "", {
      httpOnly: true, // Makes the cookie accessible only by the server
      secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
      maxAge: 0, // Cookie expires immediately
      path: "/", // Cookie is accessible for the entire domain
    });

    // Respond with a success message
    return new Response({
      status: 200,
      headers: {
        "Set-Cookie": cookieHeader, // Set the expired cookie header
      },
    });
  } catch (error) {
    console.error("Error in /api/logout route:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
