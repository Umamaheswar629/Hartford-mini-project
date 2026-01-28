import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-indigo-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold tracking-wider">INSURE<span class="text-indigo-300">SURE</span></span>
            </div>
            
            <div class="hidden md:flex space-x-4">
              <a routerLink="/customer/dashboard" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition">Overview</a>
              <a routerLink="/customer/my-policies" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition">My Portfolio</a>
              <a routerLink="/customer/enroll" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition">Explore Policies</a>
              <a routerLink="/customer/claims" routerLinkActive="bg-indigo-800" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition">Claims Center</a>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-right hidden sm:block">
              <p class="text-xs text-indigo-200">Welcome,</p>
              <!-- <p class="text-sm font-semibold">{{ authService.currentUser()?.firstName }}</p> -->
            </div>
            
            <button (click)="onLogout()" class="bg-indigo-800 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <span>Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </nav>
  `
})
export class CustomerNavbar {
  private router = inject(Router);

  onLogout() {
    this.router.navigate(['/auth']);
  }
}