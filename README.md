# Mercadinho

> Um jogo casual de organização de prateleiras: encontre os trios, planeje os movimentos e deixe tudo em ordem.

<p align="center">
  <img src="assets/mockup.jpg" alt="Mockup visual do jogo Mercadinho" width="420">
</p>

**[Jogar no navegador](https://thiagodluz.github.io/Mercadinho/)** · **[Plano de desenvolvimento](PLANO-DE-DESENVOLVIMENTO.md)**

## Sobre o projeto

Mercadinho é um jogo de combinar três produtos iguais em prateleiras. A campanha está sendo desenvolvida primeiro para a web, com controles adaptados a telas de celular e computador. A versão planejada será **gratuita, sem anúncios e sem compras dentro do jogo**.

O mockup acima apresenta a direção visual inicial. As ilustrações e alguns elementos do protótipo ainda são provisórios e serão refinados durante o desenvolvimento.

## Protótipo atual

O protótipo começa com oito fases manuais. Da fase 9 à 208, há 200 tabuleiros distintos com solução verificada e 43 formatos de prateleiras. A dificuldade estimada sobe ao longo da campanha, com desafios nas fases terminadas em 0 e respiros nas terminadas em 5. A partir da fase 209, a sequência reutiliza os últimos 50 tabuleiros com produtos variados por semente.

- **Produtos:** catálogo de 20 mercadorias ilustradas provisórias.
- **Trincas:** reúna três produtos iguais no mesmo compartimento para removê-los.
- **Prateleiras em camadas:** organize os itens da frente para revelar os que estão atrás. Um selo `+1` indica mais uma fileira além da que aparece escurecida.
- **Dispensador:** retire os produtos na ordem apresentada. A nova campanha intercala os tipos da fila.
- **Correntes:** complete trios para abrir compartimentos bloqueados.
- **Dica:** mostra de imediato o primeiro movimento de uma solução verificada no início das fases da nova campanha. Durante a partida, procura uma solução para a posição atual se você sair da sequência sugerida.
- **Controles de partida:** arraste ou selecione um produto, desfaça movimentos, pause a partida e reinicie a fase.
- **Acessibilidade:** opção para reduzir animações, além da preferência do aparelho.
- **Progresso local:** o navegador guarda a fase mais avançada, a partida em andamento e as preferências de áudio.

O conteúdo ainda é um protótipo; número de fases, arte, áudio e regras podem mudar conforme os testes.

## Como jogar

1. Escolha um produto acessível na prateleira ou no dispensador.
2. Arraste-o até uma vaga livre ou toque no produto e depois na vaga de destino.
3. Junte três produtos iguais no mesmo compartimento.
4. Continue organizando as prateleiras até concluir a fase.

Use **Desfazer** para voltar uma jogada ou **Reiniciar** para começar a fase atual novamente. As fases são liberadas uma depois da outra. As fases geradas mantêm o mesmo tabuleiro ao reiniciar ou reabrir no mesmo navegador.

## Executar localmente

Não há dependências de instalação para o protótipo atual. Clone o repositório e abra `index.html` em um navegador moderno. Para servir a pasta localmente, também é possível usar:

```bash
python3 -m http.server 8000
```

Depois, acesse [http://localhost:8000](http://localhost:8000).

## Testes da lógica

Com o Node.js instalado, execute na pasta do projeto:

```bash
node tests/run.cjs
```

Os testes cobrem as oito fases iniciais, os 200 tabuleiros da campanha, continuação após a fase 208, retomada, interrupções, pausa, acessibilidade e interações entre as mecânicas. Para medir novamente a curva com o jogador simulado, execute `node tests/campanha.cjs --dificuldade`.

## Estrutura

```text
.
├── assets/
│   └── mockup.jpg
├── tests/
├── tools/fases/
├── fases.js
├── index.html
├── PLANO-DE-DESENVOLVIMENTO.md
└── README.md
```

A lógica do jogo fica em `index.html`, e `fases.js` contém os tabuleiros e as soluções pré-calculadas. O gerador em `tools/fases/` usa as regras do jogo e roda apenas no computador de desenvolvimento. `node tools/fases/campanha.cjs index.html` monta e grava um novo banco em `fases.js`. Ao substituir o banco publicado, atualize a versão da campanha para que o jogo reinicie os tabuleiros incompatíveis na mesma fase.

## Próximas etapas

A prioridade é terminar e testar o jogo em HTML, CSS e JavaScript: fortalecer as regras, ampliar as fases, refinar a apresentação e validar a experiência em celulares. A preparação de um aplicativo Android virá depois que a versão web estiver pronta e testada.

Veja o [plano completo de desenvolvimento](PLANO-DE-DESENVOLVIMENTO.md) para acompanhar os próximos passos.

## APK de teste para Android

O app empacota os arquivos do jogo com Capacitor e usa uma integração Java para o feedback tátil do Android. A campanha e os recursos visuais vêm no APK, com progresso local separado do navegador.

Para compilar, use Node.js 22 ou superior, JDK 21 e o Android SDK com a plataforma 36 e os Build Tools. Configure `JAVA_HOME` e `ANDROID_HOME` antes de executar:

```sh
npm ci
npm test
npm run android:debug
```

O APK de depuração fica em `android/app/build/outputs/apk/debug/app-debug.apk`. No aparelho, ative **Som e vibração → Vibração** e teste o encaixe de um produto e a formação de um trio. O feedback respeita os ajustes de toque do Android.
