import { Component, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { TimerService } from '../../../../core/services/timer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Task } from '../../../../core/models/task.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeFormatPipe } from '../../../../shared/pipes/time-format.pipe';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { RecentTasksComponent } from '../../components/recent-tasks/recent-tasks.component';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalTime: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    TimeFormatPipe,
    StatsCardComponent,
    RecentTasksComponent
  ],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit, AfterViewChecked, OnDestroy {
  private taskService = inject(TaskService);
  private timerService = inject(TimerService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats = {
    totalUsers: 0,
    totalTasks: 0,
    totalTime: 0
  };

  users: User[] = [];
  recentTasks: Task[] = [];
  loading = false;
  error = '';
  
  private timerSubscriptions = new Map<string, Subscription>();

  ngOnInit(): void {
    console.log('🚀 Dashboard - ngOnInit chamado, loading inicial:', this.loading);
    this.loadDashboardData();
  }

  ngAfterViewChecked(): void {
    console.log('👁️ Dashboard - View checked, loading atual:', this.loading);
  }
  
  ngOnDestroy(): void {
    console.log('🧹 Dashboard - ngOnDestroy, cancelando subscriptions');
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    const userId = this.authService.currentUserId;
    console.log('🔍 Dashboard - userId:', userId);
    
    if (!userId) {
      this.error = 'Usuário não autenticado';
      this.loading = false;
      return;
    }

    console.log('📡 Dashboard - Iniciando requisição para buscar tarefas...');
    
    // Carrega tarefas do usuário logado
    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        console.group('✅ Dashboard - Resposta recebida');
        console.log('Tipo de dados:', typeof tasks);
        console.log('É array?:', Array.isArray(tasks));
        console.log('Quantidade de tarefas:', Array.isArray(tasks) ? tasks.length : 'N/A');
        console.log('Dados completos:', tasks);
        console.log('JSON stringified:', JSON.stringify(tasks, null, 2));
        console.groupEnd();

        // Pegar as últimas 5 tarefas (invertendo a ordem para mostrar as mais recentes primeiro)
        const sortedTasks = [...tasks].reverse();
        this.recentTasks = sortedTasks.slice(0, 5);
        console.log('📋 Dashboard - Mostrando', this.recentTasks.length, 'tarefas mais recentes');

        this.stats = {
          totalUsers: 0, // Não temos endpoint para isso
          totalTasks: tasks.length,
          totalTime: tasks.reduce((sum, task) => sum + task.elapsedTime, 0)
        };
        
        // Inscrever em timers ativos
        this.subscribeToActiveTimers();

        this.loading = false;
        console.log('✅ Dashboard - Loading concluído, loading=false');
        this.cdr.detectChanges();
        console.log('🔄 Dashboard - detectChanges() chamado manualmente');
      },
      error: (error) => {
        console.group('🔴 Dashboard - Erro na requisição');
        console.log('Error Type:', typeof error);
        console.log('Error Status:', error.status);
        console.log('Error StatusText:', error.statusText);
        console.log('Error Message:', error.message);
        console.log('Error URL:', error.url);
        console.log('Error Error Object:', error.error);
        console.log('Full Error Object:', error);
        console.log('JSON stringified:', JSON.stringify(error, null, 2));
        console.groupEnd();
        
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
        console.log('🔴 Dashboard - Loading set to false após erro');
      },
      complete: () => {
        console.log('🏁 Dashboard - Observable completed');
      }
    });
  }

  onToggleTask(taskId: string): void {
    console.log('🎬 Dashboard - onToggleTask chamado, taskId:', taskId);
    
    const task = this.recentTasks.find(t => t.id === taskId);
    console.log('🔍 Dashboard - Task encontrada:', task);
    
    if (!task) {
      console.log('❌ Dashboard - Task não encontrada!');
      return;
    }

    // FAZER O TOGGLE LOCALMENTE PRIMEIRO (para o front funcionar independente do back)
    const newIsRunning = !task.isRunning;
    console.log('🔄 Dashboard - Mudando isRunning de', task.isRunning, 'para', newIsRunning);
    
    // Atualizar localmente
    task.isRunning = newIsRunning;
    
    if (newIsRunning) {
      this.timerService.startTimer(taskId, task.elapsedTime);
      console.log('▶️ Dashboard - Timer iniciado localmente');
    } else {
      const finalTime = this.timerService.stopTimer(taskId);
      console.log('⏸️ Dashboard - Timer parado localmente, tempo final:', finalTime);
      
      // Atualizar o elapsedTime com o valor final
      if (finalTime !== null) {
        task.elapsedTime = finalTime;
        this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
      }
    }
    
    // Forçar atualização do template
    this.cdr.detectChanges();
    console.log('🔄 Dashboard - detectChanges() chamado');

    // Enviar para o backend (mas não dependemos da resposta para o estado do timer)
    console.log('📤 Dashboard - Enviando requisição toggleRunning para o backend...');
    this.taskService.toggleRunning(taskId).subscribe({
      next: (updatedTask) => {
        console.group('✅ Dashboard - toggleRunning resposta do backend');
        console.log('Updated task:', updatedTask);
        console.log('JSON:', JSON.stringify(updatedTask, null, 2));
        console.groupEnd();
        
        // Atualizar APENAS o elapsedTime, NÃO o isRunning (mantemos o estado local)
        const index = this.recentTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          const currentIsRunning = this.recentTasks[index].isRunning; // Guardar estado local
          this.recentTasks[index] = updatedTask;
          this.recentTasks[index].isRunning = currentIsRunning; // Restaurar estado local
          
          this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
          console.log('📊 Dashboard - Estatísticas atualizadas, isRunning mantido como:', currentIsRunning);
        }
      },
      error: (error) => {
        console.group('🔴 Dashboard - Erro no toggleRunning');
        console.log('Error:', error);
        console.log('Status:', error.status);
        console.log('Message:', error.message);
        console.groupEnd();
        this.error = error.message;
      }
    });
  }
  
  private subscribeToActiveTimers(): void {
    console.log('🔔 Dashboard - Inscrevendo em timers ativos');
    
    // Limpar subscriptions anteriores
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
    
    // Inscrever em cada tarefa
    this.recentTasks.forEach(task => {
      console.log(`📡 Dashboard - Inscrevendo no timer da task ${task.id}, isRunning:`, task.isRunning);
      
      const subscription = this.timerService.getElapsedTime(task.id).subscribe({
        next: (elapsedTime) => {
          const taskIndex = this.recentTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            // SÓ atualizar se o timer estiver ativo (isRunning = true)
            if (this.recentTasks[taskIndex].isRunning) {
              console.log(`⏱️ Dashboard - Atualizando task ${task.id} de ${this.recentTasks[taskIndex].elapsedTime}s para ${elapsedTime}s`);
              this.recentTasks[taskIndex].elapsedTime = elapsedTime;
              
              // Atualizar estatísticas
              this.stats.totalTime = this.recentTasks.reduce((sum, t) => sum + t.elapsedTime, 0);
              
              // FORÇAR DETECÇÃO DE MUDANÇAS
              this.cdr.detectChanges();
            } else {
              // Timer não está rodando, ignorar a atualização
              console.log(`⏸️ Dashboard - Task ${task.id} não está rodando, ignorando atualização de timer`);
            }
          }
        }
      });
      
      this.timerSubscriptions.set(task.id, subscription);
    });
    
    console.log(`✅ Dashboard - ${this.timerSubscriptions.size} timer subscriptions criadas`);
  }

  onViewTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  onNewUser(): void {
    this.router.navigate(['/users/new']);
  }

  onNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }
  
  onCompleteTask(taskId: string): void {
    console.log('✅ Dashboard - onCompleteTask chamado, taskId:', taskId);
    
    const taskIndex = this.recentTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      // Toggle completed localmente (quando o backend estiver pronto, chamar API aqui)
      this.recentTasks[taskIndex].completed = !this.recentTasks[taskIndex].completed;
      console.log('✅ Dashboard - Task completed:', this.recentTasks[taskIndex].completed);
      
      this.cdr.detectChanges();
    }
  }
}
