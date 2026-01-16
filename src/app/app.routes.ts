import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/pages/dashboard-home/dashboard-home.component')
      .then(m => m.DashboardHomeComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/pages/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  {
    path: 'users/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/pages/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/pages/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
  },
  {
    path: 'users/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/pages/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/pages/task-list/task-list.component')
      .then(m => m.TaskListComponent)
  },
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/pages/task-form/task-form.component')
      .then(m => m.TaskFormComponent)
  },
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/pages/task-timer/task-timer.component')
      .then(m => m.TaskTimerComponent)
  },
  {
    path: 'tasks/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/pages/task-form/task-form.component')
      .then(m => m.TaskFormComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
