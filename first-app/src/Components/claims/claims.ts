import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/claim-service';
import { Claim } from '../../models/claim';
import { Policy } from '../../models/policy';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './claims.html',
  styleUrl: './claims.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Forces manual change detection
})
export class ClaimsComponent implements OnInit {
  policies: Policy[] = [];
  claimHistory: Claim[] = [];
  allClaims: Claim[] = [];
  userRole: string = 'customer'; // Change to 'admin' to see the review panel

  newClaim: Partial<Claim> = {
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  };

  constructor(
    private authService:AuthService,
    private router: Router,
    private claimService: ClaimService,
    private cdr: ChangeDetectorRef // For manual change detection
  ) {}

  ngOnInit() {
    this.claimService.getPolicies().subscribe({
      next: (data) => {
        this.policies = data;
        this.cdr.detectChanges(); // Force UI update after async data load
      }
    });
    this.loadHistory();
    this.loadAllClaims();
  }

  loadHistory() {
    this.claimService
      .getClaimsByCustomer('CUST-001')
      .subscribe(data => {
        this.claimHistory = data;
        this.cdr.detectChanges();
      });
  }

  loadAllClaims() {
    this.claimService
      .getAllClaims()
      .subscribe(data => {
        this.allClaims = data;
        this.cdr.detectChanges();
      });
  }

  onPolicySelect(policyId: string) {
    const selected = this.policies.find(p => p.id === policyId);
    if (selected) {
      this.newClaim.policyId = selected.id;
      this.newClaim.type = selected.type;
      this.cdr.detectChanges(); // Ensure type field updates immediately
    }
  }

  saveClaim() {
    if (!this.newClaim.policyId || !this.newClaim.amount) {
      alert('Please fill all required fields');
      return;
    }

    this.claimService.submitClaim(this.newClaim as Claim).subscribe({
      next: (response) => {
        console.log('Server saved:', response);
        alert('Claim filed successfully!');

        // Optimistically update UI immediately
        this.claimHistory.push(response);
        this.allClaims.push(response);
        this.cdr.detectChanges();

        // Reset form
        this.newClaim = {
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          policyId: '',
          type: '',
          amount: 0,
          description: ''
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Filing failed', err)
    });
  }

  updateStatus(id: string, status: string) {
    const remarks = prompt('Enter remarks for this decision:');

    if (remarks === null) {
      return;
    }

    this.claimService.updateClaimStatus(id, status, remarks).subscribe({
      next: (updated) => {
        // Update Admin list
        this.allClaims = this.allClaims.map(c =>
          c.id === id ? updated : c
        );

        // Update My Claim History list
        this.claimHistory = this.claimHistory.map(c =>
          c.id === id ? updated : c
        );
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Update failed', err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
