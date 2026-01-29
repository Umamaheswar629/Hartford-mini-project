export interface User {
  id: string; // Changed from number to string
  username: string;
  email: string;
  password?: string; 
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  token?: string; 
}