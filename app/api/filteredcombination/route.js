export async function GET(req) {
  try {
    // Parse URL parameters for filtering and pagination
    const url = new URL(req.url, "http://example.com");
    const { page = 1, limit = 5, grade = "" } = Object.fromEntries(url.searchParams.entries());

    // Ensure 'page' and 'limit' are integers
    const currentPage = parseInt(page, 10);
    const currentLimit = parseInt(limit, 10);

    // Fetch and filter combinations based on the query parameters (filter by grade, etc.)
    const filteredCombinations = await getFilteredCombinations(grade, currentPage, currentLimit);

    // Return paginated and filtered data
    return NextResponse.json(filteredCombinations, { status: 200 });
  } catch (error) {
    console.error("Error fetching filtered combinations:", error);
    return NextResponse.json({ error: "An error occurred while fetching filtered combinations" }, { status: 500 });
  }
}

async function getFilteredCombinations(grade, currentPage, currentLimit) {
  // Here you would fetch and filter your combinations based on 'grade' or other parameters
  // For pagination, use skip and limit for database queries (assuming MongoDB)
  const skip = (currentPage - 1) * currentLimit;
  const filterConditions = grade ? { "courses.grade": grade } : {}; // Filter by grade if provided

  const combinations = await Semester.find(filterConditions)
    .skip(skip)
    .limit(currentLimit);

  // Return paginated filtered combinations
  return {
    combinations,
    currentPage,
    totalPages: Math.ceil(combinations.length / currentLimit),
  };
}
