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
    console.group('⏱️ TimerService - startTimer');
    console.log('taskId:', taskId);
    console.log('currentElapsedTime:', currentElapsedTime);
    console.log('Já ativo?', this.activeTimers.has(taskId));
    
    if (this.activeTimers.has(taskId)) {
      console.log('❌ Timer já está ativo, ignorando');
      console.groupEnd();
      return; // Timer já está ativo
    }

    const timerState: TimerState = {
      taskId,
      startTime: Date.now(),
      elapsedAtStart: currentElapsedTime
    };

    this.activeTimers.set(taskId, timerState);
    console.log('✅ Timer adicionado ao activeTimers');

    if (!this.timerSubjects.has(taskId)) {
      this.timerSubjects.set(taskId, new BehaviorSubject<number>(currentElapsedTime));
      console.log('✅ BehaviorSubject criado');
    }
    
    console.log('Active timers count:', this.activeTimers.size);
    console.groupEnd();
  }

  stopTimer(taskId: string): number | null {
    console.group('⏹️ TimerService - stopTimer');
    console.log('taskId:', taskId);
    
    const timerState = this.activeTimers.get(taskId);
    if (timerState) {
      const finalTime = this.calculateElapsedTime(timerState);
      console.log('Tempo final:', finalTime);
      
      // 💾 MOMENTO 1: Salvar tempo final no servidor AO PAUSAR
      console.log('💾 Salvando ao pausar...');
      this.taskService.updateTime(taskId, finalTime).subscribe({
        next: () => {
          console.log(`✅ Timer salvo ao pausar para tarefa ${taskId}: ${finalTime}s`);
        },
        error: (error) => {
          console.error('❌ Erro ao salvar timer ao pausar:', error);
        }
      });

      this.activeTimers.delete(taskId);
      console.log('✅ Timer removido do activeTimers');
      console.log('Active timers count:', this.activeTimers.size);
      console.groupEnd();
      
      return finalTime;
    } else {
      console.log('❌ Timer não estava ativo');
      console.groupEnd();
      return null;
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
    if (this.activeTimers.size > 0) {
      console.log('🔄 TimerService - Atualizando', this.activeTimers.size, 'timer(s) ativo(s)');
    }
    this.activeTimers.forEach((timerState, taskId) => {
      const elapsedTime = this.calculateElapsedTime(timerState);
      const subject = this.timerSubjects.get(taskId);
      if (subject) {
        console.log(`⏱️ Timer ${taskId}: ${elapsedTime}s`);
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
    if (this.activeTimers.size === 0) {
      return; // Não há timers ativos
    }
    
    console.group('💾 TimerService - Salvamento automático (a cada 10s)');
    console.log('Timers ativos:', this.activeTimers.size);
    
    this.activeTimers.forEach((timerState, taskId) => {
      const elapsedTime = this.calculateElapsedTime(timerState);
      console.log(`📤 Salvando task ${taskId}: ${elapsedTime}s`);
      
      this.taskService.updateTime(taskId, elapsedTime).subscribe({
        next: () => {
          console.log(`✅ Task ${taskId} salva com ${elapsedTime}s`);
        },
        error: (error) => {
          console.error(`❌ Erro ao salvar task ${taskId}:`, error);
        }
      });
    });
    
    console.groupEnd();
  }

  // Limpar todos os timers (útil ao destruir o serviço ou logout)
  clearAllTimers(): void {
    this.activeTimers.forEach((_, taskId) => {
      this.stopTimer(taskId);
    });
  }
}
