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

| Tema | Pergunta em aberto | Impacto de seguir sem resposta |
| --- | --- | --- |
| Público-alvo | Quem usará o app e em quais situações? | A interface e as informações podem não atender às necessidades reais dos usuários. |
| Objetivo de negócio | Como será medido o sucesso do produto? | Faltará critério para priorizar funcionalidades e avaliar se o app resolveu o problema. |
| Plataforma | O app será web responsivo, PWA ou nativo para celular? | A escolha altera tecnologia, custos, distribuição, manutenção e acesso a recursos do dispositivo. |
| Busca de cidades | A busca deve aceitar nomes parciais, acentos e erros de digitação? Deve sugerir resultados enquanto o usuário digita? | Implementações diferentes podem frustrar usuários ou produzir resultados inesperados. |
| Cidades homônimas | Como distinguir cidades com o mesmo nome: país, estado, região ou código postal? | O usuário pode consultar a previsão da cidade errada. |
| Localização | O app deve usar a localização do dispositivo ou somente cidades pesquisadas manualmente? | Afeta o primeiro acesso, permissões, privacidade e comportamento quando o usuário recusa a localização. |
| Clima atual | Quais informações devem ser exibidas além da temperatura, como condição, sensação térmica, vento ou umidade? | “Clima atual” pode resultar em telas e integrações com escopos muito diferentes. |
| Previsão de cinco dias | Os cinco dias incluem hoje? A previsão será diária ou horária? | Altera os dados necessários e a forma como datas e previsões serão apresentadas. |
| Fuso horário | As datas e horas seguem o fuso da cidade consultada ou do dispositivo do usuário? | A previsão pode ser associada ao dia ou horário incorreto, especialmente em viagens. |
| Fonte dos dados | Qual provedor será usado? Há restrições de custo, licença, cobertura ou atribuição? | Pode haver custos ou limitações de uso, cobertura e qualidade descobertos tarde demais. |
| Atualização dos dados | Com que frequência as condições devem ser atualizadas? Qual atraso máximo é aceitável? | O app pode mostrar dados antigos como se fossem atuais, reduzindo confiança e utilidade. |
| Unidades | Qual unidade é padrão? A alternância afeta apenas temperatura ou também vento, chuva e pressão? | Usuários podem receber valores em unidades inesperadas ou inconsistentes. |
| Persistência | A unidade selecionada, cidades favoritas ou buscas recentes devem ser lembradas? | A experiência pode exigir repetição de ações ou ganhar escopo de armazenamento sem aprovação. |
| Falhas e estados vazios | O que mostrar se não houver resultados, a API falhar, a rede cair ou o limite de requisições for atingido? | Usuários podem ficar sem explicação ou sem uma forma de tentar novamente. |
| Uso offline | O app deve exibir dados em cache sem conexão? Por quanto tempo? | Sem decisão, não há expectativa clara sobre disponibilidade nem sobre a validade dos dados armazenados. |
| Idioma e formatos | O app será apenas em português? Como formatar datas, horários e números? | Textos e formatos podem não corresponder à região ou à preferência do usuário. |
| Dispositivos e navegadores | Quais tamanhos de tela, sistemas e navegadores precisam ser suportados? | Não será possível definir uma matriz de testes nem confirmar compatibilidade. |
| Acessibilidade | Quais requisitos de acessibilidade devem ser atendidos? | Pessoas que usam teclado ou tecnologias assistivas podem não conseguir completar os fluxos. |
| Desempenho | Qual tempo máximo aceitável para abrir o app, buscar uma cidade e carregar a previsão? | “Rápido” fica subjetivo e problemas de latência podem passar sem detecção. |
| Disponibilidade | Qual disponibilidade é esperada e como a indisponibilidade do provedor externo será tratada? | Não há meta de continuidade nem expectativa clara quando os dados não puderem ser obtidos. |
| Privacidade | Serão coletados localização, histórico ou dados de uso? Para qual finalidade e por quanto tempo? | Pode haver coleta desnecessária, perda de confiança e obrigações legais não consideradas. |
| Segurança | Há requisitos específicos para dados armazenados ou serviços integrados? | Controles necessários podem ser negligenciados ou descobertos apenas perto da entrega. |
| Escopo adicional | Favoritos, alertas, mapas, notificações ou widgets fazem parte da primeira versão ou estão fora dela? | O escopo pode crescer por expectativas implícitas ou funcionalidades essenciais podem ficar de fora. |

As decisões que mais condicionam o escopo inicial são plataforma, fonte de dados, conteúdo do clima atual, definição dos cinco dias, busca de cidades, localização e tratamento de falhas.

## Suposições

- A aplicação terá uma interface visual interativa, em vez de ser apenas uma integração de dados sem interface.
- O usuário seleciona uma cidade antes de consultar as informações meteorológicas correspondentes.
- A previsão de cinco dias se refere a cinco dias de calendário, mas a inclusão do dia atual ainda precisa ser confirmada.
- Celsius e Fahrenheit são as únicas unidades de temperatura necessárias no escopo inicial.
- A necessidade de uso móvel implica que as funções centrais devem estar disponíveis em telas pequenas; não implica, por si só, a criação de um aplicativo nativo.
- Autenticação, persistência de preferências e recursos de localização não estão confirmados pelo briefing e não são considerados requisitos nesta análise.