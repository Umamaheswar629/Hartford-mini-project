import { Component, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html',
  styleUrls: ['./agent-dashboard.css']
})
export class AgentDashboardComponent implements OnInit {
  currentUser = computed(() => this.authService.currentUser());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in and has agent role
    if (!this.authService.isLoggedIn() || this.authService.userRole() !== 'agent') {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}