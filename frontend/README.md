# Gerenciador de Oficina Mecânica — Frontend

Interface web do sistema de gerenciamento de oficina mecânica (**Oficina do Joe**), desenvolvida em **Angular** com **Signals**, componentes **Standalone** e integração com a API REST do Backend (`http://localhost:8080`).

---

## Sumário

1. [Tecnologias Utilizadas](#1-tecnologias-utilizadas)
2. [Como Executar o Projeto](#2-como-executar-o-projeto)
3. [Credenciais de Acesso (Admin)](#3-credenciais-de-acesso-admin)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Rotas e Controle de Acesso (Guards)](#5-rotas-e-controle-de-acesso-guards)
6. [Arquitetura de Serviços e Integração com o Backend](#6-arquitetura-de-serviços-e-integração-com-o-backend)
7. [Funcionalidades por Tela](#7-funcionalidades-por-tela)

---

## 1. Tecnologias Utilizadas

- **Angular 21+** (Componentes Standalone, Signals `signal()` / `computed()` / `effect()`)
- **TypeScript**
- **Fetch API (`async/await`)** para comunicação HTTP direta e leve com o Backend Spring Boot e ViaCEP
- **LocalStorage** para persistência de sessão (JWT) e fallback offline de dados
- **Vitest** para testes unitários (`ng test`)

---

## 2. Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v20 ou superior) e **npm**
- Backend Spring Boot rodando na porta `8080` (opcional para navegação local, pois o front possui fallback em `localStorage`)

### Passo a passo
```bash
# 1. Acesse a pasta do frontend
cd frontend

# 2. Instale as dependências (caso ainda não tenha instalado)
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
# ou: npx ng serve
```

Acesse no navegador: **`http://localhost:4200/`**

---

## 3. Credenciais de Acesso (Admin)

O sistema suporta autenticação integrada ao Backend (`POST /auth/login`) e também possui fallback local caso o servidor Java não esteja rodando no momento do teste:

| Ambiente | E-mail / Usuário | Senha | Perfil |
| :--- | :--- | :--- | :--- |
| **Backend (MySQL / JWT)** | `admin@oficina.com` (ou `admin`) | `1234` | `admin` |
| **Fallback Local (Offline)** | `admin@oficina.com` (ou `admin`) | `1234` ou `admin123` | `admin` |

---

## 4. Estrutura de Pastas

```text
frontend/src/app/
├── entities/
│   └── oficina.ts              # Interfaces de domínio (OrdemServico, Cliente, VeiculoCliente, Solicitacao, MesFinanceiro, StatusOS)
├── environments/
│   └── environment.ts          # Configurações da oficina, URL da API (http://localhost:8080) e credenciais padrão
├── guards/
│   └── auth.guard.ts           # Guard funcional (perfilGuard) que protege rotas por perfil ('admin' | 'funcionario')
├── pages/
│   ├── landing/                # Página pública da oficina (serviços, diferenciais, formulário de solicitação com CEP + WhatsApp)
│   ├── login/                  # Tela de login de administradores e funcionários
│   └── painel/                 # Área administrativa/operacional autenticada
│       ├── layout/             # Menu lateral, cabeçalho, indicador de perfil e botão de sair
│       ├── visao-geral/        # Dashboard com KPIs financeiros, gráfico mensal, boxes ocupados e últimas OS
│       ├── ordens/             # Listagem, filtro, busca e criação de OS com separação entre Serviços e Peças
│       ├── clientes/           # Gestão de clientes, veículos vinculados e solicitações vindas da Landing Page
│       ├── veiculos/           # Visão consolidada dos veículos atendidos e quantidade de OS ativas
│       ├── pecas/              # Catálogo e estoque de peças (/pecas)
│       ├── servicos/           # Catálogo e tabela de preços de serviços / mão de obra (/servicos)
│       ├── financeiro/         # Controle mensal de faturamento, despesas, lucro líquido, margem e ticket médio
│       ├── orcamentos/         # Calculadora rápida e detalhamento de peças/serviços/histórico por OS
│       └── configuracoes/      # Personalização da conta de admin e gestão de usuários (exclusivo para Admin)
├── services/
│   ├── auth.ts                 # Autenticação JWT no backend (/auth/login), gestão de usuários (/usuarios) e sessão
│   └── oficina.ts              # Estado reativo (Signals) das ordens, clientes, veículos, solicitações e financeiro
└── shared/
    ├── contato.ts              # Validação/máscara de CEP, consulta ao ViaCEP e geração de link do WhatsApp
    ├── status.ts               # Mapeamento de classes CSS por status da OS
    ├── icon/                   # Componente de ícones SVG
    └── toast/                  # Componente de notificações rápidas (Toast)
```

---

## 5. Rotas e Controle de Acesso (Guards)

O arquivo `app.routes.ts` utiliza o `perfilGuard` (`guards/auth.guard.ts`) para restringir o acesso:

| Rota | Componente | Acesso Permitido | Descrição |
| :--- | :--- | :--- | :--- |
| `/` | `Landing` | Público | Landing page institucional e formulário de orçamento para clientes |
| `/login` | `Login` | Público | Tela de login para equipe interna (`admin` e `funcionario`) |
| `/painel` | `VisaoGeral` | `admin`, `funcionario` | Dashboard principal com indicadores operacionais e financeiros |
| `/painel/ordens` | `Ordens` | `admin`, `funcionario` | Acompanhamento e gestão das Ordens de Serviço (com separação de Peças e Serviços) |
| `/painel/clientes` | `Clientes` | `admin`, `funcionario` | Base de clientes e triagem de solicitações recebidas |
| `/painel/veiculos` | `Veiculos` | `admin`, `funcionario` | Histórico de veículos e OS em andamento |
| `/painel/pecas` | `Pecas` | `admin`, `funcionario` | Gerenciamento do catálogo e estoque de peças (`/pecas`) |
| `/painel/servicos` | `Servicos` | `admin`, `funcionario` | Gerenciamento do catálogo de serviços e mão de obra (`/servicos`) |
| `/painel/financeiro` | `Financeiro` | `admin`, `funcionario` | Resumos financeiros mensais |
| `/painel/orcamentos` | `Orcamentos` | `admin`, `funcionario` | Calculadora de orçamentos (peças + mão de obra) |
| `/painel/configuracoes` | `Configuracoes` | **Somente `admin`** | Personalização da conta de admin e gestão de contas de funcionários/admins |

> **Nota sobre permissões de edição:** Usuários com perfil `funcionario` podem visualizar todas as telas operacionais do painel, mas ações de criação/edição/exclusão e a aba de Configurações são exclusivas do perfil `admin`.

---

## 6. Arquitetura de Serviços e Integração com o Backend

### 6.1. `AuthService` (`services/auth.ts`)
Responsável pela sessão do usuário logado, token JWT e gerenciamento de contas de acesso:
- **Login (`autenticar`)**: Envia `POST http://localhost:8080/auth/login` com `{ email, senha }`. Ao autenticar, armazena na sessão (`localStorage` sob a chave `oficina-do-joe.sessao`) o `id`, `nome`, `email`, `perfil` e o `token` JWT.
- **Cabeçalho de Autorização (`headersAuth`)**: Fornece automaticamente o header `Authorization: Bearer <token>` para chamadas autenticadas à API.
- **Mapeamento de Perfis**: Converte de forma transparente o perfil técnico do backend (`operational`) para o perfil exibido no frontend (`funcionario`), mantendo `admin` em ambos.
- **Gestão de Usuários (`carregarContas`, `criarContaApi`, `alterarPerfilApi`, `removerContaApi`)**:
  - `GET /usuarios`: Lista todos os usuários ativos do banco.
  - `POST /usuarios`: Cadastra novo funcionário ou administrador.
  - `PUT /usuarios/{id}`: Atualiza o perfil de acesso do usuário.
  - `DELETE /usuarios/{id}`: Inativa o usuário no backend (*soft delete*).
- **Aviso Persistente de Modo Offline**: Caso o backend não esteja operativo no momento do uso, o `AuthService` ativa o sinal `backendOffline` e exibe um banner vermelho fixo no topo da tela (`"Aviso: O backend não está operativo. Operando em modo local (offline)."`), que desaparece automaticamente assim que a conexão com o backend é estabelecida.

### 6.2. `OficinaService` (`services/oficina.ts`)
Centraliza o estado reativo da oficina (usando `signal` e `computed`) e sincroniza automaticamente com os endpoints do Backend quando autenticado:
- **Sincronização Inicial (`sincronizarComBackend`)**: Ao autenticar com token JWT, busca `GET /clientes`, `GET /veiculos`, `GET /ordens-servico` e `GET /ordens-servico/{id}/resumo` para carregar os clientes, veículos e ordens de serviço reais do banco MySQL.
- **Clientes e Veículos (`salvarCadastroCliente`, `excluirCliente`)**:
  - Cria ou atualiza clientes em `POST /clientes` / `PUT /clientes/{id}` e inativa em `DELETE /clientes/{id}`.
  - Garante o cadastro e vínculo do veículo pela placa em `GET /veiculos/placa/{placa}` e `POST /veiculos`.
- **Ordens de Serviço (`criarOrdem`, `mudarStatus`, `atualizarValorOrdem`, `excluirOrdem`, `transformarSolicitacaoEmOrdem`)**:
  - Mapeia os status amigáveis da interface (`Em diagnóstico`, `Aguard. aprovação`, `Em execução`, `Pronto para retirada`, `Concluída`) para o Enum `StatusOrdem` do backend (`DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `EM_EXECUCAO`, `PRONTO`, `CONCLUIDO`).
  - Cria a OS em `POST /ordens-servico` e registra o serviço/valor correspondente em `POST /servicos` e `POST /ordens-servico/{id}/servicos`.
  - Atualiza status via `PATCH /ordens-servico/{id}/status?status=...` (acionando o histórico automático e as travas de conclusão do backend).
  - Atualiza valores via `PUT /ordens-servico/{id}/servicos/{itemId}` e remove OS via `DELETE /ordens-servico/{id}`.

---

## 7. Funcionalidades por Tela

1. **Landing Page (`/`)**:
   - Apresenta os serviços da oficina, diferenciais e informações de contato.
   - Possui formulário de solicitação de serviço com máscara e validação de CEP em tempo real via **ViaCEP** (`shared/contato.ts`), campo de **Número**, montagem automática do endereço completo (`Logradouro, Bairro - Cidade/UF, nº X - CEP`), envio ao painel/banco e abertura automática de conversa no **WhatsApp** da oficina.
2. **Visão Geral (`/painel`)**:
   - Exibe KPIs do mês selecionado (Faturamento, Despesas, Lucro Líquido e Ticket Médio) comparados ao mês anterior.
   - Gráfico SVG interativo dos últimos 6 meses.
   - Status de ocupação dos boxes da oficina, próxima entrega agendada e últimas Ordens de Serviço.
3. **Ordens de Serviço (`/painel/ordens`)**:
   - Filtro rápido por status (`Todas`, `Em diagnóstico`, `Aguard. aprovação`, `Em execução`, `Pronto para retirada`, `Concluída`) e barra de busca por número, cliente, veículo, placa, serviço ou peça.
   - Criação de nova OS separando **Serviço (mão de obra)** + **Valor do serviço** e **Peças** + **Valor das peças**, com sugestões automáticas (`<datalist>`) integradas aos catálogos de Peças e Serviços.
   - Listagem com colunas separadas para **Serviços (mão de obra)**, **Peças** e **Total**, permitindo editar individualmente os valores de serviço e peças (`Editar valores`) e alterar o status sincronizado com `/ordens-servico`.
4. **Clientes (`/painel/clientes`)**:
   - Exibe a fila de **Solicitações de Orçamento** enviadas pela Landing Page, permitindo convertê-las em Ordem de Serviço com 1 clique (`Transformar em ordem`) ou marcá-las como atendidas.
   - Formulário com autopreenchimento de endereço pelo **ViaCEP** + **Número** + **CEP**, salvando o endereço completo em `tb_cliente.endereco`.
   - Tabela de clientes com endereço completo, veículos vinculados, quantidade de OS e valor total gasto.
5. **Veículos (`/painel/veiculos`)**:
   - Lista todos os veículos cadastrados nos clientes e nas ordens de serviço, proprietário, total de passagens pela oficina e quantas OS estão em andamento.
6. **Peças (`/painel/pecas`)**:
   - Gerenciamento completo do catálogo de peças (`GET`, `POST`, `PUT` e `DELETE /pecas`): nome, código do fabricante, preço de custo, preço de venda e quantidade em estoque.
7. **Serviços (`/painel/servicos`)**:
   - Gerenciamento completo do catálogo de serviços (`GET`, `POST`, `PUT` e `DELETE /servicos`): descrição, preço padrão e tempo estimado em minutos.
8. **Financeiro (`/painel/financeiro`)**:
   - Tabela mensal com cálculo automático de lucro líquido, margem percentual e ticket médio, além de cadastro e edição de meses financeiros e exportação de relatório em `.CSV`.
9. **Orçamentos (`/painel/orcamentos`)**:
   - **Calculadora rápida** para somar peças/materiais e mão de obra com validação contra valores negativos.
   - **Detalhamento por Ordem de Serviço (integrado ao Backend)**: permite selecionar uma OS para vincular/remover **Peças** (`POST/DELETE /ordens-servico/{id}/pecas` e `/pecas`), vincular/remover **Serviços / Mão de Obra** (`POST/DELETE /ordens-servico/{id}/servicos` e `/servicos`), consultar o **Resumo Financeiro** (`GET /ordens-servico/{id}/resumo`) e visualizar o **Histórico de Status** (`GET /ordens-servico/{id}/historico`).
10. **Usuários e Acessos (`/painel/configuracoes`)**:
   - **Personalizar conta de administrador**: permite alterar nome, e-mail de acesso e senha da conta de administrador logada (`PUT /usuarios/{id}`).
   - Permite ao Administrador cadastrar novos funcionários ou administradores, alterar o perfil de contas existentes e remover acessos (protegendo a conta principal de admin e a própria conta logada).
