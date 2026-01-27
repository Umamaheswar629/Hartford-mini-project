import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Policy } from '../../models/policy';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';

@Component({
  selector: 'app-registered-policies',
  imports: [CommonModule,CustomerNavbar],
  templateUrl: './registered-policies.html'
})

export class RegisteredPolicies implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private policyService = inject(PolicyService);
  private router = inject(Router);

  private registeredSubject = new BehaviorSubject<Policy[]>([]);
  registeredPolicies$ = this.registeredSubject.asObservable();
  loading = true;

  ngOnInit() {
    this.loadRegisteredPolicies();
  }

  loadRegisteredPolicies() {
    const user = this.auth.currentUser(); 
    if (!user) return;

    // 1. Fetch the customer record based on logged-in User ID
    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .subscribe({
        next: (customers) => {
          if (customers.length > 0) {
            const policyIds = customers[0].policyIds || [];
            
            // 2. Fetch full policy details for these IDs using your existing service
            this.policyService.getPoliciesByIds(policyIds).subscribe(data => {
              this.registeredSubject.next(data);
              this.loading = false;
            });
          } else {
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
          console.error("Failed to load customer record.");
        }
      });
  }

  viewDetails(policyId: string) {
    this.router.navigate(['/customer/details', policyId]);
  }
}