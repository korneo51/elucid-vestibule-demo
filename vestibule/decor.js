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
  {id:'m-tarifs',icon:'tarifs',name:'Tarifs',plate:'LE TABLEAU DES DÉPARTS',sub:'Composez votre équipe'},
  {id:'m-gift',icon:'cadeaux',name:'Cadeaux',plate:'LA CARTE À GRATTER',sub:'Offrir une aventure'},
  {id:'m-avis',icon:'avis',name:'Avis',plate:'LE DOSSIER DES AVIS',sub:'Ils ont joué le jeu'},
  {id:'m-faq',icon:'questions',name:'Questions',plate:'LE FICHIER DES QUESTIONS',sub:'Avant de venir'},
  {id:'m-contact',icon:'contact',name:'Contact',plate:'LA LIGNE DIRECTE',sub:'Nous joindre, nous trouver'}
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

 // ---------- 1. tarifs : tableau des départs ----------
 function buildTarifs(body){
  const person='<svg viewBox="0 0 40 56" aria-hidden="true"><circle cx="20" cy="15" r="9"/><path d="M3 54c0-17 7-25 17-25s17 8 17 25z"/></svg>';
  body.innerHTML='<div class="d-board" aria-live="polite"><div class="d-row"><p class="d-lab">VOTRE ÉQUIPE</p><div class="d-flaps" data-row="0"></div></div><div class="d-row"><p class="d-lab" data-lab="1">PAR PERSONNE</p><div class="d-flaps" data-row="1"></div></div><div class="d-row"><p class="d-lab" data-lab="2">LA SESSION</p><div class="d-flaps" data-row="2"></div></div></div>'
   +'<div class="d-crew" role="group" aria-label="Nombre de joueurs">'+[2,3,4,5,6].map(n=>'<button type="button" class="d-p" data-n="'+n+'" aria-label="'+n+' joueurs">'+person+'<span>'+n+'</span></button>').join('')+'</div>'
   +'<p class="d-note"></p><a class="d-ticket" href="'+BOOK+'" target="_blank" rel="noopener"><span>Choisir mon créneau <span aria-hidden="true">↗</span></span><small></small></a>';
  const rows=[0,1,2].map(i=>$('[data-row="'+i+'"]',body)),labs=[1,2].map(i=>$('[data-lab="'+i+'"]',body)),note=$('.d-note',body),ticket=$('.d-ticket small',body),people=$$('.d-p',body);
  const shown=['','',''];let count=0;
  function fmt(v){return(Math.round(v*10)/10).toString().replace('.',',')+' €'}
  function setRow(index,value,animate){
   const row=rows[index],chars=[...value],old=[...shown[index]];
   if(row.children.length!==chars.length){row.innerHTML=chars.map(c=>c===' '?'<span class="d-fl sp"></span>':'<span class="d-fl"><b>'+c+'</b></span>').join('');old.length=0}
   chars.forEach((c,i)=>{
    const flap=row.children[i];if(c===' ')return;
    if(old[i]===c)return;
    if(animate)if(!calm()){flap.classList.remove('go');void flap.offsetWidth;flap.classList.add('go');setTimeout(()=>{flap.firstChild.textContent=c},120+i*18);return}
    flap.firstChild.textContent=c;
   });
   shown[index]=value;
  }
  function render(n,animate){
   const price=prices[n];if(!price)return;count=n;
   people.forEach(button=>{const on=Number(button.dataset.n)<=n;button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(Number(button.dataset.n)===n))});
   setRow(0,n+' JOUEURS',animate);
   if(price.session){labs[0].textContent='LA SESSION';labs[1].textContent='SOIT PAR PERSONNE';setRow(1,fmt(price.total),animate);setRow(2,fmt(price.per),animate)}
   else{labs[0].textContent='PAR PERSONNE';labs[1].textContent='LA SESSION';setRow(1,fmt(price.per),animate);setRow(2,fmt(price.total),animate)}
   ticket.textContent=fmt(price.total)+' la session · '+n+' joueurs';
   note.innerHTML=n===2?'Tenter l’aventure à 2 demande un minimum d’expérience.':n===6?'Nous vous déconseillons les équipes de 6, car la cohésion devient difficile.':'Plus de 6 ? <a href="#" data-room="m-contact">Contactez-nous</a>.';
   api.buzz(6);
  }
  people.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.n),true)));
  render(4,false);
 }

 // ---------- 2. cadeaux : carte à gratter ----------
 function buildGift(body){
  body.innerHTML='<p class="d-hint">Grattez la carte du doigt, ou touchez-la</p><div class="d-card"><p class="d-card-top"><small>CARTE CADEAU</small><em>Elucid Escape</em></p><div class="d-reveal"><span>Une aventure<br>à offrir.</span><svg viewBox="0 0 44 30" aria-hidden="true"><rect x="2" y="3" width="40" height="24" rx="4"/><path d="M15 3v24" stroke-dasharray="2 4"/></svg><canvas class="d-foil" aria-label="Zone à gratter"></canvas></div><p class="d-card-foot">2–6 JOUEURS · 90 MINUTES</p></div>'
   +'<a class="d-orb" href="'+GIFT+'" target="_blank" rel="noopener" aria-label="Offrir une carte cadeau">↗</a><span class="d-orb-lab">OFFRIR UNE CARTE CADEAU</span>';
  const canvas=$('.d-foil',body),hint=$('.d-hint',body),ctx=canvas.getContext('2d');
  let w=0,h=0,drawing=null,done=false,moved=0;
  function paint(){
   const box=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
   if(box.width<4)return;
   w=Math.round(box.width*dpr);h=Math.round(box.height*dpr);canvas.width=w;canvas.height=h;
   const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#26374f');g.addColorStop(.35,'#5d7594');g.addColorStop(.55,'#2c4059');g.addColorStop(1,'#6b84a3');
   ctx.globalCompositeOperation='source-over';ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#ffffff14';ctx.lineWidth=2*dpr;for(let x=-h;x<w;x+=18*dpr){ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+h,0);ctx.stroke()}
   ctx.fillStyle='#d7e6f5';ctx.font='800 '+Math.round(13*dpr)+'px Manrope,sans-serif';ctx.textAlign='center';ctx.fillText('GRATTEZ ICI',w/2,h/2+4*dpr);
   done=false;canvas.classList.remove('gone');hint.textContent='Grattez la carte du doigt, ou touchez-la';
  }
  function reveal(){if(done)return;done=true;canvas.classList.add('gone');hint.textContent='Une aventure à offrir. Touchez le sceau pour l’offrir.';api.buzz([14,30,20])}
  function cleared(){
   const data=ctx.getImageData(0,0,w,h).data;let clear=0,total=0;
   for(let y=0;y<h;y+=10)for(let x=0;x<w;x+=10){total+=1;if(data[(y*w+x)*4+3]<40)clear+=1}
   return clear/Math.max(1,total);
  }
  function point(event){const box=canvas.getBoundingClientRect(),k=w/box.width;return[(event.clientX-box.left)*k,(event.clientY-box.top)*k]}
  canvas.addEventListener('pointerdown',event=>{
   if(done)return;drawing=point(event);moved=0;try{canvas.setPointerCapture(event.pointerId)}catch(error){}
  });
  canvas.addEventListener('pointermove',event=>{
   if(!drawing)return;const at=point(event);moved+=Math.hypot(at[0]-drawing[0],at[1]-drawing[1]);
   ctx.globalCompositeOperation='destination-out';ctx.strokeStyle='#000';ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.round(w/5);ctx.beginPath();ctx.moveTo(drawing[0],drawing[1]);ctx.lineTo(at[0],at[1]);ctx.stroke();drawing=at;
  });
  const up=()=>{if(!drawing)return;drawing=null;if(moved<14){reveal();return}if(cleared()>.42)reveal()};
  canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')reveal()});
  canvas.tabIndex=0;
  enterHooks[1]=()=>{requestAnimationFrame(()=>requestAnimationFrame(paint))};
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
    if(!review){page.innerHTML='';return}
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

 // ---------- 4. questions : casiers ----------
 function buildFaq(body){
  const cab=document.createElement('div');cab.className='d-cab';
  faqs.forEach(item=>{
   const drawer=document.createElement('div');drawer.className='d-dr';
   drawer.innerHTML='<button class="d-face" type="button" aria-expanded="false"><span></span><i aria-hidden="true">+</i></button><div class="d-ans" role="region"><div></div></div>';
   drawer.querySelector('span').textContent=item.q;drawer.querySelector('.d-ans>div').innerHTML=item.a;
   cab.append(drawer);
  });
  body.append(cab);
  function setOpen(drawer,open){
   const panel=drawer.querySelector('.d-ans');drawer.classList.toggle('open',open);drawer.querySelector('.d-face').setAttribute('aria-expanded',String(open));
   panel.style.height=open?panel.firstChild.scrollHeight+'px':'0px';
  }
  cab.addEventListener('click',event=>{
   const face=event.target.closest('.d-face');if(!face)return;
   const drawer=face.parentNode,open=!drawer.classList.contains('open');
   $$('.d-dr.open',cab).forEach(other=>{if(other!==drawer)setOpen(other,false)});
   setOpen(drawer,open);api.buzz(open?10:5);
   if(open)setTimeout(()=>drawer.scrollIntoView({block:'nearest',behavior:calm()?'auto':'smooth'}),60);
  });
 }

 // ---------- 5. contact : interphone ----------
 function buildContact(body){
  const digits='0326673801',spaced=[2,4,6,8];
  const nodes=[1,2,3,4,5,6,7,8,9,0].map((digit,k)=>{const a=(-60+k*30)*Math.PI/180;return'<g><circle cx="'+(110+78*Math.cos(a)).toFixed(1)+'" cy="'+(110+78*Math.sin(a)).toFixed(1)+'" r="17" fill="#0b1a2c" stroke="#62e4f588" stroke-width="1.5"/><text x="'+(110+78*Math.cos(a)).toFixed(1)+'" y="'+(110+78*Math.sin(a)+6).toFixed(1)+'" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="17" fill="#e9eef3">'+digit+'</text></g>'}).join('');
  body.innerHTML='<div class="d-digits" aria-label="'+TELTEXT+'">'+[...digits].map((d,i)=>'<b>'+d+'</b>'+(spaced.indexOf(i+1)>=0?'<b class="sp"></b>':'')).join('')+'</div>'
   +'<div class="d-phone" role="img" aria-label="Cadran : tournez-le pour composer le numéro"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="108" fill="#07121f" stroke="#f2a33caa" stroke-width="2"/><g class="ringg"><circle cx="110" cy="110" r="100" fill="none" stroke="#62e4f544" stroke-width="1" stroke-dasharray="2 7"/>'+nodes+'</g><circle cx="110" cy="110" r="38" fill="#0b1a2c" stroke="#f2a33c" stroke-width="2"/><path d="M96 98h8l3 8-4 3a14 14 0 0 0 8 8l3-4 8 3v8a3 3 0 0 1-3 3 26 26 0 0 1-23-25 3 3 0 0 1 3-3z" fill="none" stroke="#ffcf8a" stroke-width="2" stroke-linejoin="round" transform="translate(4 2)"/><path d="M196 150l12 8-8 12" fill="none" stroke="#ffcf8a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
   +'<p class="d-pstat">Tournez le cadran, ou appelez directement</p><a class="d-ticket" href="'+TEL+'">Appeler <small>'+TELTEXT+'</small></a>'
   +'<div class="d-info"><div><small>NOUS TROUVER</small><span class="adr"></span></div><div><small>ÉCRIRE</small><a href="mailto:'+mail+'"></a></div><div><small>SUIVRE L’AVENTURE</small><div class="d-soc"></div></div></div>'
   ;
  $('.adr',body).innerHTML=addressHtml;$('.d-info a',body).textContent=mail;
  const soc=$('.d-soc',body);socials.forEach(item=>{const link=document.createElement('a');link.href=item[1];link.target='_blank';link.rel='noopener';link.textContent=item[0];soc.append(link)});
  const phone=$('.d-phone',body),ring=$('.ringg',body),lit=$$('.d-digits b:not(.sp)',body),stat=$('.d-pstat',body);
  let dialed=0,angle=0,last=0,moved=0,active=false,busy=false;
  function centre(){const box=phone.getBoundingClientRect();return[box.left+box.width/2,box.top+box.height/2]}
  function pointer(event){const c=centre();return Math.atan2(event.clientY-c[1],event.clientX-c[0])*180/Math.PI}
  function setAngle(value){angle=value;ring.style.transform='rotate('+value.toFixed(1)+'deg)'}
  function advance(){
   if(dialed>=digits.length)return;dialed+=1;lit.forEach((b,i)=>b.classList.toggle('on',i<dialed));api.buzz(10);
   if(dialed>=digits.length){stat.textContent='Appel en cours…';setTimeout(()=>{location.href=TEL},350);setTimeout(()=>{dialed=0;lit.forEach(b=>b.classList.remove('on'));stat.textContent='Tournez le cadran, ou appelez directement'},4200)}
   else stat.textContent='Composé : '+digits.slice(0,dialed).replace(/(\d\d)(?=\d)/g,'$1 ')+'…';
  }
  function release(step){
   ring.classList.remove('drag');
   if(step){ring.style.transition='transform .55s ease';setAngle(0);setTimeout(()=>{ring.style.transition='';busy=false},560);advance()}
   else{setAngle(0);setTimeout(()=>{busy=false},520)}
  }
  phone.addEventListener('pointerdown',event=>{if(busy)return;active=true;moved=0;last=pointer(event);setAngle(0);ring.classList.add('drag');try{phone.setPointerCapture(event.pointerId)}catch(error){}});
  phone.addEventListener('pointermove',event=>{
   if(!active)return;const a=pointer(event);let delta=a-last;if(delta>180)delta-=360;if(delta<-180)delta+=360;last=a;
   moved+=Math.abs(delta);setAngle(clamp(angle+delta,0,150));
  });
  const end=event=>{
   if(!active)return;active=false;busy=true;
   if(moved<8){setAngle(150);requestAnimationFrame(()=>release(true));ring.classList.remove('drag');return}
   release(angle>=55);
  };
  phone.addEventListener('pointerup',end);phone.addEventListener('pointercancel',end);
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
   if(!drag)return;if(event.pointerId!==drag.id)return;const item=drag;drag=null;
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
