export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional because you usually don't keep passwords in the frontend
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  token?:string;
}