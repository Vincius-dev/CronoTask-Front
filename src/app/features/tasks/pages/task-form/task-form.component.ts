import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  taskForm!: FormGroup;
  users: User[] = [];
  isEditMode = false;
  taskId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    // Usa o ID do usuário logado automaticamente
    const currentUserId = this.authService.currentUserId;

    this.initForm(currentUserId);
    this.loadUsers();

    if (this.isEditMode) {
      this.loadTask();
    }
  }

  private initForm(preselectedUserId: string | null = null): void {
    this.taskForm = this.fb.group({
      userId: [{ value: preselectedUserId || '', disabled: true }, Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  private loadUsers(): void {
    // Não carrega lista de usuários - aceita ID diretamente
    this.users = [];
  }

  private loadTask(): void {
    if (!this.taskId) return;

    this.loading = true;
    this.taskService.getById(this.taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          userId: task.userId,
          name: task.name,
          description: task.description
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    // Pega o valor do userId mesmo estando desabilitado
    const formValue = {
      ...this.taskForm.value,
      userId: this.taskForm.get('userId')?.value
    };

    const request$ = this.isEditMode
      ? this.taskService.update(this.taskId!, formValue)
      : this.taskService.create(formValue);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.error = error.message;
        this.submitting = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }
}
