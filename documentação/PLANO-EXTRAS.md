# ⭐ Plano de Implementação — Funcionalidades Extras (Bônus)

> **Projeto:** TaskFlow | Dashboard Bancário  
> **Prioridade:** OPCIONAL — Diferenciais que elevam a nota  
> **Pré-requisito:** Todas as funcionalidades obrigatórias devem estar implementadas  
> **Estimativa Total:** 15-25 horas adicionais

---

## Sumário dos Bônus

| # | Funcionalidade | Complexidade | Impacto Visual | Estimativa |
|---|---|---|---|---|
| B1 | Tema Dark/Light com persistência | 🟢 Baixa | ⭐⭐⭐ | 1h |
| B2 | Gráficos financeiros | 🟡 Média | ⭐⭐⭐⭐⭐ | 4-5h |
| B3 | Filtros no extrato | 🟡 Média | ⭐⭐⭐⭐ | 2-3h |
| B4 | Exportação CSV | 🟡 Média | ⭐⭐⭐ | 2h |
| B5 | Cache localStorage | 🟢 Baixa | ⭐⭐ | 1-2h |
| B6 | Animações Angular | 🟡 Média | ⭐⭐⭐⭐ | 3-4h |
| B7 | Melhorias visuais avançadas | 🟡 Média | ⭐⭐⭐⭐⭐ | 3-4h |
| B8 | Testes unitários avançados | 🔴 Alta | ⭐⭐ | 4-5h |

---

## B1: Tema Dark/Light com Persistência no localStorage

### Estado Atual
O tema dark/light já funciona via `TemaService`, mas a preferência é perdida ao recarregar a página.

### Implementação

**Arquivo:** `core/services/tema.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly STORAGE_KEY = 'taskflow-theme';
  private _isDarkMode = false;

  get isDarkMode() { return this._isDarkMode; }

  toggleTema() {
    this._isDarkMode = !this._isDarkMode;
    this.aplicarTema();
    this.salvarPreferencia();
  }

  iniciarTema() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) {
      this._isDarkMode = saved === 'dark';
    } else {
      this._isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.aplicarTema();
  }

  private aplicarTema() {
    const html = document.querySelector('html');
    if (html) {
      this._isDarkMode 
        ? html.classList.add('my-app-dark')
        : html.classList.remove('my-app-dark');
    }
  }

  private salvarPreferencia() {
    localStorage.setItem(this.STORAGE_KEY, this._isDarkMode ? 'dark' : 'light');
  }
}
```

### Componentes PrimeNG
- Nenhum adicional necessário — já está integrado com Aura theme

---

## B2: Gráficos Financeiros

### Abordagem
Usar o componente `p-chart` do PrimeNG, que é um wrapper do Chart.js.

### Instalação
```bash
npm install chart.js
```

### 2.1 — Gráfico de Pizza: Receitas vs Despesas

**Componente:** `dashboard/components/grafico-resumo/grafico-resumo.component.ts`

```typescript
@Component({
  selector: 'app-grafico-resumo',
  standalone: true,
  imports: [ChartModule, AsyncPipe],
  template: `
    @if (dadosGrafico$ | async; as dados) {
      <p-chart type="doughnut" [data]="dados" [options]="opcoes" 
               [style]="{'width': '100%', 'max-width': '400px'}"></p-chart>
    }
  `
})
export class GraficoResumoComponent {
  private readonly stateService = inject(ContaStateService);

  dadosGrafico$ = this.stateService.resumoFinanceiro$.pipe(
    map(resumo => ({
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [resumo.totalReceitas, resumo.totalDespesas],
        backgroundColor: ['#10b981', '#f43f5e'],
        hoverBackgroundColor: ['#059669', '#e11d48']
      }]
    }))
  );

  opcoes = {
    plugins: {
      legend: { position: 'bottom' }
    },
    responsive: true,
    maintainAspectRatio: false
  };
}
```

### 2.2 — Gráfico de Barras: Transações por Período

**Componente:** `dashboard/components/grafico-mensal/grafico-mensal.component.ts`

```typescript
// Agrupa transações por semana/mês e exibe em barras empilhadas
dadosGrafico$ = this.stateService.transacoes$.pipe(
  map(transacoes => {
    const agrupado = this.agruparPorSemana(transacoes);
    return {
      labels: agrupado.map(g => g.label),
      datasets: [
        {
          label: 'Receitas',
          backgroundColor: '#10b981',
          data: agrupado.map(g => g.receitas)
        },
        {
          label: 'Despesas',
          backgroundColor: '#f43f5e',
          data: agrupado.map(g => g.despesas)
        }
      ]
    };
  })
);
```

### 2.3 — Gráfico de Linha: Evolução do Saldo

```typescript
// Calcula saldo acumulado ao longo do tempo
type = 'line';
```

### Layout no Dashboard

```html
<div class="grid">
  <!-- Cards existentes (3 cols) -->
  
  <!-- Gráfico Receitas vs Despesas -->
  <div class="col-12 md:col-6">
    <p-card header="Distribuição">
      <app-grafico-resumo></app-grafico-resumo>
    </p-card>
  </div>
  
  <!-- Gráfico evolução mensal -->
  <div class="col-12 md:col-6">
    <p-card header="Movimentação Semanal">
      <app-grafico-mensal></app-grafico-mensal>
    </p-card>
  </div>
</div>
```

### Componente PrimeNG
| Componente | Uso |
|---|---|
| `p-chart` | Todos os gráficos (doughnut, bar, line) |
| `ChartModule` | Import necessário |

---

## B3: Filtros no Extrato

### 3.1 — Filtros disponíveis

| Filtro | Tipo | Componente PrimeNG |
|---|---|---|
| Período (de/até) | DateRange | `p-datepicker` com `selectionMode="range"` |
| Tipo (Receita/Despesa) | SelectButton | `p-selectButton` |
| Busca por descrição | Text | `p-iconField` + `p-inputIcon` |
| Valor mínimo/máximo | Number | `p-inputNumber` |

### 3.2 — Componente de Filtro

**Arquivo:** `transactions/components/filtro-transacoes/filtro-transacoes.component.ts`

```typescript
@Component({
  selector: 'app-filtro-transacoes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    SelectButtonModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule
  ]
})
export class FiltroTransacoesComponent {
  filtrosAlterados = output<FiltroTransacao>();

  formFiltro = new FormGroup({
    periodo: new FormControl<Date[] | null>(null),
    tipo: new FormControl<TipoTransacao | null>(null),
    busca: new FormControl(''),
    valorMin: new FormControl<number | null>(null),
    valorMax: new FormControl<number | null>(null)
  });

  tiposTransacao = [
    { label: 'Todas', value: null },
    { label: 'Entradas', value: TipoTransacao.RECEITA },
    { label: 'Saídas', value: TipoTransacao.DESPESA }
  ];

  aplicarFiltros() {
    this.filtrosAlterados.emit(this.formFiltro.getRawValue());
  }

  limparFiltros() {
    this.formFiltro.reset();
    this.filtrosAlterados.emit(this.formFiltro.getRawValue());
  }
}
```

### 3.3 — Template de Filtros

```html
<div class="surface-card p-4 border-round-xl shadow-1 mb-4">
  <div class="flex flex-column md:flex-row gap-3 align-items-end">
    <!-- Busca -->
    <p-iconField>
      <p-inputIcon styleClass="pi pi-search"></p-inputIcon>
      <input pInputText formControlName="busca" placeholder="Buscar..." />
    </p-iconField>

    <!-- Período -->
    <p-datepicker formControlName="periodo" selectionMode="range" 
                  placeholder="Período" [showIcon]="true"></p-datepicker>

    <!-- Tipo -->
    <p-selectButton [options]="tiposTransacao" formControlName="tipo"></p-selectButton>

    <!-- Ações -->
    <p-button label="Filtrar" icon="pi pi-filter" (click)="aplicarFiltros()"></p-button>
    <p-button label="Limpar" icon="pi pi-times" [outlined]="true" (click)="limparFiltros()"></p-button>
  </div>
</div>
```

### 3.4 — Lógica de filtragem (no Service)

```typescript
// transacao-filtro.service.ts
filtrarTransacoes(transacoes: Transacao[], filtro: FiltroTransacao): Transacao[] {
  return transacoes.filter(t => {
    if (filtro.busca && !t.descricao.toLowerCase().includes(filtro.busca.toLowerCase())) return false;
    if (filtro.tipo && t.tipo !== filtro.tipo) return false;
    if (filtro.periodo?.[0] && new Date(t.data) < filtro.periodo[0]) return false;
    if (filtro.periodo?.[1] && new Date(t.data) > filtro.periodo[1]) return false;
    if (filtro.valorMin && Math.abs(t.valor) < filtro.valorMin) return false;
    if (filtro.valorMax && Math.abs(t.valor) > filtro.valorMax) return false;
    return true;
  });
}
```

---

## B4: Exportação CSV

### 4.1 — Service de Exportação

**Arquivo:** `shared/services/exportacao.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ExportacaoService {

  exportarTransacoesCSV(transacoes: Transacao[], nomeArquivo = 'extrato'): void {
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo'];
    const linhas = transacoes.map(t => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      `"${t.descricao}"`,
      t.valor.toFixed(2).replace('.', ','),
      t.tipo === TipoTransacao.RECEITA ? 'Entrada' : 'Saída'
    ]);

    const csv = [
      headers.join(';'),
      ...linhas.map(l => l.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

### 4.2 — Botão no extrato

```html
<p-button label="Exportar CSV" icon="pi pi-download" 
          [outlined]="true" size="small"
          (click)="exportarCSV()"></p-button>
```

### Componente PrimeNG
| Componente | Uso |
|---|---|
| `p-button` com `icon="pi pi-download"` | Botão de exportação |
| `p-toast` | Feedback "Exportação concluída" |

---

## B5: Cache com localStorage

### 5.1 — Service de Cache

**Arquivo:** `core/services/cache.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly PREFIX = 'taskflow_cache_';
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T): void {
    const item = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(this.PREFIX + key);
    if (!raw) return null;

    const item = JSON.parse(raw);
    if (Date.now() - item.timestamp > this.TTL) {
      this.remove(key);
      return null;
    }
    return item.data as T;
  }

  remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  invalidateAll(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
}
```

### 5.2 — Integração com ContaStateService

```typescript
carregarConta(): void {
  // Tentar cache primeiro
  const cached = this.cacheService.get<Conta>('conta');
  if (cached) {
    this.contaSubject.next(cached);
    return;
  }

  // Se não, buscar da API
  this.http.get(`${this.apiUrl}/account`).pipe(
    map(mapAccountToConta),
    tap(conta => this.cacheService.set('conta', conta))
  ).subscribe(conta => this.contaSubject.next(conta));
}
```

### 5.3 — Invalidação de cache

Ao criar transação ou transferência:
```typescript
this.cacheService.remove('conta');
this.cacheService.remove('transacoes');
```

---

## B6: Animações Angular

### 6.1 — Configuração

Já configurado em `app.config.ts`:
```typescript
provideAnimationsAsync()
```

### 6.2 — Animações por componente

**Transição de páginas (MainPanelComponent):**
```typescript
animations: [
  trigger('fadeSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
    ])
  ])
]
```

**Cards do Dashboard (entrada escalonada):**
```typescript
animations: [
  trigger('staggerCards', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        stagger('100ms', animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })))
      ], { optional: true })
    ])
  ])
]
```

**Toggle formulário de transação:**
```typescript
animations: [
  trigger('slideInOut', [
    transition(':enter', [
      style({ height: 0, opacity: 0 }),
      animate('250ms ease', style({ height: '*', opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease', style({ height: 0, opacity: 0 }))
    ])
  ])
]
```

**Hover em itens do menu (Sidebar):**
```typescript
animations: [
  trigger('menuItemHover', [
    state('inactive', style({ transform: 'translateX(0)' })),
    state('active', style({ transform: 'translateX(5px)' })),
    transition('inactive <=> active', animate('150ms ease'))
  ])
]
```

### 6.3 — Animações CSS adicionais

```css
/* Pulse animation para saldo */
@keyframes pulse-value {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.saldo-atualizado {
  animation: pulse-value 0.5s ease;
}

/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## B7: Melhorias Visuais Avançadas

### 7.1 — Avatar do usuário no Header

```html
<p-avatar label="IS" size="large" shape="circle" 
          [style]="{'background-color': 'var(--primary-color)', 'color': 'white'}"></p-avatar>
```

### 7.2 — Badges e indicadores

```html
<!-- Badge no menu de transações -->
<p-badge [value]="totalTransacoes$ | async" severity="info"></p-badge>
```

### 7.3 — Tooltip em ações

```html
<button pButton icon="pi pi-download" pTooltip="Exportar extrato" tooltipPosition="top"></button>
```

### 7.4 — Dialog de confirmação

```html
<p-confirmDialog></p-confirmDialog>
```

### 7.5 — Speed Dial para ações rápidas (mobile)

```html
<p-speeddial [model]="acoesRapidas" direction="up" 
             [style]="{'position': 'fixed', 'bottom': '2rem', 'right': '2rem'}"
             class="block md:hidden"></p-speeddial>
```

### 7.6 — Componentes PrimeNG Adicionais

| Componente | Uso |
|---|---|
| `p-avatar` | Foto/iniciais do usuário |
| `p-badge` | Contadores nos menus |
| `p-tooltip` | Dicas em botões |
| `p-confirmDialog` | Confirmação de ações críticas |
| `p-speedDial` | Ações rápidas em mobile |
| `p-progressSpinner` | Loading centralizado |
| `p-chip` | Tags de categorias |
| `p-timeline` | Histórico de ações (opcional) |
| `p-knob` | Indicador visual de meta/limite |
| `p-meter` | Barra de progresso do empréstimo |

---

## B8: Testes Unitários Avançados

### 8.1 — Cobertura alvo: 80%+

**Services — testes prioritários:**

```typescript
describe('ContaStateService', () => {
  describe('carregarConta', () => {
    it('deve fazer GET /account e mapear para Conta');
    it('deve emitir conta via BehaviorSubject');
    it('deve tratar erros HTTP');
  });

  describe('criarTransacao', () => {
    it('deve POST transação e atualizar saldo');
    it('deve adicionar transação à lista existente');
    it('deve calcular novo saldo corretamente para despesa');
    it('deve calcular novo saldo corretamente para receita');
  });

  describe('realizarTransferencia', () => {
    it('deve rejeitar se saldo insuficiente');
    it('deve POST transferência + transação');
    it('deve PATCH saldo na conta');
  });

  describe('resumoFinanceiro$', () => {
    it('deve calcular total de receitas');
    it('deve calcular total de despesas');
    it('deve contar total de transações');
  });
});

describe('EmprestimoService', () => {
  it('deve calcular parcela para taxa > 0 via Price');
  it('deve calcular parcela para taxa = 0 como divisão simples');
  it('deve calcular total a pagar');
  it('deve calcular custo efetivo como total - valor');
  it('deve retornar simulação completa');
});

describe('CacheService', () => {
  it('deve salvar e recuperar dados');
  it('deve retornar null para cache expirado');
  it('deve invalidar item específico');
  it('deve invalidar todos os itens');
});

describe('ExportacaoService', () => {
  it('deve gerar CSV com headers corretos');
  it('deve formatar valores em formato brasileiro');
  it('deve escapar descrições com caracteres especiais');
});
```

**Componentes — testes de integração:**

```typescript
describe('CreateTransactionComponent', () => {
  it('deve criar formulário com 4 campos');
  it('deve validar campo obrigatório');
  it('deve validar valor mínimo');
  it('deve desabilitar botão com form inválido');
  it('deve chamar service.criarTransacao ao submeter');
  it('deve exibir toast de sucesso');
});

describe('DashboardComponent', () => {
  it('deve exibir skeleton durante carregamento');
  it('deve exibir saldo formatado');
  it('deve exibir resumo financeiro');
});

describe('ListTransactionsComponent', () => {
  it('deve renderizar tabela com transações');
  it('deve aplicar cor verde para receitas');
  it('deve aplicar cor vermelha para despesas');
  it('deve aplicar filtros corretamente');
});
```

**Pipes:**

```typescript
describe('NegativeValuesPipe', () => {
  it('deve retornar text-success para valores positivos');
  it('deve retornar text-danger para valores negativos');
  it('deve retornar string vazia para zero');
  it('deve lidar com NaN');
  it('deve lidar com undefined');
});
```

### 8.2 — Mock strategy

```typescript
// Exemplo de mock de HttpClient
const httpMock = {
  get: jasmine.createSpy().and.returnValue(of(mockData)),
  post: jasmine.createSpy().and.returnValue(of(null)),
  patch: jasmine.createSpy().and.returnValue(of(null))
};

TestBed.configureTestingModule({
  providers: [
    ContaStateService,
    { provide: HttpClient, useValue: httpMock }
  ]
});
```

---

## Ordem de Implementação Recomendada

```
B1 (Persistência tema) ─── imediato (1h)
        │
B5 (Cache localStorage) ── simples (1-2h)
        │
B3 (Filtros no extrato) ── funcionalidade útil (2-3h)
        │
B4 (Exportação CSV) ────── funcionalidade útil (2h)
        │
B2 (Gráficos) ─────────── impacto visual alto (4-5h)
        │
B6 (Animações) ─────────── polimento (3-4h)
        │
B7 (Melhorias visuais) ─── polimento final (3-4h)
        │
B8 (Testes avançados) ──── cobertura (4-5h)
```

---

## Componentes PrimeNG — Resumo de Todos os Bônus

| Componente | Bônus | Import |
|---|---|---|
| `p-chart` | B2 Gráficos | `ChartModule` |
| `p-datepicker` (range) | B3 Filtros | `DatePickerModule` |
| `p-selectButton` | B3 Filtros | `SelectButtonModule` |
| `p-iconField` + `p-inputIcon` | B3 Filtros | `IconFieldModule`, `InputIconModule` |
| `p-avatar` | B7 Visual | `AvatarModule` |
| `p-badge` | B7 Visual | `BadgeModule` |
| `p-tooltip` | B7 Visual | `TooltipModule` |
| `p-confirmDialog` | B7 Visual | `ConfirmDialogModule` |
| `p-speedDial` | B7 Visual | `SpeedDialModule` |
| `p-chip` | B7 Visual | `ChipModule` |
| `p-timeline` | B7 Visual | `TimelineModule` |
| `p-knob` | B7 Visual | `KnobModule` |
| `p-meter` | B7 Visual | `MeterModule` |

---

*Plano de bônus criado em 23/02/2026 — Itens ordenados por impacto e complexidade.*
