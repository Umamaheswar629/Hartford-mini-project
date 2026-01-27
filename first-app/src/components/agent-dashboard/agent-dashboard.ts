import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Add Router
import { Agentservice } from '../../services/agentservice';
import { BehaviorSubject, map } from 'rxjs';
import { Enquiryservice } from '../../services/enquiryservice';
@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html',
})
export class AgentDashboard implements OnInit {
  private agentService = inject(Agentservice);
  private router = inject(Router);
  private enquiryService = inject(Enquiryservice);
  assignedLeads$ = new BehaviorSubject<any[]>([]);

  userId!: number;
  private rowsSubject = new BehaviorSubject<any[]>([]);
  customersAssigned$ = this.rowsSubject.asObservable();
  showProfileDropdown = false;
  agentProfile: any = null;
  agentDetails: any = null;

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (!user || user.role !== 'agent') return;

    this.userId = user.id;
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
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  loadDashboardRows() {
    this.agentService.getAgentByUserId(this.userId).subscribe(agentData => {
      if (!agentData.length) return;
      const agentId = agentData[0].id;
      this.agentDetails = agentData[0];
      this.enquiryService.getEnquiriesByAgent(agentId).subscribe(leads => {
        this.assignedLeads$.next(leads);
      });
      this.agentService.getClaimsByAgent(agentId).subscribe(claims => {
        const rows: any[] = [];
        
        claims.forEach(claim => {
          // Fetch Customer , then fetch User to get Name
          this.agentService.getCustomerById(claim.customerId).subscribe(customer => {
            // Fetch user data for the customer's name
            this.agentService.getUserById(customer.userId).subscribe(userData => {
              this.agentService.getPolicyById(claim.policyId).subscribe(policy => {
                const row = {
                  customerName: `${userData.firstName} ${userData.lastName}`,
                  address: customer.address,
                  policyName: policy.name,
                  claimId: claim.id,
                  status: claim.status
                };
                rows.push(row);
                this.rowsSubject.next([...rows]);
              });
            });
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