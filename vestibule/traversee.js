(() => {
 'use strict';
 const journey=document.querySelector('.journey'),viewport=document.querySelector('.viewport'),worlds=[...document.querySelectorAll('.world')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const refs=worlds.map(w=>({w,wall:w.querySelector('.wall'),door:w.querySelector('.threshold'),copy:w.querySelector('.scene-copy'),left:w.querySelector('.leaf.left'),right:w.querySelector('.leaf.right'),lock:w.querySelector('.mechanism')}));
 const clamp=v=>Math.max(0,Math.min(1,v));const ramp=(p,a,b)=>clamp((p-a)/(b-a));const ease=t=>t*t*(3-2*t);
 let step=600,hold=390,origin=0,requested=false,geometry=[],lastLabel=-1,hallFrame=null,hallClip='',hallLook=0,hallLookShown=0,drag=null,lastSwipe=0,previewTimer=null,sensorEnabled=false;
 const label=document.getElementById('route-label'),next=document.getElementById('route-next'),meter=document.querySelector('.route-line i'),progress=document.querySelector('.scroll-progress i');
 // Door/interior share the cutaway aperture; signs have explicit anchors above each lintel.
 const hall=document.querySelector('.layered-hall'),artboard=hall.querySelector('.hall-artboard'),artW=+hall.dataset.artWidth,artH=+hall.dataset.artHeight;
 const hint=hall.querySelector('.mobile-pan-hint'),tiltButton=hall.querySelector('.tilt-control');
 const roomDoors=[...hall.querySelectorAll('.side-access .room-link')];
 const portals=[...document.querySelectorAll('[data-project]')];
 function roomFrame(W,H){const s=W<=760?Math.max(W/artW,H*.9/artH):Math.min(W/artW,H/artH);return {width:artW*s,height:artH*s,x:(W-artW*s)/2,y:(H-artH*s)/2}}
 function fitPortals(W,H){
  const frame=roomFrame(W,H);
  hallFrame=frame;
  artboard.style.setProperty('--art-scale',frame.width/artW);
  Object.assign(artboard.style,{left:`${frame.x}px`,top:`${frame.y}px`,width:`${frame.width}px`,height:`${frame.height}px`});
  portals.forEach(el=>{
   const target=JSON.parse(el.dataset.corners).map(([x,y])=>[x*frame.width/artW,y*frame.height/artH]);
   const sw=+el.dataset.sourceWidth||360,sh=+el.dataset.sourceHeight||540;
   const source=[[0,0],[sw,0],[sw,sh],[0,sh]],m=[];
   source.forEach(([x,y],i)=>{const [u,v]=target[i];m.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v])});
   for(let c=0;c<8;c++){
    let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(m[r][c])>Math.abs(m[pivot][c]))pivot=r;
    [m[c],m[pivot]]=[m[pivot],m[c]];const d=m[c][c];for(let k=c;k<9;k++)m[c][k]/=d;
    for(let r=0;r<8;r++)if(r!==c){const f=m[r][c];for(let k=c;k<9;k++)m[r][k]-=f*m[c][k]}
   }
   const [a,b,c,d,e,f,g,h]=m.map(row=>row[8]);
   el.style.transform=`matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
  });
 }
 function measure(){
  const W=viewport.clientWidth,H=innerHeight;step=Math.min(760,Math.max(480,H*(W<=760?.76:.85)));hold=Math.round(step*(W<=760?1.15:.68));origin=journey.getBoundingClientRect().top+scrollY;
  fitPortals(W,H);
  journey.style.height=`${H+step*2+hold}px`;
  geometry=refs.map((r,i)=>{
   if(!r.door)return null;
   const frame=i===1?roomFrame(W,H):{width:W,height:H,x:0,y:0};
   const mobileFoyer=i===0?W<=760:false;
   const cx=mobileFoyer?W*.69:frame.x+frame.width*Number(r.w.dataset.x),cy=mobileFoyer?H*.25:frame.y+frame.height*Number(r.w.dataset.y),dw=mobileFoyer?W*.58:frame.width*Number(r.w.dataset.w),dh=mobileFoyer?H*.28:frame.height*Number(r.w.dataset.h),x=cx-dw/2,y=cy-dh/2;
   Object.assign(r.door.style,{left:`${x}px`,top:`${y}px`,width:`${dw}px`,height:`${dh}px`});
   r.w.style.transformOrigin=`${cx}px ${cy}px`;
   // Fixed aperture cut once per resize. Only the whole wall transforms during scroll.
   r.wall.style.clipPath=`polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x}px ${y}px, ${x+dw}px ${y}px, ${x+dw}px ${y+dh}px, ${x}px ${y+dh}px, ${x}px ${y}px)`;
   if(i===1)hallClip=r.wall.style.clipPath;
   return {cx,cy,x,y,dw,dh,W,H,max:Math.max(W/dw,H/dh)*1.08};
  });schedule();
 }
 function draw(){
  // Scroll and swipe remain user-controlled even when the device reduces automatic motion.
  requested=false;
  const travelled=scrollY-origin;
  // Vertical scrolling crosses doors; horizontal touch only changes where the visitor looks.
  const p=travelled<step?clamp(travelled/step):travelled<step+hold?1:1+clamp((travelled-step-hold)/step);
  viewport.classList.toggle('is-hall',p>=1?p<1.7:false);
  document.documentElement.classList.toggle('header-solid',p>=1.9);
  const atHall=travelled>=step?travelled<step+hold:false;
  hall.classList.toggle('look-active',atHall);
  hall.classList.toggle('cue-active',p>=1?p<1.55:false);
  if(!atHall)clearPreview();
  if(viewport.clientWidth<=760){
   const W=viewport.clientWidth,leftX=-12,rightX=W-hallFrame.width+12,centerX=hallFrame.x;
   const returnToCenter=1-ease(ramp(p,1,1.18));
   const motionMode=document.documentElement.dataset.eeMotion||'fluid';
   const lookFactor=motionMode==='slow'?.075:motionMode==='reduced'?.5:.14;
   hallLookShown+= (hallLook-hallLookShown)*lookFactor;
   if(Math.abs(hallLook-hallLookShown)>.003)schedule();else hallLookShown=hallLook;
   const look=hallLookShown*returnToCenter;
   const cameraX=look<0?centerX+(leftX-centerX)*-look:centerX+(rightX-centerX)*look;
   const offset=cameraX-centerX,{x,y,dw,dh}=geometry[1],apertureX=x+offset;
   artboard.style.transform=`translateX(${offset.toFixed(2)}px)`;
   refs[1].door.style.transform=`translateX(${offset.toFixed(2)}px)`;
   refs[1].door.style.visibility='visible';
   refs[1].wall.style.clipPath=`polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${apertureX}px ${y}px, ${apertureX+dw}px ${y}px, ${apertureX+dw}px ${y+dh}px, ${apertureX}px ${y+dh}px, ${apertureX}px ${y}px)`;
  }else{artboard.style.transform='';refs[1].door.style.transform='';refs[1].door.style.visibility='visible';refs[1].wall.style.clipPath=hallClip}
  refs.forEach((r,i)=>{
   const raw=clamp(p-i),local=i===1?ramp(raw,.28,1):raw,g=geometry[i];
   r.w.style.visibility=(i<2?p>=i+1:false)?'hidden':'visible';
   r.w.inert=i===1?(p<.99||p>1.65):false;
   const appear=i===0?1:ease(ramp(p,i-.12,i+.02));
   const fade=i===2?1:1-ease(ramp(local,.16,.59));r.copy.style.opacity=(appear*fade).toFixed(4);
   if(!g)return;
   const travel=ease(ramp(local,.27,1));
   // Perspective-like acceleration, ending only when the open aperture covers the screen.
   const scale=1/(1-travel*(1-1/g.max));
   r.w.style.transform=`translate(${((g.W/2-g.cx)*travel).toFixed(2)}px,${((g.H/2-g.cy)*travel).toFixed(2)}px) scale(${scale.toFixed(5)})`;
   const opening=ease(ramp(local,.12,.47));
   r.left.style.transform=`translateX(${-opening*101}%)`;r.right.style.transform=`translateX(${opening*101}%)`;
   r.lock.style.transform=`rotate(${ease(ramp(local,.01,.18))*90}deg)`;r.lock.style.opacity=(1-ease(ramp(local,.10,.25))).toFixed(4);
  });
  progress.style.transform=`scaleY(${p/2})`;meter.style.transform=`scaleX(${p/2})`;
 const index=Math.min(2,Math.floor(p+.005));if(index!==lastLabel){label.textContent=['L’ENTRÉE','','PRÉPARER VOTRE VISITE'][index];next.textContent=['Faites défiler · poussez la première porte','','Tarifs, questions et cadeaux · continuez ↓'][index];lastLabel=index;}
 }
 function schedule(){if(!requested){requested=true;requestAnimationFrame(draw)}}
 function mode(){measure()}
 function clearPreview(){clearTimeout(previewTimer);previewTimer=null;roomDoors.forEach(door=>door.classList.remove('is-preview'))}
 function lookAt(side){
  hall.dataset.look=side;
  hallLook=side;clearPreview();schedule();
  hint.querySelector('span').textContent=side?'TOUCHEZ LA PORTE POUR ENTRER':sensorEnabled?'BOUGEZ LE TÉLÉPHONE OU GLISSEZ':'← GLISSEZ POUR REGARDER →';
  hint.querySelector('small').textContent=side?'OU DESCENDEZ ↓':'PUIS DESCENDEZ ↓';
  if(!side)return;
  previewTimer=setTimeout(()=>{
   if(!hall.classList.contains('look-active'))return;
   if(document.querySelector('.room-dialog[open]'))return;
   const door=hall.querySelector(side<0?'.side-access.antique .room-link':'.side-access.laboratory .room-link');
   door.classList.add('is-preview');
  },500);
 }
 document.addEventListener('hall-look',e=>lookAt(Number(e.detail)));
 document.addEventListener('hall-sensor-status',e=>{sensorEnabled=Boolean(e.detail);if(Number(hall.dataset.look||0)===0)lookAt(0)});
 // A horizontal gesture pans the existing lightweight set; vertical gestures remain native scroll.
 viewport.addEventListener('pointerdown',e=>{
  if(!['touch','mouse'].includes(e.pointerType)||viewport.clientWidth>760||!hall.classList.contains('look-active')||document.querySelector('.room-dialog[open]'))return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,look:hallLook,active:false};
 });
 viewport.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.active){if(Math.abs(dy)>12){if(Math.abs(dy)>Math.abs(dx)){drag=null;return}}if(Math.abs(dx)<10||Math.abs(dx)<=Math.abs(dy)*1.25)return;drag.active=true;clearPreview();viewport.setPointerCapture(e.pointerId)}
  hallLook=Math.max(-1,Math.min(1,drag.look-dx/48));
  schedule();
 });
 function endLook(e){
  if(!drag)return;if(e.pointerId!==drag.id)return;
  if(drag.active){
   lastSwipe=performance.now();
   if(e.type==='pointerup'){const dx=e.clientX-drag.x;lookAt(Math.max(-1,Math.min(1,Math.round(drag.look)+(Math.abs(dx)>=24?(dx<0?1:-1):0))))}
  }
  drag=null;
 }
 viewport.addEventListener('pointerup',endLook);viewport.addEventListener('pointercancel',endLook);
 viewport.addEventListener('click',e=>{if(!e.detail)return;if(performance.now()-lastSwipe<250){e.preventDefault();e.stopPropagation()}},true);
 // Orientation and two-axis parallax are coordinated by mobile-corridor.js.
 // Fetch each room illustration only when its portal is explored.
 function prepareRoom(button){const dialog=document.getElementById(`dialog-${button.dataset.room}`),image=dialog.querySelector('.dialog-art img');if(!image.getAttribute('src'))image.src=image.dataset.src;return dialog}
 document.querySelectorAll('[data-room]').forEach(button=>{
  button.addEventListener('pointerenter',()=>prepareRoom(button),{once:true});
  button.addEventListener('focus',()=>prepareRoom(button),{once:true});
  button.addEventListener('click',()=>prepareRoom(button).showModal());
 });
 document.querySelectorAll('.portal-cue').forEach(cue=>{
  const door=hall.querySelector(`.side-access.${cue.classList.contains('antique')?'antique':'laboratory'} .room-link`);
  cue.addEventListener('pointerenter',()=>door.classList.add('is-preview'));
  cue.addEventListener('pointerleave',()=>door.classList.remove('is-preview'));
  cue.addEventListener('focus',()=>door.classList.add('is-preview'));
  cue.addEventListener('blur',()=>door.classList.remove('is-preview'));
 });
 document.querySelectorAll('.room-dialog').forEach(dialog=>{
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
 });
 document.querySelectorAll('[data-stop]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const n=Number(a.dataset.stop);scrollTo({top:origin+(n===1?step+Math.min(60,hold*.25):n===2?step*2+hold:0),behavior:reduced.matches?'auto':'smooth'})}));
 document.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener'});
 // Single source of truth for prices: the table in the page. Selector, unit price and session total are derived from it.
 const prices={};
 document.querySelectorAll('.ee-price-details tbody tr').forEach(row=>{const n=parseInt(row.querySelector('th').textContent,10),cell=row.querySelector('td'),unit=cell.querySelector('span').textContent.trim(),amount=parseFloat(cell.firstChild.textContent);prices[n]=[amount,unit,unit.indexOf('personne')<0?amount:amount*n]});
 function showPrice(n){const p=prices[n];if(!p)return;document.querySelector('[data-price]').textContent=p[0];document.querySelector('[data-price-unit]').textContent=p[1];document.querySelector('[data-total]').textContent=`${p[2]} € la session pour ${n} joueurs`;document.querySelectorAll('[data-players]').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.players===n)))}
 document.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>showPrice(+b.dataset.players)));
 const pricePreset=document.querySelector('[data-players][aria-pressed="true"]');showPrice(pricePreset?+pricePreset.dataset.players:4);
 const reviews=[...document.querySelectorAll('.ee-review')];let review=0;function showReview(){reviews.forEach((r,i)=>r.hidden=i!==review);document.querySelector('.ee-review-count').textContent=`${String(review+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')}`}
 document.querySelector('.ee-review-controls').hidden=false;document.querySelectorAll('[data-review-step]').forEach(b=>b.addEventListener('click',()=>{review=(review+Number(b.dataset.reviewStep)+reviews.length)%reviews.length;showReview()}));showReview();
 // On phones the page is rebuilt by mobile.js (html.m-boot): the scroll-driven journey below is not started, prices and reviews above still are.
 if(!document.documentElement.classList.contains('m-boot')){document.documentElement.classList.add('motion');window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure,{passive:true});reduced.addEventListener('change',mode);mode()}
})();
