import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/claim-service';
import { Claim } from '../../models/claim';
import { Policy } from '../../models/policy';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './claims.html',
  styleUrl: './claims.css'
})
export class ClaimsComponent implements OnInit {
  policies: Policy[] = [];
  claimHistory: Claim[] = [];
  
  // FIX: This solves the 'allClaims' error in claims.html
  allClaims: Claim[] = []; 
  
  userRole: string = 'customer'; // Change to 'admin' to see the review panel

  newClaim: Partial<Claim> = {
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  };

  constructor(private claimService: ClaimService) {}

  ngOnInit() {
    this.claimService.getPolicies().subscribe(data => this.policies = data);
    this.loadHistory();
    this.loadAllClaims();
  }

  loadHistory() {
    this.claimService.getClaimsByCustomer('CUST-001').subscribe(data => this.claimHistory = data);
  }

  loadAllClaims() {
    this.claimService.getAllClaims().subscribe(data => this.allClaims = data);
  }

  onPolicySelect(policyId: string) {
    const selected = this.policies.find(p => p.id === policyId);
    if (selected) {
      this.newClaim.policyId = selected.id;
      this.newClaim.type = selected.type; // Auto-fill requirement [cite: 76, 264]
    }
  }
  saveClaim() {
  if (!this.newClaim.policyId || !this.newClaim.amount) {
    alert("Please fill all required fields");
    return;
  }

  this.claimService.submitClaim(this.newClaim as Claim).subscribe({
    next: (response) => {
      console.log('Server saved:', response);
      alert('Claim filed successfully!');
      
      // Reset the object completely to clear the form
      this.newClaim = {
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        policyId: '',
        type: '',
        amount: 0,
        description: ''
      };

      // Force a slight delay to give JSON Server time to finish writing to the file
      setTimeout(() => {
        this.loadHistory(); 
        this.loadAllClaims();
      }, 100); 
    },
    error: (err) => console.error('Filing failed', err)
  });
}

updateStatus(id: string, status: string) {
  const remarks = prompt("Enter remarks for this decision:");
  
  if (remarks !== null) {
    this.claimService.updateClaimStatus(id, status, remarks).subscribe({
      next: () => {
        // Immediately refresh the Admin list
        this.loadAllClaims();
        
        // Use a timeout for the History list to ensure the file is unlocked
        setTimeout(() => {
          this.loadHistory();
        }, 200);
      },
      error: (err) => console.error('Update failed', err)
    });
  }
}
}