from pathlib import Path
import re
root=Path(__file__).parent
source=(root.parents[1]/'accueil-native-2026-09-24/elucid-accueil/home.html').read_text(encoding='utf-8')
def section(name):
 text=re.search(r'<section class="'+name+r'\b.*?</section>',source,re.S).group()
 text=text.replace('{{ASSETS}}','../assets').replace('{{SITE}}','https://elucidescape.fr')
 return text
door='''<div class="threshold" aria-hidden="true"><div class="lintel"></div><div class="leaves"><div class="leaf left"><i></i></div><div class="leaf right"><i></i></div></div><div class="mechanism"><svg viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="64"/><circle class="ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></div><span class="door-mark">CONTINUEZ ↓</span></div>'''
html='''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Elucid — De porte en porte</title><link rel="stylesheet" href="practical.css"><link rel="stylesheet" href="traversee.css"><script src="traversee.js" defer></script></head><body>
<header class="site-header"><a href="#depart" data-stop="0" aria-label="Elucid Escape, retour au départ"><img src="../assets/logo.svg" width="170" height="65" alt="Elucid Escape"></a><nav aria-label="Navigation"><a href="#rouages" data-stop="1">Les Rouages</a><a href="#cybertrax" data-stop="2">CybertraX</a><a href="#infos">Infos pratiques ↓</a><a class="reserve" href="https://elucidescape.fr/booking/" target="_blank" rel="noopener">Réserver ↗</a></nav></header>
<main>
<div class="journey" id="depart"><div class="viewport">
<section class="world foyer" data-scene="0" data-x=".74" data-y=".53" data-w=".235" data-h=".65" aria-label="L’entrée"><div class="wall"><div class="architecture"><i></i><b></b></div></div><div class="scene-copy"><p class="eyebrow">CHÂLONS-EN-CHAMPAGNE · ESCAPE GAME</p><h1>ELUCID<br>ESCAPE<span>.</span></h1><p class="lead">La suite est<br><em>de l’autre côté.</em></p></div>'''+door+'''</section>
<section class="world rouages" data-scene="1" data-x=".245" data-y=".57" data-w=".20" data-h=".59" id="rouages" aria-label="Les Rouages de l’Apocalypse"><div class="wall"><img class="decor" src="../assets/rouages-1440.webp" width="1440" height="1081" alt="Objets des Rouages de l’Apocalypse"><div class="room-shade"></div></div><div class="scene-copy"><p class="eyebrow">01 — LES ROUAGES DE L’APOCALYPSE</p><h2>Observez.<br><em>Reliez. Élucidez.</em></h2><p>Le Comte et la Comtesse détiennent le remède.<br>À vous de le retrouver.</p><p class="room-meta">2–6 JOUEURS <span>90 MINUTES</span></p></div>'''+door+'''</section>
<section class="world cyber" data-scene="2" data-x=".765" data-y=".48" data-w=".205" data-h=".61" id="cybertrax" aria-label="CybertraX"><div class="wall"><div class="cyber-grid"></div></div><div class="scene-copy"><p class="eyebrow">02 — UN NOUVEL UNIVERS</p><h2>Changez<br><em>de dimension.</em></h2><img class="cyber-sign" src="../assets/cybertrax-1440.webp" width="550" height="367" alt="CybertraX"><p class="room-meta">OUVERTURE PROCHAINE</p></div>'''+door+'''</section>
<section class="world arrival" data-scene="3" aria-label="Préparer votre visite"><div class="wall"><div class="arrival-orbit"></div></div><div class="scene-copy"><p class="eyebrow">LE MONDE PEUT BIEN ATTENDRE.</p><h2>On vous garde<br><em>une place ?</em></h2><p>Tarifs, questions, cadeaux…<br>Tout est juste en dessous.</p><span class="down-arrow" aria-hidden="true">↓</span></div></section>
<div class="route-guide"><span id="route-label">L’ENTRÉE</span><span class="route-line"><i></i></span><span id="route-next">Faites défiler · traversez la porte</span></div>
<div class="scroll-progress" aria-hidden="true"><i></i></div>
</div></div>
<div id="ee-home" class="practical"><div class="practical-intro" id="infos"><p class="eyebrow">L’AVENTURE, CÔTÉ PRATIQUE</p><h2>Préparez votre visite.</h2></div>'''+''.join(section(n) for n in ['ee-pricing','ee-faq','ee-gift','ee-reviews','ee-experience','ee-audience','ee-final'])+'''</div>
</main><footer class="demo-footer"><span>MAQUETTE · TRAVERSÉE AU DÉFILEMENT</span><a href="../hall/">Comparer avec le hall ↗</a><a href="#depart" data-stop="0">Revenir au début ↑</a></footer></body></html>'''
(root/'index.html').write_text(html,encoding='utf-8')
hall=(root.parent/'hall/hall.css').read_text(encoding='utf-8')
(root/'practical.css').write_text(hall[hall.index('.ee-faq{'):hall.index('.wipe{')],encoding='utf-8')
print('Built three passages and seven practical sections')
