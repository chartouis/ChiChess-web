import React from "react";

type ConnectionPanelProps = {
  connected: boolean;
  gameId: string;
  onDisconnect: () => void;
};

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  connected,
  gameId,
  onDisconnect,
}) => {
  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Connection Status
      </h2>

      <div className="space-y-4">
        {gameId && (
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">
              CURRENT GAME ID
            </label>
            <div className="w-full clip-corner-sm bg-black border border-cyan-700 px-4 py-3 text-cyan-400 font-mono text-xs break-all">
              {gameId}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onDisconnect}
            disabled={!connected}
            className="flex-1 clip-corner-sm bg-red-600 hover:bg-red-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all"
          >
            DISCONNECT
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">STATUS:</span>
          <span
            className={`font-bold ${
              connected ? "text-green-400" : "text-red-400"
            }`}
          >
            {connected ? "● ONLINE" : "○ OFFLINE"}
          </span>
        </div>

        <div className="p-3 bg-black border border-gray-800 clip-corner-sm">
          <p className="text-xs text-gray-500 font-mono">
            // WebSocket auto-connects on page load
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;
