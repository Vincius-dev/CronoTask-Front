import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserCardComponent } from '../../components/user-card/user-card.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    FormsModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    UserCardComponent
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  showDeleteConfirm = false;
  userToDelete: User | null = null;

  ngOnInit(): void {
    // Não carrega automaticamente - usuário precisa buscar por email
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.users = [];
      this.filteredUsers = [];
      return;
    }

    if (this.searchTerm.includes('@')) {
      this.searchByEmail();
    }
  }

  private searchByEmail(): void {
    this.loading = true;
    this.error = '';

    this.userService.getByEmail(this.searchTerm.trim()).subscribe({
      next: (user) => {
        this.users = [user];
        this.filteredUsers = [user];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Usuário não encontrado';
        this.users = [];
        this.filteredUsers = [];
        this.loading = false;
      }
    });
  }

  onNewUser(): void {
    this.router.navigate(['/users/new']);
  }

  onViewUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  onEditUser(userId: string): void {
    this.router.navigate(['/users', userId, 'edit']);
  }

  onDeleteUser(userId: string): void {
    this.userToDelete = this.users.find(u => u.id === userId) || null;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.userService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.onSearchChange();
        this.showDeleteConfirm = false;
        this.userToDelete = null;
      },
      error: (error) => {
        this.error = error.message;
        this.showDeleteConfirm = false;
        this.userToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }
}
