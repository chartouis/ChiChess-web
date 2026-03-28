import type { RoomState } from '$lib/types/chess';

export type OutcomeKind = 'win' | 'loss' | 'draw';

/**
 * Maps a finished game's RoomState to a short label and outcome class for the current user.
 */
export function outcomeForUser(currentUser: string, room: RoomState): { label: string; kind: OutcomeKind } {
	const u = currentUser.trim();
	const status = (room.status ?? '').toUpperCase();
	const winner = (room.winner ?? '').trim();

	const drawish = new Set([
		'DRAW',
		'AGREEMENT',
		'STALEMATE',
		'FIFTY_MOVE',
		'INSUFFICIENT_MATERIAL',
		'INSUFFICIENT',
		'THREE_FOLD_REPETITION',
		'THREEFOLD'
	]);

	if (drawish.has(status)) {
		if (status === 'STALEMATE') return { label: 'Stalemate', kind: 'draw' };
		return { label: 'Draw', kind: 'draw' };
	}

	if (u && winner) {
		if (winner === u) return { label: 'You won', kind: 'win' };
		return { label: 'You lost', kind: 'loss' };
	}

	if (status === 'CHECKMATE' || status === 'RESIGNATION' || status === 'TIMEOUT') {
		if (winner === u) return { label: 'You won', kind: 'win' };
		if (winner) return { label: 'You lost', kind: 'loss' };
	}

	return { label: room.status ?? 'Finished', kind: 'draw' };
}
