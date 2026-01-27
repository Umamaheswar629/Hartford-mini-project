import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../../models/policy';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './customer-dashboard.html'
})
export class CustomerDashboardComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private policyService = inject(PolicyService);

  // BehaviorSubjects for reactive data handling
  private allPolicies: Policy[] = [];
  private filteredSubject = new BehaviorSubject<Policy[]>([]);
  private registeredSubject = new BehaviorSubject<Policy[]>([]);

  // Public Observables for the template
  filteredPolicies$ = this.filteredSubject.asObservable();
  registeredPolicies$ = this.registeredSubject.asObservable();

  searchText = '';

  ngOnInit() {
    // 1. Sync Catalog from PolicyService
    this.policyService.policies$.subscribe(data => {
      this.allPolicies = data;
      this.searchPolicy(); 
    });
    this.policyService.loadAll();

    // 2. Load Registered Policies
    this.loadRegisteredPolicies();
  }

  loadRegisteredPolicies() {
    const user = this.auth.getUser();
    if (!user) return;

    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .subscribe(customers => {
        if (customers.length > 0) {
          const policyIds = customers[0].policyIds || [];
          this.policyService.getPoliciesByIds(policyIds).subscribe(data => {
            // Push data into the registered stream
            this.registeredSubject.next(data);
          });
        }
      });
  }

  searchPolicy() {
    const text = this.searchText.toLowerCase();
    const result = this.allPolicies.filter(p =>
      p.name.toLowerCase().includes(text) || p.type.toLowerCase().includes(text)
    );
    // Push filtered results into the stream
    this.filteredSubject.next(result);
  }

  viewDetails(policyId: string) {
    this.router.navigate(['/policydetails', policyId]);
  }
}