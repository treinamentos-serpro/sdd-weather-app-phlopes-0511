# Backlog de Tarefas — Weather App

As tarefas abaixo derivam de `plans/weather-app-plan.md`. Dentro de cada entrega, a ordem respeita as dependências; tarefas independentes podem ser executadas em paralelo quando seus pré-requisitos estiverem concluídos.

## Entrega 1 — Domínio e funções puras

### T-01 — Definir os tipos de domínio

- **Descrição:** declarar os contratos TypeScript para unidade, cidade, condições atuais, dia da previsão, dados meteorológicos e estados do fluxo, mantendo temperaturas em Celsius e valores ausentes como `null`.
- **Critérios de aceite:**
  - Os tipos representam os campos necessários do plano e da Open-Meteo.
  - `WeatherData` contém fuso, deslocamento UTC e instante de recebimento.
  - A previsão pode manter cinco posições, mesmo quando uma data ou métrica estiver indisponível.
  - A verificação TypeScript do projeto passa.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-02 — Implementar conversão e formatação meteorológica

- **Descrição:** implementar funções puras para conversão/arredondamento de temperatura, formatação de datas locais em pt-BR e mapeamento de códigos WMO.
- **Critérios de aceite:**
  - A conversão C/F segue as fórmulas da spec, arredonda ao inteiro mais próximo e resolve empates afastando de zero.
  - A formatação diferencia Hoje, Amanhã e os demais dias sem converter a data local para o fuso do dispositivo.
  - Códigos WMO conhecidos têm descrição em pt-BR; código desconhecido retorna fallback sem lançar erro.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/format.ts`, `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

### T-03 — Testar funções puras do domínio

- **Descrição:** cobrir conversões, arredondamento, formatação de datas e interpretação de códigos WMO com testes determinísticos.
- **Critérios de aceite:**
  - Há testes para C→F, F→C, valores negativos e empates positivos/negativos.
  - Há testes para Hoje, Amanhã, mudança de mês/ano e fallback de WMO desconhecido.
  - `pnpm test` executa os testes sem chamadas de rede.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

## Entrega 2 — Integração Open-Meteo

### T-04 — Implementar busca de geocoding

- **Descrição:** consultar o endpoint de geocoding, normalizar o termo sem remover pontuação válida e mapear até cinco resultados para `City`.
- **Critérios de aceite:**
  - Envia `name`, `count=5`, `language=pt` e `format=json`.
  - Mapeia `id`, `name`, `country`, `admin1`, `latitude` e `longitude`; campos geográficos ausentes ficam `null`.
  - Lista vazia retorna resultado vazio; falhas HTTP, de rede, JSON e timeout são erros, não resultados vazios.
  - A chamada tem timeout de 10 segundos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-05 — Implementar consulta de condições e previsão

- **Descrição:** consultar current e daily, validar a resposta e mapear os dados para `WeatherData`, mantendo as cinco datas no fuso local da cidade.
- **Critérios de aceite:**
  - Envia coordenadas, campos `current` e `daily`, `forecast_days=5`, `timezone=auto` e unidades definidas no plano.
  - Mapeia os campos por nome e os arrays diários pelo mesmo índice.
  - Métricas ausentes/null ficam `null`; não são convertidas para zero nem removem a posição do dia.
  - Ausência do envelope `current` ou `daily`, unidades incompatíveis ou resposta inválida gera erro recuperável.
  - Captura `timezone`, `utc_offset_seconds` e `receivedAt`; aplica timeout de 10 segundos.
- **Dependências:** T-01, T-02, T-04.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-06 — Testar contratos dos serviços

- **Descrição:** testar URLs, parâmetros, mapeamento e falhas dos endpoints usando `fetch` controlado, sem depender da rede pública.
- **Critérios de aceite:**
  - Geocoding cobre zero, um e múltiplos resultados, normalização e campos ausentes.
  - Forecast cobre mapeamento de current/daily, cinco datas, valores parciais/null, fuso e unidades.
  - HTTP não bem-sucedido, erro de JSON, rede, timeout e envelope inválido são distinguidos de busca sem resultados.
  - As chamadas usam o timeout definido de 10 segundos.
- **Dependências:** T-04, T-05.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

## Entrega 3 — Estado e interface principal

### T-07 — Criar componentes de estado da tela

- **Descrição:** apresentar estados inicial, carregamento, vazio e erro com mensagens compreensíveis e ação de retry no erro.
- **Critérios de aceite:**
  - Estado inicial orienta a busca sem exibir dados ou solicitar geolocalização.
  - Loading é perceptível; vazio não é confundido com erro.
  - Estado de erro recebe mensagem e callback de retry, sem expor detalhes técnicos.
  - Estados têm semântica acessível e foco operável por teclado.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

### T-08 — Implementar busca e seleção de cidades

- **Descrição:** criar formulário de envio explícito e lista de resultados para escolha manual quando houver múltiplas cidades.
- **Critérios de aceite:**
  - Campo vazio/espaços não dispara busca e informa que é necessário digitar uma cidade.
  - Formulário não solicita geocoding enquanto a pessoa digita.
  - Resultados exibem cidade, país e região quando disponível, com limite de cinco.
  - Cada resultado pode ser selecionado por mouse e teclado.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI.

### T-09 — Implementar o hook de orquestração

- **Descrição:** centralizar busca, seleção, consulta, retry e os status `idle`, `loading`, `success`, `error` e `empty`.
- **Critérios de aceite:**
  - Zero resultados produz `empty`; um resultado inicia forecast automaticamente; múltiplos resultados ficam em `success` de busca até seleção.
  - `loading` e `error` preservam operação e contexto necessários para retry da mesma busca ou cidade.
  - Retry é manual e reexecuta a operação original.
  - Resposta obsoleta não substitui os dados da cidade selecionada mais recentemente.
- **Dependências:** T-01, T-04, T-05.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.

### T-10 — Implementar apresentação do clima e controle de unidade

- **Descrição:** exibir dados atuais, cinco dias e controle Celsius/Fahrenheit; derivar valores convertidos durante a renderização.
- **Critérios de aceite:**
  - Condições atuais exibem temperatura, condição, umidade, vento, pressão e precipitação com unidades especificadas.
  - Previsão exibe cinco datas locais, mínima/máxima e probabilidade máxima de precipitação.
  - Dados ausentes aparecem indisponíveis sem ocultar campos/datas disponíveis.
  - Alternar unidade atualiza temperaturas e rótulos sem nova requisição meteorológica.
  - Data/hora e deslocamento UTC são exibidos; dados com mais de 60 minutos são sinalizados como desatualizados.
- **Dependências:** T-01, T-02, T-07.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

### T-11 — Compor os fluxos no App

- **Descrição:** conectar busca, estados da tela, seleção, hook, clima atual, previsão e estado local da unidade.
- **Critérios de aceite:**
  - A tela inicial, busca, lista de cidades, forecast e estados vazio/erro/loading são alcançáveis pelo fluxo definido.
  - Um resultado é selecionado automaticamente; múltiplos exigem seleção.
  - Unidade inicial é Celsius e é propagada aos componentes de temperatura.
  - A aplicação não solicita geolocalização nem persiste preferências nesta versão.
- **Dependências:** T-07, T-08, T-09, T-10.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

## Entrega 4 — Testes de interação e ponta a ponta

### T-12 — Testar componentes e hook

- **Descrição:** validar estados, acessibilidade básica, seleção, retry e ausência de chamadas extras ao alternar unidade.
- **Critérios de aceite:**
  - Testes cobrem os cinco status e as duas operações do hook.
  - Testes cobrem input vazio, múltiplos resultados, seleção automática e seleção manual.
  - Retry preserva termo/cidade; erro e empty têm apresentações distintas.
  - Alternância C/F não chama novamente o serviço de forecast.
- **Dependências:** T-07, T-08, T-09, T-10, T-11.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`, `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`, `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-13 — Cobrir fluxos principais com E2E

- **Descrição:** validar a jornada completa de busca até dados atuais/previsão e os caminhos de recuperação.
- **Critérios de aceite:**
  - E2E cobre busca sem resultados, resultado único, resultados múltiplos, consulta de cinco dias e troca C/F.
  - E2E cobre falha de geocoding/forecast, timeout simulado e retry preservando a operação.
  - Os testes usam respostas controladas, sem depender de chamadas reais ao Open-Meteo.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

## Entrega 5 — Qualidade e prontidão de produção

### T-14 — Verificar responsividade, acessibilidade e compatibilidade

- **Descrição:** validar os fluxos principais nos viewports e navegadores definidos na spec e corrigir bloqueios encontrados.
- **Critérios de aceite:**
  - Não há rolagem horizontal ou perda de controles em 320, 375, 768, 1024, 1440 e 1920 px.
  - Fluxos principais são operáveis por teclado, com foco visível, nomes acessíveis e contraste WCAG 2.2 AA.
  - Verificação é executada nas versões atuais e imediatamente anteriores dos navegadores listados em RNF7.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/components/**/*.tsx`, `src/styles/index.css`, `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-15 — Validar usabilidade com participantes

- **Descrição:** conduzir teste moderado dos fluxos centrais com participantes que representem as personas da spec.
- **Critérios de aceite:**
  - Participam pelo menos cinco pessoas.
  - Pelo menos quatro encontram uma cidade e identificam as condições atuais em até 30 segundos, sem ajuda.
  - Pelo menos quatro identificam os cinco dias e alternam a unidade em até 60 segundos, sem ajuda.
  - Resultados, bloqueios observados e recomendações ficam registrados.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/usability/weather-usability-plan.md`, `tests/usability/weather-usability-results.md`.
- **Tipo:** Test.

### T-16 — Medir metas de performance

- **Descrição:** executar a medição de busca e consulta sob o perfil de rede definido em RNF4.
- **Critérios de aceite:**
  - Ambiente de teste aplica 10 Mbps down, 2 Mbps up e 100 ms RTT.
  - Pelo menos 95 de 100 buscas terminam em até 3 segundos.
  - Pelo menos 95 de 100 consultas apresentam clima atual e cinco posições da previsão em até 3 segundos.
  - Resultados e ambiente ficam registrados para revisão.
- **Dependências:** T-06, T-13.
- **Arquivos prováveis:** `tests/e2e/weather-performance.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-17 — Configurar verificação sintética de disponibilidade

- **Descrição:** agendar smoke test do fluxo de consulta em São Paulo e registrar sucesso/falha conforme RNF6.
- **Critérios de aceite:**
  - Verificação executa a cada cinco minutos para as coordenadas -23.5505, -46.6333.
  - Só conta sucesso quando current e cinco posições forecast são apresentados em até 10 segundos.
  - Falha externa também é reportada como falha do fluxo; não há chave secreta necessária.
- **Dependências:** T-13.
- **Arquivos prováveis:** `.github/workflows/weather-availability.yml`, `tests/e2e/weather-smoke.spec.ts`.
- **Tipo:** Infra.

### T-18 — Aprovar uso do Open-Meteo para lançamento

- **Descrição:** confirmar termos, cobertura, limites de chamadas e atribuição para o uso público planejado.
- **Critérios de aceite:**
  - Termos e limites aplicáveis estão verificados e registrados.
  - Cobertura é validada para as localidades pretendidas.
  - A atribuição exigida aparece no produto/documentação.
  - Lançamento público não ocorre enquanto a validação não estiver concluída.
- **Dependências:** T-04, T-05.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `README.md`, `src/App.tsx`.
- **Tipo:** Infra.

### T-19 — Executar gates de qualidade do projeto

- **Descrição:** executar e corrigir os gates definidos no plano após a integração das entregas.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com sucesso.
  - Nenhum erro ou falha conhecida permanece sem registro e triagem.
- **Dependências:** T-03, T-06, T-12, T-13, T-14, T-15, T-16, T-17, T-18.
- **Arquivos prováveis:** `package.json`, arquivos em `src/` e `tests/` que precisem de correção.
- **Tipo:** Infra.