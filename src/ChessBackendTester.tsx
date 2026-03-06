import React, { useEffect, useRef, useState } from "react";
import type { Piece, Square } from "react-chessboard/dist/chessboard/types";
import axios from "axios";
import type {
  ChessMessage,
  JoinQueueRequest,
  MoveMessage,
  RoomState,
} from "./types";
import ConnectionPanel from "./ConnectionPanel";
import MatchmakingPanel from "./MatchmakingPanel";
import GameActionsPanel from "./GameActionsPanel";
import SpectatePanel from "./SpectatePanel";
import PlayerSearchPanel from "./PlayerSearchPanel";
import GameHistoryPanel from "./GameHistoryPanel";
import PlayerRatingPanel from "./PlayerRatingPanel";
import ChessTimer from "./ChessTimer";
import ChessBoardDisplay from "./ChessBoardDisplay";
import MessagesPanel from "./MessagesPanel";

const ChessBackendTester: React.FC = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const [gameId, setGameId] = useState("");
  const [messages, setMessages] = useState<ChessMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [position, setPosition] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<string>("");

  // Auth states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fingerprint, setFingerprint] = useState("test-fingerprint");
  const [activeTab, setActiveTab] = useState<
    "auth" | "game" | "tools" | "social"
  >("game");

  const API_BASE = "http://89.167.109.23:80";
  const WS_BASE = "ws://89.167.109.23:80";

  // Calculate whose turn it is from FEN position
  const getTurnFromFEN = (fen: string): "WHITE" | "BLACK" => {
    const parts = fen.split(" ");
    if (parts.length >= 2) {
      return parts[1] === "w" ? "WHITE" : "BLACK";
    }
    return "WHITE";
  };

  // Timer logic
  useEffect(() => {
    if (
      roomState &&
      roomState.remainingWhite !== undefined &&
      roomState.remainingBlack !== undefined
    ) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      const currentPlayerTurn =
        roomState.position ? getTurnFromFEN(roomState.position) : "WHITE";
      setCurrentTurn(currentPlayerTurn);

      const now = Date.now();
      const lastMove = roomState.lastMoveEpoch || now;
      const elapsedSinceLastMove = now - lastMove;

      if (roomState.status === "ACTIVE" || roomState.status === "ONGOING") {
        if (currentPlayerTurn === "WHITE") {
          setWhiteTime(
            Math.max(0, roomState.remainingWhite - elapsedSinceLastMove),
          );
          setBlackTime(roomState.remainingBlack);
        } else {
          setWhiteTime(roomState.remainingWhite);
          setBlackTime(
            Math.max(0, roomState.remainingBlack - elapsedSinceLastMove),
          );
        }

        timerIntervalRef.current = setInterval(() => {
          const nowInterval = Date.now();
          const totalElapsed = nowInterval - lastMove;

          if (currentPlayerTurn === "WHITE") {
            setWhiteTime(
              Math.max(0, roomState.remainingWhite ?? 0 - totalElapsed),
            );
          } else {
            setBlackTime(
              Math.max(0, roomState.remainingBlack ?? 0 - totalElapsed),
            );
          }
        }, 100);
      } else {
        setWhiteTime(roomState.remainingWhite);
        setBlackTime(roomState.remainingBlack);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [
    roomState?.position,
    roomState?.remainingWhite,
    roomState?.remainingBlack,
    roomState?.lastMoveEpoch,
    roomState?.status,
  ]);

  const connect = () => {
    if (connected) return;

    const socket = new WebSocket(`${WS_BASE}/api/ws/game`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);

      if (data.gameId || data.roomId || data.id) {
        const receivedGameId = data.gameId || data.roomId || data.id;
        console.log("Game ID received:", receivedGameId);
        setGameId(receivedGameId);
      }

      if (data.state) {
        setRoomState(data.state);

        if (data.state.position) {
          console.log("Updating board position:", data.state.position);
          setPosition(data.state.position);
        }
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

  const sendMessage = (type: string, payload: any) => {
    if (!connected || !socketRef.current) {
      console.log("Not connected to WebSocket");
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify({ type, payload }));
      console.log(`Sent ${type}:`, payload);
      return true;
    } catch (error) {
      console.error(`Failed to send ${type}:`, error);
      return false;
    }
  };

  const sendMove = (from: string, to: string, promotion: string = "") => {
    const message: MoveMessage = { from, to, promotion };
    return sendMessage("MOVE", message);
  };

  const sendResign = () => sendMessage("RESIGN", {});
  const sendDraw = () => sendMessage("DRAW", {});
  const sendUpdate = () => sendMessage("UPDATE", {});
  const sendReconnect = () => sendMessage("RECONNECT", {});
  const sendQueueState = () => sendMessage("QUEUE_STATE", {});

  const sendSpectate = (spectateUsername: string) => {
    return sendMessage("SPECTATE", { username: spectateUsername });
  };

  const handleSendQueue = (queueRequest: JoinQueueRequest) => {
    if (!connected) {
      const socket = new WebSocket(`${WS_BASE}/api/ws/game`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        socket.send(JSON.stringify({ type: "QUEUE", payload: queueRequest }));
        console.log("Sent QUEUE:", queueRequest);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        setMessages((prev) => [...prev, data]);

        if (data.gameId || data.roomId || data.id) {
          const receivedGameId = data.gameId || data.roomId || data.id;
          console.log("Game ID received:", receivedGameId);
          setGameId(receivedGameId);
        }

        if (data.state) {
          setRoomState(data.state);

          if (data.state.position) {
            console.log("Updating board position:", data.state.position);
            setPosition(data.state.position);
          }
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
    } else {
      return sendMessage("QUEUE", queueRequest);
    }
  };

  const onPieceDrop = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ): boolean => {
    let promotion = "";
    if (piece.includes("P") || piece.includes("p")) {
      const targetRank = targetSquare[1];
      if (targetRank === "8" || targetRank === "1") {
        promotion = "q";
      }
    }

    const moveSuccess = sendMove(sourceSquare, targetSquare, promotion);
    return moveSuccess;
  };

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (isSignUp) {
        const res = await axios.post(
          `${API_BASE}/register`,
          { email, password, username, fingerprint },
          { withCredentials: true },
        );
        console.log("Register response:", res.data);
        localStorage.setItem("chess_username", username);
        setUsername(username);
      } else {
        const res = await axios.post(
          `${API_BASE}/login`,
          { password, username, fingerprint },
          { withCredentials: true },
        );
        console.log("Login response:", res.data);
        localStorage.setItem("chess_username", username);
        setUsername(username);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const refresh = async () => {
    try {
      await axios.get(`${API_BASE}/refresh`, { withCredentials: true });
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const getBoardOrientation = (): "white" | "black" => {
    if (!roomState || !username) return "white";

    if (roomState.black === username) {
      return "black";
    }
    return "white";
  };

  useEffect(() => {
    connect();
    refresh();

    const storedUsername = localStorage.getItem("chess_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const id = setInterval(() => {
      refresh();
    }, 60_000);

    return () => {
      clearInterval(id);
      socketRef.current?.close();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-gray-100 p-8"
      style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;600&display=swap');
        
        .clip-corner {
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        }
        
        .clip-corner-sm {
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        
        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1);
        }
        
        .timer-display {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.05em;
        }
        
        .chess-board-container {
          filter: drop-shadow(0 0 30px rgba(34, 211, 238, 0.3));
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.5);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 clip-corner bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-500 p-6">
          <h1
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            CHESS BACKEND TESTER
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Real-time WebSocket testing interface
            </p>
            {username && (
              <p className="text-cyan-400 text-sm font-mono">
                Player: <span className="font-bold">{username}</span>
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {["game", "tools", "social", "auth"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`clip-corner-sm px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === tab ?
                  "bg-cyan-500 text-black glow-cyan"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Game Tab */}
        {activeTab === "game" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ConnectionPanel
                connected={connected}
                gameId={gameId}
                onDisconnect={disconnect}
              />
              <MatchmakingPanel
                connected={connected}
                onSendQueue={handleSendQueue}
              />
              <GameActionsPanel
                connected={connected}
                onUpdate={sendUpdate}
                onReconnect={sendReconnect}
                onResign={sendResign}
                onDraw={sendDraw}
                onQueueState={sendQueueState}
              />
              <SpectatePanel connected={connected} onSpectate={sendSpectate} />
              <MessagesPanel
                messages={messages}
                onClear={() => setMessages([])}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {roomState &&
                (roomState.remainingWhite !== undefined ||
                  roomState.remainingBlack !== undefined) && (
                  <ChessTimer
                    roomState={roomState}
                    username={username}
                    whiteTime={whiteTime}
                    blackTime={blackTime}
                    currentTurn={currentTurn}
                  />
                )}
              <ChessBoardDisplay
                position={position}
                onPieceDrop={onPieceDrop}
                boardOrientation={getBoardOrientation()}
              />
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PlayerSearchPanel apiBase={API_BASE} />
              <PlayerRatingPanel apiBase={API_BASE} />
            </div>
            <div className="space-y-6">
              <GameHistoryPanel apiBase={API_BASE} />
            </div>
          </div>
        )}

        {/* Auth Tab */}
        {activeTab === "auth" && (
          <div className="max-w-md mx-auto">
            <div className="clip-corner bg-gray-900 border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-xl font-bold text-cyan-500 uppercase tracking-wider"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </h2>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 clip-corner-sm"
                >
                  SWITCH
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-400">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full clip-corner-sm bg-black border border-gray-700 px-4 py-3 text-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-400">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full clip-corner-sm bg-black border border-gray-700 px-4 py-3 text-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-400">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full clip-corner-sm bg-black border border-gray-700 px-4 py-3 text-cyan-400 font-mono"
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-400">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full clip-corner-sm bg-black border border-gray-700 px-4 py-3 text-cyan-400 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-400">
                    FINGERPRINT
                  </label>
                  <input
                    type="text"
                    value={fingerprint}
                    onChange={(e) => setFingerprint(e.target.value)}
                    required
                    className="w-full clip-corner-sm bg-black border border-gray-700 px-4 py-3 text-cyan-400 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full clip-corner-sm bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-4 font-bold uppercase tracking-wider transition-all glow-cyan"
                >
                  {isSignUp ? "REGISTER" : "LOGIN"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={refresh}
                  className="w-full clip-corner-sm bg-green-600 hover:bg-green-500 text-black px-4 py-3 font-bold uppercase tracking-wider transition-all"
                >
                  REFRESH TOKEN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessBackendTester;
