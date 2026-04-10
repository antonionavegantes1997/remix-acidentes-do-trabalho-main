## Plano de Implementação

### 1. Migração do Banco de Dados
- Adicionar colunas `causas_basicas_tasc_1` e `causas_basicas_tasc_2` na tabela `acidentes`
- Criar tabela `acoes` vinculada a acidentes com campos:
  - `acidente_id` (FK), `causa_tipo` (imediata/básica 1/básica 2), `causa_descricao`, `acao`, `corretiva`, `preventiva`, `responsavel_execucao`, `data_prevista_execucao`, `situacao_atual`
- Criar bucket de storage `acoes-anexos` para imagens/PDFs (até 3 por ação)
- Criar tabela `acoes_anexos` para vincular arquivos às ações
- RLS policies para todas as tabelas

### 2. Atualizar Formulário de Acidentes
- Campo `causas_basicas_tasc` vira multi-select (ou manter como texto)
- Adicionar campos `causas_basicas_tasc_1` e `causas_basicas_tasc_2` no formulário

### 3. Criar Página Ações
- Nova rota `/acoes`
- Lista ações geradas automaticamente a partir dos acidentes
- Cada causa do acidente gera uma linha com dados repetidos (nome, data, causa)
- Colunas: Nome, Data, Causa (tipo + descrição), Ação, Corretiva, Preventiva, Responsável, Data Prevista, Situação Atual
- Upload de até 3 arquivos por ação

### 4. Atualizar Pirâmides
- Usar coluna `tipologia_acidente` nos cálculos das pirâmides

### 5. Adicionar link no sidebar
