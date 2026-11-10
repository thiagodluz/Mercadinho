# Mercadinho — projeto de desenvolvimento

## Visão do jogo

Mercadinho é um jogo casual de organização de produtos em prateleiras. O jogador movimenta objetos e reúne três iguais no mesmo compartimento para removê-los, revelar novos produtos e esvaziar o cenário. A diversão vem de administrar vagas e planejar a ordem das combinações.

O jogo será gratuito para instalar e jogar, sem anúncios, compras internas, assinaturas, vidas limitadas ou pagamentos para continuar. A campanha funcionará offline, com progresso salvo no aparelho.

## Estado atual — 10 de novembro de 2026

A versão 1.0.0 apresenta o modo Zen e um segundo quadro **Em breve** reservado para outro modo. O jogo está disponível na web e foi preparado para Android, com oito fases iniciais e 200 fases geradas e verificadas, da fase 9 à 208, e continuação sem fim a partir da fase 209. A primeira apresenta camadas, a segunda apresenta um dispensador, a terceira apresenta correntes sequenciais, a quarta combina essas mecânicas e as duas seguintes ampliam a fila do dispensador e introduzem uma camada e corrente adicionais. As fases 7 e 8 apresentam o chá como quarto produto e combinam as mecânicas já introduzidas. O catálogo possui 20 produtos ilustrados provisórios; as fases usam controles por arraste ou seleção, desfazer, reinício e tela de vitória.

O navegador guarda a fase mais avançada e as preferências de áudio. A campanha avança automaticamente em sequência depois da vitória. A nova campanha usa 43 formatos de tabuleiro, até quatro linhas de prateleiras e filas de dispensador sem produtos iguais consecutivos. O selo `+1` indica uma fileira além da que aparece escurecida. A dificuldade foi medida com um jogador simulado, com desafios nas fases terminadas em 0 e respiros nas terminadas em 5. A partir da fase 209, os últimos 50 tabuleiros são reaproveitados com os produtos variados por semente. Partidas do gerador anterior recomeçam no tabuleiro atual da mesma fase. Uma fase em andamento é retomada após recarregar, a partir da última jogada concluída; até 100 jogadas ficam disponíveis no histórico salvo. Há efeitos sonoros e uma melodia provisória gerados pelo jogo, controles separados de volume e vibração opcional quando o navegador oferece suporte.

O protótipo foi verificado no navegador e por testes pontuais da lógica. O repositório inclui testes automatizados da lógica, das soluções das fases, da persistência, da pausa e da preferência de animações; a cobertura ainda precisa ser ampliada. O aplicativo Android usa Capacitor e feedback tátil nativo; a versão 0.1.6 foi integrada à versão principal e publicada como release de teste com APK assinado. Thiago aprovou no celular o visual, o funcionamento, o arraste e a vibração.

Em 8 de novembro de 2026, Thiago deu o item de funcionamento no Android como aprovado, incluindo o escopo de fechamento e reabertura, bloqueio de tela, uso offline e preservação de fase, jogadas e configurações, inclusive ao atualizar o app. Esse registro representa a aprovação geral da etapa; não detalha o resultado de cada cenário ou aparelho. Permanecem relevantes testes adicionais em diferentes aparelhos e a validação offline da versão web publicada.

### Estado da versão 1.0.0

O modo Zen mantém a campanha tranquila, sem cronômetro e com tentativas ilimitadas. O botão **Zen** identifica o modo atual e **Em breve** é um espaço desabilitado para um futuro modo. O APK principal usa o identificador `br.com.thiagodluz.mercadinho`, versão Android 10 e a chave do Prisma. O salvamento Android usa Preferences, com migração dos dados locais da mesma instalação. A validação do APK 1.0.0 em aparelho físico continua necessária.

O resgate permite a prateleira extra quando a busca atinge o limite, indicando que não confirmou uma solução. A versão da campanha é 5; uma partida antiga de fase gerada é reiniciada na mesma fase, preservando a fase desbloqueada. A beta web e os APKs beta usam dados separados.

## Público e plataformas

- Público casual, com partidas curtas e controles simples.
- Primeira plataforma disponível: navegador, em orientação vertical adaptável a celular e computador.
- Aplicativo Android de teste disponível, aproveitando a base web via Capacitor.
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

- A experiência atual é a base do **modo Zen**, inspirada na proposta do Prisma. Thiago confirmou que o jogo está tranquilo de jogar e que esse ritmo é intencional. A campanha Zen permanece sem limite de tempo, com pausa e tentativas ilimitadas.
- Jogo apresentado de frente, em 2D ou 2,5D, com objetos de aparência tridimensional.
- Fases projetadas manualmente no início, incluindo pelo menos uma solução verificada para cada fase.
- Pontuação e feedback de combos opcionais para a experiência da campanha. A forma de contagem será definida e testada no protótipo.
- Criar posteriormente um modo separado com tempo e outras funcionalidades, após amadurecer a experiência Zen. Os detalhes serão definidos mais adiante.
- Tecnologia: HTML, CSS e JavaScript para a versão web, empacotada com Capacitor para Android e com integração nativa para vibração.

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
- As fases da nova campanha têm uma solução inicial encurtada e verificada. Ao sair da sequência sugerida, a dica procura um caminho para a posição atual dentro dos limites de tempo e estados. A interface distingue um limite atingido de uma posição comprovadamente sem solução.
- Já há controles separados de música e efeitos, vibração opcional em navegadores compatíveis e suporte à preferência de movimento reduzido do sistema. Há um menu de pausa na versão web, que interrompe a música e permite retomar a partida. Há uma opção própria para reduzir animações, respeitando também a preferência do sistema.

A beta histórica 0.1.7-beta.1 acrescentou orientação nas primeiras fases, recuperação de impasse, ajustes nas fases 20, 29 e 30, feedback de cascata e um tabuleiro separado de prateleira esgotada. A [auditoria da beta](docs/AUDITORIA-BETA.md) registra a motivação, os commits, os cenários de verificação e a compilação do APK.

## Próximas prioridades

1. **Fortalecer as regras e os testes.** Versionar testes de combinações, camadas, dispensadores, correntes, desfazer, reinício, desbloqueio e persistência. A matriz atual verifica os 200 tabuleiros da campanha e a continuação após a fase 208. Ampliar a cobertura para posições intermediárias e repetir a validação da busca em outros celulares.
2. **Criar mais conteúdo.** Ampliar a campanha gradualmente, projetar e validar uma solução para cada fase e avaliar a dificuldade com jogadores.
3. **Refinar a apresentação.** Evoluir as ilustrações e as animações a partir do mockup e substituir ou aprovar a melodia provisória após escuta e testes.
4. **Testar e finalizar a versão web.** Conferir arraste, encaixe, áudio, vibração, legibilidade, salvamento e retomada no navegador do computador e em um celular físico. Implementar e verificar o funcionamento offline pretendido.
5. **Evoluir o aplicativo Android.** Manter o APK de teste atualizado, registrar a aprovação geral da etapa de funcionamento por Thiago e ampliar a verificação em diferentes aparelhos antes da versão pública.

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
- [x] Validar o arraste em celular físico. Thiago aprovou o funcionamento na versão 0.1.6.
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

- [x] Montar oito fases manuais de introdução e um banco de 200 fases distintas.
- [ ] Introduzir cada mecânica de forma gradual e variar a dificuldade sem saltos bruscos.
- [x] Variar quantidade de vagas, tipos de produto, profundidade e posição dos obstáculos.
- [x] Salvar a fase mais avançada e as preferências de áudio no navegador.
- [x] Salvar e retomar o estado estabilizado da fase em andamento no navegador, incluindo até 100 jogadas para desfazer.
- [ ] Verificar a preservação dos dados em futuras atualizações da versão web e, posteriormente, na versão Android.
- [x] Avançar pelas fases em sequência, permitir reiniciar a fase atual e preservar o progresso ao recarregar o navegador.
- [x] Etapa geral de funcionamento no Android, incluindo fechamento e atualização: aprovada por Thiago em 8 de novembro de 2026; resultados individuais não foram detalhados.
- [x] Verificar automaticamente uma solução para cada fase da campanha.
- [ ] Testar a curva de dificuldade com jogadores e conferir os formatos com quatro linhas no celular.

Entrega: campanha inicial completa e jogável offline.

### 6. Testes e refinamento

- [x] Conferir no celular o comportamento das fases geradas e da dica. Thiago confirmou que os testes desta etapa passaram em 7 de novembro de 2026.
- [ ] Testar a versão web em telas pequenas, diferentes proporções e navegadores, inclusive no celular.
- [ ] Testar toque rápido, arraste interrompido, tela bloqueada, chamadas e retorno ao jogo.
- [ ] Testar consistência da versão web após fechar, reabrir e atualizar o jogo.
- [ ] Validar vitória, impasse, desfazer e reinício em fases com camadas, dispensadores e correntes.
- [ ] Avaliar fluidez, consumo de bateria, tamanho dos recursos e legibilidade na versão web.
- [x] Preparar a beta web para jogadores, com [instruções, atalhos e perguntas de feedback](README.md#teste-beta-no-navegador).
- [ ] Reunir relatos de jogadores em aparelhos diferentes e registrar onde ficam confusos ou presos.
- [ ] Priorizar as fases 20, 29 e 30 no teste humano das primeiras 30 fases. Na simulação com 200 partidas por fase, elas tiveram as menores taxas de vitória.
- [ ] Acompanhar relatos da versão 1.0.0 e corrigir problemas encontrados.

Entrega: versão candidata com fases verificadas e desempenho aceitável nos aparelhos testados.

### 7. Preparação para lançamento

- [ ] Criar nome final, ícone, capturas de tela e descrição coerentes com o jogo.
- [ ] Revisar direitos de uso dos recursos artísticos, fontes, sons e bibliotecas.
- [x] Integrar o Capacitor e gerar um APK de teste para Android. A versão 0.1.6 está publicada como release.
- [x] Integrar feedback tátil nativo no APK. Thiago confirmou que a vibração funciona no aparelho com a versão 0.1.6.
- [ ] Verificar os detalhes do feedback tátil em outros aparelhos e combinações de ajustes do sistema.
- [x] Dar como aprovada a etapa geral de funcionamento no Android, conforme orientação de Thiago em 8 de novembro de 2026.
- [ ] Ampliar a verificação do aplicativo em outros aparelhos e registrar resultados individuais de tela cheia, áreas seguras, salvamento, áudio, vibração, interrupções e funcionamento offline.
- [x] Publicar uma versão Android assinada de teste: release 0.1.6.
- [ ] Documentar a compilação de distribuição e conferir a proteção e recuperação da chave de assinatura.
- [ ] Conferir os requisitos vigentes da Google Play, incluindo testes, compatibilidade, segurança de dados e políticas aplicáveis.
- [ ] Realizar teste fechado quando exigido e corrigir os problemas encontrados.
- [ ] Publicar a primeira versão quando estiver pronta, com histórico de mudanças e canal de suporte.

Entrega: versão pública gratuita e sem anúncios, acompanhada de instruções claras para jogadores.

### 8. Após o lançamento

- [ ] Acompanhar falhas e relatos de jogadores.
- [ ] Adicionar novos conjuntos de fases, objetos e cenários originais.
- [ ] Desenvolver posteriormente um modo separado com tempo e outras funcionalidades, a definir.
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
- Ampliar a validação da retomada após interrupções e atualizações em diferentes navegadores e aparelhos Android.
- Ampliar os modelos usados na geração e testar dificuldade, legibilidade em celulares e limites da dica nas fases geradas.
