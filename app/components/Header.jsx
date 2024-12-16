"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter for redirection

export default function Navbar({ userToken }) {
  const [token, setToken] = useState(userToken); // Initialize state with the userToken prop
  const router = useRouter(); // Router to redirect after logout

  const handleLogout = async () => {
    try {
      // Make the logout API request to clear the cookie or token
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setToken(null); // Update state to null after logout
        router.push("/"); // Redirect to the homepage or login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-black py-4 px-6 text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-sm md:text-lg font-bold text-gray-200">GPA Cal</h1>
        <ul className="flex space-x-6 text-gray-200">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>

          <li>
            {token ? (
              <button
                onClick={handleLogout}
                className="hover:underline cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/login" className="hover:underline">
                Login/Signup
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
