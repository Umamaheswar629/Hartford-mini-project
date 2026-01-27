import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  role = '';
  errorMessage='';
  private http=inject(HttpClient)
  private router=inject(Router)
onLogin() {
  this.errorMessage = '';

  this.http.get<any[]>(`http://localhost:3000/users?email=${this.email}&password=${this.password}&role=${this.role}`)
    .subscribe({
      next: (users) => {
        if (users.length === 1) {
          const loggedInUser = users[0];
          localStorage.setItem('user', JSON.stringify(loggedInUser));

          if (loggedInUser.role === 'agent') {
            this.router.navigate(['/agent/dashboard']);
          } else if (loggedInUser.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (loggedInUser.role === 'customer') {
            this.router.navigate(['/customer/dashboard']);
          }
        } else {
          this.errorMessage = 'Invalid credentials or role mismatch';
        }
      },
      error: () => {
        this.errorMessage = 'Server error. Try again later.';
      }
    });
}

}
