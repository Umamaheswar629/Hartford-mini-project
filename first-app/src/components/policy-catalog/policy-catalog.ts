import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';
import { Policy } from '../../models/policy';
import { PolicyService } from '../../services/policy-service';
import { CustomerNavbar } from '../customer-navbar/customer-navbar';

@Component({
  selector: 'app-policy-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerNavbar],
  templateUrl: './policy-catalog.html',
})
export class PolicyCatalog implements OnInit {
  private policyService = inject(PolicyService);
  private router = inject(Router);

  private allPolicies: Policy[] = [];
  private filteredSubject = new BehaviorSubject<Policy[]>([]);
  filteredPolicies$ = this.filteredSubject.asObservable();

  // Search & Filter State
  searchText = '';
  sortBy = 'default';
  selectedCategory = 'all'; // Default to all
  
  // Comparison State
  compareList: Policy[] = [];
  showCompareModal = false;

  ngOnInit() {
    this.policyService.policies$.subscribe(data => {
      this.allPolicies = data;
      this.applyFilters();
    });
    this.policyService.loadAll();
  }

  // Method to handle Tab clicks
  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allPolicies];

    // 1. Text Search
    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(text) || 
        p.type.toLowerCase().includes(text)
      );
    }

    // 2. Category Filter (Health, Life, Vehicle, Home)
    if (this.selectedCategory !== 'all') {
      result = result.filter(p => 
        p.type.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // 3. Sorting
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
      alert("Maximum 3 policies can be compared.");
    }
  }

  isInCompare(id: string): boolean {
    return this.compareList.some(p => p.id === id);
  }

  viewDetails(policyId: string) {
    this.router.navigate(['/customer/dashboard/details', policyId]);
  }
}