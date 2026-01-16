export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  name: string;
  email: string;
  password?: string;
}
