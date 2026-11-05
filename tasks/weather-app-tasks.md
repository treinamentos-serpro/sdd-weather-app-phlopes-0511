# Backlog de Tarefas — Weather App

Backlog derivado de `plans/weather-app-plan.md` e rastreado à spec. A ordem das entregas segue: tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dependências sempre apontam para tarefas anteriores; tarefas independentes podem ocorrer em paralelo.

## Entrega 1 — Tipos

### T-01 — Definir os tipos de domínio
- **Descrição:** declarar contratos compartilhados com temperaturas em Celsius e dados ausentes em `null`.
- **Critérios de aceite:**
  - Existem `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `TemperatureUnit` (`'celsius' | 'fahrenheit'`).
  - `WeatherData` contém fuso, deslocamento UTC, instante de recebimento e previsão de cinco posições.
  - `pnpm build` termina sem erros TypeScript strict.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura
- **Descrição:** converter e formatar Celsius/Fahrenheit sem estado ou I/O.
- **Critérios de aceite:**
  - `0 °C` resulta em `32 °F` e `32 °F` em `0 °C`.
  - `18,6 °C` convertido para Fahrenheit é exibido como `65 °F`.
  - Empates arredondam para longe de zero: `18,5` para `19`, `-2,5` para `-3`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-03 — Implementar formatação de datas locais
- **Descrição:** formatar as datas da previsão sem conversão pelo fuso do dispositivo.
- **Critérios de aceite:**
  - Datas usam “Hoje”, “Amanhã” e `DD MMM` em pt-BR.
  - `2026-11-12` resulta em `12 Nov` independentemente do fuso do processo.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.

### T-04 — Implementar mapeamento de códigos WMO
- **Descrição:** converter códigos meteorológicos para rótulos pt-BR com fallback.
- **Critérios de aceite:**
  - Código `0` resulta em “Céu limpo”.
  - Código não mapeado resulta em “Condição desconhecida” sem lançar erro.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

## Entrega 3 — Services

### T-05 — Implementar busca de geocoding
- **Descrição:** consultar o endpoint de busca e mapear até cinco resultados para `City`.
- **Critérios de aceite:**
  - Envia termo normalizado, `count=5`, `language=pt` e `format=json`.
  - Mapeia ID, nome, país, região, latitude e longitude; campos geográficos ausentes ficam `null`.
  - Busca válida sem resultados retorna lista vazia; falha HTTP/rede/JSON/timeout retorna erro.
  - Timeout ocorre aos 10 segundos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-06 — Implementar consulta de forecast
- **Descrição:** consultar condições atuais e cinco dias e mapear para `WeatherData`.
- **Critérios de aceite:**
  - Envia os campos `current`, `daily`, coordenadas, `forecast_days=5`, `timezone=auto` e unidades definidas no plano.
  - Mantém exatamente cinco posições, mapeando todos os arrays diários pelo mesmo índice.
  - Métricas ausentes ficam `null`; envelope `current`/`daily` ausente gera erro recuperável.
  - Captura fuso, deslocamento UTC e `receivedAt`; timeout ocorre aos 10 segundos.
- **Dependências:** T-01, T-03, T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

## Entrega 4 — Hook de orquestração

### T-07 — Implementar hook de clima
- **Descrição:** coordenar geocoding, seleção, forecast, retry e status do fluxo.
- **Critérios de aceite:**
  - Busca vazia não chama service; zero resultados vai para `empty`; um resultado inicia forecast; múltiplos aguardam seleção.
  - Estados são `idle`, `loading`, `success`, `error` e `empty`.
  - Erro preserva termo/cidade para retry manual da mesma operação.
  - Resposta fora de ordem não substitui os dados da cidade selecionada mais recentemente.
- **Dependências:** T-01, T-05, T-06.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.

## Entrega 5 — Componentes

### T-08 — Implementar estado inicial e vazio
- **Descrição:** apresentar a orientação inicial e o resultado de geocoding sem correspondências.
- **Critérios de aceite:**
  - Estado inicial orienta a busca sem dados meteorológicos ou geolocalização.
  - Estado vazio informa “Nenhuma cidade encontrada” e não é anunciado como erro.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-09 — Implementar estados de loading e erro
- **Descrição:** exibir progresso e falha recuperável com retry.
- **Critérios de aceite:**
  - Loading usa `role="status"` enquanto a operação está pendente e desaparece ao concluir.
  - Erro usa `role="alert"`; o botão retry chama o callback uma vez.
  - Stack trace e URLs de API não são renderizados.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

### T-10 — Implementar formulário de busca
- **Descrição:** permitir envio explícito de um nome de cidade.
- **Critérios de aceite:**
  - Campo vazio/espaços não chama `onSearch` e mostra “É necessário digitar o nome de uma cidade”.
  - Digitar não chama `onSearch`; enviar termo não vazio chama uma vez com espaços externos removidos.
  - Label acessível e envio por teclado estão presentes.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.

### T-11 — Implementar lista de cidades
- **Descrição:** renderizar e permitir seleção de resultados múltiplos.
- **Critérios de aceite:**
  - Dois a cinco resultados exibem cidade, país e região quando disponíveis.
  - Selecionar opção chama `onSelect` uma vez com a cidade correspondente.
  - Seleção é possível por teclado; não há forecast antes da escolha.
- **Dependências:** T-01, T-07.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI.

### T-12 — Implementar componente de condições atuais
- **Descrição:** apresentar métricas atuais e referência temporal.
- **Critérios de aceite:**
  - Renderiza temperatura, condição, umidade (%), vento (km/h), pressão (hPa) e precipitação (mm) conforme props.
  - Campo `null` mostra placeholder de indisponível e não oculta os demais.
  - Idade acima de 60 minutos mostra “Desatualizado”; referência ausente marca atualidade não confirmada.
- **Dependências:** T-01, T-02, T-03, T-04.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.

### T-13 — Implementar componentes da previsão
- **Descrição:** apresentar as datas e métricas dos cinco dias.
- **Critérios de aceite:**
  - Renderiza exatamente cinco posições na ordem local, com mín/máx, condição e probabilidade (%).
  - Dia/campo ausente mantém posição e mostra placeholder.
  - Prop Celsius/Fahrenheit altera apenas valores/rótulos de temperatura.
- **Dependências:** T-01, T-02, T-03, T-04.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI.

### T-14 — Implementar controle de unidade
- **Descrição:** expor a alternância entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Oferece somente Celsius e Fahrenheit e tem nome acessível.
  - Selecionar cada opção chama callback uma vez com o valor correspondente.
- **Dependências:** T-01, T-07.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

## Entrega 6 — Integração

### T-15 — Compor a aplicação no App
- **Descrição:** conectar busca, estados, seleção, hook, clima, previsão e estado local da unidade.
- **Critérios de aceite:**
  - Os status idle/loading/empty/error/success exibem a view correspondente.
  - Um resultado seleciona a cidade automaticamente; múltiplos aguardam escolha.
  - Unidade inicial é Celsius; alterná-la atualiza props sem nova chamada a `getWeather`.
  - Abrir o app não chama geolocalização nem persiste preferências.
- **Dependências:** T-08 a T-14.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

## Entrega 7 — Testes

### T-16 — Testar conversão de temperatura
- **Descrição:** verificar conversões e regra de arredondamento.
- **Critérios de aceite:**
  - Testes cobrem C→F, F→C, temperaturas negativas e valores terminados em 0,5.
  - Empates positivos/negativos arredondam para longe de zero.
  - `pnpm test -- temperature.test.ts` passa.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-17 — Testar datas e códigos WMO
- **Descrição:** verificar datas locais e fallback meteorológico.
- **Critérios de aceite:**
  - Testa Hoje, Amanhã, transição mês/ano e `2026-11-12` → `12 Nov` em fusos diferentes.
  - Testa WMO `0` → “Céu limpo” e WMO `-1` → “Condição desconhecida”.
  - Os testes de format e weather codes passam sem rede.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

### T-18 — Testar contratos dos serviços
- **Descrição:** testar endpoints com `fetch` controlado, sem rede pública.
- **Critérios de aceite:**
  - Geocoding cobre zero/um/múltiplos resultados, normalização e campos ausentes.
  - Forecast cobre arrays, cinco posições, nulls, fuso e unidades.
  - HTTP/rede/JSON/timeout/envelope inválido são distinguíveis de resultados vazios.
  - Fake timers confirmam timeout em 10.000 ms.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-19 — Testar componentes de estado
- **Descrição:** verificar estados inicial, vazio, loading e erro.
- **Critérios de aceite:**
  - Asserções por role encontram estado vazio, `role=status` e `role=alert` nos cenários correspondentes.
  - Retry aciona o callback uma vez e é operável por teclado.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.
- **Tipo:** Test.

### T-20 — Testar busca e seleção de cidades
- **Descrição:** cobrir formulário e lista de resultados.
- **Critérios de aceite:**
  - Campo vazio não chama `onSearch`; envio válido chama uma vez com valor trimado.
  - Resultados exibem país/região; teclado seleciona exatamente a cidade ativada.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`.
- **Tipo:** Test.

### T-21 — Testar hook e transições de estado
- **Descrição:** verificar orquestração com services mockados.
- **Critérios de aceite:**
  - Testa empty, success/search, loading/weather, success/weather e error.
  - Retry de busca preserva query; retry de forecast preserva City.
  - Duas promises resolvidas fora de ordem mantêm a cidade mais recente.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-22 — Testar apresentação meteorológica
- **Descrição:** verificar componentes de clima atual e forecast.
- **Critérios de aceite:**
  - Fixtures confirmam unidades e cinco posições renderizadas.
  - Campos null são indisponíveis e valores presentes continuam visíveis.
  - Observações de 59 e 61 minutos verificam, respectivamente, ausência e presença do aviso de desatualizado.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `tests/unit/WeatherDisplay.test.tsx`.
- **Tipo:** Test.

### T-23 — Testar controle de unidade
- **Descrição:** verificar opções e callback do UnitToggle.
- **Critérios de aceite:**
  - As opções são Celsius e Fahrenheit.
  - Cada seleção emite o valor correspondente uma vez.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.

### T-24 — Testar integração do App
- **Descrição:** verificar conexão entre views, hook e estado local da unidade.
- **Critérios de aceite:**
  - App inicializa em Celsius e renderiza a view associada a cada status.
  - Retry repete a operação original.
  - Troca de unidade não chama `getWeather` novamente.
- **Dependências:** T-15, T-19, T-21, T-23.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

### T-25 — Testar E2E do fluxo principal em desktop e mobile
- **Descrição:** validar a jornada completa de busca até a previsão, incluindo alternância de unidade e viewport mobile.
- **Critérios de aceite:**
  - Com fixture de resultado único, a pessoa busca uma cidade e a UI exibe condições atuais e cinco dias da previsão.
  - A mesma jornada passa em desktop e em viewport mobile de `375 × 812` px.
  - Com múltiplos resultados, selecionar uma cidade consulta forecast apenas para a selecionada; zero resultados exibe empty.
  - Alternar para Fahrenheit atualiza as temperaturas sem uma nova chamada de forecast.
  - O teste não faz chamadas à Open-Meteo.
- **Dependências:** T-15, T-18, T-20, T-22, T-23, T-24.
- **Arquivos prováveis:** `tests/e2e/weather-main-flow.spec.ts`.
- **Tipo:** Test.

### T-26 — Testar E2E de forecast e unidade
- **Descrição:** validar condições atuais, cinco dias e alternância de unidade.
- **Critérios de aceite:**
  - Fixture exibe as métricas atuais e cinco datas com valores previstos.
  - Alternar C/F atualiza temperaturas atuais e diárias sem novo request.
  - Campos ausentes mostram placeholder sem remover dias.
- **Dependências:** T-15, T-22, T-23, T-24.
- **Arquivos prováveis:** `tests/e2e/weather-forecast.spec.ts`.
- **Tipo:** Test.

### T-27 — Testar E2E de erro e retry
- **Descrição:** validar falha de busca/forecast, timeout e recuperação manual.
- **Critérios de aceite:**
  - Fixtures de falha/timeout exibem mensagem de erro e ação de retry.
  - Retry repete o mesmo termo ou cidade e uma busca sem resultados não aparece como erro.
  - Cenários não fazem chamadas reais à Open-Meteo.
- **Dependências:** T-15, T-18, T-19, T-21, T-24.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`.
- **Tipo:** Test.

## Entrega 8 — Hardening

### T-28 — Verificar viewports responsivos
- **Descrição:** automatizar layout nos tamanhos definidos pela spec.
- **Critérios de aceite:**
  - Testa 320, 375, 768, 1024, 1440 e 1920 px.
  - Em cada viewport, `scrollWidth <= clientWidth` e busca/seleção/unidade/retry permanecem acionáveis.
- **Dependências:** T-25 a T-27.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`.
- **Tipo:** Test.

### T-29 — Adicionar ferramenta de auditoria de acessibilidade
- **Descrição:** incluir auditoria automatizada Axe compatível com Playwright.
- **Critérios de aceite:**
  - `@axe-core/playwright` está em devDependencies e lockfile atualizado.
  - `pnpm install --frozen-lockfile` termina com código zero.
- **Dependências:** T-25 a T-27.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Tipo:** Infra.

### T-30 — Auditar acessibilidade dos fluxos
- **Descrição:** executar Axe e verificações de teclado/foco nos fluxos principais.
- **Critérios de aceite:**
  - Axe reporta zero violações WCAG 2.2 A/AA nos estados inicial, resultados, vazio, erro e sucesso.
  - Busca, seleção, retry e unidade completam por teclado com foco visível.
  - Relatório registra cenário e elemento para cada falha.
- **Dependências:** T-29.
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`.
- **Tipo:** Test.

### T-31 — Validar matriz de navegadores
- **Descrição:** executar E2E nas versões estáveis atual/anterior definidas na spec.
- **Critérios de aceite:**
  - Configuração declara Chrome, Edge, Firefox, Safari desktop, Safari iOS e Chrome Android nas versões requeridas.
  - Fluxos E2E passam em cada projeto; relatório indica navegador/versão.
- **Dependências:** T-25 a T-27.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-32 — Validar usabilidade com participantes
- **Descrição:** conduzir teste moderado dos fluxos centrais com pessoas representando as personas.
- **Critérios de aceite:**
  - Participam pelo menos cinco pessoas.
  - Cada pessoa executa busca/condições atuais e previsão de cinco dias/alternância de unidade.
  - Pelo menos quatro de cinco concluem a primeira tarefa em `<= 30 s` e a segunda em `<= 60 s`, sem ajuda.
  - Registro anonimizado contém tempo, sucesso/falha e observações por tarefa.
- **Dependências:** T-25 a T-27.
- **Arquivos prováveis:** `tests/usability/weather-usability-plan.md`, `tests/usability/weather-usability-results.md`.
- **Tipo:** Test.

### T-33 — Medir performance de busca
- **Descrição:** medir busca sob o perfil de rede definido em RNF4.
- **Critérios de aceite:**
  - Ambiente aplica 10 Mbps down, 2 Mbps up e 100 ms RTT e executa 100 buscas.
  - Pelo menos 95 buscas terminam em `<= 3 s` do envio.
  - Relatório inclui perfil, amostras e tempos observados.
- **Dependências:** T-18, T-25.
- **Arquivos prováveis:** `tests/e2e/weather-search-performance.spec.ts`.
- **Tipo:** Test.

### T-34 — Medir performance de forecast
- **Descrição:** medir consulta meteorológica sob o perfil de rede definido em RNF4.
- **Critérios de aceite:**
  - Ambiente aplica 10 Mbps down, 2 Mbps up e 100 ms RTT e executa 100 consultas.
  - Pelo menos 95 consultas exibem condições atuais e cinco posições em `<= 3 s` da seleção.
  - Relatório inclui perfil, amostras e tempos observados.
- **Dependências:** T-18, T-26.
- **Arquivos prováveis:** `tests/e2e/weather-forecast-performance.spec.ts`.
- **Tipo:** Test.

### T-35 — Configurar verificação sintética de disponibilidade
- **Descrição:** agendar smoke test do fluxo de consulta em São Paulo conforme RNF6.
- **Critérios de aceite:**
  - Execução ocorre a cada cinco minutos para -23.5505, -46.6333.
  - Sucesso exige resposta sem erro e UI com condições atuais/cinco dias em `<= 10 s`.
  - Erro do provedor é contado como falha; alerta dispara se disponibilidade mensal ficar abaixo de `99,5%`.
  - Nenhuma chave de API é necessária.
- **Dependências:** T-25 a T-27.
- **Arquivos prováveis:** `.github/workflows/weather-availability.yml`, `tests/e2e/weather-smoke.spec.ts`.
- **Tipo:** Infra.

### T-36 — Validar termos e cobertura do Open-Meteo
- **Descrição:** confirmar termos, limites, cobertura e exigências de atribuição para o uso público planejado.
- **Critérios de aceite:**
  - Registro contém fonte/URL, data, termos, limite de chamadas, cobertura e atribuição requerida.
  - Resultado é `aprovado` ou `bloqueado`; sem aprovação registrada, release público não prossegue.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Infra.

### T-37 — Aplicar atribuição exigida pelo provedor
- **Descrição:** comparar a atribuição atual com os termos aprovados e aplicar apenas o que faltar.
- **Critérios de aceite:**
  - Texto/link no app é comparado com a exigência registrada em T-36.
  - Se houver exigência adicional, app/README exibem texto/link aprovado; caso contrário, verificação fica registrada sem alteração.
- **Dependências:** T-36.
- **Arquivos prováveis:** `src/App.tsx`, `README.md`.
- **Tipo:** UI.

### T-38 — Executar gates finais do projeto
- **Descrição:** executar a suíte e registrar resultados sem misturar correções de funcionalidades nesta tarefa.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com código zero.
  - Falha é associada à tarefa responsável; o comando correspondente passa após correção.
  - Release público tem aprovação T-36 e verificação T-37 concluídas.
- **Dependências:** T-16 a T-37.
- **Arquivos prováveis:** `package.json`, relatórios dos comandos de validação.
- **Tipo:** Test.

## Rastreabilidade: Requisito → Tarefas

| Requisito funcional | Tarefas de implementação | Tarefas de teste | Lacuna |
| --- | --- | --- | --- |
| RF1 — Busca e seleção de cidade | T-05, T-07, T-10, T-11, T-15 | T-18, T-20, T-21, T-24, T-25 | Nenhuma identificada |
| RF2 — Condições atuais | T-06, T-07, T-12, T-15 | T-18, T-22, T-25, T-26 | Nenhuma identificada |
| RF3 — Previsão de cinco dias | T-06, T-07, T-13, T-15 | T-18, T-22, T-25, T-26 | Nenhuma identificada |
| RF4 — Unidade de temperatura | T-02, T-14, T-15 | T-16, T-23, T-24, T-25, T-26 | Nenhuma identificada |
| RF5 — Estados e recuperação | T-05, T-06, T-07, T-08, T-09, T-15 | T-18, T-19, T-21, T-24, T-27 | Nenhuma identificada |
| RF6 — Referência temporal | T-06, T-07, T-12, T-15 | T-18, T-22 | Nenhuma identificada |