"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importing toast styles

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    semester: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInputs = () => {
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    if (formData.semester < 1 || formData.semester > 8) {
      toast.error("Semester must be between 1 and 8.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 3000);
      } else {
        toast.error(result.message || "Registration failed.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
          <input
            type="number"
            name="semester"
            placeholder="Semester"
            value={formData.semester}
            onChange={handleChange}
            className="block w-full p-3 bg-gray-700 rounded border border-gray-600 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded text-white font-semibold transition duration-200 ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* ToastContainer to show the toast notifications */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
