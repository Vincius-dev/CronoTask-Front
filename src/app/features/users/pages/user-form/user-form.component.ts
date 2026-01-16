import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    this.initForm();

    if (this.isEditMode) {
      this.loadUser();
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]]
    });
  }

  private loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email
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
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.userForm.value;
    
    // Remove password se estiver vazio no modo de edição
    if (this.isEditMode && !formValue.password) {
      delete formValue.password;
    }

    const request$ = this.isEditMode
      ? this.userService.update(this.userId!, formValue)
      : this.userService.create(formValue);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.error = error.message;
        this.submitting = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }
}
