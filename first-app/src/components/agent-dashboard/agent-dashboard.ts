import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Add Router
import { Agentservice } from '../../services/agentservice';
import { BehaviorSubject, map } from 'rxjs';
import { Enquiryservice } from '../../services/enquiryservice';
import { AuthService } from '../../services/auth';
import { of,catchError } from 'rxjs';

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html',
})
export class AgentDashboard implements OnInit {
  private agentService = inject(Agentservice);
  private router = inject(Router);
  private enquiryService = inject(Enquiryservice);
  private authService = inject(AuthService);
  assignedLeads$ = new BehaviorSubject<any[]>([]);

  userId!: string;
  private rowsSubject = new BehaviorSubject<any[]>([]);
  customersAssigned$ = this.rowsSubject.asObservable();
  showProfileDropdown = false;
  agentProfile: any = null;
  agentDetails: any = null;

  ngOnInit() {
    // const user = JSON.parse(localStorage.getItem('user')!);
    const user = this.authService.currentUser(); 
    if (!user || user.role !== 'agent') {
      this.router.navigate(['/']); // Redirect if not an agent
      return;
    }

    // this.userId = user.id;
    this.userId = user.id.toString();
    this.loadAgentProfile(user);
    this.loadDashboardRows();
    
  } 
  

  loadAgentProfile(userData: any) {
    this.agentService.getAgentByUserId(this.userId).subscribe(agents => {
      
      if (agents.length) {
        this.agentProfile = { ...userData, ...agents[0] };
      }
    });
  }
  toggleDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
  
  logout() {
    // 3. Use service logout
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
  loadDashboardRows() {
  this.agentService.getAgentByUserId(this.userId).subscribe(agentData => {
    if (!agentData.length) return;
    const agentId = agentData[0].id;

    // Fetch Enquiries
    this.enquiryService.getEnquiriesByAgent(agentId).subscribe(leads => {
      this.assignedLeads$.next(leads);
    });

    // Fetch Claims
    this.agentService.getClaimsByAgent(agentId).subscribe(claims => {
      console.log("Claims received:", claims);
      const rows: any[] = [];
      
      // Clear the table first if no claims exist
      if (claims.length === 0) {
        this.rowsSubject.next([]);
        return;
      }

claims.forEach(claim => {
  this.agentService.getCustomerById(claim.customerId).subscribe({
    next: (customer) => {
      if (!customer) return;

      // Handle the potential 404 here
      this.agentService.getUserById(customer.userId).pipe(
        catchError(err => {
          console.error(`User ${customer.userId} missing!`, err);
          // Return a mock user so the row still displays something
          return of({ firstName: 'User', lastName: 'Not Found', email: 'N/A' });
        })
      ).subscribe(userData => {
        this.agentService.getPolicyById(claim.policyId).subscribe(policy => {
          const row = {
            customerName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
            address: customer.address || 'N/A',
            policyName: policy ? policy.name : 'Unknown Policy',
            claimId: claim.id,
            status: claim.status
          };
          rows.push(row);
          this.rowsSubject.next([...rows]);
        });
      });
    }
  });
});
    });
  });
}

  resolveLead(lead: any) {
  const resolution = prompt("Enter the resolution message for the customer:");
  
  if (resolution) {
    const subject = encodeURIComponent(`Resolution for your ${lead.type} Insurance Enquiry`);
    const body = encodeURIComponent(`Hello ${lead.fullName},\n\nRegarding your enquiry: "${lead.message}"\n\nResolution: ${resolution}\n\nBest regards,\nAgent Support`);
    
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
    this.enquiryService.resolveEnquiry(lead.id, resolution).subscribe(() => {
      alert('Lead marked as resolved.');
      this.loadDashboardRows(); 
    });
  }
}
  viewDetails(claimId: string) {
    this.router.navigate(['/agent/claim', claimId]);
  }
  get pendingCount$() {
    return this.customersAssigned$.pipe(
      map(rows => rows.filter(r => r.status === 'pending').length)
    );
  }

  get completedCount$() {
    return this.customersAssigned$.pipe(
      map(rows => rows.filter(r => r.status === 'approved').length)
    );
  }

  get totalCommission$() {
    return this.customersAssigned$.pipe(
      map(rows => {
        const approvedCount = rows.filter(r => r.status === 'approved').length;
        const rate = this.agentDetails?.commissionRate || 0;
        return approvedCount * rate;
      })
    );
  }
}