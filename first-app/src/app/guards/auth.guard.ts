import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * roleGuard: Protects routes by checking if the user is logged in
 * and has the correct role stored in the AuthService signals.
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check the signals you created in Step 1
    if (authService.isLoggedIn() && allowedRoles.includes(authService.userRole())) {
      return true; // Access granted
    }

    // Access denied: Redirect to login page
    return router.parseUrl('/auth');
  };
};