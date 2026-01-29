import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy-service';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';
import { BehaviorSubject, map, switchMap, of, tap } from 'rxjs';

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

  // Use a refresh trigger to reload data
  private refreshSubject = new BehaviorSubject<void>(undefined);

  // Reactive data stream
  dashboardData$ = this.refreshSubject.pipe(
    switchMap(() => {
      const user = this.auth.currentUser();
      if (!user) return of(null);
      
      // 1. Get Customer Record
      return this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`).pipe(
        switchMap(customers => {
          if (customers.length === 0) return of([]);
          const policyIds = customers[0].policyIds || [];
          
          // 2. Get the actual policy details
          return this.policyService.getPoliciesByIds(policyIds);
        })
      );
    })
  );

  // Statistics stream calculated directly from dashboardData$
  stats$ = this.dashboardData$.pipe(
    map(policies => {
      if (!policies) return { totalCoverage: 0, policyCount: 0, totalPremium: 0 };
      return {
        totalCoverage: policies.reduce((acc, p) => acc + (p.coverage || 0), 0),
        policyCount: policies.length,
        totalPremium: policies.reduce((acc, p) => acc + (p.premium || 0), 0),
      };
    })
  );

  ngOnInit() {
    // Initial trigger
    this.refreshSubject.next();
  }
}