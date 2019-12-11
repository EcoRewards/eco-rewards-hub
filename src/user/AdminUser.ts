export interface AdminUser {
  id: AdminUserId | null,
  name: string,
  email: string,
  password: string
  role: AdminRole
}

export type AdminUserId = number;

export type AdminRole = "admin" | "provider";
