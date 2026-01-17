import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TimerService } from '../../../../core/services/timer.service';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskFiltersComponent } from '../../components/task-filters/task-filters.component';
import { Subscription } from 'rxjs';

interface TaskFilters {
  status: 'all' | 'running' | 'paused';
  completionStatus: 'all' | 'completed' | 'incomplete';
  userId: string;
  sortBy: 'recent' | 'oldest' | 'time';
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    TaskCardComponent,
    TaskFiltersComponent
  ],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private timerService = inject(TimerService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  users: User[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  error = '';
  showDeleteConfirm = false;
  taskToDelete: Task | null = null;
  
  private timerSubscriptions = new Map<string, Subscription>();

  private filters: TaskFilters = {
    status: 'all',
    completionStatus: 'all',
    userId: '',
    sortBy: 'recent'
  };

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (!userId) {
      this.error = 'Usuário não autenticado';
      return;
    }

    this.loadTasksByUser(userId);
  }
  
  ngOnDestroy(): void {
    console.log('🧹 TaskList - ngOnDestroy, cancelando subscriptions');
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
  }

  loadTasksByUser(userId: string): void {
    this.loading = true;
    this.error = '';
    console.log('📋 TaskList - Carregando tarefas, loading=true');

    this.taskService.getByUserId(userId).subscribe({
      next: (tasks) => {
        console.log('✅ TaskList - Tarefas recebidas:', tasks.length);
        this.tasks = tasks;
        this.applyFilters();
        this.subscribeToTimers();
        this.loading = false;
        console.log('✅ TaskList - loading=false');
        this.cdr.detectChanges();
        console.log('🔄 TaskList - detectChanges() chamado');
      },
      error: (error) => {
        console.log('🔴 TaskList - Erro:', error);
        this.error = error.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFiltersChange(filters: TaskFilters): void {
    this.filters = filters;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.tasks];

    // Filtrar por status
    if (this.filters.status === 'running') {
      filtered = filtered.filter(t => t.isRunning);
    } else if (this.filters.status === 'paused') {
      filtered = filtered.filter(t => !t.isRunning);
    }

    // Filtrar por conclusão
    if (this.filters.completionStatus === 'completed') {
      filtered = filtered.filter(t => t.completed === true);
    } else if (this.filters.completionStatus === 'incomplete') {
      filtered = filtered.filter(t => !t.completed);
    }

    // Ordenar
    switch (this.filters.sortBy) {
      case 'time':
        filtered.sort((a, b) => b.elapsedTime - a.elapsedTime);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.name.localeCompare(b.name)); // Simplificado
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.name.localeCompare(a.name)); // Simplificado
        break;
    }

    this.filteredTasks = filtered;
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(u => u.id === userId);
  }

  onNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  onToggleTask(taskId: string): void {
    console.log('🎬 TaskList - onToggleTask chamado, taskId:', taskId);
    
    const task = this.tasks.find(t => t.id === taskId);
    console.log('🔍 TaskList - Task encontrada:', task);
    
    if (!task) {
      console.log('❌ TaskList - Task não encontrada!');
      return;
    }

    // FAZER O TOGGLE LOCALMENTE PRIMEIRO
    const newIsRunning = !task.isRunning;
    console.log('🔄 TaskList - Mudando isRunning de', task.isRunning, 'para', newIsRunning);
    
    // Atualizar localmente
    task.isRunning = newIsRunning;
    
    if (newIsRunning) {
      this.timerService.startTimer(taskId, task.elapsedTime);
      console.log('▶️ TaskList - Timer iniciado localmente');
    } else {
      const finalTime = this.timerService.stopTimer(taskId);
      console.log('⏸️ TaskList - Timer parado localmente, tempo final:', finalTime);
      
      // Atualizar o elapsedTime com o valor final
      if (finalTime !== null) {
        task.elapsedTime = finalTime;
      }
    }
    
    // Forçar atualização
    this.cdr.detectChanges();
    this.applyFilters();
    console.log('🔄 TaskList - detectChanges() e applyFilters() chamados');

    // Enviar para o backend
    console.log('📤 TaskList - Enviando requisição toggleRunning...');
    this.taskService.toggleRunning(taskId).subscribe({
      next: (updatedTask) => {
        console.group('✅ TaskList - toggleRunning resposta');
        console.log('Updated task:', updatedTask);
        console.groupEnd();
        
        // Atualizar APENAS o elapsedTime, NÃO o isRunning
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          const currentIsRunning = this.tasks[index].isRunning;
          this.tasks[index] = updatedTask;
          this.tasks[index].isRunning = currentIsRunning;
          
          this.applyFilters();
          console.log('📊 TaskList - Task atualizada, isRunning mantido como:', currentIsRunning);
        }
      },
      error: (error) => {
        console.log('🔴 TaskList - Erro:', error);
        this.error = error.message;
      }
    });
  }

  onViewTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  onEditTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  onDeleteTask(taskId: string): void {
    this.taskToDelete = this.tasks.find(t => t.id === taskId) || null;
    this.showDeleteConfirm = true;
  }

  onCompleteTask(taskId: string): void {
    console.log('✅ TaskList - onCompleteTask chamado, taskId:', taskId);
    
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      // Toggle completed localmente (quando o backend estiver pronto, chamar API aqui)
      this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
      console.log('✅ TaskList - Task completed:', this.tasks[taskIndex].completed);
      
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  confirmDelete(): void {
    if (!this.taskToDelete) return;

    this.taskService.delete(this.taskToDelete.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete!.id);
        this.applyFilters();
        this.showDeleteConfirm = false;
        this.taskToDelete = null;
      },
      error: (error) => {
        this.error = error.message;
        this.showDeleteConfirm = false;
        this.taskToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.taskToDelete = null;
  }
  
  private subscribeToTimers(): void {
    console.log('🔔 TaskList - Inscrevendo em timers');
    
    // Limpar subscriptions anteriores
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions.clear();
    
    // Inscrever em cada tarefa
    this.tasks.forEach(task => {
      const subscription = this.timerService.getElapsedTime(task.id).subscribe({
        next: (elapsedTime) => {
          const taskIndex = this.tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1 && this.tasks[taskIndex].isRunning) {
            this.tasks[taskIndex].elapsedTime = elapsedTime;
            this.applyFilters();
            this.cdr.detectChanges();
          }
        }
      });
      
      this.timerSubscriptions.set(task.id, subscription);
    });
    
    console.log(`✅ TaskList - ${this.timerSubscriptions.size} timer subscriptions criadas`);
  }
}
