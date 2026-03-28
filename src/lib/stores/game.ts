// src/lib/stores/game.ts

import { writable, derived } from 'svelte/store';
import type { RoomState, ParsedMove } from '$lib/types/chess';

// --- Core game state ---
export const roomState   = writable<RoomState | null>(null);
export const gameId      = writable<string>('');
export const connected   = writable<boolean>(false);

// --- Timer state ---
export const whiteTime   = writable<number>(0); // ms remaining
export const blackTime   = writable<number>(0); // ms remaining
export const currentTurn = writable<'WHITE' | 'BLACK'>('WHITE');

// --- Queue state ---
export const isInQueue    = writable<boolean>(false);
export const queueElapsed = writable<number>(0); // ms since queue joined

// --- Derived ---

export const isGameActive = derived(
  roomState,
  ($rs) => $rs?.status === 'ONGOING'
);

export const isGameOver = derived(
  roomState,
  ($rs) => $rs !== null && $rs.status !== 'ONGOING'
);

// Parses history and timestamps from space-separated strings into structured move objects.
// e.g. history: "e4 e5 Nf3"  timestamps: "1000 2500 3800"
export const parsedMoves = derived(
  roomState,
  ($rs): ParsedMove[] => {
    if (!$rs?.history) return [];

    const sans      = $rs.history.split(' ').filter(Boolean);
    const tsStrings = $rs.timestamps?.split(' ').filter(Boolean) ?? [];

    return sans.map((san, i): ParsedMove => ({
      san,
      timestampMs : parseInt(tsStrings[i] ?? '0', 10),
      moveNumber  : Math.floor(i / 2) + 1,
      color       : i % 2 === 0 ? 'white' : 'black',
    }));
  }
);