import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/claim-service';
import { Claim } from '../../models/claim';
import { Policy } from '../../models/policy';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { CustomerNavbar } from "../customer-navbar/customer-navbar";
@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, FormsModule,CustomerNavbar],
  templateUrl: './claims.html',
  styleUrl: './claims.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class ClaimsComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private cdr = inject(ChangeDetectorRef);

  policies: Policy[] = [];
  claimHistory: Claim[] = [];
  currentCustomerId: string | null = null;
  
  private claimsSub?: Subscription;

  newClaim: Partial<Claim> = {
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    remarks: ''
  };

  ngOnInit() {
    this.initializeData();
  }

  initializeData() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    // 1. Fetch Policies
    this.claimService.getPolicies().subscribe(data => {
      this.policies = data;
      this.cdr.detectChanges();
    });

    // 2. Identify the Customer ID based on User ID
    this.claimService.getCustomers().subscribe(customers => {
      const profile = customers.find(c => c.userId === user.id);
      if (profile) {
        this.currentCustomerId = profile.id;
        this.loadUserHistory();
      }
      this.cdr.detectChanges();
    });

    // 3. Global Sync (Optional: logic if you want to see all claims)
    this.claimService.refreshClaims();
  }

  loadUserHistory() {
    if (!this.currentCustomerId) return;

    // Listen to global claims stream but filter for THIS user only
    this.claimsSub = this.claimService.claims$.pipe(
      map(claims => claims.filter(c => c.customerId === this.currentCustomerId))
    ).subscribe(data => {
      this.claimHistory = data;
      this.cdr.detectChanges();
    });
  }

  onPolicySelect(policyId: string) {
    const selected = this.policies.find(p => p.id === policyId);
    if (selected) {
      this.newClaim.policyId = selected.id;
      this.newClaim.type = selected.type;
      this.cdr.detectChanges();
    }
  }

  saveClaim() {
    if (!this.newClaim.policyId || !this.newClaim.amount || !this.currentCustomerId) {
      alert('Please select a policy and enter an amount.');
      return;
    }

    const finalClaim: Claim = {
      ...(this.newClaim as Claim),
      customerId: this.currentCustomerId,
      assignedAgentId: '', // Admin will assign this later
    
    };

    this.claimService.submitClaim(finalClaim).subscribe({
      next: () => {
        alert('Claim submitted successfully!');
        this.resetForm();
      },
      error: (err) => console.error('Submission failed', err)
    });
  }

  resetForm() {
    this.newClaim = {
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      remarks: ''
    };
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    this.claimsSub?.unsubscribe();
  }
}