import { Component } from '@angular/core';
import { PolicyManagement } from '../policymanagement/policymanagement';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PolicyManagement, CommonModule], // Removed FormsModule because it's used in the child
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent {
  // Logic is handled inside <app-policy-management>
}