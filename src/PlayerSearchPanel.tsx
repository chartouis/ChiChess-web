import React, { useState } from "react";
import axios from "axios";

type PlayerSearchPanelProps = {
  apiBase: string;
};

const PlayerSearchPanel: React.FC<PlayerSearchPanelProps> = ({ apiBase }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${apiBase}/api/search/${encodeURIComponent(searchQuery)}`,
        { withCredentials: true }
      );
      setSearchResults(response.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Player Search
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by username..."
            className="flex-1 clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="clip-corner-sm bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
          >
            {isSearching ? "..." : "SEARCH"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-black border border-gray-800 clip-corner-sm p-3 max-h-48 overflow-y-auto">
            <div className="space-y-1">
              {searchResults.map((username, idx) => (
                <div
                  key={idx}
                  className="clip-corner-sm bg-gray-900 border border-cyan-900/50 px-3 py-2 text-sm text-cyan-400 font-mono hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {username}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="p-3 bg-black border border-gray-800 clip-corner-sm">
            <p className="text-xs text-gray-500 font-mono">
              // No results found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSearchPanel;
