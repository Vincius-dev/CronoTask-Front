import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TaskFilters {
  status: 'all' | 'running' | 'paused';
  completionStatus: 'all' | 'completed' | 'incomplete';
  userId: string;
  sortBy: 'recent' | 'oldest' | 'time';
}

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-filters.component.html'
})
export class TaskFiltersComponent {
  filters: TaskFilters = {
    status: 'all',
    completionStatus: 'all',
    userId: '',
    sortBy: 'recent'
  };

  @Output() filtersChange = new EventEmitter<TaskFilters>();

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
