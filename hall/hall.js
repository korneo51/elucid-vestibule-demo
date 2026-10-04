(() => {
 const root=document.getElementById('ee-home'), lobby=root.querySelector('.lobby'), inside=root.querySelector('.inside'), wipe=root.querySelector('.wipe');
 const labels={accueil:'Le hall',rouages:'Les Rouages de l’Apocalypse',cybertrax:'CybertraX',tarifs:'Votre visite · Tarifs',faq:'Les réponses · FAQ',cadeaux:'Carte cadeau',avis:'Les avis',ensemble:'Venir ensemble',contact:'Contact'};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let current='',busy=false,upward=0,upTimer=0,enteredAt=0;
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function resetExit(){upward=0;root.style.setProperty('--exit-progress','0');}
 function render(key){root.querySelectorAll('[data-page]').forEach(el=>el.hidden=el.dataset.page!==key);inside.hidden=key==='accueil';root.querySelector('#current-label').textContent=labels[key];root.querySelectorAll('.topbar [data-route]').forEach(a=>a.dataset.route===key?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));current=key;enteredAt=performance.now();resetExit();window.scrollTo(0,0);document.title=`${labels[key]} — Elucid · Maquette`;}
 async function leaveRoom(){
  const destination=current;
  const snapshot=document.createElement('div');snapshot.className='return-view';snapshot.append(root.querySelector('.topbar').cloneNode(true),inside.cloneNode(true));snapshot.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  const out=inside.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.98)'}],{duration:140,fill:'forwards'});await out.finished;
  render('accueil');out.cancel();
  const door=lobby.querySelector(`.passage[data-route="${destination}"] .door-frame`);
  if(!door){await lobby.animate([{opacity:0,transform:'scale(1.12)'},{opacity:1,transform:'scale(1)'}],{duration:480,easing:'cubic-bezier(.2,.7,.2,1)'}).finished;return;}
  const r=door.getBoundingClientRect(),clone=door.cloneNode(true);clone.classList.add('travel-door','returning-door');clone.setAttribute('aria-hidden','true');
  Object.assign(clone.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
  const scale=Math.max(innerWidth/r.width,innerHeight/r.height)*1.25,dx=innerWidth/2-(r.left+r.width/2),dy=innerHeight/2-(r.top+r.height/2);
  Object.assign(snapshot.style,{width:`${innerWidth}px`,height:`${innerHeight}px`,transform:`translate(-50%,-50%) scale(${1/scale})`});
  const view=clone.querySelector('.door-view');view.className='door-view return-interior';view.replaceChildren(snapshot);
  clone.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`;
  clone.querySelectorAll('.leaf').forEach((leaf,i)=>leaf.style.transform=`translateX(${i?105:-105}%)`);clone.querySelector('.seal').style.opacity='0';root.appendChild(clone);
  const retreat=clone.animate([{transform:clone.style.transform},{transform:'translate(0,0) scale(1)'}],{duration:730,fill:'forwards',easing:'cubic-bezier(.2,.65,.25,1)'});
  clone.querySelectorAll('.leaf').forEach((leaf,i)=>leaf.animate([{transform:`translateX(${i?105:-105}%)`},{transform:'translateX(0)'}],{duration:310,delay:470,fill:'forwards',easing:'ease-out'}));
  const seal=clone.querySelector('.seal').animate([{opacity:0,transform:'rotate(90deg)'},{opacity:1,transform:'rotate(0)'}],{duration:220,delay:610,fill:'forwards'});
  await Promise.all([retreat.finished,seal.finished]);clone.remove();
 }
 async function go(key,frame,push=true){
  if(!labels[key])key='accueil';if(busy||key===current)return;busy=true;document.body.classList.add('busy');
  if(push)history.pushState({page:key},'',`#${key}`);
  try{
   if(reduced.matches){render(key)}
   else if(key==='accueil'){await leaveRoom()}
   else if(frame&&current==='accueil'){
    const r=frame.getBoundingClientRect(),clone=frame.cloneNode(true);clone.classList.add('travel-door');clone.setAttribute('aria-hidden','true');Object.assign(clone.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});root.appendChild(clone);
    const scale=Math.max(innerWidth/r.width,innerHeight/r.height)*1.25,dx=innerWidth/2-(r.left+r.width/2),dy=innerHeight/2-(r.top+r.height/2);
    clone.querySelector('.seal').animate([{transform:'rotate(0)',opacity:1},{transform:'rotate(90deg)',opacity:0}],{duration:260,fill:'forwards'});
    clone.querySelectorAll('.leaf').forEach((leaf,i)=>leaf.animate([{transform:'translateX(0)'},{transform:`translateX(${i?105:-105}%)`}],{duration:400,delay:110,fill:'forwards',easing:'cubic-bezier(.3,0,.2,1)'}));
    const travel=clone.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx}px,${dy}px) scale(${scale})`}],{duration:730,delay:80,fill:'forwards',easing:'cubic-bezier(.5,0,.2,1)'});
    await sleep(430);render(key);await travel.finished;await clone.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).finished;clone.remove();
   }else{
    wipe.style.visibility='visible';const leaves=[...wipe.children].slice(0,2);const close=leaves.map((el,i)=>el.animate([{transform:`translateX(${i?100:-100}%)`},{transform:'translateX(0)'}],{duration:190,fill:'forwards',easing:'ease-in'}));await Promise.all(close.map(a=>a.finished));render(key);await Promise.all(leaves.map((el,i)=>el.animate([{transform:'translateX(0)'},{transform:`translateX(${i?100:-100}%)`}],{duration:260,fill:'forwards',easing:'ease-out'}).finished));wipe.style.visibility='hidden';
   }
   const title=key==='accueil'?lobby.querySelector('h1'):root.querySelector(`[data-page="${key}"] h2,[data-page="${key}"] h3`);if(title){title.tabIndex=-1;title.focus({preventScroll:true})}
  }finally{busy=false;enteredAt=performance.now();document.body.classList.remove('busy')}
 }
 // A deliberate upward gesture at the top exits; ordinary reading scroll stays native.
 window.addEventListener('wheel',e=>{
  if(current==='accueil'||busy||e.ctrlKey||performance.now()-enteredAt<650)return;
  if(scrollY>2||e.deltaY>=0){resetExit();return;}
  e.preventDefault();clearTimeout(upTimer);
  upward+=Math.abs(e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  root.style.setProperty('--exit-progress',String(Math.min(1,upward/220)));
  if(upward>=220){resetExit();go('accueil',null)}else upTimer=setTimeout(resetExit,420);
 },{passive:false});
 root.addEventListener('click',e=>{const a=e.target.closest('[data-route]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();go(a.dataset.route,a.classList.contains('passage')?a.querySelector('.door-frame'):null)});
 const aliases={'ee-contact':'contact','ee-top':'accueil','ee-faq':'faq'};
 root.querySelectorAll('a[href^="#ee-"]').forEach(a=>{const key=aliases[a.hash.slice(1)];if(key){a.href=`#${key}`;a.dataset.route=key}});
 root.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener'});
 window.addEventListener('popstate',()=>go(location.hash.slice(1)||'accueil',null,false));
 window.addEventListener('hashchange',()=>{if(!busy)go(location.hash.slice(1)||'accueil',null,false)});
 const prices={2:[75,'la session',75],3:[28,'/ personne',84],4:[24,'/ personne',96],5:[20,'/ personne',100],6:[20,'/ personne',120]};
 root.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.players),p=prices[n];root.querySelector('[data-price]').textContent=p[0];root.querySelector('[data-price-unit]').textContent=p[1];root.querySelector('[data-total]').textContent=`${p[2]} € la session pour ${n} joueurs`;root.querySelectorAll('[data-players]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
 const reviews=[...root.querySelectorAll('.ee-review')];let review=0;function showReview(){reviews.forEach((el,i)=>el.hidden=i!==review);root.querySelector('.ee-review-count').textContent=`${String(review+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')}`}
 root.querySelector('.ee-review-controls').hidden=false;root.querySelectorAll('[data-review-step]').forEach(b=>b.addEventListener('click',()=>{review=(review+Number(b.dataset.reviewStep)+reviews.length)%reviews.length;showReview()}));showReview();
 render(labels[location.hash.slice(1)]?location.hash.slice(1):'accueil');
})();
