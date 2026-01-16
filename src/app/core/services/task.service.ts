import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Task, TaskCreate, TaskUpdate } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getById(id: string): Observable<Task> {
    console.log('📤 TaskService.getById() - GET', `${this.apiUrl}/${id}`);
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByUserId(userId: string): Observable<Task[]> {
    console.log('📤 TaskService.getByUserId() - GET', `${this.apiUrl}/user/${userId}`);
    return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(task: TaskCreate): Observable<Task> {
    console.log('📤 TaskService.create() - POST', this.apiUrl, task);
    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, task: TaskUpdate): Observable<Task> {
    console.log('📤 TaskService.update() - PUT', `${this.apiUrl}/${id}`, task);
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      catchError(this.handleError)
    );
  }

  patch(id: string, data: Partial<Task>): Observable<Task> {
    console.log('📤 TaskService.patch() - PATCH', `${this.apiUrl}/${id}`, data);
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  toggleRunning(id: string): Observable<Task> {
    console.log('📤 TaskService.toggleRunning() - PATCH', `${this.apiUrl}/${id}`);
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { toggle: true }).pipe(
      catchError(this.handleError)
    );
  }

  updateTime(id: string, time: number): Observable<Task> {
    console.log('📤 TaskService.updateTime() - PATCH', `${this.apiUrl}/${id}`, { elapsedTime: time });
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { elapsedTime: time }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    console.log('📤 TaskService.delete() - DELETE', `${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    console.group('🔴 Erro no TaskService');
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
          errorMessage = 'Tarefa não encontrada';
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
