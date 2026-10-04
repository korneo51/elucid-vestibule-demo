(() => {
  'use strict';
  const root = document.getElementById('passages');
  const journey = root.querySelector('.journey');
  const get = s => root.querySelector(s);
  const gateOne = get('.gateway-one'), gateTwo = get('.gateway-two');
  const sceneOne = get('.scene-one'), sceneTwo = get('.scene-two');
  const copyOne = get('.scene-one .room-copy'), copyTwo = get('.scene-two .room-copy');
  const intro = get('.intro'), foyer = get('.foyer'), veil = get('.next-veil');
  const nextCopy = get('.next-copy'), photo = get('.room-photo');
  const progress = get('.progress-track > div'), cue = get('#cue-text');
  const chapters = [...root.querySelectorAll('.chapter-nav button')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:760px)');
  let distance = 1, origin = 0, pending = false, lastChapter = -1;
  const clamp = n => Math.max(0,Math.min(1,n));
  const ramp = (p,a,b) => clamp((p-a)/(b-a));
  const ease = n => n*n*(3-2*n);
  const fade = (p,a,b,c,d) => ease(ramp(p,a,b)) * (1-ease(ramp(p,c,d)));
  function opacity(el,v) { el.style.opacity = v.toFixed(4); }
  function interactive(el,v) { el.inert = v < .15; el.style.pointerEvents = v < .15 ? 'none' : 'auto'; }
  function gate(el, p, start, end, unlockA, unlockB, openA, openB) {
    const travel = ease(ramp(p,start,end));
    const opening = ease(ramp(p,openA,openB));
    el.style.setProperty('--open',opening.toFixed(4));
    el.style.setProperty('--turn',`${(ease(ramp(p,unlockA,unlockB))*90).toFixed(2)}deg`);
    el.style.transform = `translate(-50%,-50%) translate(${(-travel*(mobile.matches?7:17)).toFixed(3)}vw,${(travel*(mobile.matches?-9:3)).toFixed(3)}svh) scale(${(1+travel*(mobile.matches?5.3:4.4)).toFixed(4)})`;
  }
  function draw() {
    pending = false;
    if (reduced.matches) return;
    const p = clamp((scrollY-origin)/distance);
    const introVisibility = 1-ease(ramp(p,.025,.12));
    opacity(intro,introVisibility); intro.style.transform=`translateY(${-ramp(p,0,.13)*35}px)`; interactive(intro,introVisibility);
    gate(gateOne,p,.15,.36,.025,.115,.095,.22);
    opacity(gateOne,1-ease(ramp(p,.29,.365)));
    opacity(foyer,1-ease(ramp(p,.22,.35)));
    opacity(sceneOne,ease(ramp(p,.20,.34)));
    photo.style.transform=`scale(${(1.1-ramp(p,.30,.57)*.1).toFixed(4)})`;
    const oneVisibility = fade(p,.345,.395,.49,.55);
    opacity(copyOne,oneVisibility); copyOne.style.transform=`translateY(${(1-ease(ramp(p,.345,.395)))*25}px)`; interactive(copyOne,oneVisibility);
    const twoGateVisibility = fade(p,.535,.595,.825,.905);
    gate(gateTwo,p,.70,.90,.585,.655,.64,.765);
    opacity(gateTwo,twoGateVisibility);
    opacity(veil,fade(p,.53,.63,.79,.90));
    const nextVisibility=fade(p,.54,.595,.625,.69);opacity(nextCopy,nextVisibility);
    opacity(sceneTwo,ease(ramp(p,.78,.88)));
    const twoVisibility = ease(ramp(p,.89,.945));
    opacity(copyTwo,twoVisibility); copyTwo.style.transform=`translateY(${(1-twoVisibility)*20}px)`; interactive(copyTwo,twoVisibility);
    progress.style.transform=`scaleY(${p})`;
    const chapter=p<.34?0:p<.83?1:2;
    if(chapter!==lastChapter){chapters.forEach((button,i)=>{if(i===chapter)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});lastChapter=chapter;}
    const cueText=p<.1?'Faites défiler pour ouvrir':p<.34?'Franchissez le passage':p<.53?'Continuez vers le prochain univers':p<.86?'Un nouveau passage s’ouvre':'Vous voici de l’autre côté';
    if(cue.textContent!==cueText)cue.textContent=cueText;
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(draw)}}
  function measure(){origin=journey.getBoundingClientRect().top+scrollY;distance=Math.max(1,journey.offsetHeight-get('.stage').offsetHeight);schedule()}
  function motionMode(){document.documentElement.classList.toggle('reduced',reduced.matches);if(reduced.matches){[intro,copyOne,copyTwo].forEach(el=>{el.inert=false;el.style.pointerEvents='auto';el.style.opacity='1';el.style.transform='none';});}measure()}
  root.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{
    const position=Number(button.dataset.go);
    if(reduced.matches){(position===0?intro:position<=.43?sceneOne:sceneTwo).scrollIntoView({behavior:'auto'});return;}
    window.scrollTo({top:origin+distance*position,behavior:'smooth'});
  }));
  root.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'})});
  root.querySelectorAll('[data-variant]').forEach(button=>button.addEventListener('click',()=>{
    root.dataset.style=button.dataset.variant;
    root.querySelectorAll('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  document.documentElement.classList.add('js-ready');
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  reduced.addEventListener('change',motionMode);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)measure()});
  motionMode();
})();
