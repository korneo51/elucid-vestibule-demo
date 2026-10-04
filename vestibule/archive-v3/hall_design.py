"""Layered reception: independent interiors, sliding leaves, cutaway walls and signs.
hall-layout.json is the single source for the mask AND all projected layers.
"""
from pathlib import Path
import json
import re


def apply(html):
    layout = json.loads((Path(__file__).parent / 'hall-layout.json').read_text(encoding='utf-8'))
    width, height = layout['artWidth'], layout['artHeight']
    cutout = 'M0 0H1V1H0Z '
    layers, signs = [], []
    for portal in layout['portals']:
        points = portal['corners']
        cutout += 'M' + ' L'.join(f'{x/width:.8f} {y/height:.8f}' for x, y in points) + 'Z '
        coords = json.dumps(points, separators=(',', ':'))
        project = f'data-project="{portal["id"]}" data-corners=\'{coords}\''
        layers.append(f'''<div class="side-access {portal['theme']}" {project}>
<button class="room-link" data-room="{portal['room']}" aria-label="{portal['label']}" aria-haspopup="dialog">
<span class="portal-room"><img src="{portal['interior']}" alt="" width="1024" height="1536" decoding="async"></span>
<span class="door-opening" aria-hidden="true" style="--door-art:url('{portal['door']}')">
<span class="slide-half slide-left"><span class="sliding-face"></span></span>
<span class="slide-half slide-right"><span class="sliding-face"></span></span>
</span><span class="hover-invite">Découvrir la salle <b>↗</b></span></button></div>''')
        signs.append(f'''<div class="hall-sign {portal['theme']}" {project} aria-hidden="true"><div class="room-sign"><span>{portal['title']}</span></div></div>''')

    hall = f'''<section class="world room-hall photo-hall layered-hall" data-scene="1" data-x=".50" data-y=".65" data-w=".105" data-h=".26" data-art-width="{width}" data-art-height="{height}" id="salles" aria-label="Le hall des aventures">
<div class="wall"><div class="hall-artboard">
<svg class="hall-mask-defs" width="0" height="0" aria-hidden="true"><defs><clipPath id="hall-apertures-v3" clipPathUnits="objectBoundingBox"><path d="{cutout}" clip-rule="evenodd" fill-rule="evenodd"/></clipPath></defs></svg>
{''.join(layers)}
<img class="hall-background" src="{layout['background']}" alt="Accueil bleu nuit, plafond gris à ossature sombre, lumières cyan et encadrements orange" width="{width}" height="{height}">
{''.join(signs)}
<div class="hall-heading"><p class="eyebrow">LE HALL DES AVENTURES</p><h2>À vous de choisir.</h2></div>
</div></div>
<div class="scene-copy hall-label"></div>
<div class="threshold" aria-hidden="true"><div class="lintel"></div><div class="leaves"><div class="leaf left"><i></i></div><div class="leaf right"><i></i></div></div><div class="mechanism"><svg viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="64"/><circle class="ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></div><span class="door-mark">LA SUITE ↓</span></div></section>'''
    html = re.sub(r'<section class="world room-hall".*?(?=<section class="world arrival")', lambda _: hall, html, flags=re.S)
    # One configurable interior serves both the visible doorway and its room dialog.
    for portal in layout['portals']:
        pattern = r'(<dialog[^>]*id="dialog-' + portal['room'] + r'".*?<div class="dialog-art"><img )data-src="[^"]+"'
        html = re.sub(pattern, lambda m: m[1] + 'data-src="' + portal['interior'] + '"', html, flags=re.S)
    return html.replace('</head>', '<link rel="stylesheet" href="hall-design.css"></head>')
