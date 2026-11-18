# Formatos livres e modo Corrida — prévia

Esta implementação está no ramo `melhoria/formatos-e-corrida`. A prévia publicada em `/experimentos/corrida/` permite avaliar o novo modo antes de uma versão estável e de um novo APK.

## Tabuleiro

A área tem uma grade fixa de três colunas por quatro linhas. Cada nicho mantém a escala. Os formatos admitem espaços vazios dentro de uma fileira, blocos separados e nichos isolados. A posição inferior direita permanece reservada para a prateleira extra; ativá-la não desloca os outros nichos nem acrescenta uma quinta fileira. A posição visual não altera os índices usados pelas regras, dicas e partidas salvas.

O banco Zen e a versão de campanha 6 são preservados. Todos os seus 200 tabuleiros continuam com as mesmas peças e soluções; apenas a distribuição visual passa a usar os novos formatos.

## Corrida

- Segunda opção de modo, com progresso e partida separados do Zen.
- 24 fases próprias, com 60 a 75 produtos, mais camadas, dispensadores e correntes introduzidas após as primeiras quatro fases.
- Tempo inicial entre 150 e 300 segundos, estimado a partir da solução verificada. Precisa de ajuste com partidas humanas; a duração varia por fase.
- O relógio começa na primeira jogada e continua durante animações, dicas e desfazer. Pausa, configurações e suspensão do aplicativo congelam a contagem.
- Reabrir a partida conserva o tempo restante e apresenta a pausa. O tempo expirado também é conservado; a tentativa só recomeça ao escolher Tentar novamente.
- Ao terminar o tempo, o tabuleiro bloqueia novas jogadas. Reiniciar permite tentar novamente, sem publicidade ou pagamento.
- Ao concluir as 24 fases, o banco é reutilizado em sequência. Esta prévia não oferece geração infinita de quebra-cabeças inéditos.

O armazenamento nativo aceita os dados independentes dos dois modos e de suas betas. O modo do endereço é `?modo=corrida`; sem esse parâmetro, a página abre o Zen.

## Validação

`npm test` verifica os 200 tabuleiros Zen, as 24 soluções Corrida, o relógio com tempo simulado, pausa, suspensão, retomada, expiração, reinício, isolamento do progresso e reserva da prateleira extra. O teste de navegador `tests/corrida-browser.cjs` verifica a interface, a ausência de deslocamento ao ativar a prateleira extra e o ciclo de expiração em 360×640, 390×844 e 768×1024. As capturas ficam disponíveis na execução do workflow de validação.

Para regenerar o banco Corrida: `node tools/fases/corrida.cjs`, seguido de `python3 tools/empacotar-beta-web.py` e `npm test`. A geração usa sementes determinísticas e só aceita fases com solução completa.

## Próxima avaliação

Jogar a prévia no aparelho, conferir a leitura dos formatos e medir se o tempo inicial é adequado. A versão estável 1.1 e o APK distribuído permanecem a referência até essa avaliação.
