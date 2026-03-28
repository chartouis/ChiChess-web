// src/lib/types/chess.ts

export type ChessMessage = {
	type: string;
	[key: string]: unknown;
};

export type MoveMessage = {
	from: string;
	to: string;
	promotion: string;
};

export type JoinQueueRequest = {
	rated: boolean;
	minRating: number;
	maxRating: number;
	gameType: string;
	preferences: string[];
};

export type RoomState = {
	id?: string;
	creator?: string;
	black?: string;
	white?: string;
	position?: string; // FEN string
	history?: string; // comma-separated SAN moves e.g. "e4,e5,Nf3,Nc6"
	timestamps?: string; // comma-separated epoch ms e.g. "1700000000000,1700000001500"
	drawOfferedBy?: string;
	status?: string; // "ONGOING" | "CHECKMATE" | "STALEMATE" | "RESIGNATION" | etc.
	winner?: string;
	gameType?: string;
	remainingWhite?: number; // ms
	remainingBlack?: number; // ms
	lastMoveEpoch?: number; // ms epoch
	createdAt?: string;
	gameStartedAt?: string;
	[key: string]: unknown;
};

export type PaginatedResponse<T> = {
	items: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	hasNext: boolean;
	hasPrevious: boolean;
};

export type UserRating = {
	username: string;
	rating: number;
	[key: string]: unknown;
};

// Parsed move entry for the move history panel
export type ParsedMove = {
	san: string;
	timestampMs: number;
	moveNumber: number; // 1-indexed full move number
	color: 'white' | 'black';
};

// Game context exposed to all child components via setContext('game', ...)
export type GameContext = {
	sendMove: (from: string, to: string, promotion?: string) => boolean;
	sendResign: () => boolean;
	sendDraw: () => boolean;
	sendUpdate: () => boolean;
	joinQueue: (request: JoinQueueRequest) => void;
	cancelQueue: () => void;
	sendSpectate: (targetUsername: string) => boolean;
	getBoardSide: () => 'white' | 'black';
};
