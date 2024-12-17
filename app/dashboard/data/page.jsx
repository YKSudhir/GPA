"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DisplayFeatures() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]); // Added state for CGPA distribution chart
  const [sgpaChartData, setSgpaChartData] = useState([]); // Added state for SGPA distribution chart
  const [filters, setFilters] = useState({ cgpa: "", sgpa: "" });
  const [filteredCombinations, setFilteredCombinations] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [combinations, setCombinations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(5);
  const [chartLoading, setChartLoading] = useState(true); // Loading state for chart
  const [combinationsLoading, setCombinationsLoading] = useState(true); // Loading state for combinations

  useEffect(() => {
    const fetchchartData = async () => {
      setChartLoading(true); // Start loading when fetching chart data
      try {
        const responsechart = await axios.get("/api/chartdata");
        setLoading(false);
        if (
          responsechart.data &&
          responsechart.data.cgpaDistribution &&
          responsechart.data.sgpaDistribution
        ) {
          setChartData(responsechart.data.cgpaDistribution);
          setSgpaChartData(responsechart.data.sgpaDistribution);
        }
      } catch {
        toast.error("Failed to fetch data. Please try again later.");
      } finally {
        setChartLoading(false); // Stop loading after chart data is fetched
      }
    };
    fetchchartData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setCombinationsLoading(true); // Start loading when fetching combinations data
      try {
        const response = await axios.get(
          `/api/data?page=${page}&limit=${limit}`
        );
        setData(response.data);
        setFilteredCombinations(response.data.optimizedCombinations);
        setCombinations(response.data.optimizedCombinations);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error("Failed to fetch data. Please try again later.");
      } finally {
        setCombinationsLoading(false); // Stop loading after combinations data is fetched
      }
    };

    fetchData();
  }, [page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilterClick = () => {
    if (data) {
      setIsFiltering(true);
      setTimeout(() => {
        setFilteredCombinations(
          data.optimizedCombinations.filter((combination) => {
            const matchesCGPA =
              !filters.cgpa ||
              combination.cgpa.toString().includes(filters.cgpa);
            const matchesSGPA =
              !filters.sgpa ||
              combination.sgpa.toString().includes(filters.sgpa);
            return matchesCGPA && matchesSGPA;
          })
        );
        setIsFiltering(false);
      }, 300);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-400 border-opacity-70"></div>
        <p className="mt-4 text-gray-500 text-lg font-medium">Loading...</p>
      </div>
    );

  if (!data)
    return (
      <div className="text-center mt-10 text-white">No data available.</div>
    );

  return (
    <div className="p-5 bg-black text-white min-h-screen">
      <ToastContainer />

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow bg-gray-900">
          <h3 className="text-lg font-bold">Possible Combinations</h3>
          <p className="text-gray-400 text-xl">
            {data.possibleCombinationsCount}
          </p>
        </div>
        <div className="px-4 py-2 border rounded-lg shadow-lg bg-gray-900">
  <p className="text-gray-400 ">
    Explore the optimized grade combinations for achieving an SGPA of 8 or higher and a CGPA of 7 or higher in Semester 4.
  </p>
</div>

        <div className="p-4 border rounded shadow bg-gray-900">
          <h3 className="text-lg font-bold">Current CGPA</h3>
          <p className="text-gray-400 text-xl">{data.cgpa}</p>
        </div>
        <div className="p-4 border rounded shadow bg-gray-900">
          <h3 className="text-lg font-bold">Semester SGPA</h3>
          <p className="text-gray-400">Sem 1: {data.sgpaSem1}</p>
          <p className="text-gray-400">Sem 2: {data.sgpaSem2}</p>
          <p className="text-gray-400">Sem 3: {data.sgpaSem3}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">CGPA Distribution</h2>
        {chartLoading ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-400 border-opacity-70"></div> // Loading indicator for chart
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">SGPA Distribution</h2>
        {chartLoading ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-400 border-opacity-70"></div> // Loading indicator for chart
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sgpaChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Filter Combinations</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="cgpa"
            value={filters.cgpa}
            onChange={handleFilterChange}
            placeholder="Filter by CGPA"
            className="p-2 border border-gray-700 bg-black text-white rounded"
          />
          <input
            type="text"
            name="sgpa"
            value={filters.sgpa}
            onChange={handleFilterChange}
            placeholder="Filter by SGPA"
            className="p-2 border border-gray-700 bg-black text-white rounded"
          />
          <button
            onClick={handleFilterClick}
            className="p-2 bg-blue-600 text-white rounded"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Optimized Combinations Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Optimized Combinations</h2>
        {combinationsLoading ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-400 border-opacity-70"></div> // Loading indicator for combinations
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCombinations.length > 0 ? (
              filteredCombinations.map((combination, index) => (
                <div
                  key={index}
                  className="p-4 border rounded shadow bg-gray-900"
                >
                  <h3 className="text-xl font-bold">
                    Combination #{combination.combination_no}
                  </h3>
                  <p className="text-gray-400">CGPA: {combination.cgpa}</p>
                  <p className="text-gray-400">SGPA: {combination.sgpa}</p>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-200 mb-2">
                      Courses & Grades
                    </h4>
                    <ul className="space-y-2">
                      {(combination.updatedSem4 || []).map((course, i) => (
                        <li
                          key={i}
                          className="flex flex-row justify-between px-4 rounded-lg shadow-md"
                        >
                          <div className="text-gray-300 font-medium">
                            {course.code}
                          </div>
                          <div className="text-sm text-gray-400">
                            {course.grade}
                          </div>
                          <div className="text-gray-300 font-semibold">
                            {course.gradePoints}
                          </div>
                          <div className="text-sm text-gray-400">
                            {course.credits} Credits
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No combinations found.</p>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="bg-gray-700 text-white py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="bg-gray-700 text-white py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
