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
  
  // Signal for current user
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  
  // Computed signals
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.role || '');

  constructor(private http: HttpClient) {}

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /**
   * User Login
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.http.get<User[]>(`${this.apiUrl}?email=${email}`).toPromise();
      
      if (!users || users.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = users[0];
      
      // Check password
      if ((user as any).password !== password) {
        return { success: false, message: 'Invalid password' };
      }

      // Remove password from user object
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).password;

      // Generate JWT token
      const token = this.generateJWT(userWithoutPassword);
      
      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      localStorage.setItem('authToken', token);
      
      // Update signal
      this.currentUserSignal.set(userWithoutPassword);

      return { success: true, message: 'Login successful', user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  /**
   * User Registration
   */
  async register(userData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email exists
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

      // Add user to database
      await this.http.post<User>(this.apiUrl, newUser).toPromise();
      
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSignal.set(null);
  }

  /**
   * Generate JWT Token
   */
  private generateJWT(user: User): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const signature = btoa('insuresure-secret-key');

    return `${base64Header}.${base64Payload}.${signature}`;
  }
}