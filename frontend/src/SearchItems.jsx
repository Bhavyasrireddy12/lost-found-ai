
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  Clock3,
  Package,
  Sparkles,
  X,
} from "lucide-react";

import api, { imageUrl } from "./api/axios";

const categories = [
  { value: "", label: "All Categories" },
  { value: "backpack", label: "Backpack" },
  { value: "bottle", label: "Bottle" },
  { value: "laptop", label: "Laptop" },
  { value: "phone", label: "Mobile Phone" },
  { value: "book", label: "Book" },
  { value: "wallet", label: "Wallet" },
  { value: "keys", label: "Keys" },
  { value: "earphones", label: "Earphones" },
  { value: "id_card", label: "ID Card" },
  { value: "other", label: "Other" },
];

function SearchItems({ onBack }) {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [matching, setMatching] = useState(false);

  const fetchItems = async (filters = {}) => {
    try {
      setLoading(true);

      const response = await api.get("/items", {
        params: {
          type: filters.type ?? type,
          category: filters.category ?? category,
          search: filters.search ?? search,
        },
      });

      setItems(Array.isArray(response.data) ? response.data : []);
      setSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      alert(error.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems({
      type: "",
      category: "",
      search: "",
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setCategory("");

    fetchItems({
      type: "",
      category: "",
      search: "",
    });
  };

  // AUTOMATIC AI MATCHING
  const findAIMatches = async () => {
    try {
      setMatching(true);

      const response = await api.post("/matches/ai");

      console.log("AI MATCH RESULTS:", response.data);

      alert(
        `${response.data?.message || "AI matching completed!"}\n\n` +
        `Matches created: ${response.data?.createdMatches ?? 0}`
      );
    } catch (error) {
      console.error(
        "AI Match Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "AI matching failed. Check backend and Python AI service."
      );
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="search-page-premium">
      <div className="search-topbar">
        <button className="search-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="search-system-status">
          <span></span>
          CAMPUS DATABASE
        </div>
      </div>

      <div className="search-container">
        <div className="search-header">
          <div>
            <div className="search-label">
              <Search size={13} />
              ITEM DISCOVERY
            </div>

            <h1>
              Search Lost & <span>Found Items</span>
            </h1>

            <p>
              Search campus reports by item name, category, type and other details.
            </p>
          </div>

          <div className="search-result-summary">
            <strong>{items.length}</strong>
            <span>{items.length === 1 ? "item" : "items"} found</span>
          </div>
        </div>

        <section className="search-controls-panel">
          <form className="master-search" onSubmit={handleSearch}>
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by item name, description or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}

            <button
              type="submit"
              className="search-submit"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="search-filter-row">
            <div className="type-filter">
              <span className="filter-title">Type</span>

              <div className="type-buttons">
                <button
                  type="button"
                  className={type === "" ? "type-button active" : "type-button"}
                  onClick={() => setType("")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={type === "lost" ? "type-button active lost" : "type-button"}
                  onClick={() => setType("lost")}
                >
                  Lost
                </button>

                <button
                  type="button"
                  className={type === "found" ? "type-button active found" : "type-button"}
                  onClick={() => setType("found")}
                >
                  Found
                </button>
              </div>
            </div>

            <div className="category-filter">
              <span className="filter-title">Category</span>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="apply-filter-button"
              onClick={() => fetchItems()}
              disabled={loading}
            >
              <SlidersHorizontal size={15} />
              Apply Filters
            </button>

            {(search || type || category) && (
              <button
                type="button"
                className="clear-filter-button"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <div className="results-header">
          <div>
            <span className="results-label">SEARCH RESULTS</span>
            <h2>Campus Item Records</h2>
          </div>

          <div className="result-info">
            <Sparkles size={14} />
            AI-assisted recovery database
          </div>
        </div>

        {loading && (
          <div className="search-loading">
            <div className="search-loader"></div>
            <h3>Searching campus records</h3>
            <p>Checking available lost and found reports...</p>
          </div>
        )}

        {!loading && searched && items.length === 0 && (
          <div className="search-empty">
            <div className="empty-icon">
              <Package size={25} />
            </div>

            <h3>No matching items</h3>

            <p>
              We couldn't find any campus reports matching your current filters.
            </p>

            <button onClick={clearFilters}>Clear Search</button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="search-results-grid">
            {items.map((item) => (
              <article className="search-item-card" key={item._id}>
                <div className="search-item-image">
                  {item.image ? (
                    <img
                      src={imageUrl(item.image)}
                      alt={item.title || "Lost and found item"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-item-image">
                      <Package size={30} />
                      <span>No Image</span>
                    </div>
                  )}

                  <span
                    className={`item-type-badge ${
                      item.type === "lost" ? "lost" : "found"
                    }`}
                  >
                    {item.type === "lost" ? "LOST" : "FOUND"}
                  </span>
                </div>

                <div className="search-item-content">
                  <div className="item-category">
                    {item.category || "Other"}
                  </div>

                  <h3>{item.title || "Untitled Item"}</h3>

                  <p className="item-description">
                    {item.description || "No description provided."}
                  </p>

                  <div className="item-meta">
                    <div>
                      <MapPin size={14} />
                      <span>{item.location || "Location unavailable"}</span>
                    </div>

                    <div>
                      <CalendarDays size={14} />
                      <span>{item.date || "Date unavailable"}</span>
                    </div>

                    <div>
                      <Clock3 size={14} />
                      <span>{item.time || "Time unavailable"}</span>
                    </div>
                  </div>

                  <div className="item-card-footer">
                    <span
                      className={`item-status ${
                        item.status === "claimed"
                          ? "claimed"
                          : item.status === "matched"
                          ? "matched"
                          : "active"
                      }`}
                    >
                      <span></span>
                      {item.status || "active"}
                    </span>

                    <span className="item-record">CAMPUS RECORD</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* AUTOMATIC AI MATCHING BANNER */}
        <section className="search-ai-banner">
          <div className="search-ai-icon">
            <Sparkles size={21} />
          </div>

          <div>
            <span>AI MATCHING</span>

            <h3>Find possible Lost & Found matches</h3>

            <p>
              AI compares active lost and found reports using their images
              and details. You don't need to enter item IDs.
            </p>
          </div>

          <button
            onClick={findAIMatches}
            disabled={matching}
            className="ai-match-button"
          >
            <Sparkles size={15} />
            {matching ? "Finding Matches..." : "Run AI Matching"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default SearchItems;
