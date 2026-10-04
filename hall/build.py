from pathlib import Path
import re
root=Path(__file__).parent
source=(root.parents[1]/'accueil-native-2026-09-24/elucid-accueil/home.html').read_text(encoding='utf-8')
def section(name):
    return re.search(r'<section class="'+name+r'\b.*?</section>',source,re.S).group()
rooms=re.findall(r'<article class="ee-room\s.*?</article>',source,re.S)
sections={
 'rouages':rooms[0], 'cybertrax':rooms[1],
 'tarifs':section('ee-pricing'), 'faq':section('ee-faq'),
 'cadeaux':section('ee-gift'), 'avis':section('ee-reviews'),
 'ensemble':section('ee-experience')+section('ee-audience')+'<div class="group-actions"><a class="ee-button" href="https://elucidescape.fr/entreprises/" target="_blank" rel="noopener">Entreprises ↗</a><a class="ee-text-link" href="https://elucidescape.fr/evenements/" target="_blank" rel="noopener">Évènements ↗</a></div>',
 'contact':section('ee-final')+re.search(r'<footer.*?</footer>',source,re.S).group()
}
panels=[]
for key,content in sections.items():
    content=content.replace('{{ASSETS}}','../assets').replace('{{SITE}}','https://elucidescape.fr')
    content=re.sub(r' srcset="[^"]*"','',content).replace('rouages-720.webp','rouages-1440.webp').replace('cybertrax-720.webp','cybertrax-1440.webp')
    content=content.replace('../assets/symbole.svg','../../accueil-native-2026-09-24/elucid-accueil/assets/symbole.svg')
    # Every image is available immediately when its destination opens.
    content=content.replace(' loading="lazy"','')
    if key in ('rouages','cybertrax'):
        content+='<div class="room-shortcuts"><a href="#tarifs" data-route="tarifs">Voir les tarifs ↗</a><a href="#faq" data-route="faq">Une question ? ↗</a></div>'
    panels.append(f'<section class="destination" data-page="{key}" aria-label="{key}" hidden>{content}</section>')
def door(key,num,title,sub,tint):
 return f'''<a class="passage {tint}" href="#{key}" data-route="{key}"><div class="passage-number">{num}<span>ENTRER ↗</span></div><div class="door-frame"><div class="door-view view-{key}"></div><div class="leaf leaf-left"><i></i></div><div class="leaf leaf-right"><i></i></div><div class="seal"><span></span></div><div class="door-edge"></div></div><h2>{title}</h2><p>{sub}</p></a>'''
doors=door('rouages','01','Les Rouages','de l’Apocalypse','amber')+door('cybertrax','02','CybertraX','Prochainement','blue')+door('tarifs','03','Votre visite','Tarifs & équipe','amber')+door('faq','04','Les réponses','Toutes vos questions','blue')
html='''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Elucid — Choisissez votre passage</title><link rel="stylesheet" href="hall.css"><script src="hall.js" defer></script></head><body><div id="ee-home">
<header class="topbar"><a href="#accueil" class="brand" data-route="accueil" aria-label="Elucid Escape, accueil"><img src="../assets/logo.svg" width="160" height="60" alt="Elucid Escape"></a><nav aria-label="Navigation principale"><a href="#accueil" data-route="accueil" class="hall-return">← Le hall</a><a href="#tarifs" data-route="tarifs">Tarifs</a><a href="#faq" data-route="faq">FAQ</a><a href="#cadeaux" data-route="cadeaux">Carte cadeau</a><a href="#avis" data-route="avis">Avis</a><a href="#ensemble" data-route="ensemble">En groupe</a><a href="#contact" data-route="contact">Contact</a></nav><a class="book" href="https://elucidescape.fr/booking/" target="_blank" rel="noopener">Réserver ↗</a></header>
<main id="main">
<section class="lobby" data-page="accueil"><div class="lobby-atmosphere" aria-hidden="true"></div><div class="hall-floor" aria-hidden="true"></div><div class="lobby-heading"><p class="eyebrow">ELUCID ESCAPE · CHÂLONS-EN-CHAMPAGNE</p><h1>À vous de choisir <em>le passage.</em></h1><p>Une aventure, une question, une envie. Poussez la bonne porte.</p></div><div class="passages">'''+doors+'''</div><div class="lobby-bottom"><span>Explorez à votre rythme.</span><div><a href="#cadeaux" data-route="cadeaux">Offrir une aventure ↗</a><a href="#ensemble" data-route="ensemble">Venir ensemble ↗</a><a href="#avis" data-route="avis">Ils ont joué ↗</a></div></div></section>
<div class="inside" hidden><div class="breadcrumb"><a href="#accueil" data-route="accueil"><span class="exit-icon" aria-hidden="true">↶</span><span>Sortir vers le hall</span></a><span aria-hidden="true">/</span><span id="current-label"></span><span class="exit-hint">↑ Remontez pour sortir<span class="exit-meter" aria-hidden="true"></span></span></div>'''+''.join(panels)+'''<nav class="next-rooms" aria-label="Explorer une autre rubrique"><span>Un autre passage ?</span><a href="#rouages" data-route="rouages">Les Rouages</a><a href="#cybertrax" data-route="cybertrax">CybertraX</a><a href="#faq" data-route="faq">FAQ</a><a href="#accueil" data-route="accueil">Tous les passages ↗</a></nav></div>
</main><div class="demo-note">MAQUETTE · NAVIGATION AU CLIC <a href="../">Voir l’essai au défilement ↗</a></div><div class="wipe" aria-hidden="true"><div></div><div></div><span>ELUCID ESCAPE</span></div><noscript><style>.destination[hidden],.inside[hidden]{display:block!important}.wipe{display:none}</style></noscript></div></body></html>'''
(root/'index.html').write_text(html,encoding='utf-8')
print('Built',len(sections),'destinations')
