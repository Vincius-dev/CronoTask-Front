# 🚀 Plano de Implementação - CronoTask Frontend

## Fase 1: Setup Inicial do Projeto

### 1.1 Configuração Base
- [ ] Verificar estrutura Angular existente
- [ ] Instalar Tailwind CSS
- [ ] Configurar Tailwind (tailwind.config.js)
- [ ] Criar arquivo de variáveis de ambiente (environments)
- [ ] Configurar ESLint e Prettier (opcional)

### 1.2 Estrutura de Pastas
- [ ] Criar estrutura `/src/app/core`
- [ ] Criar estrutura `/src/app/shared`
- [ ] Criar estrutura `/src/app/features`
- [ ] Criar pastas para guards, interceptors, models, services

---

## Fase 2: Core Layer

### 2.1 Models
- [ ] Criar `core/models/user.model.ts` (User, UserCreate, UserUpdate)
- [ ] Criar `core/models/task.model.ts` (Task, TaskCreate, TaskUpdate)

### 2.2 Services
- [ ] Criar `core/services/user.service.ts`
  - Implementar métodos: getAll, getById, getByEmail, create, update, patch, delete
- [ ] Criar `core/services/task.service.ts`
  - Implementar métodos: getAll, getById, getByUserId, create, update, patch, toggleRunning, updateTime, delete
- [ ] Criar `core/services/timer.service.ts`
  - Implementar gerenciamento de timers ativos em memória
  - Sistema de atualização periódica ao servidor

### 2.3 Interceptors (Preparação)
- [ ] Criar `core/interceptors/http.interceptor.ts` (estrutura básica para futuro)

### 2.4 Guards (Preparação)
- [ ] Criar `core/guards/auth.guard.ts` (estrutura básica para futuro)

---

## Fase 3: Shared Layer

### 3.1 Pipes
- [ ] Criar `shared/pipes/time-format.pipe.ts`
  - Converter segundos para formato HH:MM:SS

### 3.2 Componentes Compartilhados
- [ ] Criar `shared/components/header/header.component.ts`
  - Navegação principal
  - Logo CronoTask
- [ ] Criar `shared/components/loading-spinner/loading-spinner.component.ts`
  - Spinner de carregamento
- [ ] Criar `shared/components/confirm-dialog/confirm-dialog.component.ts`
  - Modal de confirmação para exclusões
- [ ] Criar `shared/components/timer-display/timer-display.component.ts`
  - Display reutilizável de cronômetro

---

## Fase 4: Features - Dashboard

### 4.1 Estrutura
- [ ] Criar pasta `features/dashboard/pages/dashboard-home`
- [ ] Criar pasta `features/dashboard/components/stats-card`
- [ ] Criar pasta `features/dashboard/components/recent-tasks`

### 4.2 Componentes
- [ ] Implementar `dashboard-home.component.ts`
  - Buscar estatísticas gerais
  - Exibir cards de estatísticas
  - Listar tarefas recentes
- [ ] Implementar `stats-card.component.ts`
  - Card reutilizável para estatísticas
  - Inputs: título, valor, ícone
- [ ] Implementar `recent-tasks.component.ts`
  - Lista compacta de tarefas recentes
  - Ações rápidas (Play/Stop)

---

## Fase 5: Features - Users

### 5.1 Estrutura
- [ ] Criar pasta `features/users/pages/user-list`
- [ ] Criar pasta `features/users/pages/user-form`
- [ ] Criar pasta `features/users/pages/user-detail`
- [ ] Criar pasta `features/users/components/user-card`

### 5.2 Páginas
- [ ] Implementar `user-list.component.ts`
  - Listar todos os usuários
  - Barra de busca (filtro por nome/email)
  - Botão "Novo Usuário"
  - Ações: Ver, Editar, Excluir
- [ ] Implementar `user-form.component.ts`
  - Formulário reativo com validações
  - Modo criar/editar
  - Validações: email único, nome mínimo 3 chars, senha mínimo 6 chars
  - Tratamento de erros (email duplicado)
- [ ] Implementar `user-detail.component.ts`
  - Exibir informações do usuário
  - Estatísticas (total tarefas, tempo total)
  - Lista de tarefas do usuário
  - Botão editar

### 5.3 Componentes
- [ ] Implementar `user-card.component.ts`
  - Card individual de usuário
  - Inputs: user
  - Outputs: onView, onEdit, onDelete

---

## Fase 6: Features - Tasks

### 6.1 Estrutura
- [ ] Criar pasta `features/tasks/pages/task-list`
- [ ] Criar pasta `features/tasks/pages/task-form`
- [ ] Criar pasta `features/tasks/pages/task-timer`
- [ ] Criar pasta `features/tasks/components/task-card`
- [ ] Criar pasta `features/tasks/components/task-filters`

### 6.2 Páginas
- [ ] Implementar `task-list.component.ts`
  - Listar todas as tarefas ou por usuário
  - Sistema de filtros (status, usuário)
  - Ordenação (recentes, antigas, tempo)
  - Botão "Nova Tarefa"
  - Ações: Play/Stop, Editar, Excluir
- [ ] Implementar `task-form.component.ts`
  - Formulário reativo
  - Select de usuários
  - Validações: nome mínimo 3 chars, usuário obrigatório
  - Modo criar/editar
- [ ] Implementar `task-timer.component.ts`
  - Visualização detalhada da tarefa
  - Cronômetro em destaque
  - Botão Play/Pause grande
  - Informações do usuário
  - Histórico de sessões (opcional)

### 6.3 Componentes
- [ ] Implementar `task-card.component.ts`
  - Card individual de tarefa
  - Exibir: nome, usuário, tempo, status
  - Botões: Play/Stop, Editar, Excluir
- [ ] Implementar `task-filters.component.ts`
  - Filtros por status
  - Filtro por usuário
  - Ordenação
  - Outputs: onChange

---

## Fase 7: Routing e Navegação

### 7.1 Configuração de Rotas
- [ ] Configurar rotas principais em `app.routes.ts`
  - `/` → Dashboard
  - `/users` → User List
  - `/users/new` → User Form (create)
  - `/users/:id` → User Detail
  - `/users/:id/edit` → User Form (edit)
  - `/tasks` → Task List
  - `/tasks/new` → Task Form (create)
  - `/tasks/:id` → Task Timer
  - `/tasks/:id/edit` → Task Form (edit)

### 7.2 Guards (Preparação)
- [ ] Aplicar guards básicos (se necessário)

---

## Fase 8: Estilização com Tailwind

### 8.1 Design System
- [ ] Configurar cores customizadas no Tailwind config
  - Primary: #4A90E2
  - Secondary: #50C878
  - Danger: #E74C3C
  - Warning: #F39C12
- [ ] Criar classes utilitárias customizadas (se necessário)

### 8.2 Componentes
- [ ] Estilizar Header
- [ ] Estilizar Cards (User Card, Task Card, Stats Card)
- [ ] Estilizar Formulários
- [ ] Estilizar Botões (Play, Stop, Edit, Delete, New)
- [ ] Estilizar Loading Spinner
- [ ] Estilizar Timer Display
- [ ] Responsividade mobile

---

## Fase 9: Integração com Backend

### 9.1 Configuração
- [ ] Configurar environment.ts com URL da API
- [ ] Configurar environment.prod.ts

### 9.2 Testes de Integração
- [ ] Testar UserService com API real
- [ ] Testar TaskService com API real
- [ ] Testar TimerService com API real
- [ ] Validar tratamento de erros (404, 409, 500)

---

## Fase 10: Refinamentos e Testes

### 10.1 Melhorias UX
- [ ] Adicionar loading states
- [ ] Adicionar mensagens de erro amigáveis
- [ ] Adicionar mensagens de sucesso (toast/snackbar)
- [ ] Adicionar confirmações para exclusões
- [ ] Validações de formulário em tempo real

### 10.2 Polimento
- [ ] Revisar responsividade
- [ ] Otimizar performance (OnPush strategy se aplicável)
- [ ] Adicionar animações sutis
- [ ] Revisar acessibilidade básica

### 10.3 Testes (Opcional)
- [ ] Testes unitários dos services
- [ ] Testes de componentes críticos

---

## Fase 11: Documentação Final

- [ ] Atualizar README.md com instruções de instalação
- [ ] Documentar variáveis de ambiente
- [ ] Documentar comandos de desenvolvimento
- [ ] Documentar estrutura de pastas final

---

## ⚙️ Ordem de Execução Recomendada

1. **Setup** → Fase 1
2. **Foundation** → Fase 2 (Core) + Fase 3 (Shared - pelo menos pipes)
3. **Features Básicas** → Fase 5 (Users) → Fase 6 (Tasks)
4. **Dashboard** → Fase 4
5. **Routing** → Fase 7
6. **Styling** → Fase 8 (pode ser feito gradualmente durante as fases 3-6)
7. **Integration** → Fase 9
8. **Polish** → Fase 10
9. **Docs** → Fase 11

---

## 📝 Notas Técnicas

### Boas Práticas a Seguir
- **Standalone Components**: Usar componentes standalone (Angular 18+)
- **Reactive Forms**: Para todos os formulários
- **RxJS**: Uso apropriado de observables, operadores, unsubscribe
- **OnPush Change Detection**: Onde aplicável
- **Type Safety**: Tipar tudo rigorosamente
- **Error Handling**: Try-catch em services, tratamento de HTTP errors
- **Loading States**: Mostrar feedback visual durante operações assíncronas
- **Immutability**: Não mutar objetos diretamente

### Estrutura de Código
- **Services**: Injetados via `providedIn: 'root'`
- **Components**: Standalone com imports explícitos
- **Lazy Loading**: Considerar para features modules (se necessário)
- **Smart/Dumb Components**: Pages (smart) e Components (dumb/presentational)

---

**Pronto para começar! 🚀**
