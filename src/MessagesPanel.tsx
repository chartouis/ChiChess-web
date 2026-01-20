import React from "react";
import { ChessMessage } from "./types";

type MessagesPanelProps = {
  messages: ChessMessage[];
  onClear: () => void;
};

const MessagesPanel: React.FC<MessagesPanelProps> = ({ messages, onClear }) => {
  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-xl font-bold text-cyan-500 uppercase tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Messages
        </h2>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 clip-corner-sm"
        >
          CLEAR
        </button>
      </div>

      <div className="h-64 overflow-y-auto bg-black border border-gray-800 p-3">
        {messages.length === 0 ? (
          <p className="text-gray-600 text-sm font-mono">
            // No messages received
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="clip-corner-sm bg-gray-900 border border-cyan-900/50 p-3 text-xs font-mono text-cyan-400"
              >
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;
