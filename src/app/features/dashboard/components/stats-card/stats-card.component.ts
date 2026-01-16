import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input() icon: 'users' | 'tasks' | 'clock' = 'users';
  @Input() color: 'blue' | 'purple' | 'green' = 'blue';

  get cardColorClass(): string {
    switch (this.color) {
      case 'blue':
        return 'border-l-4 border-blue-500';
      case 'purple':
        return 'border-l-4 border-purple-500';
      case 'green':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  }

  get iconColorClass(): string {
    switch (this.color) {
      case 'blue':
        return 'text-blue-500';
      case 'purple':
        return 'text-purple-500';
      case 'green':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
}
