"""Flatten the vestibule into a self-contained folder for a hosted test page.

The repository keeps `vestibule/` and `traversee/` side by side with `../assets/` links.
A hosted page (for example a Claude Artifact) serves one root folder, so this script copies
only what the page needs, rewrites the paths, embeds the font and drops the link to the
previous prototype. `index.html` of the repository is never modified.

    python3 vestibule/build-test-site.py --out /tmp/vestibule-site

Writes `index.html` (page content only, the host adds <html>/<head>/<body>) and
`index.wrapped.html`, a full document approximating the host skeleton for local checks.
"""
from pathlib import Path
import argparse
import base64
import re
import shutil

root = Path(__file__).parent
repo = root.parent
parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True)
parser.add_argument('--document', action='store_true', help='write index.html as a complete document (GitHub Pages) instead of page content')
parser.add_argument('--style', default='', choices=['', 'a', 'b', 'c'], help="phone travel style used until the visitor picks another ('' = classic scrolling page)")
args = parser.parse_args()
out = Path(args.out)
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)

source = (root / 'index.html').read_text(encoding='utf-8')
body = source[source.index('<body>') + len('<body>'):source.index('</body>')]
body = re.sub(r'<a href="\.\./traversee/">[^<]*</a>', '', body)
body = body.replace('../assets/', 'assets/')
# A hosted page cannot rely on mailto: links. The phone sheet already shows the address; add it to the desktop dialog too.
body = body.replace('Être prévenu de l’ouverture <span aria-hidden="true">✉</span></a></div></dialog>',
                    'Être prévenu de l’ouverture <span aria-hidden="true">✉</span></a><p>Écrire à contact@elucidescape.fr</p></div></dialog>')

head = ('<title>Vestibule Elucid Escape</title>\n'
        + ('<script>window.EE_DEFAULT_VARIANT="' + args.style + '"</script>\n' if args.style else '') +
        '<style>:root{color-scheme:dark}html,body{background:#080d14}</style>\n'
        '<link rel="stylesheet" href="practical.css"><link rel="stylesheet" href="traversee/traversee.css">'
        '<link rel="stylesheet" href="traversee.css"><link rel="stylesheet" href="hall-design.css"><link rel="stylesheet" href="mobile.css"><link rel="stylesheet" href="journey.css">\n'
        '<script src="traversee.js" defer></script><script src="mobile.js" defer></script><script src="journey.js" defer></script>\n')
page = head + body

for name in ('practical.css', 'traversee.css', 'hall-design.css', 'mobile.css', 'journey.css', 'traversee.js', 'mobile.js', 'journey.js'):
    text = (root / name).read_text(encoding='utf-8').replace('../assets/', 'assets/')
    (out / name).write_text(text, encoding='utf-8')

shared = (repo / 'traversee' / 'traversee.css').read_text(encoding='utf-8')
font = base64.b64encode((repo / 'assets' / 'manrope-latin.woff2').read_bytes()).decode('ascii')
shared = shared.replace("url('../assets/manrope-latin.woff2')", "url('data:font/woff2;base64," + font + "')")
(out / 'traversee').mkdir()
(out / 'traversee' / 'traversee.css').write_text(shared, encoding='utf-8')

wanted = set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|svg|jpg|png)', page))
for rel in sorted(wanted):
    target = out / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(repo / rel, target)
document = ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#070c14">\n'
            + head + '</head><body>' + body + '</body></html>')
(out / 'index.html').write_text(document if args.document else page, encoding='utf-8')

skeleton = ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;font:14px system-ui,sans-serif;background:#fafafa}img{max-width:100%}[hidden]{display:none!important}</style>'
            '</head><body>' + page + '</body></html>')
(out / 'index.wrapped.html').write_text(skeleton, encoding='utf-8')

files = sorted(p.relative_to(out).as_posix() for p in out.rglob('*') if p.is_file() and p.name != 'index.wrapped.html')
total = sum((out / f).stat().st_size for f in files)
print(f'{len(files)} files, {total} bytes in {out}')
for f in files:
    print(' ', f)
