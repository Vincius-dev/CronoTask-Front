import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TimerDisplayComponent } from '../../../../shared/components/timer-display/timer-display.component';

@Component({
  selector: 'app-recent-tasks',
  standalone: true,
  imports: [TimerDisplayComponent],
  templateUrl: './recent-tasks.component.html'
})
export class RecentTasksComponent {
  @Input({ required: true }) tasks: Task[] = [];
  
  @Output() toggle = new EventEmitter<string>();
  @Output() view = new EventEmitter<string>();
  @Output() complete = new EventEmitter<string>();

  onToggle(taskId: string): void {
    console.log('🎬 RecentTasks - onToggle chamado, taskId:', taskId);
    this.toggle.emit(taskId);
    console.log('✅ RecentTasks - Evento toggle emitido');
  }

  onView(taskId: string): void {
    this.view.emit(taskId);
  }
  
  onComplete(taskId: string): void {
    console.log('✅ RecentTasks - onComplete chamado, taskId:', taskId);
    this.complete.emit(taskId);
    console.log('✅ RecentTasks - Evento complete emitido');
  }
}
