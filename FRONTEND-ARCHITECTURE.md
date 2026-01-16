# 🎨 Frontend CronoTask - Arquitetura Angular

## 📋 Visão Geral

Frontend para consumo da API CronoTask, desenvolvido com **Angular 21** (última versão), seguindo boas práticas de arquitetura e componentização.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── app/
│   ├── core/                      # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts      # (Para futuro - autenticação)
│   │   ├── interceptors/
│   │   │   └── http.interceptor.ts # (Para futuro - auth headers)
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   └── task.model.ts
│   │   └── services/
│   │       ├── user.service.ts
│   │       ├── task.service.ts
│   │       └── timer.service.ts
│   │
│   ├── shared/                    # Componentes, pipes, directives reutilizáveis
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   ├── loading-spinner/
│   │   │   ├── confirm-dialog/
│   │   │   └── timer-display/
│   │   ├── pipes/
│   │   │   └── time-format.pipe.ts
│   │   └── directives/
│   │
│   ├── features/                  # Feature modules
│   │   ├── users/
│   │   │   ├── pages/
│   │   │   │   ├── user-list/
│   │   │   │   ├── user-form/
│   │   │   │   └── user-detail/
│   │   │   ├── components/
│   │   │   │   └── user-card/
│   │   │   └── users-routing.module.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── pages/
│   │   │   │   ├── task-list/
│   │   │   │   ├── task-form/
│   │   │   │   └── task-timer/
│   │   │   ├── components/
│   │   │   │   ├── task-card/
│   │   │   │   └── task-filters/
│   │   │   └── tasks-routing.module.ts
│   │   │
│   │   └── dashboard/
│   │       ├── pages/
│   │       │   └── dashboard-home/
│   │       └── components/
│   │           ├── stats-card/
│   │           └── recent-tasks/
│   │
│   ├── app.component.ts
│   ├── app.routes.ts
│   └── app.config.ts
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## 🎨 Telas e Funcionalidades

### 1. **Dashboard (Home)**
**Rota:** `/`

**Descrição:** Tela inicial com visão geral do sistema

**Componentes:**
- Estatísticas gerais (total de usuários, tarefas ativas, tempo total)
- Lista de tarefas recentes
- Botões de ação rápida (Nova tarefa, Novo usuário)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header com navegação                    │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │Usuários │ │Tarefas  │ │Tempo    │   │
│ │   10    │ │   25    │ │ 10:30h  │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│ Tarefas Recentes                        │
│ ┌─────────────────────────────────────┐ │
│ │ □ Tarefa 1          [Play] [Edit]  │ │
│ │ ■ Tarefa 2 (ativa)  [Stop] [Edit]  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 2. **Lista de Usuários**
**Rota:** `/users`

**Descrição:** Listagem de todos os usuários cadastrados

**Funcionalidades:**
- Exibir cards/tabela com usuários
- Buscar por nome ou email
- Ações: Visualizar, Editar, Deletar
- Botão "Novo Usuário"
- Visualizar tarefas do usuário

**Componentes:**
- `user-list.component.ts` (página)
- `user-card.component.ts` (card individual)
- Paginação (se necessário)
- Barra de busca

**Layout:**
```
┌─────────────────────────────────────────┐
│ Usuários                   [+ Novo]     │
├─────────────────────────────────────────┤
│ 🔍 [Buscar usuários...]                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 João Silva                        │ │
│ │    joao@example.com                  │ │
│ │    [Ver Tarefas] [Editar] [Excluir] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Maria Santos                      │ │
│ │    maria@example.com                 │ │
│ │    [Ver Tarefas] [Editar] [Excluir] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 3. **Formulário de Usuário (Criar/Editar)**
**Rotas:** `/users/new`, `/users/:id/edit`

**Descrição:** Formulário para criar ou editar usuário

**Campos:**
- Nome (obrigatório)
- Email (obrigatório, validação)
- Senha (obrigatório na criação)

**Validações:**
- Email válido
- Nome mínimo 3 caracteres
- Senha mínimo 6 caracteres
- Tratamento de erro (email duplicado)

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Voltar    Novo Usuário                │
├─────────────────────────────────────────┤
│                                         │
│ Nome *                                  │
│ [_________________________________]     │
│                                         │
│ Email *                                 │
│ [_________________________________]     │
│                                         │
│ Senha *                                 │
│ [_________________________________]     │
│                                         │
│              [Cancelar] [Salvar]        │
│                                         │
└─────────────────────────────────────────┘
```

---

### 4. **Detalhes do Usuário**
**Rota:** `/users/:id`

**Descrição:** Visualização completa do usuário com suas tarefas

**Funcionalidades:**
- Informações do usuário
- Lista de tarefas do usuário
- Estatísticas (total de tarefas, tempo gasto)
- Botão editar usuário

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Voltar    João Silva        [Editar] │
├─────────────────────────────────────────┤
│ 📧 joao@example.com                     │
│                                         │
│ Estatísticas                            │
│ ┌──────────────┐ ┌──────────────┐     │
│ │ 10 Tarefas   │ │ 25:30 horas  │     │
│ └──────────────┘ └──────────────┘     │
│                                         │
│ Tarefas                      [+ Nova]   │
│ ┌─────────────────────────────────────┐ │
│ │ Estudar Angular  [00:45] [Play]     │ │
│ │ Revisar código   [02:30] [Play]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 5. **Lista de Tarefas**
**Rota:** `/tasks`, `/users/:userId/tasks`

**Descrição:** Listagem de tarefas (todas ou por usuário)

**Funcionalidades:**
- Exibir cards com tarefas
- Filtros: Status (ativas/pausadas), Usuário
- Ordenação: Mais recentes, Mais antigas, Tempo
- Ações: Iniciar/Parar, Editar, Deletar
- Botão "Nova Tarefa"

**Componentes:**
- `task-list.component.ts` (página)
- `task-card.component.ts` (card individual)
- `task-filters.component.ts` (filtros)
- `timer-display.component.ts` (exibição do tempo)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Tarefas                    [+ Nova]     │
├─────────────────────────────────────────┤
│ Filtros: [Todas ▼] [Usuário ▼]         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📝 Estudar Angular                   │ │
│ │    João Silva                        │ │
│ │    Tempo: 00:45:30                   │ │
│ │    Status: ■ Ativa                   │ │
│ │    [Stop] [Editar] [Excluir]        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📝 Revisar código                    │ │
│ │    Maria Santos                      │ │
│ │    Tempo: 02:30:15                   │ │
│ │    Status: □ Pausada                 │ │
│ │    [Play] [Editar] [Excluir]        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 6. **Formulário de Tarefa (Criar/Editar)**
**Rotas:** `/tasks/new`, `/tasks/:id/edit`

**Descrição:** Formulário para criar ou editar tarefa

**Campos:**
- Usuário (select - obrigatório)
- Nome da tarefa (obrigatório)
- Descrição (opcional)

**Validações:**
- Nome mínimo 3 caracteres
- Usuário deve ser selecionado

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Voltar    Nova Tarefa                 │
├─────────────────────────────────────────┤
│                                         │
│ Usuário *                               │
│ [Selecione um usuário ▼         ]      │
│                                         │
│ Nome da Tarefa *                        │
│ [_________________________________]     │
│                                         │
│ Descrição                               │
│ [_________________________________]     │
│ [_________________________________]     │
│ [_________________________________]     │
│                                         │
│              [Cancelar] [Salvar]        │
│                                         │
└─────────────────────────────────────────┘
```

---

### 7. **Visualização da Tarefa com Timer**
**Rota:** `/tasks/:id`

**Descrição:** Visualização detalhada da tarefa com cronômetro em destaque

**Funcionalidades:**
- Exibir detalhes completos da tarefa
- Cronômetro grande e visível
- Botão Play/Pause proeminente
- Histórico de sessões (opcional)
- Editar detalhes da tarefa

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Voltar    Estudar Angular   [Editar] │
├─────────────────────────────────────────┤
│ Usuário: João Silva                     │
│                                         │
│ Descrição:                              │
│ Revisar conceitos de Angular e criar   │
│ componentes reutilizáveis               │
│                                         │
│        ┌─────────────────┐              │
│        │   00:45:30      │              │
│        │   ■ Ativa       │              │
│        └─────────────────┘              │
│                                         │
│           [■ PARAR]                     │
│                                         │
│ Sessões anteriores:                     │
│ • Hoje: 00:30:00                        │
│ • Ontem: 00:15:30                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Services Necessários

### 1. **UserService**
```typescript
interface UserService {
  getAll(): Observable<User[]>
  getById(id: string): Observable<User>
  getByEmail(email: string): Observable<User>
  create(user: UserCreate): Observable<User>
  update(id: string, user: UserUpdate): Observable<User>
  patch(id: string, data: Partial<User>): Observable<User>
  delete(id: string): Observable<void>
}
```

### 2. **TaskService**
```typescript
interface TaskService {
  getAll(): Observable<Task[]>
  getById(id: string): Observable<Task>
  getByUserId(userId: string): Observable<Task[]>
  create(task: TaskCreate): Observable<Task>
  update(id: string, task: TaskUpdate): Observable<Task>
  patch(id: string, data: Partial<Task>): Observable<Task>
  toggleRunning(id: string): Observable<Task>
  updateTime(id: string, time: number): Observable<Task>
  delete(id: string): Observable<void>
}
```

### 3. **TimerService**
```typescript
interface TimerService {
  startTimer(taskId: string): void
  stopTimer(taskId: string): void
  getElapsedTime(taskId: string): Observable<number>
  // Gerencia timers ativos em memória
  // Atualiza servidor periodicamente
}
```

---

## 📦 Models/Interfaces

### User Models
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserCreate {
  name: string;
  email: string;
  password: string;
}

interface UserUpdate {
  name: string;
  email: string;
  password?: string;
}
```

### Task Models
```typescript
interface Task {
  id: string;
  userId: string;
  name: string;
  description: string;
  elapsedTime: number; // em segundos
  isRunning: boolean;
}

interface TaskCreate {
  userId: string;
  name: string;
  description: string;
}

interface TaskUpdate {
  userId: string;
  name: string;
  description: string;
}
```

---

## 🎨 Design System

### Cores Sugeridas
```scss
// Primary (tema cronômetro/tempo)
$primary: #4A90E2;      // Azul
$primary-dark: #357ABD;
$primary-light: #6BA3E8;

// Secondary
$secondary: #50C878;    // Verde (play/ativo)
$danger: #E74C3C;       // Vermelho (stop/delete)
$warning: #F39C12;      // Laranja (alerta)

// Neutral
$gray-100: #F8F9FA;
$gray-300: #DEE2E6;
$gray-500: #ADB5BD;
$gray-700: #495057;
$gray-900: #212529;
```

### Componentes UI Recomendados

**Opções de bibliotecas:**
- **Angular Material** (Recomendado - oficial)
- **PrimeNG** (rica em componentes)
- **Tailwind CSS** (utility-first)

---

## 🚀 Funcionalidades Avançadas (Futuras)

### Fase 2 - Autenticação
- Login/Logout
- Guards nas rotas
- Interceptor para token JWT
- Refresh token

### Fase 3 - Features Extras
- Dark mode
- Notificações (tarefas longas rodando)
- Exportar relatórios (CSV/PDF)
- Gráficos de produtividade
- Pomodoro timer integrado
- Tags/categorias para tarefas

---

## 📝 Fluxo de Navegação

```
          Dashboard (/)
               │
       ┌───────┴────────┐
       │                │
   Users (/users)   Tasks (/tasks)
       │                │
   ┌───┴───┐        ┌───┴───┐
   │       │        │       │
  New    Edit     New     Edit
  Form   Form    Form    Form
   │       │        │       │
Detail  Delete   Timer  Delete
```

---

## 🛠️ Setup do Projeto

### Comando para criar o projeto
```bash
# Criar projeto Angular 18
ng new cronotask-frontend --routing --style=scss

# Instalar Angular Material
ng add @angular/material

# Instalar RxJS (já vem por padrão)
```

### Estrutura de módulos recomendada
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
};
```

### environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 📋 Checklist de Desenvolvimento

### Setup Inicial
- [ ] Criar projeto Angular 18
- [ ] Configurar ESLint/Prettier
- [ ] Instalar Angular Material
- [ ] Configurar roteamento
- [ ] Criar structure de pastas

### Core
- [ ] Criar models (User, Task)
- [ ] Criar services (User, Task, Timer)
- [ ] Configurar HTTP client
- [ ] Criar interceptor (preparação para auth)

### Shared
- [ ] Header component
- [ ] Loading spinner
- [ ] Confirm dialog
- [ ] Timer display component
- [ ] Time format pipe

### Features - Users
- [ ] User list page
- [ ] User form page
- [ ] User detail page
- [ ] User card component

### Features - Tasks
- [ ] Task list page
- [ ] Task form page
- [ ] Task timer page
- [ ] Task card component
- [ ] Task filters component

### Features - Dashboard
- [ ] Dashboard home
- [ ] Stats cards
- [ ] Recent tasks component

### Testes
- [ ] Unit tests para services
- [ ] Component tests
- [ ] E2E tests (opcional)

---

## 🔗 Integração com Backend

### Headers CORS
Backend já configurado para aceitar requisições do frontend.

### Formato de Requisições
```typescript
// Exemplo de chamada
this.http.post<Task>(`${environment.apiUrl}/tasks`, {
  userId: '123-456',
  name: 'Nova tarefa',
  description: 'Descrição'
})
```

### Tratamento de Erros
```typescript
catchError((error: HttpErrorResponse) => {
  if (error.status === 409) {
    // Email já existe
  } else if (error.status === 404) {
    // Recurso não encontrado
  }
  return throwError(() => error);
})
```

---

**Pronto para começar o desenvolvimento! 🚀**

Quer que eu comece criando os arquivos do projeto Angular?
