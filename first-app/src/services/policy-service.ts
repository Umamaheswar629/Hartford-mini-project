import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap,map } from 'rxjs';
import { Policy } from '../models/policy';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = 'http://localhost:3000/policies';
  
  // BehaviorSubject initialized with an empty array
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  
  // Expose the subject as an Observable for components to consume
  policies$ = this.policiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch from DB and push to the BehaviorSubject
  loadAll() {
    this.http.get<Policy[]>(this.apiUrl).subscribe(data => {
      this.policiesSubject.next(data);
    });
  }

  addPolicy(policy: Policy) {
    return this.http.post<Policy>(this.apiUrl, policy).pipe(
      tap(() => this.loadAll()) // Automatically triggers a refresh for all subscribers
    );
  }

  updatePolicy(policy: Policy) {
    return this.http.put<Policy>(`${this.apiUrl}/${policy.id}`, policy).pipe(
      tap(() => this.loadAll())
    );
  }

  deletePolicy(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
  getPoliciesByIds(ids: string[]) {
  return this.policies$.pipe(
    map(policies => policies.filter(p => ids.includes(p.id)))
  );
}
}