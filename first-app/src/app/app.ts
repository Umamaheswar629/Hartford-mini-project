import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('first-app');
  isLoggedIn = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.checkLogin();
  }

  checkLogin() {
    const user = this.auth.getUser();
    this.isLoggedIn = !!user;

    if (!user) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
