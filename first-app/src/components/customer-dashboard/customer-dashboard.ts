import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy-service';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';
import { BehaviorSubject, map, switchMap, of, Observable, combineLatest } from 'rxjs';

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

  private refreshSubject = new BehaviorSubject<void>(undefined);

  // Original functionality: Unified Stream for policy data
  dashboardData$: Observable<any[]> = this.refreshSubject.pipe(
    switchMap(() => {
      const user = this.auth.currentUser();
      if (!user) return of([]);

      return this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`).pipe(
        switchMap(customers => {
          if (!customers || customers.length === 0) return of([]);
          const policyIds = customers[0].policyIds || [];
          if (policyIds.length === 0) return of([]);

          return this.http.get<any[]>(`http://localhost:3000/policies`).pipe(
            map(allPolicies => allPolicies.filter(p => policyIds.includes(p.id)))
          );
        })
      );
    })
  );

  // Original functionality: Statistics for top cards
  stats$ = this.dashboardData$.pipe(
    map(policies => ({
      totalCoverage: policies.reduce((acc, p) => acc + (Number(p.coverage) || 0), 0),
      policyCount: policies.length,
      totalPremium: policies.reduce((acc, p) => acc + (Number(p.premium) || 0), 0),
    }))
  );

  // Original functionality: Payment History stream
  paymentHistory$: Observable<any[]> = this.refreshSubject.pipe(
    switchMap(() => {
      const user = this.auth.currentUser();
      return this.http.get<any[]>(`http://localhost:3000/payments?userId=${user?.id}`).pipe(
        map(payments => payments.reverse()) 
      );
    })
  );

  // Smart Renewal Schedule: Filters out policies already paid this month
  renewalSchedule$ = combineLatest([
    this.dashboardData$,
    this.paymentHistory$
  ]).pipe(
    map(([policies, payments]) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      return policies.filter(policy => {
        const alreadyPaid = payments.some(payment => {
          const paymentDate = new Date(payment.date);
          return payment.policyId === policy.id && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear &&
                 payment.status === 'Success';
        });
        return !alreadyPaid;
      }).map(p => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1); 
        return { ...p, dueDate: dueDate.toISOString().split('T')[0] };
      });
    })
  );

  ngOnInit() {
    this.refreshSubject.next();
  }

  // Original functionality: Premium payment processing
  payPremium(policy: any) {
    const user = this.auth.currentUser();
    if (!confirm(`Proceed to pay ₹${policy.premium} for ${policy.name}?`)) return;

    const paymentRecord = {
      userId: user?.id,
      policyId: policy.id,
      policyName: policy.name,
      amount: policy.premium,
      date: new Date().toISOString().split('T')[0],
      status: 'Success',
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    this.http.post('http://localhost:3000/payments', paymentRecord).subscribe({
      next: () => {
        alert('Payment Successful! The policy is now marked as paid for this month.');
        this.refreshSubject.next(); 
      },
      error: () => alert('Payment Failed. Ensure you have a /payments array in your db.json.')
    });
  }
}