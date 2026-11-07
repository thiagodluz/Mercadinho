# Mercadinho — projeto de desenvolvimento

## Visão do jogo

Mercadinho é um jogo casual de organização de produtos em prateleiras. O jogador movimenta objetos e reúne três iguais no mesmo compartimento para removê-los, revelar novos produtos e esvaziar o cenário. A diversão vem de administrar vagas e planejar a ordem das combinações.

O jogo será gratuito para instalar e jogar, sem anúncios, compras internas, assinaturas, vidas limitadas ou pagamentos para continuar. A campanha funcionará offline, com progresso salvo no aparelho.

## Estado atual — 7 de novembro de 2026

O repositório contém um protótipo web publicado no GitHub Pages, com oito fases iniciais e uma sequência contínua de fases geradas a partir da fase 9. A primeira apresenta camadas, a segunda apresenta um dispensador, a terceira apresenta correntes sequenciais, a quarta combina essas mecânicas e as duas seguintes ampliam a fila do dispensador e introduzem uma camada e corrente adicionais. As fases 7 e 8 apresentam o chá como quarto produto e combinam as mecânicas já introduzidas. O catálogo possui 20 produtos ilustrados provisórios; as fases usam controles por arraste ou seleção, desfazer, reinício e tela de vitória.

O navegador guarda a fase mais avançada e as preferências de áudio. A campanha avança automaticamente em sequência depois da vitória. As fases avançadas com seis compartimentos alternam formatos de prateleira. A partir da fase 9, tabuleiros gerados usam 6 a 14 tipos de produto, aumentados por faixas de progressão, com posições e produtos variados. Uma semente salva mantém cada tabuleiro estável ao retomar; partidas geradas antes desta atualização mantêm o formato antigo até terminar. Uma fase em andamento é retomada após recarregar, a partir da última jogada concluída; até 100 jogadas ficam disponíveis no histórico salvo. Há efeitos sonoros e uma melodia provisória gerados pelo jogo, controles separados de volume e vibração opcional quando o navegador oferece suporte.

O protótipo foi verificado no navegador e por testes pontuais da lógica. O repositório inclui testes automatizados da lógica, das soluções das fases, da persistência, da pausa e da preferência de animações; a cobertura ainda precisa ser ampliada. O toque, a vibração, o áudio e a retomada precisam ser verificados em um celular físico. Ainda é necessário criar o aplicativo Android e validar o funcionamento offline da versão web publicada.

## Público e plataformas

- Público casual, com partidas curtas e controles simples.
- Primeira plataforma disponível: navegador, em orientação vertical adaptável a celular e computador.
- Aplicativo Android como próximo alvo de plataforma, aproveitando a base web.
- Idioma inicial: português brasileiro.
- Arte original, com produtos fictícios e ambiente de mercadinho.

## Referência das gravações

As duas gravações mostram fases de organização em prateleiras com três vagas por compartimento, peças no fundo, dispensadores, correntes, combos e efeitos de pontuação.

- A vaga da frente pode ser usada mesmo quando há um objeto escurecido atrás dela.
- Quando a fileira da frente é esvaziada, a fileira seguinte avança.
- Um dispensador mostra uma peça por vez e disponibiliza outra após a retirada.
- Correntes têm contadores e podem ser desbloqueadas em sequência ao completar trios.
- As gravações não esclarecem a regra exata para soltar um objeto sobre outro já acessível. Para o protótipo, o destino válido será uma vaga livre na frente.

As referências servem para compreender a mecânica. O projeto precisa de nome, interface, personagens, modelos, sons e fases próprios.

## Decisões iniciais

- Campanha principal sem limite de tempo, com pausa e tentativas ilimitadas.
- Jogo apresentado de frente, em 2D ou 2,5D, com objetos de aparência tridimensional.
- Fases projetadas manualmente no início, incluindo pelo menos uma solução verificada para cada fase.
- Pontuação e feedback de combos opcionais para a experiência da campanha. A forma de contagem será definida e testada no protótipo.
- Modo cronometrado como expansão posterior, depois de validar a campanha.
- Tecnologia inicial: HTML, CSS e JavaScript para a versão web. Avaliar Capacitor para empacotar a mesma base como aplicativo Android e testar as integrações no aparelho.

## Regras do protótipo

### Tabuleiro e movimentação

1. O tabuleiro contém compartimentos, cada um com três vagas na fileira acessível.
2. Compartimentos comuns podem conter fileiras adicionais atrás da primeira.
3. Produtos na frente podem ser arrastados ou selecionados e movidos para vagas livres acessíveis, inclusive em outro lugar do mesmo compartimento comum.
4. Produtos de trás aparecem escurecidos e não podem ser selecionados até avançar.
5. Itens distintos podem dividir um compartimento. Movimentos que apenas reorganizam peças são válidos.
6. Se a fileira da frente ficar vazia, a próxima avança como uma unidade após as combinações pendentes.
7. Quando três produtos iguais ocuparem a mesma fileira acessível de um compartimento comum, eles são removidos automaticamente.
8. Uma movimentação inválida devolve o produto à origem. No protótipo, produtos não trocam diretamente de lugar ao serem soltos sobre vagas ocupadas.
9. A vitória ocorre quando não restarem produtos acessíveis, escondidos ou em dispensadores, após o término das ações pendentes.
10. Quando não houver movimentos legais e a fase não estiver concluída, o objetivo é mostrar opções de desfazer ou reiniciar. O jogo já identifica quando não há movimentos legais. Ao pedir uma dica, o jogo informa quando a busca esgotou as possibilidades e comprovou que a posição ficou sem solução.

### Dispensadores

- Cada dispensador ocupa um compartimento de origem e apresenta uma peça por vez.
- Ao retirar a peça, a próxima aparece, se existir, e o indicador de quantidade restante é atualizado.
- A ordem da fila é definida pela fase.
- No protótipo, o dispensador apenas fornece produtos e não aceita itens de volta.
- A contagem inclui a peça visível. Ao chegar a zero, o dispensador fica vazio.

### Correntes

- Uma corrente bloqueia um compartimento e impede interação com ele.
- Cada trio reduz em um a corrente ativa.
- Ao chegar a zero, a corrente abre após a animação da jogada.
- Se houver várias correntes sequenciais, a fase define sua ordem. A próxima começa a contar a partir do trio seguinte.
- O bloqueio é resolvido exclusivamente jogando.

### Ajuda e controle

- Desfazer restaura integralmente a jogada anterior, incluindo produtos, camadas, dispensadores e correntes. Durante animações, aguardar o estado estável antes de aplicar a ação.
- Reiniciar recompõe a configuração inicial da fase, mediante confirmação.
- A dica procura uma sequência completa até a vitória e destaca a primeira jogada. A busca tem limites de tempo e estados. A interface distingue um limite atingido de uma posição comprovadamente sem solução.
- Já há controles separados de música e efeitos, vibração opcional em navegadores compatíveis e suporte à preferência de movimento reduzido do sistema. Há um menu de pausa na versão web, que interrompe a música e permite retomar a partida. Há uma opção própria para reduzir animações, respeitando também a preferência do sistema.

## Próximas prioridades

1. **Fortalecer as regras e os testes.** Versionar testes de combinações, camadas, dispensadores, correntes, desfazer, reinício, desbloqueio e persistência. A matriz atual verifica 72 tabuleiros gerados em seis sementes, com até 14 tipos de produto. Ampliar a cobertura para posições intermediárias e repetir a validação da busca em outros celulares.
2. **Criar mais conteúdo.** Ampliar a campanha gradualmente, projetar e validar uma solução para cada fase e avaliar a dificuldade com jogadores.
3. **Refinar a apresentação.** Evoluir as ilustrações e as animações a partir do mockup e substituir ou aprovar a melodia provisória após escuta e testes.
4. **Testar e finalizar a versão web.** Conferir arraste, encaixe, áudio, vibração, legibilidade, salvamento e retomada no navegador do computador e em um celular físico. Implementar e verificar o funcionamento offline pretendido.
5. **Preparar o aplicativo Android.** Após a versão web estar completa e testada, avaliar e integrar o Capacitor, gerar um APK de teste e verificar tela cheia, áreas seguras, salvamento, áudio, vibração e funcionamento offline no aplicativo.

## Etapas de desenvolvimento

### 1. Preparação do projeto

- [x] Preparar a execução no navegador e publicar o protótipo web no GitHub Pages.
- [ ] Definir estrutura do código, formatos de fase e organização dos recursos.
- [x] Criar repositório funcional e hospedar o protótipo web.
- [x] Acrescentar instruções de execução local e testes da versão web.
- [ ] Definir padrão de nomes, resolução de referência e adaptação a telas verticais.
- [ ] Preparar um fluxo simples de versões e verificação antes de integrar alterações.

Entrega: projeto abre no navegador, com estrutura e instruções para continuar o desenvolvimento web.

### 2. Núcleo jogável

- [x] Implementar prateleiras, vagas e produtos temporários distinguíveis.
- [x] Implementar arraste por ponteiro, seleção por toque, encaixe e rejeição de movimentos inválidos.
- [ ] Validar a precisão do toque e do arraste em celular físico.
- [x] Implementar trios automáticos, múltiplos compartimentos e fileiras de fundo.
- [x] Implementar remoção, avanço de fileira e condição de vitória com atualização ordenada.
- [ ] Ampliar os testes versionados para proteger mais sequências de animação e mudanças de estado.
- [x] Criar uma fase curta com solução verificada.
- [x] Automatizar a verificação das soluções das oito fases atuais.
- [ ] Validar toque, estado do tabuleiro e reinício em aparelhos diferentes.

Entrega: fase completa jogável, do início à vitória.

### 3. Mecânicas dos vídeos

- [x] Adicionar dispensadores e indicação da quantidade restante.
- [x] Adicionar correntes, contador e sequência de desbloqueio.
- [x] Adicionar desfazer, reiniciar e mensagem de vitória.
- [x] Adicionar pausa à versão web; validar posteriormente no Android e em possíveis modos cronometrados.
- [x] Criar três fases de demonstração, uma para camadas, uma para dispensadores e uma para correntes.
- [ ] Verificar cada fase completa, desfazer em diferentes estados e reinício durante uso normal.

Entrega: protótipo com as três mecânicas principais e controles confiáveis.

### 4. Apresentação e sensação ao jogar

- [x] Criar uma identidade visual provisória com elementos de interface originais.
- [ ] Refinar a identidade visual definitiva a partir do mockup e de testes em celular.
- [x] Produzir ilustrações provisórias para leite, café e geleia.
- [ ] Ampliar o conjunto de produtos e validar silhuetas, cores e rótulos em telas pequenas.
- [x] Criar animações para trios e avanço das fileiras.
- [ ] Refinar o feedback visual de seleção e encaixe e criar animações de desbloqueio e vitória.
- [x] Adicionar efeitos sonoros, melodia provisória, volumes separados e vibração opcional quando suportada.
- [ ] Avaliar o som e a vibração em aparelhos físicos e decidir a música definitiva.
- [ ] Garantir que efeitos não cubram as peças nem dificultem jogadas consecutivas.
- [ ] Ajustar contraste, tamanhos de toque, fontes e opção de movimento reduzido.

Entrega: uma versão visualmente consistente e confortável de jogar.

### 5. Conteúdo e progressão

- [ ] Criar entre 20 e 30 fases manuais para a primeira versão de teste.
- [ ] Introduzir cada mecânica de forma gradual e variar a dificuldade sem saltos bruscos.
- [ ] Variar quantidade de vagas, tipos de produto, profundidade e posição dos obstáculos.
- [x] Salvar a fase mais avançada e as preferências de áudio no navegador.
- [x] Salvar e retomar o estado estabilizado da fase em andamento no navegador, incluindo até 100 jogadas para desfazer.
- [ ] Verificar a preservação dos dados em futuras atualizações da versão web e, posteriormente, na versão Android.
- [x] Avançar pelas fases em sequência, permitir reiniciar a fase atual e preservar o progresso ao recarregar o navegador.
- [ ] Validar o comportamento após fechamento e atualização no aplicativo Android.
- [ ] Validar solução e conclusão de cada fase. Automatizar verificações de tabuleiro e acrescentar testes manuais para situações não cobertas.

Entrega: campanha inicial completa e jogável offline.

### 6. Testes e refinamento

- [x] Conferir no celular o comportamento das fases geradas e da dica. Thiago confirmou que os testes desta etapa passaram em 7 de novembro de 2026.
- [ ] Testar a versão web em telas pequenas, diferentes proporções e navegadores, inclusive no celular.
- [ ] Testar toque rápido, arraste interrompido, tela bloqueada, chamadas e retorno ao jogo.
- [ ] Testar consistência da versão web após fechar, reabrir e atualizar o jogo.
- [ ] Validar vitória, impasse, desfazer e reinício em fases com camadas, dispensadores e correntes.
- [ ] Avaliar fluidez, consumo de bateria, tamanho dos recursos e legibilidade na versão web.
- [ ] Fazer testes com jogadores e registrar onde ficam confusos ou presos.
- [ ] Corrigir falhas e ajustar a dificuldade antes da publicação.

Entrega: versão candidata com fases verificadas e desempenho aceitável nos aparelhos testados.

### 7. Preparação para lançamento

- [ ] Criar nome final, ícone, capturas de tela e descrição coerentes com o jogo.
- [ ] Revisar direitos de uso dos recursos artísticos, fontes, sons e bibliotecas.
- [ ] Com a versão web pronta e testada, avaliar e integrar o Capacitor e gerar um APK de teste.
- [ ] Verificar o aplicativo em celular físico, incluindo tela cheia, áreas seguras, salvamento, áudio, vibração, interrupções e funcionamento offline.
- [ ] Preparar versão Android assinada, documentar a compilação e proteger a chave de assinatura.
- [ ] Conferir os requisitos vigentes da Google Play, incluindo testes, compatibilidade, segurança de dados e políticas aplicáveis.
- [ ] Realizar teste fechado quando exigido e corrigir os problemas encontrados.
- [ ] Publicar a primeira versão quando estiver pronta, com histórico de mudanças e canal de suporte.

Entrega: versão pública gratuita e sem anúncios, acompanhada de instruções claras para jogadores.

### 8. Após o lançamento

- [ ] Acompanhar falhas e relatos de jogadores.
- [ ] Adicionar novos conjuntos de fases, objetos e cenários originais.
- [ ] Avaliar modo cronometrado separado e novos obstáculos com base nos testes.
- [ ] Avaliar outras plataformas e melhorias da versão web após estabilizar a versão Android.

## Critérios para a primeira versão pública

- A campanha inicial pode ser concluída sem pagamento ou publicidade, e o funcionamento offline foi verificado no aplicativo Android e na versão web escolhida para uso offline.
- Todas as fases da campanha têm solução verificada e podem ser reiniciadas.
- O toque é preciso, os produtos são distinguíveis e as regras de bloqueio são apresentadas ao jogador.
- O jogo salva progresso e configurações localmente.
- As funções de desfazer e reiniciar preservam um estado consistente. A pausa, quando disponível, também preserva o estado.
- Não há falhas conhecidas que impeçam avançar ou provoquem perda de progresso.
- Música, efeitos e vibração têm controles próprios.

## Pontos para decidir durante o protótipo

- Identidade visual definitiva, nome dos cenários e estilo dos produtos.
- Quantidade de desfazimentos e limites de busca da dica para fases maiores.
- Fórmula de pontuação e se combos terão uma janela de tempo na campanha.
- Tratamento de troca entre itens acessíveis em uma versão futura.
- Validar a retomada após interrupções e atualizações em diferentes navegadores e, depois, no aplicativo Android.
- Ampliar os modelos usados na geração e testar dificuldade, legibilidade em celulares e limites da dica nas fases geradas.
