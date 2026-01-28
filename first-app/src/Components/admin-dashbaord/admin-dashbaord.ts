import { Component,inject } from '@angular/core';
import { RouterOutlet ,Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-admin-dashbaord',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './admin-dashbaord.html',
  styleUrl: './admin-dashbaord.css',
})
export class AdminDashbaord {
  private router = inject(Router);
  private authService = inject(AuthService);

  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
