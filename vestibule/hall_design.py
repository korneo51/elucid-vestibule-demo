"""Layered reception: independent interiors, sliding leaves, cutaway walls and signs.
hall-layout.json defines the shared door/interior mask and a common vanishing point for signs.
"""
from pathlib import Path
import json
import re


def sign_corners(sign, vanishing_point):
    """Project both horizontal sign edges to the same point as the hall lines."""
    near_x, far_x = sign['nearX'], sign['farX']
    vx, vy = vanishing_point
    depth = (far_x - near_x) / (vx - near_x)
    far_top = round(sign['top'] + depth * (vy - sign['top']))
    far_bottom = round(sign['bottom'] + depth * (vy - sign['bottom']))
    if near_x < far_x:
        return [[near_x, sign['top']], [far_x, far_top], [far_x, far_bottom], [near_x, sign['bottom']]]
    return [[far_x, far_top], [near_x, sign['top']], [near_x, sign['bottom']], [far_x, far_bottom]]


def apply(html):
    layout = json.loads((Path(__file__).parent / 'hall-layout.json').read_text(encoding='utf-8'))
    width, height = layout['artWidth'], layout['artHeight']
    cutout = 'M0 0H1V1H0Z '
    layers, signs, cues, mobile_choices = [], [], [], []
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
</span></button></div>''')
        sign_coords = json.dumps(sign_corners(portal['sign'], layout['vanishingPoint']), separators=(',', ':'))
        signs.append(f'''<div class="hall-sign {portal['theme']} {portal['id']}" data-project="{portal['id']}-sign" data-corners='{sign_coords}' data-source-width="440" data-source-height="150" aria-hidden="true"><div class="room-sign"><span>{portal['title']}</span></div></div>''')
        cue = portal['cue']
        cue_coords = json.dumps(sign_corners(cue, layout['vanishingPoint']), separators=(',', ':'))
        arrow = 'M180 52H42m0 0 42-34M42 52l42 34' if portal['id'] == 'left' else 'M40 52h138m0 0-42-34m42 34-42 34'
        cues.append(f'''<button class="portal-cue {portal['theme']} {portal['id']}" data-project="{portal['id']}-cue" data-corners='{cue_coords}' data-source-width="220" data-source-height="110" data-room="{portal['room']}" aria-label="{portal['label']}"><span class="cue-desktop">CLIQUEZ</span><span class="cue-mobile">TOUCHEZ</span><svg viewBox="0 0 220 110" aria-hidden="true"><path d="{arrow}"/></svg></button>''')
        mobile_choices.append(f'''<button class="mobile-room-link {portal['theme']}" data-room="{portal['room']}" aria-label="{portal['label']}" aria-haspopup="dialog"><span class="mobile-choice-name">{portal['mobileTitle']}</span><span class="mobile-choice-door" style="--door-art:url('{portal['door']}')"></span><span class="mobile-choice-arrow" aria-hidden="true">↗</span></button>''')

    hall = f'''<section class="world room-hall photo-hall layered-hall" data-scene="1" data-x=".50" data-y=".65" data-w=".105" data-h=".26" data-art-width="{width}" data-art-height="{height}" id="salles" aria-label="Le hall des aventures">
<div class="wall"><div class="hall-artboard">
<svg class="hall-mask-defs" width="0" height="0" aria-hidden="true"><defs><clipPath id="hall-apertures-v3" clipPathUnits="objectBoundingBox"><path d="{cutout}" clip-rule="evenodd" fill-rule="evenodd"/></clipPath></defs></svg>
{''.join(layers)}
<img class="hall-background" src="{layout['background']}" alt="Accueil bleu nuit, plafond gris à ossature sombre, lumières cyan et encadrements orange" width="{width}" height="{height}">
{''.join(signs)}
{''.join(cues)}
</div><div class="mobile-hall-ui"><p>TOUCHEZ UNE PORTE</p><div class="mobile-choices">{''.join(mobile_choices)}</div><span class="mobile-scroll">GLISSEZ VERS LE BAS ↓</span></div><span class="mobile-pan-hint" aria-hidden="true">GLISSEZ VERS LE BAS ↓</span></div>
<div class="scene-copy hall-label"></div>
<div class="threshold" aria-hidden="true"><div class="lintel"></div><div class="leaves"><div class="leaf left"><i></i></div><div class="leaf right"><i></i></div></div><div class="mechanism"><svg viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="64"/><circle class="ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></div><span class="door-mark">FAITES DÉFILER ↓</span></div></section>'''
    html = re.sub(r'<section class="world room-hall".*?(?=<section class="world arrival")', lambda _: hall, html, flags=re.S)
    # One configurable interior serves both the visible doorway and its room dialog.
    for portal in layout['portals']:
        pattern = r'(<dialog[^>]*id="dialog-' + portal['room'] + r'".*?<div class="dialog-art"><img )data-src="[^"]+"'
        html = re.sub(pattern, lambda m: m[1] + 'data-src="' + portal['interior'] + '"', html, flags=re.S)
    return html.replace('</head>', '<link rel="stylesheet" href="hall-design.css"></head>')
