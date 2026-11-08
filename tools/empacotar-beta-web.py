import argparse
import base64
import json
import re
from pathlib import Path


repo = Path(__file__).resolve().parent.parent
source = (repo / "index.html").read_text()
campaign = (repo / "fases.js").read_text()


def replace_once(document, old, new):
    if document.count(old) != 1:
        raise ValueError(f"Ponto de empacotamento não encontrado: {old!r}")
    return document.replace(old, new, 1)


def inline_image(path):
    return "data:image/webp;base64," + base64.b64encode(path.read_bytes()).decode()


product_images = {
    path.stem: inline_image(path)
    for path in sorted((repo / "assets/produtos").glob("*.webp"))
}
if "</script" in campaign.lower():
    raise ValueError("O banco de fases contém uma marca de fechamento de script")
html = re.sub(
    r"assets/[a-z/]+\.webp",
    lambda match: inline_image(repo / match.group()),
    source,
)
html = replace_once(html, '<title>Mercadinho</title>', '<title>Mercadinho — Beta web</title>')
html = replace_once(
    html,
    '<script src="fases.js"></script>',
    '<script>\n' + campaign + '\nconst betaProductImages = ' +
    json.dumps(product_images, separators=(",", ":")) + ';\n</script>',
)
html = replace_once(html, 'assets/produtos/${id}.webp', '${betaProductImages[id]}')
html = replace_once(
    html,
    'const search = globalThis.location?.search;',
    'const hash = globalThis.location?.hash;\n'
    '      const search = hash?.startsWith("#teste=") ? hash.slice(1) : (hash === "#campanha" ? "" : globalThis.location?.search);',
)
html = replace_once(html, "['20', '29', '30'].includes(requestedTest)", "['1', '6', '20', '29', '30'].includes(requestedTest)")

# O GitHub Pages usa a mesma origem para a campanha e /beta/.
for key in ("unlocked", "layout-seed", "partida-v1", "reduced-motion", "gesture-margin", "audio"):
    html = html.replace(f"'mercadinho-{key}'", f"'mercadinho-beta-{key}'")

styles = """
    .beta-toggle { left: 0; right: auto; width: 54px; font-size: .69rem; font-weight: 900; }
    .beta-dialog { width: min(94vw, 378px); max-height: calc(100dvh - 32px); padding: 16px; }
    .beta-dialog p { margin-bottom: 12px; font-size: .86rem; line-height: 1.4; }
    .beta-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .beta-dialog .beta-options .control { min-height: 44px; margin: 0; padding: 7px 5px; font-size: .78rem; }
    .beta-options .wide { grid-column: 1 / -1; }
    .beta-dialog details { margin: 12px 0; text-align: left; font-size: .82rem; }
    .beta-dialog details p { margin: 5px 0 9px; }
    .beta-close { min-height: 44px; font-size: .83rem; }
"""
html = replace_once(html, "  </style>", styles + "  </style>")
html = replace_once(
    html,
    '        <p id="instructions"',
    '        <button id="beta-toggle" class="pause-control beta-toggle" type="button" aria-haspopup="dialog">Testes</button>\n'
    '        <p id="instructions"',
)
html = re.sub(
    r'    <nav id="playtest"[\s\S]*?</nav>',
    '    <nav id="playtest" class="playtest" aria-label="Fase de teste" hidden>'
    '<p>Partida de teste separada da campanha.</p></nav>',
    html,
    count=1,
)
dialog = """
    <dialog id="beta-dialog" class="pause-dialog beta-dialog" aria-labelledby="beta-title">
      <h2 id="beta-title">Mercadinho · Beta web</h2>
      <p>Escolha o que quer testar. Os atalhos abrem partidas separadas da campanha.</p>
      <div class="beta-options">
        <button class="control wide" type="button" data-beta-mode="campanha">Jogar a campanha</button>
        <button class="control secondary" type="button" data-beta-mode="1">Fase 1 · Tutorial</button>
        <button class="control secondary" type="button" data-beta-mode="6">Fase 6 · Cascata</button>
        <button class="control secondary" type="button" data-beta-mode="20">Fase 20</button>
        <button class="control secondary" type="button" data-beta-mode="29">Fase 29 · Impasse</button>
        <button class="control secondary" type="button" data-beta-mode="30">Fase 30</button>
        <button class="control secondary" type="button" data-beta-mode="esgotada">Prateleira Esgotada</button>
      </div>
      <details>
        <summary>Como reproduzir o impasse e a cascata</summary>
        <p><strong>Fase 29.</strong> Coloque o suco da caixa na vaga da prateleira do meio.
          Depois, coloque o molho na vaga central da prateleira inferior direita.
          Escolha Desfazer ou Prateleira extra.</p>
        <p><strong>Fase 6.</strong> Leve o leite da caixa para a vaga ao lado dos dois leites.
          O fundo vai revelar outro trio no mesmo lance.</p>
      </details>
      <button id="beta-close" class="control secondary beta-close" type="button">Voltar ao tabuleiro</button>
    </dialog>
"""
html = replace_once(html, "  </main>", dialog + "  </main>")
menu = """
  <script>
    (() => {
      const dialog = document.getElementById('beta-dialog');
      const toggle = document.getElementById('beta-toggle');
      const modeOf = hash => hash.startsWith('#teste=') ? hash.slice(7) : 'campanha';
      toggle.addEventListener('click', () => dialog.showModal());
      document.getElementById('beta-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        const button = event.target.closest('[data-beta-mode]');
        if (!button) return;
        const mode = button.dataset.betaMode;
        if (mode === modeOf(location.hash) && location.hash) {
          dialog.close();
          return;
        }
        location.replace(mode === 'campanha' ? '#campanha' : '#teste=' + mode);
        location.reload();
      });
      if (!location.hash && !location.search) dialog.showModal();
    })();
  </script>
"""
html = replace_once(html, "</body>", menu + "</body>")
if re.search(r'(?:src|href)="(?:assets/|fases\.js|https?://)|url\("assets/', html):
    raise ValueError("A beta ainda depende de arquivos externos")

parser = argparse.ArgumentParser(description="Empacota a página autônoma da beta.")
parser.add_argument("--check", action="store_true", help="Compara com a beta versionada.")
args = parser.parse_args()
destination = repo / "beta" / "index.html"
if args.check:
    if destination.read_bytes() != html.encode("utf-8"):
        raise SystemExit("A beta web está desatualizada. Execute tools/empacotar-beta-web.py.")
    print("A beta web versionada corresponde aos arquivos do jogo.")
else:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(html, encoding="utf-8")
