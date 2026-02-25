# 🏗️ Estratégia Completa de Implementação — Angular 21 + PrimeNG 21

> **Projeto:** TaskFlow | Dashboard Bancário  
> **MCP Servers:** Angular CLI MCP + PrimeNG MCP  
> **Baseado em:** https://angular.dev/ai/mcp + https://primeng.org/llms  
> **Data:** Fevereiro 2026

---

## Sumário

1. [Configuração dos MCP Servers](#1-configuração-dos-mcp-servers)
2. [Melhores Práticas Angular 21](#2-melhores-práticas-angular-21)
3. [Estratégia de Componentes PrimeNG 21](#3-estratégia-de-componentes-primeng-21)
4. [Mapa Completo de Componentes por Feature](#4-mapa-completo-de-componentes-por-feature)
5. [Arquitetura de Estado e Serviços](#5-arquitetura-de-estado-e-serviços)
6. [Estratégia de Formulários Reativos](#6-estratégia-de-formulários-reativos)
7. [Estratégia de Consumo de API](#7-estratégia-de-consumo-de-api)
8. [Estratégia de Responsividade](#8-estratégia-de-responsividade)
9. [Estratégia de Testes](#9-estratégia-de-testes)
10. [Checklist de Implementação Completa](#10-checklist-de-implementação-completa)

---

## 1. Configuração dos MCP Servers

### Arquivo de Configuração

**Localização:** `taskflow/mcp-config.json` (para VS Code: `.vscode/mcp.json`)

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    },
    "primeng": {
      "command": "npx",
      "args": ["-y", "@primeng/mcp"]
    }
  }
}
```

**Status:** ✅ Já configurado corretamente no projeto.

### Angular CLI MCP — Como Utilizar

O Angular CLI MCP fornece **ferramentas inteligentes** para desenvolvimento:

| Ferramenta | Quando usar | Exemplo |
|---|---|---|
| `get_best_practices` | Antes de iniciar qualquer implementação | Obter guia de melhores práticas |
| `find_examples` | Ao implementar features modernas do Angular | Exemplos de signals, control flow |
| `search_documentation` | Dúvidas sobre APIs específicas | Buscar docs do HttpClient |
| `list_projects` | Verificar configuração do workspace | Listar projetos no angular.json |
| `modernize` | Migrar código legado | Atualizar para nova sintaxe |
| `onpush_zoneless_migration` | Otimizar performance | Plano para OnPush/Zoneless |

**Ferramentas experimentais** (ativar com `--experimental-tool`):

```json
{
  "args": ["-y", "@angular/cli", "mcp", "--experimental-tool", "devserver", "test", "build"]
}
```

| Ferramenta | Descrição |
|---|---|
| `devserver.start` | Inicia `ng serve` assíncrono |
| `devserver.stop` | Para o dev server |
| `devserver.wait_for_build` | Aguarda build completar e retorna logs |
| `test` | Executa `ng test` |
| `build` | Executa `ng build` one-off |
| `modernize` | Migração automatizada de código |

### PrimeNG MCP — Como Utilizar

O PrimeNG MCP dá acesso direto à documentação de componentes:

| Recurso | URL | Uso |
|---|---|---|
| `llms.txt` | `https://primeng.org/llms/llms.txt` | Lista estruturada de todos os componentes |
| `llms-full.txt` | `https://primeng.org/llms/llms-full.txt` | Documentação completa em texto |
| Componente `.md` | `https://primeng.org/llms/components/{nome}.md` | Docs de um componente específico |

**Exemplos de consulta:**
- `https://primeng.org/llms/components/table.md` — Documentação do Table
- `https://primeng.org/llms/components/chart.md` — Documentação do Chart
- `https://primeng.org/llms/components/toast.md` — Documentação do Toast
- `https://primeng.org/llms/components/drawer.md` — Documentação do Drawer

---

## 2. Melhores Práticas Angular 21

Baseado no `get_best_practices` do Angular CLI MCP e na documentação oficial:

### 2.1 — Standalone Components (Padrão)

```typescript
// ✅ CORRETO — Angular 21
@Component({
  selector: 'app-dashboard',
  standalone: true,  // padrão no Angular 21, pode omitir
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard.component.html'
})
```

> **Nota:** No Angular 21, todos os componentes são `standalone` por padrão. A propriedade pode ser omitida.

### 2.2 — Modern Control Flow (@if, @for, @switch)

```html
<!-- ✅ CORRETO — Nova sintaxe -->
@if (conta$ | async; as conta) {
  <p-card>{{ conta.saldo | currency:'BRL' }}</p-card>
} @else {
  <p-skeleton height="200px"></p-skeleton>
}

@for (item of transacoes$ | async; track item.id) {
  <tr>{{ item.descricao }}</tr>
} @empty {
  <tr>Nenhuma transação encontrada</tr>
}

@switch (paginaAtual) {
  @case (Pages.DASHBOARD) { <app-dashboard /> }
  @case (Pages.TRANSACTIONS) { <app-transactions /> }
  @default { <span>Página não encontrada</span> }
}
```

> **Status no projeto:** ✅ Já usa `@if`/`@for`. Pode migrar `MainPanelComponent` para `@switch`.

### 2.3 — Signals (Angular 21)

```typescript
// ✅ Usar signals para estado local reativo
export class DashboardComponent {
  private readonly stateService = inject(ContaStateService);
  
  // Computed signals derivados
  saldoFormatado = computed(() => 
    this.stateService.saldo().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );
}
```

> **Nota:** O projeto pode migrar gradualmente de `BehaviorSubject` para `signal()` onde faz sentido.

### 2.4 — Typed Reactive Forms

```typescript
// ✅ Formulários tipados (Angular 14+)
interface TransacaoForm {
  data: FormControl<Date>;
  descricao: FormControl<string>;
  valor: FormControl<number | null>;
  tipo: FormControl<TipoTransacao>;
}

form = new FormGroup<TransacaoForm>({
  data: new FormControl(new Date(), { nonNullable: true, validators: [Validators.required] }),
  descricao: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  valor: new FormControl(null, [Validators.required, Validators.min(0.01)]),
  tipo: new FormControl(TipoTransacao.RECEITA, { nonNullable: true })
});
```

### 2.5 — Inject Function (não Constructor)

```typescript
// ✅ CORRETO — Angular 14+
export class DashboardComponent {
  private readonly stateService = inject(ContaStateService);
  private readonly messageService = inject(MessageService);
}

// ❌ EVITAR
constructor(private stateService: ContaStateService) {}
```

> **Status no projeto:** ✅ Já usa `inject()` consistentemente.

### 2.6 — Outputs Modernos

```typescript
// ✅ Angular 21 — output function
import { output } from '@angular/core';

export class FiltroComponent {
  filtrosAlterados = output<FiltroTransacao>();
  
  aplicar() {
    this.filtrosAlterados.emit(this.filtros);
  }
}
```

### 2.7 — Lazy Loading sem Router

Como o projeto é SPA sem Router, usar `@defer` para lazy loading condicional:

```html
@defer (when paginaAtual === Pages.LOAN) {
  <app-loan />
} @placeholder {
  <p-skeleton height="400px"></p-skeleton>
} @loading {
  <p-progressSpinner></p-progressSpinner>
}
```

---

## 3. Estratégia de Componentes PrimeNG 21

### 3.1 — Tema Configurado: Aura

```typescript
// app.config.ts
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.my-app-dark'
    }
  }
})
```

O tema **Aura** é o tema padrão moderno do PrimeNG 21, com suporte nativo a dark mode.

### 3.2 — Importação de Componentes (Angular 21 way)

PrimeNG 21 usa importação direta dos módulos nos `imports` do componente:

```typescript
@Component({
  imports: [
    // PrimeNG Components
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    // ...
  ]
})
```

> **Importante:** Cada componente importa **apenas** os módulos PrimeNG que utiliza. Não criar um "shared module" monolítico.

### 3.3 — Categorização dos Componentes PrimeNG Utilizados

#### Layout e Estrutura

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-card` | `CardModule` | Cards de saldo, receitas, despesas, empréstimo |
| `p-panel` | `PanelModule` | Containers de conteúdo colapsáveis |
| `p-divider` | `DividerModule` | Separadores visuais |
| `p-toolbar` | `ToolbarModule` | Barra de ações (filtros + botões) |
| `p-drawer` | `DrawerModule` | Sidebar mobile (overlay) |
| `p-fieldset` | `FieldsetModule` | Agrupamento de campos de formulário |

#### Formulários e Inputs

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-inputText` | `InputTextModule` | Campos de texto (descrição, conta destino) |
| `p-inputNumber` | `InputNumberModule` | Campos numéricos (valor, taxa) |
| `p-textarea` | `TextareaModule` | Campo de descrição longa |
| `p-datepicker` | `DatePickerModule` | Seletor de data |
| `p-selectButton` | `SelectButtonModule` | Toggle receita/despesa |
| `p-slider` | `SliderModule` | Sliders do simulador de empréstimo |
| `p-floatLabel` | `FloatLabelModule` | Labels flutuantes nos inputs |
| `p-iconField` | `IconFieldModule` | Campo de busca com ícone |
| `p-inputIcon` | `InputIconModule` | Ícone dentro do campo |

#### Dados e Tabelas

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-table` | `TableModule` | Listagem de transações (sort, paginate, filter) |
| `p-tag` | `TagModule` | Tags de tipo (Entrada/Saída) |
| `p-skeleton` | `SkeletonModule` | Placeholder de loading |
| `p-paginator` | `PaginatorModule` | Paginação (integrado ao p-table) |

#### Gráficos

| Componente | Import | Dependência |
|---|---|---|
| `p-chart` | `ChartModule` | `chart.js` (npm install) |

**Tipos de gráfico suportados:** line, bar, doughnut, pie, radar, polarArea

#### Feedback e Notificações

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-toast` | `ToastModule` | Notificações de sucesso/erro |
| `p-message` | `MessageModule` | Mensagens inline (validação, info) |
| `p-confirmDialog` | `ConfirmDialogModule` | Confirmação de ações (transferência) |
| `p-progressSpinner` | `ProgressSpinnerModule` | Loading spinner centralizado |
| `p-progressBar` | `ProgressBarModule` | Barra de progresso |

#### Navegação e Ações

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-button` | `ButtonModule` | Botões em todo o projeto |
| `p-ripple` | `RippleModule` | Efeito ripple no menu |
| `p-tooltip` | `TooltipModule` | Dicas em botões |
| `p-speedDial` | `SpeedDialModule` | Ações rápidas (mobile) |

#### Visual e Identidade

| Componente | Import | Uso no Projeto |
|---|---|---|
| `p-avatar` | `AvatarModule` | Foto/iniciais do usuário |
| `p-badge` | `BadgeModule` | Contadores no menu |
| `p-chip` | `ChipModule` | Tags de categorias |
| `p-knob` | `KnobModule` | Indicador circular (empréstimo) |
| `p-meterGroup` | `MeterGroupModule` | Barras de progresso agrupadas |
| `p-timeline` | `TimelineModule` | Histórico de ações |

---

## 4. Mapa Completo de Componentes por Feature

### 4.1 — Shell (Layout Geral)

```
AppComponent
├── HeaderComponent
│   ├── p-button (tema, logout)
│   ├── p-avatar (usuário)
│   └── p-button (hamburger mobile) [NOVO]
├── SidebarComponent
│   ├── p-ripple (efeito nos itens)
│   ├── p-badge (contadores) [NOVO]
│   └── p-drawer (mobile overlay) [NOVO]
└── MainPanelComponent
    ├── p-toast (global) [NOVO]
    └── @switch (páginas)
```

**Componentes PrimeNG no Shell:**
- `ButtonModule`, `RippleModule`, `AvatarModule`, `BadgeModule`, `DrawerModule`, `ToastModule`

---

### 4.2 — Dashboard

```
DashboardComponent
├── CardSaldoComponent [NOVO]
│   ├── p-card
│   ├── p-skeleton (loading)
│   └── CurrencyPipe
├── CardReceitasComponent [NOVO]
│   ├── p-card
│   └── p-skeleton
├── CardDespesasComponent [NOVO]
│   ├── p-card
│   └── p-skeleton
├── GraficoResumoComponent [NOVO - BÔNUS]
│   └── p-chart (doughnut)
├── GraficoMensalComponent [NOVO - BÔNUS]
│   └── p-chart (bar)
└── UltimasTransacoesComponent [NOVO]
    ├── p-panel
    ├── p-tag
    └── DatePipe, CurrencyPipe
```

**Componentes PrimeNG no Dashboard:**
- `CardModule`, `SkeletonModule`, `PanelModule`, `TagModule`, `ChartModule`

**Dados:** Todos via `ContaStateService` com `async pipe`

---

### 4.3 — Transações (Extrato)

```
TransactionsComponent
├── FiltroTransacoesComponent [NOVO - BÔNUS]
│   ├── p-iconField + p-inputIcon (busca)
│   ├── p-datepicker (período range)
│   ├── p-selectButton (tipo)
│   └── p-button (filtrar, limpar)
├── ListTransactionsComponent
│   ├── p-table (sort, paginate, filter)
│   ├── p-tag (tipo)
│   ├── NegativeValuesPipe [ATIVAR]
│   ├── p-button (exportar CSV) [NOVO - BÔNUS]
│   ├── DatePipe, CurrencyPipe
│   └── p-skeleton (loading)
└── CreateTransactionComponent
    ├── p-datepicker
    ├── p-inputText (pInputText)
    ├── p-inputNumber
    ├── p-selectButton
    ├── p-button
    ├── p-message (validações inline) [NOVO]
    └── ReactiveFormsModule
```

**Componentes PrimeNG nas Transações:**
- `TableModule`, `TagModule`, `DatePickerModule`, `InputTextModule`, `InputNumberModule`, `SelectButtonModule`, `ButtonModule`, `MessageModule`, `SkeletonModule`, `IconFieldModule`, `InputIconModule`

---

### 4.4 — Transferência [NOVA FEATURE]

```
TransferComponent [NOVO]
├── p-card (container)
├── p-message (saldo disponível)
├── p-inputText (conta destino)
├── p-inputNumber (valor)
├── p-textarea (descrição)
├── p-button (transferir)
├── p-confirmDialog (confirmação)
├── p-message (validações inline)
├── p-toast (feedback)
└── ReactiveFormsModule
```

**Componentes PrimeNG na Transferência:**
- `CardModule`, `MessageModule`, `InputTextModule`, `InputNumberModule`, `TextareaModule`, `ButtonModule`, `ConfirmDialogModule`, `ToastModule`

---

### 4.5 — Simulador de Empréstimo (Refatorado)

```
LoanComponent (refatorado)
├── p-card (container)
├── p-inputNumber (valor + taxa editável) [ATUALIZAR]
├── p-slider (valor + parcelas)
├── p-divider
├── p-button (solicitar, PDF)
├── p-message (resultado) [NOVO]
├── p-dialog (resumo antes de confirmar) [NOVO]
├── p-knob (indicador visual) [BÔNUS]
├── ReactiveFormsModule [MIGRAR de FormsModule]
└── EmprestimoService [NOVO]
```

**Componentes PrimeNG no Empréstimo:**
- `CardModule`, `InputNumberModule`, `SliderModule`, `DividerModule`, `ButtonModule`, `MessageModule`, `DialogModule`, `KnobModule`

---

## 5. Arquitetura de Estado e Serviços

### 5.1 — Diagrama de Serviços

```
┌─────────────────────────────────────────────────┐
│                  Core Services                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ RouterService│  │  TemaService │             │
│  │ (navegação)  │  │ (dark/light) │             │
│  └──────────────┘  └──────────────┘             │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │       ContaStateService              │       │
│  │  ┌─ conta$ (BehaviorSubject)         │       │
│  │  ├─ transacoes$ (BehaviorSubject)    │       │
│  │  ├─ loading$ (BehaviorSubject)       │       │
│  │  ├─ saldo$ (derivado)               │       │
│  │  ├─ resumoFinanceiro$ (derivado)     │       │
│  │  ├─ carregarConta()                  │       │
│  │  ├─ carregarTransacoes()             │       │
│  │  ├─ criarTransacao()                 │       │
│  │  └─ realizarTransferencia()          │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │       EmprestimoService              │       │
│  │  ├─ calcularParcela()                │       │
│  │  ├─ calcularTotal()                  │       │
│  │  ├─ simular()                        │       │
│  │  └─ salvarSimulacao()                │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ CacheService │  │ ExportService│             │
│  │ (localStorage)│ │ (CSV export) │             │
│  └──────────────┘  └──────────────┘             │
│                                                  │
│  ┌──────────────┐                               │
│  │ LayoutService│                               │
│  │ (sidebar)    │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

### 5.2 — Fluxo de Dados

```
API (json-server)
    │
    ▼ HttpClient (GET/POST/PATCH)
    │
ContaStateService
    │
    ├──▶ conta$ ──────────▶ DashboardComponent (async pipe)
    │                       HeaderComponent (nome usuário)
    │
    ├──▶ transacoes$ ─────▶ ListTransactionsComponent (async pipe)
    │                       DashboardComponent (últimas 5)
    │                       GraficoComponent (dados do chart)
    │
    ├──▶ saldo$ ──────────▶ TransferComponent (validação)
    │                       DashboardComponent (card saldo)
    │
    └──▶ resumoFinanceiro$ ▶ DashboardComponent (cards receita/despesa)
                             GraficoResumoComponent (doughnut chart)
```

### 5.3 — Padrão de Comunicação entre Componentes

| Tipo | Mecanismo | Exemplo |
|---|---|---|
| Pai → Filho | `@Input()` / `input()` | `<app-card [saldo]="saldo$ \| async">` |
| Filho → Pai | `@Output()` / `output()` | `<app-filtro (filtrosAlterados)="aplicar($event)">` |
| Não-relacionados | Service com BehaviorSubject | `ContaStateService.conta$` |
| Global | Service + `async pipe` | Toast, Loading state |

---

## 6. Estratégia de Formulários Reativos

### 6.1 — Padrão de Implementação

Cada formulário deve seguir este padrão:

```typescript
@Component({
  imports: [ReactiveFormsModule, /* PrimeNG modules */]
})
export class FormComponent implements OnInit {
  private readonly stateService = inject(ContaStateService);
  private readonly messageService = inject(MessageService);

  // 1. Definição tipada do form
  form = new FormGroup({
    campo: new FormControl('', { 
      nonNullable: true, 
      validators: [Validators.required] 
    })
  });

  // 2. Submit handler
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Força exibição de erros
      return;
    }

    const payload = this.form.getRawValue();
    this.stateService.criarTransacao(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso!' });
        this.form.reset();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro!' });
      }
    });
  }

  // 3. Helper para validação no template
  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
```

### 6.2 — Template de validação padrão

```html
<div class="flex flex-column gap-2">
  <label for="valor" class="font-medium">Valor *</label>
  <p-inputNumber id="valor" formControlName="valor" 
                 mode="currency" currency="BRL"
                 [ngClass]="{'ng-invalid ng-dirty': isInvalid('valor')}">
  </p-inputNumber>
  
  @if (isInvalid('valor')) {
    @if (form.get('valor')?.errors?.['required']) {
      <small class="p-error">Valor é obrigatório</small>
    }
    @if (form.get('valor')?.errors?.['min']) {
      <small class="p-error">Valor deve ser maior que zero</small>
    }
    @if (form.get('valor')?.errors?.['saldoInsuficiente']) {
      <small class="p-error">Saldo insuficiente para esta operação</small>
    }
  }
</div>
```

### 6.3 — Validadores Customizados

```typescript
// shared/validators/saldo.validator.ts
export function saldoSuficienteValidator(
  stateService: ContaStateService
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    const saldoAtual = stateService.getSaldoAtual();
    
    if (valor && valor > saldoAtual) {
      return { 
        saldoInsuficiente: { 
          saldoAtual, 
          valorSolicitado: valor 
        } 
      };
    }
    return null;
  };
}
```

---

## 7. Estratégia de Consumo de API

### 7.1 — Padrão de Service HTTP

```typescript
@Injectable({ providedIn: 'root' })
export class ContaStateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  // Padrão: Observable com map para converter modelo
  carregarConta(): void {
    this.loadingSubject.next(true);
    
    this.http.get<any>(`${this.apiUrl}/account`).pipe(
      map(mapAccountToConta),        // Mapper EN → PT
      tap(conta => {
        this.contaSubject.next(conta);
        this.cacheService.set('conta', conta);
      }),
      catchError(err => {
        this.messageService.add({ severity: 'error', detail: 'Erro ao carregar conta' });
        return EMPTY;
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }
}
```

### 7.2 — Uso de async pipe no template

```html
<!-- ✅ CORRETO — async pipe gerencia subscribe/unsubscribe -->
@if (conta$ | async; as conta) {
  <span>{{ conta.saldo | currency:'BRL' }}</span>
} @else {
  <p-skeleton width="200px" height="40px"></p-skeleton>
}

<!-- ✅ Para listas -->
@for (t of transacoes$ | async; track t.id) {
  <tr>{{ t.descricao }}</tr>
} @empty {
  <tr>Nenhuma transação</tr>
}
```

### 7.3 — Mappers (API → Model)

```
API (inglês)          Mapper              Model (português)
─────────────        ───────              ─────────────────
name          →  mapAccountToConta  →  nome
balance       →                     →  saldo
date          →  mapToTransacao     →  data
description   →                     →  descricao
amount        →                     →  valor
type:"income" →                     →  tipo:RECEITA
```

### 7.4 — Endpoints e Operações

| Operação | Método | Endpoint | Body | Ações Adicionais |
|---|---|---|---|---|
| Carregar conta | GET | `/account` | — | map → emit |
| Carregar transações | GET | `/transactions` | — | map[] → emit |
| Criar transação | POST | `/transactions` | `{date,description,amount,type}` | + PATCH `/account` (saldo) |
| Transferência | POST | `/transfers` | `{contaDestino,valor,descricao}` | + POST `/transactions` + PATCH `/account` |
| Simulação crédito | POST | `/loans` | `{valor,parcelas,taxa,...}` | Apenas salvar |
| Atualizar saldo | PATCH | `/account` | `{balance: novoSaldo}` | — |

---

## 8. Estratégia de Responsividade

### 8.1 — Breakpoints

| Breakpoint | Nome | Uso |
|---|---|---|
| < 576px | **xs** (mobile) | Sidebar oculta, 1 coluna, hamburger menu |
| 576-767px | **sm** (mobile landscape) | Sidebar oculta, 1-2 colunas |
| 768-991px | **md** (tablet) | Sidebar overlay (drawer), 2 colunas |
| 992-1199px | **lg** (desktop) | Sidebar fixa compacta, 3 colunas |
| ≥ 1200px | **xl** (desktop large) | Sidebar fixa completa, 3-4 colunas |

### 8.2 — Sidebar Responsiva com PrimeNG Drawer

```typescript
// sidebar.component.ts
export class SidebarComponent {
  private readonly layoutService = inject(LayoutService);
  
  sidebarVisivel$ = this.layoutService.sidebarAberta$;
  isMobile = false;

  constructor() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile() {
    this.isMobile = window.innerWidth < 992;
    if (this.isMobile) {
      this.layoutService.fecharSidebar();
    }
  }
}
```

```html
<!-- Desktop: sidebar fixa -->
@if (!isMobile) {
  <aside class="sidebar-desktop">
    <ng-container *ngTemplateOutlet="menuContent"></ng-container>
  </aside>
}

<!-- Mobile: drawer overlay -->
@if (isMobile) {
  <p-drawer [(visible)]="sidebarVisivel" [modal]="true" position="left">
    <ng-container *ngTemplateOutlet="menuContent"></ng-container>
  </p-drawer>
}

<!-- Template reutilizado -->
<ng-template #menuContent>
  <ul>
    @for (item of itensMenu; track item.pagina) {
      <li (click)="irParaPagina(item.pagina)">
        <i [class]="item.icon"></i>
        <span>{{ item.label }}</span>
      </li>
    }
  </ul>
</ng-template>
```

### 8.3 — Grid Responsivo

```html
<div class="grid">
  <!-- Mobile: 1 col | Tablet: 2 col | Desktop: 3 col -->
  <div class="col-12 md:col-6 lg:col-4">
    <app-card-saldo></app-card-saldo>
  </div>
  <div class="col-12 md:col-6 lg:col-4">
    <app-card-receitas></app-card-receitas>
  </div>
  <div class="col-12 md:col-12 lg:col-4">
    <app-card-despesas></app-card-despesas>
  </div>
</div>
```

### 8.4 — Utilitários de Visibilidade

```css
/* Ocultar em mobile */
.hidden-mobile { display: block; }
@media (max-width: 767px) { .hidden-mobile { display: none; } }

/* Mostrar apenas em mobile */
.show-mobile { display: none; }
@media (max-width: 767px) { .show-mobile { display: block; } }
```

---

## 9. Estratégia de Testes

### 9.1 — Pirâmide de Testes

```
            ┌─────────┐
            │   E2E   │  ← Opcional (bônus)
            │ (poucos) │
            ├─────────┤
          ┌─┤Integração├─┐  ← Componentes com services mockados
          │ │  (médio)  │ │
          ├─┤───────────├─┤
        ┌─┤ │  Unitário │ ├─┐  ← Services, Pipes, Validators
        │ │ │  (muitos) │ │ │
        └─┴─┴───────────┴─┴─┘
```

### 9.2 — Configuração dos Testes

```typescript
// Padrão para testes de service com HTTP
describe('ContaStateService', () => {
  let service: ContaStateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContaStateService, MessageService]
    });
    service = TestBed.inject(ContaStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());
});
```

```typescript
// Padrão para testes de componente com PrimeNG
describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        // PrimeNG modules necessários
        CardModule,
        SkeletonModule
      ],
      providers: [
        { provide: ContaStateService, useValue: mockStateService }
      ]
    }).compileComponents();
  });
});
```

### 9.3 — O que testar por camada

| Camada | O que testar | Exemplo |
|---|---|---|
| **Service** | Lógica de negócio, cálculos, HTTP calls | `EmprestimoService.calcularParcela()` |
| **Pipe** | Transformação de dados | `NegativeValuesPipe.transform(100)` → `'text-success'` |
| **Validator** | Regras de validação | `saldoSuficienteValidator(5000)(control)` → `null` |
| **Component** | Renderização, interação | "Card exibe saldo formatado" |
| **Mapper** | Transformação de modelo | `mapAccountToConta({name:'X'})` → `{nome:'X'}` |

---

## 10. Checklist de Implementação Completa

### Requisitos Obrigatórios

#### Arquitetura e Organização (25%)
- [ ] Eliminar modelos e services duplicados (EN/PT)
- [ ] Criar mappers para conversão API ↔ Model
- [ ] Implementar `ContaStateService` centralizado
- [ ] Mover lógica de empréstimo para `EmprestimoService`
- [ ] Implementar `LayoutService` para responsividade
- [ ] Remover código morto (`Account`, `TransactionsService`, etc.)
- [ ] Usar `MenuItem` model no `SidebarComponent`
- [ ] Tornar `NegativeValuesPipe` standalone e usá-lo

#### Angular Components/Services/DI (25%)
- [ ] Todos os componentes standalone
- [ ] Todos usam `inject()` (não constructor)
- [ ] Modern control flow (`@if`, `@for`, `@switch`)
- [ ] Formulários tipados com `ReactiveFormsModule`
- [ ] Services com responsabilidade única
- [ ] `providedIn: 'root'` em todos os services globais

#### Funcionalidades (20%)
- [ ] Dashboard: saldo, receitas, despesas, cards informativos
- [ ] Extrato: listagem dinâmica com cores, pipes, paginação
- [ ] Transferência: formulário reativo com validação de saldo
- [ ] Empréstimo: cálculo em service, taxa editável

#### Formulários e Validações (10%)
- [ ] Transação: required, min value, tipo
- [ ] Transferência: required, saldo suficiente, conta válida
- [ ] Empréstimo: required, min/max values
- [ ] Mensagens de erro inline (`p-message`, `small.p-error`)
- [ ] `markAllAsTouched()` antes de exibir erros

#### Consumo de API e Estado (10%)
- [ ] `HttpClient` via `inject()`
- [ ] Observables com `async pipe` no template
- [ ] `BehaviorSubject` para estado compartilhado
- [ ] Mappers para conversão de dados
- [ ] Tratamento de erros com Toast
- [ ] Loading states com Skeleton

#### Responsividade/UI (5%)
- [ ] Sidebar colapsa em mobile (Drawer)
- [ ] Grid responsivo (1/2/3 colunas)
- [ ] Header adapta em mobile
- [ ] Hamburger menu em mobile
- [ ] Formulários full-width em mobile

#### Testes (5%)
- [ ] Services: testes de lógica e HTTP
- [ ] Pipes: testes de transformação
- [ ] Componentes: testes de renderização básica
- [ ] Mínimo 60% de cobertura

### Requisitos Bônus
- [ ] Tema dark/light com persistência localStorage
- [ ] Gráficos com `p-chart` (doughnut, bar)
- [ ] Filtros no extrato (período, tipo, busca)
- [ ] Exportação CSV
- [ ] Cache localStorage (TTL 5min)
- [ ] Animações Angular (fade, slide, stagger)
- [ ] Melhorias visuais (avatar, badges, tooltips, speedDial)
- [ ] Testes avançados (80%+ cobertura)

---

## Referências

| Recurso | URL |
|---|---|
| Angular CLI MCP | https://angular.dev/ai/mcp |
| Angular Best Practices | https://angular.dev/style-guide |
| Angular Signals | https://angular.dev/guide/signals |
| Angular Reactive Forms | https://angular.dev/guide/forms/reactive-forms |
| PrimeNG MCP Server | https://primeng.org/mcp |
| PrimeNG LLMs Documentation | https://primeng.org/llms |
| PrimeNG Table | https://primeng.org/table |
| PrimeNG Chart | https://primeng.org/chart |
| PrimeNG Toast | https://primeng.org/toast |
| PrimeNG Drawer | https://primeng.org/drawer |
| PrimeNG DatePicker | https://primeng.org/datepicker |
| PrimeNG InputNumber | https://primeng.org/inputnumber |
| PrimeNG Skeleton | https://primeng.org/skeleton |
| PrimeNG ConfirmDialog | https://primeng.org/confirmdialog |
| json-server Docs | https://github.com/typicode/json-server |

---

*Estratégia criada em 23/02/2026 — Baseada nos MCP servers Angular 21 e PrimeNG 21.*
