# 🔧 Oficina do Joe — Sistema Gerenciador de Oficina Mecânica

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Sistema web completo para gestão de oficinas mecânicas, desenvolvido na disciplina de **Desenvolvimento de Sistemas Web (DSW)**. A plataforma integra uma **Landing Page institucional** voltada aos clientes e um **Painel de Gestão** completo para controle de ordens de serviço, orçamentos, clientes, veículos, catálogo de peças/serviços e indicadores financeiros.

---

## ✨ Principais Funcionalidades

- **🌐 Landing Page Institucional:** Apresentação dos serviços da oficina, diferenciais, localização e atalhos diretos para agendamento e contato via WhatsApp.
- **🔐 Autenticação JWT & Controle de Acesso (RBAC):**
  - **Administrador (`admin`):** Acesso irrestrito ao painel, financeiro, configurações e gerenciamento de contas de funcionários.
  - **Operacional (`operational` / `funcionario`):** Acesso operacional às ordens de serviço, clientes, veículos, peças e serviços.
- **📊 Visão Geral (Dashboard):** Acompanhamento em tempo real de KPIs operacionais e financeiros, ordens em aberto, faturamento e produtividade.
- **📋 Gestão Completa de Ordens de Serviço (OS):**
  - Abertura de OS vinculada a cliente, veículo e mecânico responsável.
  - Adição e edição de **peças** (nova, usada ou fornecida pelo cliente, com controle de pendência/previsão de chegada) e **serviços** (incluindo serviços extras e registro do método de aprovação: WhatsApp, telefone ou presencial).
  - Controle de fluxo de status (`ABERTA`, `EM_ANDAMENTO`, `AGUARDANDO_PECA`, `CONCLUIDA`, `ENTREGUE`, `CANCELADA`) com **registro automático de histórico** e carimbo de datas de conclusão/entrega.
  - Suporte a ordens de retorno/garantia (`ordemOrigem`).
- **👥 Clientes e Veículos:** Cadastro, busca dinâmica (por nome, CPF/CNPJ, telefone e placa), vínculo de múltiplos veículos por cliente e inativação lógica (*soft delete*).
- **🔩 Catálogo de Peças e Serviços:** Controle de código, preço de referência e tempo estimado de execução para padronizar orçamentos.
- **💰 Orçamentos e Financeiro:** Consolidação de receitas, descontos, ticket médio e acompanhamento de valores por ordem de serviço.

---

## 🛠️ Tecnologias Utilizadas

### Backend (`/backend`)
- **Java 21** + **Spring Boot**
- **Spring Web MVC** (API RESTful)
- **Spring Data JPA / Hibernate** (Persistência e mapeamento objeto-relacional)
- **MySQL 8.4** (Banco de dados relacional)
- **JJWT (`io.jsonwebtoken`)** (Autenticação stateless via tokens JWT)
- **Lombok** (Redução de boilerplate)

### Frontend (`/frontend`)
- **Angular 22** (Standalone Components, Signals, Control Flow nativo `@if` / `@for`)
- **TypeScript** + **RxJS**
- **CSS Moderno Responsivo**

### Infraestrutura & Deploy (`/deploy`)
- **Docker & Docker Compose** (Orquestração dos containers `mysql`, `backend` e `frontend`)
- **Nginx** (Servidor web para entrega do bundle Angular em produção)

---

## 📂 Estrutura do Repositório

```text
Gerenciador-Oficina-DSW2603/
├── backend/                  # API REST em Java + Spring Boot
│   ├── src/main/java/        # Controllers, Services, Repositories, Entities, Enums e Utils (JWT/Seed)
│   ├── src/main/resources/   # application.properties
│   ├── Dockerfile            # Build multi-stage da API
│   └── pom.xml               # Dependências Maven
├── frontend/                 # Aplicação SPA em Angular
│   ├── public/               # Arquivos estáticos e logo da oficina
│   ├── src/app/
│   │   ├── entities/         # Interfaces e modelos TypeScript
│   │   ├── guards/           # Guardas de rota por perfil (admin / funcionario)
│   │   ├── pages/            # Landing, Login e módulos do Painel (Ordens, Clientes, Veículos, etc.)
│   │   ├── services/         # Comunicação HTTP com a API e estado de autenticação
│   │   └── shared/           # Componentes compartilhados (Ícones, Toast, Status, Contato)
│   ├── Dockerfile            # Build Angular + servidor Nginx
│   └── package.json          # Scripts e dependências NPM
└── deploy/                   # Orquestração Docker
    ├── docker-compose.yaml   # Subida integrada de MySQL + Backend + Frontend
    └── .env.exemple          # Exemplo de variáveis de ambiente
```

---

## 🚀 Como Executar o Projeto

### Opção 1: Rodando tudo com Docker Compose (Recomendado)

1. Acesse a pasta `deploy` e crie o arquivo `.env` a partir do modelo `.env.exemple`:
   ```bash
   cd deploy
   cp .env.exemple .env
   ```
2. Suba os containers:
   ```bash
   docker compose up -d --build
   ```
3. Acesse no navegador:
   - **Frontend:** [http://localhost:4200](http://localhost:4200)
   - **API Backend:** [http://localhost:8080](http://localhost:8080)
   - **Banco MySQL:** `localhost:3306`

---

### Opção 2: Rodando Localmente para Desenvolvimento

#### Pré-requisitos
- **Java JDK 21+**
- **Node.js 20+** e **npm**
- **MySQL 8+** rodando localmente na porta `3306`

#### 1. Iniciar o Backend
```bash
cd backend
./mvnw spring-boot:run
```
> No Windows PowerShell, utilize `.\mvnw.cmd spring-boot:run`. O banco `oficina` e as tabelas são criados automaticamente caso não existam (`ddl-auto=update`).

#### 2. Iniciar o Frontend
```bash
cd frontend
npm install
npm start
```
A aplicação estará disponível em [http://localhost:4200](http://localhost:4200).

---

## 🔑 Credenciais Iniciais de Acesso

Ao iniciar o backend pela primeira vez, o componente [`DatabaseSeeder`](backend/src/main/java/oficina/gerenciador/app/util/DatabaseSeeder.java) cria automaticamente uma conta de administrador padrão:

| Campo | Valor |
| :--- | :--- |
| **E-mail / Login** | `admin@oficina.com` (ou simplesmente `admin`) |
| **Senha** | `1234` |
| **Perfil** | `admin` |

---

## 📡 Principais Endpoints da API REST

Todas as rotas (exceto `/auth/login` e `/login`) exigem o cabeçalho `Authorization: Bearer <token>`.

| Recurso | Método | Rota | Descrição |
| :--- | :---: | :--- | :--- |
| **Autenticação** | `POST` | `/auth/login` | Autentica usuário e retorna o token JWT |
| **Autenticação** | `GET` | `/auth/me` | Retorna os dados do usuário autenticado |
| **Usuários** | `GET / POST` | `/usuarios` | Lista usuários ou cria novo usuário (apenas `admin`) |
| **Usuários** | `GET / PUT / DELETE` | `/usuarios/{id}` | Busca, atualiza ou inativa um usuário |
| **Clientes** | `GET / POST` | `/clientes` | Lista todos ou cadastra novo cliente |
| **Clientes** | `GET` | `/clientes/id/{id}` | Busca cliente por ID |
| **Clientes** | `GET` | `/clientes/{nome}` | Filtra clientes por parte do nome |
| **Clientes** | `GET` | `/clientes/cpf-cnpj/{cpfCnpj}` | Busca cliente por CPF/CNPJ |
| **Clientes** | `GET` | `/clientes/tel/{telefone}` | Busca cliente por telefone |
| **Clientes** | `PUT / DELETE` | `/clientes/{id}` | Atualiza ou inativa cliente |
| **Veículos** | `GET / POST` | `/veiculos` | Lista todos ou cadastra novo veículo |
| **Veículos** | `GET` | `/veiculos/id/{id}` | Busca veículo por ID |
| **Veículos** | `GET` | `/veiculos/{placa}` | Busca veículo pela placa |
| **Veículos** | `GET` | `/veiculos/cliente/{clienteId}` | Lista veículos de um cliente específico |
| **Veículos** | `PUT / DELETE` | `/veiculos/{id}` | Atualiza ou inativa veículo |
| **Peças** | `GET / POST` | `/pecas` | Lista todas ou cadastra nova peça |
| **Peças** | `GET` | `/pecas/nome/{nome}` | Filtra peças por parte do nome |
| **Peças** | `GET` | `/pecas/codigo/{codigo}` | Busca peça por código |
| **Peças** | `GET / PUT / DELETE` | `/pecas/{id}` | Busca, atualiza ou inativa peça |
| **Serviços** | `GET / POST` | `/servicos` | Lista todos ou cadastra novo serviço |
| **Serviços** | `GET` | `/servicos/nome/{nome}` | Filtra serviços por parte do nome |
| **Serviços** | `GET / PUT / DELETE` | `/servicos/{id}` | Busca, atualiza ou inativa serviço |
| **Ordens de Serviço** | `GET / POST` | `/ordens-servico` | Lista todas ou abre nova Ordem de Serviço |
| **Ordens de Serviço** | `GET / PUT / DELETE` | `/ordens-servico/{id}` | Busca, edita ou cancela uma OS |
| **Ordens de Serviço** | `PATCH` | `/ordens-servico/{id}/status` | Atualiza o status da OS e registra histórico |
| **Ordens de Serviço** | `GET / POST / PUT / DELETE` | `/ordens-servico/{ordemId}/pecas` | Gerencia peças vinculadas à OS |
| **Ordens de Serviço** | `GET / POST / PUT / DELETE` | `/ordens-servico/{ordemId}/servicos` | Gerencia serviços vinculados à OS |
| **Ordens de Serviço** | `GET` | `/ordens-servico/{ordemId}/historico` | Consulta a linha do tempo de status da OS |
