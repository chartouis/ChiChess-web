import { useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { Client, Stomp } from "@stomp/stompjs";

export default function Board() {
  type move = {
    from: string;
    to: string;
    promotion: string;
  };

  const [game, setGame] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  );

  const [roomId, setRoomId] = useState("");

  const stompClient = new Client({
    brokerURL: "ws://localhost:8080/api/ws",

    onConnect: () => {
      console.log("Connected to WebSocket");
      stompClient.subscribe(`/subscribed/game/${roomId}`, (message) => {
        console.log("Received:", JSON.parse(message.body));
      });
    },
    onStompError: (error) => {
      console.error("Error:", error);
    },
  });

  const sendMoveRequest = (move: move): boolean => {
    // Start connection
    stompClient.activate();
    

    if (!stompClient.connected) {
      stompClient.deactivate();
    }

    if (!stompClient.active) {
      console.log("Not connected, activating...");
      stompClient.activate();
      return false;
    }

    stompClient.publish({
      destination: `/api/game/${roomId}/move`,
      body: JSON.stringify(move),
    });
    return true;
  };

  function onDrop(
    sourceSquare: Square,
    targetSquare: Square,
    promotion: Piece
  ): boolean {
    const move = sendMoveRequest({
      from: sourceSquare,
      to: targetSquare,
      promotion: "",
    });
    return move;
  }

  function connect() {
    stompClient.activate();
  }

  return (
    <div className="w-dvh">
      <div className="flex flex-col text-white">
        <label className="mb-1 ">Reset Password</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
      </div>
      <Chessboard
        onPieceDrop={onDrop}
        autoPromoteToQueen={true}
        position={game}
      />
    </div>
  );
}
