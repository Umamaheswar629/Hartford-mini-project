import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; // Added RouterLink
import { BehaviorSubject, take } from 'rxjs';
import { Policy } from '../../models/policy';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy-service';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';

@Component({
  selector: 'app-registered-policies',
  standalone: true, // Ensure standalone is true
  imports: [CommonModule, CustomerNavbar, RouterLink],
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

    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .subscribe({
        next: (customers) => {
          if (customers.length > 0) {
            const policyIds = customers[0].policyIds || [];
            this.policyService.getPoliciesByIds(policyIds).subscribe(data => {
              this.registeredSubject.next(data);
              this.loading = false;
            });
          } else {
            this.loading = false;
            this.registeredSubject.next([]);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error("Failed to load customer record.", err);
        }
      });
  }

  // FIXED ROUTE
  viewDetails(policyId: string) {
    this.router.navigate(['/customer/dashboard/details', policyId]);
  }

  cancelPolicy(policyId: string) {
    const user = this.auth.currentUser();
    if (!user) return;

    if (!confirm('Are you sure you want to cancel this policy? This will also remove any associated claims.')) {
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .pipe(take(1))
      .subscribe(customers => {
        if (customers.length > 0) {
          const customer = customers[0];
          const updatedPolicyIds = customer.policyIds.filter((id: string) => id !== policyId);
          
          this.http.put(`http://localhost:3000/customers/${customer.id}`, {
            ...customer,
            policyIds: updatedPolicyIds
          }).subscribe({
            next: () => {
              alert('Policy cancelled successfully.');
              this.loadRegisteredPolicies(); 
              this.removeAssociatedClaims(String(user.id), policyId); 
            },
            error: () => alert('Failed to cancel policy.')
          });
        }
      });
  }

  private removeAssociatedClaims(userId: string, policyId: string) {
    this.http.get<any[]>(`http://localhost:3000/customers?userId=${userId}`).subscribe(customers => {
      if (customers.length > 0) {
        const custId = customers[0].id;
        this.http.get<any[]>(`http://localhost:3000/claims?customerId=${custId}&policyId=${policyId}`)
          .subscribe(claims => {
            claims.forEach(claim => {
              this.http.delete(`http://localhost:3000/claims/${claim.id}`).subscribe();
            });
          });
      }
    });
  }
}