import { Component,inject } from '@angular/core';
import { RouterOutlet ,Router, RouterLink, RouterLinkActive} from '@angular/router';
@Component({
  selector: 'app-admin-dashbaord',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './admin-dashbaord.html',
  styleUrl: './admin-dashbaord.css',
})
export class AdminDashbaord {
  private router = inject(Router);

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
