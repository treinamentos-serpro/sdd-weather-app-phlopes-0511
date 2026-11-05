# Plano Técnico — Weather App

## Architecture

Aplicação web SPA, renderizada no cliente, organizada em quatro camadas pequenas:

1. **Interface (`components/`, `App.tsx`)**: busca, seleção de cidade, alternância de unidade e apresentação dos estados de tela.
2. **Orquestração (`hooks/`)**: coordena busca, seleção, consulta meteorológica, retry e estado de carregamento.
3. **Serviços (`services/`)**: chamadas HTTP ao Open-Meteo, timeout e transformação da resposta externa para o modelo interno.
4. **Domínio (`types/`, `lib/`)**: contratos compartilhados e funções puras de conversão, formatação e interpretação de códigos meteorológicos.

Não haverá backend, autenticação, banco de dados, cache offline, persistência de preferências ou atualização periódica. As requisições ao Open-Meteo partem do navegador. A interface mantém o fluxo simples: busca enviada pelo formulário; seleção automática quando houver um único resultado; seleção manual quando houver mais de um.

## Tech Stack

- **Linguagem:** TypeScript em modo strict.
- **UI e build:** React 19 e Vite, conforme dependências existentes.
- **Estilo:** Tailwind CSS, seguindo o tema e os componentes já presentes no projeto.
- **Testes:** Vitest, Testing Library e Playwright.
- **Lint e formatação:** Biome.
- **Gerenciador:** pnpm; Node.js 22 ou superior.
- **Dependências de runtime:** manter somente React e React DOM; não adicionar biblioteca de estado, cliente HTTP ou validação de schema sem necessidade demonstrada.

## Project Structure

Manter a estrutura atual e colocar cada responsabilidade em seu diretório existente:

- `src/App.tsx`: compõe a experiência e seleciona qual estado de tela apresentar.
- `src/components/SearchBar.tsx`: formulário manual de cidade; sem sugestões enquanto digita.
- `src/components/CityResults.tsx`: lista de até cinco cidades quando a busca retorna múltiplos resultados; cada item permite seleção explícita.
- `src/components/CurrentWeather.tsx`, `ForecastList.tsx`, `ForecastCard.tsx`, `UnitToggle.tsx`: apresentação dos dados e controles.
- `src/components/states/`: estados inicial, carregamento, vazio e erro.
- `src/hooks/useWeather.ts`: fluxo de busca, seleção, consulta e nova tentativa; descarta respostas obsoletas.
- `src/services/weatherService.ts`: contratos HTTP, normalização da resposta, timeout e erros de serviço.
- `src/types/weather.ts`: tipos de domínio e estados do fluxo.
- `src/lib/temperature.ts`: conversão e arredondamento de temperatura.
- `src/lib/format.ts`: datas em pt-BR e referência temporal com fuso.
- `src/lib/weatherCodes.ts`: mapeamento dos códigos WMO para descrições em pt-BR e fallback para código desconhecido.
- `tests/unit/`: funções puras, serviço e componentes/hook.
- `tests/e2e/weather.spec.ts`: fluxos críticos de ponta a ponta.

Não criar novas camadas ou diretórios antes de surgir uma necessidade não atendida pela estrutura acima.

## Data Model

Os tipos abaixo são contratos de domínio planejados, não código final. Valores opcionais ou ausentes são representados por `null`, nunca convertidos silenciosamente em zero.

```ts
type TemperatureUnit = 'celsius' | 'fahrenheit';

type WeatherValue<T> = T | null;

interface City {
  id: number;
  name: string;
  country: string;
  region: string | null;
  latitude: number;
  longitude: number;
}

interface CurrentConditions {
  temperatureC: WeatherValue<number>;
  weatherCode: WeatherValue<number>;
  humidityPercent: WeatherValue<number>;
  windSpeedKmh: WeatherValue<number>;
  pressureHpa: WeatherValue<number>;
  precipitationMm: WeatherValue<number>;
  observedAtLocal: string | null;
  timezone: string | null;
  utcOffsetSeconds: number | null;
}

interface ForecastDay {
  date: string; // YYYY-MM-DD no fuso local da cidade
  weatherCode: WeatherValue<number>;
  minTemperatureC: WeatherValue<number>;
  maxTemperatureC: WeatherValue<number>;
  precipitationProbabilityMaxPercent: WeatherValue<number>;
}

interface WeatherData {
  city: City;
  current: CurrentConditions;
  forecast: ForecastDay[]; // cinco posições de calendário, inclusive posições indisponíveis
  receivedAt: string; // instante ISO UTC usado para avaliar a idade da observação
}
```

Invariantes:

- Temperaturas permanecem em Celsius no modelo interno; a unidade escolhida só altera apresentação.
- `forecast` mantém cinco posições ordenadas por data local; se o provedor não retornar uma data ou métrica, a posição/campo permanece e recebe `null`.
- A descrição do tempo é derivada de `weatherCode` pela tabela de interpretação WMO; códigos não mapeados usam “Condição desconhecida”.
- `observedAtLocal`, `timezone` e `utcOffsetSeconds` vêm da resposta meteorológica. Um campo ausente não deve ser inventado; a atualidade fica não confirmada quando faltarem os dados necessários.

## Data Flow

1. A pessoa envia um termo não vazio pelo formulário. A camada de domínio remove espaços externos, normaliza caracteres acentuados e caixa para a consulta, e preserva pontuação válida.
2. O serviço de geocoding solicita até cinco resultados. Zero resultados produzem estado vazio; um resultado é selecionado automaticamente; de dois a cinco, `CityResults` apresenta opções e aguarda a seleção explícita por `selectCity`.
3. A seleção fornece a identidade e as coordenadas da cidade ao serviço de previsão. A consulta inclui condições atuais, dados diários para hoje e os quatro dias seguintes e fuso `auto`.
4. O serviço valida o envelope da resposta e mapeia nomes/campos externos para os tipos de domínio. Métricas ausentes ficam `null`; resposta de topo inválida é erro recuperável.
5. A interface apresenta cidade, dados atuais, referência temporal e exatamente cinco posições de previsão. Datas seguem o fuso local da cidade.
6. A alternância C/F aplica a fórmula definida na spec e arredonda para inteiro mais próximo, com empates afastados de zero; não dispara nova consulta HTTP.
7. O hook associa cada resposta à consulta/cidade que a originou. Resposta de requisição anterior não pode substituir os dados da seleção mais recente.

## External APIs

### Open-Meteo Geocoding

- **Endpoint:** `GET https://geocoding-api.open-meteo.com/v1/search`.
- **Parâmetros:** `name` normalizado, `count=5`, `language=pt`, `format=json`.
- **Mapeamento:** `id`, `name`, `country`, `admin1`, `latitude`, `longitude` para `City`; `admin1` é opcional.
- Uma resposta válida sem resultados é estado vazio. HTTP não bem-sucedido, rede, JSON inválido ou timeout são erros de busca, nunca “cidade não encontrada”.

### Open-Meteo Forecast

- **Endpoint:** `GET https://api.open-meteo.com/v1/forecast`.
- **Parâmetros:** latitude/longitude selecionadas; `current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code`; `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`; `forecast_days=5`; `timezone=auto`; `temperature_unit=celsius`.
- **Unidades de domínio:** temperatura °C, umidade %, velocidade do vento km/h, pressão hPa, precipitação atual mm e probabilidade máxima diária de precipitação %.
- **Referência temporal:** usar `timezone`, `utc_offset_seconds` e hora local retornados pelo endpoint; não assumir o fuso do dispositivo.
- **Limite de espera:** 10 segundos por requisição. Não há retry automático; a pessoa pode acionar retry, que repete a mesma operação com o mesmo termo ou cidade.
- **Contrato externo:** não usar chave de API. Confirmar termos, atribuição, cobertura e limites de chamadas antes de lançamento público; essa validação é gate de release.

## State Management

Usar estado local do React, sem Redux, Context global ou persistência. Um único hook de orquestração mantém o estado da operação; a unidade C/F é estado de apresentação local e inicia em Celsius.

Contrato conceitual de estados discriminados:

```ts
type WeatherState =
  | { status: 'idle' }
  | { status: 'searching'; query: string }
  | { status: 'choosing-city'; query: string; cities: City[] }
  | { status: 'loading-weather'; city: City }
  | { status: 'ready'; data: WeatherData }
  | { status: 'empty'; query: string }
  | {
      status: 'error';
      operation: 'search' | 'weather';
      message: string;
      query?: string;
      city?: City;
    };
```

- Busca vazia não inicia requisição.
- Durante seleção múltipla, conservar e apresentar a lista de resultados em `CityResults` até a seleção.
- `retry` reexecuta a operação que falhou, com o termo original ou as coordenadas selecionadas.
- Preferência de unidade não persiste entre recargas na v1.

## Error Handling

- Aplicar timeout de 10 segundos a cada chamada com `AbortController`.
- Distinguir resultados vazios de erro de rede, HTTP, JSON inválido, timeout e resposta de previsão sem envelope obrigatório.
- Mostrar mensagem compreensível e ação de nova tentativa em falha; não expor stack trace, URLs com coordenadas ou detalhes internos.
- Se um campo individual estiver ausente, manter o restante dos dados e mostrar esse campo como indisponível. Se o dia estiver ausente, manter a data correspondente nas cinco posições.
- Em busca/seleção concorrente, cancelar a requisição anterior quando possível ou ignorar sua resposta por identificador monotônico; nunca exibir dados da cidade errada.
- Dados com idade superior a 60 minutos, calculada a partir de `receivedAt` e `observedAtLocal` convertidos pelo deslocamento UTC, são identificados como desatualizados. Se faltar hora, fuso ou deslocamento, indicar atualidade não confirmada.
- A nova tentativa é iniciada apenas por ação da pessoa; não implementar retry automático nem cache offline nesta versão.

## Testing Strategy

Derivar os testes da matriz de rastreabilidade na spec e nomeá-los com os IDs RF/US sempre que possível.

- **Unitários:** normalização preservando pontuação; conversão C/F e casos de empate; arredondamento; formatação de datas; idade/fuso; mapeamento de todos os códigos WMO suportados e código desconhecido.
- **Serviço:** parâmetros e mapeamento de ambas as APIs; zero resultados; resposta parcial com `null`; HTTP inválido; JSON inválido; timeout de 10 s; garantir que temperatura não é convertida no serviço.
- **Componentes/hook:** estados idle, searching, choosing-city, loading-weather, ready, empty e error; seleção automática de resultado único; `CityResults` permite seleção manual de homônimo; retry preserva operação; troca de unidade não faz novo request; resposta obsoleta não substitui a cidade atual.
- **E2E:** busca vazia, zero/um/vários resultados, consulta atual e cinco dias, troca C/F, falha e retry; repetir fluxos essenciais nos viewports definidos em RNF1 e navegadores de RNF7.
- **Acessibilidade:** análise automatizada nos fluxos principais e verificação manual de teclado, foco e leitor de tela conforme RNF5.
- **Metas operacionais:** medir os percentis de RNF4 sob o perfil de rede definido; executar verificações sintéticas de RNF6 a cada cinco minutos. Testes automatizados não devem depender de chamadas reais não determinísticas; usar fixtures para unitários/E2E e manter a verificação sintética separada.
- **Gate do projeto:** `pnpm lint`, `pnpm build`, `pnpm test` e, para a cobertura E2E, `pnpm test:e2e`.

## Risks & Trade-offs

- **Dependência direta do Open-Meteo:** reduz infraestrutura e dispensa chave, mas limita disponibilidade, latência, cobertura e termos ao provedor. Mitigar com timeout, tratamento de erro, monitoramento e gate de lançamento; não adicionar proxy/cache sem necessidade comprovada.
- **Normalização de busca:** remover diacríticos melhora a busca conforme a spec, mas não garante resultados para todos os topônimos. Preservar a pontuação, apresentar o nome oficial retornado e permitir nova busca.
- **Seleção automática de um único resultado:** reduz passos no caso inequívoco; resultados múltiplos exigem escolha para evitar previsão do local errado.
- **Sem persistência ou offline:** mantém privacidade e simplicidade, mas preferências e dados não sobrevivem à recarga nem ficam disponíveis sem rede.
- **Corte de atualidade de 60 minutos:** torna o estado testável, mas pode marcar como desatualizada uma observação que o provedor ainda considera útil. Manter o horário visível e sinalizar em vez de ocultar os dados.
- **Conformidade WCAG e matriz de navegadores:** aumentam o esforço de validação; limitar os testes à matriz e fluxos definidos na spec, sem prometer compatibilidade fora dela.
