# 🔧 Plano de Implementação — Requisitos Obrigatórios

> **Projeto:** TaskFlow | Dashboard Bancário  
> **Prioridade:** ALTA — Todos estes itens são avaliados e obrigatórios  
> **Estimativa Total:** 20-30 horas de desenvolvimento

---

## Sumário de Prioridades

| Fase | Descrição | Peso na Avaliação | Estimativa |
|---|---|---|---|
| **Fase 0** | Correções estruturais (modelos, serviços) | Arquitetura (25%) | 3-4h |
| **Fase 1** | Estado compartilhado centralizado | Estado (10%) + Arquitetura (25%) | 4-5h |
| **Fase 2** | Dashboard completo | Funcionalidades (20%) | 3-4h |
| **Fase 3** | Transferência bancária | Formulários (10%) + Funcionalidades (20%) | 4-5h |
| **Fase 4** | Refatorar simulador de empréstimo | Arquitetura (25%) | 2-3h |
| **Fase 5** | Async pipe e tratamento de erros | Consumo de API (10%) | 2-3h |
| **Fase 6** | Responsividade completa | UI (5%) | 2-3h |
| **Fase 7** | Testes unitários | Testes (5%) | 3-4h |

---

## Fase 0: Correções Estruturais (Fundação)

### 0.1 — Eliminar modelos duplicados EN/PT

**Problema:** Existem dois conjuntos de models (`Account`/`Conta`, `Transaction`/`Transacao`) e dois services equivalentes (`TransactionsService`/`TransacaoService`).

**Solução:** Padronizar tudo em **português** (alinhado ao contexto acadêmico brasileiro) e mapear dados da API.

**Ações:**

1. **Manter e atualizar** `Conta` como model principal:
   ```typescript
   // models/conta.model.ts
   export interface Conta {
     id: number;
     nome: string;
     saldo: number;
   }
   ```

2. **Criar mapper** para converter API → Model:
   ```typescript
   // mappers/conta.mapper.ts
   import { Conta } from '../models/conta.model';
   
   export function mapAccountToConta(apiData: any): Conta {
     return {
       id: apiData.id,
       nome: apiData.name,
       saldo: apiData.balance
     };
   }
   ```

3. **Manter** `Transacao` como model principal e criar mapper:
   ```typescript
   // mappers/transacao.mapper.ts
   export function mapTransactionToTransacao(apiData: any): Transacao {
     return {
       id: apiData.id,
       data: apiData.date,
       descricao: apiData.description,
       valor: apiData.amount,
       tipo: apiData.type === 'income' ? TipoTransacao.RECEITA : TipoTransacao.DESPESA
     };
   }
   
   export function mapTransacaoToTransaction(transacao: Transacao): any {
     return {
       date: transacao.data,
       description: transacao.descricao,
       amount: transacao.valor,
       type: transacao.tipo === TipoTransacao.RECEITA ? 'income' : 'expense'
     };
   }
   ```

4. **Remover** `Account`, `Transaction`, `TransactionTypes`, `TransactionsService` (versões EN)

5. **Atualizar** `TransacaoService` para usar mappers

**Arquivos afetados:**
- 🗑️ `models/account.model.ts`
- 🗑️ `models/transaction.model.ts`
- 🗑️ `constants/transaction-types.enum.ts`
- 🗑️ `services/transactions.service.ts`
- ✏️ `models/conta.model.ts`
- ✏️ `models/transacao.model.ts`
- ✏️ `services/transacao.service.ts` → renomear para service centralizado
- 🆕 `core/mappers/conta.mapper.ts`
- 🆕 `core/mappers/transacao.mapper.ts`

---

### 0.2 — Corrigir NegativeValuesPipe

**Problema:** Pipe existe mas não é `standalone` e não é usado.

**Solução:**
```typescript
@Pipe({ name: 'negativeValues', standalone: true })
export class NegativeValuesPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return '';
  }
}
```

**Usar no template** de `ListTransactionsComponent` para colorir valores.

---

### 0.3 — Utilizar o model MenuItem no Sidebar

**Solução:** Referenciar `MenuItem` na tipagem do `itensMenu` no `SidebarComponent`.

---

## Fase 1: Estado Compartilhado Centralizado

### 1.1 — Criar `ContaStateService` (Service com BehaviorSubject)

**Arquivo:** `core/services/conta-state.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ContaStateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  // Estado reativo
  private contaSubject = new BehaviorSubject<Conta | null>(null);
  private transacoesSubject = new BehaviorSubject<Transacao[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  readonly conta$ = this.contaSubject.asObservable();
  readonly transacoes$ = this.transacoesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  
  // Saldo derivado
  readonly saldo$ = this.conta$.pipe(
    map(conta => conta?.saldo ?? 0)
  );

  // Resumo financeiro derivado
  readonly resumoFinanceiro$ = this.transacoes$.pipe(
    map(transacoes => ({
      totalReceitas: transacoes.filter(t => t.valor > 0).reduce((sum, t) => sum + t.valor, 0),
      totalDespesas: transacoes.filter(t => t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0),
      totalTransacoes: transacoes.length
    }))
  );

  carregarConta(): void { /* GET /account → map → contaSubject.next() */ }
  carregarTransacoes(): void { /* GET /transactions → map → transacoesSubject.next() */ }
  
  criarTransacao(transacao: Transacao): Observable<void> {
    // POST /transactions
    // PATCH /account (atualizar saldo)
    // Recarregar conta e transações
  }
  
  realizarTransferencia(transferencia: Transferencia): Observable<void> {
    // Validar saldo suficiente
    // POST /transfers
    // POST /transactions (registrar como transação)
    // PATCH /account (atualizar saldo)
  }

  atualizarSaldo(novoSaldo: number): Observable<void> {
    // PATCH /account { balance: novoSaldo }
  }
}
```

### 1.2 — Componentes PrimeNG para feedback de estado

| Componente | Uso |
|---|---|
| `p-toast` | Notificações de sucesso/erro |
| `p-skeleton` | Loading state nos cards |
| `p-progressbar` | Indicador de carregamento |
| `p-message` | Mensagens de validação inline |

### 1.3 — Substituir services locais pelo state centralizado

**Ações:**
- `DashboardComponent` → injetar `ContaStateService`, usar `conta$` com `async pipe`
- `ListTransactionsComponent` → injetar `ContaStateService`, usar `transacoes$` com `async pipe`
- `CreateTransactionComponent` → injetar `ContaStateService`, chamar `criarTransacao()`
- Remover `DashboardService` (absorvido pelo state service)
- Remover `TransacaoService` (absorvido pelo state service)

---

## Fase 2: Dashboard Completo

### 2.1 — Cards informativos (resumo financeiro)

**Layout do Dashboard refatorado:**

```
┌─────────────────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Saldo   │ │ Receitas │ │ Despesas │        │
│  │ R$ xxx   │ │ R$ xxx   │ │ R$ xxx   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────────────────────────────────┐       │
│  │  Últimas Transações (5 mais recentes)│       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │  Mensagem de Boas-Vindas             │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

**Componentes PrimeNG:**

| Componente | Uso |
|---|---|
| `p-card` | Cards de saldo, receitas, despesas |
| `p-tag` | Indicadores de tipo |
| `p-skeleton` | Loading states |
| `p-panel` | Container das últimas transações |

### 2.2 — Template do Dashboard

```html
<div class="grid">
  <!-- Card Saldo -->
  <div class="col-12 md:col-4">
    @if (conta$ | async; as conta) {
      <p-card styleClass="shadow-2">
        <span class="text-4xl font-bold">{{ conta.saldo | currency:'BRL' }}</span>
      </p-card>
    } @else {
      <p-skeleton height="150px"></p-skeleton>
    }
  </div>
  
  <!-- Card Receitas -->
  <div class="col-12 md:col-4">
    @if (resumo$ | async; as resumo) {
      <p-card header="Receitas do Mês">
        <span class="text-3xl text-green-500">{{ resumo.totalReceitas | currency:'BRL' }}</span>
      </p-card>
    }
  </div>
  
  <!-- Card Despesas -->
  <div class="col-12 md:col-4">
    @if (resumo$ | async; as resumo) {
      <p-card header="Despesas do Mês">
        <span class="text-3xl text-red-500">{{ resumo.totalDespesas | currency:'BRL' }}</span>
      </p-card>
    }
  </div>
  
  <!-- Últimas Transações -->
  <div class="col-12">
    <p-panel header="Últimas Movimentações">
      <!-- Lista simples das 5 últimas transações -->
    </p-panel>
  </div>
</div>
```

### 2.3 — Dados devem vir do `ContaStateService`

```typescript
export class DashboardComponent implements OnInit {
  private readonly stateService = inject(ContaStateService);
  
  conta$ = this.stateService.conta$;
  saldo$ = this.stateService.saldo$;
  resumo$ = this.stateService.resumoFinanceiro$;
  ultimasTransacoes$ = this.stateService.transacoes$.pipe(
    map(t => t.slice(-5).reverse())
  );
  
  ngOnInit() {
    this.stateService.carregarConta();
    this.stateService.carregarTransacoes();
  }
}
```

---

## Fase 3: Transferência Bancária

### 3.1 — Criar model de Transferência

**Arquivo:** `models/transferencia.model.ts`

```typescript
export interface Transferencia {
  id?: string;
  contaDestino: string;
  valor: number;
  descricao: string;
  data: string;
}
```

### 3.2 — Criar página `TransferComponent`

**Arquivo:** `pages/transfer/transfer.component.ts`

**Formulário reativo com validações:**

```typescript
form = new FormGroup({
  contaDestino: new FormControl('', [
    Validators.required,
    Validators.minLength(4)
  ]),
  valor: new FormControl(null, [
    Validators.required,
    Validators.min(0.01),
    this.validarSaldo.bind(this)  // custom validator
  ]),
  descricao: new FormControl('', [Validators.required])
});

// Custom validator integrado ao estado
private validarSaldo(control: AbstractControl): ValidationErrors | null {
  const saldoAtual = this.stateService.getSaldoAtual();
  if (control.value && control.value > saldoAtual) {
    return { saldoInsuficiente: { saldoAtual, valorSolicitado: control.value } };
  }
  return null;
}
```

### 3.3 — Componentes PrimeNG para Transferência

| Componente | Uso |
|---|---|
| `p-inputText` | Campo conta destino |
| `p-inputNumber` | Campo valor (mode currency) |
| `p-textarea` | Campo descrição |
| `p-button` | Botão enviar |
| `p-message` | Validações inline |
| `p-toast` | Feedback de sucesso/erro |
| `p-confirmDialog` | Confirmação antes de transferir |

### 3.4 — Template da Transferência

```html
<p-card header="Transferência Bancária">
  <form [formGroup]="form" (ngSubmit)="enviar()">
    <!-- Saldo disponível -->
    <p-message severity="info">
      Saldo disponível: {{ saldo$ | async | currency:'BRL' }}
    </p-message>

    <!-- Conta Destino -->
    <div class="field">
      <label>Conta Destino</label>
      <input pInputText formControlName="contaDestino" />
      @if (form.get('contaDestino')?.errors?.['required'] && form.get('contaDestino')?.touched) {
        <small class="p-error">Conta destino é obrigatória</small>
      }
    </div>

    <!-- Valor -->
    <div class="field">
      <label>Valor</label>
      <p-inputNumber formControlName="valor" mode="currency" currency="BRL"></p-inputNumber>
      @if (form.get('valor')?.errors?.['saldoInsuficiente']) {
        <small class="p-error">Saldo insuficiente</small>
      }
    </div>

    <!-- Descrição -->
    <div class="field">
      <label>Descrição</label>
      <textarea pInputTextarea formControlName="descricao"></textarea>
    </div>

    <p-button label="Transferir" type="submit" [disabled]="form.invalid"></p-button>
  </form>
</p-card>
```

### 3.5 — Ao enviar transferência

1. Validar formulário
2. Confirmar via `p-confirmDialog`
3. Chamar `ContaStateService.realizarTransferencia()`
4. POST para `/transfers`
5. POST transação negativa para `/transactions`
6. PATCH saldo em `/account`
7. Atualizar estado reativo
8. Exibir `p-toast` de sucesso
9. Resetar formulário

### 3.6 — Adicionar ao menu e ao Pages enum

```typescript
// pages.enum.ts
export enum Pages {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  TRANSFER = 'transfer',      // NOVO
  LOAN = 'loan',
}
```

Adicionar item no `SidebarComponent`:
```typescript
{ label: 'Transferência', icon: 'pi pi-send', pagina: Pages.TRANSFER }
```

Adicionar `@else if` no `MainPanelComponent`:
```html
@else if ((pagina$ | async) === paginasEnum.TRANSFER) {
  <app-transfer></app-transfer>
}
```

---

## Fase 4: Refatorar Simulador de Empréstimo

### 4.1 — Criar `EmprestimoService`

**Arquivo:** `pages/loan/services/emprestimo.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class EmprestimoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  calcularParcela(valor: number, parcelas: number, taxaMensal: number): number {
    const i = taxaMensal / 100;
    if (i === 0) return valor / parcelas;
    return (valor * i * Math.pow(1 + i, parcelas)) / (Math.pow(1 + i, parcelas) - 1);
  }

  calcularTotal(valorParcela: number, parcelas: number): number {
    return valorParcela * parcelas;
  }

  calcularCustoEfetivo(total: number, valorSolicitado: number): number {
    return total - valorSolicitado;
  }

  simular(valor: number, parcelas: number, taxa: number): SimulacaoEmprestimo {
    const valorParcela = this.calcularParcela(valor, parcelas, taxa);
    const totalPagar = this.calcularTotal(valorParcela, parcelas);
    return {
      valorSolicitado: valor,
      parcelas,
      taxaMensal: taxa,
      valorParcela,
      totalPagar,
      custoEfetivo: totalPagar - valor
    };
  }

  salvarSimulacao(simulacao: SimulacaoEmprestimo): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/loans`, simulacao);
  }
}
```

### 4.2 — Mover para formulário reativo

**Converter** `LoanComponent` de `FormsModule` (ngModel) para `ReactiveFormsModule`:

```typescript
form = new FormGroup({
  valorSolicitado: new FormControl(5000, [Validators.required, Validators.min(1000), Validators.max(50000)]),
  parcelas: new FormControl(12, [Validators.required, Validators.min(1), Validators.max(48)]),
  taxaJurosMensal: new FormControl(2.5, [Validators.required, Validators.min(0.1)])
});

simulacao$ = this.form.valueChanges.pipe(
  startWith(this.form.value),
  map(v => this.emprestimoService.simular(v.valorSolicitado!, v.parcelas!, v.taxaJurosMensal!))
);
```

### 4.3 — Componentes PrimeNG adicionais

| Componente | Uso |
|---|---|
| `p-inputNumber` | Taxa de juros editável |
| `p-toast` | Feedback ao solicitar crédito |
| `p-dialog` | Resumo da simulação antes de confirmar |

---

## Fase 5: Async Pipe e Tratamento de Erros

### 5.1 — Converter todos os `subscribe()` para `async pipe`

**Antes (DashboardComponent):**
```typescript
ngOnInit() {
  this.service.obterConta().subscribe(res => this.conta = res);
}
// template: {{ conta?.saldo }}
```

**Depois:**
```typescript
conta$ = this.stateService.conta$;
// template: @if (conta$ | async; as conta) { {{ conta.saldo }} }
```

**Componentes a converter:**
- `DashboardComponent`
- `ListTransactionsComponent`

### 5.2 — Implementar Toast global para erros

**Em `AppComponent`:**
```html
<p-toast position="top-right"></p-toast>
```

**Injetar `MessageService` nos services para feedback:**
```typescript
this.messageService.add({
  severity: 'success',
  summary: 'Sucesso',
  detail: 'Transação criada com sucesso!'
});
```

### 5.3 — Implementar loading states

```html
@if (loading$ | async) {
  <p-skeleton width="100%" height="200px"></p-skeleton>
} @else {
  <!-- conteúdo real -->
}
```

---

## Fase 6: Responsividade Completa

### 6.1 — Sidebar colapsável

**Implementar toggle de sidebar:**

```typescript
// core/services/layout.service.ts
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private sidebarAberta = new BehaviorSubject<boolean>(true);
  readonly sidebarAberta$ = this.sidebarAberta.asObservable();
  
  toggleSidebar() { this.sidebarAberta.next(!this.sidebarAberta.value); }
  fecharSidebar() { this.sidebarAberta.next(false); }
}
```

**Componentes PrimeNG para responsividade:**

| Componente | Uso |
|---|---|
| `p-drawer` (antigo `p-sidebar`) | Sidebar como drawer em mobile |
| `p-button` (hamburger) | Botão para abrir/fechar no header |

### 6.2 — Media queries necessárias

```css
/* Mobile: sidebar como overlay */
@media (max-width: 767px) {
  app-sidebar { display: none; } /* ou usar p-drawer */
  .hamburger-button { display: block; }
}

/* Tablet: sidebar compacta (ícones) */
@media (min-width: 768px) and (max-width: 991px) {
  app-sidebar { width: 5rem; }
  .sidebar-label { display: none; }
}

/* Desktop: sidebar completa */
@media (min-width: 992px) {
  app-sidebar { width: 20rem; }
}
```

### 6.3 — Breakpoints de grid

Certificar que o grid do dashboard adapta:
- Mobile: `col-12` (1 coluna)
- Tablet: `md:col-6` (2 colunas)
- Desktop: `lg:col-4` (3 colunas)

---

## Fase 7: Testes Unitários

### 7.1 — Testes prioritários

**Services (maior valor):**

```typescript
// conta-state.service.spec.ts
describe('ContaStateService', () => {
  it('deve carregar conta da API e emitir via BehaviorSubject');
  it('deve carregar transações da API');
  it('deve criar transação e atualizar saldo');
  it('deve validar saldo antes de transferir');
  it('deve calcular resumo financeiro corretamente');
});

// emprestimo.service.spec.ts
describe('EmprestimoService', () => {
  it('deve calcular parcela via fórmula Price');
  it('deve retornar valor/parcelas quando taxa = 0');
  it('deve calcular total a pagar');
  it('deve calcular custo efetivo');
});
```

**Pipes:**

```typescript
// negative-values.pipe.spec.ts
describe('NegativeValuesPipe', () => {
  it('deve retornar text-success para valor positivo');
  it('deve retornar text-danger para valor negativo');
  it('deve retornar string vazia para zero');
});
```

**Componentes (testes de integração):**

```typescript
// create-transaction.component.spec.ts
describe('CreateTransactionComponent', () => {
  it('deve inicializar formulário com valores padrão');
  it('deve marcar formulário como inválido sem campos obrigatórios');
  it('deve rejeitar valor menor que 0.01');
  it('deve chamar service ao submeter formulário válido');
  it('deve resetar formulário após sucesso');
});
```

### 7.2 — Configuração de testes

Cada spec deve usar:
- `HttpClientTestingModule` para mock HTTP
- `of()` para mock de Observables
- `spyOn` para verificar chamadas de service

---

## Checklist Final de Validação

Após implementar todas as fases, verificar:

- [ ] Dashboard exibe saldo, receitas, despesas, últimas transações
- [ ] Dados do dashboard vêm do `ContaStateService` via `async pipe`
- [ ] Extrato lista transações com cores diferenciadas (verde/vermelho)
- [ ] Extrato usa `p-table` com paginação e ordenação
- [ ] Formulário de transação é reativo com validações
- [ ] Formulário de transferência valida saldo suficiente
- [ ] Transferência atualiza saldo global e registra transação
- [ ] Simulador de empréstimo usa `EmprestimoService` (não componente)
- [ ] Taxa de juros é editável no formulário
- [ ] Simulação pode ser salva na API
- [ ] Estado (saldo e transações) é compartilhado entre componentes
- [ ] `async pipe` é usado onde possível
- [ ] Toast de feedback para ações (sucesso/erro)
- [ ] Sidebar colapsa em mobile
- [ ] Grid adapta em desktop/tablet/mobile
- [ ] Testes unitários cobrem services e lógica
- [ ] Sem modelos/services duplicados
- [ ] Sem lógica de negócio em templates
- [ ] Sem lógica de cálculo em componentes
- [ ] Sem `console.log` em produção

---

*Plano criado em 23/02/2026 — Os itens seguem ordem de prioridade e dependência.*
