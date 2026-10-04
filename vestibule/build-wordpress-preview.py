"""Prepare a self-contained Custom HTML payload for a separate WordPress page.

The existing homepage and theme files are never changed by this script.
Pass the five versioned Media Library URLs as arguments after upload.
"""
from pathlib import Path
import argparse
import base64
import html
import json
import re

root = Path(__file__).parent
asset_root = root.parent / 'assets'
parser = argparse.ArgumentParser()
for name in ('hall', 'door-rouages', 'door-cybertrax', 'room-rouages', 'room-cybertrax'):
    parser.add_argument('--' + name, required=True)
args = parser.parse_args()

local = (root / 'index.html').read_text(encoding='utf-8')
content = local[local.index('<header'):local.index('</body>')]
content = content.replace('<footer class="demo-footer"><span>MAQUETTE · LE VESTIBULE</span><a href="../traversee/">L’essai précédent ↗</a><a href="#depart" data-stop="0">Revenir au début ↑</a></footer>', '')
content = re.sub(r'<img[^>]+src="\.\./assets/symbole\.svg"[^>]*>', '', content)

styles = []
for path in (root / 'practical.css', root.parent / 'traversee' / 'traversee.css', root / 'traversee.css', root / 'hall-design.css', root / 'mobile.css', root / 'journey.css'):
    css = path.read_text(encoding='utf-8')
    css = re.sub(r"@import url\('[^']+'\);", '', css)
    styles.append(css)
style = '\n'.join(styles)
font = base64.b64encode((asset_root / 'manrope-latin.woff2').read_bytes()).decode('ascii')
style = style.replace("../assets/manrope-latin.woff2", 'data:font/woff2;base64,' + font)
layout = json.loads((root / 'hall-layout.json').read_text(encoding='utf-8'))
portals = {p['room']: p for p in layout['portals']}
resources = {
    layout['background'].removeprefix('../assets/'): args.hall,
    portals['rouages']['door'].removeprefix('../assets/'): args.door_rouages,
    portals['cybertrax']['door'].removeprefix('../assets/'): args.door_cybertrax,
    portals['rouages']['interior'].removeprefix('../assets/'): args.room_rouages,
    portals['cybertrax']['interior'].removeprefix('../assets/'): args.room_cybertrax,
    'logo.svg': 'https://elucidescape.fr/wp-content/uploads/2026/09/elucid-v6-header-860x320-1.png',
}
for filename, url in resources.items():
    content = content.replace('../assets/' + filename, url)
    style = style.replace('../assets/' + filename, url)

# The isolated page uses Elementor Canvas; the standalone styles need a stable
# zero-margin root even if WordPress wraps the Custom HTML block.
style += '\nbody{margin:0!important}body.admin-bar .site-header{top:32px}'
script = (root / 'traversee.js').read_text(encoding='utf-8') + '\n' + (root / 'mobile.js').read_text(encoding='utf-8') + '\n' + (root / 'journey.js').read_text(encoding='utf-8')
# WordPress texturizes ampersands inside Custom HTML scripts to &#038;.
if '&&' in script:
    raise SystemExit('JavaScript contains &&, which WordPress rewrites inside the HTML block')
payload = '<style>\n' + style + '\n</style>\n' + content + '\n<script>\n' + script + '\n</script>'
if '../assets/' in payload:
    raise SystemExit('Unresolved asset path in payload')
if 'href="../' in payload:
    raise SystemExit('Unresolved relative navigation in payload')
(root / 'wordpress-preview-payload-mobile-v13.html').write_text(payload, encoding='utf-8')
(root / 'wordpress-preview-transfer-mobile-v13.html').write_text('<!doctype html><meta charset="utf-8"><textarea id="payload">' + html.escape('<!-- wp:html -->\n' + payload + '\n<!-- /wp:html -->') + '</textarea>', encoding='utf-8')
print('Prepared WordPress HTML payload:', len(payload.encode('utf-8')), 'bytes')
