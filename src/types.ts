// Types
export type ChessMessage = {
  type: string;
  [key: string]: any;
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
  position?: string;
  history?: string;
  timestamps?: string;
  drawOfferedBy?: string;
  status?: string;
  winner?: string;
  gameType?: string;
  remainingWhite?: number;
  remainingBlack?: number;
  lastMoveEpoch?: number;
  createdAt?: string;
  gameStartedAt?: string;
  [key: string]: any;
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
  [key: string]: any;
};
