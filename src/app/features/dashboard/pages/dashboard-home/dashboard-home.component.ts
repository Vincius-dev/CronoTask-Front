import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { TimerService } from '../../../../core/services/timer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Task } from '../../../../core/models/task.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeFormatPipe } from '../../../../shared/pipes/time-format.pipe';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { RecentTasksComponent } from '../../components/recent-tasks/recent-tasks.component';

interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalTime: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    TimeFormatPipe,
    StatsCardComponent,
    RecentTasksComponent
  ],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  private taskService = inject(TaskService);
  private timerService = inject(TimerService);
  private authService = inject(AuthService);
  private router = inject(Router);

  stats: DashboardStats = {
    totalUsers: 0,
    totalTasks: 0,
    totalTime: 0
  };

  users: User[] = [];
  recentTasks: Task[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    const userId = this.authService.currentUserId;
    if (!userId) {
      this.error = 'Usuário não autenticado';
      this.loading = false;
      return;
    }

    // Carrega tarefas do usuário logado
    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        this.recentTasks = tasks.slice(0, 5); // Últimas 5 tarefas

        this.stats = {
          totalUsers: 0, // Não temos endpoint para isso
          totalTasks: tasks.length,
          totalTime: tasks.reduce((sum, task) => sum + task.elapsedTime, 0)
        };

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
        console.group('🔴 Erro no Dashboard');
        console.log('Error Message:', error.message);
        console.log('Full Error:', error);
        console.groupEnd();
      }
    });
  }

  onToggleTask(taskId: string): void {
    const task = this.recentTasks.find(t => t.id === taskId);
    if (!task) return;

    this.taskService.toggleRunning(taskId).subscribe({
      next: (updatedTask) => {
        const index = this.recentTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.recentTasks[index] = updatedTask;
          
          if (updatedTask.isRunning) {
            this.timerService.startTimer(taskId, updatedTask.elapsedTime);
          } else {
            this.timerService.stopTimer(taskId);
          }
          
          // Atualizar estatísticas
          this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
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

  onNewUser(): void {
    this.router.navigate(['/users/new']);
  }

  onNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }
}
