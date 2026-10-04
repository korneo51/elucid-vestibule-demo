/* Vestibule mobile, v13.
   One idea per screen: slide the lock, push a door, scroll. The page is a normal scrolling document, so nothing here
   depends on faking scroll, and everything that moves is a transform or an opacity. Markup lives in the m-template element of index.html.
   Written without the double ampersand, which WordPress rewrites inside HTML blocks. */
(() => {
 'use strict';
 if(!matchMedia('(max-width:760px)').matches)return;
 const template=document.getElementById('m-template'),practical=document.querySelector('.practical'),header=document.querySelector('.site-header');
 if(!template)return;
 if(!practical)return;
 const root=document.documentElement,calmQuery=matchMedia('(prefers-reduced-motion:reduce)'),TOTAL_KEYS=5;
 function recall(key){try{return sessionStorage.getItem(key)}catch(error){return null}}
 function remember(key,value){try{sessionStorage.setItem(key,value)}catch(error){}}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
 const easeOut=t=>1-Math.pow(1-t,3),easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 let calm=(recall('ee-motion')||(calmQuery.matches?'calm':'full'))==='calm';
 // Travel style: '' = classic scrolling page, 'a' / 'b' / 'c' = journey.js (room by room). ?v= is for local tests.
 const queryStyle=new URLSearchParams(location.search).get('v');
 if(queryStyle!==null)remember('ee-variant',queryStyle==='0'?'':queryStyle);
 const storedStyle=recall('ee-variant'),styleName=storedStyle!==null?storedStyle:(window.EE_DEFAULT_VARIANT||''),variant=['a','b','c'].indexOf(styleName)>=0?styleName:'';

 // ---------- build ----------
 const app=document.createElement('div');app.id='m-app';app.dataset.motion=calm?'calm':'full';
 app.append(template.content.cloneNode(true));
 header.after(app);
 root.dataset.mPhase='gate';root.classList.add('m-locked');
 const $=selector=>app.querySelector(selector),$$=selector=>[...app.querySelectorAll(selector)];
 const gate=$('.m-gate'),door=$('.m-gate-door'),leafLeft=$('.m-leaf.l'),leafRight=$('.m-leaf.r'),light=$('.m-gate-light'),lock=$('.m-lock'),copy=$('.m-gate-copy'),slide=$('.m-slide'),fill=$('.m-slide-fill'),label=$('.m-slide-label'),thumb=$('.m-thumb'),skip=$('.m-skip');
 const hall=$('.m-hall'),toast=$('.m-toast'),win=$('.m-win');
 // Move the existing sections (prices, reviews, questions...) into the new page. They keep their markup and their scripts.
 $$('.m-sec').forEach(section=>{
  section.dataset.take.split(',').forEach(selector=>{const node=practical.querySelector(selector.trim());if(node)section.append(node)});
  [...section.children].forEach(child=>{if(!child.classList.contains('m-key'))child.classList.add('m-reveal')});
 });
 practical.hidden=true;
 const details=$('.ee-price-details');
 if(details){const fold=document.createElement('details');fold.className='m-fold';fold.innerHTML='<summary>Tous les tarifs et conditions</summary>';details.before(fold);fold.append(details)}
 $$('.ee-review').forEach(review=>{review.hidden=false});
 $$('.ee-step').forEach(step=>{step.dataset.n=step.textContent.trim()});
 // Key counter next to "Réserver" in the header.
 const keysButton=document.createElement('button');keysButton.className='m-keys';keysButton.type='button';keysButton.setAttribute('aria-label','Clés cachées trouvées');
 keysButton.innerHTML='<svg aria-hidden="true"><use href="#m-key"/></svg><span><b>0</b>/'+TOTAL_KEYS+'</span>';
 header.querySelector('nav').insertBefore(keysButton,header.querySelector('.reserve'));
 const keyCounter=keysButton.querySelector('b');

 // ---------- small helpers ----------
 let tweenId=0;
 function tween(from,to,duration,ease,paint,done){const id=++tweenId,start=performance.now();function tick(now){if(id!==tweenId)return;const t=Math.min(1,(now-start)/duration);paint(from+(to-from)*ease(t));if(t<1){requestAnimationFrame(tick)}else if(done){done()}}requestAnimationFrame(tick)}
 // Browsers only allow vibration after a tap; scrolling alone does not count, so wait until the visitor has tapped once.
 function buzz(pattern){if(calm)return;if(navigator.userActivation)if(!navigator.userActivation.hasBeenActive)return;try{if(navigator.vibrate)navigator.vibrate(pattern)}catch(error){}}
 function setPhase(name){root.dataset.mPhase=name}
 let goHook=null;
 function go(id,instant){if(goHook){goHook(id,instant);return}const target=document.getElementById(id);if(!target)return;target.scrollIntoView({behavior:calm||instant?'auto':'smooth',block:'start'})}
 let toastTimer=0;
 function say(text,options){
  const settings=options||{};clearTimeout(toastTimer);toast.classList.remove('out');toast.classList.toggle('top',Boolean(settings.top));
  toast.innerHTML='<span></span>'+(settings.action?'<button type="button" data-act>'+settings.action+'</button>':'')+'<button type="button" class="x" data-close aria-label="Fermer">×</button>';
  toast.firstChild.textContent=text;toast.hidden=false;toast.onAction=settings.onAction||null;
  toastTimer=setTimeout(hideToast,settings.ms||5200);
 }
 function hideToast(){toast.classList.add('out');setTimeout(()=>{toast.hidden=true;toast.classList.remove('out')},380)}
 toast.addEventListener('click',event=>{if(event.target.closest('[data-act]')){if(toast.onAction)toast.onAction();hideToast()}if(event.target.closest('[data-close]'))hideToast()});

 // ---------- 1. the lock ----------
 let gateP=0,drag=null,unlocking=false,paintQueued=false,lastTick=0;
 const maxX=()=>Math.max(1,slide.clientWidth-thumb.offsetWidth-12);
 function paintGate(p){
  const open=clamp((p-.4)/.6,0,1),distance=p*maxX();
  thumb.style.transform='translate3d('+distance.toFixed(1)+'px,0,0)';
  fill.style.transform='scaleX('+clamp((distance+58)/slide.clientWidth,0,1).toFixed(3)+')';
  label.style.opacity=String(clamp(1-p*1.9,0,1));
  lock.style.transform='rotate('+(p*210).toFixed(1)+'deg) scale('+(1+p*.08).toFixed(3)+')';
  leafLeft.style.transform='translate3d('+(-open*100).toFixed(1)+'%,0,0)';leafRight.style.transform='translate3d('+(open*100).toFixed(1)+'%,0,0)';
  light.style.opacity=String((.3+p*.7).toFixed(3));
  copy.style.opacity=String((1-p*.55).toFixed(3));copy.style.transform='translate3d(0,'+(p*10).toFixed(1)+'px,0)';
 }
 function queuePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paintGate(gateP)})}
 thumb.addEventListener('pointerdown',event=>{
  if(unlocking)return;
  tweenId++;drag={id:event.pointerId,x:event.clientX,p:gateP,moved:false,lastX:event.clientX,lastT:performance.now(),speed:0};
  try{thumb.setPointerCapture(event.pointerId)}catch(error){}
  thumb.style.animation='none';startTilt();
 });
 thumb.addEventListener('pointermove',event=>{
  if(!drag)return;if(event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,now=performance.now();
  if(Math.abs(dx)>5)drag.moved=true;
  if(now>drag.lastT)drag.speed=(event.clientX-drag.lastX)/(now-drag.lastT);
  drag.lastX=event.clientX;drag.lastT=now;
  gateP=clamp(drag.p+dx/maxX(),0,1);
  const mark=Math.floor(gateP*4);if(mark!==lastTick){lastTick=mark;buzz(6)}
  queuePaint();
 });
 function endDrag(event){
  if(!drag)return;if(event.pointerId!==drag.id)return;
  const finished=drag;drag=null;
  if(event.type==='pointercancel'){rewind();return}
  if(!finished.moved){autoUnlock();return}
  if(gateP>=.84){unlock()}else if(finished.speed>.9){if(gateP>.35)unlock();else rewind()}else{rewind()}
 }
 thumb.addEventListener('pointerup',endDrag);thumb.addEventListener('pointercancel',endDrag);
 thumb.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();autoUnlock()}});
 slide.addEventListener('click',event=>{if(event.target.closest('.m-thumb'))return;autoUnlock()});
 function rewind(){lastTick=0;tween(gateP,0,420,easeOut,value=>{gateP=value;paintGate(value)})}
 function autoUnlock(){if(unlocking)return;startTilt();tween(gateP,1,calm?200:560,easeInOut,value=>{gateP=value;paintGate(value)},unlock)}
 function unlock(){
  if(unlocking)return;unlocking=true;gateP=1;paintGate(1);buzz([16,40,28]);gate.classList.add('is-open');
  if(calm){
   setTimeout(()=>{gate.classList.add('is-fading');setPhase('arrive')},380);
   setTimeout(finishGate,1000);
   return;
  }
  // Dolly into the light, then dissolve into the hall while its doors rise.
  setTimeout(()=>{
   const box=door.getBoundingClientRect(),scale=Math.max(innerWidth/box.width,innerHeight/box.height)*1.3;
   door.style.transition='transform 1.05s cubic-bezier(.66,.02,.86,.34)';door.style.transform='scale('+scale.toFixed(2)+')';
  },420);
  setTimeout(()=>{gate.classList.add('is-fading');setPhase('arrive')},1120);
  setTimeout(finishGate,1750);
 }
 function finishGate(){
  gate.hidden=true;root.classList.remove('m-locked');setPhase('page');window.scrollTo(0,0);
  door.style.transition='none';door.style.transform='';unlocking=false;
  setTimeout(peek,1500);
  if(!recall('ee-key-hint')){remember('ee-key-hint','1');setTimeout(()=>say('Psst… 5 clés sont cachées dans le vestibule. Les trouverez-vous ?',{ms:6000}),900)}
 }
 function showGate(){
  hideToast();gate.hidden=false;gate.classList.remove('is-open','is-fading');door.style.transition='none';door.style.transform='';
  gateP=0;paintGate(0);thumb.style.animation='none';void thumb.offsetWidth;thumb.style.animation='';unlocking=false;if(board)if(look!==0)setLook(0,true);
  root.classList.add('m-locked');setPhase('gate');window.scrollTo(0,0);
 }
 function skipGate(){
  if(unlocking)return;unlocking=true;gate.classList.add('is-fading');setPhase('page');root.classList.remove('m-locked');go('m-tarifs',true);
  setTimeout(()=>{gate.hidden=true;unlocking=false},600);
 }
 skip.addEventListener('click',skipGate);
 const skipLink=document.querySelector('.skip-link');
 if(skipLink)skipLink.addEventListener('click',event=>{event.preventDefault();if(gate.hidden){go('m-tarifs')}else{skipGate()}});

 // ---------- 2. the hall: turn to a door, walk through it ----------
 // The PC hall is an illustration with the two doors projected onto its walls. It is cloned here at the height of the phone and
 // panned sideways: a swipe turns the view toward the door on that side, a second swipe (or a tap) pushes the door open and walks in.
 const sheets={rouages:$('[data-sheet="rouages"]'),cybertrax:$('[data-sheet="cybertrax"]')};
 const view=$('.m-view'),source=document.querySelector('.layered-hall .hall-artboard'),enter=$('.m-enter');
 const ART_W=1672,ART_H=941,lookOf={rouages:-1,cybertrax:1},nameAt={'-1':'rouages','1':'cybertrax'};
 const doorInfo={rouages:['Les Rouages de l’apocalypse','Atelier mécanique · 2–6 joueurs'],cybertrax:['CybertraX','Laboratoire futuriste · bientôt']};
 const restY=variant==='c'?-30:0;
 let board=null,centerDoor=null,portals=[],buttons={},look=0,camX=0,camY=0,zoom=1,nudge=0,camId=0,spots={rouages:{x:0,y:0},cybertrax:{x:0,y:0}},reach={left:0,center:0,right:0},scaleOf=1,heightOf=1,peekId=0,previewTimer=0,lastSwipe=0;
 let openName='',doorBusy=false;
 if(source){
  board=source.cloneNode(true);board.removeAttribute('style');board.classList.add('m-board');
  const clip=board.querySelector('clipPath');if(clip)clip.id='m-apertures';
  board.querySelector('.hall-background').style.clipPath='url(#m-apertures)';
  view.append(board);
  portals=[...board.querySelectorAll('[data-project]')];
  centerDoor=document.createElement('button');centerDoor.type='button';centerDoor.className='m-center';centerDoor.setAttribute('aria-label','Continuer vers les tarifs et les infos pratiques');
  centerDoor.innerHTML='<span class="m-center-door"><span class="m-gate-light"></span><i class="m-leaf l"></i><i class="m-leaf r"></i><svg class="m-lock" viewBox="0 0 140 140" fill="none" aria-hidden="true"><circle cx="70" cy="70" r="64"/><circle class="m-ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></span><span class="m-center-tag">TARIFS &amp; INFOS ↓</span>';
  board.append(centerDoor);centerDoor.addEventListener('click',()=>go('m-tarifs'));
  buttons={rouages:board.querySelector('.room-link[data-room="rouages"]'),cybertrax:board.querySelector('.room-link[data-room="cybertrax"]')};
 }
 // Maps the flat source rectangle of each layer onto its quadrilateral on the wall (same method as the PC page).
 function project(element,s){
  const target=JSON.parse(element.dataset.corners).map(point=>[point[0]*s,point[1]*s]),sw=Number(element.dataset.sourceWidth)||360,sh=Number(element.dataset.sourceHeight)||540;
  const corners=[[0,0],[sw,0],[sw,sh],[0,sh]],m=[];
  corners.forEach((point,i)=>{const u=target[i][0],v=target[i][1],x=point[0],y=point[1];m.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v])});
  for(let c=0;c<8;c++){
   let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(m[r][c])>Math.abs(m[pivot][c]))pivot=r;
   const swap=m[c];m[c]=m[pivot];m[pivot]=swap;const d=m[c][c];for(let k=c;k<9;k++)m[c][k]/=d;
   for(let r=0;r<8;r++)if(r!==c){const f=m[r][c];for(let k=c;k<9;k++)m[r][k]-=f*m[c][k]}
  }
  const q=m.map(row=>row[8]);
  element.style.transform='matrix3d('+[q[0],q[3],0,q[6],q[1],q[4],0,q[7],0,0,1,0,q[2],q[5],0,1].join(',')+')';
  return target;
 }
 function layout(){
  if(!board)return;
  const W=innerWidth,H=innerHeight,s=Math.max(W/ART_W,H/ART_H),w=ART_W*s,h=ART_H*s;
  scaleOf=s;heightOf=h;
  Object.assign(board.style,{left:'0px',top:(-H*.06).toFixed(1)+'px',width:w.toFixed(1)+'px',height:h.toFixed(1)+'px',transformOrigin:'50% 50%'});
  board.style.setProperty('--art-scale',String(s));
  portals.forEach(element=>{
   const quad=project(element,s);
   if(element.dataset.project==='left')spots.rouages={x:(quad[0][0]+quad[1][0]+quad[2][0]+quad[3][0])/4,y:(quad[0][1]+quad[1][1]+quad[2][1]+quad[3][1])/4};
   if(element.dataset.project==='right')spots.cybertrax={x:(quad[0][0]+quad[1][0]+quad[2][0]+quad[3][0])/4,y:(quad[0][1]+quad[1][1]+quad[2][1]+quad[3][1])/4};
  });
  reach={left:0,center:(W-w)/2,right:W-w};
  Object.assign(centerDoor.style,{left:(741*s).toFixed(1)+'px',top:(482*s).toFixed(1)+'px',width:(190*s).toFixed(1)+'px',height:(258*s).toFixed(1)+'px'});
  if(!doorBusy)camX=cameraAt(look);
  if(!doorBusy)camY=look===0?restY:-34;
  paint();
 }
 function cameraAt(value){return value<0?reach.left:value>0?reach.right:reach.center}
 function paint(){board.style.transform='translate3d('+(camX+nudge).toFixed(1)+'px,'+camY.toFixed(1)+'px,0) scale('+zoom.toFixed(4)+')'}
 function camTween(to,duration,ease,done){
  const id=++camId,from={x:camX,y:camY,z:zoom},aim={x:to.x===undefined?from.x:to.x,y:to.y===undefined?from.y:to.y,z:to.z===undefined?from.z:to.z},start=performance.now();
  if(!duration||calm){camX=aim.x;camY=aim.y;zoom=aim.z;paint();if(done)done();return}
  function tick(now){if(id!==camId)return;const t=Math.min(1,(now-start)/duration),k=ease(t);camX=from.x+(aim.x-from.x)*k;camY=from.y+(aim.y-from.y)*k;zoom=from.z+(aim.z-from.z)*k;paint();if(t<1){requestAnimationFrame(tick)}else if(done){done()}}
  requestAnimationFrame(tick);
 }
 function setPreview(name){Object.keys(buttons).forEach(key=>{if(buttons[key])buttons[key].classList.toggle('is-preview',key===name)})}
 function setLook(next,instant){
  if(!board)return;
  stopPeek();clearTimeout(previewTimer);
  const changed=next!==look;look=next;
  root.dataset.hallLook=String(look);hall.dataset.look=String(look);hall.classList.toggle('is-facing',look!==0);
  $$('.m-pager button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.look)===look)));
  const name=nameAt[String(look)];
  if(look!==0){root.dataset.hallLooked='1';enter.querySelector('.m-enter-name').textContent=doorInfo[name][0];enter.querySelector('.m-enter-sub').textContent=doorInfo[name][1];enter.hidden=false}else{enter.hidden=true}
  if(changed)buzz(8);
  if(look===0){setPreview('')}
  camTween({x:cameraAt(look),y:look===0?restY:-34,z:1},instant?0:680,easeInOut,()=>{
   if(look!==0){previewTimer=setTimeout(()=>{if(look===lookOf[name])if(!openName)setPreview(name)},calm?0:260)}
  });
 }
 // Swipe toward a door to turn to it; swipe again the same way to go in; swipe the other way to come back.
 function swiped(direction){
  if(doorBusy)return;if(openName)return;
  if(look===0){setLook(direction);return}
  if(direction===look){enterDoor(nameAt[String(look)]);return}
  setLook(0);
 }
 let pointer=null;
 hall.addEventListener('pointerdown',event=>{
  if(!board)return;if(doorBusy)return;if(openName)return;if(root.dataset.mPhase==='gate')return;
  if(event.pointerType==='mouse')if(event.button!==0)return;
  stopPeek();pointer={id:event.pointerId,x:event.clientX,y:event.clientY,active:false,t:performance.now()};
 });
 hall.addEventListener('pointermove',event=>{
  if(!pointer)return;if(event.pointerId!==pointer.id)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(!pointer.active){
   if(Math.abs(dy)>14)if(Math.abs(dy)>Math.abs(dx)){pointer=null;return}
   if(Math.abs(dx)<12)return;if(Math.abs(dx)<Math.abs(dy)*1.3)return;
   pointer.active=true;try{hall.setPointerCapture(event.pointerId)}catch(error){}
  }
  // The view leans toward the door it is about to turn to.
  nudge=clamp(-dx*.32,-56,56);paint();
 });
 function endPointer(event){
  if(!pointer)return;if(event.pointerId!==pointer.id)return;
  const finished=pointer;pointer=null;
  if(!finished.active)return;
  lastSwipe=performance.now();
  const dx=event.clientX-finished.x,quick=Math.abs(dx)/Math.max(1,performance.now()-finished.t)>.35;
  nudge=0;paint();
  if(event.type==='pointerup')if(Math.abs(dx)>=36||quick)swiped(dx<0?-1:1);
 }
 hall.addEventListener('pointerup',endPointer);hall.addEventListener('pointercancel',endPointer);
 hall.addEventListener('click',event=>{if(performance.now()-lastSwipe<300){event.preventDefault();event.stopPropagation()}},true);
 // Buttons: arrows on the edges, the three-way selector, and the doors and arrow cues drawn in the hall.
 $$('[data-look]').forEach(button=>button.addEventListener('click',()=>setLook(Number(button.dataset.look))));
 function faceOrEnter(name){if(look===lookOf[name]){enterDoor(name)}else{setLook(lookOf[name])}}
 if(board){
  board.querySelectorAll('[data-room]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();faceOrEnter(element.dataset.room)}));
  enter.querySelector('.m-enter-go').addEventListener('click',()=>{if(look!==0)enterDoor(nameAt[String(look)])});
 }
 function enterDoor(name){
  if(doorBusy)return;doorBusy=true;buzz(14);hideToast();stopPeek();clearTimeout(previewTimer);
  root.classList.add('m-choosing');setPreview(name);
  if(calm){setTimeout(()=>showSheet(name),160);return}
  const spot=spots[name],door=buttons[name].getBoundingClientRect();
  board.style.transformOrigin=spot.x.toFixed(1)+'px '+spot.y.toFixed(1)+'px';
  // The doorway fills the screen: its height on screen decides how far to move in.
  const target=clamp(innerHeight/Math.max(80,door.height)*1.05,1.8,3.4);
  camTween({z:target},980,easeInOut);
  setTimeout(()=>showSheet(name),700);
 }
 function showSheet(name){
  const sheet=sheets[name];openName=name;sheet.hidden=false;root.classList.add('m-sheet-open','m-locked');
  sheet.querySelector('.m-sheet-scroll').scrollTop=0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-open')));
  setTimeout(()=>{sheet.querySelector('.m-sheet-close').focus({preventScroll:true})},500);
  doorBusy=false;
 }
 function leaveDoor(){camTween({z:1},calm?0:620,easeOut,()=>{board.style.transformOrigin='50% 50%';paint()});root.classList.remove('m-choosing')}
 function closeSheet(afterId){
  if(!openName)return;const name=openName,sheet=sheets[name];openName='';
  sheet.style.transition='';sheet.style.transform='';sheet.classList.remove('is-open');root.classList.remove('m-sheet-open');
  leaveDoor();
  setTimeout(()=>{sheet.hidden=true;root.classList.remove('m-locked');if(afterId){go(afterId)}else if(buttons[name]){buttons[name].focus({preventScroll:true})}},calm?380:640);
 }
 function switchSheet(name){
  const current=openName,sheet=sheets[current];sheet.classList.remove('is-open');openName='';
  setTimeout(()=>{
   sheet.hidden=true;look=lookOf[name];root.dataset.hallLook=String(look);hall.dataset.look=String(look);
   $$('.m-pager button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.look)===look)));
   enter.querySelector('.m-enter-name').textContent=doorInfo[name][0];enter.querySelector('.m-enter-sub').textContent=doorInfo[name][1];
   const spot=spots[name],door=buttons[name].getBoundingClientRect();
   board.style.transformOrigin=spot.x.toFixed(1)+'px '+spot.y.toFixed(1)+'px';
   camX=cameraAt(look);camY=-34;zoom=1;paint();setPreview(name);
   showSheet(name);
  },calm?220:460);
 }
 // First visit: the view drifts a little to each side so the visitor sees that it can turn.
 function stopPeek(){peekId+=1;if(nudge!==0){nudge=0;if(board)paint()}}
 function peek(){
  if(!board)return;if(calm)return;if(recall('ee-peek'))return;remember('ee-peek','1');
  const id=++peekId,start=performance.now();
  function tick(now){
   if(id!==peekId)return;
   const t=Math.min(1,(now-start)/2400);nudge=Math.sin(t*Math.PI*2)*38*(1-t*.35);paint();
   if(t<1){requestAnimationFrame(tick)}else{nudge=0;paint()}
  }
  requestAnimationFrame(tick);
 }
 $$('.m-sheet').forEach(sheet=>{
  sheet.querySelector('.m-sheet-close').addEventListener('click',()=>closeSheet());
  sheet.addEventListener('click',event=>{
   const other=event.target.closest('[data-other]'),goButton=event.target.closest('[data-sheet-go]');
   if(other)switchSheet(other.dataset.other);
   if(goButton)closeSheet(goButton.dataset.sheetGo);
  });
  // Pull the picture down to put the door back.
  const hero=sheet.querySelector('.m-sheet-hero');let pull=null;
  hero.style.touchAction='none';
  hero.addEventListener('pointerdown',event=>{pull={id:event.pointerId,y:event.clientY,dy:0};try{hero.setPointerCapture(event.pointerId)}catch(error){}sheet.style.transition='none'});
  hero.addEventListener('pointermove',event=>{if(!pull)return;if(event.pointerId!==pull.id)return;pull.dy=Math.max(0,event.clientY-pull.y);sheet.style.transform='translate3d(0,'+(pull.dy*.92).toFixed(1)+'px,0)'});
  const release=event=>{if(!pull)return;if(event.pointerId!==pull.id)return;const distance=pull.dy;pull=null;sheet.style.transition='';if(distance>110){closeSheet()}else{sheet.style.transform=''}};
  hero.addEventListener('pointerup',release);hero.addEventListener('pointercancel',release);
 });
 root.dataset.hallLook='0';hall.dataset.look='0';
 layout();addEventListener('resize',layout,{passive:true});

 // ---------- 3. keys, dock, reveal ----------
 let found=[];try{found=JSON.parse(recall('ee-keys')||'[]')}catch(error){found=[]}
 function refreshKeys(){keyCounter.textContent=String(found.length);$$('.m-key').forEach(key=>{key.hidden=found.indexOf(Number(key.dataset.key))>=0})}
 function collect(key){
  const id=Number(key.dataset.key);if(found.indexOf(id)>=0)return;
  found.push(id);remember('ee-keys',JSON.stringify(found));buzz([12,34,12]);
  const from=key.getBoundingClientRect(),to=keysButton.getBoundingClientRect();
  const fly=document.createElement('div');fly.className='m-fly';fly.innerHTML='<svg aria-hidden="true"><use href="#m-key"/></svg>';document.body.append(fly);
  const startAt='translate3d('+(from.left+from.width/2-13).toFixed(1)+'px,'+(from.top+from.height/2-13).toFixed(1)+'px,0) scale(1.5) rotate(-24deg)';
  const endAt='translate3d('+(to.left+to.width/2-13).toFixed(1)+'px,'+(to.top+to.height/2-13).toFixed(1)+'px,0) scale(.8) rotate(30deg)';
  const flight=fly.animate([{transform:startAt},{transform:endAt}],{duration:calm?1:680,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'});
  key.hidden=true;
  flight.onfinish=()=>{
   fly.remove();keyCounter.textContent=String(found.length);keysButton.classList.remove('pop');void keysButton.offsetWidth;keysButton.classList.add('pop');
   if(found.length>=TOTAL_KEYS){celebrate()}else{say('Clé trouvée · '+found.length+' sur '+TOTAL_KEYS,{ms:2600})}
  };
 }
 function celebrate(){
  hideToast();win.hidden=false;root.classList.add('m-win-open','m-locked');
  setTimeout(()=>win.querySelector('.m-cta').focus({preventScroll:true}),300);
  if(calm)return;
  const colors=['#f2a65a','#62e4f5','#f6efe2','#dcb77f'];
  for(let i=0;i<26;i++){
   const spark=document.createElement('i');spark.className='m-spark';spark.style.background=colors[i%colors.length];document.body.append(spark);
   const angle=Math.random()*Math.PI*2,distance=90+Math.random()*190,cx=innerWidth/2,cy=innerHeight*.4;
   const animation=spark.animate([{transform:'translate3d('+cx+'px,'+cy+'px,0) scale(1)',opacity:1},{transform:'translate3d('+(cx+Math.cos(angle)*distance)+'px,'+(cy+Math.sin(angle)*distance+120)+'px,0) scale(.3)',opacity:0}],{duration:1100+Math.random()*700,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
   animation.onfinish=()=>spark.remove();
  }
  buzz([20,50,20,50,60]);
 }
 function closeWin(){win.hidden=true;root.classList.remove('m-win-open','m-locked')}
 win.addEventListener('click',event=>{if(event.target.closest('[data-close]'))closeWin()});
 app.addEventListener('click',event=>{const key=event.target.closest('.m-key');if(key)collect(key)});
 keysButton.addEventListener('click',()=>{const left=TOTAL_KEYS-found.length;say(left>0?'Il reste '+left+' clé'+(left>1?'s':'')+' cachée'+(left>1?'s':'')+' dans le vestibule.':'Vous avez toutes les clés. Bravo !',{ms:3600})});
 refreshKeys();

 app.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#m-"]');
  if(link){event.preventDefault();go(link.getAttribute('href').slice(1))}
  const action=event.target.closest('[data-act]');
  if(!action)return;
  if(action.dataset.act==='replay')showGate();
  if(action.dataset.act==='motion')setCalm(!calm,true);
  if(action.dataset.act==='keys'){found=[];remember('ee-keys','[]');refreshKeys();say('Les 5 clés sont de nouveau cachées.',{ms:2600})}
 });
 const motionButton=$('[data-act="motion"]');
 function setCalm(value,save){calm=value;app.dataset.motion=calm?'calm':'full';if(save)remember('ee-motion',calm?'calm':'full');motionButton.textContent=calm?'Animations · calmes':'Animations · complètes'}
 setCalm(calm,false);

 const dockLinks=$$('.m-dock a[data-dock]');

 if(variant){
  $$('.m-reveal').forEach(element=>element.classList.add('in'));
 }else if('IntersectionObserver' in window){
  const spy=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const name=entry.target.dataset.dock;dockLinks.forEach(link=>link.setAttribute('aria-current',String(link.dataset.dock===name)))}})},{rootMargin:'-42% 0px -52% 0px'});
  $$('.m-hall,.m-sec').forEach(section=>spy.observe(section));
  const reveal=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');reveal.unobserve(entry.target)}})},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
  $$('.m-reveal').forEach(element=>reveal.observe(element));
 }else{
  $$('.m-reveal').forEach(element=>element.classList.add('in'));
 }

 // Price counts up instead of jumping. The figure itself is still computed from the price table by traversee.js.
 const priceNode=$('[data-price]');let lastPrice=priceNode?Number(priceNode.textContent):0;
 $$('[data-players]').forEach(button=>button.addEventListener('click',()=>{
  if(!priceNode)return;const target=Number(priceNode.textContent);if(calm||target===lastPrice){lastPrice=target;return}
  const from=lastPrice;lastPrice=target;tween(from,target,380,easeOut,value=>{priceNode.textContent=String(Math.round(value))},()=>{priceNode.textContent=String(target)});
 }));

 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  if(!win.hidden){closeWin();return}
  if(openName)closeSheet();
 });

 // ---------- a little depth when the phone tilts (optional, silent) ----------
 let tiltOn=false,tiltBase=null,tiltQueued=false,tiltX=0,tiltY=0;
 function onTilt(event){
  if(calm)return;if(!Number.isFinite(event.gamma))return;if(!Number.isFinite(event.beta))return;
  if(tiltBase===null)tiltBase={g:event.gamma,b:event.beta};
  tiltX=clamp((event.gamma-tiltBase.g)/22,-1,1);tiltY=clamp((event.beta-tiltBase.b)/22,-1,1);
  if(tiltQueued)return;tiltQueued=true;
  requestAnimationFrame(()=>{tiltQueued=false;hall.style.setProperty('--tx',tiltX.toFixed(3));hall.style.setProperty('--ty',tiltY.toFixed(3));if(board)board.style.translate=(-tiltX*9).toFixed(1)+'px '+(-tiltY*5).toFixed(1)+'px'});
 }
 function startTilt(){
  if(tiltOn)return;if(calm)return;if(!('DeviceOrientationEvent' in window))return;if(!isSecureContext)return;
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
   DeviceOrientationEvent.requestPermission().then(state=>{if(state==='granted'){tiltOn=true;addEventListener('deviceorientation',onTilt)}}).catch(()=>{});
   return;
  }
  tiltOn=true;addEventListener('deviceorientation',onTilt);
 }

 // ---------- go ----------
 paintGate(0);
 if(recall('ee-skip-gate')==='1'){remember('ee-skip-gate','0');gate.hidden=true;root.classList.remove('m-locked');setPhase('page')}
 if(calmQuery.matches)if(recall('ee-motion')===null){
  say('Votre téléphone limite les animations : les passages se font en douceur, sans zoom.',{top:true,ms:12000,action:'Tout voir',onAction:()=>setCalm(false,true)});
 }
 root.classList.add('m-ready');
 window.eeMobile={app:app,root:root,variant:variant,hall:hall,dockLinks:dockLinks,buzz:buzz,say:say,tween:tween,easeOut:easeOut,remember:remember,recall:recall,go:go,setGoHook:fn=>{goHook=fn},isCalm:()=>calm};
})();
