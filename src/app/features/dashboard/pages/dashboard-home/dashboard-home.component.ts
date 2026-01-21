import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
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
import { Subscription } from 'rxjs';

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
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private timerService = inject(TimerService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats = {
    totalUsers: 0,
    totalTasks: 0,
    totalTime: 0
  };

  users: User[] = [];
  recentTasks: Task[] = [];
  loading = false;
  error = '';
  
  private timerSubscriptions = new Map<string, Subscription>();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  
  ngOnDestroy(): void {
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
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
    
    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        const sortedTasks = [...tasks].reverse();
        this.recentTasks = sortedTasks.slice(0, 5);

        this.stats = {
          totalUsers: 0,
          totalTasks: tasks.length,
          totalTime: tasks.reduce((sum, task) => sum + task.elapsedTime, 0)
        };
        
        this.subscribeToActiveTimers();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
      }
    });
  }

  onToggleTask(taskId: string): void {
    const task = this.recentTasks.find(t => t.id === taskId);
    
    if (!task) {
      return;
    }

    const newIsRunning = !task.isRunning;
    
    task.isRunning = newIsRunning;
    
    if (newIsRunning) {
      this.timerService.startTimer(taskId, task.elapsedTime);
    } else {
      const finalTime = this.timerService.stopTimer(taskId);
      
      if (finalTime !== null) {
        task.elapsedTime = finalTime;
        this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
      }
    }
    
    this.cdr.detectChanges();
    this.taskService.toggleRunning(taskId).subscribe({
      next: (updatedTask) => {
        const index = this.recentTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          const currentIsRunning = this.recentTasks[index].isRunning;
          this.recentTasks[index] = updatedTask;
          this.recentTasks[index].isRunning = currentIsRunning;
          
          this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
        }
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }
  
  private subscribeToActiveTimers(): void {
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
    
    this.recentTasks.forEach(task => {
      
      const subscription = this.timerService.getElapsedTime(task.id).subscribe({
        next: (elapsedTime) => {
          const taskIndex = this.recentTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            if (this.recentTasks[taskIndex].isRunning) {
              this.recentTasks[taskIndex].elapsedTime = elapsedTime;
              
              this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
              
              this.cdr.detectChanges();
            }
          }
        }
      });
      
      this.timerSubscriptions.set(task.id, subscription);
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
  
  onCompleteTask(taskId: string): void {
    const taskIndex = this.recentTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.recentTasks[taskIndex].completed = !this.recentTasks[taskIndex].completed;
      
      this.cdr.detectChanges();
    }
  }
}
