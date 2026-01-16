import { Component, Input } from '@angular/core';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  imports: [TimeFormatPipe],
  templateUrl: './timer-display.component.html'
})
export class TimerDisplayComponent {
  @Input() elapsedTime = 0;
  @Input() isRunning = false;
  @Input() showStatus = true;
}
