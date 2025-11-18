import { useEffect, useState } from "react";
import "./index.css";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [sortOption, setSortOption] = useState("");

  // 🔥 Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(20); // load 20 items at start
  const LOAD_AMOUNT = 20; // how many more to load each scroll

  const fetchCompanies = async () => {
    try {
      const res = await fetch("http://localhost:3001/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Unique industries
  const industries = [...new Set(companies.map((c) => c.industry))];

  // Filtering
  let filteredCompanies = companies.filter((company) => {
    return (
      company.name.toLowerCase().includes(searchName.toLowerCase()) &&
      company.location.toLowerCase().includes(searchLocation.toLowerCase()) &&
      (searchIndustry === "" ||
        company.industry.toLowerCase() === searchIndustry.toLowerCase())
    );
  });

  // Sorting
  if (sortOption === "name") {
    filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "location") {
    filteredCompanies.sort((a, b) => a.location.localeCompare(b.location));
  } else if (sortOption === "employees") {
    filteredCompanies.sort((a, b) => a.employees - b.employees);
  }

  // 🔥 Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;

      // if user reaches bottom → load more
      if (scrollPosition >= pageHeight - 200) {
        setVisibleCount((prev) => prev + LOAD_AMOUNT);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <p className="text-center text-xl">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Companies Directory</h1>

      {/* Filters + Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Search by location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={searchIndustry}
          onChange={(e) => setSearchIndustry(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="name">Name (A–Z)</option>
          <option value="location">Location (A–Z)</option>
          <option value="employees">Employees (Low → High)</option>
        </select>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.slice(0, visibleCount).map((company) => (
          <div
            key={company.id}
            className="border shadow p-4 rounded hover:shadow-lg transition"
          >
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-16 mb-4 object-contain"
            />

            <h2 className="font-semibold text-xl">{company.name}</h2>
            <p className="text-gray-600">{company.industry}</p>

            <p className="text-sm mt-2">
              <span className="font-semibold">Location:</span>{" "}
              {company.location}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Employees:</span>{" "}
              {company.employees}
            </p>
          </div>
        ))}
      </div>

      {/* Loader at bottom */}
      {visibleCount < filteredCompanies.length && (
        <p className="text-center mt-6 text-gray-500">Loading more...</p>
      )}
    </div>
  );
}

export default Companies;
