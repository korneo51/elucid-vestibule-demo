/* Vestibule mobile, style d : le décor est l'interface.
   Hall : un sceau à tourner (ou toucher) choisit la pièce, l'enseigne dit toujours où l'on va avant d'entrer.
   Portes : une seule action sur la porte elle-même (tourner l'engrenage, faire monter l'énergie) l'ouvre, sans deux pouces.
   Pièces : une machine par pièce, qui est aussi son contenu. Un simple toucher joue toujours le geste.
   Ecrit sans le double esperluette, que WordPress réécrit dans les blocs HTML. */
(() => {
 'use strict';
 const api=window.eeMobile;
 if(!api)return;
 if(api.variant!=='d')return;
 const app=api.app,root=api.root,hall=api.hall,centerDoor=api.centerDoor;
 const BOOK='https://elucidescape.fr/booking/',GIFT='https://elucidescape.fr/cartecadeau/',TEL='tel:+33326673801',TELTEXT='03 26 67 38 01';
 const $=(selector,scope)=>(scope||app).querySelector(selector);
 const $$=(selector,scope)=>[...(scope||app).querySelectorAll(selector)];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const mod=(n,m)=>((n%m)+m)%m;
 const easeOut=api.easeOut,easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const calm=()=>api.isCalm();
 const text=node=>node?node.textContent.replace(/\s+/g,' ').trim():'';
 root.classList.add('d-on');root.dataset.jv='d';

 // ---------- données lues dans le contenu existant (une seule source) ----------
 const prices={};
 $$('.ee-price-details tbody tr').forEach(row=>{
  const n=parseInt(text(row.querySelector('th')),10),cell=row.querySelector('td'),v=parseInt(text(cell),10),session=/session/i.test(text(cell));
  if(n)if(v)prices[n]={session:session,total:session?v:v*n,per:session?v/n:v};
 });
 if(!prices[4])[[2,75,1],[3,28,0],[4,24,0],[5,20,0],[6,20,0]].forEach(item=>{prices[item[0]]={session:Boolean(item[2]),total:item[2]?item[1]:item[1]*item[0],per:item[2]?item[1]/item[0]:item[1]}});
 const reviews=$$('.ee-review').map(article=>{
  const author=article.querySelector('.ee-review-author');
  return{q:text(article.querySelector('blockquote')),by:author?text(author.firstChild):'',more:text(article.querySelector('.ee-review-more p'))};
 });
 const rating=text($('.ee-rating strong'))||'5,0/5',ratingCount=text($('.ee-reviews .ee-muted'))||'263 avis sur Google';
 const faqs=$$('.ee-faq-list details').map(item=>({q:text(item.querySelector('summary')),a:[...item.children].filter(node=>node.tagName!=='SUMMARY').map(node=>node.outerHTML).join('')}));
 const addressNode=$('.ee-final address');
 const addressHtml=addressNode?addressNode.innerHTML:'Elucid Escape<br>72 rue du Faubourg Saint Antoine<br>51000 Châlons-en-Champagne';
 const socials=$$('.ee-contact-grid a').filter(link=>/instagram|facebook|linkedin/.test(link.href)).map(link=>[text(link).replace(/\s*↗/,''),link.href]);
 const mailNode=$('.ee-contact-grid a[href^="mailto:"]');
 const mail=mailNode?text(mailNode):'contact@elucidescape.fr';

 const icons={
  tarifs:'<path d="M3 3h8.5L21 12.5 12.5 21 3 11.5zM7.5 7.5h.01"/>',
  cadeaux:'<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12.5h18M12 8c-2.5-4-6-3-5 0 .6 1.7 3 1.2 5 0zm0 0c2.5-4 6-3 5 0-.6 1.7-3 1.2-5 0z"/>',
  avis:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  questions:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9M12 17h.01"/>',
  contact:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'
 };
 const svgIcon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
 // Les cinq pièces, dans l'ordre du sceau. (« L'équipe » n'a pas de machine dans cet essai.)
 const defs=[
  {id:'m-tarifs',icon:'tarifs',name:'Tarifs',plate:'LES TARIFS',sub:'Composez votre équipe'},
  {id:'m-gift',icon:'cadeaux',name:'Cadeaux',plate:'LES CADEAUX',sub:'Offrir une aventure'},
  {id:'m-avis',icon:'avis',name:'Avis',plate:'LES AVIS',sub:'Ils ont joué le jeu'},
  {id:'m-faq',icon:'questions',name:'Questions',plate:'LES QUESTIONS',sub:'Avant de venir'},
  {id:'m-contact',icon:'contact',name:'Contact',plate:'CONTACT',sub:'Nous joindre, nous trouver'}
 ];
 const N=defs.length,idToIndex={'m-tarifs':0,'m-gift':1,'m-avis':2,'m-faq':3,'m-equipe':4,'m-contact':4};

 // ---------- pièces : cadre commun ----------
 const layer=document.createElement('div');layer.className='d-rooms';layer.setAttribute('aria-hidden','true');app.append(layer);
 const roomEls=[];let current=-1;const enterHooks={};
 defs.forEach((def,index)=>{
  const prev=index===0?{name:'Hall',id:'m-hall'}:defs[index-1],last=index===N-1;
  const el=document.createElement('section');el.className='d-room';el.setAttribute('aria-label',def.name);el.inert=true;
  el.innerHTML='<div class="d-top"><button class="d-hall" type="button" data-room="m-hall" aria-label="Retour au hall">⌂ Hall</button><div class="d-title" tabindex="-1"><small>0'+(index+1)+' / 0'+N+'</small><b>'+def.plate+'</b></div></div><div class="d-body"></div>'
   +'<nav class="d-nav" aria-label="Changer de pièce"><button class="p" type="button" data-room="'+prev.id+'"><i aria-hidden="true">‹</i>'+prev.name+'</button><span class="d-dots" aria-hidden="true">'+defs.map((item,i)=>'<b'+(i===index?' class="on"':'')+'></b>').join('')+'</span>'
   +(last?'<a class="n" href="'+BOOK+'" target="_blank" rel="noopener">Réserver<i aria-hidden="true">↗</i></a>':'<button class="n" type="button" data-room="'+defs[index+1].id+'">'+defs[index+1].name+'<i aria-hidden="true">›</i></button>')+'</nav>';
  layer.append(el);roomEls.push(el);
 });
 layer.addEventListener('click',event=>{const go=event.target.closest('[data-room]');if(go)route(go.dataset.room)});
 function route(id){if(id==='m-hall'){leave();return}const index=idToIndex[id];if(index!==undefined)show(index)}
 function show(index){
  const first=current<0;api.buzz(8);
  const toast=document.querySelector('.m-toast');if(toast)toast.hidden=true;
  current=index;layer.classList.add('is-on');layer.removeAttribute('aria-hidden');root.classList.add('d-in-room');
  roomEls.forEach((el,i)=>{el.classList.toggle('is-here',i===index);el.classList.toggle('is-before',i<index);el.inert=i!==index});
  if(enterHooks[index])enterHooks[index]();
  const title=roomEls[index].querySelector('.d-title');if(title)setTimeout(()=>title.focus({preventScroll:true}),first?400:120);
 }
 function leave(){
  if(current<0)return;
  current=-1;layer.classList.remove('is-on');layer.setAttribute('aria-hidden','true');root.classList.remove('d-in-room');
  roomEls.forEach(el=>{el.classList.remove('is-here','is-before');el.inert=true});
  api.buzz(8);
 }
 api.setGoHook((id,instant)=>route(id));
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const modal=$('.d-modal:not([hidden])');if(modal){modal.hidden=true;return}
  if(current>=0)leave();
 });

  // ---------- clés cachées et récompense : une clé par pièce, cinq clés = un porte-clé ----------
 const KEYS=5;
 let found=[];try{found=JSON.parse(api.recall('ee-keys-d')||'[]')}catch(error){found=[]}
 if(/[?&]keys=0/.test(location.search)){found=[];api.remember('ee-keys-d','[]')}
 const keyChip=document.querySelector('.m-keys'),keyNum=keyChip?keyChip.querySelector('b'):null;
 const keySvg='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12h9.5M18 12v4M21.4 12v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
 function paintKeys(){if(keyNum)keyNum.textContent=String(found.length)}
 paintKeys();
 let audio=null;
 function tone(freqs,ms,volume){
  try{
   if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
   if(audio.state==='suspended')audio.resume();
   const t=audio.currentTime,gain=audio.createGain();
   gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume||.12,t+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+ms/1000);gain.connect(audio.destination);
   freqs.forEach(freq=>{const osc=audio.createOscillator();osc.type='sine';osc.frequency.value=freq;osc.connect(gain);osc.start(t);osc.stop(t+ms/1000+.03)});
  }catch(error){}
 }
 function jingle(){[660,880,1320].forEach((freq,i)=>setTimeout(()=>tone([freq],170,.1),i*110))}
 function makeKey(id){
  const button=document.createElement('button');button.type='button';button.className='d-key';button.dataset.k=String(id);
  button.setAttribute('aria-label','Une clé : touchez-la pour la ramasser');button.innerHTML=keySvg;
  if(found.indexOf(id)>=0)button.hidden=true;
  button.addEventListener('click',()=>takeKey(id,button));
  return button;
 }
 function takeKey(id,element){
  if(found.indexOf(id)>=0)return;
  found.push(id);api.remember('ee-keys-d',JSON.stringify(found));api.buzz([12,34,12]);jingle();
  const from=element.getBoundingClientRect(),to=keyChip?keyChip.getBoundingClientRect():null;
  element.hidden=true;
  let flying=false;
  if(to)if(!calm()){
   flying=true;
   const fly=document.createElement('div');fly.className='m-fly';fly.innerHTML='<svg aria-hidden="true"><use href="#m-key"/></svg>';document.body.append(fly);
   const startAt='translate3d('+(from.left+from.width/2-13).toFixed(1)+'px,'+(from.top+from.height/2-13).toFixed(1)+'px,0) scale(1.6) rotate(-24deg)';
   const endAt='translate3d('+(to.left+to.width/2-13).toFixed(1)+'px,'+(to.top+to.height/2-13).toFixed(1)+'px,0) scale(.8) rotate(30deg)';
   fly.animate([{transform:startAt},{transform:endAt}],{duration:680,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'}).onfinish=()=>{
    fly.remove();paintKeys();keyChip.classList.remove('pop');void keyChip.offsetWidth;keyChip.classList.add('pop');
   };
  }
  if(!flying)paintKeys();
  if(found.length>=KEYS){setTimeout(celebrate,calm()?200:950)}else{api.say('Clé trouvée · '+found.length+' sur '+KEYS,{ms:2600})}
 }
 const winEl=$('.m-win');
 function celebrate(){
  if(!winEl)return;
  const title=winEl.querySelector('h2'),text=winEl.querySelector('p'),cta=winEl.querySelector('.m-cta');
  if(title)title.textContent='Porte-clé gagné !';
  if(text)text.textContent='Vous avez trouvé les 5 clés. Un porte-clé Elucid Escape vous attend : montrez cet écran à l’accueil le jour de votre session.';
  if(cta)cta.innerHTML='Réserver ma partie <span aria-hidden="true">↗</span>';
  winEl.hidden=false;root.classList.add('m-win-open','m-locked');
  [523,659,784,1047].forEach((freq,i)=>setTimeout(()=>tone([freq],260,.1),i*140));api.buzz([20,50,20,50,60]);
 }
 if(keyChip)keyChip.addEventListener('click',event=>{
  event.stopImmediatePropagation();
  const left=KEYS-found.length;
  api.say(left>0?'Il reste '+left+' clé'+(left>1?'s':'')+' à trouver : une par pièce. Cinq clés, un porte-clé offert.':'Vous avez les 5 clés !',{ms:3600});
 },true);
 function fmt(value){return(Math.round(value*10)/10).toString().replace('.',',')+' €'}
 // Glisser le long d'un élément : renvoie la position de 0 à 1.
 function track(element,fn){
  let id=null;
  const at=event=>{const box=element.getBoundingClientRect();return clamp((event.clientX-box.left)/box.width,0,1)};
  element.addEventListener('pointerdown',event=>{id=event.pointerId;try{element.setPointerCapture(id)}catch(error){}fn(at(event),event)});
  element.addEventListener('pointermove',event=>{if(event.pointerId!==id)return;fn(at(event),event)});
  const end=event=>{if(event.pointerId!==id)return;try{element.releasePointerCapture(id)}catch(error){}id=null};
  element.addEventListener('pointerup',end);element.addEventListener('pointercancel',end);
 }

 // ---------- 1. tarifs : le tableau d'abord, puis la lumière noire ----------
 function buildTarifs(body){
  const person='<svg viewBox="0 0 40 56" aria-hidden="true"><circle cx="20" cy="15" r="9"/><path d="M3 54c0-17 7-25 17-25s17 8 17 25z"/></svg>';
  const rows=[2,3,4,5,6].map(n=>{
   const price=prices[n];if(!price)return'';
   return'<div class="tb-r"><span class="who">'+person.repeat(n)+'</span><span>'+n+' joueurs'+(n===2?'*':'')+'</span><em>'+fmt(price.per)+'<small> /pers.</small></em><em class="t">'+fmt(price.total)+'</em></div>';
  }).join('');
  body.innerHTML='<div class="tb"><div class="tb-h"><span>ÉQUIPE</span><span></span><span>PAR PERS.</span><span>SESSION</span></div>'+rows+'</div>'
   +'<a class="d-ticket" href="'+BOOK+'" target="_blank" rel="noopener"><span>Choisir mon créneau ↗</span><small>Le nombre de joueurs se choisit à la réservation</small></a>'
   +'<p class="d-bonus">ÉNIGME BONUS · <i>1 CLÉ</i> CACHÉE</p>'
   +'<div class="uvz" aria-label="Mur noir à explorer à la lampe UV"><div class="uvz-hid"><span>1H30 POUR S’ÉCHAPPER</span><span>DÈS 8 ANS · 2 À 6 JOUEURS</span></div><i class="uvz-beam"></i><p class="uvz-hint">Passez la lampe UV du doigt sur le mur noir</p></div>'
   +'<p class="d-note">* À 2 : un minimum d’expérience · À 6 : la cohésion devient difficile · Plus de 6 : <a href="#" data-room="m-contact">contactez-nous</a></p>';
  const zone=$('.uvz',body),hidden=$('.uvz-hid',body),key=makeKey(1);hidden.append(key);
  let fade=0,moved=0,last=null;
  function beam(x,y){
   zone.style.setProperty('--x',x.toFixed(1)+'px');zone.style.setProperty('--y',y.toFixed(1)+'px');zone.style.setProperty('--o','1');zone.classList.add('seen');
   const k=key.getBoundingClientRect(),z=zone.getBoundingClientRect();
   key.classList.toggle('on',Math.hypot(k.left+k.width/2-z.left-x,k.top+k.height/2-z.top-y)<60);
  }
  function rest(){clearTimeout(fade);fade=setTimeout(()=>{zone.style.setProperty('--o','0');zone.style.setProperty('--x','-200px');zone.style.setProperty('--y','-200px');key.classList.remove('on')},5000)}
  function sweep(){
   const z=zone.getBoundingClientRect(),k=key.getBoundingClientRect(),tx=k.left+k.width/2-z.left,ty=k.top+k.height/2-z.top,start=performance.now(),duration=calm()?1:1400;
   const tick=now=>{const t=Math.min(1,(now-start)/duration);beam(tx*t,ty+Math.sin(t*7)*10*(1-t));if(t<1){requestAnimationFrame(tick)}else{beam(tx,ty);rest()}};
   requestAnimationFrame(tick);
  }
  const local=event=>{const z=zone.getBoundingClientRect();return[event.clientX-z.left,event.clientY-z.top]};
  zone.addEventListener('pointerdown',event=>{
   if(event.target.closest('.d-key'))return;
   clearTimeout(fade);last=local(event);moved=0;beam(last[0],last[1]);try{zone.setPointerCapture(event.pointerId)}catch(error){}
  });
  zone.addEventListener('pointermove',event=>{
   if(!last)return;const at=local(event);moved+=Math.hypot(at[0]-last[0],at[1]-last[1]);last=at;beam(at[0],at[1]);
  });
  const up=event=>{
   if(!last)return;last=null;try{zone.releasePointerCapture(event.pointerId)}catch(error){}
   if(moved<8){sweep()}else{rest()}
  };
  zone.addEventListener('pointerup',up);zone.addEventListener('pointercancel',up);
 }

 // ---------- 2. cadeaux : la carte d'abord, puis le cryptex ----------
 function buildGift(body){
  const bow='<svg class="bw" viewBox="0 0 74 74" aria-hidden="true"><defs><linearGradient id="gbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb95e"/><stop offset="1" stop-color="#d9690f"/></linearGradient></defs><path d="M30 0L74 44V74L44 74 0 30V0z" fill="url(#gbw)" opacity=".95"/><g transform="translate(52 22) rotate(45)"><ellipse cx="-9" cy="-4" rx="9" ry="5.5" fill="#ffd9a0" stroke="#8c4308" stroke-width="1.4"/><ellipse cx="9" cy="-4" rx="9" ry="5.5" fill="#ffd9a0" stroke="#8c4308" stroke-width="1.4"/><circle r="4" fill="#ffb95e" stroke="#8c4308" stroke-width="1.4"/></g></svg>';
  body.innerHTML='<div class="gi">'+bow+'<small>CARTE CADEAU</small><h3>Offrez une aventure</h3><p>La carte cadeau Elucid Escape · 2 à 6 joueurs</p><a class="d-ticket" href="'+GIFT+'" target="_blank" rel="noopener"><span>Offrir une carte cadeau ↗</span><small>Une aventure à partager</small></a></div>'
   +'<p class="d-bonus">ÉNIGME BONUS · <i>1 CLÉ</i> CACHÉE</p>'
   +'<div class="cx"><p class="cx-q">« Je suis au pied du sapin, j’aime les rubans et je fais toujours plaisir. » <b>(6 lettres)</b></p><div class="cx-r"></div><div class="cx-k"></div></div>';
  const rings=$('.cx-r',body),box=$('.cx',body),slot=$('.cx-k',body),answer='CADEAU',letters=['M','Q','F','T','L','B'];
  const columns=letters.map((letter,i)=>{
   const column=document.createElement('button');column.type='button';column.className='cx-c';column.setAttribute('aria-label','Anneau '+(i+1)+', lettre '+letter);
   column.innerHTML='<i aria-hidden="true">▲</i><b>'+letter+'</b><i aria-hidden="true">▼</i>';rings.append(column);return column;
  });
  let solved=false;
  function shift(i,step){
   if(solved)return;
   letters[i]=String.fromCharCode(65+mod(letters[i].charCodeAt(0)-65+step,26));
   columns[i].querySelector('b').textContent=letters[i];columns[i].setAttribute('aria-label','Anneau '+(i+1)+', lettre '+letters[i]);
   tone([300+i*40],60,.05);api.buzz(4);
   if(letters.join('')===answer){
    solved=true;box.classList.add('ok');jingle();api.buzz([14,30,20]);
    const key=makeKey(2);slot.append(key);
   }
  }
  columns.forEach((column,i)=>{
   let start=null,did=false;
   column.addEventListener('pointerdown',event=>{start=event.clientY;did=false;try{column.setPointerCapture(event.pointerId)}catch(error){}});
   column.addEventListener('pointermove',event=>{
    if(start===null)return;const dy=event.clientY-start;
    if(Math.abs(dy)>=22){shift(i,dy<0?1:-1);start=event.clientY;did=true}
   });
   const end=event=>{if(start===null)return;start=null;try{column.releasePointerCapture(event.pointerId)}catch(error){}if(!did)shift(i,1)};
   column.addEventListener('pointerup',end);column.addEventListener('pointercancel',end);
   column.addEventListener('keydown',event=>{if(event.key==='ArrowUp'){event.preventDefault();shift(i,1)}if(event.key==='ArrowDown'){event.preventDefault();shift(i,-1)}});
  });
 }

// ---------- 3. avis : dossier de verre ----------
 function buildAvis(body){
  body.innerHTML='<div class="d-rate"><b></b><span aria-hidden="true">★★★★★</span><small></small></div><div class="d-book" aria-live="polite"><article class="d-pg l"></article><article class="d-pg r"></article></div><div class="d-bnav"><button type="button" data-d="-1" aria-label="Avis précédents">‹</button><span class="d-count"></span><button type="button" data-d="1" aria-label="Avis suivants">›</button></div>'
   +'<div class="d-modal" hidden role="dialog" aria-modal="true"><div></div></div>';
  $('.d-rate b',body).textContent=rating.replace('/5',' / 5');$('.d-rate small',body).textContent=ratingCount;
  const pages=[$('.d-pg.l',body),$('.d-pg.r',body)],count=$('.d-count',body),modal=$('.d-modal',body),book=$('.d-book',body),spreads=Math.max(1,Math.ceil(reviews.length/2));
  let spread=0,busy=false;
  function fill(){
   pages.forEach((page,side)=>{
    const review=reviews[spread*2+side];
    if(!review){page.innerHTML='';if(spread===spreads-1)if(side===1){page.append(makeKey(3));const hint=document.createElement('p');hint.className='by';hint.style.textAlign='center';hint.textContent='Une clé est glissée entre les pages';page.append(hint)}return}
    page.innerHTML='<p class="st" aria-hidden="true">★★★★★</p><blockquote></blockquote><p class="by"></p>'+(review.more?'<button type="button">Lire la suite</button>':'');
    page.querySelector('blockquote').textContent=review.q;page.querySelector('.by').textContent='— '+review.by;
    const more=page.querySelector('button');if(more)more.addEventListener('click',()=>{const box=modal.firstChild;box.innerHTML='';const q=document.createElement('p');q.textContent=review.q+' '+review.more;box.append(q);const by=document.createElement('b');by.textContent='— '+review.by+' · Avis Google';box.append(by);const close=document.createElement('button');close.type='button';close.textContent='Fermer';close.addEventListener('click',()=>{modal.hidden=true});box.append(close);modal.hidden=false;close.focus({preventScroll:true})});
   });
   const first=spread*2+1,last=Math.min(reviews.length,spread*2+2);
   count.textContent=(first===last?first:first+'–'+last)+' / '+reviews.length;
  }
  function turn(step){
   const next=clamp(spread+step,0,spreads-1);if(next===spread)return;if(busy)return;
   const page=step>0?pages[1]:pages[0];
   if(calm()){spread=next;fill();return}
   busy=true;api.buzz(8);
   const out=page.animate([{transform:'rotateY(0deg)'},{transform:'rotateY('+(step>0?-90:90)+'deg)'}],{duration:190,easing:'ease-in',fill:'forwards'});
   out.onfinish=()=>{spread=next;fill();const back=page.animate([{transform:'rotateY('+(step>0?90:-90)+'deg)'},{transform:'rotateY(0deg)'}],{duration:210,easing:'ease-out'});out.cancel();back.onfinish=()=>{busy=false}};
  }
  $$('.d-bnav button',body).forEach(button=>button.addEventListener('click',()=>turn(Number(button.dataset.d))));
  let start=null;
  book.addEventListener('pointerdown',event=>{start={x:event.clientX,y:event.clientY}});
  book.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>46)if(Math.abs(dx)>Math.abs(dy)*1.3)turn(dx<0?1:-1)});
  fill();
 }

  // ---------- 4. questions : les instruments ----------
 function buildFaq(body){
  const icon={
   lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
   users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M16 5a3 3 0 0 1 0 6M18 14c2 1 3 3 3 6"/>',
   clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
   gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/>',
   bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
   mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };
  const tiles=[['lock','Un escape game ?'],['users','Qui peut jouer ?'],['clock','Une partie ?'],['gauge','Difficulté ?'],['bulb','Effrayé ?'],['mail','Autre question']];
  body.innerHTML='<div class="iq"><h4></h4><div class="iq-in"></div><div class="iq-a"></div></div><div class="iq-t">'+tiles.map((tile,i)=>'<button type="button" data-i="'+i+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+icon[tile[0]]+'</svg>'+tile[1]+'</button>').join('')+'</div>';
  const box=$('.iq',body),title=$('h4',body),inst=$('.iq-in',body),ans=$('.iq-a',body),buttons=$$('.iq-t button',body);
  const lightKey=makeKey(4);
  // 1. le cadenas : on glisse le loquet
  function lockInstrument(){
   inst.innerHTML='<div class="iq-lock"><svg viewBox="0 0 50 54" aria-hidden="true"><g class="sh"><path d="M13 24V16a12 12 0 0 1 24 0v8" fill="none" stroke="#c9d6e2" stroke-width="5" stroke-linecap="round"/></g><rect x="5" y="22" width="40" height="30" rx="7" fill="#e8832a" stroke="#8c4308" stroke-width="2"/><circle cx="25" cy="35" r="4" fill="#2a1704"/></svg><div class="sl" style="width:100%"><div class="sl-t"></div><div class="sl-k" style="left:15px"></div></div></div>';
   const slider=$('.sl',inst),knob=$('.sl-k',inst),shackle=$('.sh',inst);
   track(slider,p=>{knob.style.left=(15+p*(slider.clientWidth-30))+'px';shackle.style.transform='translateY('+(-p*7).toFixed(1)+'px) rotate('+(p*-24).toFixed(0)+'deg)';shackle.style.transformOrigin='13px 24px'});
  }
  // 2. l'âge : un curseur
  function ageInstrument(){
   const min=6,max=18;
   inst.innerHTML='<div class="sl"><div class="sl-b"></div><div class="sl-t"></div><div class="sl-z" style="left:0;width:16.7%;background:#7a2a22;border-radius:7px 0 0 7px"></div><div class="sl-z" style="left:16.7%;width:75%;background:#e8832a"></div><div class="sl-z" style="left:91.7%;right:0;background:#35c5da;border-radius:0 7px 7px 0"></div><div class="sl-k"></div></div><div class="sl-s"><span>6</span><span>8</span><span>10</span><span>12</span><span>15</span><span>18 ans</span></div><p class="iq-note"></p>';
   const slider=$('.sl',inst),knob=$('.sl-k',inst),bubble=$('.sl-b',inst),note=$('.iq-note',inst);
   function set(p){
    const age=Math.round(min+p*(max-min)),pos=(age-min)/(max-min);
    knob.style.left=(pos*100)+'%';bubble.style.left=(pos*100)+'%';bubble.textContent=age+' ans';
    note.textContent=age<8?'Un peu jeune : dès 8 ans':age<15?'Possible, avec un adulte (moins de 15 ans)':'Oui, en autonomie';
   }
   track(slider,set);set((8-min)/(max-min));
  }
  // 3. la partie : une frise en quatre temps
  function timelineInstrument(){
   const steps=[['Accueil','10 min','Accueil et consignes de sécurité'],['Scénario','5 min','Présentation du scénario'],['Jeu','90 min maximum','Votre session de jeu : le cœur de l’aventure'],['Bilan','10 min','Compte-rendu et photo souvenir']];
   inst.innerHTML='<div class="tl">'+steps.map((s,i)=>'<button type="button" data-s="'+i+'">'+s[0]+'<small>'+s[1].replace(' maximum','')+'</small></button>').join('')+'</div><p class="iq-note"></p>';
   const tl=$('.tl',inst),cells=$$('.tl button',inst),note=$('.iq-note',inst);
   function pick(i){cells.forEach((c,k)=>c.classList.toggle('on',k===i));note.textContent=steps[i][2]+' · '+steps[i][1];api.buzz(4);tone([440+i*110],70,.05)}
   cells.forEach((cell,i)=>cell.addEventListener('click',()=>pick(i)));
   tl.addEventListener('pointermove',event=>{if(event.buttons!==1)return;const index=cells.findIndex(c=>{const r=c.getBoundingClientRect();return event.clientX>=r.left?event.clientX<=r.right:false});if(index>=0)if(!cells[index].classList.contains('on'))pick(index)});
   pick(2);
  }
  // 4. la difficulté : une jauge à aiguille
  function gaugeInstrument(){
   inst.innerHTML='<div class="gg"><svg viewBox="0 0 220 100" aria-hidden="true"><defs><linearGradient id="ggd" x1="0" x2="1"><stop offset="0" stop-color="#35c5da"/><stop offset=".5" stop-color="#f2a33c"/><stop offset="1" stop-color="#e0503c"/></linearGradient></defs><path d="M20 90A90 90 0 0 1 200 90" fill="none" stroke="#16304f" stroke-width="16" stroke-linecap="round"/><path d="M20 90A90 90 0 0 1 200 90" fill="none" stroke="url(#ggd)" stroke-width="10" stroke-linecap="round"/><g class="nd"><path d="M110 90L110 26" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="110" cy="90" r="9" fill="#e8832a" stroke="#fff" stroke-width="2"/></g><text x="14" y="100" font-family="Manrope" font-weight="800" font-size="9" fill="#8fa6bd">FACILE</text><text x="206" y="100" text-anchor="end" font-family="Manrope" font-weight="800" font-size="9" fill="#8fa6bd">DIFFICILE</text></svg></div><p class="iq-note"></p>';
   const gauge=$('.gg',inst),needle=$('.nd',inst),note=$('.iq-note',inst);
   function set(p){needle.style.transformOrigin='110px 90px';needle.style.transform='rotate('+(-90+p*180).toFixed(1)+'deg)';note.textContent=p<.33?'Facile':p<.66?'Modérée : accessible à tous':'Difficile'}
   track(gauge,p=>{set(p)});set(.5);
  }
  // 5. l'obscurité : un interrupteur, et une clé qui brille dans le noir
  function lightInstrument(){
   inst.innerHTML='<div class="sw"><button type="button" aria-label="Allumer ou éteindre la lumière" aria-pressed="true"><i></i></button><span>Éclairage : allumé</span></div>';
   const toggle=$('.sw button',inst),label=$('.sw span',inst);
   inst.append(lightKey);lightKey.style.visibility='hidden';
   toggle.addEventListener('click',()=>{
    const off=!toggle.classList.contains('off');
    toggle.classList.toggle('off',off);toggle.setAttribute('aria-pressed',String(!off));box.classList.toggle('dark',off);
    label.textContent=off?'Éclairage : tamisé… et si on cherchait ?':'Éclairage : allumé';lightKey.style.visibility=off?'visible':'hidden';
    tone([off?220:330],90,.06);api.buzz(6);
   });
  }
  function mailInstrument(){
   inst.innerHTML='<div class="iq-lock"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:46px;height:46px;fill:none;stroke:#62e4f5;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round">'+icon.mail+'</svg></div>';
  }
  const instruments=[lockInstrument,ageInstrument,timelineInstrument,gaugeInstrument,lightInstrument,mailInstrument];
  function show(i){
   buttons.forEach((button,k)=>button.classList.toggle('on',k===i));
   box.classList.remove('dark');if(lightKey.parentNode)lightKey.remove();
   title.textContent=i<5?faqs[i].q:'Une autre question ?';
   ans.innerHTML=i<5?faqs[i].a:'<p>Écrivez-nous ou appelez-nous : on vous répond.</p><p><a href="#" data-room="m-contact" style="color:#9defff;font-weight:800">Aller à la page Contact ›</a></p>';
   instruments[i]();api.buzz(4);
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
  show(1);
 }

 // ---------- 5. contact : un téléphone à touches ----------
 function buildContact(body){
  const icon={
   pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
   phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
   mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
   ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
   fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
   li:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7h.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'
  };
  const svg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icon[name]+'</svg>';
  const social=socials.map(item=>{const key=/instagram/.test(item[1])?'ig':/facebook/.test(item[1])?'fb':'li';return'<a href="'+item[1]+'" target="_blank" rel="noopener" aria-label="'+item[0]+'">'+svg(key)+'</a>'}).join('');
  body.innerHTML='<div class="ci"><div class="ci-r">'+svg('pin')+'<span class="adr"></span></div><div class="ci-r">'+svg('phone')+'<b>'+TELTEXT+'</b></div><div class="ci-r">'+svg('mail')+'<a href="mailto:'+mail+'" style="color:#9defff"></a></div><div class="ci-s">'+social+'</div></div>'
   +'<div class="kp"><div class="kp-l"><div class="kp-d" aria-live="polite"></div><div class="kp-g"></div></div><div class="kp-r"><div class="kp-note">Énigme bonus : mot de passe du maître du jeu <b style="white-space:nowrap">6 9 0 #</b></div><div class="kp-slot" aria-label="Retour de monnaie"></div><a class="kp-call" href="'+TEL+'">Appeler</a><button type="button" class="kp-clr">Effacer</button></div></div>';
  $('.adr',body).innerHTML=addressHtml.replace(/<br\s*\/?>/g,', ').replace(/^Elucid Escape,\s*/,'');
  $('.ci a[href^="mailto"]',body).textContent=mail;
  const display=$('.kp-d',body),grid=$('.kp-g',body),call=$('.kp-call',body),slot=$('.kp-slot',body);
  const rows=[697,770,852,941],cols=[1209,1336,1477],layout=['1','2','3','4','5','6','7','8','9','*','0','#'];
  let typed='',unlocked=false;
  function paint(){
   if(typed){display.textContent=typed.slice(-9);display.style.opacity='1'}else{display.textContent=TELTEXT;display.style.opacity='.45'}
   const digits=typed.replace(/[^0-9]/g,'');
   call.href=TEL;
   if(digits.length>=3)if(!/690/.test(typed))call.href='tel:'+digits;
  }
  layout.forEach((key,i)=>{
   const button=document.createElement('button');button.type='button';button.textContent=key;button.setAttribute('aria-label','Touche '+key);
   button.addEventListener('pointerdown',()=>{button.classList.add('p');tone([rows[Math.floor(i/3)],cols[i%3]],140,.14);api.buzz(5)});
   const release=()=>button.classList.remove('p');
   button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('pointerleave',release);
   button.addEventListener('click',()=>{
    if(typed.length>=12)typed='';
    typed+=key;paint();
    if(/690#$/.test(typed))if(!unlocked){
     unlocked=true;jingle();api.buzz([14,30,20]);
     slot.innerHTML='';slot.append(makeKey(5));
     setTimeout(()=>{typed='';paint()},900);
    }
   });
   grid.append(button);
  });
  $('.kp-clr',body).addEventListener('click',()=>{typed='';paint();tone([260],80,.06)});
  paint();
 }

 const builders=[buildTarifs,buildGift,buildAvis,buildFaq,buildContact];
 builders.forEach((build,index)=>build(roomEls[index].querySelector('.d-body')));

 // ---------- hall : enseigne + sceau ----------
 const board=centerDoor?centerDoor.parentNode:null;
 let rot=0,sel=0,tweenToken=0;
 if(board){
  const ui=document.createElement('div');ui.className='d-ui';
  const ticks=Array.from({length:40},(item,i)=>{const a=i*9*Math.PI/180;return'<line class="tick" style="opacity:'+(i%2?.14:.4)+'" x1="'+(126+121*Math.cos(a)).toFixed(1)+'" y1="'+(126+121*Math.sin(a)).toFixed(1)+'" x2="'+(126+(i%2?124:128)*Math.cos(a)).toFixed(1)+'" y2="'+(126+(i%2?124:128)*Math.sin(a)).toFixed(1)+'"/>'}).join('');
  ui.innerHTML='<div class="d-sign" role="button" tabindex="0" aria-live="polite"><small>VOTRE DESTINATION</small><strong></strong><span></span></div>'
   +'<div class="d-dial" aria-label="Sceau : choisissez une pièce"><div class="d-ring"><svg viewBox="0 0 252 252" aria-hidden="true"><circle class="r1" cx="126" cy="126" r="100"/><circle class="r2" cx="126" cy="126" r="116"/><g class="rot">'+ticks+'</g></svg></div>'
   +defs.map((def,i)=>'<button type="button" class="d-node" data-i="'+i+'" aria-label="'+def.name+'"><i>'+svgIcon(def.icon)+'</i><span>'+def.name+'</span></button>').join('')
   +'<button type="button" class="d-go" aria-label="Entrer"><b>›</b>ENTRER</button></div>';
  board.append(ui);
  const dial=ui.querySelector('.d-dial'),nodes=$$('.d-node',ui),sign=ui.querySelector('.d-sign'),spin=ui.querySelector('.rot'),goButton=ui.querySelector('.d-go');
  const place=()=>{
   nodes.forEach((node,i)=>{const a=(-90+72*i+rot)*Math.PI/180;node.style.left=(126+100*Math.cos(a)-31).toFixed(1)+'px';node.style.top=(126+100*Math.sin(a)-33).toFixed(1)+'px'});
   spin.style.transform='rotate('+(rot*.5).toFixed(1)+'deg)';spin.style.transformOrigin='126px 126px';
  };
  const label=()=>{
   const k=Math.round(-rot/72),index=mod(k,N);
   if(index!==sel||!sign.dataset.ready){sel=index;sign.dataset.ready='1';sign.querySelector('strong').textContent=defs[index].name.toUpperCase();sign.querySelector('span').textContent=defs[index].sub;goButton.setAttribute('aria-label','Entrer : '+defs[index].name);nodes.forEach((node,i)=>node.classList.toggle('is-sel',i===index))}
  };
  const snapTo=k=>{
   const from=rot,to=-72*k,token=++tweenToken;
   if(calm()){rot=to;place();label();return}
   const start=performance.now();
   const tick=now=>{if(token!==tweenToken)return;const t=Math.min(1,(now-start)/380),e=easeOut(t);rot=from+(to-from)*e;place();label();if(t<1)requestAnimationFrame(tick)};
   requestAnimationFrame(tick);
  };
  const enterSel=()=>{api.buzz(12);show(sel)};
  let drag=null;
  dial.addEventListener('pointerdown',event=>{
   event.stopPropagation();
   if(event.target.closest('.d-go'))return;
   const box=dial.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;
   drag={id:event.pointerId,cx:cx,cy:cy,last:Math.atan2(event.clientY-cy,event.clientX-cx)*180/Math.PI,moved:0,node:event.target.closest('.d-node')};
   tweenToken++;try{dial.setPointerCapture(event.pointerId)}catch(error){}
  });
  dial.addEventListener('pointermove',event=>{
   if(!drag)return;if(event.pointerId!==drag.id)return;
   const a=Math.atan2(event.clientY-drag.cy,event.clientX-drag.cx)*180/Math.PI;let delta=a-drag.last;if(delta>180)delta-=360;if(delta<-180)delta+=360;drag.last=a;
   drag.moved+=Math.abs(delta);if(drag.moved>6){rot+=delta;place();const before=sel;label();if(sel!==before)api.buzz(6)}
  });
  const finish=event=>{
   if(!drag)return;if(event.pointerId!==drag.id)return;const item=drag;drag=null;try{dial.releasePointerCapture(event.pointerId)}catch(error){}
   if(item.moved>6){snapTo(Math.round(-rot/72));return}
   if(item.node){const i=Number(item.node.dataset.i),kf=-rot/72,k=i+N*Math.round((kf-i)/N);snapTo(k);api.buzz(8)}
  };
  dial.addEventListener('pointerup',finish);dial.addEventListener('pointercancel',finish);
  goButton.addEventListener('click',enterSel);
  sign.addEventListener('click',enterSel);
  sign.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();enterSel()}});
  nodes.forEach(node=>node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();const i=Number(node.dataset.i),kf=-rot/72,k=i+N*Math.round((kf-i)/N);snapTo(k)}}));
  // Toucher la porte elle-même entre dans la pièce annoncée sur l'enseigne.
  centerDoor.addEventListener('click',event=>{event.stopImmediatePropagation();event.preventDefault();enterSel()},true);
  place();label();
 }
 // Plaques au sol : tourner vers une porte, avec le nom écrit en toutes lettres.
 const floor=document.createElement('div');floor.className='d-floor';
 floor.innerHTML='<p>Touchez une porte, ou glissez vers elle</p><button type="button" class="a" data-look="-1"><i aria-hidden="true">‹</i>Les Rouages</button><button type="button" class="c" data-look="1"><i aria-hidden="true">›</i>CybertraX</button>';
 hall.append(floor);
 floor.addEventListener('click',event=>{const button=event.target.closest('[data-look]');if(button)api.setLook(Number(button.dataset.look))});

 // ---------- portes : une seule action ----------
 const doorMeta={
  rouages:{sign:'Les rouages<br>de l’apocalypse',door:'../assets/v12/door-rouages.webp',room:'../assets/v12/room-rouages.webp',cap:'Tournez l’engrenage',alt:'ou touchez-le : il tourne tout seul'},
  cybertrax:{sign:'CyberTraX',door:'../assets/v12/door-cybertrax.webp',room:'../assets/v12/room-cybertrax.webp',cap:'Faites monter l’énergie',alt:'ou touchez le bouton : il monte tout seul'}
 };
 const door=document.createElement('div');door.className='d-door';door.hidden=true;door.setAttribute('role','dialog');door.setAttribute('aria-modal','true');app.append(door);
 const gearSvg=(()=>{
  let teeth='';for(let i=0;i<16;i++){const a=i*22.5,r=Math.PI/180,p=(rad,off)=>(Math.cos((a+off)*r)*rad).toFixed(2)+','+(Math.sin((a+off)*r)*rad).toFixed(2);teeth+=(i?'L':'M')+p(37,-6)+'L'+p(46,-3.4)+'L'+p(46,3.4)+'L'+p(37,6)}
  let spokes='';for(let i=0;i<5;i++)spokes+='<rect x="-4" y="-33" width="8" height="33" rx="2" transform="rotate('+(i*72)+')"/>';
  return'<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c27a"/><stop offset=".55" stop-color="#b87c34"/><stop offset="1" stop-color="#7a4f1d"/></linearGradient></defs><g><path d="'+teeth+'Z" fill="url(#dg)" stroke="#3a2209" stroke-width="1.4"/><circle r="31" fill="none" stroke="#3a2209" stroke-width="5" opacity=".7"/><circle r="30" fill="none" stroke="#f6d9a1" stroke-width="2" opacity=".7"/><g fill="url(#dg)" stroke="#3a2209" stroke-width="1">'+spokes+'</g><circle r="11" fill="url(#dg)" stroke="#3a2209" stroke-width="1.4"/><circle r="4.5" fill="#2a1807"/><circle cx="0" cy="-27" r="2.6" fill="#fff" opacity=".9"/></g></svg>'
 })();
 const arrowSvg='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8A42 42 0 0 1 92 50"/><polyline points="84,38 93,52 78,56"/></svg>';
 const chevUp='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7M5 21l7-7 7 7" /></svg>';
 const strips=[[15.6,2.6,29.8,1.8,.7],[54.7,2.6,29.8,1.8,.7],[2.7,13.3,2.1,10.2,.4],[95.2,12.4,1.8,11.2,.4],[8.4,53.4,2.3,17.9,.15],[89.1,53.4,2.5,17.9,.15]];
 let doorToken=0;
 function openDoor(name,done,cancel){
  const meta=doorMeta[name],token=++doorToken;
  door.dataset.name=name;door.classList.remove('is-moved');
  door.innerHTML='<button class="d-door-back" type="button">‹ Retour au hall</button><div class="d-door-sign">'+meta.sign+'</div><div class="d-door-frame"><div class="d-door-view"><i class="d-room-img"></i><i class="d-leaf l"></i><i class="d-leaf r"></i><span class="d-seam"></span><div class="d-lights"></div></div></div><p class="d-cap">'+meta.cap+'<small>'+meta.alt+'</small></p>';
  const view=$('.d-door-view',door),leftLeaf=$('.d-leaf.l',door),rightLeaf=$('.d-leaf.r',door),seam=$('.d-seam',door),lights=$('.d-lights',door);
  $('.d-room-img',door).style.backgroundImage='url('+meta.room+')';leftLeaf.style.backgroundImage=rightLeaf.style.backgroundImage='url('+meta.door+')';
  door.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>door.classList.add('is-on')));
  let progress=0,finished=false,setProgress=()=>{};
  function openLeaves(){
   const start=performance.now(),duration=calm()?250:900;let called=false;
   const tick=now=>{
    const t=Math.min(1,(now-start)/duration),e=easeInOut(t);
    leftLeaf.style.transform='translate3d('+(-e*101)+'%,0,0)';rightLeaf.style.transform='translate3d('+(e*101)+'%,0,0)';seam.style.opacity=String(Math.min(1,t*3)*(1-Math.max(0,(t-.7)/.3)));
    if(!called)if(t>.62){called=true;done()}
    if(t<1){requestAnimationFrame(tick)}else{
     setTimeout(()=>{door.classList.remove('is-on');setTimeout(()=>{if(token===doorToken)door.hidden=true},400)},550);
    }
   };
   requestAnimationFrame(tick);
  }
  function complete(from,duration){
   if(finished)return;finished=true;api.buzz([16,40,28]);
   const start=performance.now(),span=calm()?120:(duration||320);
   const tick=now=>{const t=Math.min(1,(now-start)/span);setProgress(from+(1-from)*easeOut(t));if(t<1){requestAnimationFrame(tick)}else{setTimeout(openLeaves,calm()?0:160)}};
   requestAnimationFrame(tick);
  }
  function rewind(from){
   const start=performance.now();
   const tick=now=>{const t=Math.min(1,(now-start)/360);setProgress(from*(1-easeOut(t)));if(t<1)requestAnimationFrame(tick)};
   requestAnimationFrame(tick);
  }
  function drag(target,handlers){
   let active=null;
   target.addEventListener('pointerdown',event=>{if(finished)return;if(active!==null)return;active=event.pointerId;try{target.setPointerCapture(active)}catch(error){}handlers.down(event)});
   target.addEventListener('pointermove',event=>{if(event.pointerId!==active)return;handlers.move(event)});
   const end=event=>{if(event.pointerId!==active)return;const id=active;active=null;try{target.releasePointerCapture(id)}catch(error){}handlers.up(event)};
   target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
  }
  if(name==='rouages'){
   const gear=document.createElement('div');gear.className='d-gear';gear.setAttribute('role','button');gear.tabIndex=0;gear.setAttribute('aria-label','Tourner l’engrenage pour ouvrir la porte');gear.innerHTML=gearSvg;
   const pegs=document.createElement('div');pegs.className='d-pegs';pegs.innerHTML=Array.from({length:8},(item,i)=>{const a=(-90+i*45)*Math.PI/180;return'<i style="left:'+(50+46*Math.cos(a)).toFixed(1)+'%;top:'+(50+46*Math.sin(a)).toFixed(1)+'%"></i>'}).join('');
   const arrow=document.createElement('div');arrow.className='d-arrow';arrow.innerHTML=arrowSvg;
   lights.append(arrow,pegs,gear);lights.style.pointerEvents='auto';
   const dots=[...pegs.children],TURN=210;
   let turned=0,last=0,moved=0,mark=0;
   setProgress=value=>{progress=value;gear.firstChild.style.transform='rotate('+(value*TURN)+'deg)';const count=Math.floor(value*8.001);dots.forEach((dot,i)=>dot.classList.toggle('on',i<count));seam.style.opacity=String((value*.55).toFixed(2))};
   const angleOf=event=>{const box=gear.getBoundingClientRect();return Math.atan2(event.clientY-(box.top+box.height/2),event.clientX-(box.left+box.width/2))*180/Math.PI};
   drag(gear,{down(event){last=angleOf(event);moved=0;turned=progress*TURN;mark=Math.floor(turned/30)},
    move(event){const a=angleOf(event);let delta=a-last;if(delta>180)delta-=360;if(delta<-180)delta+=360;last=a;moved+=Math.abs(delta);turned=clamp(turned+delta,0,TURN);if(moved>5)door.classList.add('is-moved');const m=Math.floor(turned/30);if(m!==mark){mark=m;api.buzz(5)}setProgress(turned/TURN)},
    up(){if(moved<6){complete(progress,900);return}if(progress>=.6){complete(progress)}else{rewind(progress)}}});
   gear.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(progress,900)}});
   setTimeout(()=>{gear.focus({preventScroll:true})},500);
  }else{
   strips.forEach(item=>{const strip=document.createElement('i');strip.className='d-strip';strip.style.cssText='left:'+item[0]+'%;top:'+item[1]+'%;width:'+item[2]+'%;height:'+item[3]+'%';lights.append(strip)});
   const rail=document.createElement('div');rail.className='d-rail';const beam=document.createElement('div');beam.className='d-beam';
   const knob=document.createElement('button');knob.type='button';knob.className='d-knob';knob.setAttribute('aria-label','Faire monter l’énergie pour ouvrir la porte');knob.innerHTML=chevUp;
   lights.append(rail,beam,knob);lights.style.pointerEvents='auto';
   const bars=[...lights.querySelectorAll('.d-strip')];
   let y0=0,p0=0,moved=0,mark=0;
   setProgress=value=>{progress=value;knob.style.top=(80-value*66)+'%';beam.style.height=(value*66)+'%';bars.forEach((bar,i)=>{bar.style.opacity=String(clamp((value-strips[i][4])/.14,0,1).toFixed(2))});seam.style.opacity=String((value*.35).toFixed(2))};
   drag(knob,{down(event){y0=event.clientY;p0=progress;moved=0},
    move(event){const box=view.getBoundingClientRect(),dy=(y0-event.clientY)/(box.height*.66);moved=Math.max(moved,Math.abs(y0-event.clientY));if(moved>5)door.classList.add('is-moved');const next=clamp(p0+dy,0,1),m=Math.floor(next*8);if(m!==mark){mark=m;api.buzz(5)}setProgress(next)},
    up(){if(moved<6){complete(progress,900);return}if(progress>=.6){complete(progress)}else{rewind(progress)}}});
   knob.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(progress,900)}});
   setTimeout(()=>{knob.focus({preventScroll:true})},500);
  }
  setProgress(0);
  $('.d-door-back',door).addEventListener('click',()=>{
   if(finished)return;finished=true;door.classList.remove('is-on');setTimeout(()=>{if(token===doorToken)door.hidden=true},380);cancel();
  });
 }
 api.doorGate=openDoor;
 // Réserver reste toujours visible : l'en-tête du site passe devant la porte et les pièces.
 document.addEventListener('keydown',event=>{if(event.key==='Escape')if(!door.hidden)if(door.classList.contains('is-on')){const back=$('.d-door-back',door);if(back)back.click()}});
 root.classList.add('d-ready');
})();
