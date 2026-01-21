import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TaskService } from '../../../../core/services/task.service';
import { UserService } from '../../../../core/services/user.service';
import { TimerService } from '../../../../core/services/timer.service';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeFormatPipe } from '../../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-task-timer',
  standalone: true,
  imports: [LoadingSpinnerComponent, TimeFormatPipe],
  templateUrl: './task-timer.component.html'
})
export class TaskTimerComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private timerService = inject(TimerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  task: Task | null = null;
  user: User | null = null;
  currentTime = 0;
  loading = false;
  toggling = false;
  error = '';

  private timerSubscription?: Subscription;

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  loadTask(taskId: string): void {
    this.loading = true;
    
    this.taskService.getById(taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.currentTime = task.elapsedTime;
        
        if (task.isRunning) {
          this.timerService.startTimer(task.id, task.elapsedTime);
        }

        this.subscribeToTimer(task.id);
        this.loadUser(task.userId);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadUser(userId: string): void {
    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.user = user;
      }
    });
  }

  subscribeToTimer(taskId: string): void {
    this.timerSubscription = this.timerService.getElapsedTime(taskId).subscribe({
      next: (time) => {
        this.currentTime = time;
      }
    });
  }

  onToggle(): void {
    if (!this.task) return;

    this.toggling = true;
    this.taskService.toggleRunning(this.task.id).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        
        if (updatedTask.isRunning) {
          this.timerService.startTimer(updatedTask.id, updatedTask.elapsedTime);
        } else {
          this.timerService.stopTimer(updatedTask.id);
        }
        
        this.toggling = false;
      },
      error: (error) => {
        this.error = error.message;
        this.toggling = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }

  onEdit(): void {
    if (this.task) {
      this.router.navigate(['/tasks', this.task.id, 'edit']);
    }
  }
}
