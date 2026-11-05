# Especificação de Produto — Aplicação de Previsão do Tempo

## Overview

Aplicação web responsiva, com interface em pt-BR, para pesquisar cidades e consultar suas condições meteorológicas atuais e a previsão diária de cinco dias (hoje e os quatro dias seguintes). A temperatura pode ser alternada entre Celsius e Fahrenheit. Os dados serão obtidos do Open-Meteo, sem exigir chave de API, e o produto não terá autenticação nem persistência em servidor.

O produto atende principalmente pessoas que precisam conferir rapidamente o tempo antes de sair, planejar atividades dos próximos dias ou verificar as condições de um local durante deslocamentos. As personas e métricas de sucesso descritas no discovery são hipóteses a validar.

## Functional Requirements

- **RF1 — Busca e seleção de cidade:** apresentar um estado inicial com busca manual; permitir pesquisar cidades, mostrar resultados com nome da cidade e país e, quando disponível, estado/região, e selecionar o local cujos dados serão consultados. Normalizar acentos e diferenças entre maiúsculas e minúsculas para a busca sem remover pontuação válida do nome.
- **RF2 — Condições atuais:** após a seleção de uma cidade, exibir temperatura, descrição da condição meteorológica, umidade relativa (%), velocidade do vento (km/h), pressão (hPa) e precipitação atual (mm), usando os valores e a semântica fornecidos pelo Open-Meteo. Indicar como indisponível qualquer métrica ausente.
- **RF3 — Previsão de cinco dias:** exibir cinco posições de calendário consecutivas no fuso local da cidade selecionada, começando hoje e incluindo os quatro dias seguintes. Para cada dia, exibir temperatura mínima e máxima, condição meteorológica e probabilidade máxima de precipitação (%); indicar dados indisponíveis sem omitir a posição daquele dia.
- **RF4 — Unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e atualizar todos os valores e rótulos de temperatura apresentados, tanto nas condições atuais quanto na previsão. Converter por $°F = (°C × 9/5) + 32$ e $°C = (°F − 32) × 5/9$.
- **RF5 — Estados e recuperação:** informar à pessoa quando uma busca ou consulta estiver carregando, quando não houver resultados e quando uma busca ou consulta meteorológica falhar; oferecer nova tentativa correspondente quando houver falha ou timeout.
- **RF6 — Referência temporal:** apresentar a data e o horário local de referência das condições atuais, incluindo o deslocamento UTC do fuso da cidade. Se a observação tiver mais de 60 minutos no momento da resposta, identificá-la como desatualizada e não apresentá-la como atual.

## User Stories

- **US1 (RF1) — Busca de cidade:** Como pessoa que decide o que vestir, quero pesquisar e selecionar minha cidade para consultar os dados do local correto.
- **US2 (RF2) — Condições atuais:** Como pessoa que decide o que vestir, quero ver as condições meteorológicas atuais da cidade selecionada para me preparar antes de sair.
- **US3 (RF3) — Planejamento dos próximos dias:** Como pessoa que planeja a semana, quero consultar a previsão dos próximos cinco dias para organizar meus compromissos e atividades.
- **US4 (RF4) — Unidade preferida:** Como pessoa que planeja a semana, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US5 (RF5) — Recuperação de falhas:** Como pessoa que trabalha ou pratica atividades ao ar livre, quero entender quando uma consulta está carregando ou falhou e poder tentar novamente para obter os dados de que preciso.
- **US6 (RF6) — Atualidade dos dados:** Como pessoa que trabalha ou pratica atividades ao ar livre, quero ver a data e o horário de referência dos dados para avaliar se eles são recentes o suficiente para minha decisão.

## Acceptance Criteria

**RF1 — Busca e seleção de cidade**

- **Cenário RF1.1 — Exibir resultados desambiguados**
	- **Given** o serviço de busca retorna uma ou mais cidades com nome e país, e estado/região quando disponível
	- **When** a pessoa pesquisa por um desses nomes
	- **Then** cada resultado exibe o nome da cidade e o país, além do estado/região quando retornado pelo serviço
- **Cenário RF1.2 — Selecionar cidade**
	- **Given** a busca exibe mais de uma cidade correspondente
	- **When** a pessoa seleciona um resultado específico
	- **Then** a consulta meteorológica é feita usando a localização do resultado selecionado
- **Cenário RF1.3 — Busca sem resultados**
	- **Given** o serviço de busca retorna uma lista vazia para o termo informado
	- **When** a busca termina
	- **Then** a interface informa que nenhuma cidade foi encontrada e não apresenta dados meteorológicos como resultado daquela busca
- **Cenário RF1.4 — Busca vazia**
	- **Given** o campo de busca está vazio ou contém apenas espaços
	- **When** a pessoa tenta pesquisar
	- **Then** nenhuma requisição de busca é enviada e a interface informa que é necessário digitar o nome de uma cidade
- **Cenário RF1.5 — Busca com e sem acentos**
	- **Given** o serviço de geocoding retorna a mesma cidade para o termo "São Paulo" e para o termo normalizado "sao paulo"
	- **When** a pessoa pesquisa por qualquer uma das duas grafias, independentemente de maiúsculas/minúsculas
	- **Then** a aplicação envia a consulta sem diacríticos e apresenta a cidade retornada pelo serviço
- **Cenário RF1.6 — Estado inicial sem cidade selecionada**
	- **Given** a pessoa abre a aplicação sem uma cidade previamente selecionada
	- **When** a tela inicial é exibida
	- **Then** a busca manual está disponível, há orientação para pesquisar uma cidade e nenhum dado meteorológico ou solicitação de geolocalização é apresentado
- **Cenário RF1.7 — Preservar pontuação válida**
	- **Given** o serviço de geocoding retorna uma cidade cujo nome contém apóstrofo ou ponto, como St. John's
	- **When** a pessoa pesquisa pelo nome
	- **Then** a aplicação preserva a pontuação na consulta e exibe o nome retornado pelo serviço

**RF2 — Condições atuais**

- **Cenário RF2.1 — Exibir condições atuais**
	- **Given** uma cidade selecionada e uma resposta de condições atuais contendo temperatura, condição, umidade, vento, pressão e precipitação
	- **When** a consulta termina com sucesso
	- **Then** a interface exibe temperatura em °C ou °F conforme a unidade selecionada, condição textual, umidade em %, vento em km/h, pressão em hPa e precipitação em mm, associados à cidade selecionada
- **Cenário RF2.2 — Campo atual ausente**
	- **Given** uma cidade selecionada e uma resposta de condições atuais sem um dos seis dados previstos
	- **When** a consulta termina com sucesso
	- **Then** o dado ausente é indicado como indisponível e os demais dados recebidos são exibidos
- **Cenário RF2.3 — Respostas de cidades diferentes**
	- **Given** há uma consulta em andamento para uma cidade e a pessoa seleciona outra cidade antes de a primeira consulta terminar
	- **When** as consultas terminam
	- **Then** as condições atuais exibidas correspondem à cidade selecionada mais recentemente e não são identificadas como pertencentes à outra cidade

**RF3 — Previsão de cinco dias**

- **Cenário RF3.1 — Exibir cinco dias**
	- **Given** uma cidade selecionada e uma resposta de previsão com dados para hoje e os quatro dias seguintes
	- **When** a consulta termina com sucesso
	- **Then** a interface exibe exatamente cinco datas consecutivas no fuso local da cidade, começando por hoje, com temperaturas mínima/máxima em °C ou °F e probabilidade máxima de precipitação em %, usando rótulos de data em pt-BR (Hoje, Amanhã e dia/mês abreviado para os demais dias)
- **Cenário RF3.2 — Campo de previsão ausente**
	- **Given** uma resposta de previsão em que um dos dados está ausente para um dos dias
	- **When** a previsão é exibida
	- **Then** a data permanece entre as cinco posições e cada campo ausente é indicado como indisponível, sem ocultar os demais dias recebidos
- **Cenário RF3.3 — Dia sem dados na resposta**
	- **Given** a resposta não contém dados para uma das cinco datas consecutivas
	- **When** a previsão é exibida
	- **Then** a interface mantém a posição da data e indica temperatura, condição e probabilidade de precipitação como indisponíveis

**RF4 — Unidade de temperatura**

- **Cenário RF4.1 — Converter Celsius para Fahrenheit**
	- **Given** as temperaturas atuais e previstas estão em Celsius, incluindo os valores de teste 0 °C, -10 °C e 20 °C
	- **When** a pessoa seleciona Fahrenheit
	- **Then** todos os valores e rótulos passam a Fahrenheit, com esses valores exibidos como 32 °F, 14 °F e 68 °F, respectivamente
- **Cenário RF4.2 — Converter Fahrenheit para Celsius**
	- **Given** as temperaturas atuais e previstas estão em Fahrenheit, incluindo os valores de teste 32 °F, 14 °F e 68 °F
	- **When** a pessoa seleciona Celsius
	- **Then** todos os valores e rótulos passam a Celsius, com esses valores exibidos como 0 °C, -10 °C e 20 °C, respectivamente
- **Cenário RF4.3 — Alternar sem nova consulta**
	- **Given** as condições atuais e a previsão já foram carregadas
	- **When** a pessoa alterna a unidade de temperatura
	- **Then** os valores são atualizados na interface sem uma nova requisição meteorológica
- **Cenário RF4.4 — Precisão de exibição**
	- **Given** uma temperatura de origem de 18,6 °C, cuja conversão resulta em 65,48 °F, ou um valor terminado em 0,5
	- **When** a temperatura é apresentada
	- **Then** o valor é arredondado para o inteiro mais próximo, com empates afastados de zero; 18,6 °C resulta em 19 °C, 18,6 °C convertido em Fahrenheit resulta em 65 °F, 18,5 resulta em 19 e -2,5 resulta em -3

**RF5 — Estados e recuperação**

- **Cenário RF5.1 — Busca ou consulta em andamento**
	- **Given** uma requisição de busca ou de dados meteorológicos foi iniciada e ainda não recebeu resposta
	- **When** a interface aguarda a resposta
	- **Then** a interface exibe um indicador de carregamento
- **Cenário RF5.2 — Falha na consulta meteorológica**
	- **Given** uma consulta meteorológica está em andamento para uma cidade selecionada
	- **When** a rede ou o serviço retorna uma falha
	- **Then** a interface informa que os dados não puderam ser carregados e exibe uma ação para tentar novamente
- **Cenário RF5.3 — Falha no geocoding**
	- **Given** uma busca de cidade está em andamento
	- **When** a rede ou o serviço de geocoding retorna uma falha
	- **Then** a interface informa que a busca não pôde ser concluída e exibe uma ação para tentar novamente, sem apresentar o estado de cidade não encontrada
- **Cenário RF5.4 — Timeout**
	- **Given** uma busca ou consulta meteorológica está em andamento
	- **When** a requisição não termina em até 10 segundos
	- **Then** o carregamento é encerrado, a interface informa que a requisição demorou demais e oferece uma nova tentativa
- **Cenário RF5.5 — Tentar novamente**
	- **Given** a interface exibe uma falha ou timeout de busca ou consulta meteorológica
	- **When** a pessoa aciona a ação de nova tentativa
	- **Then** uma nova requisição do mesmo tipo da que falhou é enviada, mantendo o termo de busca ou a localização selecionada
- **Cenário RF5.6 — Sem resultados não é erro**
	- **Given** a requisição de busca termina com sucesso e retorna uma lista vazia
	- **When** a interface apresenta o resultado
	- **Then** é exibido o estado sem resultados, com orientação para revisar o termo, sem mensagem de falha ou ação de retry de erro de serviço

**RF6 — Referência temporal**

- **Cenário RF6.1 — Exibir referência temporal**
	- **Given** a resposta meteorológica inclui a data, o horário e o fuso local da cidade
	- **When** as condições atuais são exibidas
	- **Then** a interface apresenta a data, o horário e o deslocamento UTC retornados junto às condições atuais da cidade consultada
- **Cenário RF6.2 — Referência temporal ausente**
	- **Given** a resposta meteorológica não inclui data ou horário de referência
	- **When** as condições atuais são exibidas
	- **Then** a interface não apresenta uma data ou horário de atualização inventado
- **Cenário RF6.3 — Observação desatualizada**
	- **Given** o horário de referência da observação é anterior em mais de 60 minutos ao horário de recebimento da resposta
	- **When** as condições atuais são exibidas
	- **Then** a interface identifica os dados como desatualizados junto à data e ao horário de referência

## Non-Functional Requirements

- **RNF1 — Responsividade:** os fluxos de busca, seleção, consulta e alternância de unidade devem funcionar em larguras de tela de 320 px até desktop, sem rolagem horizontal nem perda de conteúdo ou controles.
- **RNF2 — Usabilidade:** em teste moderado com pelo menos cinco participantes representando as personas, ao menos quatro devem encontrar uma cidade e identificar suas condições atuais em até 30 segundos, sem ajuda; ao menos quatro também devem identificar os cinco dias da previsão e alternar a unidade em até 60 segundos, sem ajuda.
- **RNF3 — Consistência de unidades:** todos os valores de temperatura simultaneamente visíveis devem corresponder à unidade selecionada.
- **RNF4 — Performance:** em conexão de teste de 10 Mbps de download, 2 Mbps de upload e latência de 100 ms, com o Open-Meteo respondendo, pelo menos 95% das buscas devem apresentar resultados em até 3 segundos após o envio, e pelo menos 95% das consultas devem apresentar condições atuais e as cinco posições da previsão em até 3 segundos após a seleção da cidade.
- **RNF5 — Acessibilidade:** os fluxos principais devem atender WCAG 2.2 nível AA, incluindo operação por teclado, foco visível, nomes acessíveis e contraste adequado; conformidade deve ser verificada por análise automatizada e revisão manual de teclado e leitor de tela.
- **RNF6 — Disponibilidade e resiliência:** a disponibilidade mensal do fluxo de consulta deve ser de pelo menos 99,5%, medida por verificações sintéticas a cada cinco minutos que carregam a aplicação e solicitam condições atuais e cinco dias de previsão para São Paulo, Brasil. Uma verificação é bem-sucedida somente se os dados forem apresentados em até 10 segundos; falhas do Open-Meteo contam como falhas do fluxo. Erros devem encerrar o carregamento e permitir nova tentativa.
- **RNF7 — Compatibilidade:** suportar as versões estáveis atual e imediatamente anterior, na data de cada ciclo de teste, de Chrome, Edge, Firefox, Safari para desktop, Safari para iOS e Chrome para Android.
- **RNF8 — Atualidade dos dados:** condições atuais com referência anterior em mais de 60 minutos ao recebimento da resposta devem ser identificadas como desatualizadas e não podem ser rotuladas apenas como atuais.
- **RNF9 — Privacidade:** não exigir conta nem persistir dados em servidor. Não solicitar localização do dispositivo nem coletar localização ou histórico de buscas sem decisão de produto e comunicação apropriadas.
- **RNF10 — Dependência externa:** utilizar o Open-Meteo sem chave de API, condicionado à validação de termos de uso, limites, cobertura, atribuição exigida e disponibilidade.

## Edge Cases

| Situação | Comportamento esperado |
| --- | --- |
| Busca vazia ou apenas com espaços | Não enviar consulta e informar que é necessário digitar o nome de uma cidade. |
| Cidade inexistente | Exibir que nenhuma cidade foi encontrada e permitir revisar o termo; não reutilizar dados meteorológicos de uma busca anterior. |
| Geocoding concluído sem resultados | Tratar como estado sem resultados, distinto de falha do serviço; orientar a revisão do termo e permitir uma nova busca. |
| Cidades homônimas | Distinguir resultados por estado/região e país quando essas informações forem fornecidas. |
| Variações de acento ou caracteres especiais | Remover diacríticos e ignorar diferenças entre maiúsculas/minúsculas para a consulta de geocoding; preservar pontuação válida do nome e exibir o nome retornado pelo serviço. |
| Falha de geocoding/API | Encerrar o carregamento, informar que a busca falhou e oferecer nova tentativa mantendo o termo pesquisado; não tratar a falha como uma busca sem resultados. |
| Falha da API meteorológica | Encerrar o carregamento, informar que os dados não puderam ser carregados e oferecer nova tentativa para a cidade selecionada. |
| Timeout | Encerrar o carregamento quando a requisição atingir 10 segundos, informar que demorou demais e oferecer nova tentativa. |
| Resposta parcial ou métrica ausente | Indicar cada dado ausente como indisponível, exibir os demais dados recebidos e não inventar valores. |
| Seleção de outra cidade enquanto há consulta em andamento | Não apresentar a resposta anterior como pertencente à cidade recém-selecionada; ao concluir, os dados devem corresponder à seleção mais recente. |
| Mudança de unidade durante consulta em andamento | Aplicar a unidade selecionada quando os dados forem apresentados, sem misturar Celsius e Fahrenheit. |
| Previsão incompleta | Manter as cinco datas no fuso local da cidade; marcar dia ou métrica ausente como indisponível e não inventar valores, condições ou probabilidade de precipitação. |
| Referência temporal ausente ou antiga | Não inventar horário; se a referência tiver mais de 60 minutos, exibir a indicação de dados desatualizados junto à referência. |

## Assumptions

- A primeira versão será uma aplicação web responsiva; o requisito de uso móvel não implica aplicativo nativo.
- O usuário informa e seleciona manualmente uma cidade; não há localização automática definida.
- A previsão é diária e cobre hoje mais os quatro dias seguintes, conforme a decisão do discovery.
- As datas da previsão e a referência temporal das condições atuais seguem o fuso local retornado para a cidade consultada.
- Celsius é a unidade inicial, e a interface é apresentada em pt-BR.
- Temperaturas são arredondadas para o inteiro mais próximo na exibição; vento usa km/h, pressão hPa, umidade e probabilidade de precipitação %, e precipitação atual mm.
- Uma observação com mais de 60 minutos é considerada desatualizada; requisições com 10 segundos ou mais sem resposta são tratadas como timeout.
- Open-Meteo é a fonte de dados escolhida para a primeira versão, sujeito à validação de seus termos e limites.
- Não haverá autenticação nem persistência em servidor. Favoritos, histórico e persistência de preferências no dispositivo não estão definidos.
- A conexão com a internet estará disponível na maior parte do tempo; comportamento offline com cache não está definido.
- Os limites definidos em RNF2, RNF4 e RNF6 são os baselines de aceite da primeira versão; não constituem SLA comercial com o provedor externo.

## Risks

| Risco | Impacto potencial | Mitigação prevista |
| --- | --- | --- |
| Indisponibilidade, lentidão, limites ou cobertura insuficiente do Open-Meteo | Consultas podem falhar, atrasar ou não cobrir o local desejado. | Validar termos, cobertura e limites; tratar falhas e timeouts; monitorar desempenho e disponibilidade. |
| Cidade homônima ou resultado incorreto | A pessoa pode tomar decisões com dados de outro local. | Exibir contexto geográfico nos resultados e validar buscas ambíguas. |
| Dados antigos ou referência temporal/fuso incorretos | A pessoa pode interpretar condições ou datas incorretas como atuais. | Usar o fuso da cidade, mostrar o deslocamento UTC e identificar observações com mais de 60 minutos como desatualizadas. |
| Conversão ou rótulo incorreto de Celsius/Fahrenheit | Temperaturas podem ser interpretadas incorretamente. | Verificar conversões, rótulos e consistência em todos os componentes e unidades. |
| Metas de disponibilidade afetadas por dependência externa | O serviço pode não alcançar a meta mesmo quando a aplicação estiver operacional. | Medir o fluxo ponta a ponta por verificações sintéticas e acompanhar separadamente falhas da aplicação e do provedor. |
| Interface móvel ou acessibilidade insuficientes | Parte das pessoas pode não conseguir completar os fluxos principais. | Validar tamanhos de tela, teclado, leitores de tela, contraste e navegadores suportados. |
| Privacidade pouco clara caso recursos adicionais sejam incluídos | Coleta de localização ou histórico pode reduzir confiança e criar obrigações legais. | Não incluir coleta sem decisão explícita, finalidade definida e comunicação adequada. |

## Out of Scope

- Aplicativos nativos para iOS ou Android.
- Autenticação, contas de usuário e persistência de dados em servidor.
- Geolocalização automática ou solicitação de permissão de localização.
- Favoritos, histórico de buscas e persistência de preferências no dispositivo, até aprovação explícita.
- Previsão horária, além da previsão diária definida para cinco dias.
- Atualização automática periódica enquanto a previsão está aberta; os dados são consultados ao selecionar uma cidade ou acionar nova tentativa.
- Alertas, notificações push, widgets e mapas meteorológicos.
- Idiomas além de pt-BR.
- Funcionamento offline com dados em cache, até definição de validade e comportamento.
- Garantia de uso comercial, atribuição ou disponibilidade do Open-Meteo antes da validação de seus termos aplicáveis.

## Open Questions

1. Quem é o público-alvo prioritário e quais métricas de negócio determinarão o sucesso do produto?
2. Quais campos meteorológicos adicionais, além dos definidos em RF2 e RF3, são necessários para o produto?
3. A busca deve oferecer sugestões enquanto a pessoa digita, aceitar correspondências parciais e tolerar erros de digitação?
4. Há outros requisitos de desambiguação geográfica para países/regiões além de país obrigatório e estado/região quando disponível?
5. A preferência de unidade deve persistir entre visitas? Essa preferência pode ser armazenada localmente no dispositivo?
6. Quais termos, limites de chamadas, cobertura e requisitos de atribuição do Open-Meteo se aplicam ao produto?
7. Há necessidade de oferecer outros idiomas além de pt-BR no futuro?
8. A interface deve oferecer alguma forma aprovada de consulta offline ou apresentação de dados em cache?
