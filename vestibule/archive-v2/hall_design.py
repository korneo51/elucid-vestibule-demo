"""Stylized hall skin; door seams, labels and interactions stay editable."""
import re

def apply(html):
    hall='''<section class="world room-hall photo-hall game-hall" data-scene="1" data-x=".50" data-y=".48" data-w=".145" data-h=".30" id="salles" aria-label="Le hall des aventures"><div class="wall"><img class="hall-background" src="../assets/game-v2/hall-game-v2.jpg" alt="Hall illustré bleu nuit : une salle mécanique à gauche, un laboratoire futuriste à droite" width="1672" height="941"><div class="hall-photo-shade"></div><div class="hall-heading"><p class="eyebrow">ELUCID ESCAPE</p><h2>Deux portes. <br><em>Deux univers.</em></h2></div>
<div class="side-access left-access" data-portal="left"><button class="room-link antique" data-room="rouages" aria-label="Découvrir Les rouages de l’apocalypse" aria-haspopup="dialog"><span class="door-opening"><span class="swing-leaf"><span class="door-material"></span><span class="door-plaque"><span class="plaque-index">AVENTURE 01</span><span class="plaque-title">Les rouages<br>de l’apocalypse</span><span class="plaque-rule"></span></span></span></span><span class="hover-invite">Entrer dans la salle <b>↗</b></span></button></div>
<div class="side-access right-access" data-portal="right"><button class="room-link laboratory" data-room="cybertrax" aria-label="Découvrir CybertraX" aria-haspopup="dialog"><span class="door-opening"><span class="swing-leaf"><span class="door-material"></span><span class="door-plaque"><span class="plaque-index">AVENTURE 02</span><span class="plaque-title">Cyber<span>traX</span></span><span class="plaque-rule"></span><span class="plaque-status">OUVERTURE PROCHAINE</span></span></span></span><span class="hover-invite">Explorer l’univers <b>↗</b></span></button></div></div>
<div class="scene-copy hall-label"><p class="eyebrow">LE HALL DES AVENTURES</p></div>
<div class="threshold" aria-hidden="true"><div class="lintel"></div><div class="leaves"><div class="leaf left"><i></i></div><div class="leaf right"><i></i></div></div><div class="mechanism"><svg viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="64"/><circle class="ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></div><span class="door-mark">LA SUITE ↓</span></div></section>'''
    def split_door(match):
        face=match.group(1).replace('class="swing-leaf"','class="sliding-face"')
        return '<span class="door-opening"><span class="slide-half slide-left" aria-hidden="true">'+face+'</span><span class="slide-half slide-right" aria-hidden="true">'+face+'</span></span><span class="hover-invite">'
    hall=re.sub(r'<span class="door-opening">(.*?)</span><span class="hover-invite">',split_door,hall,flags=re.S)
    html=re.sub(r'<section class="world room-hall".*?(?=<section class="world arrival")',lambda _:hall,html,flags=re.S)
    return html.replace('</head>','<link rel="stylesheet" href="hall-design.css"></head>')
