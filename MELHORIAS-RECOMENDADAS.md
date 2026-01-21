# 🔧 Melhorias Recomendadas - CronoTask Frontend

> **⚠️ Nota**: Este documento foca nas melhorias do **FRONTEND**. As implementações de backend correspondentes devem ser feitas no projeto do backend separadamente.

## 🔐 PRIORIDADE 1: Segurança e Autenticação

### 1.1 Implementar OAuth2 / JWT Authentication no Frontend

**Status Atual**: Sistema de "login" simplificado sem autenticação real  
**Risco**: Segurança comprometida, sem validação de identidade

#### 📋 O que o Backend precisa fornecer:

O backend precisa implementar os seguintes endpoints:
- `POST /api/auth/login` - Login com email/senha, retorna access token + refresh token
- `POST /api/auth/refresh` - Renova access token usando refresh token
- `POST /api/auth/logout` - Invalida refresh tokens do usuário
- Todas as rotas protegidas devem validar `Authorization: Bearer <token>`

**Contrato de API esperado:**
```typescript
// POST /api/auth/login
Request: { email: string, password: string }
Response: {
  accessToken: string,
  refreshToken: string,
  expiresIn: number,  // segundos até expirar
  user: User
}

// POST /api/auth/refresh
Request: { refreshToken: string }
Response: {
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  user: User
}
```

#### 🎯 Implementação no Frontend (Angular)
```typescript
// 1. Criar AuthService melhorado
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private refreshTokenTimeout?: NodeJS.Timeout;

  login(email: string, password: string): Observable<void> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        map(() => void 0)
      );
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    // Armazenar access token em memória (mais seguro)
    sessionStorage.setItem(this.accessTokenKey, response.accessToken);
    
    // Armazenar refresh token em httpOnly cookie (ideal)
    // Ou em localStorage com criptografia (alternativa)
    this.storeRefreshToken(response.refreshToken);
    
    this.currentUserSubject.next(response.user);
    
    // Configurar refresh automático antes do token expirar
    this.startRefreshTokenTimer(response.expiresIn);
  }
  
  private storeRefreshToken(refreshToken: string): void {
    // OPÇÃO 1: httpOnly Cookie (MAIS SEGURO - Backend precisa configurar)
    // O backend já envia como Set-Cookie: refresh_token=xxx; HttpOnly; Secure; SameSite=Strict
    
    // OPÇÃO 2: localStorage com criptografia (se não puder usar cookies)
    const encrypted = this.encryptToken(refreshToken);
    localStorage.setItem(this.refreshTokenKey, encrypted);
  }
  
  private encryptToken(token: string): string {
    // Usar crypto-js ou similar
    return CryptoJS.AES.encrypt(token, environment.encryptionKey).toString();
  }
  
  private decryptToken(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, environment.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  private startRefreshTokenTimer(expiresIn: number): void {
    // Renovar 1 minuto antes de expirar
    const timeout = (expiresIn - 60) * 1000;
    
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, timeout);
  }
  
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
  
  refreshToken(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        map(() => void 0),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }
  
  private getRefreshToken(): string | null {
    // Se usando localStorage com criptografia
    const encrypted = localStorage.getItem(this.refreshTokenKey);
    return encrypted ? this.decryptToken(encrypted) : null;
    
    // Se usando httpOnly cookie, não precisa pegar - é enviado automaticamente
  }
  
  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthData();
      }
    });
  }
  
  private clearAuthData(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.stopRefreshTokenTimer();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessTokenKey);
  }
}

// 2. Atualizar HTTP Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  
  if (accessToken && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado, tentar refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry com novo token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

// 3. Atualizar AuthGuard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const accessToken = authService.getAccessToken();
  
  if (!accessToken) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Validar se o token não está expirado
  if (isTokenExpired(accessToken)) {
    // Tentar refresh
    return authService.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  }
  
  return true;
};
```

#### ⚠️ Considerações de Segurança

**✅ FAÇA:**
- Use **httpOnly cookies** para refresh tokens (impossível de acessar via JavaScript)
- Armazene access tokens em **memória** (sessionStorage) - não em localStorage
- Implemente **refresh token rotation** (novo token a cada refresh)
- Use **HTTPS** em produção (obrigatório)
- Implemente **CSRF protection** se usar cookies
- Adicione **rate limiting** nas rotas de autenticação
- Hash refresh tokens antes de salvar no banco
- Implemente **revogação de tokens** (logout de todos os dispositivos)

**❌ NÃO FAÇA:**
- ❌ Armazenar tokens sensíveis em localStorage sem criptografia
- ❌ Usar tokens sem expiração
- ❌ Expor chaves secretas no frontend
- ❌ Enviar senhas sem hash no banco
- ❌ Confiar apenas em validação frontend

---

## 🚀 PRIORIDADE 2: Performance e Otimização

### 2.1 Resolver Problemas N+1 no Frontend

**Problema Identificado**: Múltiplas chamadas HTTP desnecessárias para o mesmo recurso

#### 📋 O que o Backend precisa fornecer:

O backend deve implementar endpoints agregados para evitar múltiplas requisições:
- `GET /api/users/{id}/dashboard` - Retorna user + tasks + stats em uma única chamada
- `GET /api/tasks?userId={id}&include=user` - Retorna tasks com dados do usuário já incluídos

**Exemplo de endpoint agregado:**
```typescript
// GET /api/users/{id}/dashboard
Response: {
  user: User,
  tasks: Task[],
  stats: {
    totalTasks: number,
    totalTime: number,
    runningTasks: number
  }
}
```

#### 🎯 Implementação no Frontend - Evitar chamadas desnecessárias

```typescript
// ❌ PROBLEMA: Múltiplas chamadas para o mesmo dado
ngOnInit() {
  this.loadUser(userId);
  this.loadTasks(userId); // Chama API
  this.loadStats(userId); // Chama API novamente
}

// ✅ SOLUÇÃO: Uma chamada que retorna tudo
ngOnInit() {
  this.userService.getUserDashboard(userId).subscribe(dashboard => {
    this.user = dashboard.user;
    this.tasks = dashboard.tasks;
    this.stats = dashboard.stats;
  });
}

// Backend endpoint agregado
@GetMapping("/api/users/{id}/dashboard")
public UserDashboard getUserDashboard(@PathVariable String id) {
    User user = userRepository.findById(id);
    List<Task> tasks = taskRepository.findByUserId(id);
    
    return new UserDashboard(
        user,
        tasks,
        calculateStats(tasks)
    );
}
```

}
```

### 2.2 Implementar Sistema de Cache no Frontend

#### 📋 O que o Backend precisa fornecer:

O backend deve implementar headers HTTP apropriados para cache:
- `Cache-Control: private, max-age=300` para recursos que podem ser cacheados
- `ETag` para validação de cache
- Suporte a `If-None-Match` para retornar 304 Not Modified

#### 🎯 Implementação no                             ModelAndView modelAndView) {
                // Cache para recursos estáticos
                if (request.getRequestURI().startsWith("/api/users/")) {
                    response.setHeader("Cache-Control", "private, max-age=300"); // 5 min
                }
            }
        });
    }
}

// 2. Implementar cache no frontend com RxJS
@Injectable({ providedIn: 'root' })
export class TaskService {
  private cache = new Map<string, { data: Task[], timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutos
  
  getByUserId(userId: string): Observable<Task[]> {
    const cached = this.cache.get(userId);
    
    // Se tem cache válido, retornar do cache
    if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
      return of(cached.data);
    }
    
    // Se não, buscar do servidor
    return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(tasks => {
        this.cache.set(userId, { data: tasks, timestamp: Date.now() });
      }),
      catchError(this.handleError)
    );
  }
  
  // Invalidar cache ao modificar dados
  create(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap(() => this.invalidateCache(task.userId)),
      catchError(this.handleError)
    );
  }
  
  update(id: string, task: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      tap(updated => this.invalidateCache(updated.userId)),
      catchError(this.handleError)
    );
  }
  
  private invalidateCache(userId: string): void {
    this.cache.delete(userId);
  }
  
  clearAllCache(): void {
    this.cache.clear();
  }
}

// 3. Usar ShareReplay para evitar múltiplas requisições simultâneas
@Injectable({ providedIn: 'root' })
export class UserService {
  private userCache$ = new Map<string, Observable<User>>();
  
  getById(id: string): Observable<User> {
    if (!this.userCache$.has(id)) {
      const user$ = this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError(error => {
          this.userCache$.delete(id);
          return throwError(() => error);
        })
      );
      this.userCache$.set(id, user$);
    }
    
    return this.userCache$.get(id)!;
  }
}
```

### 2.3 Lazy Loading de Dados e Paginação

#### 📋 O que o Backend precisa fornecer:

O backend deve implementar paginação em endpoints que retornam listas:
- `GET /api/tasks?page=0&size=20&sort=createdAt,desc`
- Retornar formato padronizado: `{ content: T[], totalElements: number, totalPages: number, last: boolean }`

**Exemplo de resposta paginada:**
```typescript
Response: {
  content: Task[],
  totalElements: 150,
  totalPages: 8,
  size: 20,
  number: 0,
  first: boolean,
  last: boolean
}
```

#### 🎯 Implementação no Frontend - Infinite scroll ou paginação
@Component({...})
exporttListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= documentHeight - 100) {
      this.loadMore();
    }
  }
}
```

---

## 🎯 PRIORIDADE 3: Otimizações Adicionais

### 3.1 Implementar WebSocket para Atualizações em Tempo Real

```java
// Backend - Spring WebSocket
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
#### 📋 O que o Backend precisa fornecer:

O backend deve implementar WebSocket/SSE para notificações em tempo real:
- WebSocket endpoint: `ws://localhost:8080/ws`
- Tópicos: `/topic/tasks/{userId}`, `/topic/users/{userId}`
- Enviar notificações quando tasks são criadas/atualizadas/deletadas

#### 🎯 Implementação no    });
      
      this.stompClient.activate();
    });
  }2
}
```

### 3.2 Implementar Service Worker para PWA

```typescript
// angular.json
"serviceWorker": true,
"ngswConfigPath": "ngsw-config.json"

// ngsw-config.json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": ["/api/users/**", "/api/tasks/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "5m",
        "strategy": "freshness"
      }
    }
  ]
}
```

### 3.3 Implementar Testes

```typescript
// Task Service Test
describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController; (Offline First)

#### 🎯 Implementação no Frontend

```bash
# Instalar @angular/pwa
ng add @angular/pwa
```

```typescript    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });Change Detection Strategy OnPush

```typescript
// Otimizar performance usando OnPush
@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class TaskListComponent {
  // Usar Observables com AsyncPipe
  tasks$ = this.taskService.getTasks();
  
  // Ou usar Signals (Angular 17+)
  tasks = signal<Task[]>([]);
}
```

### 3.4 Implementar Testes Unitários

#### 📦 Dependências necessárias:

```bash
# Já vem com Angular
npm test  # Jasmine + Karma

# Alternativa moderna
npm install -D @jest/core @types/jest
```

#### 🎯 Exemplos de 
  
  it('should get tasks by user id', () => {
    const mockTasks: Task[] = [
      { id: '1', userId: 'user1', name: 'Task 1', elapsedTime: 100 }
    ];
    
    service.getByUserId('user1').subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/user/user1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });
  
  it('should handle cache correctly', () => {
    const mockTasks: Task[] = [...];
    
  # 3.5 Adicionar Validações de Formulário Avançadas

```typescript
// Criar validators customizados
export class CustomValidators {
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value);
      return valid ? null : { invalidEmail: { value: control.value } };
    };
  }
  
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; (Frontend)

### ✅ Checklist de Dependências do Backend

Antes de começar, confirme que o backend tem:
- [ ] Endpoints de autenticação (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`)
- [ ] Sistema JWT implementado
- [ ] CORS configurado para o frontend
- [ ] Headers de cache HTTP (opcional mas recomendado)
- [ ] Endpoints agregados (para evitar N+1)
- [ ] Suporte a paginação em listas

### Fase 1: Segurança e Autenticação (1 semana)
**Foco**: Implementar autenticação JWT segura no frontend

- [ ] Instalar dependências: `crypto-js` para criptografia
- [ ] Criar models de autenticação (`AuthResponse`, `LoginRequest`)
- [ ] Refatorar `AuthService` com JWT
- [ ] Implementar armazenamento seguro (sessionStorage + localStorage criptografado)
- [ ] Criar `authInterceptor` para adicionar token nas requisições
- [ ] Implementar refresh token automático
- [ ] Atualizar `authGuard` para validar tokens
- [ ] Adicionar página de senha (register com validação forte)
- [ ] Testar fluxo completo: login → navegação → refresh → logout

**Arquivos a modificar:**
- `src/app/core/services/auth.service.ts`
- `src/app/core/interceptors/http.interceptor.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/features/auth/pages/login/login.component.ts`
- `src/app/features/auth/pages/register/register.component.ts`
- `src/environments/environment.ts` (adicionar `encryptionKey`)

### Fase 2: Performance - Cache e Otimizações (3-5 dias)
**Foco**: Reduzir chamadas HTTP e melhorar performance

- [ ] Implementar cache em `TaskService` (RxJS + Map)
- [ ] Implementar cache em `UserService` (ShareReplay)
- [ ] Adicionar invalidação de cache nos métodos que modificam dados
- [ ] Identificar e eliminar chamadas HTTP duplicadas
- [ ] Implementar OnPush em componentes pesados (TaskList, Dashboard)
- [ ] Otimizar subscriptions (usar `takeUntil`)
- [ ] Adicionar debounce em buscas e filtros
� Dependências a Adicionar

```bash
# Autenticação
npm install crypto-js
npm install -D @types/crypto-js

# Testes
npm install -D @testing-library/angular
npm install -D cypress  # ou playwright

# Notificações
npm install ngx-toastr

# PWA (opcional)
ng add @angular/pwa

# WebSocket (opcional)
npm install @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

---

## 📚 Recursos e Referências

**Frontend Específico:**
- [Angular Security Guide](https://angular.io/guide/security)
- [RxJS ShareReplay](https://rxjs.dev/api/operators/shareReplay)
- [Angular Performance Checklist](https://angular.io/guide/performance-checklist)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [crypto-js Documentation](https://cryptojs.gitbook.io/docs/)

**Segurança:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Storing JWT Tokens Securely](https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf)

**Backend (para coordenar com equipe backend):**
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [N+1 Query Problem](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem)

---

## 🤝 Coordenação com Backend

Para cada feature implementada no frontend, certifique-se de que o backend está preparado:

| Feature Frontend | Requer Backend |
|-----------------|----------------|
| JWT Authentication | ✅ Endpoints `/api/auth/*` + validação JWT |
| Refresh Token | ✅ Endpoint `/api/auth/refresh` + persistência de tokens |
| Cache HTTP | ⚠️ Recomendado: Headers `Cache-Control`, `ETag` |
| Paginação | ✅ Query params `?page=&size=` |
| Endpoints agregados | ✅ Ex: `/api/users/{id}/dashboard` |
| WebSocket | ✅ WebSocket server configurado |
| Filtros/Busca | ✅ Query params suportados |

---

**Última atualização**: Janeiro 2026  
**Versão**: 1.1 (Frontend Focus) skeleton loaders
- [ ] Implementar toast notifications
- [ ] Adicionar animações de transição

**Arquivos a criar:**
- `src/app/core/services/loading.service.ts`
- `src/app/core/services/toast.service.ts`
- `src/app/shared/components/skeleton-loader/`

### Fase 4: Qualidade - Testes (1 semana)
**Foco**: Garantir qualidade e confiabilidade do código

- [ ] Configurar ambiente de testes
- [ ] Escrever testes para services (AuthService, TaskService, UserService)
- [ ] Escrever testes para components (Login, TaskList)
- [ ] Escrever testes para guards e interceptors
- [ ] Configurar Cypress ou Playwright para E2E
- [ ] Testes E2E: login, criar task, editar task, logout
- [ ] Objetivo: 70%+ coverage

### Fase 5: Features Avançadas (Opcional, 1-2 semanas)
**Foco**: Funcionalidades extras

- [ ] WebSocket para atualizações real-time
- [ ] Service Worker e PWA
- [ ] Paginação infinite scroll
- [ ] Filtros avançados com query params
- [ ] Internacionalização (i18n)
- [ ] Dark mode
- [ ] Export de dados (CSV, PDF)
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  loadingService.show();
  
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
```

---

## 📊 Resumo de Prioridades (Frontend)

| Prioridade | Tarefa | Impacto | Esforço | Backend Required |
|-----------|--------|---------|---------|------------------|
| 🔴 **1** | OAuth2/JWT + Sessão Segura | CRÍTICO | Alto | ✅ Sim |
| 🔴 **2** | Implementar Cache no Frontend | Alto | Médio | ⚠️ Opcional |
| 🟠 **3** | Resolver chamadas HTTP duplicadas | Alto | Baixo | ✅ Sim (endpoints agregados) |
| 🟠 **4** | Testes Unitários e E2E | Alto | Alto | ❌ Não |
| 🟡 **5** | Change Detection OnPush | Médio | Médio | ❌ Não |
| 🟡 **6** | Paginação e Lazy Loading | Médio | Baixo | ✅ Sim |
| 🟢 **7** | WebSocket para Real-time | Baixo | Alto | ✅ Sim |
| 🟢 **8** | Service Worker/PWA | Baixo | Médio | ❌ Nã

---

## 📊 Resumo de Prioridades

| Prioridade | Tarefa | Impacto | Esforço |
|-----------|--------|---------|---------|
| 🔴 **1** | OAuth2/JWT + Sessão Segura | CRÍTICO | Alto |
| 🔴 **2** | Resolver N+1 Queries | Alto | Médio |
| 🟠 **3** | Implementar Cache (Backend + Frontend) | Alto | Médio |
| 🟠 **4** | Testes Unitários e E2E | Alto | Alto |
| 🟡 **5** | WebSocket para Real-time | Médio | Alto |
| 🟡 **6** | Paginação e Lazy Loading | Médio | Baixo |
| 🟢 **7** | Service Worker/PWA | Baixo | Médio |
| 🟢 **8** | Monitoramento e Logs | Baixo | Baixo |

---

## 🚦 Ordem de Implementação Recomendada

### Fase 1: Segurança (1-2 semanas)
1. Implementar sistema de hash de senhas (BCrypt)
2. Criar endpoints de autenticação (/login, /refresh, /logout)
3. Implementar JWT Service
4. Configurar Spring Security
5. Atualizar Frontend (AuthService, Interceptor, Guards)
6. Testar fluxo completo de autenticação

### Fase 2: Performance - Backend (1 semana)
1. Identificar e resolver queries N+1
2. Implementar Spring Cache com Caffeine
3. Criar DTOs para evitar over-fetching
4. Adicionar índices no banco de dados

### Fase 3: Performance - Frontend (1 semana)
1. Implementar cache no frontend (RxJS + ShareReplay)
2. Otimizar Change Detection (OnPush)
3. Implementar paginação nas listas
4. Lazy loading de componentes

### Fase 4: Qualidade (2 semanas)
1. Escrever testes unitários (70%+ coverage)
2. Testes de integração
3. Testes E2E com Cypress/Playwright
4. Code review e refatoração

### Fase 5: Features Avançadas (opcional)
1. WebSocket para atualizações real-time
2. PWA com Service Workers
3. Internacionalização (i18n)
4. Analytics e monitoramento

---

## 📚 Recursos e Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [Angular Security Guide](https://angular.io/guide/security)
- [N+1 Query Problem](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem)
- [Caffeine Cache](https://github.com/ben-manes/caffeine)
- [RxJS ShareReplay](https://rxjs.dev/api/operators/shareReplay)

---

**Última atualização**: Janeiro 2026  
**Versão**: 1.0
