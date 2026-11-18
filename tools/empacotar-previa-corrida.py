"""Cria uma prévia autônoma, com dados isolados da campanha e da beta."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parent.parent
subprocess.run(['python3', str(root / 'tools/empacotar-beta-web.py'), '--check'], check=True)
html = (root / 'beta/index.html').read_text()
html = html.replace('Mercadinho — Beta web', 'Mercadinho — Prévia Corrida')
html = html.replace('mercadinho-beta-', 'mercadinho-beta-experimento-')
html = html.replace('if (!location.hash && !location.search) dialog.showModal();', '// A prévia abre diretamente no modo escolhido.')
destination = root / 'experimentos/corrida/index.html'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(html)
print('Prévia Corrida empacotada com progresso isolado.')
