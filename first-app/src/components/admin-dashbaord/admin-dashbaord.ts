import { Component,inject } from '@angular/core';
import { RouterOutlet ,Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../../services/auth';
import { ClaimService } from '../../services/claim-service';
import { Agentservice } from '../../services/agentservice';
@Component({
  selector: 'app-admin-dashbaord',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './admin-dashbaord.html',
  styleUrl: './admin-dashbaord.css',
})
export class AdminDashbaord {
  showStats = false;
  private router = inject(Router);
  private authService = inject(AuthService);
  private claimService=inject(ClaimService);
  private agentService=inject(Agentservice);
  agents:any=[];
  ngOnInit(){
    this.agentService.getAllAgents().subscribe((data)=>{
        this.agents=data;
      });
    this.claimService.refreshClaims(); // Ensure data is fetched immediately
    this.agentService.getAllAgents();
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}