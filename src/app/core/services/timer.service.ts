import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { TaskService } from './task.service';

interface TimerState {
  taskId: string;
  startTime: number;
  elapsedAtStart: number;
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private taskService = inject(TaskService);
  private activeTimers = new Map<string, TimerState>();
  private timerSubjects = new Map<string, BehaviorSubject<number>>();
  private updateInterval = 1000; // Atualiza a cada 1 segundo
  private saveInterval = 10000; // Salva no servidor a cada 10 segundos

  constructor() {
    // Atualizar todos os timers ativos a cada segundo
    interval(this.updateInterval).subscribe(() => {
      this.updateActiveTimers();
    });

    // Salvar no servidor a cada 10 segundos
    interval(this.saveInterval).subscribe(() => {
      this.saveTimersToServer();
    });
  }

  startTimer(taskId: string, currentElapsedTime: number = 0): void {
    if (this.activeTimers.has(taskId)) {
      return; // Timer já está ativo
    }

    const timerState: TimerState = {
      taskId,
      startTime: Date.now(),
      elapsedAtStart: currentElapsedTime
    };

    this.activeTimers.set(taskId, timerState);

    if (!this.timerSubjects.has(taskId)) {
      this.timerSubjects.set(taskId, new BehaviorSubject<number>(currentElapsedTime));
    }
  }

  stopTimer(taskId: string): void {
    const timerState = this.activeTimers.get(taskId);
    if (timerState) {
      const finalTime = this.calculateElapsedTime(timerState);
      
      // Salvar tempo final no servidor
      this.taskService.updateTime(taskId, finalTime).subscribe({
        next: () => {
          console.log(`Timer salvo para tarefa ${taskId}: ${finalTime}s`);
        },
        error: (error) => {
          console.error('Erro ao salvar timer:', error);
        }
      });

      this.activeTimers.delete(taskId);
    }
  }

  getElapsedTime(taskId: string): Observable<number> {
    if (!this.timerSubjects.has(taskId)) {
      this.timerSubjects.set(taskId, new BehaviorSubject<number>(0));
    }
    return this.timerSubjects.get(taskId)!.asObservable();
  }

  isTimerActive(taskId: string): boolean {
    return this.activeTimers.has(taskId);
  }

  private updateActiveTimers(): void {
    this.activeTimers.forEach((timerState, taskId) => {
      const elapsedTime = this.calculateElapsedTime(timerState);
      const subject = this.timerSubjects.get(taskId);
      if (subject) {
        subject.next(elapsedTime);
      }
    });
  }

  private calculateElapsedTime(timerState: TimerState): number {
    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - timerState.startTime) / 1000);
    return timerState.elapsedAtStart + elapsedSinceStart;
  }

  private saveTimersToServer(): void {
    this.activeTimers.forEach((timerState, taskId) => {
      const elapsedTime = this.calculateElapsedTime(timerState);
      
      this.taskService.updateTime(taskId, elapsedTime).subscribe({
        next: () => {
          console.log(`Timer atualizado para tarefa ${taskId}: ${elapsedTime}s`);
        },
        error: (error) => {
          console.error('Erro ao atualizar timer:', error);
        }
      });
    });
  }

  // Limpar todos os timers (útil ao destruir o serviço ou logout)
  clearAllTimers(): void {
    this.activeTimers.forEach((_, taskId) => {
      this.stopTimer(taskId);
    });
  }
}
