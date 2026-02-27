# ��� Documentação Completa — TaskFlow | Dashboard Bancário

> **Projeto:** Mini Banco Digital – Dashboard Financeiro  
> **Framework:** Angular 21 | PrimeNG 21  
> **Tipo:** SPA (Single Page Application) sem Angular Router  
> **Última atualização:** Fevereiro 2026

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura e Estrutura de Pastas](#2-arquitetura-e-estrutura-de-pastas)
3. [API (json-server)](#3-api-json-server)
4. [Componentes — Análise Detalhada](#4-componentes--análise-detalhada)
5. [Serviços (Services)](#5-serviços-services)
6. [Modelos (Models)](#6-modelos-models)
7. [Validadores Customizados](#7-validadores-customizados)
8. [Estado Compartilhado](#8-estado-compartilhado)
9. [Formulários e Validações](#9-formulários-e-validações)
10. [Consumo de API](#10-consumo-de-api)
11. [Tema Dark/Light](#11-tema-darklight)
12. [Pipes Customizados e Utils](#12-pipes-customizados-e-utils)
13. [Responsividade](#13-responsividade)
14. [Testes Unitários](#14-testes-unitários)
15. [Configuração MCP Servers](#15-configuração-mcp-servers)
16. [Como Executar o Projeto](#16-como-executar-o-projeto)

---

## 1. Visão Geral do Projeto

O TaskFlow é uma SPA Angular 21 que simula um dashboard de banco digital. A navegação entre telas ocorre via renderização condicional (`@if`), **sem uso do Angular Router** para navegação de páginas.

### Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| Angular | ^21.0.0 | Framework principal |
| PrimeNG | ^21.0.0 | Biblioteca de componentes UI |
| @primeng/themes (Aura) | ^21.0.4 | Tema visual |
| PrimeIcons | ^7.0.0 | Ícones |
| RxJS | ~7.8.0 | Programação reativa |
| jsPDF | ^3.x | Exportação de relatórios PDF |
| jspdf-autotable | ^3.x | Tabelas em PDF |
| json-server | ^1.0.0-beta.5 | API mock (backend fake) |
| TypeScript | ~5.9.2 | Linguagem |
| Karma + Jasmine | 6.4/5.6 | Testes unitários |

### Funcionalidades

| Funcionalidade | Status | Observação |
|---|---|---|
| Layout (Header + Sidebar + Main) | ✅ Implementado | Estrutura base completa |
| Navegação condicional (SPA) | ✅ Implementado | Via `RouterService` com `BehaviorSubject` |
| Dashboard — Saldo | ✅ Implementado | Exibe saldo e nome do titular |
| Listagem de transações | ✅ Implementado | `p-table` com paginação, edição inline e remoção |
| Criação de transações | ✅ Implementado | Formulário reativo com validação completa |
| Filtro de transações por período | ✅ Implementado | DatePicker com `selectionMode="range"` |
| Exportação PDF do extrato | ✅ Implementado | jsPDF + jspdf-autotable com cabeçalho e rodapé |
| Simulador de empréstimo | ✅ Implementado | Cálculo Price no service + ConfirmDialog + crédito de saldo |
| Cadastro de contas correntes | ✅ Implementado | CRUD completo com ToggleSwitch ativo/inativo |
| Transferência entre contas | ✅ Implementado | MessageService para conta inativa, sem débito |
| Estado compartilhado | ✅ Implementado | `BehaviorSubject` no `TransacaoService` |
| Dark/Light Mode | ✅ Implementado | Via `TemaService` + CSS variables |
| Mensagens (Toast) | ✅ Implementado | `MessageService` em todas as ações |

---

## 2. Arquitetura e Estrutura de Pastas

```
taskflow/src/app/
├── app.component.ts/html/css         # Shell principal (layout)
├── app.config.ts                     # Providers (HttpClient, MessageService, ConfirmationService)
├── constants/
│   └── pages.enum.ts                 # Enum das páginas: DASHBOARD, TRANSACTIONS, LOAN, CONTAS, TRANSFERENCIA
├── core/
│   └── services/
│       ├── router.service.ts         # Navegação interna (BehaviorSubject<Pages>)
│       └── tema.service.ts           # Toggle dark/light mode
├── header/
│   └── header.component.*
├── sidebar/
│   └── sidebar.component.*           # Usa obterItensMenu() de shared/utils
├── main-panel/
│   ├── main-panel.component.*        # Renderização condicional via @if
│   └── pages/
│       ├── dashboard/
│       │   ├── dashboard.component.*
│       │   ├── models/conta.model.ts
│       │   └── services/dashboard.service.ts (delega ao TransacaoService)
│       ├── transactions/
│       │   ├── transactions.component.*  (toggle formulário/lista)
│       │   ├── components/
│       │   │   ├── create-transaction/   (FormGroup reativo com validação completa)
│       │   │   └── list-transactions/    (tabela + filtro período + exportar PDF)
│       │   ├── models/transacao.model.ts  (RECEITA, DESPESA, TRANSFERENCIA)
│       │   └── services/transacao.service.ts  (BehaviorSubject, saldo, transferência)
│       ├── loan/
│       │   ├── loan.component.*           (ConfirmDialog + crédito saldo)
│       │   └── services/emprestimo.service.ts
│       ├── contas/
│       │   ├── contas.component.*         (CRUD contas correntes + ToggleSwitch)
│       │   ├── models/conta-corrente.model.ts
│       │   └── services/conta-corrente.service.ts
│       └── transferencia/
│           └── transferencia.component.*  (transferir entre contas, bloqueio se inativa)
└── shared/
    ├── pipes/
    │   └── negative-values.pipe.ts         (delega para formatacao.utils.ts)
    ├── utils/
    │   ├── formatacao.utils.ts             (corParaValorFinanceiro, formatarMoedaBrl, formatarDataBrl)
    │   ├── menu-items.utils.ts             (obterItensMenu → ItemMenu[])
    │   └── pdf.utils.ts                    (exportarTransacoesParaPdf)
    └── validators/
        └── validadores.ts                  (5 validadores customizados)
```

---

## 3. API (json-server)

### Configuração

- **Porta:** 3000  
- **Comando:** `npm run api` (executa `json-server --watch db.json --port 3000`)  
- **Arquivo:** `api/db.json`

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/conta` | Retorna dados da conta principal |
| PATCH | `/conta` | Atualiza saldo |
| GET | `/transacoes` | Lista transações (receitas, despesas, transferências) |
| POST | `/transacoes` | Cria nova transação |
| PUT | `/transacoes/:id` | Atualiza transação |
| DELETE | `/transacoes/:id` | Remove transação |
| GET | `/contas-correntes` | Lista contas correntes cadastradas |
| POST | `/contas-correntes` | Cria nova conta corrente |
| PUT | `/contas-correntes/:id` | Atualiza conta corrente |
| DELETE | `/contas-correntes/:id` | Remove conta corrente |
| GET | `/transferencias` | Lista transferências |
| GET | `/emprestimos` | Lista empréstimos |

### Estrutura de Dados (db.json)

```json
{
  "conta": { "id": 1, "nome": "Isaac Santana", "saldo": 14866.75 },
  "transacoes": [
    { "id": "1", "data": "...", "descricao": "Salário", "valor": 4500, "tipo": "receita" },
    { "id": "2", "data": "...", "descricao": "Netflix", "valor": -39.9, "tipo": "despesa" },
    { "id": "3", "data": "...", "descricao": "Transferência para Conta X", "valor": -500, "tipo": "transferencia", "contaDestinoId": "2" }
  ],
  "contas-correntes": [
    { "id": "1", "nome": "Conta Principal", "agencia": "0001", "numeroConta": "12345-6", "ativa": true },
    { "id": "2", "nome": "Conta Poupança", "agencia": "0001", "numeroConta": "98765-4", "ativa": true }
  ],
  "transferencias": [],
  "emprestimos": []
}
```

---

## 4. Componentes — Análise Detalhada

### 4.1 AppComponent
- Container principal (Header + Sidebar + Main)
- Inicializa tema via `TemaService.iniciarTema()`

### 4.2 SidebarComponent
- Itens de menu obtidos via `obterItensMenu()` de `shared/utils/menu-items.utils.ts`
- Páginas: **Painel Geral**, **Minhas Transações**, **Transferências**, **Empréstimos**, **Contas Correntes**
- Indicação visual da página ativa via `ngClass`

### 4.3 MainPanelComponent
- Renderização condicional via `@if` / `@else if`
- Importa e renderiza: `DashboardComponent`, `TransactionsComponent`, `LoanComponent`, `ContasComponent`, `TransferenciaComponent`

### 4.4 DashboardComponent
- Exibe saldo e nome do titular carregados via `DashboardService` → `TransacaoService`
- Saldo atualizado reativamente via `conta$ | async`

### 4.5 TransactionsComponent
- Toggle entre `CreateTransactionComponent` (formulário) e `ListTransactionsComponent` (tabela)

### 4.6 CreateTransactionComponent
- Formulário reativo com 5 validadores (nativo + customizados)
- Campos: data, descrição (3-100 chars), valor (0,01–999.999,99), tipo
- Feedback inline com `<small>` após envio (`submetido = true` ativa `markAllAsTouched`)
- Usa `form.hasError()` para mensagens específicas por tipo de erro

### 4.7 ListTransactionsComponent
- Tabela paginada com edição inline por linha
- **Filtro por período** via `p-datepicker` com `selectionMode="range"`
- **Exportar PDF** via `exportarTransacoesParaPdf()` (respeita filtro ativo)
- Tag de tipo inclui **Entrada**, **Saída** e **Transferência** (com severidade `info`)

### 4.8 LoanComponent
- Sliders para valor (R$1.000–R$50.000) e parcelas (1–48)
- Cálculo delegado ao `EmprestimoService` (fórmula de amortização Price)
- **`p-confirmDialog`** exibe resumo antes de contratar
- Após confirmação: `TransacaoService.atualizarSaldo()` **credita o valor no saldo**
- Estado `emprestimoConcluido` exibe banner de sucesso após contratação

### 4.9 ContasComponent
- CRUD completo de contas correntes (`ContaCorrenteService`)
- Formulário com validação completa (nome 3-60 chars, agência, número da conta)
- Cards com **`p-toggleswitch`** para ativar/desativar cada conta
- Confirmação de remoção via `p-confirmDialog`

### 4.10 TransferenciaComponent
- Selects de conta origem e destino (lista de `ContaCorrenteService`)
- Conta destino inativa: exibe `p-message` de aviso e bloqueia o envio via `MessageService`
- Chama `TransacaoService.realizarTransferencia()` que registra o lançamento como `TipoTransacao.TRANSFERENCIA`
- Estado `transferenciaRealizada` exibe confirmação de sucesso

---

## 5. Serviços (Services)

### RouterService (`core/services/`)
```typescript
// Navegação SPA sem Router
private currentPage$ = new BehaviorSubject<Pages>(Pages.DASHBOARD);
setCurrentPage(pagina: Pages): void
getCurrentPage(): Observable<Pages>
```

### TemaService (`core/services/`)
```typescript
toggleTema(): void          // alterna dark/light
iniciarTema(): void         // detecta prefers-color-scheme
```

### TransacaoService (`transactions/services/`)
Estado centralizado principal da aplicação:
```typescript
// Estado reativo
transacoes$: Observable<Transacao[]>   // BehaviorSubject
conta$: Observable<Conta | null>       // BehaviorSubject

// Operações
obterConta(): Observable<Conta>
atualizarSaldo(novoSaldo: number): Observable<Conta>
obterTransacoes(): Observable<Transacao[]>
criarTransacao(t: Transacao): Observable<Transacao>   // atualiza saldo automaticamente
atualizarTransacao(t: Transacao): Observable<Transacao>
removerTransacao(id): Observable<void>
realizarTransferencia(origem, destino, descricao, valor): Observable<Transacao>
```

### DashboardService (`dashboard/services/`)
Thin wrapper que delega ao `TransacaoService`:
```typescript
obterConta(): Observable<Conta>
get conta$(): Observable<Conta | null>
```

### EmprestimoService (`loan/services/`)
```typescript
calcularValorParcela(valor, parcelas, taxa): number  // Fórmula Price
calcularTotalPagar(parcela, parcelas): number
simular(...): SimulacaoEmprestimo                    // retorna objeto de resumo
```

### ContaCorrenteService (`contas/services/`)
```typescript
contas$: Observable<ContaCorrente[]>    // BehaviorSubject

obterContas(): Observable<ContaCorrente[]>
criarConta(c): Observable<ContaCorrente>
atualizarConta(c): Observable<ContaCorrente>
removerConta(id): Observable<void>
alternarAtivacao(c): Observable<ContaCorrente>   // toggle ativa/inativa
obterContasAtivas(): ContaCorrente[]             // método síncrono
```

---

## 6. Modelos (Models)

### Conta (`dashboard/models/conta.model.ts`)
```typescript
interface Conta { id: number; nome: string; saldo: number; }
```

### Transacao + TipoTransacao (`transactions/models/transacao.model.ts`)
```typescript
enum TipoTransacao { RECEITA = 'receita', DESPESA = 'despesa', TRANSFERENCIA = 'transferencia' }

interface Transacao {
  id?: number | string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  contaDestinoId?: number | string;  // presente em transferências
}
```

### ContaCorrente (`contas/models/conta-corrente.model.ts`)
```typescript
interface ContaCorrente {
  id?: number | string;
  nome: string;
  agencia: string;
  numeroConta: string;
  ativa: boolean;
}
```

### SimulacaoEmprestimo (`loan/services/emprestimo.service.ts`)
```typescript
interface SimulacaoEmprestimo {
  valorSolicitado: number;
  parcelas: number;
  taxaJurosMensal: number;
  valorParcela: number;
  totalPagar: number;
  custoEfetivo: number;
}
```

---

## 7. Validadores Customizados

Arquivo: `shared/validators/validadores.ts`

Cinco validadores reutilizáveis com fins didáticos — fáceis de entender e replicar:

| Validador | Erro | Descrição |
|---|---|---|
| `valorPositivoValidator()` | `valorNaoPositivo` | Valor deve ser > 0 |
| `semEspacoEmBrancoValidator()` | `apenasEspacos` | Não pode ser só espaços |
| `dataNaoFuturaValidator()` | `dataFutura` | Data não pode ser futura |
| `valorMaximoValidator(max)` | `valorExcedeLimite` | Fábrica: define limite máximo customizável |
| `naoApenasNumerosValidator()` | `apenasNumeros` | Texto não pode ser só dígitos |

### Uso no template com `form.hasError()`:
```html
@if (campo('descricao').hasError('minlength')) {
  <small class="text-red-500">
    Mínimo de {{ campo('descricao').getError('minlength').requiredLength }} caracteres.
  </small>
}
```

---

## 8. Estado Compartilhado

### Diagrama de Fluxo

```
DashboardComponent ──────────────────────────────┐
                                                  ↓
ContasComponent ──────────────────────────────────→ ContaCorrenteService
                                                  ↑       ↓ contas$
TransferenciaComponent ──→ TransacaoService ──────┘       ↕ BehaviorSubject
                                ↕                         
LoanComponent ──────────── conta$ / transacoes$          
                           (BehaviorSubject)              
CreateTransactionComponent ────────────────────────→ TransacaoService.criarTransacao()
                                                         → atualizarSaldo() automático
```

### `TransacaoService` como hub central:
- `transacoesSubject` (BehaviorSubject) — lista reativa de transações
- `contaSubject` (BehaviorSubject) — conta com saldo reativo
- Ao criar transação → atualiza lista **e** saldo automaticamente
- Ao contratar empréstimo → credita saldo via `atualizarSaldo()`
- Ao transferir → verifica conta ativa → debita saldo + registra transação

---

## 9. Formulários e Validações

### Campos e Regras

| Componente | Campo | Validators | Erros exibidos |
|---|---|---|---|
| CreateTransaction | data | required, dataNaoFutura | "obrigatória", "não pode ser futura" |
| CreateTransaction | descricao | required, min(3), max(100), semEspacos, naoApenasNumeros | Mensagens específicas por erro |
| CreateTransaction | valor | required, min(0.01), valorPositivo, valorMaximo(999999.99) | "obrigatório", "deve ser > 0", "exc. limite" |
| CreateTransaction | tipo | required | "selecione o tipo" |
| Contas | nome | required, min(3), max(60), semEspacos, naoApenasNumeros | Mensagens específicas |
| Contas | agencia | required, min(4), max(10) | "obrigatória", "entre 4-10 chars" |
| Contas | numeroConta | required, min(5), max(15) | "obrigatório", "entre 5-15 chars" |
| Transferencia | contaOrigemId | required | "selecione a origem" |
| Transferencia | contaDestinoId | required | "selecione o destino" |
| Transferencia | descricao | required, min(3), max(100), semEspacos | Mensagens específicas |
| Transferencia | valor | required, min(0.01), valorPositivo, valorMaximo(100000) | Mensagens específicas |

### Padrão de feedback de erros:
1. **`submetido = true`** ao clicar em enviar — ativa `markAllAsTouched()`
2. **`campoInvalido(nome)`** — helper que verifica `invalid && (dirty || touched || submetido)`
3. Tags `<small class="text-red-500">` com ícone `pi pi-exclamation-circle`
4. Tag `<small class="text-400">` com dica de preenchimento quando campo válido
5. `[ngClass]="{ 'ng-invalid ng-dirty': campoInvalido(...) }"` para borda vermelha nos inputs

---

## 10. Consumo de API

| Critério | Status | Observação |
|---|---|---|
| HttpClient configurado | ✅ | `provideHttpClient()` em `app.config.ts` |
| Observables + `tap` | ✅ | Todos os services usam `tap` para atualizar estado |
| `catchError` + MessageService | ✅ | Todos os erros exibem toast de erro |
| Estado reativo (BehaviorSubject) | ✅ | `transacoesSubject` e `contaSubject` centralizados |
| `async pipe` no Dashboard | ✅ | `conta$ | async` no template |
| Loading states | ❌ | Sem Skeleton/ProgressBar |
| Interceptors | ❌ | Sem interceptor HTTP |

---

## 11. Tema Dark/Light

- **Mecanismo:** Classe CSS `my-app-dark` no `<html>`
- **Detecção automática:** `prefers-color-scheme: dark` via `TemaService.iniciarTema()`
- **PrimeNG:** `darkModeSelector: '.my-app-dark'` no `providePrimeNG()`

### Tokens CSS (`styles.css`)

| Token | Light | Dark |
|---|---|---|
| `--surface-ground` | #f8fafc | #020617 |
| `--surface-card` | #ffffff | #1e293b |
| `--surface-border` | #e2e8f0 | #334155 |
| `--primary-color` | #3B82F6 | #3B82F6 |

> **Nota:** Preferência de tema não persiste entre sessões (localStorage não implementado).

---

## 12. Pipes Customizados e Utils

### Estrutura `shared/`

```
shared/
├── pipes/
│   └── negative-values.pipe.ts    (Angular Pipe standalone — delega para utils)
├── utils/
│   ├── formatacao.utils.ts        (funções puras de formatação)
│   ├── menu-items.utils.ts        (definição centralizada dos itens de menu)
│   └── pdf.utils.ts               (geração de relatório PDF com jsPDF)
└── validators/
    └── validadores.ts             (ValidatorFn customizados)
```

### `formatacao.utils.ts` (funções puras)
```typescript
corParaValorFinanceiro(valor: number): string    // CSS color string
formatarMoedaBrl(valor: number): string          // "R$ 1.500,00"
formatarDataBrl(dataIso: string): string         // "26/02/2026"
```

### `menu-items.utils.ts`
```typescript
interface ItemMenu { label: string; icon: string; pagina: Pages; }
obterItensMenu(): ItemMenu[]    // retorna todos os 5 itens de menu
```

### `pdf.utils.ts`
```typescript
interface ConfiguracaoRelatorio { titulo, subtitulo?, nomeArquivo, nomeTitular? }

exportarTransacoesParaPdf(
  transacoes: Transacao[],
  config: ConfiguracaoRelatorio,
  periodoInicio?: Date,
  periodoFim?: Date
): void   // gera e faz download do PDF
```
**Estrutura do PDF:** Cabeçalho dark, informações do relatório (titular, data, período, total), tabela com colunas Data/Descrição/Tipo/Valor (valores coloridos), rodapé com paginação.

### `NegativeValuesPipe`
```typescript
// Delega para corParaValorFinanceiro() de formatacao.utils.ts
transform(value: number): string   // retorna CSS color string para [style]
```
Usada no template: `[style]="transaction.valor | negativeValues"`

---

## 13. Responsividade

| Breakpoint | Implementação |
|---|---|
| Desktop (>992px) | ✅ Sidebar fixa + grid responsivo |
| Tablet (768-992px) | ⚠️ Grid ajusta, sidebar permanece |
| Mobile (<768px) | ❌ Sidebar não colapsa (sem hamburger menu) |

---

## 14. Testes Unitários

Estado atual: apenas boilerplate `should create` gerado pelo CLI.

Arquivos de spec presentes mas sem testes de lógica de negócio:
- `app.component.spec.ts`, `header.component.spec.ts`, `sidebar.component.spec.ts`
- `main-panel.component.spec.ts`, `dashboard.component.spec.ts`
- `dashboard.service.spec.ts`, `router.service.spec.ts`
- `list-transactions.component.spec.ts`, `create-transaction.component.spec.ts`
- `transactions.component.spec.ts`, `loan.component.spec.ts`
- `negative-values.pipe.spec.ts`

---

## 15. Configuração MCP Servers

### Arquivo: `taskflow/.vscode/mcp.json`

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

### Angular CLI MCP — Ferramentas

| Ferramenta | Uso |
|---|---|
| `get_best_practices` | Boas práticas Angular 21 |
| `find_examples` | Exemplos de código |
| `search_documentation` | Busca na docs oficial |
| `list_projects` | Lista projetos no workspace |

### PrimeNG MCP — Documentação

- `https://primeng.org/llms/llms.txt` — índice de componentes
- `https://primeng.org/llms/components/{nome}.md` — doc de um componente

---

## 16. Como Executar o Projeto

### Pré-requisitos
- Node.js 20+
- npm 10+

### Instalação e execução simultânea (recomendado)

```bash
cd taskflow
npm install
npm start     # inicia API (porta 3000) + Angular (porta 4200) simultaneamente
```

### Execução separada

```bash
# API
cd api && npm run api

# Angular (outro terminal)
cd taskflow && ng serve
```

### Acesso
- **Aplicação:** http://localhost:4200
- **API:** http://localhost:3000

---

*Documentação atualizada em 26/02/2026 — reflete implementações de validação de formulários, feature de empréstimo completa, cadastro de contas correntes, transferência entre contas, exportação PDF com filtro de período, e reorganização de utilitários.*
