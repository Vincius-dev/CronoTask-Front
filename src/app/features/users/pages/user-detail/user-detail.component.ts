import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { TaskService } from '../../../../core/services/task.service';
import { User } from '../../../../core/models/user.model';
import { Task } from '../../../../core/models/task.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TimerDisplayComponent } from '../../../../shared/components/timer-display/timer-display.component';
import { TimeFormatPipe } from '../../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    TimerDisplayComponent,
    TimeFormatPipe
  ],
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {
  private userService = inject(UserService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  user: User | null = null;
  tasks: Task[] = [];
  loading = false;
  loadingTasks = false;
  error = '';

  get totalTime(): number {
    return this.tasks.reduce((sum, task) => sum + task.elapsedTime, 0);
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
      this.loadTasks(userId);
    }
  }

  loadUser(userId: string): void {
    this.loading = true;
    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadTasks(userId: string): void {
    this.loadingTasks = true;
    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loadingTasks = false;
      },
      error: (error) => {
        this.loadingTasks = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEdit(): void {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }

  onNewTask(): void {
    this.router.navigate(['/tasks/new'], { 
      queryParams: { userId: this.user?.id } 
    });
  }

  onViewTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }
}
