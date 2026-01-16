import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
          <p class="text-gray-600">Cadastre-se para começar a usar o CronoTask</p>
        </div>

        @if (loading) {
          <app-loading-spinner />
        } @else {
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            @if (error) {
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {{ error }}
              </div>
            }

            @if (success) {
              <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                Cadastro realizado com sucesso! Redirecionando...
              </div>
            }

            <div class="mb-4">
              <label class="block text-gray-700 font-semibold mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="Seu nome completo"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                [class.border-red-500]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
              @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                <p class="text-red-500 text-sm mt-1">Nome é obrigatório (mínimo 3 caracteres)</p>
              }
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                formControlName="email"
                placeholder="seu@email.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="text-red-500 text-sm mt-1">Email válido é obrigatório</p>
              }
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-2">
                Senha *
              </label>
              <input
                type="password"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="text-red-500 text-sm mt-1">Senha é obrigatória (mínimo 6 caracteres)</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || submitting"
              class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-4">
              {{ submitting ? 'Cadastrando...' : 'Criar Conta' }}
            </button>

            <div class="text-center">
              <p class="text-gray-600">
                Já tem uma conta?
                <a routerLink="/login" class="text-primary hover:text-primary/80 font-semibold ml-1">
                  Fazer login
                </a>
              </p>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  success = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const userData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.userService.create(userData).subscribe({
      next: (user) => {
        console.log('✅ Usuário criado:', user);
        this.success = true;
        
        // Faz login automático após cadastro
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.authService['currentUserSubject'].next(user);
        
        // Redireciona para dashboard após 1 segundo
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.submitting = false;
        this.error = error.error?.message || 'Erro ao criar conta. Tente novamente.';
        console.error('❌ Erro ao criar usuário:', error);
      }
    });
  }
}
