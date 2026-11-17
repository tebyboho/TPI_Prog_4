export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface MensajeResponse {
  message: string;
}
