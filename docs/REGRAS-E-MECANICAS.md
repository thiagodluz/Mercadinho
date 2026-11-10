# Mercadinho — regras, referências e melhorias

> Registro histórico anterior à implementação. Consulte o [README](../README.md) e o [plano](../PLANO-DE-DESENVOLVIMENTO.md) para o estado da versão 1.0.0, e a [auditoria da beta](AUDITORIA-BETA.md) para o histórico das propostas.

Pesquisa de 8 de novembro de 2026. O guia compara o código do Mercadinho, os dois vídeos de referência e as regras publicadas por outros jogos do gênero. **Verificado** indica código lido, comportamento observado em vídeo ou resultado reproduzido com as regras atuais. **Documentado** indica uma descrição publicada pelo autor da referência. **Proposta** indica uma escolha de design para o Mercadinho.

## 1. O que priorizar

O Mercadinho já reúne o que dá profundidade a esse tipo de jogo: espaço limitado, trios na própria prateleira, produtos atrás dos outros, uma caixa que fornece uma peça por vez e correntes abertas com trios. A campanha já tem oito fases manuais e 200 geradas com solução verificada. A próxima melhoria com efeito mais direto é ajudar a pessoa a entender quando ficou sem saída e mostrar como voltar a jogar. O plano continua sendo uma campanha gratuita, offline, sem cronômetro, anúncios, compras ou vidas limitadas. [README do Mercadinho][mercadinho] · [Plano do projeto][plano]

| Ordem | Proposta | Como saber se funcionou |
|---|---|---|
| 1 | Avisar assim que acabar o espaço útil e oferecer **Desfazer** no próprio aviso | A fase 30 identifica o impasse no primeiro lance ruim. Um toque desfaz a jogada e restaura a fila da caixa. |
| 2 | Ensinar a reservar uma vaga e a esvaziar a fileira inteira | Quem está começando consegue explicar por que um item escurecido fica no fundo e por que tirar o último item de uma frente pode ser a melhor jogada. |
| 3 | Ajustar as fases mais punitivas com dados da beta | As fases 20, 29 e 30 mostram onde falta uma pista visual e onde a fase precisa de mais folga. As fases comuns e as de desafio têm perfis diferentes de erro. |
| 4 | Experimentar recuperação opcional e reconhecimento de jogadas boas | Uma prateleira extra ajuda em impasses reais. Uma cascata tem um efeito próprio sem cobrir a próxima jogada. |
| 5 | Introduzir uma variação por vez em fases próprias | É possível perceber o efeito da prateleira que fecha ou de outro obstáculo sem precisar reaprender todas as regras. |

## 2. O que as fontes ensinam

| Referência | Regra ou comportamento encontrado | O que o Mercadinho pode aproveitar |
|---|---|---|
| [Goods Puzzle: Sort Challenge, fase 438][falcon-video] · [Descrição da Falcon][falcon] | O vídeo mostra quatro dispensadores de uma peça com indicadores de estoque, prateleiras de três posições, fundo escurecido, corrente que desce de 4 até abrir, cronômetro e barra de combo. Por volta de 00:05–00:11, há troca do produto exposto no dispensador após a retirada e progresso da corrente após trios. | Reforçar a distinção visual entre prateleira e dispensador. Usar o vídeo como referência de contagem e feedback. A regra exata de soltar sobre uma posição ocupada continua em aberto para o original. |
| [Goods Rush! 3D Sort Puzzle, gravação][rush-video] · [Descrição da Playdayy][rush] | A primeira fase mostra dois tipos de produto e três compartimentos. Na segunda, por volta de 00:18, o jogo apresenta o auxílio que completa um trio. Na quarta, por volta de 01:29, o tutorial mostra o auxílio que pausa o cronômetro por 20 segundos. O vídeo mostra contagem decrescente da corrente e progressão de combos. | Ensinar cada regra quando ela pode ser usada, com um exemplo curto. A primeira fase serve de referência para reduzir a carga de informação no começo. |
| [Goods Sort, Spark][spark] | Arraste entre prateleiras para a vaga livre mais próxima, frente de três posições, fundo que avança em bloco, vidro aberto por quatro trios e prateleira que fecha ao ficar completamente vazia. Usa tempo, multiplicador e bônus por tempo restante. | O encaixe assistido e a prateleira que fecha são ideias independentes. O fundo em bloco coincide com a regra atual do Mercadinho. |
| [Grocer’s Shelves, Play Metras][metras] | Arraste ou toque, prévia escurecida da próxima fileira, dica de rota, desfazer sem limite, reinício e possibilidade de obter uma prateleira extra. Fases sem cronômetro por padrão. Estrelas consideram o uso de ajuda. | Referência mais próxima para recuperar uma partida com calma. A prévia do fundo é informação para decidir, então precisa continuar legível mesmo atrás da frente. |
| [Goods Sort Puzzle, TapCaper][tapcaper] | Usa **pilhas por vaga**. O destino tem de estar inteiramente vazio. A publicação descreve certificados de solução, dica por busca limitada e embaralhamento verificado que conserva o estoque. Fases avançadas podem ter limite de movimentos. | Aproveitar a validação e o embaralhamento seguro. Adotar pilhas individuais exigiria redesenhar as fases, pois mover um produto poderia revelar imediatamente outro no mesmo lugar. |
| [Shelf Star, GameOLL][shelfstar] | Prateleiras funcionam como pilhas de até quatro produtos e permitem mover só o produto do topo. A caixa mostra a próxima peça e a contagem, cada retirada custa uma jogada e todo o estoque entra na vitória. Há cadeados por número de trios, prateleira extra, ímã e estrelas por eficiência. O autor descreve geração reversa seguida de verificação. | A caixa é a melhor comparação escrita com o nosso dispensador. O guia também separa bem a vitória da nota por eficiência. A capacidade de quatro e a pilha única são regras dessa variante. |
| [AmanitaDev, projeto Unity][amanita] · [Demo][amanita-demo] | No código, `QueueObject` recebe a soltura em frente vazia. `MatchGroup` verifica a origem e o destino e avança a frente inteira. `GroupBlocker` escuta os trios, de modo que os bloqueadores inscritos recebem o mesmo evento. `LevelPrefab` verifica estoque e frentes cheias. O editor embaralha trios, mas o método lido não verifica a existência de uma rota. | Separar movimento, reposição, abertura e feedback em etapas explícitas. O bloqueio por evento e a geração sem certificado são diferenças que importam. [Movimento][amanita-move] · [Trio e fundo][amanita-match] · [Bloqueio][amanita-lock] · [Vitória e geração][amanita-level] |
| [Playturbo, tutorial técnico][playturbo] | Demonstra brilho durante o arraste, item acima das outras peças, devolução quando a soltura falha, partículas e sons distintos. Uma mão orienta após três segundos sem interação. O tutorial usa destinos predefinidos em uma demonstração interativa. | Aproveitar o momento da orientação e o feedback visual. O exemplo de arraste serve para ensinar uma situação preparada. |
| [HyperCodeStore, manual público do template][hyper] | O editor e o jogo compartilham um modelo de regras. Editar uma fase invalida seu certificado, e uma busca com orçamento esgotado fica como inconclusiva. O gerador usa semente, diversidade estrutural e validação. Mostra prateleira extra, embaralhamento e desbloqueio. | É a referência técnica mais detalhada para o fluxo de criar, editar, validar e publicar novas fases. A ficha do vendedor descreve os resultados do próprio produto. |
| [Triple Match Item Sorting Kit, bcyly Labs][kit] | O autor anuncia fundos, cadeados, restrições de vagas, prateleiras móveis, editor, gerador e resolvedor. O catálogo inclui dica, desfazer, embaralhar, desbloquear e auxílios para tempo. | Usar como catálogo de possibilidades. A página descreve funcionalidades do kit comercial e não detalha a ordem exata das regras. |
| [Shelf Sort, reemstudio][reem] | HTML, CSS e JavaScript. A ficha descreve destino vazio ou do mesmo tipo, correntes, produtos congelados que se liberam por toque, vagas quebradas, limite de tempo, estrelas e desafio diário por semente. | Referência para mostrar obstáculos simples em 2D. A restrição de tipo mudaria o papel de nossas prateleiras como espaço de manobra. |
| [Goods Sort Match, GamoVation][gamo] · [Sortime][sortime] · [Minijogo da Lihuhu][li] | GamoVation documenta criar espaço rearranjando produtos. Sortime anuncia troca com prateleira cheia na atualização descrita. A Lihuhu propõe girar o armário e cumprir uma meta de caixas. | São variantes úteis para modos separados. Trocar posições ocupadas, girar o cenário ou usar uma meta parcial muda o conjunto de estados ou a condição de vitória. |

Os tempos dos vídeos são aproximados e se referem à gravação, não ao cronômetro interno do jogo. Os vídeos mostram o resultado de lances específicos. Eles não revelam a forma como as fases são geradas, como os estoques são sorteados ou a regra universal de todas as versões dos aplicativos.

## 3. Regras do núcleo para preservar e explicitar

### Movimento e prateleiras

- Uma prateleira comum tem três vagas na frente. Uma vaga da frente continua livre mesmo com um produto desenhado atrás. O fundo é uma prévia escurecida, indisponível até avançar. Três produtos iguais ocupando a frente da **mesma prateleira** formam um trio.
- O jogador pode estacionar um produto ao lado de tipos diferentes. Essa liberdade cria o quebra-cabeça. Por exemplo, tirar o item que atrapalha dois cafés pode abrir espaço para o terceiro, mesmo quando o lance de retirada não elimina nada.
- Arrastar e tocar em origem e destino aplicam a mesma regra. Soltar em área inválida, cancelar o gesto ou voltar à origem mantém o estoque, as correntes e o histórico. O encaixe assistido do Spark pode ser experimentado ao soltar perto de uma vaga livre da prateleira apontada, com o destino destacado antes. Se houver duas vagas próximas, o destaque deve indicar qual receberá a peça.
- O fundo avança quando **toda a frente fica vazia**, seja por trio ou por tirar o último produto. Exemplo: de `[Leite, _, _]` sobre `[Café, Chá, _]`, mover o leite faz os dois produtos de trás avançarem juntos. Enquanto o leite estiver na frente, as outras duas vagas continuam utilizáveis e o fundo continua parado.
- O selo `+1` já indica que existe uma fileira além da prévia visível. Testar se o jogador entende esse significado. Uma breve legenda no primeiro encontro pode resolver melhor do que aumentar o tamanho do selo.
- Uma fileira revelada que já contém um trio pode disparar outra eliminação. Cada trio conta uma vez, inclusive quando a mesma jogada desencadeia dois. A vitória é avaliada após as eliminações, os desbloqueios e as revelações, quando não resta produto na frente, no fundo ou na caixa. [Código do Mercadinho][codigo]

### Caixa de entregas

- A caixa mostra o primeiro produto da fila e o total restante, incluindo o produto visível. Cada retirada válida entrega uma peça e revela a próxima na mesma posição. O jogador escolhe a hora de pegar o produto e a vaga para colocá-lo. A caixa é somente uma origem.
- **Exemplo de conferência.** Com Café visível, seguido por Chá e Leite, a contagem começa em 3. Depois de colocar o Café em uma vaga válida, a caixa mostra Chá e 2. Soltar o Chá sobre uma posição ocupada deixa o estado igual. Desfazer o lance válido devolve Café, contagem 3 e a ordem original, mesmo que o lance tenha criado um trio.
- Há duas ocorrências diferentes que podem parecer duplicação. Duas unidades do mesmo produto em sequência podem ter sido cadastradas no estoque. Uma retirada que coloca duas peças no tabuleiro ou altera a contagem em duas é uma falha de estado. A campanha atual tem um teste que rejeita tipos iguais consecutivos na fila. O lance válido usa uma retirada da fila. Embaralhar, desfazer e retomar uma partida precisam manter essa contabilidade.
- Antes de avançar, o estoque da caixa também precisa acabar. A caixa vazia permanece reconhecível como dispensador esgotado. Transformá-la em vaga de trabalho é uma variação que altera a solução. Vários dispensadores, como na fase 438, são uma opção posterior e aumentam tanto as escolhas quanto a disputa por espaço. [Código do Mercadinho][codigo] · [Teste da campanha][testes] · [Shelf Star][shelfstar] · [Vídeo da fase 438][falcon-video]

### Correntes e resolução da jogada

- No Mercadinho, uma prateleira bloqueada não fornece produtos nem recebe itens. O trio reduz a **corrente ativa**. Quando ela abre, o próximo trio começa a reduzir a seguinte. Em um lance com dois trios, cada trio conta separadamente, então o segundo pode alcançar a corrente seguinte.
- Com duas correntes, a comunicação precisa mostrar quem recebe o próximo trio. O jogo já tem “Abre primeiro” e “Abre depois”. Na beta, observar se a pessoa consegue prever o que acontece quando uma corrente de 1 está antes de outra de 2.
- Fluxo verificado no código: mover e repor a caixa, eliminar os trios acessíveis, contar cada trio na corrente ativa, avançar as frentes vazias e repetir até o tabuleiro ficar estável. Desfazer volta ao estado anterior à jogada inteira. O resolvedor e a partida seguem a mesma ordem, em implementações paralelas. Uma mudança nessa ordem deve ser conferida nos dois caminhos ou feita em uma regra compartilhada.
- Spark usa vidro com quatro trios. Shelf Star descreve cadeados com meta de trios da fase. O clone Amanita usa um evento global para seus bloqueadores. Copiar a abertura simultânea faria a segunda corrente progredir mais cedo e poderia tornar várias fases atuais mais fáceis. [Código do Mercadinho][codigo] · [Spark][spark] · [Shelf Star][shelfstar] · [GroupBlocker][amanita-lock]

## 4. Impasse, dica e recuperação

**Verificado na campanha atual.** Rodei as funções do jogo sobre as 200 fases geradas e testei os primeiros lances distintos considerados pelo resolvedor. Em **39 de 200 fases**, pelo menos um primeiro lance chega a um tabuleiro sem jogada útil. Nas fases 9 a 30, a busca até quatro lances encontrou pelo menos uma sequência que produz esse tipo de impasse em cada uma das 22 fases. Isso mede a existência de uma armadilha, sem estimar com que frequência uma pessoa cairia nela. O resolvedor agrupa posições equivalentes e ignora mudanças de lugar dentro da mesma prateleira, pois elas não alteram os trios possíveis. [Regras executadas][codigo] · [Banco de fases][banco]

| Fase | Exemplo reproduzido | O que testar |
|---|---|---|
| [20][f20] | Levar o Biscoito da caixa à vaga direita do compartimento 5. Levar o Feijão seguinte à vaga esquerda do 6. Sobram produtos no fundo, mas as frentes úteis ficam cheias. | A caixa usa as duas vagas sem liberar nenhuma. O aviso deve aparecer no segundo lance. |
| [29][f29] | Levar o Suco da caixa à vaga direita do compartimento 3. Levar o Molho seguinte à vaga central do 5. A frente fica cheia e ainda falta um trio para abrir a corrente. | Uma vaga atrás da corrente não conta como disponível. O aviso deve funcionar mesmo com o lugar vazio à vista. |
| [30][f30] | Levar o Biscoito da caixa à vaga central do compartimento 5, entre dois Chás. A caixa passa a mostrar Chá, mas já não existe vaga livre acessível. | Confirmar aviso imediato e restauração do Biscoito ao desfazer. Esse caso também ensina por que vale manter espaço de manobra. |

Os números dos compartimentos seguem a ordem de leitura do tabuleiro, da esquerda para a direita e de cima para baixo, contando a caixa. O código consultado mostra “Continue organizando os produtos” após a resolução de um lance sem vitória. A distinção entre busca esgotada e posição sem solução já aparece quando se pede uma dica. [Resolução da jogada][codigo-settle] · [Busca e mensagens da dica][codigo-dica]

| Estado depois que o tabuleiro estabiliza | Comportamento proposto |
|---|---|
| Sem trio imediato, com espaço para reorganizar | A partida continua. Uma boa dica pode recomendar mover um produto que libera a frente em vez de tentar forçar um trio na hora. |
| Sem jogada útil e com produtos restantes | Aviso imediato **“Sem espaço para mover os produtos. Desfaça a última jogada para tentar outro caminho.”** Ação principal **Desfazer**, com **Reiniciar** disponível. |
| Há lances legais, mas a busca completa demonstrou que nenhum leva à vitória | Ao pedir ajuda, oferecer **Voltar à última posição com solução conhecida** quando houver uma no histórico. Um desfazer continua disponível. |
| Busca de dica atingiu seu limite | Indicar que a dica não encontrou uma rota dentro do limite. Manter o jogo aberto e oferecer desfazer. O tabuleiro pode ainda ter solução. |
| Tabuleiro inteiro vazio | Vitória. O estoque e o histórico são avaliados após concluir os efeitos do último lance. |

**Opção de recuperação para experimentar.** Uma prateleira auxiliar de três vagas para a tentativa atual pode abrir espaço quando a pessoa prefere continuar. Apresentar depois de desfazer e reiniciar, com uso gratuito, e manter a fase original resolvível sem o auxílio. Uma prateleira nova oferece opções, mas a posição resultante ainda precisa ser checada se a interface prometer resgate garantido. Embaralhar é uma etapa posterior. Definir seu alcance, conservar o inventário, respeitar as correntes e validar a posição antes de aplicá-la. Se não houver um novo arranjo verificado, manter o estado atual. [Grocer’s Shelves][metras] · [TapCaper][tapcaper] · [Shelf Star][shelfstar]

## 5. Como melhorar as fases sem inflar a dificuldade

1. **Usar a campanha existente como base.** As fases 1 a 8 já introduzem fundo, dispensador e correntes. As fases 9 a 208 usam banco gerado, soluções armazenadas, 43 arranjos visuais e respiros nas fases terminadas em 5. A continuação a partir da 209 reutiliza estruturas das últimas 50. A proposta antiga de geração foi incorporada em parte ao projeto. Os números e tempos do protótipo servem de contexto histórico. [README][mercadinho]
2. **Medir tolerância ao erro além de resolubilidade.** O certificado mostra que há uma rota inicial. Acrescentar medidas como número de vagas livres acessíveis, parcela de primeiros lances que levam a impasse imediato, distância até o primeiro trio, quantidade de lances preparatórios antes de liberar o fundo e necessidade de usar a caixa antes da primeira corrente abrir. Separar rotas comprovadas, impasses comprovados e posições cuja busca ficou inconclusiva. Uma opção que evita o impasse imediato ainda pode ficar sem solução depois.
3. **Definir perfis de fase.** Nas introdutórias, deixar visível pelo menos um trio fácil de preparar e uma vaga de trabalho. Nas comuns, variar quais prateleiras têm fundos e onde está a caixa. Nas de desafio, usar espaço justo ou corrente em posição crítica com intenção clara. Nos respiros, garantir trios rápidos e poucos passos de preparação. Evitar aumentar profundidade, variedade de tipos e correntes no mesmo salto.
4. **Ensinar por descoberta assistida.** Primeiro, destacar um único lance que completa um trio. Depois, preparar uma prateleira cujo fundo só avança quando o jogador leva a última peça a outra vaga. Em seguida, mostrar uma caixa de estoque curto e uma corrente de 1. Na primeira fase em que a última vaga importa, avisar em linguagem curta, como “Guarde um espaço para reorganizar os produtos.” A mão do tutorial pode aparecer após uma pausa, desaparecer ao primeiro toque e voltar só na situação em que ajuda.
5. **Preservar a solução ao editar.** Gerar por semente no computador, salvar layout e sequência comprovada e reproduzir a sequência com as regras da partida. Alterou ordem da caixa, ocupação, correntes ou vagas? Invalidar e recalcular a rota. Usar uma assinatura que capte a estrutura do puzzle, além do formato visual. Usar o comprimento de uma solução verificada como referência de eficiência, indicando que ela pode não ser a menor.
6. **Separar folga lógica de conforto visual.** Uma prateleira adicional aumenta a capacidade de manobra e pode diluir a dificuldade. Uma fileira extra na tela reduz o tamanho disponível para produtos e controles. Verificar as quatro linhas em celulares pequenos sem repetir o problema de estreitar produtos que o Android 0.1.6 resolveu. Reservar a diferença entre fundo escurecido e vaga livre para leitura rápida.
7. **Priorizar observação humana.** No teste das fases 20, 29 e 30, anotar primeiro momento de hesitação, primeiro impasse, usos de dica, desfazer e reinício. Perguntar “o que você esperava que acontecesse ao tirar esse item?”. Se a pessoa entende a jogada e assume o risco, o problema é de dificuldade. Se ela pensava que a caixa devolvia a vaga ou que a corrente deixava usar o espaço vazio, o problema é de comunicação. [Roteiro beta][mercadinho] · [Manual do gerador e editor][hyper] · [Tutorial Playturbo][playturbo]

## 6. Ideias para uma segunda rodada

| Mecânica | O que acrescenta | Regra sugerida para um teste |
|---|---|---|
| Cascata | Recompensa visual por um lance que resolve dois ou mais trios | Contar os trios do mesmo lance e mostrar um efeito curto. A pontuação fica opcional e independe da velocidade. |
| Estrelas de eficiência | Motivo para repetir a fase | Dar uma estrela pela vitória e usar o número de lances como meta para as demais. Deixar a campanha avançar com a vitória simples. Usar uma meta testada com pessoas. |
| Prateleira esgotada | Faz pensar na ordem de limpeza | Marcar antes do lance qual prateleira fechará. Ela só fecha depois de esvaziar frente e fundo. Introduzir em uma fase curta que deixe outro espaço de trabalho. |
| Vaga avariada | Torna visível uma restrição local | Uma prateleira com duas vagas é um apoio temporário, ou ganha a terceira após reparo. Mostrar isso na arte e no tutorial. Validar que a fase não dependa de trios em duas vagas. |
| Chave ou vidro | Varia a meta de abertura | Experimentar uma chave ligada a um trio específico em uma fase dedicada. Manter o contador de trios como linguagem da campanha base. |
| Modo desafio | Permite testar pressão de tempo ou de movimentos | Usar um conjunto separado. Se o limite for de movimentos, validar que o certificado cabe no orçamento. Se houver tempo, medir o efeito no conforto e na leitura dos produtos. |
| Reposição do dia | Dá uma partida curta que pode ser compartilhada | Usar semente por data e fase previamente certificada. Permitir jogar novamente e guardar o resultado localmente. |
| Vitrine decorativa | Dá um objetivo entre capítulos | Liberar cenários, enfeites ou produtos ilustrados conforme a campanha avança, preservando silhueta e contraste no tabuleiro. |
| Esteiras, armário giratório e troca em vaga ocupada | Mudam a maneira de encontrar e mover peças | Tratar como experimentos isolados, pois alteram o espaço disponível, a acessibilidade dos produtos ou a definição de jogada legal. |

As variações acima vêm de regras ou ideias documentadas em [Spark][spark], [Shelf Star][shelfstar], [TapCaper][tapcaper], [Shelf Sort HTML5][reem], [bcyly Labs][kit], [Lihuhu][li] e [Sortime][sortime]. As decisões de implantação são propostas para o Mercadinho.

## 7. Roteiro de aceite para o próximo ciclo

- Jogar a fase 30 até o impasse indicado e desfazer. Confirmar que item visível, contagem da caixa, vagas, fundos e correntes voltam ao valor anterior.
- Arrastar um item para uma vaga livre com produto escurecido atrás. Conferir que só o item arrastado muda de lugar. Tirar o último item da frente e conferir que a fileira de trás avança inteira.
- Soltar uma peça da caixa sobre vaga ocupada, sobre corrente e fora do tabuleiro. Conferir que a caixa conserva peça e contador nas três tentativas.
- Reproduzir uma jogada com dois trios ou com cascata. Conferir a passagem de uma corrente para a outra, a animação e um único passo no histórico para desfazer tudo.
- Reabrir a partida durante uma sequência de efeitos e conferir que o lance termina uma vez. A dica sugerida deve continuar legal na posição atual.
- Testar as fases 20, 29 e 30 no navegador e em um Android físico. Registrar separadamente problemas de regra, dificuldade, leitura e arraste. O APK pode então reunir as correções confirmadas pela beta.

[mercadinho]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/README.md
[plano]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/PLANO-DE-DESENVOLVIMENTO.md
[codigo]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/index.html#L1032-L1131
[codigo-dica]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/index.html#L1194-L1219
[codigo-settle]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/index.html#L1228-L1299
[banco]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/fases.js
[testes]: https://github.com/thiagodluz/Mercadinho/blob/9a3e244deab66de227740fa4802151aab4d3934a/tests/campanha.cjs
[f20]: https://thiagodluz.github.io/Mercadinho/?teste=20
[f29]: https://thiagodluz.github.io/Mercadinho/?teste=29
[f30]: https://thiagodluz.github.io/Mercadinho/?teste=30
[falcon-video]: https://www.youtube.com/watch?v=N8I-GxS7Kmk
[falcon]: https://play.google.com/store/apps/details?id=com.fc.goods.sort.matching.puzzle.triplemaster
[rush-video]: https://www.youtube.com/watch?v=g2uo-fPDirk
[rush]: https://play.google.com/store/apps/details?id=com.triple.match.goods.sort.puzzle.game
[spark]: https://www.sparkwincash.com/games/goods-sort.html
[metras]: https://playmetras.com/en/g/bakaliko/
[tapcaper]: https://tapcaper.com/games/goods-sort/
[shelfstar]: https://gameoll.com/play-games/goods-sorting-game/
[amanita]: https://github.com/AmanitaDev/GoodsSort
[amanita-demo]: https://amanitadev.itch.io/goods-sort-game-clone
[amanita-move]: https://github.com/AmanitaDev/GoodsSort/blob/ffe7fc1253b47056b75fe11cd51356f01992c299/Assets/_Game/Scripts/Match/QueueObject.cs
[amanita-match]: https://github.com/AmanitaDev/GoodsSort/blob/ffe7fc1253b47056b75fe11cd51356f01992c299/Assets/_Game/Scripts/Match/MatchGroup.cs
[amanita-lock]: https://github.com/AmanitaDev/GoodsSort/blob/ffe7fc1253b47056b75fe11cd51356f01992c299/Assets/_Game/Scripts/GroupBlocker.cs
[amanita-level]: https://github.com/AmanitaDev/GoodsSort/blob/ffe7fc1253b47056b75fe11cd51356f01992c299/Assets/Scripts/Managers/Scene/LevelPrefab.cs
[playturbo]: https://doc.playturbo.com/playturbo-case-study/playable-content-editor/elimination-and-match-gameplay-cases/less-than-goods-sort-greater-than-blank-canvas-tutorial
[hyper]: https://satisvizion.github.io/Documentations/goods-sorting/Documentation.html
[kit]: https://bcyly-labs.itch.io/triple-match-item-sorting-kit
[reem]: https://codecanyon.net/item/shelf-sort-600-levels-html5-goods-sort-puzzle-game/64906156
[gamo]: https://play.google.com/store/apps/details?id=com.hypervation.goodssort
[sortime]: https://play.google.com/store/apps/details?hl=pt&id=com.tapcolor.puzzle.sort.goods.match.triple
[li]: https://lihuhugames.helpshift.com/hc/en/4-match-triple-3d/faq/1227-what-is-goods-sort/
