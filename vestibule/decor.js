/* Vestibule mobile, style d : le décor est l'interface.
   Hall : un sceau à tourner (ou toucher) choisit la pièce, l'enseigne dit toujours où l'on va avant d'entrer.
   Portes : une seule action sur la porte elle-même (tourner l'engrenage, faire monter l'énergie) l'ouvre, sans deux pouces.
   Pièces : une machine par pièce, qui est aussi son contenu. Un simple toucher joue toujours le geste.
   Ecrit sans le double esperluette, que WordPress réécrit dans les blocs HTML. */
(() => {
 'use strict';
 const api=window.eeMobile;
 if(!api)return;
 const MODE=api.variant;if(MODE!=='d')if(MODE!=='e')return;
 const SCROLL=MODE==='e';
 const app=api.app,root=api.root,hall=api.hall,centerDoor=api.centerDoor;
 const BOOK='https://elucidescape.fr/booking/',GIFT='https://elucidescape.fr/cartecadeau/',TEL='tel:+33326673801',TELTEXT='03 26 67 38 01';
 const $=(selector,scope)=>(scope||app).querySelector(selector);
 const $$=(selector,scope)=>[...(scope||app).querySelectorAll(selector)];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const mod=(n,m)=>((n%m)+m)%m;
 const easeOut=api.easeOut,easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const calm=()=>api.isCalm();
 const text=node=>node?node.textContent.replace(/\s+/g,' ').trim():'';
 root.classList.add(SCROLL?'e-on':'d-on');root.dataset.jv=MODE;

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
 const layer=document.createElement('div');layer.className='d-rooms';layer.setAttribute('aria-hidden','true');if(!SCROLL)app.append(layer);
 // ---------- un décor par pièce (dessiné, dans l'attente de vraies illustrations) ----------
 function seeded(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
 const sceneOpen='<svg viewBox="0 0 393 780" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true"><defs><filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>';
 const scenes=[
  // 0 · Tarifs : la salle noire, tubes UV au plafond, symboles à demi effacés
  ()=>{
   let s=sceneOpen+'<defs><radialGradient id="uvg" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#8d2bff" stop-opacity=".34"/><stop offset="1" stop-color="#8d2bff" stop-opacity="0"/></radialGradient><linearGradient id="uvb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090e1c"/><stop offset="1" stop-color="#160a2b"/></linearGradient></defs><rect width="393" height="780" fill="url(#uvb)"/>';
   [62,196,330].forEach(x=>{s+='<path d="M'+(x-26)+' 74L'+(x+26)+' 74L'+(x+120)+' 470L'+(x-120)+' 470Z" fill="url(#uvg)"/><rect x="'+(x-36)+'" y="64" width="72" height="9" rx="4.5" fill="#b84bff" opacity=".8" filter="url(#sb)"/><rect x="'+(x-36)+'" y="64" width="72" height="9" rx="4.5" fill="#e6c4ff"/><path d="M'+(x-20)+' 0V64M'+(x+20)+' 0V64" stroke="#2a2147" stroke-width="2"/>'});
   s+='<g stroke="#8d2bff" stroke-opacity=".2" stroke-width="1.2">';
   for(let i=-8;i<=8;i++)s+='<path d="M196 560L'+(196+i*80)+' 780"/>';
   [590,625,670,735].forEach(y=>{s+='<path d="M0 '+y+'H393"/>'});
   s+='</g><g fill="none" stroke="#b84bff" stroke-opacity=".26" stroke-width="2"><circle cx="330" cy="560" r="22"/><path d="M330 538V582M308 560H352"/><path d="M40 600l30-18 4 18"/><path d="M52 520q14-26 30 0t30 0"/></g><text x="318" y="170" font-family="Courier New" font-weight="700" font-size="26" fill="#b84bff" fill-opacity=".18">?</text><text x="22" y="470" font-family="Courier New" font-weight="700" font-size="20" fill="#b84bff" fill-opacity=".16">∞ ✶ ∴</text>';
   return s+'</svg>';
  },
  // 1 · Cadeaux : la salle du coffre, grande porte ronde derrière la carte
  ()=>{
   let s=sceneOpen+'<defs><radialGradient id="vg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#e8832a" stop-opacity=".30"/><stop offset="1" stop-color="#e8832a" stop-opacity="0"/></radialGradient></defs><rect width="393" height="780" fill="#080e1a"/><rect width="393" height="780" fill="url(#vg)"/>';
   s+='<g transform="translate(196 330)"><circle r="196" fill="#0d1a2d" stroke="#1d3a5a" stroke-width="10"/><circle r="168" fill="none" stroke="#2a4a70" stroke-width="3"/>';
   for(let i=0;i<20;i++){const a=i*18*Math.PI/180;s+='<circle cx="'+(Math.cos(a)*182).toFixed(1)+'" cy="'+(Math.sin(a)*182).toFixed(1)+'" r="6" fill="#16304f" stroke="#2f5478"/>'}
   s+='<circle r="120" fill="#0b1626" stroke="#e8832a" stroke-opacity=".5" stroke-width="3"/>';
   for(let i=0;i<6;i++){s+='<path d="M0 0L'+(Math.cos(i*Math.PI/3)*112).toFixed(1)+' '+(Math.sin(i*Math.PI/3)*112).toFixed(1)+'" stroke="#e8832a" stroke-opacity=".4" stroke-width="9" stroke-linecap="round"/>'}
   s+='<circle r="30" fill="#14284a" stroke="#e8832a" stroke-opacity=".7" stroke-width="3"/></g>';
   s+='<g fill="none" stroke="#3b6a8c" stroke-opacity=".55" stroke-width="3" stroke-dasharray="9 5"><path d="M-10 90Q120 250 180 140"/><path d="M403 80Q270 240 215 140"/><path d="M-10 650Q130 520 200 600"/><path d="M403 640Q260 510 190 590"/></g>';
   s+='<g stroke="#e8832a" stroke-opacity=".12" stroke-width="1.2"><path d="M0 700H393M0 740H393"/></g>';
   return s+'</svg>';
  },
  // 2 · Avis : la bibliothèque aux témoignages
  ()=>{
   const rnd=seeded(7);let s=sceneOpen+'<defs><radialGradient id="lm" cx=".5" cy=".1" r=".9"><stop offset="0" stop-color="#ffb95e" stop-opacity=".28"/><stop offset="1" stop-color="#ffb95e" stop-opacity="0"/></radialGradient></defs><rect width="393" height="780" fill="#0a1220"/><rect width="393" height="780" fill="url(#lm)"/>';
   const cols=['#14284a','#1d3b66','#2a2547','#4a2f12','#15363a','#3a2314'];
   [[0,92],[301,92]].forEach(([x0,w])=>{
    for(let row=0;row<6;row++){
     const y=150+row*100;let x=x0+4;
     while(x<x0+w-8){const bw=6+rnd()*9,bh=58+rnd()*34;s+='<rect x="'+x.toFixed(1)+'" y="'+(y+92-bh).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" fill="'+cols[Math.floor(rnd()*cols.length)]+'" stroke="#050a12" stroke-width="1"/>';x+=bw+1}
     s+='<rect x="'+x0+'" y="'+(y+92)+'" width="'+w+'" height="7" fill="#2a1d10"/>';
    }
   });
   s+='<path d="M120 0V60M273 0V60" stroke="#2a2147" stroke-width="2"/><g transform="translate(196 92)"><path d="M-50 -12L50 -12L34 26L-34 26Z" fill="#1a1206" stroke="#e8832a" stroke-opacity=".7" stroke-width="2"/><ellipse cy="26" rx="40" ry="7" fill="#ffb95e" opacity=".5" filter="url(#sb)"/></g>';
   s+='<g fill="#ffcf8a" fill-opacity=".35"><circle cx="150" cy="300" r="1.6"/><circle cx="250" cy="380" r="1.4"/><circle cx="210" cy="520" r="1.8"/><circle cx="170" cy="640" r="1.3"/></g>';
   return s+'</svg>';
  },
  // 3 · Questions : la salle de contrôle, écrans, cadrans et voyants
  ()=>{
   const rnd=seeded(11);let s=sceneOpen+'<rect width="393" height="780" fill="#07111d"/>';
   for(let r=0;r<2;r++)for(let c=0;c<3;c++){
    const x=12+c*126,y=66+r*96;s+='<rect x="'+x+'" y="'+y+'" width="116" height="84" rx="6" fill="#06101b" stroke="#2f5478" stroke-width="2"/><path d="M'+(x+8)+' '+(y+60)+' ';
    for(let i=1;i<=10;i++)s+='L'+(x+8+i*10)+' '+(y+42+Math.sin(i*1.3+r+c)*16).toFixed(1)+' ';
    s+='" fill="none" stroke="'+(c===1?'#e8832a':'#62e4f5')+'" stroke-opacity=".5" stroke-width="2"/>';
   }
   s+='<g>';
   for(let i=0;i<5;i++){const x=34+i*82,y=620;s+='<circle cx="'+x+'" cy="'+y+'" r="26" fill="#0a1626" stroke="#2f5478" stroke-width="3"/><path d="M'+x+' '+y+'L'+(x+Math.cos(rnd()*5)*18).toFixed(1)+' '+(y+Math.sin(rnd()*5)*18).toFixed(1)+'" stroke="#ffcf8a" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>'}
   s+='</g><g>';
   for(let i=0;i<14;i++){const x=24+i*26,on=rnd()>.55;s+='<circle cx="'+x+'" cy="700" r="4" fill="'+(on?(rnd()>.5?'#e8832a':'#62e4f5'):'#16304f')+'" '+(on?'filter="url(#sb)"':'')+'/><circle cx="'+x+'" cy="700" r="3" fill="'+(on?(rnd()>.5?'#ffb95e':'#9defff'):'#1d3a5a')+'"/>'}
   s+='</g><g fill="none" stroke="#2f5478" stroke-opacity=".6" stroke-width="3"><path d="M20 270Q60 330 40 400T70 520"/><path d="M372 280Q330 350 350 420T320 540"/></g>';
   return s+'</svg>';
  },
  // 4 · Contact : le standard téléphonique, prises et cordons
  ()=>{
   const rnd=seeded(5);let s=sceneOpen+'<rect width="393" height="780" fill="#08111e"/><rect x="14" y="60" width="365" height="250" rx="10" fill="#0a1626" stroke="#2f5478" stroke-width="2"/>';
   for(let r=0;r<5;r++)for(let c=0;c<12;c++){const x=34+c*28.5,y=84+r*44;s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#050c16" stroke="#3b6a8c" stroke-width="1.6"/><circle cx="'+x+'" cy="'+(y+16)+'" r="2.4" fill="'+(rnd()>.7?'#e8832a':'#1d3a5a')+'"/>'}
   s+='<g fill="none" stroke-width="3.5" stroke-linecap="round"><path d="M62 84Q100 160 148 128" stroke="#e8832a" stroke-opacity=".6"/><path d="M233 172Q262 250 320 216" stroke="#62e4f5" stroke-opacity=".6"/><path d="M90 216Q160 290 206 214" stroke="#ffcf8a" stroke-opacity=".5"/><path d="M290 84Q330 140 346 100" stroke="#62e4f5" stroke-opacity=".45"/></g>';
   s+='<g transform="translate(196 640)"><path d="M-140 0C-140 -70 -100 -92 -60 -92H60C100 -92 140 -70 140 0" fill="none" stroke="#2f5478" stroke-width="10" stroke-linecap="round"/><rect x="-156" y="-26" width="34" height="56" rx="14" fill="#14284a" stroke="#62e4f5" stroke-opacity=".6" stroke-width="2"/><rect x="122" y="-26" width="34" height="56" rx="14" fill="#14284a" stroke="#62e4f5" stroke-opacity=".6" stroke-width="2"/></g>';
   s+='<circle cx="60" cy="740" r="4" fill="#e8832a" filter="url(#sb)"/><circle cx="60" cy="740" r="3" fill="#ffb95e"/>';
   return s+'</svg>';
  }
 ];
 const roomEls=[];let current=-1;const enterHooks={};
 if(!SCROLL)defs.forEach((def,index)=>{
  const prev=index===0?{name:'Hall',id:'m-hall'}:defs[index-1],last=index===N-1;
  const el=document.createElement('section');el.className='d-room';el.setAttribute('aria-label',def.name);el.inert=true;
  el.innerHTML='<div class="d-scene" aria-hidden="true">'+scenes[index]()+'</div><div class="d-top"><button class="d-hall" type="button" data-room="m-hall" aria-label="Retour au hall">⌂ Hall</button><div class="d-title" tabindex="-1"><small>0'+(index+1)+' / 0'+N+'</small><b>'+def.plate+'</b></div></div><div class="d-body"></div>'
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
 if(!SCROLL)api.setGoHook((id,instant)=>route(id));
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const modal=$('.d-modal:not([hidden]),.d-egg:not([hidden])');if(modal){modal.hidden=true;return}
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
  const where={1:'Tarifs',2:'Cadeaux',3:'Avis',4:'Questions',5:'Contact'};const missing=[1,2,3,4,5].filter(id=>found.indexOf(id)<0).map(id=>where[id]);api.say(left>0?'Il reste '+left+' clé'+(left>1?'s':'')+' : '+missing.join(' · ')+'.':'Vous avez les 5 clés !',{ms:7500});
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

  // ---------- petites fenêtres des secrets (easter eggs) ----------
 const eggEl=document.createElement('div');eggEl.className='d-egg';eggEl.hidden=true;eggEl.setAttribute('role','dialog');eggEl.setAttribute('aria-modal','true');
 eggEl.innerHTML='<div class="d-egg-card"><i class="d-egg-ic" aria-hidden="true"></i><h4></h4><p></p><small></small><div class="d-egg-btns"></div></div>';
 (SCROLL?document.body:layer).append(eggEl);
 function egg(icon,title,text,small,actions){
  eggEl.querySelector('.d-egg-ic').textContent=icon;eggEl.querySelector('h4').textContent=title;eggEl.querySelector('p').textContent=text;eggEl.querySelector('small').textContent=small||'';
  const buttons=eggEl.querySelector('.d-egg-btns');buttons.innerHTML='';
  (actions||[]).forEach(action=>{const link=document.createElement('a');link.className='d-egg-go';link.href=action.href;link.textContent=action.label;buttons.append(link)});
  const close=document.createElement('button');close.type='button';close.className='d-egg-x';close.textContent='Fermer';close.addEventListener('click',()=>{eggEl.hidden=true});buttons.append(close);
  eggEl.hidden=false;api.buzz([10,30,10]);close.focus({preventScroll:true});
 }
 eggEl.addEventListener('click',event=>{if(event.target===eggEl)eggEl.hidden=true});

 // ---------- 1. tarifs : le tableau d'abord, puis une lampe UV à attraper et à promener partout ----------
 function buildTarifs(body){
  const person='<svg viewBox="0 0 40 56" aria-hidden="true"><circle cx="20" cy="15" r="9"/><path d="M3 54c0-17 7-25 17-25s17 8 17 25z"/></svg>';
  const rows=[2,3,4,5,6].map(n=>{
   const price=prices[n];if(!price)return'';
   return'<div class="tb-r"><span class="who">'+person.repeat(n)+'</span><span>'+n+' joueurs'+(n===2?'*':'')+'</span><em>'+fmt(price.per)+'<small> /pers.</small></em><em class="t">'+fmt(price.total)+'</em></div>';
  }).join('');
  body.innerHTML='<div class="tb"><div class="tb-h"><span>ÉQUIPE</span><span></span><span>PAR PERS.</span><span>SESSION</span></div>'+rows+'</div>'
   +'<a class="d-ticket" href="'+BOOK+'" target="_blank" rel="noopener"><span>Choisir mon créneau ↗</span><small>Le nombre de joueurs se choisit à la réservation</small></a>'
   +'<p class="d-note">* À 2 : un minimum d’expérience · À 6 : la cohésion devient difficile · Plus de 6 : <a href="#" data-room="m-contact">contactez-nous</a></p>';
  const room=body.closest('.d-room,.e-sec');
  // Le calque ne bloque rien : seule la lampe se saisit, le reste de la page défile normalement.
  // La lampe est vue de profil, posée en haut à gauche de la section, et éclaire vers le haut à gauche.
  const ANGLE=35*Math.PI/180,AIM=[-Math.cos(ANGLE),-Math.sin(ANGLE)],SPOTS=[[80,36],[118,48],[152,58]];
  const layer=document.createElement('div');layer.className='uv2';
  const spots=[[50,86],[78,70],[22,80],[14,56]];
  const spot=spots[Math.floor(Math.random()*spots.length)];
  layer.innerHTML='<div class="uv2-hid"><span style="right:5%;top:98px;transform:rotate(2deg)">LA LUMIÈRE NOIRE RÉVÈLE L’INVISIBLE</span>'
   +'<span style="left:6%;top:3%;transform:rotate(-3deg)">1H30 POUR S’ÉCHAPPER</span>'
   +'<span style="right:5%;bottom:13%;transform:rotate(2deg)">DÈS 8 ANS · 2 À 6 JOUEURS</span>'
   +'<span style="left:5%;bottom:7%;transform:rotate(-2deg)">CODE DU MAÎTRE DU JEU : 6 9 0 #</span></div>'
   +'<i class="uv2-halo"></i>'
   +'<div class="uv2-lamp" role="button" tabindex="0" aria-label="Lampe UV : attrapez-la et déplacez-la (ou utilisez les flèches du clavier)"><svg viewBox="-200 -60 256 120" aria-hidden="true"><defs>'
   +'<linearGradient id="uvbeam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#d9a8ff" stop-opacity=".55"/><stop offset=".55" stop-color="#8d2bff" stop-opacity=".22"/><stop offset="1" stop-color="#8d2bff" stop-opacity="0"/></linearGradient>'
   +'<linearGradient id="uvbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b4470"/><stop offset=".5" stop-color="#2a2548"/><stop offset="1" stop-color="#171430"/></linearGradient></defs>'
   +'<path class="uv2-cone" d="M-34 -13L-150 -50L-150 50L-34 13Z" fill="url(#uvbeam)"/><g class="uv2-body">'
   +'<path d="M-18 -9H46a6 6 0 0 1 6 6V3a6 6 0 0 1-6 6H-18z" fill="url(#uvbody)" stroke="#9a7ae0" stroke-width="1.6"/>'
   +'<path d="M-18 -9L-32 -15V15L-18 9z" fill="#201b3f" stroke="#9a7ae0" stroke-width="1.6" stroke-linejoin="round"/>'
   +'<ellipse class="uv2-lens" cx="-32" cy="0" rx="4.4" ry="15" fill="#f1d9ff" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>'
   +'<path d="M8 -9V-14H20V-9" fill="#b84bff" stroke="#e4c4ff" stroke-width="1.2" stroke-linejoin="round"/>'
   +'<path d="M26 -8V8M32 -8V8M38 -8V8" stroke="#9a7ae0" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/></g></svg></div>';
  room.append(layer);
  const hid=$('.uv2-hid',layer),lamp=$('.uv2-lamp',layer),key=makeKey(1);
  key.style.cssText='position:absolute;left:'+spot[0]+'%;top:'+spot[1]+'%;width:46px;height:46px;margin:-23px 0 0 -23px;border-color:#e3b9ff;background:radial-gradient(circle at 50% 35%,#e9c8ff,#8d2bff);color:#240a4a;box-shadow:0 0 0 5px #8d2bff33,0 0 24px #b84bffaa;pointer-events:none';
  hid.append(key);
  let lx=0,ly=0,placed=false,offX=0,offY=0,holding=false,moved=0;
  function place(x,y){
   const w=layer.clientWidth,h=layer.clientHeight;
   // La lampe éclaire vers le haut à gauche : elle peut dépasser un peu à droite et en bas pour atteindre les coins.
   lx=clamp(x,30,Math.max(30,w+20));ly=clamp(y,30,Math.max(30,h+40));
   lamp.style.transform='translate3d('+(lx-42).toFixed(1)+'px,'+(ly-42).toFixed(1)+'px,0)';
   // Trois disques le long du faisceau : ils dévoilent ce qui est écrit à l'encre invisible, un peu au loin vers le haut à gauche.
   SPOTS.forEach((spot,i)=>{layer.style.setProperty('--m'+i+'x',(lx+AIM[0]*spot[0]).toFixed(1)+'px');layer.style.setProperty('--m'+i+'y',(ly+AIM[1]*spot[0]).toFixed(1)+'px')});
   if(key.parentNode===hid){
    const k=key.getBoundingClientRect(),v=layer.getBoundingClientRect();
    if(Math.hypot(k.left+k.width/2-v.left-(lx+AIM[0]*118),k.top+k.height/2-v.top-(ly+AIM[1]*118))<56){key.style.pointerEvents='auto';layer.append(key);key.classList.add('found');jingle()}
   }
  }
  function start(){if(placed)return;if(layer.clientWidth<=0)return;placed=true;place(58,76)}
  requestAnimationFrame(()=>requestAnimationFrame(start));
  addEventListener('resize',()=>{if(placed)place(lx,ly)},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(entries[0].isIntersecting)start()}).observe(layer);
  // Tenue en main, la lampe suit le doigt et fait défiler la page quand on approche du haut ou du bas de l'écran.
  let lastX=0,lastY=0,raf=0;
  function follow(){
   raf=0;if(!holding)return;
   const edge=130,limit=innerHeight-edge;let dy=0;
   if(lastY>limit)dy=Math.min(20,4+(lastY-limit)/4);else if(lastY<110)dy=-Math.min(20,4+(110-lastY)/4);
   if(dy)window.scrollBy(0,dy);
   const v=layer.getBoundingClientRect(),px=lx,py=ly;
   place(lastX-v.left-offX,lastY-v.top-offY);
   moved+=Math.hypot(lx-px,ly-py);if(moved>6)layer.classList.add('moved');
   raf=requestAnimationFrame(follow);
  }
  lamp.addEventListener('pointerdown',event=>{
   start();const v=layer.getBoundingClientRect();
   lastX=event.clientX;lastY=event.clientY;
   offX=event.clientX-v.left-lx;offY=event.clientY-v.top-ly;holding=true;moved=0;
   layer.classList.add('held');try{lamp.setPointerCapture(event.pointerId)}catch(error){}api.buzz(6);
   if(!raf)raf=requestAnimationFrame(follow);
  });
  lamp.addEventListener('pointermove',event=>{if(holding){lastX=event.clientX;lastY=event.clientY}});
  const drop=event=>{
   if(!holding)return;holding=false;layer.classList.remove('held');try{lamp.releasePointerCapture(event.pointerId)}catch(error){}
   if(moved<6){lamp.classList.remove('pulse');void lamp.offsetWidth;lamp.classList.add('pulse')}
  };
  lamp.addEventListener('pointerup',drop);lamp.addEventListener('pointercancel',drop);
  lamp.addEventListener('keydown',event=>{
   const step=event.shiftKey?60:26,move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
   if(move){event.preventDefault();start();place(lx+move[0],ly+move[1]);layer.classList.add('moved')}
  });
 }

 // ---------- 2. cadeaux : la carte ; le nœud du ruban se défait et laisse tomber une clé ----------
 function buildGift(body){
  const bow='<svg class="bw" viewBox="0 0 74 74" aria-hidden="true"><defs><linearGradient id="gbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb95e"/><stop offset="1" stop-color="#d9690f"/></linearGradient></defs><path d="M30 0L74 44V74L44 74 0 30V0z" fill="url(#gbw)" opacity=".95"/><g class="knot"><g transform="translate(52 22) rotate(45)"><ellipse cx="-9" cy="-4" rx="9" ry="5.5" fill="#ffd9a0" stroke="#8c4308" stroke-width="1.4"/><ellipse cx="9" cy="-4" rx="9" ry="5.5" fill="#ffd9a0" stroke="#8c4308" stroke-width="1.4"/><circle r="4" fill="#ffb95e" stroke="#8c4308" stroke-width="1.4"/></g></g></svg>';
  body.innerHTML='<div class="gi"><button type="button" class="gi-bow" aria-label="Le nœud du ruban : touchez-le pour le défaire">'+bow+'</button><small>CARTE CADEAU</small><h3>Offrez une aventure</h3><p>La carte cadeau Elucid Escape · 2 à 6 joueurs</p><a class="d-ticket" href="'+GIFT+'" target="_blank" rel="noopener"><span>Offrir une carte cadeau ↗</span><small>Une aventure à partager</small></a><div class="gi-k"></div></div>';
  const knot=$('.gi-bow',body),slot=$('.gi-k',body);let undone=false;
  knot.addEventListener('click',()=>{
   if(undone)return;undone=true;knot.classList.add('undone');tone([523,784],150,.07);api.buzz([10,30,12]);
   setTimeout(()=>{const key=makeKey(2);key.classList.add('arrive');slot.append(key)},calm()?0:520);
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
    if(!review){page.innerHTML='';if(spread===spreads-1)if(side===1){page.append(makeKey(3))}return}
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
  body.innerHTML='<div class="iq"><h4></h4><div class="iq-a"></div><div class="iq-in"></div></div><div class="iq-t">'+tiles.map((tile,i)=>'<button type="button" data-i="'+i+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+icon[tile[0]]+'</svg>'+tile[1]+'</button>').join('')+'</div>';
  const box=$('.iq',body),title=$('h4',body),inst=$('.iq-in',body),ans=$('.iq-a',body),buttons=$$('.iq-t button',body);
  const lightKey=makeKey(4),flips=[];
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
   const bulbSvg='<svg viewBox="0 0 48 66" aria-hidden="true"><defs><radialGradient id="blg" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".55" stop-color="#ffd36a"/><stop offset="1" stop-color="#f2a33c"/></radialGradient></defs><g class="rays" stroke="#ffe3a1" stroke-width="3" stroke-linecap="round"><path d="M24 2V8M6 12l4 4M42 12l-4 4M1 30h6M47 30h-6"/></g><path class="glass" d="M24 10a16 16 0 0 0-10 28c2 2 3 4 3 7v3h14v-3c0-3 1-5 3-7A16 16 0 0 0 24 10z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path class="fil" d="M19 38l5-8 5 8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="49" width="14" height="5" rx="2" fill="#9aa8b8"/><rect x="18.5" y="55" width="11" height="5" rx="2" fill="#7b8998"/><rect x="21" y="61" width="6" height="4" rx="2" fill="#5d6b7a"/></svg>';
   inst.innerHTML='<button type="button" class="lt-bulb" aria-pressed="false" aria-label="Allumer la lumière">'+bulbSvg+'<span>Allumer</span></button><div class="lt"><p class="lt-hint">Il fait noir ici…<br><b>Touchez l’ampoule</b> dans le coin <i aria-hidden="true">↗</i></p><div class="lt-slot"></div></div>';
   box.classList.add('dark');box.classList.remove('lit');
   const bulb=$('.lt-bulb',inst),label=$('span',bulb),hint=$('.lt-hint',inst),slot=$('.lt-slot',inst);
   bulb.addEventListener('click',()=>{
    const on=!box.classList.contains('lit');
    box.classList.toggle('lit',on);bulb.setAttribute('aria-pressed',String(on));bulb.setAttribute('aria-label',on?'Éteindre la lumière':'Allumer la lumière');
    label.textContent=on?'Éteindre':'Allumer';
    hint.innerHTML=on?'La lumière revient…<br><b>Voilà ce qui se cachait dans le noir.</b>':'Il fait noir ici…<br><b>Touchez l’ampoule</b> dans le coin <i aria-hidden="true">↗</i>';
    tone(on?[880,1320]:[220],on?200:90,.07);api.buzz(on?[8,30,14]:6);
    if(found.indexOf(4)<0){
     if(on){setTimeout(()=>{if(box.classList.contains('lit')){lightKey.hidden=false;slot.append(lightKey);lightKey.classList.remove('arrive');void lightKey.offsetWidth;lightKey.classList.add('arrive')}},calm()?0:650)}
     else if(lightKey.parentNode){lightKey.remove()}
    }
    const now=Date.now();flips.push(now);while(flips.length>0)if(now-flips[0]>5000){flips.shift()}else{break}
    if(flips.length>=8){flips.length=0;egg('💥','Court-circuit !','Vous avez fait sauter le disjoncteur. Ne le dites pas au maître du jeu.','Il fait déjà assez noir comme ça.',[])}
   });
  }
  function mailInstrument(){
   inst.innerHTML='<div class="iq-lock"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:46px;height:46px;fill:none;stroke:#62e4f5;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round">'+icon.mail+'</svg></div>';
  }
  // Réponses courtes : le détail visuel est dans l'instrument juste en dessous.
  const short=['Enfermés dans une salle, vous cherchez des indices et résolvez des énigmes pour en sortir à temps.','Dès 8 ans. Les groupes de moins de 15 ans viennent avec un adulte.','Quatre temps, environ 1 h 55 en tout.','Aucune condition physique ni compétence particulière : difficulté modérée.','Lumière tamisée et un bref passage dans le noir. La porte se déverrouille à tout moment.'];
  const instruments=[lockInstrument,ageInstrument,timelineInstrument,gaugeInstrument,lightInstrument,mailInstrument];
  function show(i){
   buttons.forEach((button,k)=>button.classList.toggle('on',k===i));
   box.classList.remove('dark','lit');if(lightKey.parentNode)lightKey.remove();
   title.textContent=i<5?faqs[i].q:'Une autre question ?';
   ans.innerHTML=i<5?'<p>'+short[i]+'</p>':'<p>Écrivez-nous ou appelez-nous : on vous répond.</p><p><a href="#" data-room="m-contact" style="color:#9defff;font-weight:800">Aller à la page Contact ›</a></p>';
   instruments[i]();api.buzz(4);
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
  show(1);
 }

  // ---------- 5. contact : un téléphone à touches, avec ses secrets ----------
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
   +'<div class="kp"><div class="kp-l"><div class="kp-d" aria-live="polite"></div><div class="kp-g"></div></div><div class="kp-r"><div class="kp-note">Le maître du jeu ne décroche que pour ceux qui savent <b>lire dans le noir</b>…</div><div class="kp-slot" aria-label="Retour de monnaie"></div><a class="kp-call" href="'+TEL+'">Appeler</a><button type="button" class="kp-clr">Effacer</button></div></div>';
  $('.adr',body).innerHTML=addressHtml.replace(/<br\s*\/?>/g,', ').replace(/^Elucid Escape,\s*/,'');
  $('.ci a[href^="mailto"]',body).textContent=mail;
  const display=$('.kp-d',body),grid=$('.kp-g',body),call=$('.kp-call',body),slot=$('.kp-slot',body);
  const rows=[697,770,852,941],cols=[1209,1336,1477],layout=['1','2','3','4','5','6','7','8','9','*','0','#'];
  let typed='',history='',unlocked=false;
  function paint(){
   if(typed){display.textContent=typed.slice(-9);display.style.opacity='1'}else{display.textContent=TELTEXT;display.style.opacity='.45'}
   const digits=typed.replace(/[^0-9]/g,'');
   call.href=TEL;
   if(digits.length>=3)call.href='tel:'+digits;
  }
  // Les petits secrets du standard.
  const melody=[[262,200],[262,200],[262,200],[294,200],[330,400],[294,200],[262,200],[330,200],[294,200],[294,200],[262,400]];
  function playMelody(){let at=0;melody.forEach(note=>{setTimeout(()=>tone([note[0]],note[1]*.9,.12),at);at+=note[1]+40})}
  const instant=[
   {test:/0326673801$/,icon:'📞',title:'Allô ?',text:'Bienvenue chez Elucid Escape, le meilleur escape game de Châlons-en-Champagne !',small:'(en même temps, on est les seuls)',call:true},
   {test:/11123213221$/,icon:'🎵',title:'Bravo !',text:'Vous êtes un super musicien.',small:'« Au clair de la lune », version téléphone à touches.',melody:true}
  ];
  const delayed=[
   {test:/^(112|15|17|18)$/,icon:'🚨',title:'Ce n’est pas le 112…',text:'Mais si votre équipe est bloquée sur une énigme, on a des indices en réserve.',small:'Pour une vraie urgence, raccrochez et composez le bon numéro.'},
   {test:/^3615$/,icon:'📟',title:'3615 ELUCID',text:'Le Minitel n’est plus ce qu’il était… mais l’escape game, si !',small:'Veuillez patienter, connexion à 1200 bauds.'},
   {test:/^666$/,icon:'😈',title:'Mauvais numéro',text:'Ici, on s’échappe de l’Apocalypse, pas de l’enfer.',small:'Le Comte Gustavo vous passe le bonjour.'},
   {test:/^(0000|1234)$/,icon:'🔓',title:'Code trop facile',text:'Même nos énigmes sont mieux protégées que ça.',small:'Essayez encore, ou lisez dans le noir.'},
   {test:/^42$/,icon:'🌌',title:'La réponse…',text:'… à la grande question sur la vie, l’univers et le reste. Pas à l’énigme du jour.',small:'Mais bien tenté.'},
   {test:/^007$/,icon:'🕵️',title:'Agent 007 ?',text:'Désolé, ici on cherche un virus, pas un agent secret.',small:'Le virus s’appelle Kaluptein.'}
  ];
  function fire(secret){
   typed='';history='';burst='';clearTimeout(burstTimer);paint();
   if(secret.melody)playMelody();
   egg(secret.icon,secret.title,secret.text,secret.small,secret.call?[{label:'Appeler pour de vrai',href:TEL}]:[]);
  }
  // Les secrets longs partent tout de suite ; les codes courts attendent une pause, sinon « 112 » éclaterait au milieu d'une mélodie.
  let burst='',burstTimer=0,resetTimer=0;
  function checkSecrets(){
   for(let i=0;i<instant.length;i++){
    if(instant[i].test.test(history)){history='';burst='';clearTimeout(burstTimer);fire(instant[i]);return}
   }
   clearTimeout(burstTimer);
   burstTimer=setTimeout(()=>{
    const sequence=burst;burst='';
    for(let i=0;i<delayed.length;i++){if(delayed[i].test.test(sequence)){history='';fire(delayed[i]);return}}
   },1100);
  }
  layout.forEach((key,i)=>{
   const button=document.createElement('button');button.type='button';button.textContent=key;button.setAttribute('aria-label','Touche '+key);
   button.addEventListener('pointerdown',()=>{button.classList.add('p');tone([rows[Math.floor(i/3)],cols[i%3]],140,.14);api.buzz(5)});
   const release=()=>button.classList.remove('p');
   button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('pointerleave',release);
   button.addEventListener('click',()=>{
    if(typed.length>=12)typed='';
    typed+=key;history=(history+key).slice(-16);burst+=key;paint();
    clearTimeout(resetTimer);resetTimer=setTimeout(()=>{history=''},4000);
    if(/690#$/.test(history)){
     if(!unlocked){
      unlocked=true;jingle();api.buzz([14,30,20]);slot.innerHTML='';slot.append(makeKey(5));
      setTimeout(()=>{typed='';paint()},900);
     }
     history='';burst='';clearTimeout(burstTimer);return;
    }
    checkSecrets();
   });
   grid.append(button);
  });
  $('.kp-clr',body).addEventListener('click',()=>{typed='';history='';burst='';clearTimeout(burstTimer);paint();tone([260],80,.06)});
  paint();
 }

 if(!SCROLL){
  const builders=[buildTarifs,buildGift,buildAvis,buildFaq,buildContact];
  builders.forEach((build,index)=>build(roomEls[index].querySelector('.d-body')));
 }
 // ---------- mode E : un site classique qui défile, avec un menu clair ----------
 if(SCROLL){
  const SITE='https://elucidescape.fr/';
  const LEGAL=[['CGV',SITE+'cgv/'],['Mentions légales',SITE+'mentions-legales/'],['Confidentialité',SITE+'politique-de-confidentialite/'],['Cookies',SITE+'politique-de-cookies-ue/']];
  const minPer=Object.keys(prices).reduce((best,n)=>Math.min(best,prices[n].per),999);
  function fmtEuro(value){return(Math.round(value*10)/10).toString().replace('.',',')+' €'}
  const eicon={
   door:'<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M3 21h18"/>',
   tag:'<path d="M3 3h8.5L21 12.5 12.5 21 3 11.5zM7.5 7.5h.01"/>',
   gift:'<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12.5h18M12 8c-2.5-4-6-3-5 0 .6 1.7 3 1.2 5 0zm0 0c2.5-4 6-3 5 0-.6 1.7-3 1.2-5 0z"/>',
   party:'<path d="M4 20l5-14 9 9zM14 4v3M19 7l-2 2M20 12h-3"/>',
   work:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 13h18"/>',
   star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
   ask:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9M12 17h.01"/>',
   phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
   menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
   book:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
  };
  const eSvg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+eicon[name]+'</svg>';
  // Contenu des deux sections absentes jusqu'ici (événements, professionnels) : repris de elucidescape.fr.
  function buildEvents(body){
   body.innerHTML='<div class="ev"><div class="ev-chips"><span>EVJF / EVG</span><span>Anniversaire</span><span>Mariage</span><span>Cousinade</span><span>Groupe privé</span></div>'
    +'<div class="ev-fmt"><div><small>JUSQU’À 12 PERSONNES</small><b>Dans nos locaux</b><span>EVJF, EVG, anniversaire ou sortie privée : on adapte l’organisation à votre groupe.</span></div>'
    +'<div><small>PLUS DE 12 PERSONNES</small><b>Chez vous</b><span>Mariage, grand anniversaire : une animation mobile sur le lieu de votre événement.</span></div></div>'
    +'<div class="ev-btns"><a class="d-ticket" href="'+TEL+'"><span>Appeler · '+TELTEXT+'</span><small>Dites-nous la date, le lieu et le nombre de participants</small></a><a class="ev-alt" href="'+SITE+'evenements/" target="_blank" rel="noopener">Voir la page événements ↗</a></div></div>';
  }
  function buildPro(body){
   body.innerHTML='<div class="ev"><div class="ev-chips"><span>Team building</span><span>Séminaire</span><span>Salon</span><span>Journée de cohésion</span></div>'
    +'<div class="ev-facts"><div><b>20 à 100+</b><small>participants</small></div><div><b>Partout</b><small>entreprise, salon, extérieur</small></div><div><b>Clé en main</b><small>matériel, installation, animation</small></div><div><b>2 modes</b><small>collaboration ou compétition</small></div></div>'
    +'<div class="ev-btns"><a class="d-ticket" href="'+SITE+'entreprises/" target="_blank" rel="noopener"><span>Demander un devis ↗</span><small>Escape box mobile pour vos équipes</small></a><a class="ev-alt" href="'+TEL+'">Appeler · '+TELTEXT+'</a></div></div>';
  }
  scenes.push(
   ()=>{ // 5 · événements : guirlandes et confettis
    const rnd=seeded(21);let s=sceneOpen+'<rect width="393" height="780" fill="#0a1224"/>';
    s+='<path d="M-10 70Q100 150 196 90T403 80" fill="none" stroke="#2f5478" stroke-width="2.4"/>';
    for(let i=0;i<9;i++){const x=10+i*45,y=82+Math.sin(i*.9)*22+(i%2)*6,c=['#e8832a','#62e4f5','#ffcf8a'][i%3];s+='<line x1="'+x+'" y1="'+(y-6)+'" x2="'+x+'" y2="'+(y+8)+'" stroke="#2f5478" stroke-width="2"/><circle cx="'+x+'" cy="'+(y+16)+'" r="9" fill="'+c+'" filter="url(#sb)" opacity=".7"/><circle cx="'+x+'" cy="'+(y+16)+'" r="5" fill="'+c+'"/>'}
    for(let i=0;i<46;i++){const x=rnd()*393,y=120+rnd()*600,c=['#e8832a','#62e4f5','#ffcf8a','#b84bff'][i%4];s+='<rect x="'+x.toFixed(0)+'" y="'+y.toFixed(0)+'" width="'+(5+rnd()*5).toFixed(1)+'" height="'+(3+rnd()*3).toFixed(1)+'" fill="'+c+'" opacity=".4" transform="rotate('+(rnd()*180).toFixed(0)+' '+x.toFixed(0)+' '+y.toFixed(0)+')"/>'}
    return s+'</svg>';
   },
   ()=>{ // 6 · professionnels : salle de réunion, écran et réseau
    let s=sceneOpen+'<rect width="393" height="780" fill="#08111f"/><rect x="26" y="80" width="341" height="190" rx="10" fill="#0a1626" stroke="#2f5478" stroke-width="2"/><path d="M44 230L100 186 150 206 210 150 260 176 336 118" fill="none" stroke="#62e4f5" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g fill="#e8832a" fill-opacity=".7"><circle cx="100" cy="186" r="5"/><circle cx="210" cy="150" r="5"/><circle cx="336" cy="118" r="5"/></g>';
    s+='<g fill="none" stroke="#2f5478" stroke-opacity=".5" stroke-width="2"><circle cx="70" cy="520" r="30"/><circle cx="196" cy="560" r="30"/><circle cx="322" cy="520" r="30"/><path d="M98 530L168 552M224 552L294 530"/></g>';
    s+='<g fill="#14284a" stroke="#62e4f5" stroke-opacity=".5" stroke-width="2"><rect x="46" y="500" width="48" height="40" rx="8"/><rect x="172" y="540" width="48" height="40" rx="8"/><rect x="298" y="500" width="48" height="40" rx="8"/></g>';
    return s+'</svg>';
   }
  );
  const secs=[
   {id:'m-tarifs',k:'01 · TARIFS',t:'Les tarifs',scene:0,build:buildTarifs},
   {id:'m-gift',k:'02 · CARTE CADEAU',t:'À offrir',scene:1,build:buildGift},
   {id:'m-events',k:'03 · ÉVÉNEMENTS PRIVÉS',t:'EVJF, anniversaire, mariage',scene:5,build:buildEvents},
   {id:'m-pro',k:'04 · PROFESSIONNELS',t:'Team building, séminaire',scene:6,build:buildPro},
   {id:'m-avis',k:'05 · AVIS',t:'Ils ont joué le jeu',scene:2,build:buildAvis},
   {id:'m-faq',k:'06 · QUESTIONS',t:'Une question ?',scene:3,build:buildFaq},
   {id:'m-contact',k:'07 · CONTACT',t:'Nous trouver',scene:4,build:buildContact}
  ];
  const page=$('.m-page'),hallSec=$('.m-hall');
  $$('.m-sec').forEach(section=>section.remove());
  const flow=document.createElement('div');flow.className='e-flow';
  secs.forEach(def=>{
   const section=document.createElement('section');section.className='e-sec';section.id=def.id;section.setAttribute('aria-label',def.t);
   section.innerHTML='<div class="d-scene" aria-hidden="true">'+scenes[def.scene]()+'</div><header class="e-head"><small>'+def.k+'</small><h2>'+def.t+'</h2></header><div class="d-body"></div>';
   flow.append(section);
  });
  const foot=document.createElement('footer');foot.className='e-foot';
  foot.innerHTML='<b>ELUCID ESCAPE</b><p>'+addressHtml+'</p><nav aria-label="Informations légales">'+LEGAL.map(item=>'<a href="'+item[1]+'" target="_blank" rel="noopener">'+item[0]+'</a>').join('')+'</nav><small>© Elucid Escape</small>';
  flow.append(foot);
  hallSec.after(flow);
  secs.forEach(def=>def.build($('#'+def.id+' .d-body')));

  // Le hall : deux grandes cartes, une seule chose à faire (toucher la porte qu'on veut). Plus de balayage, de jauge ni d'engrenage.
  const copy=$('.m-hall-copy',hallSec);
  if(copy)copy.innerHTML='<p class="m-eyebrow">NOS AVENTURES</p><h2>Choisissez <em>votre porte.</em></h2>';
  const choose=document.createElement('div');choose.className='e-choose';
  const doors=[
   ['rouages','Les Rouages de l’Apocalypse','Atelier mécanique · 2 à 6 joueurs','../assets/v12/room-rouages.webp','','Découvrir'],
   ['cybertrax','CybertraX','Laboratoire futuriste','../assets/v12/room-cybertrax.webp','Bientôt','Découvrir']
  ];
  choose.innerHTML=doors.map(door=>'<button type="button" class="e-card" data-door="'+door[0]+'" aria-label="'+door[1]+(door[4]?' ('+door[4].toLowerCase()+')':'')+' : voir l’aventure"><img src="'+door[3]+'" alt="" width="1024" height="1536" decoding="async"><span class="e-card-tx"><b>'+door[1]+'</b><small>'+door[2]+'</small></span>'+(door[4]?'<i class="e-card-soon">'+door[4]+'</i>':'')+'<span class="e-card-go">'+door[5]+' <i aria-hidden="true">›</i></span></button>').join('')
   +'<a class="e-more" href="#m-tarifs" data-room="m-tarifs">Tarifs et infos pratiques <i aria-hidden="true">↓</i></a>';
  hallSec.append(choose);
  choose.addEventListener('click',event=>{const card=event.target.closest('[data-door]');if(card){api.buzz(10);api.showSheet(card.dataset.door)}});
  // L'ancien balayage du hall n'existe plus : on l'empêche de réagir derrière les cartes.
  hallSec.addEventListener('pointerdown',event=>event.stopImmediatePropagation(),true);

  // Défilement vers une section : sert au menu, au dock, à la porte du fond du hall et aux liens internes.
  function scrollToId(id,instant){
   const target=document.getElementById(id);if(!target)return;
   target.scrollIntoView({behavior:calm()||instant?'auto':'smooth',block:'start'});
  }
  api.setGoHook((id,instant)=>scrollToId(id,instant));
  document.addEventListener('click',event=>{const go=event.target.closest('[data-room]');if(!go)return;event.preventDefault();scrollToId(go.dataset.room)});

  // Le dock du bas : cinq repères et le menu complet.
  const dock=$('.m-dock');
  dock.innerHTML='<a href="#m-hall" data-e="m-hall">'+eSvg('door')+'<span>Salles</span></a><a href="#m-tarifs" data-e="m-tarifs">'+eSvg('tag')+'<span>Tarifs</span></a><a href="#m-gift" data-e="m-gift">'+eSvg('gift')+'<span>Cadeaux</span></a><button type="button" class="e-menu-btn" aria-haspopup="dialog" aria-expanded="false">'+eSvg('menu')+'<span>Menu</span></button><a class="book" href="'+BOOK+'" target="_blank" rel="noopener">'+eSvg('book')+'<span>Réserver</span></a>';
  const menu=document.createElement('div');menu.className='e-menu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');menu.setAttribute('aria-label','Menu');
  const rows=[
   ['m-hall','door','Salles','Les Rouages de l’Apocalypse · CybertraX bientôt'],
   ['m-tarifs','tag','Tarifs','De 2 à 6 joueurs · dès '+fmtEuro(minPer)+' par personne'],
   ['m-gift','gift','Carte cadeau','Une aventure à offrir · valable 1 an'],
   ['m-events','party','Événements','EVJF, anniversaire, mariage, cousinade'],
   ['m-pro','work','Professionnels','Team building, séminaire, devis'],
   ['m-avis','star','Avis','5,0 / 5 · 263 avis Google'],
   ['m-faq','ask','Questions','Âge, durée, difficulté…'],
   ['m-contact','phone','Contact','Adresse, téléphone, réseaux']
  ];
  menu.innerHTML='<div class="e-menu-card"><header><b>MENU</b><button type="button" class="e-menu-x" aria-label="Fermer le menu">Fermer ×</button></header><nav>'+rows.map(r=>'<a href="#'+r[0]+'" data-e="'+r[0]+'">'+eSvg(r[1])+'<span><b>'+r[2]+'</b><small>'+r[3]+'</small></span><i aria-hidden="true">›</i></a>').join('')+'</nav><a class="e-menu-book" href="'+BOOK+'" target="_blank" rel="noopener">Réserver mon créneau ↗</a><p>'+LEGAL.map(item=>'<a href="'+item[1]+'" target="_blank" rel="noopener">'+item[0]+'</a>').join(' · ')+'</p></div>';
  document.body.append(menu);
  const menuButton=$('.e-menu-btn',dock);
  function openMenu(){menu.hidden=false;menuButton.setAttribute('aria-expanded','true');root.classList.add('m-locked');api.buzz(6);requestAnimationFrame(()=>requestAnimationFrame(()=>menu.classList.add('is-open')));const first=menu.querySelector('nav a');if(first)setTimeout(()=>first.focus({preventScroll:true}),150)}
  function closeMenu(){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');setTimeout(()=>{menu.hidden=true;root.classList.remove('m-locked')},calm()?30:280)}
  menuButton.addEventListener('click',()=>{if(menu.hidden){openMenu()}else{closeMenu()}});
  $('.e-menu-x',menu).addEventListener('click',closeMenu);
  menu.addEventListener('click',event=>{
   if(event.target===menu){closeMenu();return}
   const link=event.target.closest('a[data-e]');
   if(link){event.preventDefault();closeMenu();setTimeout(()=>scrollToId(link.dataset.e),calm()?40:300)}
   else if(event.target.closest('a'))closeMenu();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')if(!menu.hidden)closeMenu()});
  // Le dock et le menu montrent où l'on est.
  const here=new Map();
  function mark(id){
   $$('.m-dock [data-e]').forEach(link=>link.setAttribute('aria-current',String(link.dataset.e===id)));
   menu.querySelectorAll('a[data-e]').forEach(link=>link.classList.toggle('is-here',link.dataset.e===id));
   const named=['m-hall','m-tarifs','m-gift'].indexOf(id)>=0;menuButton.classList.toggle('is-here',!named);
  }
  if('IntersectionObserver' in window){
   const spy=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)here.set(entry.target.id,entry.intersectionRatio);else here.delete(entry.target.id)});
    let best='',score=-1;here.forEach((ratio,id)=>{if(ratio>score){score=ratio;best=id}});
    if(best)mark(best);
   },{rootMargin:'-35% 0px -45% 0px',threshold:[0,.1,.5,1]});
   [hallSec,...$$('.e-sec')].forEach(section=>spy.observe(section));
  }
  mark('m-hall');
 }


 // ---------- hall : enseigne + sceau ----------
 const board=centerDoor?centerDoor.parentNode:null;
 let rot=0,sel=0,tweenToken=0;
 if(board)if(!SCROLL){
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
 if(!SCROLL)hall.append(floor);
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
