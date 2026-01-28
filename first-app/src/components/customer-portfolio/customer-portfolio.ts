import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-customer-portfolio',
  standalone: true,
  imports: [CustomerNavbar, CommonModule],
  templateUrl: './customer-portfolio.html',
})
export class CustomerPortfolio implements OnInit {
  auth = inject(AuthService);
  http = inject(HttpClient);
  
  // This signal will now hold the merged data
  mergedData = signal<any>(null);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;

    // 1. Fetch the customer object based on logged-in userId
    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`).pipe(
      switchMap(customers => {
        const customerBase = customers[0];
        // 2. Fetch the corresponding user object to get firstName, lastName, email, etc.
        return this.http.get<any>(`http://localhost:3000/users/${customerBase.userId}`).pipe(
          switchMap(userDetails => {
            // 3. Merge both objects into one
            return [ { ...userDetails, ...customerBase } ];
          })
        );
      })
    ).subscribe(merged => {
      this.mergedData.set(merged);
    });
  }
}