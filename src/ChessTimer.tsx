import React from "react";
import type { RoomState } from "./types";

type ChessTimerProps = {
  roomState: RoomState;
  username: string;
  whiteTime: number;
  blackTime: number;
  currentTurn: string;
};

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms}`;
};

const ChessTimer: React.FC<ChessTimerProps> = ({
  roomState,
  username,
  whiteTime,
  blackTime,
  currentTurn,
}) => {
  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Game Timer
      </h2>

      <div className="space-y-3">
        {/* Black Timer */}
        <div
          className={`clip-corner-sm p-4 ${
            currentTurn === "BLACK" ?
              "bg-cyan-900/30 border-2 border-cyan-500 glow-cyan"
            : "bg-gray-800 border border-gray-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold">
              BLACK {roomState.black === username && "(YOU)"}
            </span>
            <span
              className={`timer-display text-2xl font-bold ${
                currentTurn === "BLACK" ? "text-cyan-400" : "text-gray-400"
              }`}
            >
              {formatTime(blackTime)}
            </span>
          </div>
        </div>

        {/* Game Status */}
        {roomState.status && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {roomState.status}
            </span>
          </div>
        )}

        {/* White Timer */}
        <div
          className={`clip-corner-sm p-4 ${
            currentTurn === "WHITE" ?
              "bg-cyan-900/30 border-2 border-cyan-500 glow-cyan"
            : "bg-gray-800 border border-gray-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold">
              WHITE {roomState.white === username && "(YOU)"}
            </span>
            <span
              className={`timer-display text-2xl font-bold ${
                currentTurn === "WHITE" ? "text-cyan-400" : "text-gray-400"
              }`}
            >
              {formatTime(whiteTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessTimer;
