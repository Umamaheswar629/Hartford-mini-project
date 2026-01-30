import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Claim } from '../models/claim';
import { Policy } from '../models/policy';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private apiUrl = 'http://localhost:3000';

  // The "Single Source of Truth"
  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  claims$ = this.claimsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch from DB and update the stream
  refreshClaims(): void {
    this.http.get<Claim[]>(`${this.apiUrl}/claims`).subscribe(data => {
      this.claimsSubject.next(data);
    });
  }

  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/policies`);
  }

  submitClaim(claim: Claim): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/claims`, claim).pipe(
      tap(() => this.refreshClaims()) // Auto-refresh the list after a new claim
    );
  }

  updateClaimStatus(id: string, status: string, remarks: string): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/claims/${id}`, { status, remarks }).pipe(
      tap(() => this.refreshClaims()) // Auto-refresh after status update
    );
  }

  // Helper for filtering
  getClaimsByCustomer(customerId: string): Observable<Claim[]> {
     return this.http.get<Claim[]>(`${this.apiUrl}/claims?customerId=${customerId}`);
  }
  getCustomers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/customers`);
}
}