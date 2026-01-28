import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth';

/**
 * jwtInterceptor: Automatically attaches the JWT token from the 
 * AuthService signal to every outgoing HTTP request.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.authToken(); // Reading the signal

  // If we have a token in memory, clone the request and add the header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // If no token, just send the original request
  return next(req);
};