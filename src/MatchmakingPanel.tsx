import React, { useState } from "react";
import type { JoinQueueRequest } from "./types";

type MatchmakingPanelProps = {
  connected: boolean;
  onSendQueue: (request: JoinQueueRequest) => void;
};

const MatchmakingPanel: React.FC<MatchmakingPanelProps> = ({
  connected,
  onSendQueue,
}) => {
  const [rated, setRated] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(3000);
  const [gameType, setGameType] = useState("blitz");
  const [preferences, setPreferences] = useState("");

  const handleJoinQueue = () => {
    const queueRequest: JoinQueueRequest = {
      rated,
      minRating,
      maxRating,
      gameType,
      preferences: preferences
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p),
    };
    onSendQueue(queueRequest);
  };

  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Matchmaking Queue
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">
              GAME TYPE
            </label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
            >
              <option value="bullet">Bullet</option>
              <option value="blitz">Blitz</option>
              <option value="rapid">Rapid</option>
              <option value="classical">Classical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={rated}
                onChange={(e) => setRated(e.target.checked)}
                className="w-4 h-4"
              />
              RATED
            </label>
            <div className="h-8 flex items-center text-xs text-gray-500">
              {rated ? "Affects rating" : "Casual"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-2 text-gray-400">
              MIN RATING
            </label>
            <input
              type="number"
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value))}
              className="w-full clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 text-gray-400">
              MAX RATING
            </label>
            <input
              type="number"
              value={maxRating}
              onChange={(e) => setMaxRating(parseInt(e.target.value))}
              className="w-full clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-2 text-gray-400">
            PREFERENCES
          </label>
          <input
            type="text"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="comma-separated"
            className="w-full clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleJoinQueue}
          className="w-full clip-corner-sm bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-3 font-bold uppercase tracking-wider transition-all glow-cyan"
        >
          {connected ? "JOIN QUEUE" : "CONNECT & JOIN QUEUE"}
        </button>
      </div>
    </div>
  );
};

export default MatchmakingPanel;
