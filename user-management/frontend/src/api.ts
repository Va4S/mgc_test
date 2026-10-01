// Обращения к серверу и типы данных.
export type Role = "admin" | "employee";

export interface User {
  id: number;
  login: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface UserPage {
  items: User[];
  total: number;
}

export interface UserForm {
  login: string;
  full_name: string;
  role: Role;
  password?: string;
}

const TOKEN_KEY = "token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (value: string) => localStorage.setItem(TOKEN_KEY, value),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function errorText(body: any): string {
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) return "Проверьте правильность заполнения полей";
  return "Не удалось выполнить запрос";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`/api${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(response.status, errorText(body));
  }
  return body as T;
}

export const api = {
  login: (login: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    }),
  me: () => request<User>("/auth/me"),
  users: (page: number, pageSize: number, search: string) =>
    request<UserPage>(
      `/users?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`
    ),
  createUser: (data: UserForm) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: Partial<UserForm>) =>
    request<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: number) => request<void>(`/users/${id}`, { method: "DELETE" }),
};
