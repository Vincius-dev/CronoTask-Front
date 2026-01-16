import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  templateUrl: './user-card.component.html'
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
  
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onView(): void {
    this.view.emit(this.user.id);
  }

  onEdit(): void {
    this.edit.emit(this.user.id);
  }

  onDelete(): void {
    this.delete.emit(this.user.id);
  }
}
