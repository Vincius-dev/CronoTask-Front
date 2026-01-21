import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">CronoTask</h1>
          <p class="text-gray-600">Faça login para continuar</p>
        </div>

        @if (loading) {
          <app-loading-spinner />
        } @else {
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            @if (error) {
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {{ error }}
              </div>
            }

            <div class="mb-2">
              <button
                type="button"
                (click)="toggleLoginMode()"
                class="text-sm text-primary hover:text-primary/80 transition">
                {{ loginMode === 'email' ? 'Entrar com ID' : 'Entrar com Email' }}
              </button>
            </div>

            @if (loginMode === 'email') {
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="seu@email.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Email válido é obrigatório</p>
                }
              </div>
            } @else {
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  ID do Usuário
                </label>
                <input
                  type="text"
                  formControlName="userId"
                  placeholder="Digite seu ID"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  [class.border-red-500]="loginForm.get('userId')?.invalid && loginForm.get('userId')?.touched">
                @if (loginForm.get('userId')?.invalid && loginForm.get('userId')?.touched) {
                  <p class="text-red-500 text-sm mt-1">ID é obrigatório</p>
                }
              </div>
            }

            <button
              type="submit"
              [disabled]="loginForm.invalid || submitting"
              class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {{ submitting ? 'Entrando...' : 'Entrar' }}
            </button>

            <div class="text-center mt-4">
              <p class="text-gray-600">
                Não tem uma conta?
                <a routerLink="/register" class="text-primary hover:text-primary/80 font-semibold ml-1">
                  Criar conta
                </a>
              </p>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loginMode: 'email' | 'id' = 'email';
  loading = false;
  submitting = false;
  error = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userId: ['']
    });
  }

  toggleLoginMode(): void {
    this.loginMode = this.loginMode === 'email' ? 'id' : 'email';
    this.error = '';
    this.loginForm.reset();

    if (this.loginMode === 'email') {
      this.loginForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.loginForm.get('userId')?.clearValidators();
    } else {
      this.loginForm.get('userId')?.setValidators([Validators.required]);
      this.loginForm.get('email')?.clearValidators();
    }

    this.loginForm.get('email')?.updateValueAndValidity();
    this.loginForm.get('userId')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const loginRequest$ = this.loginMode === 'email'
      ? this.authService.loginByEmail(this.loginForm.value.email)
      : this.authService.loginById(this.loginForm.value.userId);

    loginRequest$.subscribe({
      next: (user) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.submitting = false;
        this.error = error.error?.message || 'Usuário não encontrado. Verifique suas credenciais.';
      }
    });
  }
}
