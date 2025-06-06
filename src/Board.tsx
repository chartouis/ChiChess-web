import axios from "axios";
import { useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { API_URL } from "./appconfig";

export default function Board() {
  type move = {
    from: string;
    to: string;
    promotion: string;
  };

  const sendMoveRequest = (Move: move): boolean => {
    axios
      .post(
        API_URL + "/move",
        {
          roomId: roomId,
          from: Move.from,
          to: Move.to,
          promotion: Move.promotion,
        },
        { withCredentials: true }
      )
      .then((resp) => {
        return resp;
      });
    return false;
  };

  const [game, setGame] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  );

  const [roomId, setRoomId] = useState("");

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
      <Chessboard onPieceDrop={onDrop} autoPromoteToQueen={true} />
    </div>
  );
}
