# Documentação Técnica — Projeto G12 (Homologação)

**Plataforma:** TOTVS Fluig (BPM/ECM) + TOTVS RM (backoffice)
**Processo BPMN:** `G12` — versão 294 (servidor `HOMOLOGACAO`)
**Formulário:** `G12.html` (Form ID 68555, dataset de origem `DSG12`)
**Autor identificado no código:** Enos Rocha — Programador Full Stack (Fluig)
**Data deste levantamento:** 29/07/2026
**Método:** engenharia reversa por leitura integral do código-fonte do repositório `ProjetoG12Homologacao` (nenhum arquivo foi alterado)

> **Aviso de fidelidade:** este documento descreve exclusivamente o que foi observado no código-fonte. Onde o comportamento não pôde ser confirmado (por exemplo, arquivos binários, cache de webservice, ou configurações que só existem no ambiente Fluig e não no repositório), isso é declarado explicitamente na seção correspondente e no capítulo **16. Limitações da Análise**.

---

## 1. Resumo Executivo

### 1.1 Objetivo do projeto

O **G12** é um processo de BPM no TOTVS Fluig que automatiza o ciclo de **transmissão de Notas Fiscais de Serviço Eletrônicas (NFS-e)** vinculadas a contratos de prestação de serviço, com integração direta ao **TOTVS RM** (ERP). O processo cobre desde o carregamento dos dados do contrato/movimento, passando pela aprovação técnica, validação de contratos, ajuste de tributos (nacionais, municipais, IRRF/INSS), faturamento em cadeia de três tipos de movimento RM (2.1.01 → 2.1.02 → 2.2.01), envio e validação da NFS-e junto à prefeitura, até a checagem final de transmissão e eventual reenvio para ajustes financeiros ou técnicos.

### 1.2 Arquitetura

- **Front-end do formulário**: HTML + jQuery (Fluig Style Guide) rodando dentro do iframe do formulário Fluig (`G12.html` + 18 arquivos `.js` + 1 `.css`).
- **Camada de eventos do formulário (server-side, Rhino/Java)**: `displayFields.js`, `enableFields.js`, `validateForm.js` — hooks padrão do ciclo de vida de formulário Fluig, executados no servidor a cada renderização/gravação.
- **Camada de dados (Datasets Fluig)**: 13 datasets customizados em `datasets/*.js`, todos consultando o RM via webservice SOAP `WSCONSSQL` (consultas SQL nomeadas cadastradas no RM).
- **Camada de processo (BPMN)**: `workflow/diagrams/G12.process` (modelo Graphiti/BPMN2 do Fluig Process Designer) + `workflow/.resources/G12.ecm30.xml` (export do processo para o ECM/banco do Fluig — states, gateways, regras automáticas, service configs).
- **Service Tasks** (`workflow/scripts/*.js`, 13 arquivos `servicetaskNN.js` + 2 auxiliares): scripts server-side (Rhino) que chamam os webservices SOAP do RM (`wsProcess`, `wsDataServer`) para faturar movimentos, ajustar tributos, enviar/consultar NFS-e, atualizar CNO, etc.
- **Mecanismos de atribuição (Mechanisms)** (`mechanisms/*.js`): resolvem para qual usuário/grupo Fluig uma atividade deve ser distribuída, com base em `centro_de_custo` e `CodColigada`.

### 1.3 Tecnologias identificadas

| Camada | Tecnologia |
|---|---|
| BPM/ECM | TOTVS Fluig (Fluig Process Designer / BPMN2 via Graphiti) |
| ERP integrado | TOTVS RM (via SOAP: `wsProcess`, `wsDataServer`, `WSCONSSQL`) |
| Scripts server-side | JavaScript (Rhino engine embutida no Fluig — uso de `java.lang.*`, `java.text.SimpleDateFormat`, `org.json.XML`) |
| Front-end | HTML, jQuery, Fluig Style Guide (`fluig-style-guide.min.css/js`), Mustache.js (carregado mas sem uso identificado no código lido), Lordicon (ícones animados via CDN externo) |
| Dados | Datasets Fluig (`DatasetFactory`, `DatasetBuilder`) consumindo XML→JSON de retorno do RM |
| Ambiente de projeto | Eclipse (nature `com.totvs.tds.ecm.designer.nature`, TDS — TOTVS Developer Studio) |

### 1.4 Principais módulos

1. **Carregamento de dados do contrato/movimento** (dataset `G12-CARREGAR-DADOS` + `servicetask9`)
2. **Aprovação do setor técnico** (mecanismo `G12-APROVACAO-ST`)
3. **Checagem/validação de contratos** (mecanismo `G12-VALIDIACAO-CONTRATOS`)
4. **Ajuste de CNO (Cadastro Nacional de Obras)** para Paraíba (`servicetask180`)
5. **Faturamento em cadeia RM**: 2.1.01 → 2.1.02 (`servicetask71`) → 2.2.01 (`servicetask78`)
6. **Ajuste de tributos** do movimento (nacionais `servicetask87`, municipais `servicetask108`, IRRF/INSS `servicetask118`/`servicetask130`)
7. **Ajuste de competência fiscal** (`servicetask223`)
8. **Envio e validação da NFS-e** (`servicetask233` ajuste de histórico → `servicetask148` envio → `servicetask157` validação/consulta de autorização, com sub-rotinas de captura de erro `servicetask193`/`servicetask200`)
9. **Checagem de transmissão** (gateway automático `exclusivegateway246` baseado em campos preenchidos pelo usuário)
10. **Ajuste de solicitação** (retorno ao solicitante ou a financeiro/técnico, mecanismo `G12-AJUSTE-SOLICITACAO`)
11. **Cancelamento de movimento** (subprocesso "CANCELAMENO", `servicetask30`)
12. **Anexos e GED** (upload de NFS-e para aba de anexos do Fluig; listagem de documentos do GED do RM por período de medição)
13. **"Bot" de checagem de preenchimento** (painel flutuante que lista campos obrigatórios não preenchidos, `G12-CheckBot.js`)

### 1.5 Fluxo geral (visão de altíssimo nível)

```
Usuário/RM dispara processo (IdMov + CodColigada)
        │
        ▼
Carregamento de dados (dataset + servicetask9)
        │
        ▼
Aprovação Setor Técnico ──(CANCELAR)──► Cancelamento (servicetask30) ─► Fim
        │
        ├──(AJUSTAR SOLICITACAO)──► Ajuste de Solicitação ─► Fim (retorna ao solicitante)
        │
        ▼
Checagem de Contratos ──(AJUSTAR SOLICITACAO)──► (mesmo destino acima)
        │
        ▼ (gateway: gerAtualizacaoCNOPB())
   true │                 │ false
        ▼                 │
Atualizar CNO PB           │
        │                 │
        └────────┬────────┘
                 ▼
   Faturar Movimento 2.1.01 → gera 2.1.02 (servicetask71)
                 │
                 ▼
            Faturar Notas (hub de ajustes) ◄───────────────┐
                 │  (links para sub-integrações opcionais) │
                 │  - Ajustar tributos do movimento         │
                 │  - Cadastrar/ajustar tributo municipal    │
                 │  - Ajustar IRRF/INSS                      │
                 │  - Cadastrar IRRF/INSS                    │
                 │  - Ajustar competência                    │
                 ▼                                           │
     Ajustar histórico + Enviar Nota (servicetask233)        │
                 │                                           │
                 ▼                                           │
     Envio de NFS-e — serviço automático (servicetask148) ───┘ (retorno em caso de erro)
                 │
                 ▼
     Validação de Nota Fiscal (servicetask157) ──(erro)──► Tratamento (task158) ─┬─► retorna a Faturar Notas
                 │                                                                ├─► retorna a Enviar Nota
                 │                                                                └─► Faturar Nota Manualmente → NFS-e Transmitida
                 ▼
     Faturar Movimento 2.1.02 → gera 2.2.01 (servicetask78)
                 │
                 ▼
          NFS-e Transmitida (task61)
                 │
                 ▼
       Checagem de Transmissão (task242)
                 │
                 ▼ (gateway automático por regras de campo)
   infoTransmissaoCorreta = sim ──► Aguardando Recebimento ──► Fim
   infoSetorAjuste = financeiro ──► Ajuste de Solicitação [Financeiro] ──► Fim
   infoSetorAjuste = tecnico ──► Ajuste de Solicitação [Retornar ao Solicitante] ──► Fim
```

### 1.6 Integrações identificadas

- **TOTVS RM via SOAP**: `WSCONSSQL` (consultas SQL nomeadas), `wsProcess` (ações complexas: faturamento, cancelamento, envio/consulta de NFS-e), `wsDataServer` (CRUD de registros: `saveRecord`/`readRecord` em tabelas do RM).
- **Fluig Datasets internos**: `dsTBCConnector` (credenciais de acesso ao RM) e `ds_Constantes` (parâmetros `rm_usuario`/`rm_senha` e outros) — **não fazem parte deste repositório**, são datasets globais do ambiente Fluig.
- **Fluig ECM/Anexos**: `parent.ECM.attachmentTable`, `WKFViewAttachment` — anexação de arquivos (nota fiscal) na aba "Anexos" do processo.
- **Fluig GED**: URLs diretas para `ecmnavigation` do portal Fluig, construídas a partir de códigos de documento retornados por dataset.
- **CDN externo**: `cdn.lordicon.com` (ícones animados) e `i.imgur.com` (imagens estáticas usadas como mascote do bot e ícone) — dependências externas fora do controle do Fluig.

---

## 2. Estrutura do Projeto

```
ProjetoG12Homologacao/
├── datasets/                        # Datasets Fluig (consultas ao RM via WSCONSSQL)
│   ├── G12-AJUSTAR-TRIBUTOS.js
│   ├── G12-CADASTRAR-TRIBUTO-MUNICIPAL.js
│   ├── G12-CARREGAR-DADOS.js
│   ├── G12-CARREGAR-TRIBUTOS.js
│   ├── G12-EXERCICIO-FISCAL.js
│   ├── G12-GED.js
│   ├── G12-HISTORICO-NFSE.js
│   ├── G12-INFO-NFSE.js
│   ├── G12-INSS-ZOOM.js
│   ├── G12-IRRF-ZOOM.js
│   ├── G12-MOVIMENTOS-2102.js
│   ├── G12-PERIODOS-MEDICAO.js
│   └── G12-TRIBUTOS-MUNICIPAIS.js
│
├── forms/G12/                       # Formulário do processo (HTML + JS + CSS)
│   ├── G12.html                     # Formulário principal (1701 linhas)
│   ├── G12-Style.css                # Estilos (846 linhas)
│   ├── G12-Main.js                  # Bootstrap de eventos on document.ready
│   ├── G12-Loading.js               # Arquivo vazio (ver seção 15 — código morto)
│   ├── G12-Carregamento.js          # Preenchimento do formulário a partir do dataset
│   ├── G12-Anexos.js                # Upload/visualização/remoção de anexos (aba Anexos do Fluig)
│   ├── G12-CalcularAjusteTributos.js# Cálculo de valor de imposto (base x alíquota)
│   ├── G12-ChecagemTransmissao.js   # Seleção visual dos botões de checagem de transmissão
│   ├── G12-CheckBot.js              # Painel flutuante de pendências de preenchimento
│   ├── G12-Cno.js                   # Função inteira comentada (código morto)
│   ├── G12-GED.js                   # Renderização dos anexos do GED por período
│   ├── G12-IRRF-INSS.js             # Toggle de exibição das tabelas de IRRF/INSS
│   ├── G12-NF-e.js                  # Modal "DANFSe" (espelho de nota fiscal)
│   ├── G12-TabelaDeTributos.js      # Toggle de exibição da tabela de tributos do movimento
│   ├── G12-Toogle.js                # Toggle de exibição da checagem + edição manual/competência
│   ├── G12-TributosDoMovimento.js   # Toggle de exibição da tabela de tributos ajustáveis
│   ├── G12-TributosMunicipaisFuncoesAuxiliares.js # Toggle da tabela de tributos municipais
│   ├── G12-Zoom.js                  # Callback do componente "zoom" (autocomplete) de IRRF/INSS
│   ├── events/
│   │   ├── displayFields.js         # Hook Fluig: mostra/oculta seções conforme a atividade
│   │   ├── enableFields.js          # Hook Fluig: habilita/desabilita campos conforme a atividade
│   │   └── validateForm.js          # Hook Fluig: validação obrigatória de CNOPB
│   ├── .metadata                    # Objeto Java serializado (FormularioServerDto) — form G12/HOMOLOGACAO/DSG12
│   └── Images/charging.gif          # GIF de carregamento (não referenciado nos JS lidos)
│
├── mechanisms/                      # Mecanismos de atribuição de atividade (workflow)
│   ├── G12-AJUSTE-SOLICITACAO.js
│   ├── G12-APROVACAO-ST.js
│   ├── G12-CONTRATOS-VALIDA.js      # Não referenciado no BPMN (ver seção 15)
│   └── G12-VALIDIACAO-CONTRATOS.js
│
├── workflow/
│   ├── diagrams/G12.process         # Modelo BPMN2/Graphiti completo (13.928 linhas)
│   ├── scripts/                     # Service Tasks e eventos globais do processo
│   │   ├── G12.servicetask9.js ... G12.servicetask233.js  (13 service tasks)
│   │   ├── G12.beforeStateEntry.js  # Evento global "antes de entrar no estado"
│   │   └── G12.atualizaçãoCNOPB.js  # Função de suporte à condição do gateway 177
│   └── .resources/
│       ├── G12.ecm30.xml            # Export do processo para o ECM (9.462 linhas)
│       ├── G12.png / G12.processimage.svg  # Renderizações gráficas do processo
│       └── HOMOLOGACAO.ws.cache(.bkp) # Cache binário de WSDL do webservice — não interpretável como texto
│
├── .project / .settings/.jsdtscope  # Metadados de projeto Eclipse/TDS (JSDT + nature ECM Designer)
└── .claude/settings.local.json      # Configuração local do Claude Code (fora do escopo do processo Fluig)
```

> **Diretórios vazios encontrados no repositório:** `events/`, `reports/`, `wcm/layout/`, `wcm/widget/` existem na raiz do projeto mas **não contêm nenhum arquivo**. Aparentam ser parte do esqueleto padrão de um projeto Fluig (TDS) para widgets/relatórios/eventos de portal que não chegaram a ser implementados neste processo — nenhuma funcionalidade foi encontrada neles.

---

## 3. Processo BPM — G12

### 3.1 Identificação

| Campo | Valor |
|---|---|
| ID do processo | `G12` |
| Nome | G12 |
| Versão analisada | 294 |
| Servidor | `HOMOLOGACAO` |
| Form ID | 68555 |
| Mecanismo de gerência padrão | `Usuário` (colleagueId fixo `4ef20412-7687-40a4-b1c8-095c0a92503e`) |

### 3.2 Pools e Swimlanes identificados

| Pool | Swimlanes | Observação |
|---|---|---|
| **G12** (pool principal) | CARREGAMENTO, SETOR TÉCNICO, CONTRATOS, FINANCEIRO | Fluxo principal do processo |
| **CANCELAMENO** | (sem nome) | Subprocesso de cancelamento de movimento |
| **AJUSTE DE SOLICITACAO** | (sem nome) | Reservado para a atividade "AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]" |
| **INTEGRAÇÕES DE TRIBUTOS E INFORMAÇÕES DA NOTA FISCAL** | 5 swimlanes (laranja `FF8040`) | Concentra as sub-rotinas de ajuste de tributos/IRRF/INSS/competência, acessadas via eventos de link a partir de "FATURAR NOTAS" |
| **NFS-e** | (sem nome, ciano `00FFFF`) | Sub-rotina de envio/ajuste de histórico da nota antes do envio |

> Os "links" (`BpmnIntermediateEvent` do tipo *link throw/catch*, `type="36"`/`type="42"`) são usados extensivamente para conectar pools diferentes sem desenhar uma seta direta — funcionam como "teleportes" nomeados (ex.: *"SAIDA PARA FATURAR NOTAS"* → *"CHEGADA EM FATURAR NOTAS"*).

### 3.3 Catálogo completo de atividades (states)

| Seq. | Nome da atividade | Tipo BPMN | Responsável / Mecanismo | Script associado |
|---|---|---|---|---|
| 5 | Início | StartEvent | — | — |
| 9 | CARREGAMENTO DE DADOS | Service Task (automática) | Sistema | `G12.servicetask9.js` |
| 12 | Intermediário (erro) | Boundary error event | — | anexado a `servicetask9` |
| 13 | TRATAMENTO DE ERRO [CARREGAMENTO DE DADOS] | User Task | Usuário fixo | — |
| 17 | **APROVAÇÃO SETOR TÉCNICO** | User Task | Mecanismo `G12-APROVACAO-ST` | — |
| 23 | **FATURAR NOTAS** | User Task (hub) | Usuário fixo | — |
| 30 | CANCELAR MOVIMENTO RM E FLUIG | Service Task | Sistema | `G12.servicetask30.js` |
| 31 | Intermediário (erro) | Boundary error | — | anexado a `servicetask30` |
| 32 | TRATAMENTO DE ERRO | User Task | Usuário fixo | — |
| 35 | Fim com cancelamento de processo | End Event | — | — |
| 43 | AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE] | User Task | Mecanismo `Executor Atividade` (retorna a `startevent5`) | — |
| 61 | **NFS-e TRANSMITIDA** | User Task | Usuário fixo | — |
| 62 | AGUARDANDO RECEBIMENTO | User Task | Usuário fixo | — |
| 65 | Fim | End Event | — | — |
| 67 | Fim | End Event | — | — |
| 71 | FATURAR MOVIMENTO 2.1.01 E GERAR MOVIMENTO 2.1.02 | Service Task | Sistema | `G12.servicetask71.js` |
| 73/74 | Intermediário (erro) / TRATAMENTO DE ERRO [FATURAMENTO DO 2.1.01] | Boundary error / User Task | — | — |
| 78 | FATURAR MOVIMENTO 2.1.02 E GERAR MOVIMENTO 2.2.01 | Service Task | Sistema | `G12.servicetask78.js` |
| 80/81 | Intermediário (erro) / TRATAMENTO DE ERRO [FATURAMENTO DO 2.1.02] | Boundary error / User Task | — | — |
| 87 | AJUSTAR TRIBUTOS DO MOVIMENTO | Service Task | Sistema | `G12.servicetask87.js` |
| 89/90 | Intermediário (erro) / TRATAMENTO DE ERRO [AJUSTAR TRIBUTO DO MOVIMENTO] | — | — | — |
| 108 | CADASTRAR/AJUSTAR TRIBUTO MUNICIPAL | Service Task | Sistema | `G12.servicetask108.js` |
| 109/107 | Intermediário (erro) / TRATAMENTO DE ERRO [CADASTRAR/AJUSTAR TRIBUTO MUNICIPAL] | — | — | — |
| 118 | AJUSTAR IRRF/INSS | Service Task | Sistema | `G12.servicetask118.js` |
| 122/117 | Intermediário (erro) / TRATAMENTO DE ERRO [AJUSTAR IRRF/INSS] | — | — | — |
| 130 | CADASTRAR IRRF/INSS | Service Task | Sistema | `G12.servicetask130.js` |
| 131/129 | Intermediário (erro) / TRATAMENTO DE ERRO [CADASTRAR IRRF/INSS] | — | — | — |
| 148 | ENVIO DE NOTA FISCAL - [SERVIÇO AUTOMÁTICO] | Service Task | Sistema | `G12.servicetask148.js` |
| 149 | Intermediário (erro) | Boundary error | — | anexado a `servicetask148` |
| 150 | TRATAMENTO DE ERRO [ENVIO DA NOTA FISCAL] | User Task | Usuário fixo | — |
| 157 | VALIDAÇÃO DE NOTA FISCAL | Service Task | Sistema | `G12.servicetask157.js` |
| 158 | TRATAMENTO DE ERRO [VALIDAÇÃO DA NOTA FISCAL] | User Task | Usuário fixo | — |
| 159 | Intermediário (erro) | Boundary error | — | anexado a `servicetask157` |
| 173 | **CHECAGEM DE CONTRATOS** | User Task | Mecanismo `G12-VALIDIACAO-CONTRATOS` | — |
| 177 | APROVAR | Exclusive Gateway (condição por expressão) | — | `gerAtualizacaoCNOPB()` |
| 180 | ATUALIZAR NÚMERO DO CNO | Service Task | Sistema | `G12.servicetask180.js` |
| 182/183 | Intermediário (erro) / TRATAMENTO DE ERRO [ATUALIZAÇÃO DE CNO PB] | — | Mecanismo `G12-VALIDIACAO-CONTRATOS` | — |
| 193 | BUSCAR DESCRIÇÃO E STATUS DO ERRO DE ENVIO | Service Task | Sistema | `G12.servicetask193.js` |
| 197 | Intermediário (erro) | Boundary error | — | anexado a `servicetask193` |
| 200 | BUSCAR DESCRIÇÃO E STATUS DO ERRO DE AUTORIZAÇÃO | Service Task | Sistema | `G12.servicetask200.js` |
| 202 | Intermediário (erro) | Boundary error | — | anexado a `servicetask200` |
| 222/223 | TRATAMENTO DE ERRO [AJUSTAR COMPETÊNCIA] / AJUSTAR COMPETÊNCIA | User Task / Service Task | Sistema | `G12.servicetask223.js` |
| 224 | Intermediário (erro) | Boundary error | — | anexado a `servicetask223` |
| 233 | ENVIAR NOTA | Service Task | Sistema | `G12.servicetask233.js` |
| 235/236 | TRATAMENTO DE ERRO [AJUSTE HISTÓRICO E ENVIAR] / Intermediário (erro) | — | — | — |
| 241 | Anotação "AJUSTA O HISTÓRICO DA NOTA ANTES DE ENVIAR" | Annotation (texto) | — | — |
| 242 | **CHECAGEM DE TRANSMISSÃO** | User Task | Usuário fixo | — |
| 246 | SEGUIR | Exclusive Gateway (regras automáticas por campo) | — | ver 3.5 |
| 250 | AJUSTE DE SOLICITAÇÃO [FINANCEIRO] | User Task | Mecanismo `G12-AJUSTE-SOLICITACAO` | — |
| 253 | Fim | End Event | — | — |
| 255/256 | Anotações "SETOR TÉCNICO" / "FINANCEIRO" | Annotation | — | — |

> Os números da coluna "Seq." correspondem ao **campo oculto `atividade`** do formulário (`$("#atividade").val()`), preenchido automaticamente pelo Fluig com `Number(getValue("WKNumState"))` e consumido em `displayFields.js`, `enableFields.js`, `validateForm.js`, `G12-CheckBot.js` e `G12-Toogle.js` para decidir o que mostrar/habilitar em cada etapa do processo.

### 3.4 Fluxograma textual detalhado (início ao fim)

1. **Início** → dispara automaticamente **CARREGAMENTO DE DADOS** (`servicetask9`, dataset `G12-CARREGAR-DADOS`, chave `CODCOLIGADA`+`IDMOV`). Em erro, cai em **TRATAMENTO DE ERRO [CARREGAMENTO DE DADOS]** (retrabalho manual) e retorna à mesma service task.
2. → **APROVAÇÃO SETOR TÉCNICO** (atividade 17, atribuída pelo mecanismo `G12-APROVACAO-ST`). Três saídas possíveis:
   - **CANCELAR** → link para o subprocesso **CANCELAMENO**: `servicetask30` cancela o movimento no RM (`MovCancelMovProc`) → **Fim com cancelamento de processo**.
   - **AJUSTAR SOLICITAÇÃO** → link para **AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]** (mecanismo `Executor Atividade`, retorna ao nó `startevent5`) → **Fim**.
   - **APROVAR** → segue para **CHECAGEM DE CONTRATOS**.
3. **CHECAGEM DE CONTRATOS** (atividade 173, mecanismo `G12-VALIDIACAO-CONTRATOS`). Duas saídas:
   - **AJUSTAR SOLICITAÇÃO** → mesmo destino do item 2 (retorno ao solicitante).
   - **APROVAR** (fluxo padrão) → gateway **APROVAR** (`exclusivegateway177`), decidido pela expressão `gerAtualizacaoCNOPB()` (definida em `G12.atualizaçãoCNOPB.js`):
     - `true` (coligada 2 + centro de custo da Paraíba, lista fixa de 12 códigos) → **ATUALIZAR NÚMERO DO CNO** (`servicetask180`, grava `CGC`/`CNOPRJ` no projeto do RM conforme a coligada) → segue para o item 4.
     - `false` → segue direto para o item 4.
4. **FATURAR MOVIMENTO 2.1.01 E GERAR MOVIMENTO 2.1.02** (`servicetask71`): busca `G12-EXERCICIO-FISCAL`, chama `MovFaturamentoProc` (RM), depois recarrega `G12-MOVIMENTOS-2102`, `G12-CARREGAR-DADOS` (para pegar a data de competência do novo movimento) e `G12-CARREGAR-TRIBUTOS`.
5. → **FATURAR NOTAS** (atividade 23) — atividade "hub": a partir dela o usuário pode disparar, via botões do formulário, qualquer uma das sub-rotinas abaixo (implementadas como eventos de link BPMN que levam à pool "INTEGRAÇÕES DE TRIBUTOS..." ou à pool "NFS-e") **antes** de seguir o fluxo principal:
   - **AJUSTAR IMPOSTOS DO MOVIMENTO** → `servicetask87` (grava tributos nacionais ajustados no RM via `MovMovimentoTBCData`) → retorna a "FATURAR NOTAS".
   - **CADASTRAR IMPOSTOS MUNICIPAIS** → `servicetask108` (grava `FisTrbMunicipioPrdData`) → retorna a "FATURAR NOTAS".
   - **AJUSTAR IRRF E INSS** → `servicetask118` (grava `EstPrdCfoDataBR`) → retorna a "FATURAR NOTAS".
   - **CADASTRAR IRRF / INSS** → `servicetask130` (cadastra novo IRRF/INSS via `FinIRRFData`/`MovINSSData` e vincula ao cliente) → retorna a "FATURAR NOTAS".
   - **AJUSTAR COMPETÊNCIA** → `servicetask223` (grava `DTCOMPETENCIASERVICO` em `MOVMOVIMENTOTBCDATA`) → retorna a "FATURAR NOTAS".
   - **ENVIAR NOTA FISCAL** (fluxo principal) → pool **NFS-e**: `servicetask233` (" ENVIAR NOTA") grava o histórico longo do movimento (`HISTORICOLONGO`) → segue para o envio automático.
6. **ENVIO DE NOTA FISCAL - [SERVIÇO AUTOMÁTICO]** (`servicetask148`): dispara a ação RM `MovEnviaNFSeMovAction` via `wsProcess.executeWithXmlParams`. Em erro (evento de erro anexado): `servicetask193` busca `G12-HISTORICO-NFSE` (com retry de até 5 tentativas / 3s) e grava `errorAoEnviarNotas`/`statusEnvio` → **TRATAMENTO DE ERRO [ENVIO DA NOTA FISCAL]** (atividade 150), que pode **retornar ao próprio envio** ou **retornar a "FATURAR NOTAS"**.
7. → **VALIDAÇÃO DE NOTA FISCAL** (`servicetask157`): dispara `FisNFSeRetornarNotasData` (consulta autorização/cancelamento junto à prefeitura). Em erro: `servicetask200` busca `G12-HISTORICO-NFSE` e grava `errorAoAutorizarNotas`/`statusAutorizacao` → **TRATAMENTO DE ERRO [VALIDAÇÃO DA NOTA FISCAL]** (atividade 158), com **quatro** saídas possíveis: retry da própria validação, retorno a "FATURAR NOTAS", retorno ao envio de nota, ou **FATURAR NOTA MANUALMENTE** (pula direto para "NFS-e Transmitida").
8. → **FATURAR MOVIMENTO 2.1.02 E GERAR MOVIMENTO 2.2.01** (`servicetask78`): chama novamente `MovFaturamentoProc` (2.1.02 → 2.2.01), depois recarrega `G12-MOVIMENTOS-2102` (para obter o IDMOV 2.2.01) e `G12-INFO-NFSE` (número da nota, código de verificação, datas de emissão/autorização).
9. → **NFS-e TRANSMITIDA** (atividade 61) — também alcançável diretamente pelo caminho "FATURAR NOTA MANUALMENTE" do passo 7.
10. → **CHECAGEM DE TRANSMISSÃO** (atividade 242): tela onde o usuário informa se a transmissão está correta (`infoTransmissaoCorreta`) e, se não, qual setor deve ajustar (`infoSetorAjuste`).
11. Gateway **SEGUIR** (`exclusivegateway246`, decidido por **regras automáticas de campo**, não por expressão JS):
    - `infoTransmissaoCorreta == "sim"` → **AGUARDANDO RECEBIMENTO** → **Fim**.
    - `infoSetorAjuste == "financeiro"` → **AJUSTE DE SOLICITAÇÃO [FINANCEIRO]** (mecanismo `G12-AJUSTE-SOLICITACAO`) → **Fim**.
    - `infoSetorAjuste == "tecnico"` → **AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]** (mesmo destino do item 2/3) → **Fim**.

### 3.5 Gateways e condições (transcrição literal)

**`exclusivegateway177` ("APROVAR")** — condição por expressão JavaScript:
```
1) gerAtualizacaoCNOPB() == true   → destino: servicetask180 (ATUALIZAR NÚMERO DO CNO)
2) gerAtualizacaoCNOPB() == false  → destino: servicetask71  (FATURAR MOVIMENTO 2.1.01)
```

**`exclusivegateway246` ("SEGUIR")** — condição por **regras automáticas** (campo/valor/operador), sem expressão JS:
```
1) campo "infoTransmissaoCorreta" operador(1)=igual valor "sim"       → destino: task62  (AGUARDANDO RECEBIMENTO)
2) campo "infoSetorAjuste"        operador(1)=igual valor "financeiro" → destino: link → task250 (AJUSTE FINANCEIRO)
3) campo "infoSetorAjuste"        operador(1)=igual valor "tecnico"    → destino: link → task43  (AJUSTE — RETORNAR AO SOLICITANTE)
```

### 3.6 Timers / SLA

Não foram encontrados **timer events** (BPMN Timer) no processo. Os únicos prazos identificados são atributos de **SLA administrativo** do estado inicial no export ECM (`allowanceAuthorityTime`/`frequenceAuthorityTime` = 3600s, `deadlineTime` = 60 min no estado "Início"), que controlam alertas de atraso do Fluig, não desvios de fluxo.

### 3.7 Eventos globais do processo

- **`G12.beforeStateEntry.js` → `beforeStateEntry(sequenceId)`**: executado antes de entrar em praticamente qualquer atividade humana/de serviço do processo (lista extensa de `sequenceId`, cobrindo 30 estados). A cada entrada, busca o **período de medição atual** (dataset `G12-PERIODOS-MEDICAO`, por `IDMOV`+`CODCOLIGADA`) e, em seguida, os **documentos do GED** (dataset `G12-GED`, por `CODCOLIGADA`+`IDPRJ`+`IDCONTRATO`+`PERIODO`+`REVISAO`), concatenando os resultados em `gedInfo` (formato `pasta|codigoDocumento|descricao` separado por `;`) para consumo posterior por `G12-GED.js` no front-end.
- **`G12.atualizaçãoCNOPB.js` → `gerAtualizacaoCNOPB()`**: função pura usada apenas como condição do gateway 177; retorna `true` somente quando `CodColigada == 2` **e** `centro_de_custo` pertence à lista fixa de 12 centros de custo da Paraíba.

---

## 4. Mecanismos de Atribuição (Mechanisms)

Mecanismos Fluig implementam `function resolve(process, colleague)` e devolvem uma `java.util.ArrayList` de usuários (`Colleague`) ou grupos (`Pool:Group:...`) que receberão a tarefa.

### 4.1 `G12-APROVACAO-ST.js`
- **Usado por:** atividade 17 (APROVAÇÃO SETOR TÉCNICO).
- **Entrada:** `centro_de_custo`, `CodColigada` (via `hAPI.getCardValue`).
- **Lógica ativa:** retorna sempre o usuário fixo `4ef20412-7687-40a4-b1c8-095c0a92503e` (apelidado "Fluig" nos comentários).
- **Observação relevante:** existe um extenso bloco (≈115 linhas) **totalmente comentado** com uma tabela de roteamento por centro de custo → usuário nomeado (dezenas de colaboradores, ex. "Higor Wesley", "Vanylk Souza", "Sérgio Franco" etc.), segmentada por `CodColigada` (1, 2, 3). Esse bloco está desativado — hoje **todas** as aprovações vão para o usuário fixo, independentemente do centro de custo/coligada. Ver seção 15 (riscos).

### 4.2 `G12-CONTRATOS-VALIDA.js`
- **Propósito declarado no cabeçalho:** "Mecanismo de atribuição de usuário para validação de contratos".
- **Lógica ativa:** retorna sempre o mesmo usuário fixo `4ef20412-7687-40a4-b1c8-095c0a92503e` (com bloco comentado de roteamento por centro de custo, semelhante ao 4.1, incluindo nomes com problemas de codificação de caracteres, ex. `"S�?©rgio Franco"`).
- **⚠️ Não referenciado no BPMN analisado** (`workflow/diagrams/G12.process` não usa `G12-CONTRATOS-VALIDA` como `managerAssignmentControllerString` de nenhuma atividade). Ver seção 15 — possível código morto/mecanismo substituído por `G12-VALIDIACAO-CONTRATOS`.

### 4.3 `G12-VALIDIACAO-CONTRATOS.js`
- **Usado por:** atividade 173 (CHECAGEM DE CONTRATOS) e atividade 183 (TRATAMENTO DE ERRO [ATUALIZAÇÃO DE CNO PB]).
- **Entrada:** `centro_de_custo`, `coligada` (nome do campo em minúsculo — atenção à diferença de grafia em relação ao `CodColigada` usado nos demais mecanismos), `filial`.
- **Lógica ativa:**
  - `CodColigada == 2` e centro de custo em uma lista de 12 códigos da Paraíba → grupo `Pool:Group:G12-ANALISECONTRATOS-PB`; caso contrário → `Pool:Group:G12-ANALISECONTRATOS-GERAL`.
  - `CodColigada == 1`: `Filial` 1 ou 5 → `Pool:Group:G12-ANALISECONTRATOS-DFGO`; senão → `GERAL`.
  - `CodColigada == 3`: `Filial == 2` → `DFGO`; senão → `GERAL`.

### 4.4 `G12-AJUSTE-SOLICITACAO.js`
- **Usado por:** atividade 250 (AJUSTE DE SOLICITAÇÃO [FINANCEIRO]).
- **Entrada:** `centro_de_custo`, `CodColigada`.
- **Lógica:** roteia por grupo conforme a coligada:
  - `2` → `Pool:Group:G12-ENGPAC-AJUSTELICITACOES-FINANCEIRO`
  - `1` → `Pool:Group:G12-GENNESIS-AJUSTELICITACOES-FINANCEIRO`
  - `3` → `Pool:Group:G12-ECONTECX-AJUSTELICITACOES-FINANCEIRO`
  - outro → `Pool:Group:G12-AJUSTE-SEM GRUPO`

---

## 5. Service Tasks (`workflow/scripts/*.js`)

Todas seguem o padrão `function servicetaskNN(attempt, message) {...}` (assinatura padrão de Service Task Fluig) e usam `hAPI.getCardValue`/`hAPI.setCardValue` para ler/gravar campos do card (formulário) do processo. A autenticação com o RM é obtida via dataset auxiliar `ds_Constantes` (função local `getConstante("rm_usuario")`/`getConstante("rm_senha")`), **exceto** em `servicetask9` e `servicetask30`, que usam o dataset `dsTBCConnector`. Ambos os datasets são **externos ao repositório** (globais do ambiente Fluig).

| Script | Atividade | Entrada (card) | Integração RM | Saída (card) | Tratamento de erro |
|---|---|---|---|---|---|
| `G12.servicetask9.js` | 9 | `CodColigada`, `IdMov` | Dataset `G12-CARREGAR-DADOS` | ~50 campos do formulário (projeto, contrato, prestador, tomador, item, histórico) | `throw` propaga para o evento de erro anexado (→ task13) |
| `G12.servicetask30.js` | 30 | `CodColigada`, `IdMov`, `numeroMov` | `wsProcess.executeWithParams("MovCancelMovProc", XML)` | — (retorna dataset com resultado bruto) | Detecta strings `"Exception"/"erro"/"Error"` na resposta do RM e lança erro |
| `G12.servicetask71.js` | 71 | `CodColigada`, `IdMov`, `filial`, `idprj`, `idContrato`, `cidade_projeto` | 1) Dataset `G12-EXERCICIO-FISCAL`; 2) `wsProcess.executeWithParams("MovFaturamentoProc", ...)` (2.1.01→2.1.02); 3) datasets `G12-MOVIMENTOS-2102`, `G12-CARREGAR-DADOS`, `G12-CARREGAR-TRIBUTOS`, `G12-TRIBUTOS-MUNICIPAIS` | `exercicioFiscal`, `idmov2`, `dataDeCompetencia`, `tributosNacionais`, `naturezaOrcamentaria`, `irrfDoItem`, `inssDoItem`, `irrfDescricao`, `irrfAliquota`, `irrfTipoDePessoa`, `inssDescricao`, `inssAliquota`, `tributosMunicipais` | `throw e` em cada bloco `try/catch` (4 blocos independentes) |
| `G12.servicetask78.js` | 78 | `CodColigada`, `idmov2`, `filial`, `exercicioFiscal` | `wsProcess.executeWithParams("MovFaturamentoProc", ...)` (2.1.02→2.2.01) + datasets `G12-MOVIMENTOS-2102`, `G12-INFO-NFSE` | `numeroIdmov2201`, `codigoVerificacao`, `dataEmissao`, `dataAutorizacao`, `numeroNotas` | `throw` com mensagem contextual por bloco |
| `G12.servicetask87.js` | 87 | `CodColigada`, `idmov2`, campos dinâmicos `impostos_selecao___N`/`valorImposto___N`/`aliquota___N`/`baseCalculo___N` (tabela filha, até 50 linhas) | `wsDataServer.readRecord("MovMovimentoTBCData", ...)` (lê tributos atuais do movimento), mescla com o que o usuário editou no formulário, e `saveRecord("MovMovimentoTBCData", ...)` | recarrega `tributosNacionais`, `naturezaOrcamentaria`, `irrfDoItem`, `inssDoItem` via `G12-CARREGAR-TRIBUTOS` | Verifica `"Exception"/"Error"` na resposta do `saveRecord` |
| `G12.servicetask108.js` | 108 | `codigoMunicipio`, `estado_projeto`, `CodColigada`, `filial`, `idmov2`, `cidade_projeto`, `IDPRD`, campos `impostos_selecao_municipal___N`/`aliquotaMunicipal___N`/`baseReucaoMunicipal___N` | `wsDataServer.saveRecord("FisTrbMunicipioPrdData", ...)` por tributo (loop) | `tributosMunicipais` via `G12-TRIBUTOS-MUNICIPAIS` | Verifica erro por tributo individualmente |
| `G12.servicetask118.js` | 118 | `CodColigada`, `IDPRD`, `codigo_cliente`, `filial`, `idmov2`, `coligadaCliente`, `irrfCodigoAjuste`, `inssCodigoAjuste` | `wsDataServer.saveRecord("EstPrdCfoDataBR", ...)` (associa IRRF e/ou INSS ao cliente/produto) | recarrega dados via `G12-CARREGAR-TRIBUTOS` | Aborta silenciosamente se nenhum código foi selecionado |
| `G12.servicetask130.js` | 130 | Tabelas filhas `codigoIrrfCadastro___N`/`descricaoIrrfCadastro___N`/`aliquotaIrrfCadastro___N`/`codOficialIrrfCadastro___N`/`aplicavelA___N` e equivalentes de INSS, controladas por `indexIrrCadastro`/`indexInssCadastro` | `wsDataServer.saveRecord("FinIRRFData", ...)` / `saveRecord("MovINSSData", ...)` (cadastro) seguido de `saveRecord("EstPrdCfoDataBR", ...)` (vínculo ao cliente) | recarrega via `G12-CARREGAR-TRIBUTOS` | Aborta se nenhum índice de cadastro estiver presente |
| `G12.servicetask148.js` | 148 | `CodColigada`, `idmov2`, `filial` | `wsProcess.executeWithXmlParams("FisNFSeEnvioData", ...)` — payload SOAP extenso e específico do RM (`MovEnviaNFSeMovAction`), com parâmetros de contexto **hardcoded** (`$EXERCICIOFISCAL=7`, `$CODCOLIGADA=3`, `$CODFILIAL=1`, host/IP fixos) | — | `throw` se resposta contiver `Exception`/`Error` |
| `G12.servicetask157.js` | 157 | `CodColigada`, `idmov2`, `exercicioFiscal`, `cno` | `wsProcess.executeWithXmlParams("FisNFSeRetornarNotasData", ...)` (`FisNFEMunicipalAction` — consulta autorização/cancelamento), também com parâmetros de contexto hardcoded | — | `throw` se resposta contiver `Exception`/`Error` |
| `G12.servicetask180.js` | 180 | `CodColigada`, `idprj`, `CNOPB`, `filial` | `wsDataServer.saveRecord("PrjPrjData", ...)` — grava em `CGC` (se `CodColigada==2`, workaround documentado no próprio código: *"PARAMETRIZAÇÃO ERRADA NO MOMENTO"*) ou em `CNOPRJ` (demais coligadas) | — | `throw new Error` se resposta contiver `Exception`/`Error` |
| `G12.servicetask193.js` | 193 | `CodColigada`, `idmov2` | Dataset `G12-HISTORICO-NFSE` com **retry** (até 5 tentativas, 3s de intervalo, via `java.lang.Thread.sleep`) | `errorAoEnviarNotas`, `statusEnvio` | `throw` após esgotar tentativas |
| `G12.servicetask200.js` | 200 | `CodColigada`, `idmov2` | Dataset `G12-HISTORICO-NFSE` com retry (até 5 tentativas, 2s de intervalo) | `errorAoAutorizarNotas`, `statusAutorizacao` | `throw` após esgotar tentativas |
| `G12.servicetask223.js` | 223 | `CodColigada`, `idprj`, `CNOPB`, `filial`, `idmov2`, `dataDeCompetencia` | `wsDataServer.saveRecord("MOVMOVIMENTOTBCDATA", ...)` (grava `DTCOMPETENCIASERVICO` em `TMOVFISCAL`) | `CompetenciaAlterada = "1"` | `throw` com mensagem própria |
| `G12.servicetask233.js` | 233 | `CodColigada`, `idmov2`, `filial`, `historicoMovimento` | `wsDataServer.saveRecord("MovMovimentoTBCData", ...)` (grava `HISTORICOLONGO`) | — | `throw` se resposta contiver `Exception`/`Error` |

**Padrão comum de integração RM** (documentado em comentários dentro de `servicetask71.js` e replicado nos demais):
1. `ServiceManager.getService("wsProcess" | "wsDataServer")`
2. `.instantiate("com.totvs.WsProcess" | "com.totvs.WsDataServer")`
3. `.getRMIwsProcess()` / `.getRMIwsDataServer()`
4. Monta `properties` com `basic.authorization`, usuário/senha (`getConstante`), `disable.chunking`, `log.soap.messages`, `receive.timeout=180000`
5. `servico.getCustomClient(ws, properties, [])`
6. `authService.executeWithParams(...)` / `executeWithXmlParams(...)` / `saveRecord(...)` / `readRecord(...)`

---

## 6. Datasets (`datasets/*.js`)

Todos seguem o mesmo esqueleto: `function createDataset(fields, constraints, sortFields)`, autenticação via `getAccess()` (lendo `dsTBCConnector`), chamada a `ServiceManager.getService("WSCONSSQL")` → `com.totvs.WsConsultaSQL` → `authService.realizarConsultaSQL(NOME_CONSULTA, 0, "F", PARAMS)`, e conversão do XML de retorno para JSON via `org.json.XML.toJSONObject`. Todos tratam o caso de registro único (`dados.isNull(0)`) vs. múltiplos registros, e todos expõem `retornarErro(...)` (dataset de erro com coluna `ERROR`) e `onMobileSync(user) {}` (vazio — sem sincronização mobile específica).

| Dataset | Consulta SQL nomeada no RM | Parâmetros obrigatórios | Colunas retornadas | Uso |
|---|---|---|---|---|
| `G12-CARREGAR-DADOS.js` | `G12FORMULARIO` | `CODCOLIGADA`, `IDMOV` | 60 colunas: identificação do projeto, contrato, prestador (GFILIAL), tomador (FCFO), local IBS (TMOV), item (TITMMOV), histórico, CNO/ART, valores originais | Carregamento inicial do formulário (`servicetask9`) e recarregado após faturamentos para atualizar `dataDeCompetencia` |
| `G12-CARREGAR-TRIBUTOS.js` | `G12Tributos` | `CODCOLIGADA`, `IDMOV` | `TRIBUTOS_NACIONAIS`, `IRRF_DO_ITEM`, `INSS_DO_ITEM`, `IRRF_DESCRICAO`, `IRRF_ALIQUOTA`, `TIPO_DE_PESSOA`, `INSS_DESCRICAO`, `INSS_ALIQUOTA` | Recarregado por `servicetask71/87/118/130` após qualquer ajuste de tributo |
| `G12-TRIBUTOS-MUNICIPAIS.js` | `G12TRIBUMUNICI` | `IDMOV`, `CODCOLIGADA`, `NOMEMUNICIPIO` | `TRIBUTOS_MUNICIPAIS`, `CODIGO_MUNICIPIO` | Recarregado por `servicetask71/108` |
| `G12-AJUSTAR-TRIBUTOS.js` | `G12AJUSTARTRIBU` | `CODCOLIGADA`, `IDMOV` | `CODIGO`, `TIPO` | Alimenta o campo *zoom* `impostos_selecao` (modal "Ajustar Tributos do Movimento") |
| `G12-CADASTRAR-TRIBUTO-MUNICIPAL.js` | `G12TRIBMUNIZOOM` | nenhum (sem constraints) | `CODIGO` | Alimenta o zoom de cadastro de tributo municipal |
| `G12-IRRF-ZOOM.js` | `G12IRRFZOOM` | nenhum | `CODIGO_IRRF`, `DESCRICAO_IRRF` | Zoom de seleção de IRRF (ajuste) |
| `G12-INSS-ZOOM.js` | `G12INSSZOOM` | nenhum | `CODIGO_INSS`, `DESCRICAO_INSS` | Zoom de seleção de INSS (ajuste) |
| `G12-EXERCICIO-FISCAL.js` | `G12EXERCICIOFISC` | `CODCOLIGADA` | `ID_EXERCICIO` | Usado por `servicetask71` para montar o XML de faturamento |
| `G12-MOVIMENTOS-2102.js` | `G12MOV02` | `IDMOV`, `CODCOLIGADA` | **Divergência de contrato interno**: colunas declaradas em `COLUNAS` são `IDMOV`/`CODCOLIGADA`, mas a função `buildRow` lê a chave `IDMOV_DESTINO` (não presente em `COLUNAS`) — ver seção 15 (risco) | Obtém o IDMOV do movimento 2.1.02 gerado a partir do 2.1.01 |
| `G12-INFO-NFSE.js` | `G12INFONFSE` | `IDMOV`, `CODCOLIGADA` | `DATA_EMISSAO`, `DATA_AUTORIZACAO`, `NUMERO_NFSE`, `CODIGO_VERIFICACAO` | Consultado por `servicetask78` após faturar o 2.2.01 |
| `G12-HISTORICO-NFSE.js` | `G12HISTORICONFS` | `IDMOV`, `CODCOLIGADA` | `HISTORICO`, `STATUS` | Consultado com retry por `servicetask193`/`servicetask200` |
| `G12-GED.js` | `G12GED` | `CODCOLIGADA`, `IDPRJ`, `IDCONTRATO`, `PERIODO`, `REVISAO` | `NOMEPASTA`, `CODDOCUMENTO`, `DESCRICAO` | Consultado por `beforeStateEntry.js`, alimenta `gedInfo` |
| `G12-PERIODOS-MEDICAO.js` | `G12PERIODOMED` | `IDMOV`, `CODCOLIGADA` | `PERIODOMED` | Consultado por `beforeStateEntry.js`, alimenta `periodoMedicao` (pré-requisito do `G12-GED`) |

### 6.1 Observações sobre as consultas SQL

- As consultas em si (`G12FORMULARIO`, `G12Tributos`, `G12TRIBUMUNICI`, etc.) são **objetos cadastrados no RM** (consultas SQL nomeadas via `WsConsultaSQL`) — o texto SQL **não está neste repositório** e não pôde ser analisado diretamente. Apenas os nomes, parâmetros de entrada e colunas de saída consumidas pelo Fluig puderam ser confirmados.
- Todas as chamadas usam o parâmetro fixo `"F"` (formato) e código de consulta `0` — não há paginação nem filtros adicionais visíveis no lado Fluig.
- Risco de performance/latência: cada troca de atividade relevante do processo (30 estados) dispara **duas consultas SQL adicionais** (`G12-PERIODOS-MEDICAO` + `G12-GED`) via `beforeStateEntry`, mesmo quando o usuário não vai interagir com a seção de anexos/GED naquele passo.

---

## 7. Formulário — `G12.html`

### 7.1 Estrutura geral

Documento HTML único (sem uso de templates Mustache, apesar da lib estar carregada), estilizado com `fluig-style-guide` e organizado em **painéis colapsáveis** (`panel panel-default`), cada um controlado por `displayFields.js` (mostrar/ocultar `div` por `id`, conforme a atividade atual).

### 7.2 Scripts carregados (ordem no `<head>`)
```
jquery.js, jquery-ui.min.js, mustache-min.js, lordicon.js (CDN),
fluig-style-guide.min.js,
G12-Carregamento.js, G12-Main.js, G12-Zoom.js, G12-NF-e.js,
G12-TabelaDeTributos.js, G12-TributosDoMovimento.js, G12-CalcularAjusteTributos.js,
G12-TributosMunicipaisFuncoesAuxiliares.js, G12-IRRF-INSS.js, G12-GED.js,
G12-Cno.js, G12-Toogle.js, G12-CheckBot.js, G12-Anexos.js, G12-Loading.js,
G12-ChecagemTransmissao.js
+ G12-Style.css
```
> `G12-Cno.js` e `G12-Loading.js` são carregados mas **não contêm código ativo** (ver seção 15).

### 7.3 Seções (painéis) do formulário

| `div id` | Título | Campos-chave | Controlado por |
|---|---|---|---|
| `identificacaoProjetoDiv` | Identificação do Projeto | `coligada`, `filial`, `IDMOV_numero`, `idprj`, `cnpj`, `nome_filial`, `centro_de_custo`, `nome_centro_de_custo`, `codigo_do_projeto`, `descricao_projeto`, endereço do projeto, `art`, `cno` | `displayFields.js` |
| `detalhesContrato` | Detalhes do Contrato | `numero_contrato`, `tipo_contrato`, `numero_licitacao`, `codigo_cliente`, datas de contrato, `periodicidade_medicao`, `condicao_pagamento`, `nome_cliente`, `cnpjCliente`, produto, `valorBrutoOriginal`, `valorLiquidoOriginal` | `displayFields.js` |
| `historicoMovimento` | Histórico do movimento | `textarea historicoMovimento` | sempre visível; editável conforme `enableFields.js` (habilitado só na atividade 23) |
| `anexosRm` | Anexos | `div gedAnexos` (preenchido por `G12-GED.js`) | sempre visível |
| `aprovacaoSetorTecnico` | Aprovação do setor técnico | `textarea ajusteSetorTecnico` | habilitado somente na atividade 17 |
| `validacaoContratos` | Validação de contratos | `textarea ajusteContratosValidacao`, `input CNOPB` | habilitado somente na atividade 173; `CNOPB` obrigatório sob regra em `validateForm.js` |
| `tributacao` | Tributação | tabelas `tabelaTributosNacionais`/`tabelaTributosMunicipais` (geradas via JS), `dataDeCompetencia` | oculto nas atividades 17/173, visível a partir da 23 |
| `impostosajustaveis`, `cadastrotributosmunicipais`, `ajusteIrrf`, `ajusteInss`, `cadastrarIrrf`, `cadastrarInss` | 6 modais (`zoom-overlay`) de tabela pai/filho para ajuste/cadastro | tabelas dinâmicas Fluig (`wdkAddChild`), com campo `type="zoom"` ligado aos datasets de zoom (seção 6) | abertos/fechados por botões `onclick` (funções em `G12-TributosDoMovimento.js`, `G12-TributosMunicipaisFuncoesAuxiliares.js`, `G12-IRRF-INSS.js`) |
| `clienteFornecedor` | Cliente/Fornecedor | tabela de exibição `irrfInss` (montada por `G12-TabelaDeTributos.js`) | visível a partir da atividade 23 |
| `faturarNotas` | Faturar notas | `idmov2`, `ajusteContratos`, botão "Visualizar NFS-e" (`NFeModal.abrir()`) | visível a partir da atividade 23 |
| `erroEnvioDeNotasDiv` / `erroAutorizarNotas` | Erros de envio/autorização | `errorAoEnviarNotas`/`statusEnvio`, `errorAoAutorizarNotas`/`statusAutorizacao` | exibidos apenas nas atividades 150 e 158 respectivamente |
| `modalNFe` | Modal DANFSe (espelho de nota) | dezenas de `span`s preenchidos por `G12-NF-e.js` a partir dos campos ocultos do formulário | aberto via `NFeModal.abrir()` |
| `enviarNota` | Informações de envio da nota | `numeroNotas`, `codigoVerificacao`, `dataEmissao`, `dataAutorizacao`, `numeroIdmov2201`, upload de anexo `fnnotaFiscal` | visível apenas na atividade 61 |
| `checagemDeTransmissao` | Checagem de transmissão | botões `infoNfseCorretas`/`infoNfseErradas`, `financeiroReponsavel`/`tecnicoReponsavel`, `textarea ajusteTransmissao` | visível apenas na atividade 242 |
| `botChecagemInfo` | "Bot" flutuante de pendências | `img iconeChecagem`, `div inforChecagem` | sempre presente; alimentado por `G12-CheckBot.js` |

### 7.4 Campos ocultos (`type="hidden"`) relevantes

Praticamente todos os dados vindos do RM (prestador, tomador, tributação, local IBS, item, GED) são mantidos em **inputs ocultos** no topo do formulário — funcionam como "estado" client-side compartilhado entre os diversos arquivos `.js` (ex.: `tributosNacionais`, `tributosMunicipais`, `irrfDoItem`, `inssDoItem`, `gedInfo`, `periodoMedicao`, `atividade`, `infoTransmissaoCorreta`, `infoSetorAjuste`, `CompetenciaAlterada`).

---

## 8. JavaScript do Formulário — função por função

### 8.1 `G12-Main.js`
- `$(document).ready(...)`: dispara, em sequência, `dispararTributosTimeOut()`, `checkAllInfo()`, `competenciaMudou()`, `desabilitarParaAjuste()`.
- `$(document).on('change', 'input, select, textarea', ...)`: reexecuta `checkAllInfo()` a cada alteração de qualquer campo (recalcula o painel de pendências em tempo real).

### 8.2 `G12-Carregamento.js`
- `MAPA_CAMPOS`: dicionário coluna-do-dataset → id-do-campo-html (usado por `preencherFormulario`).
- `parseTributosNacionais(raw)` / `parseTributosMunicipais(raw)`: fazem *parsing* via regex de strings concatenadas vindas do RM no formato `"CODIGO: x - VALOR: y - ALIQUOTA: z - BASE: w | CODIGO: ..."` (nacionais) e `"CODIGO:x - ALIQUOTA:y - BASE REDUCAO ISS(%):z | ..."` (municipais).
- `renderizarTabelasTributacao(rawNac, rawMun, natureza)`: monta HTML de tabela Bootstrap para as duas listas de tributos e a natureza orçamentária.
- `preencherFormulario(ds)`: percorre `MAPA_CAMPOS` preenchendo os campos do formulário a partir de um dataset (usado num fluxo alternativo de carregamento client-side, função `carregarDadosContrato`); monta endereços compostos (rua+número+bairro) e chama `renderizarTabelasTributacao`.
- `mostrarErro(msg)` / `carregarDadosContrato(codColigada, idMov)`: chamam o dataset `G12-CARREGAR-DADOS` diretamente do client-side (via `DatasetFactory.getDataset`) — **rota alternativa** ao carregamento server-side feito por `servicetask9`.
- `onLoad()` / `onLoadView()` / `_renderizarVisuais(tentativas)`: hooks de carregamento do formulário; em modo de **visualização**, aguarda a restauração assíncrona dos campos pelo Fluig usando `numero_contrato` como sentinela, com até 8 tentativas de retry (500 ms cada, ~4 s no total) antes de desistir e renderizar mesmo assim.

### 8.3 `G12-TributosDoMovimento.js`
- `exibirTabelaAtualizarTributos()` / `esconderTabelaAtualizarTributos()`: toggle do modal de ajuste de tributos do movimento.
- `removerComAnimacao(botao)`: anima a remoção de uma linha da tabela filha (classe `card-removendo`, 400 ms) antes de chamar `fnWdkRemoveChild` (API nativa do Fluig para tabela pai/filho).

### 8.4 `G12-CalcularAjusteTributos.js`
- `ajustarValorTributo(campo)`: ao perder o foco do campo "Base de Cálculo" de uma linha da tabela de ajuste, lê a alíquota da mesma linha, calcula `valor = base * (aliquota/100)` (tratando vírgula decimal brasileira) e escreve o resultado formatado (4 casas decimais) no campo `valorImposto` correspondente.

### 8.5 `G12-TributosMunicipaisFuncoesAuxiliares.js`
- `exibirTabelaCdastrarMunicipais()` / `esconderTabelaCdastrarMunicipais()`: toggle do modal de tributo municipal.

### 8.6 `G12-IRRF-INSS.js`
- 6 funções de toggle (`exibir`/`esconder`) para as tabelas: ajuste de IRRF, ajuste de INSS, cadastro de IRRF, cadastro de INSS.
- `salvarIndex()` / `salvarIndexInss()`: contam quantas linhas existem na tabela de cadastro (`document.querySelectorAll`) e gravam o total nos campos ocultos `indexIrrCadastro`/`indexInssCadastro`, consumidos depois por `servicetask130`.

### 8.7 `G12-TabelaDeTributos.js`
- `CarregarTabelasDeTriutos()`: monta a tabela "Cliente/Fornecedor" (IRRF/INSS do item) e also re-renderiza as tabelas de tributos nacionais/municipais (mesma lógica de `G12-Carregamento.js`, duplicada aqui).
- `dispararTributosTimeOut()`: agenda `CarregarTabelasDeTriutos()` para 1s após o carregamento da página (dá tempo do DOM/campos ocultos serem restaurados pelo Fluig).

### 8.8 `G12-Zoom.js`
- `setSelectedZoomItem(selectedItem)`: callback padrão do componente `type="zoom"` do Fluig. Se o item selecionado pertence ao campo de ajuste de IRRF (`ajusteIrrfZoom`) ou INSS (`ajusteInssZoom`), copia código/descrição para os campos correspondentes. Caso não haja seleção, reagenda (`setTimeout` 1s) uma recarga do filtro do zoom `impostos_selecao___N` com os parâmetros `CODCOLIGADA`/`IDMOV` — comentário no código alerta que o Fluig converte `zoom` em `<select>` via WDK e por isso **não deve** ser filtrado por nome do input.

### 8.9 `G12-CheckBot.js`
- `checkAllInfo()`: função central de validação visual (não bloqueante) que:
  1. Percorre todos os `input` dentro de `#identificacaoProjetoDiv` e `#detalhesContrato` e lista, em HTML, os campos vazios.
  2. Regras específicas por atividade: na 173 (Paraíba), exige CNO ou CNOPB para os 12 centros de custo da lista fixa; na 23, exige `dataDeCompetencia` preenchida e não anterior à data atual (`valiodateCompetencia`); na 61, exige todos os campos de nota fiscal (número, código de verificação, datas, IDMOV 2.2.01, anexo da NFS-e).
  3. Após 1s (`setTimeout`), varre as linhas das tabelas de tributos nacionais/municipais já renderizadas no DOM e lista quaisquer valores vazios/zerados (`"0.0000"`, `"-"`, `"—"`).
  4. Escreve tudo em `#inforChecagem` (painel lateral flutuante).
- `valiodateCompetencia(data)`: compara a data de competência informada com "hoje" (ambas como string `pt-BR`), retornando `true` se a competência for anterior a hoje (comparação **lexicográfica de string**, não de data real — ver seção 15, risco).

### 8.10 `G12-GED.js`
- `GED()`: lê `gedInfo` (preenchido no servidor por `beforeStateEntry.js`) e `periodoMedicao`, filtra as entradas cujo "código de pasta" contém o período atual, e monta cartões HTML com link direto para `.../portal/p/1/ecmnavigation?app_ecm_navigation_doc=<codigo>` (**URL do portal Fluig hardcoded** com host `gennesisengenharia160517.fluig.cloudtotvs.com.br:1650` — ver seção 15, risco de portabilidade entre ambientes).
- Executado 1s após o `document.ready`.

### 8.11 `G12-Cno.js`
- Conteúdo **inteiramente comentado** (função `checkOnCno()` desativada). Ver seção 15.

### 8.12 `G12-Toogle.js`
- `exibitInfo()`: abre/fecha o painel do bot (`#inforChecagem`) com animação `slideDown`/`slideUp`.
- `exibirEdicaoManual()`: remove o atributo `readonly` de todos os inputs dentro de `#enviarNota` (permite preenchimento manual da nota).
- `ajusteCompetencia()`: remove `readonly` do campo `dataDeCompetencia`.
- `pickerDate(campo)`: abre o calendário nativo do Fluig (`FLUIGC.calendar`) no campo de competência, a menos que ele esteja `readonly`.
- `competenciaMudou()`: apenas na atividade 23, se `dataDeCompetencia` já tiver valor e o aviso ainda não tiver sido inserido, insere uma mensagem "A data de competência já foi alterada!" abaixo do campo.
- `desabilitarParaAjuste()`: nas atividades 250 (ajuste financeiro) e 43 (retornar ao solicitante), força **todos** os `input/textarea/button/select` da página para somente leitura e estilo acinzentado (bloqueio total de edição do formulário nessas etapas).

### 8.13 `G12-CheckagemTransmissao.js`
- `selecionarBotaoTransmissao(botao)`: alterna visualmente entre os botões "Sim"/"Não" de `infoTransmissaoCorreta`; quando "Não" é selecionado, habilita os botões de setor responsável (financeiro/técnico) e o campo de descrição do ajuste; quando "Sim", desabilita-os (`pointer-events:none`).
- `selecionarBotaoTransmissaoSetor(botao)`: define `infoSetorAjuste` como `"financeiro"` ou `"tecnico"` conforme o botão clicado.

### 8.14 `G12-NF-e.js` (módulo `NFeModal`, IIFE)
- `CAMPO_MAP`: mapeia ~20 campos ocultos do formulário para `span`s do modal DANFSe.
- `lerCampo(fieldName)`: lê o valor de um campo, priorizando o valor "Zoom" (`[name='...ZoomValue']`) quando existir, com *fallback* para `select`/`input` comuns.
- `tabelaNacionaisHtml`/`tabelaMunicipaisHtml`: geram as tabelas de tributos dentro do modal.
- `preencherModal()`: executa o mapeamento simples, resolve o "local de prestação" (`codMuniIbs`/`codUfIbs`), faz o parsing dos tributos (reaproveitando `parseTributosNacionais`/`parseTributosMunicipais` definidos em `G12-Carregamento.js`), identifica PIS/COFINS pelo código dentro da lista de tributos nacionais, e preenche vários campos como **"—" (não disponível)** por não haver dado correspondente na consulta atual (ex.: total do serviço, ISSQN retido, total de retenções, valor líquido).
- `abrir()`/`fechar()`: controla a classe `.ativo` do overlay; fecha ao clicar fora ou pressionar `ESC`.
- `imprimir()`: abre uma nova janela com CSS de impressão embutido e chama `window.print()` após 400 ms.
- Exposto globalmente como `NFeModal` com API pública `abrir/fechar/imprimir/configurar`.

### 8.15 `G12-Anexos.js`
- `anexo(event)`: roteador de ações (`upload`/`viewer`/`download`/`delete`) baseado no atributo `data-acao` do botão clicado.
- `uploadFile(fileDescription, idInput)`: aciona o input de upload nativo da aba "Anexos" do Fluig (`#ecm-navigation-inputFile-clone`), com tratamento específico para IE9 (`WCMAPI.isIe9()`).
- Listener de `change` no input clonado do Fluig: remove um anexo pré-existente com a mesma descrição (evita duplicidade), grava o nome físico do arquivo no campo correspondente, e ajusta os botões (`delete`/`download` em modo `ADD`; `delete`/`viewer` em modo `MOD`).
- `viewerFile`/`downloadFile`/`removeFileConfirm`/`removeFile`: interagem com `parent.ECM.attachmentTable` e `parent.WKFViewAttachment` para visualizar, baixar (com confirmação via `FLUIGC.message.confirm`) ou remover anexos.
- `setFilePhisicalName`, `btnState`, `displayBtnFiles`, `invisibleBtnUpload`, `invalidFilesTable`, `invalidFile`, `hasFileFluig`: funções de apoio para sincronizar o estado visual dos botões com a existência real do anexo na aba do Fluig, e para validar (nos eventos de formulário, embora não referenciadas nos 3 hooks lidos) se um anexo referenciado no campo ainda existe fisicamente na aba.

### 8.16 `G12-Loading.js`
- Arquivo **vazio** (0 bytes). Carregado no `<head>` sem efeito algum.

### 8.17 `events/displayFields.js`
- Hook Fluig `displayFields(form, customHTML)`. Lê `WKNumState` (atividade atual) e o modo do formulário (`MOD`/`ADD`/`VIEW`). Para cada uma das 7 atividades relevantes (17, 173, 23, 150, 158, 61, 242), injeta um bloco `<script>` com chamadas jQuery `show()`/`hide()` para as 12 seções principais do formulário. Também injeta 3 funções globais úteis a todo o front-end: `getAtividade()`, `getMode()`, `getMobile()`.

### 8.18 `events/enableFields.js`
- Hook Fluig `enableFields(form)`. Desabilita (`form.setEnabled(..., false)`) campos específicos quando a atividade atual **não é** a correspondente: `ajusteSetorTecnico` (só ativo na 17), `ajusteContratosValidacao`/`CNOPB` (só na 173), campos de nota fiscal (só na 61), `ajusteContratos`/`historicoMovimento` (só na 23).

### 8.19 `events/validateForm.js`
- Hook Fluig `validateForm(form)`. Única regra: na atividade 173, se o centro de custo pertencer à lista de 12 códigos da Paraíba e nem `cno` nem `CNOPB` estiverem preenchidos, lança uma exceção (`throw`) com uma mensagem HTML estilizada (incluindo uma imagem de mascote hospedada em `i.imgur.com`) exigindo o preenchimento do CNOPB.

---

## 9. CSS — `G12-Style.css`

846 linhas, organizadas em blocos temáticos sem uso de pré-processador (CSS puro):

1. **Painéis principais** (`.panel-heading`/`.panel-body` do Fluig Style Guide) — gradiente azul `rgb(15,52,96)→rgb(26,95,168)→rgb(33,118,199)`.
2. **Modal DANFSe** (`.nfe-*`): overlay fixo em tela cheia, grid responsivo (`.nfe-grid-2/3/4`), estilos de impressão (`@media print`) que escondem cabeçalho/rodapé do modal e ajustam a tabela para impressão A4.
3. **Modais "zoom"** (`.zoom-overlay`, `.zoom-modal-*`): mesmo padrão visual de overlay, reaproveitado nos 6 modais de ajuste/cadastro de tributos.
4. **Ocultação de coluna interna do Fluig**: seletor `:first-child` em 6 tabelas específicas (`#tblajustarimpostos`, `#tblcadastrotributosmuni`, `#tblAjusteIrrf`, `#tblajusteInss`, `#tblcAdastrarIrrf`, `#tblCadastrarInss`) para esconder a coluna de ID interno que o Fluig injeta automaticamente em tabelas pai/filho.
5. **Cartões do GED** (`.ged-*`): layout de lista de documentos com ícone, nome (truncado com `ellipsis`) e botão de visualização.
6. **"Bot" de checagem** (`#botChecagemInfo`, `#cabecalhoBot` com animação `pulseColor` contínua, `#inforChecagem`): painel flutuante posicionado com `position: fixed` em unidades `vw/vh` (risco de responsividade — ver seção 15).
7. **Botões de checagem de transmissão** (`.botaoTransmissao`): efeito hover de elevação (`translateY(-5px) scale(1.10)`).
8. Media queries de responsividade (`max-width: 640px`) para o modal DANFSe e os cartões do GED.

---

## 10. Integrações — Detalhamento

### 10.1 TOTVS RM via SOAP

| Serviço Fluig | Classe RM | Uso |
|---|---|---|
| `WSCONSSQL` | `com.totvs.WsConsultaSQL` | Todas as 13 consultas SQL nomeadas dos datasets (seção 6) |
| `wsProcess` | `com.totvs.WsProcess` | Ações complexas: `MovFaturamentoProc` (faturamento em cadeia), `MovCancelMovProc` (cancelamento), `FisNFSeEnvioData`/`MovEnviaNFSeMovAction` (envio de NFS-e), `FisNFSeRetornarNotasData`/`FisNFEMunicipalAction` (consulta de autorização/cancelamento) |
| `wsDataServer` | `com.totvs.WsDataServer` | CRUD direto: `saveRecord`/`readRecord` em `MovMovimentoTBCData` (tributos e histórico do movimento), `FisTrbMunicipioPrdData` (tributo municipal por produto), `EstPrdCfoDataBR` (IRRF/INSS por cliente×produto), `FinIRRFData`/`MovINSSData` (cadastro de novos IRRF/INSS), `PrjPrjData` (CNO do projeto), `MOVMOVIMENTOTBCDATA` (competência fiscal) |

Autenticação: **Basic Auth** com usuário/senha lidos de constantes (`ds_Constantes`: chaves `rm_usuario`/`rm_senha`) ou do dataset `dsTBCConnector` (usado apenas em `servicetask9` e nos datasets de consulta SQL) — ambos externos ao repositório.

### 10.2 Fluig — Datasets, ECM, GED, Anexos

- **Datasets**: mecanismo padrão do Fluig (`DatasetFactory`/`DatasetBuilder`) para expor dados a formulários e scripts de processo.
- **Anexos**: manipulados via API do Fluig no `parent` do iframe (`parent.ECM.attachmentTable`, `parent.WKFViewAttachment`, `parent.WCMAPI`).
- **GED**: acesso via URL direta ao módulo `ecmnavigation` do portal (não via API — simples link `<a>`).
- **Componente Zoom**: campo customizado do Fluig (`type="zoom"`, atributo `data-zoom` em JSON) que abre um seletor vinculado a um dataset (`datasetId`) com colunas configuráveis.
- **Tabela pai/filho (WDK)**: `wdkAddChild`/`fnWdkRemoveChild` — API nativa do Fluig para adicionar/remover linhas de tabelas dinâmicas dentro do formulário.

### 10.3 Recursos externos (fora do domínio Fluig/RM)

- `https://cdn.lordicon.com` — biblioteca de ícones animados (`<lord-icon>`), carregada via `<script src="https://cdn.lordicon.com/lordicon.js">` no `<head>` do formulário.
- `https://i.imgur.com/QMNgQ6x.png` (mascote de erro em `validateForm.js`) e `https://i.imgur.com/kFNXFlP.png` (ícone do bot em `G12.html`).
- Não foi identificado uso de LDAP, OAuth, JWT ou APIs REST externas no código analisado.

---

## 11. Fluxo Geral do Sistema (diagrama textual em camadas)

```
                 ┌────────────────────────────┐
                 │  Usuário (navegador/Fluig)  │
                 └──────────────┬─────────────┘
                                │  interage com
                                ▼
                 ┌────────────────────────────┐
                 │   Formulário G12.html       │
                 │  (jQuery + Fluig Style)     │
                 └──────────────┬─────────────┘
                                │  eventos DOM (change/click)
                                ▼
                 ┌────────────────────────────┐
                 │  JS client-side (18 arqs)   │  ── validações visuais, toggles,
                 │  forms/G12/*.js             │     cálculos, modal NF-e, anexos
                 └──────────────┬─────────────┘
                                │  hAPI / DatasetFactory (server-side, mesma "camada" do Fluig)
                                ▼
                 ┌────────────────────────────┐
                 │  Eventos de Form. (hooks)   │  displayFields / enableFields / validateForm
                 └──────────────┬─────────────┘
                                │
                                ▼
                 ┌────────────────────────────┐
                 │   Motor de Processo (BPMN)  │  G12.process — states, gateways, links
                 └──────────────┬─────────────┘
                                │  dispara em cada estado
                                ▼
                 ┌────────────────────────────┐
                 │   Service Tasks (13 tasks)  │  workflow/scripts/*.js
                 └──────────────┬─────────────┘
                                │  SOAP (wsProcess / wsDataServer / WSCONSSQL)
                                ▼
                 ┌────────────────────────────┐
                 │        TOTVS RM (ERP)       │  movimentos, tributos, NFS-e, projeto
                 └──────────────┬─────────────┘
                                │  retorno XML → JSON
                                ▼
                 ┌────────────────────────────┐
                 │  Datasets (13 datasets)     │  datasets/*.js
                 └──────────────┬─────────────┘
                                │  hAPI.setCardValue / preencherFormulario
                                ▼
                 ┌────────────────────────────┐
                 │  Atualização da Interface   │  campos, tabelas, modal, bot de pendências
                 └────────────────────────────┘
```

---

## 12. Dependências e Recursos Externos

| Tipo | Item | Onde é usado |
|---|---|---|
| Biblioteca JS | jQuery / jQuery UI | Todo o front-end do formulário |
| Biblioteca JS | Mustache.js | Carregada no `<head>`, **nenhum uso encontrado** nos arquivos lidos (possível dependência não utilizada) |
| Framework CSS/JS | Fluig Style Guide (`fluig-style-guide.min.css/js`) | Estilo base de todos os painéis, botões, calendário (`FLUIGC.calendar`), toasts (`FLUIGC.toast`), confirmações (`FLUIGC.message.confirm`) |
| CDN externo | Lordicon (`cdn.lordicon.com/lordicon.js`) | Ícones animados em todos os cabeçalhos de painel |
| CDN externo | Imgur (`i.imgur.com`) | Duas imagens estáticas (mascote de erro e ícone do bot) |
| API Fluig | `DatasetFactory`, `DatasetBuilder`, `ConstraintType` | Datasets e leitura de dados dentro de scripts server-side |
| API Fluig | `hAPI` | Leitura/escrita de campos do card do processo (Service Tasks, `beforeStateEntry`) |
| API Fluig | `ServiceManager` | Instanciação dos webservices SOAP do RM |
| API Fluig (front-end) | `parent.ECM`, `parent.WKFViewAttachment`, `parent.WCMAPI`, `FLUIGC.*` | Anexos, calendário, mensagens |
| Motor de scripts | Rhino (JavaScript embutido na JVM do Fluig) | Todos os scripts server-side usam classes Java diretamente (`java.lang.String`, `java.text.SimpleDateFormat`, `java.util.ArrayList`, `java.lang.Thread.sleep`) |
| Ambiente de desenvolvimento | Eclipse + TOTVS Developer Studio (TDS), natureza `com.totvs.tds.ecm.designer.nature` | Estrutura de projeto (`.project`, `.jsdtscope`) |

---

## 13. Código Morto, Duplicações e Inconsistências

| Item | Local | Descrição |
|---|---|---|
| **Arquivo vazio** | `forms/G12/G12-Loading.js` | 0 bytes; carregado no HTML sem nenhum efeito. |
| **Função inteira comentada** | `forms/G12/G12-Cno.js` | `checkOnCno()` totalmente desativada (mostrar/ocultar campo `CNOPB` por coligada+centro de custo); a exibição condicional de `CNOPB` hoje depende só de `enableFields.js`/`displayFields.js`. |
| **Mecanismo aparentemente não utilizado** | `mechanisms/G12-CONTRATOS-VALIDA.js` | Não referenciado por nenhuma atividade do BPMN analisado (`G12.process`); `G12-VALIDIACAO-CONTRATOS.js` é quem está de fato ligado à atividade 173/183. Pode ser resquício de uma versão anterior do processo. |
| **Regras de roteamento desativadas** | `mechanisms/G12-APROVACAO-ST.js`, `mechanisms/G12-CONTRATOS-VALIDA.js` | Grandes blocos (>100 linhas cada) de roteamento nominal por centro de custo estão comentados; ambos os mecanismos hoje retornam sempre o mesmo usuário fixo (`4ef20412-7687-40a4-b1c8-095c0a92503e`), independentemente da coligada/centro de custo. Isso concentra toda a aprovação técnica e toda a validação de contratos em uma única pessoa — divergindo do que o código comentado sugere ser o comportamento original/pretendido. |
| **Duplicação de lógica de renderização de tabelas de tributos** | `G12-Carregamento.js` (`preencherFormulario`/`renderizarTabelasTributacao`) vs. `G12-TabelaDeTributos.js` (`CarregarTabelasDeTriutos`) | As duas funções constroem HTML de tabela quase idêntico a partir dos mesmos campos ocultos; `CarregarTabelasDeTriutos` parece ser a versão "de produção" (chamada no `document.ready` via `dispararTributosTimeOut`), enquanto `preencherFormulario`/`carregarDadosContrato` parecem suportar uma rota alternativa client-side que não foi encontrada sendo chamada em nenhum evento do formulário lido. |
| **Possível inconsistência de dataset** | `datasets/G12-MOVIMENTOS-2102.js` | O array `COLUNAS` declara `IDMOV`/`CODCOLIGADA`, mas `buildRow` lê a chave `IDMOV_DESTINO`, que não está em `COLUNAS` nem é adicionada como coluna do dataset antes de `dataset.addRow`. Como o Fluig identifica colunas pelo índice posicional na hora de `addColumn`/`addRow`, isso é, na melhor hipótese, incoerente com a nomenclatura documentada no cabeçalho do arquivo, e no pior caso pode indicar que o valor de `IDMOV_DESTINO` nunca é de fato o esperado (a consulta `G12MOV02` pode não devolver essa coluna) — **não confirmável sem acesso à consulta SQL cadastrada no RM**. |
| **Nome de campo com capitalização divergente** | `G12.servicetask30.js` lê `hAPI.getCardValue("numeroMov")`; o campo HTML correspondente é `NumeroMov` (`id="NumeroMov"`, preenchido em `servicetask9` como `hAPI.setCardValue('NumeroMov', ...)`) | Divergência de capitalização entre gravação e leitura do mesmo campo lógico. Não foi possível confirmar neste repositório se o Fluig trata nomes de campo do card de forma case-insensitive; se não tratar, `servicetask30` sempre recebe `numeroMov` vazio/indefinido ao montar o XML de cancelamento. |
| **Validação de data por comparação de string** | `G12-CheckBot.js → valiodateCompetencia(data)` | Compara duas datas formatadas como string `pt-BR` (`dd/MM/aaaa`) usando o operador `<` de string, não conversão para `Date`/timestamp. Comparação lexicográfica de datas nesse formato não é equivalente à comparação cronológica real (ex.: "05/12/2026" vs "20/01/2026" pode comparar incorretamente dependendo dos dígitos), o que pode gerar falsos positivos/negativos no aviso de competência retroativa. |
| **Erro de digitação em nome de função** | `valiodateCompetencia` (deveria ser `validarCompetencia` ou similar) | Nome mantido conforme código-fonte. |
| **URL de ambiente hardcoded** | `G12-GED.js` | A URL de visualização de documento do GED contém o host fixo `gennesisengenharia160517.fluig.cloudtotvs.com.br:1650`, o que impede portabilidade automática entre ambientes (homologação/produção/outros tenants) sem alteração manual do código. |
| **Parâmetros de contexto hardcoded nos Service Tasks de NFS-e** | `G12.servicetask148.js`, `G12.servicetask157.js` | Os payloads SOAP contêm valores fixos como `$CODCOLIGADA=3`, `$EXERCICIOFISCAL=7`, `$CODFILIAL=1`, hostname `DESKTOP-HBHNI5F`, IP `10.0.2.3` — aparentam ser resíduos de uma gravação/captura de payload real (via ferramenta de simulação do RM) reaproveitada como template, e não parâmetros dinamicamente calculados a partir do card do processo. Isso é um **risco potencial**: se esses valores fixos não corresponderem à coligada/exercício fiscal real do movimento sendo processado, o comportamento do RM ao processar a ação pode ser inconsistente com o restante do fluxo (que já obtém `exercicioFiscal` e `codColigada` corretamente do card). Não foi possível confirmar o impacto exato sem acesso ao ambiente RM. |
| **Bot flutuante com posicionamento em viewport units** | `G12-Style.css` (`#inforChecagem`, `#cabecalhoBot`, `#botChecagemInfo img`) | Uso de `vw`/`vh` fixos para popover flutuante pode se comportar de forma inconsistente em diferentes resoluções/zoom do navegador. |
| **Função `invalidFilesTable`/`invalidFile` (G12-Anexos.js)** | Definidas mas não encontradas sendo chamadas em nenhum dos arquivos lidos (`G12.html`, demais `.js`, hooks de evento) | Possível validação de anexos preparada para uso em `validateForm.js`, mas não conectada — `validateForm.js` hoje só valida o campo `CNOPB`. |

---

## 14. Pontos Críticos, Gargalos e Riscos (síntese)

1. **Concentração de responsabilidade**: aprovação técnica (17) e validação de contratos (173/183, quando cai em erro) hoje recaem sobre o mesmo usuário fixo, por causa das regras de roteamento comentadas (seção 13) — risco operacional caso essa pessoa fique indisponível.
2. **Latência por comunicação síncrona com o RM**: cada Service Task faz pelo menos uma chamada SOAP síncrona (`receive.timeout=180000` = 3 minutos configurados), e os Service Tasks de checagem de erro (`servicetask193`/`servicetask200`) fazem *polling* bloqueante com `Thread.sleep` (até 5 tentativas), o que mantém a instância do processo ocupada por vários segundos em cada passagem por essas atividades.
3. **Múltiplas consultas SQL redundantes por transição de estado**: `beforeStateEntry.js` roda em ~30 estados diferentes e sempre executa duas consultas (`G12-PERIODOS-MEDICAO` + `G12-GED`), mesmo que o usuário não abra a aba de Anexos naquele passo.
4. **Dependência de datasets/constantes externos não documentados no repositório** (`dsTBCConnector`, `ds_Constantes`) — qualquer mudança nesses objetos globais do Fluig impacta silenciosamente todos os scripts deste processo, sem que isso seja rastreável neste código-fonte.
5. **Parâmetros hardcoded em payloads SOAP de NFS-e** (seção 13) — risco de comportamento incorreto do RM em coligadas diferentes da `3`.
6. **Ausência de validação server-side abrangente**: `validateForm.js` só cobre a obrigatoriedade do CNOPB; toda a checagem de "campos obrigatórios" (`G12-CheckBot.js`) é **apenas visual/informativa** no client-side e não impede o avanço do processo caso o usuário ignore o painel de pendências.
7. **Regra de gateway 246 depende de dois campos preenchidos manualmente** (`infoTransmissaoCorreta`, `infoSetorAjuste`) sem valor padrão — se o usuário avançar sem selecionar nenhum botão de checagem de transmissão, nenhuma das três condições do gateway é satisfeita (comportamento resultante não determinável apenas pelo código; depende da configuração padrão do motor Fluig para gateways sem regra correspondida).

---

## 15. Código morto / funções não utilizadas — ver seção 13 (consolidado ali para evitar duplicidade).

---

## 16. Limitações da Análise

Os itens abaixo **não puderam ser interpretados ou confirmados** a partir do código-fonte disponível neste repositório:

- **`workflow/.resources/HOMOLOGACAO.ws.cache`** e **`HOMOLOGACAO.ws.cache.bkp`**: arquivos binários de cache de WSDL do webservice do RM. Não é texto/XML legível linha a linha; não foi decodificado.
- **`forms/G12/.metadata`**: objeto Java serializado (stream binário, formato `ObjectOutputStream`). Foi possível identificar, por assinaturas de classe visíveis no binário, que se trata de um `FormularioServerDto`/`FormularioDto` apontando para o servidor `HOMOLOGACAO`, serviço `DSG12`, arquivo principal `G12.html` — o restante do conteúdo binário não foi decodificado byte a byte.
- **Texto das consultas SQL nomeadas no RM** (`G12FORMULARIO`, `G12Tributos`, `G12TRIBUMUNICI`, `G12AJUSTARTRIBU`, `G12TRIBMUNIZOOM`, `G12IRRFZOOM`, `G12INSSZOOM`, `G12EXERCICIOFISC`, `G12MOV02`, `G12INFONFSE`, `G12HISTORICONFS`, `G12GED`, `G12PERIODOMED`): são objetos cadastrados no RM e **não estão presentes neste repositório**. A documentação das seções 6 e 6.1 é baseada exclusivamente nos parâmetros de entrada e nas colunas de saída efetivamente consumidas pelo código Fluig.
- **Datasets globais `dsTBCConnector` e `ds_Constantes`**: não fazem parte deste repositório (são recursos configurados diretamente no ambiente Fluig); apenas seu uso (chaves lidas: `user`/`pass`, `rm_usuario`/`rm_senha`) pôde ser documentado.
- **Grupos e usuários Fluig** citados nos mecanismos (ex. `Pool:Group:G12-ANALISECONTRATOS-PB`, colleagueId `4ef20412-...`): a existência, composição atual e nomes reais desses grupos/usuários não podem ser confirmados a partir do código — apenas os identificadores literais usados.
- **`workflow/.resources/G12.png`** e **`G12.processimage.svg`**: renderizações gráficas do processo (imagem/SVG). Servem como referência visual complementar ao modelo textual do capítulo 3, mas não foram "lidas" como fonte de regras de negócio (o modelo semântico usado foi extraído da seção `bpmn2:*` do arquivo `G12.process`).
- **`forms/G12/Images/charging.gif`**: imagem binária; não foi encontrada referência a ela em nenhum dos arquivos `.js`/`.html` lidos — pode ser um recurso órfão ou usado por um mecanismo do Fluig não coberto neste código (ex. indicador de carregamento nativo do formulário).
- **Comportamento exato do motor Fluig** diante de gateways automáticos sem nenhuma condição satisfeita, tratamento de `throw` em Service Tasks (se gera reexecução automática, notificação, ou parada do processo), e semântica exata de `attempt`/`message` recebidos pelas funções `servicetaskNN(attempt, message)`: são comportamentos da **plataforma Fluig**, não do código deste projeto, e não foram documentados aqui por não serem observáveis no repositório.

---

## 17. Glossário

| Termo | Significado |
|---|---|
| **BPM** | Business Process Management — gestão de processos de negócio |
| **ECM** | Enterprise Content Management — módulo de gestão de conteúdo/documentos do Fluig (inclui o GED) |
| **Fluig** | Plataforma de portal/BPM/ECM da TOTVS |
| **RM** | TOTVS RM — sistema ERP integrado a este processo via SOAP |
| **G12** | Identificador do processo/formulário/dataset deste projeto ("Transmissão de notas") |
| **NFS-e** | Nota Fiscal de Serviço Eletrônica |
| **DANFSe** | Documento Auxiliar da NFS-e (o "espelho" visual da nota, reproduzido no modal `modalNFe`) |
| **CNO** | Cadastro Nacional de Obras (Receita Federal) |
| **CNOPB** | Campo específico do formulário para CNO de obras localizadas na Paraíba (regra de negócio própria do processo) |
| **CODCOLIGADA / coligada** | Identificador da empresa/coligada no RM |
| **IDMOV** | Identificador único de um movimento (documento fiscal/comercial) no RM |
| **IDPRJ** | Identificador do projeto no RM |
| **GFILIAL** | Tabela do RM referente à filial prestadora do serviço |
| **FCFO** | Tabela do RM referente ao cadastro de clientes/fornecedores (tomador do serviço) |
| **TMOV / TITMMOV** | Tabelas do RM referentes ao movimento e seus itens |
| **IBS** | Imposto sobre Bens e Serviços (referência de local de atuação tributária, campos `codMuniIbs`/`codUfIbs`) |
| **IRRF** | Imposto de Renda Retido na Fonte |
| **INSS** | Instituto Nacional do Seguro Social (contribuição previdenciária retida) |
| **ISS/ISSQN** | Imposto Sobre Serviços de Qualquer Natureza (tributo municipal) |
| **Dataset (Fluig)** | Objeto de acesso a dados usado por formulários/processos Fluig, implementado em JavaScript server-side (`DatasetFactory`/`DatasetBuilder`) |
| **Service Task** | Atividade automática do BPMN executada por um script server-side, sem interação humana |
| **Mechanism (mecanismo)** | Script Fluig que resolve dinamicamente para qual usuário/grupo uma atividade humana deve ser atribuída |
| **hAPI** | API Fluig disponível nos scripts de processo (Service Tasks, eventos) para ler/gravar valores do card |
| **Card** | Conjunto de valores (campos) de uma instância de processo Fluig, persistente entre atividades |
| **WDK** | Web Development Kit — camada de componentes dinâmicos do Fluig (tabelas pai/filho, zoom, etc.) |
| **Zoom (componente)** | Campo de formulário Fluig do tipo autocomplete/seleção vinculado a um dataset |
| **GED** | Gestão Eletrônica de Documentos — módulo de anexos/documentos do Fluig |
| **WSCONSSQL / wsProcess / wsDataServer** | Webservices SOAP do RM usados, respectivamente, para consultas SQL nomeadas, ações de processo complexas e CRUD direto de registros |
| **Graphiti / BPMN2 (XMI)** | Framework Eclipse usado pelo Fluig Process Designer para modelar e desenhar o processo; o arquivo `.process` é um documento XMI combinando o diagrama gráfico e o modelo semântico `bpmn2:*` |
| **Rhino** | Motor de execução JavaScript embutido na JVM, usado pelo Fluig para rodar os scripts server-side deste projeto |

---

## 18. Observações Finais

Esta documentação foi produzida por leitura completa e sistemática de todos os arquivos de código-fonte do repositório (datasets, formulário, mecanismos, service tasks, evento globais do processo, modelo BPMN e export ECM), sem qualquer alteração nos arquivos originais. Toda afirmação sobre comportamento de negócio está ancorada em trechos específicos do código citado ao longo do documento; qualquer ponto não confirmável foi isolado no capítulo 16.
