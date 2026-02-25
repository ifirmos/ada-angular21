# 📋 Documentação Completa — TaskFlow | Dashboard Bancário

> **Projeto:** Mini Banco Digital – Dashboard Financeiro  
> **Framework:** Angular 21 | PrimeNG 21  
> **Tipo:** SPA (Single Page Application) sem Angular Router  
> **Data:** Fevereiro 2026

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura e Estrutura de Pastas](#2-arquitetura-e-estrutura-de-pastas)
3. [API (json-server)](#3-api-json-server)
4. [Análise Detalhada dos Componentes](#4-análise-detalhada-dos-componentes)
5. [Serviços (Services)](#5-serviços-services)
6. [Modelos (Models)](#6-modelos-models)
7. [Estado Compartilhado](#7-estado-compartilhado)
8. [Formulários e Validações](#8-formulários-e-validações)
9. [Consumo de API](#9-consumo-de-api)
10. [Tema Dark/Light](#10-tema-darklight)
11. [Pipes Customizados](#11-pipes-customizados)
12. [Responsividade](#12-responsividade)
13. [Testes Unitários](#13-testes-unitários)
14. [Configuração MCP Servers](#14-configuração-mcp-servers)
15. [Diagnóstico e Problemas Identificados](#15-diagnóstico-e-problemas-identificados)
16. [Como Executar o Projeto](#16-como-executar-o-projeto)

---

## 1. Visão Geral do Projeto

O TaskFlow é uma aplicação SPA Angular 21 que simula um dashboard de banco digital. A navegação entre telas ocorre via renderização condicional (`@if`, `@switch`), sem uso do Angular Router para navegação de páginas.

### Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| Angular | ^21.0.0 | Framework principal |
| PrimeNG | ^21.0.0 | Biblioteca de componentes UI |
| @primeng/themes (Aura) | ^21.0.4 | Tema visual |
| PrimeIcons | ^7.0.0 | Ícones |
| RxJS | ~7.8.0 | Programação reativa |
| json-server | ^1.0.0-beta.5 | API mock (backend fake) |
| TypeScript | ~5.9.2 | Linguagem |
| Karma + Jasmine | 6.4/5.6 | Testes unitários |

### Funcionalidades Atuais

| Funcionalidade | Status | Observação |
|---|---|---|
| Layout (Header + Sidebar + Main) | ✅ Implementado | Estrutura base completa |
| Navegação condicional (SPA) | ✅ Implementado | Via `RouterService` com `BehaviorSubject` |
| Dashboard — Saldo | ✅ Parcial | Exibe saldo, mas sem resumo financeiro completo |
| Listagem de transações | ✅ Implementado | `p-table` com paginação e ordenação |
| Criação de transações | ✅ Implementado | Formulário reativo com `ReactiveFormsModule` |
| Simulador de empréstimo | ✅ Parcial | Cálculo Price funcional, mas lógica no componente |
| Dark/Light Mode | ✅ Implementado | Via `TemaService` + CSS variables |
| Consumo de API | ✅ Parcial | HttpClient configurado, mas sem `async pipe` |
| Estado compartilhado | ❌ Ausente | Sem `BehaviorSubject` para saldo/transações |
| Transferência bancária | ❌ Ausente | Não existe formulário de transferência |
| Responsividade mobile | ❌ Parcial | Grid responsivo existe, sidebar não colapsa |
| Testes unitários | ❌ Apenas boilerplate | Só testes `should create` gerados automaticamente |

---

## 2. Arquitetura e Estrutura de Pastas

```
taskflow/src/app/
├── app.component.ts/html/css         # Shell principal (layout)
├── app.config.ts                      # Configuração da aplicação (providers)
├── constants/
│   └── pages.enum.ts                  # Enum das páginas do SPA
├── core/
│   └── services/
│       ├── router.service.ts          # Navegação interna (BehaviorSubject)
│       └── tema.service.ts            # Toggle dark/light mode
├── header/
│   └── header.component.*             # Cabeçalho com logo, tema e logout
├── sidebar/
│   └── sidebar.component.*            # Menu lateral de navegação
├── main-panel/
│   ├── main-panel.component.*         # Área de conteúdo com @if condicional
│   └── pages/
│       ├── dashboard/
│       │   ├── dashboard.component.*  # Painel com saldo
│       │   ├── models/
│       │   │   ├── account.model.ts   # Interface Account (EN)
│       │   │   └── conta.model.ts     # Interface Conta (PT) ⚠️ duplicata
│       │   └── services/
│       │       └── dashboard.service.ts
│       ├── transactions/
│       │   ├── transactions.component.*
│       │   ├── components/
│       │   │   ├── create-transaction/  # Formulário de criação
│       │   │   └── list-transactions/   # Tabela de listagem
│       │   ├── constants/
│       │   │   └── transaction-types.enum.ts
│       │   ├── models/
│       │   │   ├── transaction.model.ts   # Interface Transaction (EN)
│       │   │   └── transacao.model.ts     # Interface Transacao (PT) ⚠️ duplicata
│       │   └── services/
│       │       ├── transactions.service.ts   # Service (EN)
│       │       └── transacao.service.ts      # Service (PT) ⚠️ duplicata
│       └── loan/
│           └── loan.component.*       # Simulador de empréstimo
├── models/
│   └── menu-item.model.ts            # Interface MenuItem (não utilizada)
└── shared/
    └── pipes/
        └── negative-values.pipe.ts    # Pipe para valores negativos (não utilizado)
```

### Avaliação Arquitetural

| Critério | Nota | Comentário |
|---|---|---|
| Separação UI/Lógica | ⚠️ Parcial | Loan tem lógica no componente; Dashboard mistura |
| Uso de Services | ⚠️ Parcial | Existem services, mas sem compartilhamento de estado |
| Baixo Acoplamento | ✅ Bom | Componentes independentes |
| Componentes Coesos | ✅ Bom | Cada componente tem responsabilidade clara |
| Organização de Pastas | ✅ Bom | Estrutura features/core/shared presente |
| Código Duplicado | ❌ Alto | Modelos e services EN/PT duplicados |
| Lógica no Template | ⚠️ Parcial | Algumas expressões complexas no template |

---

## 3. API (json-server)

### Configuração

- **Porta:** 3000
- **Comando:** `npm run api` (executa `json-server --watch db.json --port 3000`)
- **Arquivo:** `api/db.json`

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/account` | Retorna dados da conta |
| GET | `/transactions` | Lista todas as transações |
| POST | `/transactions` | Cria nova transação |
| GET | `/transfers` | Lista transferências (vazio) |
| POST | `/transfers` | Cria transferência |
| GET | `/loans` | Lista empréstimos (vazio) |
| POST | `/loans` | Cria empréstimo |
| PATCH | `/account` | Atualiza dados da conta (saldo) |

### Estrutura de Dados

```json
{
  "account": {
    "id": 1,
    "name": "Isaac Santana",
    "balance": 5230.75
  },
  "transactions": [
    {
      "id": "1",
      "date": "2026-02-01T10:00:00",
      "description": "Salário",
      "amount": 4500,
      "type": "income"
    }
  ],
  "transfers": [],
  "loans": []
}
```

> ⚠️ **Problema Crítico:** A API retorna campos em inglês (`name`, `balance`), mas o model `Conta` espera campos em português (`nome`, `saldo`). Isso causa dados `undefined` na view.

---

## 4. Análise Detalhada dos Componentes

### 4.1 AppComponent (Shell)

- **Função:** Container principal da aplicação
- **Layout:** Flexbox vertical — Header no topo, Sidebar + MainPanel abaixo
- **Inicialização:** Chama `TemaService.iniciarTema()` no `ngOnInit`
- **Imports:** `HeaderComponent`, `SidebarComponent`, `MainPanelComponent`

### 4.2 HeaderComponent

- **PrimeNG:** `ButtonModule`
- **Funcionalidades:**
  - Logo TaskFlow com ícone pi-bolt
  - Saudação "Bem-vindo, Isaac" (hardcoded)
  - Botão toggle dark/light mode
  - Botão "Sair" (sem funcionalidade)
- **Injeção:** `TemaService`

### 4.3 SidebarComponent

- **PrimeNG:** `RippleModule`
- **Funcionalidades:**
  - 3 itens de menu: Painel Geral, Minhas Transações, Empréstimos
  - Indicação visual da página ativa via `ngClass`
  - Seção "Central de Ajuda" no rodapé
- **Injeção:** `RouterService`
- **Largura fixa:** 20rem (não colapsa em mobile)

### 4.4 MainPanelComponent

- **Função:** Renderização condicional das páginas
- **Navegação:** `@if` / `@else if` baseado em `pagina$ | async`
- **Páginas:** Dashboard, Transactions, Loan
- **Fallback:** Mensagem "Selecione uma opção" se nenhuma página ativa

### 4.5 DashboardComponent

- **PrimeNG:** `CardModule`, `PanelModule`
- **Funcionalidades:**
  - Card de saldo com gradiente azul
  - Exibe nome e saldo do titular
  - Mensagem de boas-vindas
- **Injeção:** `DashboardService`
- **Problema:** Usa `subscribe()` diretamente, sem `async pipe`

### 4.6 TransactionsComponent

- **Funcionalidades:**
  - Toggle entre formulário de criação e lista
  - Botão alterna entre "Nova Transação" e "Voltar para Lista"
- **Sub-componentes:**
  - `CreateTransactionComponent` — formulário reativo
  - `ListTransactionsComponent` — tabela PrimeNG

### 4.7 CreateTransactionComponent

- **PrimeNG:** `InputTextModule`, `InputNumberModule`, `SelectButtonModule`, `ButtonModule`, `DatePickerModule`
- **Formulário Reativo:** `FormGroup` com `FormControl`
- **Campos:** data, descricao, valor, tipo (RECEITA/DESPESA)
- **Validações:** `required`, `min(0.01)`
- **Problema:** NÃO valida saldo suficiente, não atualiza saldo global

### 4.8 ListTransactionsComponent

- **PrimeNG:** `TableModule`, `TagModule`
- **Funcionalidades:**
  - Tabela paginada (5 itens/página)
  - Colunas ordenáveis (data, descrição, valor)
  - Cores diferenciadas: verde para entrada, vermelho para saída
  - Tags de tipo (Entrada/Saída)
- **Problema:** Usa `first()` com `subscribe()`, não recarrega após nova transação

### 4.9 LoanComponent

- **PrimeNG:** `CardModule`, `SliderModule`, `InputNumberModule`, `ButtonModule`, `DividerModule`
- **Funcionalidades:**
  - Sliders para valor (R$1.000 a R$50.000) e parcelas (1 a 48)
  - Cálculo de parcela via fórmula Price
  - Exibe parcela estimada, total a pagar e custo efetivo
  - Botões "Solicitar Crédito" e "Baixar Proposta (PDF)" (sem ação real)
- **Problema CRÍTICO:** Toda lógica de cálculo está no componente via getters, deveria estar em um service

---

## 5. Serviços (Services)

### RouterService (`core/services/`)
```typescript
// Gerencia navegação SPA via BehaviorSubject
private currentPage$ = new BehaviorSubject<Pages>(Pages.TRANSACTIONS);
setCurrentPage(page) / getCurrentPage(): Observable<Pages>
```
- **Status:** ✅ Funcional e bem implementado

### TemaService (`core/services/`)
```typescript
// Toggle dark/light via classe CSS no <html>
toggleTema() → html.classList.add/remove('my-app-dark')
iniciarTema() → detecta preferência do sistema
```
- **Status:** ✅ Funcional, mas não usa `signal()` apesar de importar

### DashboardService (`dashboard/services/`)
```typescript
obterConta(): Observable<Conta> → GET /account
```
- **Status:** ⚠️ Funcional, mas model `Conta` não mapeia os campos da API

### TransacaoService (`transactions/services/`)
```typescript
obterTransacoes(): Observable<Transacao[]> → GET /transactions
criarTransacao(t: Transacao): Observable<void> → POST /transactions
```
- **Status:** ⚠️ Duplicado com `TransactionsService`

### TransactionsService (`transactions/services/`)
```typescript
getTransactions(): Observable<Transaction[]> → GET /transactions
createTransaction(t: Transaction): Observable<void> → POST /transactions
```
- **Status:** ⚠️ Duplicado com `TransacaoService`, `apiUrl` é `public`

---

## 6. Modelos (Models)

### Duplicações Identificadas

| Model PT | Model EN | Usado por |
|---|---|---|
| `Conta { id, nome, saldo }` | `Account { id, name, balance }` | Dashboard usa `Conta` |
| `Transacao { id, data, descricao, valor, tipo }` | `Transaction { id, date, description, amount, type }` | Create usa `Transacao`, List usa `Transacao` |
| `TipoTransacao { RECEITA, DESPESA }` | `TransactionTypes { income, expense }` | Create usa `TipoTransacao` |

> **Impacto:** A API retorna dados em inglês. O model `Conta` espera `nome`/`saldo` mas recebe `name`/`balance`, resultando em `undefined` na exibição. A listagem de transações funciona porque `Transacao` é usado como type-cast, mas os campos no template referenciam `data`, `descricao`, `valor` que não existem no JSON.

### MenuItem (não utilizado)
```typescript
interface MenuItem { label, icon, page: Pages, selected: boolean }
```
- O `SidebarComponent` usa objetos inline ao invés deste model

---

## 7. Estado Compartilhado

### Estado Atual: ❌ NÃO IMPLEMENTADO

Atualmente **não existe** estado compartilhado entre componentes:

- O saldo é carregado independentemente pelo `DashboardComponent`
- As transações são carregadas independentemente pelo `ListTransactionsComponent`
- Criar uma transação **não** atualiza o saldo
- Criar uma transação **não** atualiza a lista automaticamente
- O empréstimo não se conecta a nenhum outro dado

### O que deve ser implementado:

Um **service centralizado** com `BehaviorSubject` (ou Signals) que:
1. Mantenha o saldo como estado reativo
2. Mantenha a lista de transações como estado reativo
3. Ao criar transação → atualize saldo + lista
4. Ao fazer transferência → atualize saldo + registre transação
5. Seja injetado em todos os componentes que precisam desses dados

---

## 8. Formulários e Validações

### CreateTransactionComponent (Formulário Reativo)

| Campo | Tipo | Validações | Status |
|---|---|---|---|
| data | DatePicker | `required` | ✅ |
| descricao | InputText | `required` | ✅ |
| valor | InputNumber (currency BRL) | `required`, `min(0.01)` | ✅ |
| tipo | SelectButton | `required` | ✅ |

**Validações ausentes:**
- ❌ Verificação de saldo suficiente (para despesas)
- ❌ Mensagens de erro inline no template
- ❌ Feedback visual de sucesso/erro (Toast)

### LoanComponent (Template-driven com ngModel)

| Campo | Tipo | Validações | Status |
|---|---|---|---|
| valorSolicitado | InputNumber + Slider | min/max via atributo | ⚠️ Parcial |
| parcelas | Slider | min/max via atributo | ⚠️ Parcial |
| taxaJurosMensal | Hardcoded (2.5%) | N/A | ❌ Deveria ser input |

**Problemas:**
- ❌ Deveria usar formulário reativo (`ReactiveFormsModule`)
- ❌ Taxa de juros deveria ser editável
- ❌ Não salva simulação na API

### Transferência: ❌ NÃO EXISTE

Formulário necessário com:
- Conta destino (obrigatório)
- Valor (obrigatório, > 0)
- Descrição
- Validação de saldo suficiente

---

## 9. Consumo de API

| Critério | Status | Observação |
|---|---|---|
| HttpClient configurado | ✅ | `provideHttpClient()` em `app.config.ts` |
| Observables | ✅ | Todos os services retornam `Observable` |
| `async` pipe | ❌ | Nenhum componente usa `async pipe` para dados da API |
| Tratamento de erros | ⚠️ | Apenas `console.log(err)` |
| Loading states | ❌ | Sem indicadores de carregamento |
| Interceptors | ❌ | Sem interceptor de erros ou headers |

---

## 10. Tema Dark/Light

### Implementação Atual

- **Mecanismo:** Classe CSS `my-app-dark` no elemento `<html>`
- **Variáveis CSS:** Design tokens customizados em `styles.css`
- **Detecção automática:** Respeita `prefers-color-scheme: dark` do OS
- **PrimeNG:** Configurado via `darkModeSelector: '.my-app-dark'` no `providePrimeNG()`
- **Persistência:** ❌ Não salva preferência (perde ao recarregar)

### Tokens de Tema

| Token | Light | Dark |
|---|---|---|
| `--surface-ground` | #f8fafc | #020617 |
| `--surface-card` | #ffffff | #1e293b |
| `--surface-border` | #e2e8f0 | #334155 |
| `--text-color` | #334155 | #f1f5f9 |
| `--primary-color` | #3B82F6 | #3B82F6 |

---

## 11. Pipes Customizados

### NegativeValuesPipe

```typescript
@Pipe({ name: 'negativeValues' })
// Retorna classe CSS baseada no sinal do valor
// > 0 → 'text-success'
// < 0 → 'text-danger'
// = 0 → ''
```

- **Status:** ❌ Definido mas **nunca utilizado** em nenhum template
- **Observação:** Não é `standalone` (falta `standalone: true`)

---

## 12. Responsividade

### Estado Atual

| Breakpoint | Implementação |
|---|---|
| Desktop (>992px) | ✅ Funcional — layout com sidebar fixa |
| Tablet (768-992px) | ⚠️ Parcial — grid ajusta, sidebar fixa permanece |
| Mobile (<768px) | ❌ Problemático — sidebar ocupa 20rem fixos, espreme conteúdo |

### Classes Responsivas em `styles.css`

```css
@media (min-width: 768px) { .md\:col-6, .md\:block }
@media (min-width: 992px) { .lg\:col-4, .lg\:col-8 }
```

### Problemas

1. **Sidebar não colapsa** — largura fixa `w-20rem` sem breakpoint mobile
2. **Header não adapta** — botões e texto podem estourar em telas pequenas
3. **Sem media queries mobile** — não há breakpoint para `<768px`
4. **Sem hamburger menu** — não há botão para abrir/fechar sidebar

---

## 13. Testes Unitários

### Estado Atual: ❌ APENAS BOILERPLATE

Todos os arquivos `.spec.ts` contêm apenas o teste padrão gerado pelo CLI:

```typescript
it('should create', () => {
  expect(component).toBeTruthy();
});
```

**Arquivos de teste existentes (7):**
- `app.component.spec.ts`
- `header.component.spec.ts`
- `sidebar.component.spec.ts`
- `main-panel.component.spec.ts`
- `dashboard.component.spec.ts`
- `dashboard.service.spec.ts`
- `transactions.service.spec.ts`
- `list-transactions.component.spec.ts`
- `negative-values.pipe.spec.ts`
- `router.service.spec.ts`

**Nenhum teste** verifica lógica de negócio, integração com API, ou comportamento de UI.

---

## 14. Configuração MCP Servers

### Arquivo: `taskflow/mcp-config.json`

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

### Angular CLI MCP — Ferramentas Disponíveis

| Ferramenta | Descrição |
|---|---|
| `get_best_practices` | Guia de melhores práticas Angular |
| `find_examples` | Exemplos de código oficiais |
| `list_projects` | Lista projetos no workspace |
| `search_documentation` | Busca na documentação oficial |
| `onpush_zoneless_migration` | Plano de migração para OnPush/Zoneless |
| `ai_tutor` | Tutor interativo de Angular |

**Ferramentas experimentais** (ativar com `--experimental-tool`):
- `build` — Executa build
- `devserver.start/stop/wait_for_build` — Controle do dev server
- `test` — Executa testes
- `modernize` — Migração de código para práticas modernas
- `e2e` — Executa testes end-to-end

### PrimeNG MCP — Documentação LLM-optimized

- **llms.txt:** `https://primeng.org/llms/llms.txt`
- **llms-full.txt:** `https://primeng.org/llms/llms-full.txt`
- **Componente específico:** `https://primeng.org/llms/components/{componente}.md`

---

## 15. Diagnóstico e Problemas Identificados

### 🔴 Críticos (impedem avaliação positiva)

| # | Problema | Impacto |
|---|---|---|
| 1 | **Modelos duplicados EN/PT** | Confusão, manutenção dobrada, campos `undefined` |
| 2 | **API retorna inglês, model espera português** | Saldo e nome exibem `undefined` no Dashboard |
| 3 | **Sem estado compartilhado** | Saldo não atualiza ao criar transação |
| 4 | **Transferência inexistente** | Requisito obrigatório ausente |
| 5 | **Lógica de empréstimo no componente** | Viola separação de responsabilidades |
| 6 | **Testes apenas boilerplate** | 5% da avaliação, zero pontos |

### 🟡 Importantes (reduzem nota significativamente)

| # | Problema | Impacto |
|---|---|---|
| 7 | Sem `async pipe` para dados da API | Requisito explícito do enunciado |
| 8 | Sem feedback visual (Toast/Messages) | UX ruim, sem confirmação de ações |
| 9 | Sem validação de saldo na transferência | Requisito funcional obrigatório |
| 10 | Sidebar não colapsa em mobile | Responsividade comprometida |
| 11 | Sem indicadores/cards financeiros no Dashboard | Dashboard incompleto |

### 🟢 Menores (melhorias de qualidade)

| # | Problema | Impacto |
|---|---|---|
| 12 | `NegativeValuesPipe` não utilizado | Código morto |
| 13 | `MenuItem` model não utilizado | Código morto |
| 14 | `TransactionsService` duplicado com `TransacaoService` | Manutenção |
| 15 | Sem Loading indicators (Skeleton/ProgressBar) | UX |
| 16 | Nome de usuário hardcoded no Header | Flexibilidade |
| 17 | Preferência de tema não persiste (localStorage) | UX |

---

## 16. Como Executar o Projeto

### Pré-requisitos

- Node.js 20+
- npm 10+

### Instalação

```bash
# API (json-server)
cd api
npm install

# Aplicação Angular
cd ../taskflow
npm install
```

### Execução

```bash
# Terminal 1 — API (porta 3000)
cd api
npm run api

# Terminal 2 — Angular (porta 4200)
cd taskflow
ng serve
```

### Acesso

- **Aplicação:** http://localhost:4200
- **API:** http://localhost:3000

---

*Documento gerado em 23/02/2026 — Análise completa do estado atual do projeto TaskFlow.*
