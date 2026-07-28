# Sistema de Chamados de Manutenção

> **Atividade Prática de IA Generativa**: Este projeto foi desenvolvido no âmbito de um aprendizado prático sobre criação de sistemas web completos, integração com banco de dados e fluxo de deploy moderno utilizando ferramentas de Inteligência Artificial Generativa.

---

## 🎯 Objetivo do Projeto

Aprender e aplicar conceitos práticos de desenvolvimento web assistido por IA Generativa, cobrindo todo o ciclo de vida de uma aplicação:
- **Criação de Sistemas Web**: Construção de interface interativa, responsiva e focada na experiência do usuário.
- **Conexão com Banco de Dados**: Modelagem de dados, execução de scripts SQL e aplicação de políticas de segurança no **Supabase**.
- **Controle de Versão e Deploy**: Publicação e versionamento no **GitHub** e deploy contínuo na **Vercel**.

---

## 🛠️ Tecnologias Utilizadas

| Ferramenta / Tecnologia | Função no Projeto |
| :--- | :--- |
| **Google AI Studio** | Assistência com IA Generativa no design, lógica de código e arquitetura do sistema |
| **React 19 + TypeScript** | Biblioteca principal e tipagem para construção do frontend |
| **Vite** | Build tool rápido para desenvolvimento e empacotamento do projeto |
| **Tailwind CSS** | Estilização moderna, limpa e responsiva |
| **Supabase** | Backend as a Service (BaaS) fornecendo banco de dados PostgreSQL, autenticação e armazenamento (Storage) com RLS |
| **GitHub** | Repositório de código fonte e controle de versão |
| **Vercel** | Plataforma de hospedagem e deploy contínuo do projeto |

---

## 📋 Funcionalidades do Sistema

- **Abertura de Chamados**: Operadores podem registrar novos chamados informando equipamento, descrição, prioridade e fotos do problema.
- **Encerramento e Atendimento**: Mecânicos/Técnicos podem visualizar chamados pendentes, atualizar status e encerrar chamados resolvidos.
- **Upload de Anexos**: Integração com o Supabase Storage para armazenamento seguro de imagens dos chamados.
- **Políticas de Segurança (RLS)**: Tabelas e buckets protegidos por políticas de acesso no Supabase.


## 🚀 Como Executar Localmente


### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM ou Yarn

### Passos
1. **Clonar o repositório**:
   ```bash
   git clone <URL_DO_REPOSITORIO_GITHUB>
   cd <NOME_DA_PASTA>
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
   ```

4. **Executar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse no navegador através do endereço exibido no terminal (ex: `https://sistema-de-chamados-de-manuten-o-at.vercel.app/`).



✨ *Desenvolvido como atividade de aprendizado em IA Generativa, Supabase, GitHub e Vercel.*
