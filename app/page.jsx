import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-start  items-center bg-gray-900 px-10 pt-[200px]">
      <h2 className="text-3xl font-bold text-center text-gray-300 mb-4">
        Welcome to My GPA Calculator and Predictor
      </h2>

      <p className="text-sm md:text-lg text-center text-gray-400 mb-6">
        Calculate the possible outcomes to achieve your desired CGPA for the
        current semester based on your grades.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-gray-100 rounded-xl shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Get Started
      </Link>
    </div>
  );
}
