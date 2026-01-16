import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TimerService } from '../../../../core/services/timer.service';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskFiltersComponent } from '../../components/task-filters/task-filters.component';

interface TaskFilters {
  status: 'all' | 'running' | 'paused';
  userId: string;
  sortBy: 'recent' | 'oldest' | 'time';
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    TaskCardComponent,
    TaskFiltersComponent
  ],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private timerService = inject(TimerService);
  private router = inject(Router);

  tasks: Task[] = [];
  users: User[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  error = '';
  showDeleteConfirm = false;
  taskToDelete: Task | null = null;

  private filters: TaskFilters = {
    status: 'all',
    userId: '',
    sortBy: 'recent'
  };

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (!userId) {
      this.error = 'Usuário não autenticado';
      return;
    }

    this.loadTasksByUser(userId);
  }

  loadTasksByUser(userId: string): void {
    this.loading = true;
    this.error = '';

    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onFiltersChange(filters: TaskFilters): void {
    this.filters = filters;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.tasks];

    // Filtrar por status
    if (this.filters.status === 'running') {
      filtered = filtered.filter(t => t.isRunning);
    } else if (this.filters.status === 'paused') {
      filtered = filtered.filter(t => !t.isRunning);
    }

    // Ordenar
    switch (this.filters.sortBy) {
      case 'time':
        filtered.sort((a, b) => b.elapsedTime - a.elapsedTime);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.name.localeCompare(b.name)); // Simplificado
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.name.localeCompare(a.name)); // Simplificado
        break;
    }

    this.filteredTasks = filtered;
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(u => u.id === userId);
  }

  onNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  onToggleTask(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.taskService.toggleRunning(taskId).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          
          if (updatedTask.isRunning) {
            this.timerService.startTimer(taskId, updatedTask.elapsedTime);
          } else {
            this.timerService.stopTimer(taskId);
          }
          
          this.applyFilters();
        }
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  onViewTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  onEditTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  onDeleteTask(taskId: string): void {
    this.taskToDelete = this.tasks.find(t => t.id === taskId) || null;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.taskToDelete) return;

    this.taskService.delete(this.taskToDelete.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete!.id);
        this.applyFilters();
        this.showDeleteConfirm = false;
        this.taskToDelete = null;
      },
      error: (error) => {
        this.error = error.message;
        this.showDeleteConfirm = false;
        this.taskToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.taskToDelete = null;
  }
}
