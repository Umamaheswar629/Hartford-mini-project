import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Agentservice } from '../../services/agentservice';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-agent-claim-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-claim-details.html',
  styleUrl: './agent-claim-details.css',
})
export class AgentClaimDetails implements OnInit {
  private agentService = inject(Agentservice);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService= inject(AuthService);
  private claimDetailSubject = new BehaviorSubject<any>(null);
  claimDetail$ = this.claimDetailSubject.asObservable();
  updatedStatus: string = '';
  remarks: string = '';

  ngOnInit() {
    const claimId = this.route.snapshot.paramMap.get('id');
    if (!claimId) return;

    this.loadClaimData(claimId);
  }

  loadClaimData(claimId: string) {
    this.agentService.getClaimById(claimId).subscribe((claim) => {
      this.updatedStatus = claim.status;
      this.remarks = claim.remarks || '';

      forkJoin({
        customer: this.agentService.getCustomerById(claim.customerId),
        policy: this.agentService.getPolicyById(claim.policyId)
      }).subscribe(({ customer, policy }) => {
        
        // Fetch User details for the customer's name
        this.agentService.getUserById(customer.userId).subscribe(user => {
          this.claimDetailSubject.next({
            claim,
            customer: { ...customer, firstName: user.firstName, lastName: user.lastName },
            policy
          });
        });
      });
    });
  }

  updateClaimStatus() {
    const currentData = this.claimDetailSubject.value;
    if (!currentData) return;

    this.agentService.updateClaimStatus(
      currentData.claim.id,
      this.updatedStatus,
      this.remarks
    ).subscribe(() => {
      alert('Claim status updated successfully');
      this.router.navigate(['/agent/dashboard']); 
      this.loadClaimData(currentData.claim.id);
    });
  }

  goBack() {
    this.router.navigate(['/agent/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}