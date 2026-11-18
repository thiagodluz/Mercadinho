# Mercadinho 1.1.0

## Mudanças

- Área reservada para o tabuleiro, com nichos de tamanho consistente e alinhamento em três colunas. Os formatos variam pelas posições ocupadas.
- Prateleira extra aproveita uma posição disponível; se não houver, ocupa uma fileira adicional.
- Mais produtos: 132 dos 200 tabuleiros da campanha receberam seis peças adicionais. A campanha possui 30 formatos e mantém soluções completas.
- Ao soltar sobre um compartimento, a vaga livre mais próxima é escolhida. Compartimentos bloqueados ou cheios não recebem peças; a tolerância de soltura nas molduras é mantida.
- Mesmas mudanças na web principal, beta web e conteúdo usado pelo Android.

## Atualização do Android

Pacote: `br.com.thiagodluz.mercadinho`. Versão: `1.1.0`, código `11`. O APK deve usar o mesmo certificado da 1.0.0 e do Prisma; a compilação confere o certificado do APK anterior antes de disponibilizar o arquivo.

Instale sobre a 1.0.0 para manter os dados da instalação. A fase desbloqueada e as preferências são preservadas. Como o banco de fases mudou da versão 5 para 6, uma fase gerada em andamento recomeça na mesma fase. Instalações beta com identificadores distintos têm dados separados.

## Validação

A base de implementação é o commit `a1f32c204cbc250ba41b356c5c3d3e9f10811ea7`. A execução [Validar Mercadinho 1.1](https://github.com/thiagodluz/Mercadinho/actions/runs/44210610268) passou: sincronização da beta, lógica, 200 soluções, salvamento e retomada, interrupções, acessibilidade, impasses, arraste rápido e seleção de modos.

A compilação de distribuição verifica assinatura, igualdade do certificado com a 1.0.0, pacote, versão, integridade do ZIP e correspondência dos arquivos HTML, fases e ponte nativa dentro do APK. A verificação no aparelho físico da atualização, vibração e retomada permanece necessária.

## Compilação

Requisitos: Node.js 22, JDK 21 e Android SDK 36. Execute `npm ci`, `npm test`, `npm run android:sync` e, em `android/`, `./gradlew assembleRelease`. Configure as variáveis de assinatura indicadas no README usando a chave existente do Prisma. Não gere uma nova chave para atualizar o aplicativo.

A chave permanece nos segredos do repositório Prisma. O ramo isolado `build/mercadinho-1-1-0` compila a base exata do Mercadinho e retorna apenas o APK assinado, checksum e identificação da compilação. O workflow remove o keystore temporário ao terminar.
