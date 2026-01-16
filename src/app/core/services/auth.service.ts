import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    console.log('🔐 AuthService initialized');
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  loginByEmail(email: string): Observable<User> {
    console.log('📤 AuthService.loginByEmail() - GET', `${this.baseUrl}/email/${email}`);
    
    return this.http.get<User>(`${this.baseUrl}/email/${email}`).pipe(
      tap(user => {
        console.log('✅ Login successful:', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  loginById(userId: string): Observable<User> {
    console.log('📤 AuthService.loginById() - GET', `${this.baseUrl}/${userId}`);
    
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(
      tap(user => {
        console.log('✅ Login successful:', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    console.log('🚪 Logout');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
