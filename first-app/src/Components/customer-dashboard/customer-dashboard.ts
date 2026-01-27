import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../../models/policy';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PolicyService } from '../../services/policy';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

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

  private allPolicies: Policy[] = [];
  private filteredSubject = new BehaviorSubject<Policy[]>([]);
  private registeredSubject = new BehaviorSubject<Policy[]>([]);

  filteredPolicies$ = this.filteredSubject.asObservable();
  registeredPolicies$ = this.registeredSubject.asObservable();

  // --- NEW STATE PROPERTIES ---
  searchText = '';
  sortBy = 'default';
  selectedCategory = 'all';
  compareList: Policy[] = [];
  showCompareModal = false;

  // Hero Stats calculated from registeredPolicies$
  stats$ = this.registeredPolicies$.pipe(
    map(policies => ({
      totalCoverage: policies.reduce((acc, p) => acc + (p.coverage || 0), 0),
      policyCount: policies.length,
      nextDue: 'Feb 15, 2026' // Mock date for UI
    }))
  );

  ngOnInit() {
    this.policyService.policies$.subscribe(data => {
      this.allPolicies = data;
      this.applyFilters(); 
    });
    this.policyService.loadAll();
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
            this.registeredSubject.next(data);
          });
        }
      });
  }

  // --- NEW FEATURE METHODS ---
  applyFilters() {
    let result = [...this.allPolicies];

    // Search
    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(text) || p.type.toLowerCase().includes(text));
    }

    // Category Filter
    if (this.selectedCategory !== 'all') {
      result = result.filter(p => p.type.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // Sorting
    if (this.sortBy === 'low') result.sort((a, b) => a.premium - b.premium);
    if (this.sortBy === 'high') result.sort((a, b) => b.premium - a.premium);

    this.filteredSubject.next(result);
  }

  toggleCompare(policy: Policy) {
    const index = this.compareList.findIndex(p => p.id === policy.id);
    if (index > -1) {
      this.compareList.splice(index, 1);
    } else if (this.compareList.length < 3) {
      this.compareList.push(policy);
    } else {
      alert("You can compare up to 3 policies at a time.");
    }
  }

  isInCompare(id: string): boolean {
    return this.compareList.some(p => p.id === id);
  }

  viewDetails(policyId: string) {
    this.router.navigate(['/policydetails', policyId]);
  }
}