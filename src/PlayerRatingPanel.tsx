import React, { useState } from "react";
import axios from "axios";

type PlayerRatingPanelProps = {
  apiBase: string;
};

const PlayerRatingPanel: React.FC<PlayerRatingPanelProps> = ({ apiBase }) => {
  const [ratingUsername, setRatingUsername] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRating = async () => {
    if (!ratingUsername.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiBase}/api/rating/${encodeURIComponent(ratingUsername)}`,
        { withCredentials: true }
      );
      setRating(response.data.rating || response.data);
    } catch (err: any) {
      console.error("Rating error:", err);
      setError(err.response?.data?.message || "Failed to fetch rating");
      setRating(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchRating();
    }
  };

  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Player Rating
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={ratingUsername}
            onChange={(e) => setRatingUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter username"
            className="flex-1 clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
          />
          <button
            onClick={fetchRating}
            disabled={isLoading || !ratingUsername.trim()}
            className="clip-corner-sm bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
          >
            {isLoading ? "..." : "GET"}
          </button>
        </div>

        {rating !== null && (
          <div className="clip-corner-sm bg-black border border-cyan-700 p-4 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Rating</div>
            <div className="text-3xl font-bold text-cyan-400 font-mono">
              {rating}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 clip-corner-sm">
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerRatingPanel;
