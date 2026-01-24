import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim } from '../models/claim';
import { Policy } from '../models/policy';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // FIX: This solves the 'getPolicies' error
  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/policies`);
  }

  submitClaim(claim: Claim): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/claims`, claim);
  }

  getClaimsByCustomer(customerId: string): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/claims?customerId=${customerId}`);
  }

  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/claims`);
  }

  updateClaimStatus(id: string, status: string, remarks: string): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/claims/${id}`, { status, remarks });
  }
}