export interface AdminUser {
  id: UserId | null,
  name: string,
  email: string,
  password: string
}

export type UserId = number;
