import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { TimerDisplayComponent } from '../../../../shared/components/timer-display/timer-display.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [TimerDisplayComponent],
  templateUrl: './task-card.component.html'
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() user?: User;
  
  @Output() toggle = new EventEmitter<string>();
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onToggle(): void {
    this.toggle.emit(this.task.id);
  }

  onView(): void {
    this.view.emit(this.task.id);
  }

  onEdit(): void {
    this.edit.emit(this.task.id);
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }
}
