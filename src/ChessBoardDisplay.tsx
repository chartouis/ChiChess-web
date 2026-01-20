import React from "react";
import { Chessboard } from "react-chessboard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";

type ChessBoardDisplayProps = {
  position: string;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
  boardOrientation: "white" | "black";
};

const ChessBoardDisplay: React.FC<ChessBoardDisplayProps> = ({
  position,
  onPieceDrop,
  boardOrientation,
}) => {
  return (
    <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
      <h2
        className="text-xl font-bold mb-4 text-cyan-500 uppercase tracking-wider"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        Chess Board
      </h2>

      <div className="chess-board-container flex justify-center">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          autoPromoteToQueen={true}
          boardWidth={400}
          customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
          customLightSquareStyle={{ backgroundColor: "#374151" }}
          boardOrientation={boardOrientation}
        />
      </div>

      <div className="mt-4 p-3 bg-black border border-gray-800 clip-corner-sm">
        <p className="text-xs text-gray-500 font-mono">
          // Drag and drop pieces to send MOVE messages
          <br />
          // Board orientation: {boardOrientation.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default ChessBoardDisplay;
