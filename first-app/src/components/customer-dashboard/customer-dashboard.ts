import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';

import { Policy } from '../../models/policy';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy-service';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, CustomerNavbar, RouterLink],
  templateUrl: './customer-dashboard.html'
})
export class CustomerDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private policyService = inject(PolicyService);

  private registeredSubject = new BehaviorSubject<Policy[]>([]);
  registeredPolicies$ = this.registeredSubject.asObservable();

  stats$ = this.registeredPolicies$.pipe(
    map(policies => ({
      totalCoverage: policies.reduce((acc, p) => acc + (p.coverage || 0), 0),
      policyCount: policies.length,
      totalPremium: policies.reduce((acc, p) => acc + (p.premium || 0), 0),
    }))
  );

  ngOnInit() {
    this.loadRegisteredPolicies();
  }

  loadRegisteredPolicies() {
    const user = this.auth.currentUser(); 
    if (!user) return;

    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .subscribe(customers => {
        if (customers.length > 0) {
          const policyIds = customers[0].policyIds || [];
          this.policyService.getPoliciesByIds(policyIds).subscribe(data => {
            this.registeredSubject.next(data);
          });
        }
      });
  }
}