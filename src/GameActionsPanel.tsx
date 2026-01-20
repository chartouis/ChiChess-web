import React from "react";

type GameActionsPanelProps = {
  connected: boolean;
  onUpdate: () => void;
  onReconnect: () => void;
  onResign: () => void;
  onDraw: () => void;
  onQueueState: () => void;
};

const GameActionsPanel: React.FC<GameActionsPanelProps> = ({
  connected,
  onUpdate,
  onReconnect,
  onResign,
  onDraw,
  onQueueState,
}) => {
  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Game Actions
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUpdate}
          disabled={!connected}
          className="clip-corner-sm bg-blue-600 hover:bg-blue-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
        >
          UPDATE
        </button>

        <button
          onClick={onReconnect}
          disabled={!connected}
          className="clip-corner-sm bg-purple-600 hover:bg-purple-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
        >
          RECONNECT
        </button>

        <button
          onClick={onResign}
          disabled={!connected}
          className="clip-corner-sm bg-orange-600 hover:bg-orange-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
        >
          RESIGN
        </button>

        <button
          onClick={onDraw}
          disabled={!connected}
          className="clip-corner-sm bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm"
        >
          DRAW
        </button>

        <button
          onClick={onQueueState}
          disabled={!connected}
          className="clip-corner-sm bg-green-600 hover:bg-green-500 text-black px-4 py-3 font-bold uppercase tracking-wider disabled:bg-gray-700 disabled:text-gray-500 transition-all text-sm col-span-2"
        >
          QUEUE STATE
        </button>
      </div>
    </div>
  );
};

export default GameActionsPanel;
