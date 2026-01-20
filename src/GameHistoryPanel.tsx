import React, { useState } from "react";
import axios from "axios";
import type { PaginatedResponse, RoomState } from "./types";

type GameHistoryPanelProps = {
  apiBase: string;
};

const GameHistoryPanel: React.FC<GameHistoryPanelProps> = ({ apiBase }) => {
  const [historyUsername, setHistoryUsername] = useState("");
  const [historyData, setHistoryData] =
    useState<PaginatedResponse<RoomState> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async (page: number) => {
    if (!historyUsername.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/history`, {
        params: {
          username: historyUsername,
          page,
          size: pageSize,
        },
        withCredentials: true,
      });
      setHistoryData(response.data);
      setCurrentPage(page);
    } catch (error) {
      console.error("History error:", error);
      setHistoryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHistory(0);
  };

  const handleNextPage = () => {
    if (historyData?.hasNext) {
      fetchHistory(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (historyData?.hasPrevious) {
      fetchHistory(currentPage - 1);
    }
  };

  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Game History
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={historyUsername}
            onChange={(e) => setHistoryUsername(e.target.value)}
            placeholder="Enter username"
            className="flex-1 clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !historyUsername.trim()}
            className="clip-corner-sm bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
          >
            {isLoading ? "..." : "LOAD"}
          </button>
        </div>

        {historyData && (
          <>
            <div className="bg-black border border-gray-800 clip-corner-sm p-3 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {historyData.items.map((game, idx) => (
                  <div
                    key={idx}
                    className="clip-corner-sm bg-gray-900 border border-cyan-900/50 p-3 text-xs font-mono"
                  >
                    <div className="text-cyan-400 mb-2">
                      <span className="font-bold">Game ID:</span> {game.id}
                    </div>
                    <div className="text-gray-400 space-y-1">
                      <div>
                        <span className="text-gray-500">White:</span>{" "}
                        {game.white}
                      </div>
                      <div>
                        <span className="text-gray-500">Black:</span>{" "}
                        {game.black}
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>{" "}
                        {game.status}
                      </div>
                      {game.winner && (
                        <div>
                          <span className="text-gray-500">Winner:</span>{" "}
                          {game.winner}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Type:</span>{" "}
                        {game.gameType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Page {historyData.page + 1} of {historyData.totalPages} (
                {historyData.totalElements} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!historyData.hasPrevious}
                  className="clip-corner-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PREV
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!historyData.hasNext}
                  className="clip-corner-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  NEXT
                </button>
              </div>
            </div>
          </>
        )}

        {!historyData && historyUsername && !isLoading && (
          <div className="p-3 bg-black border border-gray-800 clip-corner-sm">
            <p className="text-xs text-gray-500 font-mono">
              // No history loaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPanel;
