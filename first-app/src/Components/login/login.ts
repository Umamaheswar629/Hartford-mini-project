import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.auth.login(this.username, this.password).subscribe({
      next: (users) => {
        this.isSubmitting = false;
        if (users.length > 0) {
          const user = users[0];
          // Navigate based on role defined in db.json
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/customer']);
          }
        } else {
          this.errorMessage = 'Invalid username or password.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Server error. Please try again later.';
      }
    });
  }
}