export interface AdminUser {
  id: UserId | null,
  name: string,
  email: string,
  password: string
  role: AdminRole
}

export type UserId = number;

export type AdminRole = "admin" | "provider";
