const API_BASE_URL =
  import.meta.env.VITE_NETBIT_API_URL ?? "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T;
}

export interface TokenPair {
  access_token: string;
  access_expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface UserPayload {
  id: number;
  username: string;
  email: string | null;
}

export interface AuthSuccess {
  tokens: TokenPair;
  user: UserPayload;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success || !json.data) {
    const message = json.message || response.statusText;
    throw new Error(message);
  }

  return json.data;
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<AuthSuccess> {
  return request<AuthSuccess>(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refresh(payload: {
  refresh_token: string;
}): Promise<AuthSuccess> {
  return request<AuthSuccess>(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(payload: {
  refresh_token: string;
}): Promise<void> {
  await request<unknown>(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
