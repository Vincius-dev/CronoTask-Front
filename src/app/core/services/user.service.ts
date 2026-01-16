import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserCreate, UserUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getById(id: string): Observable<User> {
    console.log('📤 UserService.getById() - GET', `${this.apiUrl}/${id}`);
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByEmail(email: string): Observable<User> {
    console.log('📤 UserService.getByEmail() - GET', `${this.apiUrl}/email/${email}`);
    return this.http.get<User>(`${this.apiUrl}/email/${email}`).pipe(
      catchError(this.handleError)
    );
  }

  create(user: UserCreate): Observable<User> {
    console.log('📤 UserService.create() - POST', this.apiUrl, user);
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, user: UserUpdate): Observable<User> {
    console.log('📤 UserService.update() - PUT', `${this.apiUrl}/${id}`, user);
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  patch(id: string, data: Partial<User>): Observable<User> {
    console.log('📤 UserService.patch() - PATCH', `${this.apiUrl}/${id}`, data);
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    console.log('📤 UserService.delete() - DELETE', `${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    console.group('🔴 Erro no UserService');
    console.log('Status:', error.status);
    console.log('Status Text:', error.statusText);
    console.log('URL:', error.url);
    console.log('Error Object:', error.error);
    console.log('Full Error:', error);
    console.groupEnd();
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      const backendMessage = error.error?.message || error.error?.error || error.message;
      
      switch (error.status) {
        case 404:
          errorMessage = 'Usuário não encontrado';
          break;
        case 409:
          errorMessage = 'Email já está em uso';
          break;
        case 400:
          errorMessage = backendMessage || 'Dados inválidos';
          break;
        case 500:
          errorMessage = `Erro no servidor: ${backendMessage || 'Tente novamente mais tarde'}`;
          break;
        default:
          errorMessage = backendMessage || `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
