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
  if(!recall('ee-key-hint')){remember('ee-key-hint','1');setTimeout(()=>say('Psst… 5 clés sont cachées dans le vestibule. Les trouverez-vous ?',{ms:6000}),900)}
 }
 function showGate(){
  hideToast();gate.hidden=false;gate.classList.remove('is-open','is-fading');door.style.transition='none';door.style.transform='';
  gateP=0;paintGate(0);thumb.style.animation='none';void thumb.offsetWidth;thumb.style.animation='';unlocking=false;
  root.classList.add('m-locked');setPhase('gate');window.scrollTo(0,0);
 }
 function skipGate(){
  if(unlocking)return;unlocking=true;gate.classList.add('is-fading');setPhase('page');root.classList.remove('m-locked');go('m-tarifs',true);
  setTimeout(()=>{gate.hidden=true;unlocking=false},600);
 }
 skip.addEventListener('click',skipGate);
 const skipLink=document.querySelector('.skip-link');
 if(skipLink)skipLink.addEventListener('click',event=>{event.preventDefault();if(gate.hidden){go('m-tarifs')}else{skipGate()}});

 // ---------- 2. the hall: push a door ----------
 const doors={rouages:$('.m-door.rouages'),cybertrax:$('.m-door.cybertrax')},sheets={rouages:$('[data-sheet="rouages"]'),cybertrax:$('[data-sheet="cybertrax"]')};
 let openName='',doorBusy=false;
 function openDoor(name){
  if(doorBusy)return;doorBusy=true;buzz(14);hideToast();
  root.classList.add('m-choosing');doors[name].classList.add('is-open');
  setTimeout(()=>showSheet(name),calm?140:660);
 }
 function showSheet(name){
  const sheet=sheets[name];openName=name;sheet.hidden=false;root.classList.add('m-sheet-open','m-locked');
  sheet.querySelector('.m-sheet-scroll').scrollTop=0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-open')));
  setTimeout(()=>{sheet.querySelector('.m-sheet-close').focus({preventScroll:true})},500);
  doorBusy=false;
 }
 function closeSheet(afterId){
  if(!openName)return;const name=openName,sheet=sheets[name];openName='';
  sheet.style.transition='';sheet.style.transform='';sheet.classList.remove('is-open');root.classList.remove('m-sheet-open');
  doors[name].classList.remove('is-open');root.classList.remove('m-choosing');
  setTimeout(()=>{sheet.hidden=true;root.classList.remove('m-locked');if(afterId){go(afterId)}else{doors[name].focus({preventScroll:true})}},calm?380:640);
 }
 function switchSheet(name){
  const current=openName,sheet=sheets[current];sheet.classList.remove('is-open');doors[current].classList.remove('is-open');openName='';
  setTimeout(()=>{sheet.hidden=true;doors[name].classList.add('is-open');showSheet(name)},calm?220:460);
 }
 $$('.m-door').forEach(button=>button.addEventListener('click',()=>openDoor(button.dataset.door)));
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
  requestAnimationFrame(()=>{tiltQueued=false;hall.style.setProperty('--tx',tiltX.toFixed(3));hall.style.setProperty('--ty',tiltY.toFixed(3))});
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
