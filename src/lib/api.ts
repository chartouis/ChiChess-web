import { goto } from '$app/navigation';
import { NURL } from './config';
import { username } from './stores';
import type { PaginatedResponse, RoomState } from './types/chess';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${NURL}${endpoint}`, options);
	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
	return res.json() as Promise<T>;
}

export interface SignupPayload {
	email: string;
	username: string;
	password: string;
}

export interface LoginPayload {
	username: string;
	password: string;
}

export interface UserDTO {
	id: number;
	username: string;
	email: string;
	createdAt: string; // keep as string, parse later if needed
}

export interface LoginResponse {
	token: string;
}
export const signup = (payload: SignupPayload) =>
	request<UserDTO>('/register', {
		credentials: 'include',
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

export async function login(payload: LoginPayload): Promise<boolean> {
	const r = await loginWithFeedback(payload);
	return r.ok;
}

/** Login with user-visible error message (no alerts). */
export async function loginWithFeedback(
	payload: LoginPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
	try {
		const res = await fetch(`${NURL}/login`, {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) {
			return { ok: false, message: 'Invalid username or password' };
		}
		const data = (await res.json()) as LoginResponse;
		if (data.token === 'SUCCESS') {
			goto('/');
			return { ok: true };
		}
		return { ok: false, message: 'Invalid username or password' };
	} catch {
		return { ok: false, message: 'Invalid username or password' };
	}
}

/** Signup with user-visible error message; does not navigate on success. */
export async function registerWithFeedback(
	payload: SignupPayload
): Promise<{ ok: true; user: UserDTO } | { ok: false; message: string }> {
	try {
		const res = await fetch(`${NURL}/register`, {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const text = await res.text();
		let body: unknown = null;
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = null;
		}
		if (!res.ok) {
			const msg =
				body &&
				typeof body === 'object' &&
				body !== null &&
				'message' in body &&
				typeof (body as { message: unknown }).message === 'string'
					? (body as { message: string }).message
					: 'Registration failed, please try again';
			return { ok: false, message: msg };
		}
		return { ok: true, user: body as UserDTO };
	} catch {
		return { ok: false, message: 'Registration failed, please try again' };
	}
}

export async function refresh(): Promise<boolean> {
	try {
		const res = await fetch(`${NURL}/refresh`, {
			credentials: 'include',
			method: 'GET'
		});
		return res.ok;
	} catch {
		goto('/login');
		return false;
	}
}

export async function validate(): Promise<boolean> {
	try {
		const res = await fetch(`${NURL}/api/validate`, {
			credentials: 'include',
			method: 'GET'
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function logout() {
	try {
		await fetch(`${NURL}/logout`, {
			credentials: 'include',
			method: 'POST'
		});
	} finally {
		username.set('');
		try {
			localStorage.removeItem('username');
		} catch {
			/* ignore */
		}
		goto('/login');
	}
}

export async function checkTokenAndRedirect() {
	if (!(await validate())) {
		if (!(await refresh())) {
			goto('/login');
		}
	}
}

/** GET /api/rating/{username} — response body is the rating integer (JSON number). */
export async function fetchRating(name: string): Promise<number> {
	const res = await fetch(`${NURL}/api/rating/${encodeURIComponent(name)}`, {
		credentials: 'include'
	});
	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
	const data: unknown = await res.json();
	if (typeof data === 'number' && Number.isFinite(data)) return data;
	if (data && typeof data === 'object' && 'rating' in data && typeof (data as { rating: unknown }).rating === 'number') {
		return (data as { rating: number }).rating;
	}
	throw new Error('Invalid rating response');
}

export async function fetchGameHistory(
	user: string,
	page: number,
	size: number
): Promise<PaginatedResponse<RoomState>> {
	const params = new URLSearchParams({
		username: user,
		page: String(page),
		size: String(size)
	});
	return request<PaginatedResponse<RoomState>>(`/api/history?${params}`, {
		credentials: 'include'
	});
}

export type ActiveQueueCounts = Record<string, number>;

export async function fetchActiveQueueCounts(): Promise<ActiveQueueCounts> {
	const res = await fetch(`${NURL}/api/active`, { credentials: 'include' });
	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
	return res.json() as Promise<ActiveQueueCounts>;
}
