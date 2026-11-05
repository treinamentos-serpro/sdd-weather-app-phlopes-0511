# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo para que usuários consultem as condições de cidades de seu interesse. A experiência deve permitir localizar uma cidade, conferir o clima atual e visualizar a previsão para cinco dias. A apresentação de temperatura deve poder ser alternada entre Celsius e Fahrenheit, e a aplicação deve ser utilizável em dispositivos móveis.

O briefing não define público-alvo, plataforma além do requisito de uso móvel, fonte dos dados meteorológicos, localização geográfica inicial nem critérios quantitativos de qualidade. Esses pontos precisam ser esclarecidos antes do detalhamento da solução.

## Requisitos Funcionais

- **RF1 — Busca de cidades:** permitir que o usuário pesquise cidades para consultar seus dados meteorológicos.
- **RF2 — Clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF3 — Previsão de cinco dias:** exibir a previsão do tempo para cinco dias da cidade selecionada.
- **RF4 — Alternância de unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar os valores de temperatura e seus rótulos nas informações exibidas.
- **RF5 — Contexto temporal:** exibir a data e o horário de referência dos dados meteorológicos apresentados.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** permitir os fluxos principais em larguras de tela a partir de 320 px até desktop, sem rolagem horizontal ou perda de funcionalidade.
- **RNF2 — Usabilidade:** busca, clima atual e previsão devem ser compreensíveis e diretos; validar os fluxos principais em teste de usabilidade.
- **RNF3 — Consistência de unidades:** todos os valores de temperatura exibidos devem corresponder à unidade selecionada, sem misturar Celsius e Fahrenheit.
- **RNF4 — Performance:** em condições de rede acordadas, apresentar os resultados de busca e os dados meteorológicos em até 3 segundos no percentil 95.
- **RNF5 — Acessibilidade:** atender WCAG 2.2 nível AA nos fluxos principais, incluindo operação por teclado, foco visível, nomes acessíveis e contraste adequado.
- **RNF6 — Disponibilidade e resiliência:** buscar disponibilidade mensal de 99,5% para a consulta meteorológica; em falha da fonte externa, apresentar estado de erro compreensível e permitir nova tentativa.
- **RNF7 — Compatibilidade:** suportar as versões atuais e imediatamente anteriores dos navegadores desktop e móveis que forem definidos para o produto.
- **RNF8 — Atualidade dos dados:** utilizar dados dentro de um limite máximo de idade a ser acordado com o negócio; informar o horário de referência e sinalizar dados indisponíveis ou antigos.

As metas quantitativas acima são propostas iniciais para tornar os requisitos verificáveis e precisam ser validadas antes de se tornarem compromissos do produto. A fonte meteorológica ainda precisa ser escolhida, incluindo seus limites de uso, disponibilidade e atualização.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação inicial |
| --- | --- | --- | --- |
| Busca retorna cidades homônimas ou resultados inesperados | Média | Médio | Definir como identificar e distinguir resultados, por exemplo, com estado/região e país. |
| Fonte de dados indisponível, lenta ou sujeita a limites de uso | Média | Alto | Escolher e validar a fonte; definir tratamento de falhas e limites de uso. |
| Interpretação divergente do período de cinco dias | Média | Médio | Confirmar se a contagem inclui o dia atual e qual granularidade da previsão é necessária. |
| Conversão ou apresentação incorreta das unidades | Baixa | Alto | Definir o comportamento de alternância e validar os valores e rótulos nas duas unidades. |
| Interface difícil de usar em telas pequenas | Média | Médio | Validar os fluxos principais em dispositivos e tamanhos de tela móveis. |

## Perguntas em Aberto

1. Qual fonte de dados meteorológicos deve ser utilizada e há restrições de custo, licença ou volume de chamadas?
2. A busca deve sugerir resultados enquanto o usuário digita? Como resultados homônimos devem ser diferenciados?
3. Quais informações compõem o “clima atual” e cada item da previsão (por exemplo, temperatura mínima/máxima, condição, precipitação ou vento)?
4. Os cinco dias incluem o dia atual ou correspondem aos cinco dias seguintes? A previsão deve ser diária ou horária?
5. Qual deve ser a unidade inicial e a seleção deve ser mantida entre visitas ou sessões?
6. A aplicação deve inferir a localização do usuário, ou a consulta começa somente após uma busca explícita?
7. Quais idiomas e navegadores devem ser suportados? As metas propostas de responsividade, desempenho, disponibilidade e acessibilidade são adequadas?
8. Qual é a idade máxima aceitável para os dados meteorológicos e como deve ser definida a disponibilidade considerando falhas do provedor externo?
9. É necessário oferecer favoritos, histórico de buscas, uso sem conexão ou outros recursos além dos descritos no briefing?

## Suposições

- A aplicação terá uma interface visual interativa, em vez de ser apenas uma integração de dados sem interface.
- O usuário seleciona uma cidade antes de consultar as informações meteorológicas correspondentes.
- A previsão de cinco dias se refere a cinco dias de calendário, mas a inclusão do dia atual ainda precisa ser confirmada.
- Celsius e Fahrenheit são as únicas unidades de temperatura necessárias no escopo inicial.
- A necessidade de uso móvel implica que as funções centrais devem estar disponíveis em telas pequenas; não implica, por si só, a criação de um aplicativo nativo.
- Autenticação, persistência de preferências e recursos de localização não estão confirmados pelo briefing e não são considerados requisitos nesta análise.