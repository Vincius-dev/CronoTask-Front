# 🕐 CronoTask - Time Tracking Application

Sistema de controle de tempo e tarefas desenvolvido com **Angular 21** e **Tailwind CSS**, integrado com API backend CronoTask.

## 📋 Sobre o Projeto

CronoTask é uma aplicação completa de gerenciamento de tarefas com cronômetro integrado, permitindo:

- ✅ Gerenciar usuários
- ⏱️ Criar e monitorar tarefas com cronômetro
- 📊 Visualizar estatísticas de tempo
- 🎯 Dashboard com visão geral do sistema

## 🚀 Tecnologias

- **Angular 21** - Framework principal
- **Tailwind CSS** - Estilização
- **RxJS** - Gerenciamento de estado e eventos assíncronos
- **TypeScript** - Linguagem de programação
- **Standalone Components** - Arquitetura moderna do Angular

## 📁 Estrutura do Projeto

```
src/app/
├── core/                          # Camada core (singleton services)
│   ├── guards/                    # Route guards
│   ├── interceptors/              # HTTP interceptors
│   ├── models/                    # Interfaces e tipos
│   │   ├── user.model.ts
│   │   └── task.model.ts
│   └── services/                  # Services principais
│       ├── user.service.ts
│       ├── task.service.ts
│       └── timer.service.ts
│
├── shared/                        # Componentes reutilizáveis
│   ├── components/
│   │   ├── header/
│   │   ├── loading-spinner/
│   │   ├── confirm-dialog/
│   │   └── timer-display/
│   └── pipes/
│       └── time-format.pipe.ts
│
├── features/                      # Features modules
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── dashboard-home/
│   │   └── components/
│   │       ├── stats-card/
│   │       └── recent-tasks/
│   │
│   ├── users/
│   │   ├── pages/
│   │   │   ├── user-list/
│   │   │   ├── user-form/
│   │   │   └── user-detail/
│   │   └── components/
│   │       └── user-card/
│   │
│   └── tasks/
│       ├── pages/
│       │   ├── task-list/
│       │   ├── task-form/
│       │   └── task-timer/
│       └── components/
│           ├── task-card/
│           └── task-filters/
│
├── app.routes.ts                  # Configuração de rotas
├── app.config.ts                  # Configuração da aplicação
└── environments/                  # Variáveis de ambiente
    ├── environment.ts
    └── environment.prod.ts
```

## 🔧 Instalação

### Pré-requisitos

- Node.js (versão 18+)
- npm ou yarn
- Angular CLI 21+

### Passos de Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd CronoTask
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Edite o arquivo `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // URL do backend
};
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
ng serve
```

5. Abra o navegador em `http://localhost:4200`

## 🎯 Funcionalidades

### Dashboard
- Visão geral do sistema
- Estatísticas gerais (usuários, tarefas, tempo total)
- Tarefas recentes com ações rápidas

### Gerenciamento de Usuários
- Listar todos os usuários
- Criar novo usuário
- Editar informações do usuário
- Visualizar detalhes e tarefas do usuário
- Excluir usuário (com confirmação)
- Busca por nome ou email

### Gerenciamento de Tarefas
- Listar todas as tarefas
- Criar nova tarefa
- Editar tarefa
- Visualização detalhada com cronômetro
- Iniciar/Parar cronômetro
- Filtros por status e usuário
- Ordenação por diferentes critérios
- Excluir tarefa (com confirmação)

### Timer Service
- Gerenciamento de múltiplos timers simultâneos
- Atualização em tempo real
- Sincronização automática com o servidor
- Persistência de estado

## 🎨 Design System (Tailwind)

### Cores

```scss
Primary:      #4A90E2  (Azul)
Primary Dark: #357ABD
Primary Light:#6BA3E8
Secondary:    #50C878  (Verde - play/ativo)
Danger:       #E74C3C  (Vermelho - stop/delete)
Warning:      #F39C12  (Laranja)
```

### Componentes Principais

- **Cards** - Para exibição de usuários e tarefas
- **Formulários** - Com validação reativa
- **Botões** - Diferentes estilos (primary, secondary, danger)
- **Modal** - Confirmação de ações
- **Loading Spinner** - Feedback visual
- **Timer Display** - Exibição de tempo formatado

## 📡 API Integration

### Configuração da API

A URL base da API é configurada em `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Endpoints Utilizados

#### Users
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `GET /api/users/email/:email` - Buscar por email
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `PATCH /api/users/:id` - Atualização parcial
- `DELETE /api/users/:id` - Excluir usuário

#### Tasks
- `GET /api/tasks` - Listar todas as tarefas
- `GET /api/tasks/:id` - Buscar tarefa por ID
- `GET /api/tasks/user/:userId` - Buscar tarefas por usuário
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `PATCH /api/tasks/:id` - Atualização parcial
- `PATCH /api/tasks/:id/toggle` - Iniciar/Parar tarefa
- `PATCH /api/tasks/:id/time` - Atualizar tempo
- `DELETE /api/tasks/:id` - Excluir tarefa

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm start                 # Inicia dev server
npm run watch            # Build com watch mode

# Build
npm run build            # Build de produção

# Testes
npm test                 # Executa testes unitários
```

## 📝 Boas Práticas Implementadas

### Angular
- ✅ **Standalone Components** - Componentes independentes
- ✅ **Reactive Forms** - Formulários reativos com validação
- ✅ **RxJS Best Practices** - Uso correto de observables
- ✅ **Lazy Loading** - Carregamento sob demanda de rotas
- ✅ **Dependency Injection** - Injeção de dependências moderna
- ✅ **Type Safety** - Tipagem rigorosa em TypeScript
- ✅ **Error Handling** - Tratamento de erros centralizado

### Arquitetura
- ✅ **Feature-based Structure** - Organização por funcionalidades
- ✅ **Core/Shared/Features Pattern** - Separação clara de responsabilidades
- ✅ **Smart/Dumb Components** - Componentes inteligentes e de apresentação
- ✅ **Service Layer** - Lógica de negócio nos serviços
- ✅ **Immutability** - Dados imutáveis

### UX/UI
- ✅ **Loading States** - Feedback visual de carregamento
- ✅ **Error Messages** - Mensagens de erro amigáveis
- ✅ **Confirmation Dialogs** - Confirmação para ações destrutivas
- ✅ **Responsive Design** - Adaptação para mobile
- ✅ **Accessibility** - Suporte básico a acessibilidade

## 🔮 Próximas Funcionalidades (Roadmap)

### Fase 2 - Autenticação
- [ ] Sistema de login/logout
- [ ] Proteção de rotas com guards
- [ ] JWT token management
- [ ] Refresh token

### Fase 3 - Features Avançadas
- [ ] Dark mode
- [ ] Notificações push
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Gráficos de produtividade
- [ ] Timer Pomodoro integrado
- [ ] Tags e categorias para tarefas
- [ ] Histórico de sessões de trabalho

## 📄 Licença

Este projeto está sob a licença MIT.

---

**CronoTask** - Gerencie seu tempo com eficiência! ⏱️✨
