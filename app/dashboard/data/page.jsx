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
  const [filters, setFilters] = useState({ cgpa: "", sgpa: "" });
  const [filteredCombinations, setFilteredCombinations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [sgpaChartData, setSgpaChartData] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/data");
        setData(response.data);
        setFilteredCombinations(response.data.optimizedCombinations);
        setLoading(false);

        const cgpaDistribution = getDistributionData(
          response.data.optimizedCombinations,
          "cgpa"
        );
        setChartData(cgpaDistribution);

        const sgpaDistribution = getDistributionData(
          response.data.optimizedCombinations,
          "sgpa"
        );
        setSgpaChartData(sgpaDistribution);
      } catch (error) {
        toast.error("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilterClick = () => {
    if (data) {
      setIsFiltering(true); // Show loading effect
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
        setIsFiltering(false); // Remove loading effect after filtering is done
      }, 300); // Simulate a delay (optional)
    }
  };
  const getDistributionData = (combinations, key) => {
    const distribution = {};
    combinations.forEach((combination) => {
      const value = combination[key];
      distribution[value] = distribution[value] ? distribution[value] + 1 : 1;
    });
    return Object.keys(distribution).map((value) => ({
      name: value,
      count: distribution[value],
    }));
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
      </div>

      {/* SGPA Distribution Chart */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">SGPA Distribution</h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCombinations.length > 0 ? (
            filteredCombinations.map((combination, index) => (
              <div
                key={index}
                className="p-4  border rounded shadow bg-gray-900"
              >
                <h3 className="text-xl font-bold">Combination #{index + 1}</h3>
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
                        className="flex flex-row justify-between  px-4 rounded-lg shadow-md "
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
            <p className="text-center text-white">
              No combinations match the filter criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
