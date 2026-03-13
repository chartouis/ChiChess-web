import { NURL } from './config';

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
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

export const login = (payload: LoginPayload) =>
	request<LoginResponse>('/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
