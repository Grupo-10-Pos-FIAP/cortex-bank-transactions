# @cortex-bank/transactions

Microfrontend de gerenciamento de transações bancárias desenvolvido como parte do projeto Cortex Bank para a pós-graduação em Engenharia de Software Frontend.

## 📋 Sobre o Projeto

Este é um microfrontend responsável pelo módulo de transações do sistema bancário Cortex Bank. A aplicação permite criar, visualizar, editar e excluir transações financeiras (débitos e créditos), com suporte a upload de anexos e integração com serviços de armazenamento em nuvem.

## 🏗️ Arquitetura

A aplicação foi desenvolvida utilizando a arquitetura de **microfrontends** com **Single-SPA**, permitindo:

- **Desenvolvimento independente**: Cada microfrontend pode ser desenvolvido e deployado separadamente
- **Integração flexível**: Pode ser executado de forma standalone ou integrado ao shell principal
- **Reutilização de componentes**: Utiliza o Design System compartilhado `@grupo10-pos-fiap/design-system`

## 🚀 Tecnologias

- **React 19.2.0** - Biblioteca para construção da interface
- **TypeScript 4.3.5** - Tipagem estática
- **Single-SPA 5.9.3** - Framework para microfrontends
- **Webpack 5.89.0** - Bundler e build tool
- **ESLint + Prettier** - Linting e formatação de código
- **Husky** - Git hooks para qualidade de código

## 📦 Estrutura do Projeto

```
transactions/
├── src/
│   ├── api/              # Camada de comunicação com API
│   ├── app/              # Componente raiz e configuração
│   ├── components/       # Componentes React reutilizáveis
│   ├── config/           # Configurações (API, Cloudinary)
│   ├── hooks/            # Custom hooks
│   ├── types/            # Definições TypeScript
│   ├── utils/            # Funções utilitárias
│   └── styles/           # Estilos globais
├── .github/              # Workflows CI/CD
├── webpack.config.js     # Configuração do Webpack
└── package.json          # Dependências e scripts
```

## 🎯 Funcionalidades

### Transações

- ✅ **Criar transação**: Formulário para cadastro de novas transações (débito/crédito)
- ✅ **Visualizar transação**: Detalhes completos da transação
- ✅ **Editar transação**: Atualização de dados existentes
- ✅ **Excluir transação**: Remoção com confirmação
- ✅ **Upload de anexos**: Integração com Cloudinary para armazenamento de arquivos
- ✅ **Validação de formulários**: Validação client-side com feedback visual
- ✅ **Máscara de moeda**: Formatação automática de valores monetários

### Integração

- 🔗 **Single-SPA**: Integração com shell principal
- 🔗 **Design System**: Componentes visuais padronizados
- 🔗 **API REST**: Comunicação com backend
- 🔗 **LocalStorage**: Persistência de dados do usuário (accountId)
- 🔗 **URL Parameters**: Navegação baseada em query params

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:

```bash
git clone <repository-url>
cd transactions
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
API_BASE_URL=http://localhost:8080
USE_MOCK=false
MOCK_API_BASE_URL=http://localhost:8080
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 🚀 Executando a Aplicação

### Modo Standalone (Desenvolvimento)

Executa a aplicação de forma independente, útil para desenvolvimento:

```bash
npm run start:standalone
```

A aplicação estará disponível em `http://localhost:3003`

### Modo Integrado (Microfrontend)

Executa a aplicação configurada para integração com Single-SPA:

```bash
npm start
```

### Modo Standalone com Backend Local

Executa em modo standalone apontando para backend local:

```bash
npm run start:backend
```

## 📝 Scripts Disponíveis

| Script                     | Descrição                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| `npm start`                | Inicia o servidor de desenvolvimento (modo microfrontend) na porta 3003 |
| `npm run start:standalone` | Inicia em modo standalone                                               |
| `npm run start:backend`    | Inicia standalone com backend local                                     |
| `npm run build`            | Gera build de produção                                                  |
| `npm run build:webpack`    | Build apenas do webpack                                                 |
| `npm run build:types`      | Gera arquivos de tipos TypeScript                                       |
| `npm run lint`             | Executa o linter                                                        |
| `npm run format`           | Formata o código com Prettier                                           |
| `npm run check-format`     | Verifica formatação sem alterar arquivos                                |
| `npm run analyze`          | Analisa o bundle gerado                                                 |

## 🏗️ Build de Produção

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

## 🔧 Configuração

### Variáveis de Ambiente

| Variável                   | Descrição                   | Padrão                  |
| -------------------------- | --------------------------- | ----------------------- |
| `API_BASE_URL`             | URL base da API backend     | `http://localhost:8080` |
| `USE_MOCK`                 | Habilita uso de API mock    | `false`                 |
| `MOCK_API_BASE_URL`        | URL da API mock             | `http://localhost:8080` |
| `CLOUDINARY_CLOUD_NAME`    | Nome da conta Cloudinary    | -                       |
| `CLOUDINARY_UPLOAD_PRESET` | Preset de upload Cloudinary | -                       |

### Porta

A aplicação roda na porta **3003** por padrão. Para alterar, edite `webpack.config.js`.

## 📚 Estrutura de Componentes

### Componentes Principais

- **`Transactions`**: Componente principal que gerencia o fluxo de transações
- **`TransactionForm`**: Formulário para criação/edição de transações
- **`TransactionDetails`**: Visualização detalhada de uma transação
- **`SuccessModal`**: Modal de confirmação de ações
- **`ErrorMessage`**: Componente de exibição de erros
- **`SuccessMessage`**: Mensagem de sucesso

### Hooks Customizados

- **`useTransaction`**: Gerencia operações CRUD de transações

## 🔌 Integração com Single-SPA

A aplicação está configurada para ser registrada no Single-SPA:

```javascript
// No shell principal
import { registerApplication } from "single-spa";

registerApplication({
  name: "@cortex-bank/transactions",
  app: () => System.import("@cortex-bank/transactions"),
  activeWhen: ["/transactions"],
});
```

## 📡 API

A aplicação consome os seguintes endpoints:

- `GET /account/transaction/:id` - Buscar transação por ID
- `POST /account/transaction` - Criar nova transação
- `PUT /account/transaction/:id` - Atualizar transação
- `DELETE /account/transaction/:id` - Excluir transação

## 🎨 Design System

A aplicação utiliza o Design System `@grupo10-pos-fiap/design-system`, que fornece:

- Componentes padronizados (Card, Button, Text, Loading, etc.)
- Tokens de design (cores, espaçamentos, tipografia)
- Consistência visual entre microfrontends

## 🔒 Qualidade de Código

O projeto utiliza:

- **ESLint**: Para análise estática de código
- **Prettier**: Para formatação consistente
- **Husky**: Git hooks para garantir qualidade antes do commit
- **TypeScript**: Tipagem estática para maior segurança

## 🚢 Deploy

O projeto está configurado para deploy no Vercel. O workflow de CI/CD está em `.github/workflows/vercel-deploy-check.yml`.

### Deploy Manual

```bash
# Build de produção
npm run build

# Deploy (se configurado)
vercel --prod
```

## 📄 Licença

Este projeto foi desenvolvido como parte de uma pós-graduação em Engenharia de Software Frontend.

---
