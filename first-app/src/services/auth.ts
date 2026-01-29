import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  
  private currentUserSignal = signal<User | null>(null);
  // NEW: Signal to store the JWT in memory
  private authTokenSignal = signal<string | null>(null);
  
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.role || '');
  // NEW: Computed signal for the token
  authToken = computed(() => this.authTokenSignal());

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.http.get<User[]>(`${this.apiUrl}?email=${email}`).toPromise();
      
      if (!users || users.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = users[0];
      
      if ((user as any).password !== password) {
        return { success: false, message: 'Invalid password' };
      }

      const token = this.generateJWT(user);
      console.log("DEBUG: My Generated JWT Token is:", token);
      await this.http.patch(`${this.apiUrl}/${user.id}`, { token: token }).toPromise();
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).password;

    
      // UPDATED: Store both User and Token in signals
      this.authTokenSignal.set(token);
      this.currentUserSignal.set(userWithoutPassword);

      return { success: true, message: 'Login successful', user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async register(userData: any): Promise<{ success: boolean; message: string }> {
    try {
      const existingUsers = await this.http.get<User[]>(`${this.apiUrl}?email=${userData.email}`).toPromise();
      
      if (existingUsers && existingUsers.length > 0) {
        return { success: false, message: 'Email already exists' };
      }

      const newUser = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      };

      await this.http.post<User>(this.apiUrl, newUser).toPromise();
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.authTokenSignal.set(null); // NEW: Clear token
  }

  private generateJWT(user: User): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const signature = btoa('insuresure-secret-key');

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  getUser() {
    return this.currentUserSignal();
  }
}