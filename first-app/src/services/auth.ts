import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    // We use tap to set the user state the moment the data arrives
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
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) this.currentUser = JSON.parse(stored);
    }
    return this.currentUser;
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }
}