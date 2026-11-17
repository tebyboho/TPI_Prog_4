export type Role = "user" | "admin";

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}
