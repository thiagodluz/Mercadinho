# Mercadinho — projeto de desenvolvimento

## Visão do jogo

Mercadinho é um jogo casual de organização de produtos em prateleiras. O jogador movimenta objetos e reúne três iguais no mesmo compartimento para removê-los, revelar novos produtos e esvaziar o cenário. A diversão vem de administrar vagas e planejar a ordem das combinações.

O jogo será gratuito para instalar e jogar, sem anúncios, compras internas, assinaturas, vidas limitadas ou pagamentos para continuar. A campanha funcionará offline, com progresso salvo no aparelho.

## Público e plataformas

- Público casual, com partidas curtas e controles simples.
- Plataforma inicial proposta: Android, em orientação vertical.
- Versão para navegador e PC como objetivo posterior, aproveitando as mesmas regras.
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
- Motor proposto: Godot, por permitir desenvolver o jogo para Android e navegador a partir de um projeto compartilhado. A versão estável, a compatibilidade de exportação e o desempenho serão verificados quando a implementação começar.

## Regras do protótipo

### Tabuleiro e movimentação

1. O tabuleiro contém compartimentos, cada um com três vagas na fileira acessível.
2. Compartimentos comuns podem conter fileiras adicionais atrás da primeira.
3. Produtos na frente podem ser arrastados para vagas livres acessíveis de outro compartimento comum.
4. Produtos de trás aparecem escurecidos e não podem ser selecionados até avançar.
5. Itens distintos podem dividir um compartimento. Movimentos que apenas reorganizam peças são válidos.
6. Se a fileira da frente ficar vazia, a próxima avança como uma unidade após as combinações pendentes.
7. Quando três produtos iguais ocuparem a mesma fileira acessível de um compartimento comum, eles são removidos automaticamente.
8. Uma movimentação inválida devolve o produto à origem. No protótipo, produtos não trocam diretamente de lugar ao serem soltos sobre vagas ocupadas.
9. A vitória ocorre quando não restarem produtos acessíveis, escondidos ou em dispensadores, após o término das ações pendentes.
10. Se não houver movimentos legais e a fase não estiver concluída, mostrar opções de desfazer ou reiniciar. A ausência de solução futura, apesar de movimentos legais, é um caso separado que precisa de validação específica.

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
- Dica sugere uma ação útil quando houver informação suficiente. Uma jogada legal isolada pode levar a um impasse, por isso a dica deve vir de uma solução verificada ou informar sua limitação.
- Pausa, ajuste separado de música e efeitos, vibração opcional e opção de reduzir animações.

## Etapas de desenvolvimento

### 1. Preparação do projeto

- [ ] Confirmar a versão do motor e configurar exportação Android e teste no navegador.
- [ ] Definir estrutura do código, formatos de fase e organização dos recursos.
- [ ] Criar repositório funcional com instruções de execução e compilação.
- [ ] Definir padrão de nomes, resolução de referência e adaptação a telas verticais.
- [ ] Preparar um fluxo simples de versões e verificação antes de integrar alterações.

Entrega: projeto abre no ambiente de desenvolvimento e exibe uma tela inicial em Android e no navegador de teste.

### 2. Núcleo jogável

- [ ] Implementar prateleiras, vagas e produtos temporários bem distinguíveis.
- [ ] Implementar arraste por toque e mouse, encaixe, rejeição e retorno à origem.
- [ ] Implementar trios automáticos, múltiplos compartimentos e fileiras de fundo.
- [ ] Garantir atualização ordenada de remoção, avanço de fileira e condição de vitória.
- [ ] Criar uma fase curta com solução documentada.
- [ ] Validar toque, estado do tabuleiro e reinício em aparelhos diferentes.

Entrega: fase completa jogável, do início à vitória.

### 3. Mecânicas dos vídeos

- [ ] Adicionar dispensadores e indicação da quantidade restante.
- [ ] Adicionar correntes, contador e sequência de desbloqueio.
- [ ] Adicionar desfazer, reiniciar, pausa e mensagem de vitória.
- [ ] Criar três fases de demonstração, uma para camadas, uma para dispensadores e uma para correntes.
- [ ] Verificar cada fase completa, desfazer em diferentes estados e reinício durante uso normal.

Entrega: protótipo com as três mecânicas principais e controles confiáveis.

### 4. Apresentação e sensação ao jogar

- [ ] Criar identidade visual do Mercadinho e elementos de interface originais.
- [ ] Produzir um conjunto inicial de produtos com silhuetas, cores e rótulos distinguíveis.
- [ ] Criar animações curtas de seleção, encaixe, trio, desbloqueio e vitória.
- [ ] Adicionar sons de encaixe e combinação, música e vibração ajustáveis.
- [ ] Garantir que efeitos não cubram as peças nem dificultem jogadas consecutivas.
- [ ] Ajustar contraste, tamanhos de toque, fontes e opção de movimento reduzido.

Entrega: uma versão visualmente consistente e confortável de jogar.

### 5. Conteúdo e progressão

- [ ] Criar entre 20 e 30 fases manuais para a primeira versão de teste.
- [ ] Introduzir cada mecânica de forma gradual e variar a dificuldade sem saltos bruscos.
- [ ] Variar quantidade de vagas, tipos de produto, profundidade e posição dos obstáculos.
- [ ] Salvar nível desbloqueado, configurações e progresso em armazenamento local.
- [ ] Permitir voltar a fases anteriores e manter o progresso após fechar e abrir o jogo.
- [ ] Validar solução e conclusão de cada fase. Automatizar verificações de tabuleiro e acrescentar testes manuais para situações não cobertas.

Entrega: campanha inicial completa e jogável offline.

### 6. Testes e refinamento

- [ ] Testar tela pequena, diferentes proporções, recortes e áreas de navegação do Android.
- [ ] Testar toque rápido, arraste interrompido, tela bloqueada, chamadas e retorno ao jogo.
- [ ] Testar consistência após fechar o aplicativo, reiniciar e atualizar versões.
- [ ] Validar vitória, impasse, desfazer e reinício em fases com camadas, dispensadores e correntes.
- [ ] Avaliar fluidez, consumo de bateria, tamanho do aplicativo e legibilidade.
- [ ] Fazer testes com jogadores e registrar onde ficam confusos ou presos.
- [ ] Corrigir falhas e ajustar a dificuldade antes da publicação.

Entrega: versão candidata com fases verificadas e desempenho aceitável nos aparelhos testados.

### 7. Preparação para lançamento

- [ ] Criar nome final, ícone, capturas de tela e descrição coerentes com o jogo.
- [ ] Revisar direitos de uso dos recursos artísticos, fontes, sons e bibliotecas.
- [ ] Preparar versão Android assinada e proteger a chave de assinatura.
- [ ] Conferir os requisitos vigentes da Google Play, incluindo testes, compatibilidade, segurança de dados e políticas aplicáveis.
- [ ] Realizar teste fechado quando exigido e corrigir os problemas encontrados.
- [ ] Publicar a primeira versão quando estiver pronta, com histórico de mudanças e canal de suporte.

Entrega: versão pública gratuita e sem anúncios, acompanhada de instruções claras para jogadores.

### 8. Após o lançamento

- [ ] Acompanhar falhas e relatos de jogadores.
- [ ] Adicionar novos conjuntos de fases, objetos e cenários originais.
- [ ] Avaliar modo cronometrado separado e novos obstáculos com base nos testes.
- [ ] Planejar exportação web e outras plataformas após estabilizar a versão Android.

## Critérios para a primeira versão pública

- A campanha inicial pode ser concluída sem pagamento, publicidade ou conexão.
- Todas as fases da campanha têm solução verificada e podem ser reiniciadas.
- O toque é preciso, os produtos são distinguíveis e as regras de bloqueio são apresentadas ao jogador.
- O jogo salva progresso e configurações localmente.
- As funções de desfazer, pausar e reiniciar preservam um estado consistente.
- Não há falhas conhecidas que impeçam avançar ou provoquem perda de progresso.
- Música, efeitos e vibração têm controles próprios.

## Pontos para decidir durante o protótipo

- Identidade visual definitiva, nome dos cenários e estilo dos produtos.
- Quantidade de desfazimentos e critérios para a dica.
- Fórmula de pontuação e se combos terão uma janela de tempo na campanha.
- Tratamento de troca entre itens acessíveis em uma versão futura.
- Retomada de uma fase interrompida no ponto exato ou no início.
- Modelo de criação e validação de fases adicionais, incluindo geração automática apenas se mantiver solução verificável.
