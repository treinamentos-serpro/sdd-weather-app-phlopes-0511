# Especificação de Produto — Aplicação de Previsão do Tempo

## Overview

Aplicação web responsiva, com interface em pt-BR, para pesquisar cidades e consultar suas condições meteorológicas atuais e a previsão diária de cinco dias (hoje e os quatro dias seguintes). A temperatura pode ser alternada entre Celsius e Fahrenheit. Os dados serão obtidos do Open-Meteo, sem exigir chave de API, e o produto não terá autenticação nem persistência em servidor.

O produto atende principalmente pessoas que precisam conferir rapidamente o tempo antes de sair, planejar atividades dos próximos dias ou verificar as condições de um local durante deslocamentos. As personas e métricas de sucesso descritas no discovery são hipóteses a validar.

## Functional Requirements

- **RF1 — Busca e seleção de cidade:** permitir que a pessoa informe uma cidade, veja resultados correspondentes com informação geográfica suficiente para distingui-los e selecione o local cujos dados deseja consultar.
- **RF2 — Condições atuais:** após a seleção de uma cidade, exibir suas condições atuais, incluindo temperatura, descrição da condição meteorológica, umidade, vento, pressão e precipitação, quando esses dados estiverem disponíveis.
- **RF3 — Previsão de cinco dias:** exibir a previsão diária da cidade selecionada para cinco dias consecutivos, incluindo hoje e os quatro dias seguintes, com temperatura mínima e máxima, condição meteorológica e precipitação, quando disponíveis.
- **RF4 — Unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e atualizar todos os valores e rótulos de temperatura apresentados, tanto nas condições atuais quanto na previsão.
- **RF5 — Estados e recuperação:** informar à pessoa quando uma busca ou consulta estiver carregando, quando não houver resultados e quando ocorrer uma falha; oferecer nova tentativa quando uma consulta de dados falhar.
- **RF6 — Referência temporal:** apresentar a data e o horário de referência dos dados meteorológicos atuais, de modo que a pessoa possa avaliar quando foram observados ou atualizados.

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
	- **Given** o serviço de busca retorna uma ou mais cidades com nomes e informações de região/estado e país
	- **When** a pessoa pesquisa por um desses nomes
	- **Then** cada resultado exibe o nome da cidade e as informações de região/estado e país retornadas pelo serviço
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
	- **Then** nenhuma requisição de busca é enviada

**RF2 — Condições atuais**

- **Cenário RF2.1 — Exibir condições atuais**
	- **Given** uma cidade selecionada e uma resposta de condições atuais contendo temperatura, condição, umidade, vento, pressão e precipitação
	- **When** a consulta termina com sucesso
	- **Then** a interface exibe cada um desses seis dados com o valor correspondente à resposta e associado à cidade selecionada
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
	- **Then** a interface exibe exatamente cinco dias consecutivos, começando por hoje, cada um com a data, temperatura mínima, temperatura máxima, condição meteorológica e precipitação da resposta
- **Cenário RF3.2 — Campo de previsão ausente**
	- **Given** uma resposta de previsão em que um dos dados está ausente para um dos dias
	- **When** a previsão é exibida
	- **Then** o dado ausente daquele dia é indicado como indisponível e os demais dados e dias recebidos permanecem visíveis

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

**RF5 — Estados e recuperação**

- **Cenário RF5.1 — Busca ou consulta em andamento**
	- **Given** uma requisição de busca ou de dados meteorológicos foi iniciada e ainda não recebeu resposta
	- **When** a interface aguarda a resposta
	- **Then** a interface exibe um indicador de carregamento
- **Cenário RF5.2 — Falha na consulta meteorológica**
	- **Given** uma consulta meteorológica está em andamento para uma cidade selecionada
	- **When** a rede ou o serviço retorna uma falha
	- **Then** a interface informa que os dados não puderam ser carregados e exibe uma ação para tentar novamente
- **Cenário RF5.3 — Tentar novamente**
	- **Given** a interface exibe uma falha para a cidade selecionada
	- **When** a pessoa aciona a ação de nova tentativa
	- **Then** uma nova requisição meteorológica é enviada para a localização da cidade selecionada
- **Cenário RF5.4 — Sem resultados não é erro**
	- **Given** a requisição de busca termina com sucesso e retorna uma lista vazia
	- **When** a interface apresenta o resultado
	- **Then** é exibido o estado sem resultados, sem a mensagem ou ação de erro de consulta meteorológica

**RF6 — Referência temporal**

- **Cenário RF6.1 — Exibir referência temporal**
	- **Given** a resposta meteorológica inclui uma data e um horário de referência
	- **When** as condições atuais são exibidas
	- **Then** a interface apresenta a data e o horário retornados junto às condições atuais da cidade consultada
- **Cenário RF6.2 — Referência temporal ausente**
	- **Given** a resposta meteorológica não inclui data ou horário de referência
	- **When** as condições atuais são exibidas
	- **Then** a interface não apresenta uma data ou horário de atualização inventado

## Non-Functional Requirements

- **RNF1 — Responsividade:** os fluxos de busca, seleção, consulta e alternância de unidade devem funcionar em larguras de tela de 320 px até desktop, sem rolagem horizontal nem perda de conteúdo ou controles.
- **RNF2 — Usabilidade:** os fluxos principais devem permitir que participantes de teste encontrem uma cidade e identifiquem suas condições atuais e a previsão de cinco dias; o método e os critérios quantitativos do teste ainda precisam ser acordados.
- **RNF3 — Consistência de unidades:** todos os valores de temperatura simultaneamente visíveis devem corresponder à unidade selecionada.
- **RNF4 — Performance:** em condições de rede a serem acordadas, os resultados da busca e os dados meteorológicos devem ser apresentados em até 3 segundos no percentil 95. Esta é uma meta inicial sujeita à validação.
- **RNF5 — Acessibilidade:** os fluxos principais devem atender WCAG 2.2 nível AA, incluindo operação por teclado, foco visível, nomes acessíveis e contraste adequado.
- **RNF6 — Disponibilidade e resiliência:** buscar disponibilidade mensal de 99,5% para a consulta meteorológica, com escopo de medição a definir. Falhas do provedor devem resultar em estado de erro compreensível e possibilidade de nova tentativa.
- **RNF7 — Compatibilidade:** suportar versões atuais e imediatamente anteriores dos navegadores desktop e móveis que forem definidos para o produto.
- **RNF8 — Atualidade dos dados:** informar a referência temporal dos dados e não apresentá-los como atuais quando estiverem fora do limite máximo de idade que será acordado. O comportamento para dados antigos deve ser definido antes da entrega.
- **RNF9 — Privacidade:** não exigir conta nem persistir dados em servidor. Não solicitar localização do dispositivo nem coletar localização ou histórico de buscas sem decisão de produto e comunicação apropriadas.
- **RNF10 — Dependência externa:** utilizar o Open-Meteo sem chave de API, condicionado à validação de termos de uso, limites, cobertura, atribuição exigida e disponibilidade.

## Edge Cases

| Situação | Comportamento esperado |
| --- | --- |
| Busca vazia ou apenas com espaços | Não enviar consulta e manter clara a possibilidade de informar uma cidade. |
| Cidade sem correspondência | Exibir estado sem resultados, sem reutilizar dados de uma consulta anterior como se fossem novos. |
| Cidades homônimas | Distinguir resultados por estado/região e país quando essas informações forem fornecidas. |
| Variações de acento ou caracteres especiais | Encaminhar o texto informado ao mecanismo de busca e exibir os resultados recebidos sem falhar a interface. O grau de normalização depende do serviço de geocoding e deve ser validado. |
| Falha, timeout ou indisponibilidade da rede/API | Encerrar o estado de carregamento, explicar que a consulta falhou e disponibilizar nova tentativa. |
| Resposta parcial ou métrica ausente | Indicar somente o dado ausente como indisponível e manter os demais dados utilizáveis. |
| Seleção de outra cidade enquanto há consulta em andamento | Não apresentar a resposta anterior como pertencente à cidade recém-selecionada; ao concluir, os dados devem corresponder à seleção mais recente. |
| Mudança de unidade durante consulta em andamento | Aplicar a unidade selecionada quando os dados forem apresentados, sem misturar Celsius e Fahrenheit. |
| Previsão incompleta | Não inventar dias ou valores ausentes; indicar a indisponibilidade e permitir que o estado de erro ou incompletude seja compreendido. |
| Referência temporal ausente ou antiga | Não inventar horário; a sinalização e o limite para dados antigos dependem da decisão pendente sobre atualidade. |

## Assumptions

- A primeira versão será uma aplicação web responsiva; o requisito de uso móvel não implica aplicativo nativo.
- O usuário informa e seleciona manualmente uma cidade; não há localização automática definida.
- A previsão é diária e cobre hoje mais os quatro dias seguintes, conforme a decisão do discovery.
- Celsius é a unidade inicial, e a interface é apresentada em pt-BR.
- Open-Meteo é a fonte de dados escolhida para a primeira versão, sujeito à validação de seus termos e limites.
- Não haverá autenticação nem persistência em servidor. Favoritos, histórico e persistência de preferências no dispositivo não estão definidos.
- A conexão com a internet estará disponível na maior parte do tempo; comportamento offline com cache não está definido.
- Os alvos quantitativos de performance e disponibilidade são propostas iniciais, não compromissos aprovados.

## Risks

| Risco | Impacto potencial | Mitigação prevista |
| --- | --- | --- |
| Indisponibilidade, lentidão, limites ou cobertura insuficiente do Open-Meteo | Consultas podem falhar, atrasar ou não cobrir o local desejado. | Validar termos, cobertura e limites; tratar falhas e timeouts; monitorar desempenho e disponibilidade. |
| Cidade homônima ou resultado incorreto | A pessoa pode tomar decisões com dados de outro local. | Exibir contexto geográfico nos resultados e validar buscas ambíguas. |
| Dados antigos ou referência temporal/fuso incorretos | A pessoa pode interpretar condições ou datas incorretas como atuais. | Definir idade máxima, fuso aplicável e regras de apresentação; mostrar a referência temporal. |
| Conversão ou rótulo incorreto de Celsius/Fahrenheit | Temperaturas podem ser interpretadas incorretamente. | Verificar conversões, rótulos e consistência em todos os componentes e unidades. |
| Metas de disponibilidade afetadas por dependência externa | O serviço pode não alcançar a meta mesmo quando a aplicação estiver operacional. | Definir claramente o escopo da meta e monitorar separadamente a aplicação e o provedor. |
| Interface móvel ou acessibilidade insuficientes | Parte das pessoas pode não conseguir completar os fluxos principais. | Validar tamanhos de tela, teclado, leitores de tela, contraste e navegadores suportados. |
| Privacidade pouco clara caso recursos adicionais sejam incluídos | Coleta de localização ou histórico pode reduzir confiança e criar obrigações legais. | Não incluir coleta sem decisão explícita, finalidade definida e comunicação adequada. |

## Out of Scope

- Aplicativos nativos para iOS ou Android.
- Autenticação, contas de usuário e persistência de dados em servidor.
- Geolocalização automática ou solicitação de permissão de localização.
- Favoritos, histórico de buscas e persistência de preferências no dispositivo, até aprovação explícita.
- Previsão horária, além da previsão diária definida para cinco dias.
- Alertas, notificações push, widgets e mapas meteorológicos.
- Idiomas além de pt-BR.
- Funcionamento offline com dados em cache, até definição de validade e comportamento.
- Garantia de uso comercial, atribuição ou disponibilidade do Open-Meteo antes da validação de seus termos aplicáveis.

## Open Questions

1. Quem é o público-alvo prioritário e quais métricas de negócio determinarão o sucesso do produto?
2. Quais campos de condições atuais são indispensáveis além dos campos propostos nesta especificação?
3. Como definir o fuso horário para a data dos dias previstos e para a referência temporal: fuso da cidade ou do dispositivo?
4. A busca deve oferecer sugestões enquanto a pessoa digita, aceitar correspondências parciais e tolerar erros de digitação? Quais são as expectativas para acentos e caracteres especiais?
5. Quais informações geográficas devem desambiguar cidades em todos os países e regiões suportados?
6. Qual é a idade máxima aceitável dos dados, com que frequência devem ser atualizados e como dados antigos devem ser sinalizados?
7. A preferência de unidade deve persistir entre visitas? Essa preferência pode ser armazenada localmente no dispositivo?
8. Quais termos, limites de chamadas, cobertura e requisitos de atribuição do Open-Meteo se aplicam ao produto?
9. Qual matriz de navegadores, sistemas operacionais e dispositivos deve ser suportada?
10. Quais condições e critérios quantitativos serão usados para validar usabilidade, performance, disponibilidade e rede?
11. Como devem ser formatados datas, horários e números em pt-BR, e há necessidade de oferecer outros idiomas no futuro?
12. A interface deve oferecer alguma forma aprovada de consulta offline ou apresentação de dados em cache?
