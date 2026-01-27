import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 1. Create a private signal to hold the user state
  private currentUserSignal = signal<any>(this.getStoredUser());

  // 2. Expose it as a computed/readonly signal for components
  currentUser = computed(() => this.currentUserSignal());

  constructor(private http: HttpClient) {}

  // Internal helper to check localStorage on startup
  private getStoredUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  login(username: string, password: string) {
    return this.http.get<any[]>(
      `http://localhost:3000/users?username=${username}&password=${password}`
    ).pipe(
      tap(users => {
        if (users.length > 0) {
          this.setUser(users[0]);
        }
      })
    );
  }

  setUser(user: any) {
    // 3. Update the signal using .set()
    this.currentUserSignal.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Keep this for backward compatibility if other components use it
  getUser() {
    return this.currentUserSignal();
  }

  logout() {
    localStorage.removeItem('user');
    // 4. Clear the signal
    this.currentUserSignal.set(null);
  }

  // Helper for your components to check role
  userRole() {
    return this.currentUserSignal()?.role || '';
  }

  isLoggedIn() {
    return this.currentUserSignal() !== null;
  }
}