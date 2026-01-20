import React, { useState } from "react";

type SpectatePanelProps = {
  connected: boolean;
  onSpectate: (username: string) => void;
};

const SpectatePanel: React.FC<SpectatePanelProps> = ({
  connected,
  onSpectate,
}) => {
  const [spectateUsername, setSpectateUsername] = useState("");

  const handleSpectate = () => {
    if (spectateUsername.trim()) {
      onSpectate(spectateUsername.trim());
    }
  };

  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Spectate Game
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-2 text-gray-400">
            USERNAME TO SPECTATE
          </label>
          <input
            type="text"
            value={spectateUsername}
            onChange={(e) => setSpectateUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full clip-corner-sm bg-black border border-gray-700 px-3 py-2 text-cyan-400 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleSpectate}
          disabled={!connected || !spectateUsername.trim()}
          className="w-full clip-corner-sm bg-purple-600 hover:bg-purple-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all"
        >
          SPECTATE
        </button>

        <div className="p-3 bg-black border border-gray-800 clip-corner-sm">
          <p className="text-xs text-gray-500 font-mono">
            // To stop spectating, disconnect
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpectatePanel;
