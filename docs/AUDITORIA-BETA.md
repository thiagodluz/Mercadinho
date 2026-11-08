# Auditoria da beta do Mercadinho

A beta 0.1.7-beta.1 reúne as cinco mudanças do [PR #1][pr] e a página autônoma de teste publicada em [`/beta/`][beta]. O [guia de regras e referências](REGRAS-E-MECANICAS.md) registra a pesquisa que orientou o ciclo. As posições e os números do guia descrevem o código anterior ao rebalanceamento.

## O que mudou

| Commit | Comportamento | Motivo |
|---|---|---|
| [`05eb8bb`][impasse] | Ao ficar sem jogadas úteis, o tabuleiro oferece Desfazer. | Recuperar o último lance sem reiniciar toda a fase. Desfazer restaura também o estoque e a ordem da caixa. |
| [`bdaa590`][tutorial] | As primeiras fases explicam o fundo escurecido e avisam quando resta uma vaga. | A pessoa precisa saber que esvaziar toda a frente revela o fundo e que retirar da caixa pode consumir o último espaço. |
| [`69a7bbf`][dificuldade] | Foram ajustados os tabuleiros das fases 20, 29 e 30 e suas soluções iniciais. | Reduzir os bloqueios observados nas simulações. A fase 30 continua servindo como desafio. |
| [`1f8a9ba`][resgate] | O impasse pode oferecer uma prateleira extra quando a busca verifica uma solução com ela. Cascatas contam os trios concluídos no mesmo lance. | Conservar a partida em um impasse recuperável. O jogador pode desfazer toda a cascata em um único passo. |
| [`9f779ba`][esgotada] | A fase de teste Prateleira Esgotada fecha um compartimento quando a frente e o fundo esvaziam. | Observar como a perda de vagas muda o planejamento em um tabuleiro isolado da campanha. |
| [`2c83286`][hospedagem] | `/beta/` tem menu Testes, imagens e fases incorporadas e chaves próprias de salvamento. | Distribuir a mesma página para teste sem interferir na campanha da página inicial. |

A lógica do jogo e da interface fica em [`index.html`](../index.html). O [banco de fases](../fases.js) armazena os tabuleiros e suas soluções iniciais. Os [testes de interação](../tests/infinitas.cjs) executam a lógica do jogo e verificam impasse, recuperação, cascata, a prateleira que fecha e o isolamento dos atalhos. O [gerador e o avaliador](../tools/fases/) ajudam a revisar o banco e a curva de dificuldade.

## Como reproduzir

Abra [a beta no navegador][beta] ou abra o app **Mercadinho Beta**. O botão **Testes** alterna entre campanha e os tabuleiros de teste. As partidas de teste ficam separadas do progresso da campanha.

| Cenário | Ação e resultado esperado |
|---|---|
| Fase 1 | Confira a prévia escurecida e mova o último produto de uma frente. A próxima fileira avança inteira. |
| Fase 6 | Leve o leite da caixa à vaga ao lado dos dois leites. O fundo revela um segundo trio no mesmo lance e aparece **Cascata ×2**. |
| Fase 29 | Leve o suco da caixa à vaga da prateleira do meio e o molho à vaga central da prateleira inferior direita. O aviso de impasse oferece **Desfazer** e **Prateleira extra**. O teste automatizado verifica as duas opções e a vitória após o resgate. |
| Prateleira Esgotada | Esvazie a prateleira marcada. Ela fecha após sair o último produto de todas as camadas. As outras prateleiras continuam disponíveis. |
| Android | Abra o app em modo avião. Confira toque, arraste até as bordas, salvamento após fechar e reabrir e vibração com **Som e vibração → Vibração**. Essa validação em aparelho físico fica pendente nesta beta. |

## Reproduzir as verificações e a compilação

```sh
npm ci
npm test
node tests/campanha.cjs --dificuldade
python3 tools/empacotar-beta-web.py --check
npm run android:beta
```

A suíte verificou as oito fases iniciais, 200 tabuleiros gerados, 43 formatos, retomada, continuidade após a fase 208 e as novas mecânicas. O modo de dificuldade é uma simulação. A aprovação da beta web foi registrada pelo jogador antes do empacotamento Android.

O último comando requer Node.js 22+, JDK 21 e SDK Android com a plataforma 36, Platform-Tools e Build Tools 35.0.0 e 36.0.0. Instale os componentes e aceite as licenças pelo SDK Manager antes de compilar. O APK fica em `android/app/build/outputs/apk/beta/app-beta.apk`. A variante usa o identificador `br.com.thiagodluz.mercadinho.beta`, código 8 e uma assinatura de teste. Instala ao lado da 0.1.6 com progresso próprio. O conteúdo jogável é a página versionada em `beta/index.html` acrescida da ponte nativa do Capacitor para vibração, arraste e ciclo do aplicativo.

A compilação passou no lint do Android. O APK entregue teve a assinatura v2 e a integridade verificadas. Os testes sobre o HTML extraído confirmaram os atalhos, a cascata, o impasse e a recuperação. SHA-256 do arquivo entregue `Mercadinho-0.1.7-beta.1.apk`

```text
72a46c9c3d0e4ddef113eca17708cb7331ce8e06599f53ad107a455e6ecc124c
```

Para atualizar o HTML autônomo depois de editar o jogo ou as fases, execute `python3 tools/empacotar-beta-web.py` e revise também o diff de `beta/index.html`.

## Histórico das branches

As mudanças de jogo e Android anteriores à beta estão na `main`. As referências abaixo preservam experimentos de empacotamento da época. Reaplicar esses fluxos recuperaria configurações de publicação antigas.

| Branch | Commits fora da `main` | Conteúdo |
|---|---|---|
| `android/arraste-bordas` | `f764ac1` | Workflow de APK de teste. |
| `android/gesto-voltar` | `c0a18dc`, `1faa149` | Workflows de builds de teste. |
| `android/primeiro-apk` | `c6b5990`, `5260278` | Automação provisória do primeiro APK. |
| `release/publicar-0.1.6` | `f58947e`, `456ff9f` | Preparação da publicação e cópia temporária do APK 0.1.6. |

[pr]: https://github.com/thiagodluz/Mercadinho/pull/1
[beta]: https://thiagodluz.github.io/Mercadinho/beta/
[impasse]: https://github.com/thiagodluz/Mercadinho/commit/05eb8bb
[tutorial]: https://github.com/thiagodluz/Mercadinho/commit/bdaa590
[dificuldade]: https://github.com/thiagodluz/Mercadinho/commit/69a7bbf
[resgate]: https://github.com/thiagodluz/Mercadinho/commit/1f8a9ba
[esgotada]: https://github.com/thiagodluz/Mercadinho/commit/9f779ba
[hospedagem]: https://github.com/thiagodluz/Mercadinho/commit/2c83286
