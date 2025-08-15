import React, { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";

type ChessMessage = {
  type: string;
  [key: string]: any;
};

type MoveMessage = {
  from: string;
  to: string;
  promotion: string;
};

const ChessWebSocketBoard: React.FC = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [gameId, setGameId] = useState("");
  const [messages, setMessages] = useState<ChessMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [position, setPosition] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  );

  const connect = () => {
    if (connected || !gameId) return;

    const socket = new WebSocket(`ws://localhost:8081/api/ws/game/${gameId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);
      
      // Update board position from the game state
      if (data.state && data.state.position) {
        console.log("Updating board position:", data.state.position);
        setPosition(data.state.position);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      setConnected(false);
    }
  };

  const sendMove = (from: string, to: string, promotion: string = "") => {
    if (!connected || !socketRef.current) {
      console.log("Not connected to WebSocket");
      return false;
    }

    const message: MoveMessage = {
      from,
      to,
      promotion,
    };

    try {
      socketRef.current.send(JSON.stringify(message));
      console.log("Sent move:", message);
      return true;
    } catch (error) {
      console.error("Failed to send move:", error);
      return false;
    }
  };

  const onPieceDrop = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece
  ): boolean => {
    // Determine if this is a promotion move (pawn reaching end rank)
    let promotion = "";
    if (piece.includes("P") || piece.includes("p")) {
      const targetRank = targetSquare[1];
      if (targetRank === "8" || targetRank === "1") {
        promotion = "q"; // Auto-promote to queen
      }
    }

    const moveSuccess = sendMove(sourceSquare, targetSquare, promotion);
    return moveSuccess;
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      socketRef.current?.close();
    };
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Game ID:</label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            disabled={connected}
            className="border rounded px-3 py-2 flex-1 max-w-xs"
            placeholder="Enter game ID"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={connect}
            disabled={connected || !gameId}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {connected ? "Connected" : "Connect"}
          </button>
          
          <button
            onClick={disconnect}
            disabled={!connected}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
        </div>
        
        <div className="text-sm">
          Status: <span className={connected ? "text-green-600" : "text-red-600"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          autoPromoteToQueen={true}
          boardWidth={400}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Messages:</h3>
        <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet</p>
          ) : (
            <ul className="space-y-1">
              {messages.map((msg, idx) => (
                <li key={idx} className="text-xs font-mono bg-white p-2 rounded border">
                  {JSON.stringify(msg, null, 2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessWebSocketBoard;