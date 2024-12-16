"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false); // State to manage the button disabling
  const router = useRouter(); // Hook for navigation

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (response.ok) {
          toast.info("You are already logged in.");
          router.push("/dashboard"); // Redirect to dashboard if already logged in
        }
      } catch (error) {
        toast.error("An error occurred while checking login status.");
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); // Disable button and start animation

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Login successful.");
        router.push("/dashboard"); // Redirect to the dashboard on successful login
      } else {
        toast.error(result.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false); // Re-enable the button after login attempt
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Log In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className={`w-full py-3 ${isLoggingIn ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} rounded text-white font-semibold transition duration-200`}
            disabled={isLoggingIn} // Disable the button while logging in
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
