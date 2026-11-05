# Backlog de Tarefas — Weather App

As tarefas derivam de `plans/weather-app-plan.md`. Cada item tem foco testável, tipo único e no máximo dois arquivos principais. Dependências apontam para tarefas anteriores; atividades sem dependências entre si podem ocorrer em paralelo.

## Entrega 1 — Contratos e funções puras

### T-01 — Definir os tipos de domínio
- **Descrição:** declarar contratos TypeScript compartilhados, com temperaturas internas em Celsius e dados ausentes em `null`.
- **Critérios de aceite:**
  - Existem `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `TemperatureUnit` (`'celsius' | 'fahrenheit'`).
  - `WeatherData` inclui fuso, deslocamento UTC, instante de recebimento e previsão de cinco posições.
  - A verificação TypeScript passa em modo strict.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-02 — Implementar conversão de temperatura
- **Descrição:** implementar conversão e formatação de temperatura a partir de Celsius.
- **Critérios de aceite:**
  - Conversões C/F seguem as fórmulas da spec.
  - O resultado é arredondado para inteiro, com empates afastados de zero.
  - A função é pura e não armazena valores convertidos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-03 — Implementar formatação de datas e códigos WMO
- **Descrição:** adicionar formatação de data local e mapeamento de condições meteorológicas.
- **Critérios de aceite:**
  - Datas usam “Hoje”, “Amanhã” e `DD MMM` em pt-BR sem aplicar o fuso do dispositivo.
  - Códigos WMO suportados retornam descrição em pt-BR; desconhecidos retornam fallback.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`, `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

### T-04 — Testar conversão de temperatura
- **Descrição:** cobrir conversões C/F e regra de arredondamento.
- **Critérios de aceite:**
  - Testa ambas as direções, temperaturas negativas e valores terminados em 0,5.
  - Empates positivos e negativos arredondam para longe de zero.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-05 — Testar datas e códigos meteorológicos
- **Descrição:** cobrir rótulos locais, limites de calendário e fallback WMO.
- **Critérios de aceite:**
  - Testa Hoje, Amanhã, mudança de mês/ano e abreviação de mês em pt-BR.
  - Testa código WMO conhecido e desconhecido.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

## Entrega 2 — Integração Open-Meteo

### T-06 — Implementar serviço de geocoding
- **Descrição:** consultar o endpoint de busca e mapear até cinco resultados para `City`.
- **Critérios de aceite:**
  - Envia termo normalizado, `count=5`, `language=pt` e `format=json`.
  - Mapeia ID, nome, país, região, latitude e longitude; campos geográficos ausentes ficam `null`.
  - Resultado vazio é distinto de falha HTTP, rede, JSON ou timeout.
  - A chamada expira após 10 segundos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-07 — Implementar serviço de forecast
- **Descrição:** consultar condições atuais e previsão diária e mapear a resposta para `WeatherData`.
- **Critérios de aceite:**
  - Envia `current`, `daily`, `forecast_days=5`, coordenadas, unidades e `timezone=auto` definidos no plano.
  - Mapeia arrays pelo mesmo índice e mantém cinco datas no fuso local.
  - Métricas ausentes ficam `null`; envelope `current`/`daily` ausente ou resposta inválida gera erro recuperável.
  - Captura fuso, deslocamento UTC e `receivedAt`; timeout de 10 segundos.
- **Dependências:** T-01, T-03, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-08 — Testar contratos dos serviços
- **Descrição:** testar os dois endpoints com `fetch` controlado, sem depender da rede pública.
- **Critérios de aceite:**
  - Geocoding cobre zero, um e múltiplos resultados, normalização e campos ausentes.
  - Forecast cobre mapeamento, cinco posições, valores parciais, fuso e unidades.
  - HTTP, rede, JSON inválido, timeout e envelope inválido não são confundidos com resultado vazio.
- **Dependências:** T-06, T-07.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

## Entrega 3 — Componentes e fluxo principal

### T-09 — Implementar estado inicial e vazio
- **Descrição:** apresentar orientação inicial e estado de busca sem resultados.
- **Critérios de aceite:**
  - Estado inicial orienta a busca manual, sem dados meteorológicos ou solicitação de geolocalização.
  - Busca sem correspondência mostra mensagem distinta de erro.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-10 — Implementar estados de carregamento e erro
- **Descrição:** apresentar progresso e falha recuperável com ação de retry.
- **Critérios de aceite:**
  - Loading é perceptível.
  - Erro recebe mensagem e callback de retry sem expor detalhes técnicos.
  - Os estados são nomeados e operáveis por teclado.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

### T-11 — Implementar formulário de busca
- **Descrição:** permitir envio explícito de um nome de cidade.
- **Critérios de aceite:**
  - Campo vazio/espaços não dispara busca e informa o que falta.
  - Busca inicia somente no envio, sem sugestões enquanto digita.
  - Formulário tem label acessível e funciona por teclado.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.

### T-12 — Implementar lista de cidades
- **Descrição:** apresentar resultados de geocoding para escolha explícita quando houver múltiplas cidades.
- **Critérios de aceite:**
  - Cada resultado mostra cidade, país e região quando disponíveis.
  - Cada opção pode ser selecionada por mouse ou teclado.
  - A lista suporta até cinco resultados.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI.

### T-13 — Implementar hook de orquestração
- **Descrição:** controlar busca, seleção, consulta, retry e os estados `idle`, `loading`, `success`, `error` e `empty`.
- **Critérios de aceite:**
  - Zero resultados produz `empty`; um resultado inicia forecast; múltiplos aguardam seleção.
  - Erros preservam termo ou cidade para retry manual da mesma operação.
  - Resposta obsoleta não substitui dados da cidade mais recente.
- **Dependências:** T-01, T-06, T-07.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.

### T-14 — Implementar componente de condições atuais
- **Descrição:** apresentar dados atuais e referência temporal da cidade selecionada.
- **Critérios de aceite:**
  - Exibe temperatura, descrição, umidade, vento, pressão e precipitação com unidades definidas.
  - Campos ausentes aparecem como indisponíveis.
  - Exibe horário/fuso e sinaliza dados acima de 60 minutos como desatualizados.
- **Dependências:** T-01, T-02, T-03.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.

### T-15 — Implementar componentes da previsão
- **Descrição:** apresentar as cinco datas e suas métricas diárias.
- **Critérios de aceite:**
  - Exibe cinco posições no fuso local, com mín/máx, condição e probabilidade de precipitação.
  - Dia ou campo ausente mantém a posição e indica dado indisponível.
  - Datas usam formato pt-BR e temperaturas recebem a unidade por prop.
- **Dependências:** T-01, T-02, T-03.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI.

### T-16 — Implementar controle de unidade
- **Descrição:** permitir alternar entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Controle expõe C/F e tem nome acessível.
  - Mudança de opção chama o callback recebido; o componente não armazena temperaturas convertidas.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

### T-17 — Compor fluxo no App
- **Descrição:** conectar busca, estados, seleção, hook, clima, previsão e estado local da unidade.
- **Critérios de aceite:**
  - Estados inicial, loading, empty, error e resultado são alcançáveis.
  - Resultado único é selecionado automaticamente; múltiplos exigem escolha.
  - Unidade começa em Celsius e é propagada aos componentes.
  - Não há geolocalização nem persistência de preferências na v1.
- **Dependências:** T-09 a T-16.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

## Entrega 4 — Testes por unidade de responsabilidade

### T-18 — Testar componentes de estado
- **Descrição:** verificar estado inicial, vazio, carregamento e erro.
- **Critérios de aceite:**
  - Testes distinguem `empty` de `error`.
  - Retry dispara o callback fornecido; loading e labels são encontráveis por roles/nomes acessíveis.
- **Dependências:** T-09, T-10.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.
- **Tipo:** Test.

### T-19 — Testar formulário e seleção de cidades
- **Descrição:** cobrir busca e interação com a lista de resultados.
- **Critérios de aceite:**
  - Busca vazia não chama callback; envio com termo válido chama uma vez.
  - Resultados exibem contexto geográfico e seleção funciona por teclado.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`.
- **Tipo:** Test.

### T-20 — Testar hook e transições de estado
- **Descrição:** validar a orquestração usando serviços mockados.
- **Critérios de aceite:**
  - Testa zero/um/múltiplos resultados, seleção, erro e retry com contexto preservado.
  - Resposta antiga não substitui a cidade mais recente.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-21 — Testar apresentação meteorológica
- **Descrição:** verificar renderização de condições atuais e previsão com dados completos/parciais.
- **Critérios de aceite:**
  - Unidades e campos correspondem aos valores recebidos.
  - Campos ausentes aparecem indisponíveis sem remover outros dados/dias.
  - Dados antigos mostram a indicação desatualizada.
- **Dependências:** T-14, T-15.
- **Arquivos prováveis:** `tests/unit/WeatherDisplay.test.tsx`.
- **Tipo:** Test.

### T-22 — Testar App e alternância de unidade
- **Descrição:** validar a integração da tela e a conversão derivada na renderização.
- **Critérios de aceite:**
  - Unidade inicial é Celsius; alternar atualiza valores e rótulos visíveis.
  - Alternar unidade não invoca novamente o serviço de forecast.
  - Fluxo inicial e retry chegam aos componentes corretos.
- **Dependências:** T-16, T-17.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`, `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.

### T-23 — Testar fluxos essenciais com E2E
- **Descrição:** validar a jornada completa com respostas de API controladas.
- **Critérios de aceite:**
  - Cobre busca vazia, zero/um/vários resultados, seleção, forecast, C/F, falha e retry.
  - Timeout e respostas parciais são simulados sem chamadas não determinísticas à API pública.
- **Dependências:** T-17 a T-22.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

## Entrega 5 — Validação de qualidade e prontidão

### T-24 — Verificar viewports responsivos
- **Descrição:** automatizar a verificação de layout nos tamanhos definidos pela spec.
- **Critérios de aceite:**
  - Fluxos principais são verificados em 320, 375, 768, 1024, 1440 e 1920 px.
  - Nenhum viewport apresenta rolagem horizontal ou controles inacessíveis.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`.
- **Tipo:** Test.

### T-25 — Adicionar ferramenta de auditoria de acessibilidade
- **Descrição:** incluir integração de auditoria automatizada compatível com Playwright.
- **Critérios de aceite:**
  - Dependência de desenvolvimento e lockfile são atualizados.
  - A ferramenta roda no ambiente de testes do projeto.
- **Dependências:** T-23.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Tipo:** Infra.

### T-26 — Auditar acessibilidade dos fluxos
- **Descrição:** executar análise automatizada e verificações de teclado/foco nos fluxos principais.
- **Critérios de aceite:**
  - Auditoria não reporta violações bloqueadoras WCAG 2.2 AA nos fluxos definidos.
  - Busca, seleção, retry e unidade são operáveis por teclado com foco visível.
  - Resultado fica registrado; problemas de componente retornam à tarefa UI correspondente.
- **Dependências:** T-23, T-25.
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`.
- **Tipo:** Test.

### T-27 — Validar matriz de navegadores
- **Descrição:** executar os fluxos E2E nas versões estáveis atual e anterior dos navegadores definidos na spec.
- **Critérios de aceite:**
  - Projetos cobrem Chrome, Edge, Firefox, Safari desktop, Safari iOS e Chrome Android nas versões requeridas.
  - Fluxos essenciais passam em cada projeto suportado.
- **Dependências:** T-23.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-28 — Validar usabilidade com participantes
- **Descrição:** conduzir teste moderado dos fluxos centrais com pessoas representando as personas.
- **Critérios de aceite:**
  - Participam pelo menos cinco pessoas.
  - Pelo menos quatro encontram cidade e identificam condições atuais em até 30 segundos, sem ajuda.
  - Pelo menos quatro identificam os cinco dias e alternam unidade em até 60 segundos, sem ajuda.
  - Resultados e recomendações ficam registrados.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/usability/weather-usability-plan.md`, `tests/usability/weather-usability-results.md`.
- **Tipo:** Test.

### T-29 — Medir metas de performance
- **Descrição:** executar busca e consulta sob o perfil de rede definido em RNF4.
- **Critérios de aceite:**
  - Ambiente aplica 10 Mbps down, 2 Mbps up e 100 ms RTT.
  - Pelo menos 95 de 100 buscas terminam em até 3 segundos.
  - Pelo menos 95 de 100 consultas apresentam condições atuais e cinco datas em até 3 segundos.
  - Ambiente e resultados ficam registrados.
- **Dependências:** T-08, T-23.
- **Arquivos prováveis:** `tests/e2e/weather-performance.spec.ts`.
- **Tipo:** Test.

### T-30 — Configurar verificação sintética de disponibilidade
- **Descrição:** agendar smoke test do fluxo de consulta em São Paulo conforme RNF6.
- **Critérios de aceite:**
  - Verificação roda a cada cinco minutos para -23.5505, -46.6333.
  - Só conta sucesso se a resposta não for erro e a UI apresentar condições atuais e cinco datas em até 10 segundos.
  - Falha do provedor é registrada como falha do fluxo; nenhuma chave é necessária.
- **Dependências:** T-23.
- **Arquivos prováveis:** `.github/workflows/weather-availability.yml`, `tests/e2e/weather-smoke.spec.ts`.
- **Tipo:** Infra.

### T-31 — Validar termos e cobertura do Open-Meteo
- **Descrição:** confirmar termos, limites de chamadas, cobertura e exigências de atribuição para o uso público planejado.
- **Critérios de aceite:**
  - Termos e limites aplicáveis são verificados e registrados.
  - Cobertura é confirmada para as localidades pretendidas.
  - O gate de lançamento permanece bloqueado enquanto a validação estiver pendente.
- **Dependências:** T-06, T-07.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Infra.

### T-32 — Aplicar atribuição exigida pelo provedor
- **Descrição:** conferir a atribuição existente e acrescentar o conteúdo/link exigido pelos termos aprovados.
- **Critérios de aceite:**
  - A atribuição é visível no app e em documentação pública quando requerida.
  - Texto/link corresponde aos termos registrados em T-31.
- **Dependências:** T-31.
- **Arquivos prováveis:** `src/App.tsx`, `README.md`.
- **Tipo:** UI.

### T-33 — Executar gates finais do projeto
- **Descrição:** executar a suíte e registrar o resultado sem misturar correções de funcionalidades nesta tarefa.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam.
  - Falhas encontradas são encaminhadas à tarefa responsável e retestadas antes de concluir.
  - Liberação pública aguarda a conclusão das tarefas T-31 e T-32.
- **Dependências:** T-04 a T-08, T-18 a T-32.
- **Arquivos prováveis:** `package.json`, relatórios dos comandos de validação.
- **Tipo:** Test.