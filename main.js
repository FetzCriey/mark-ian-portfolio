document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const progress = document.querySelector('.progress i');
const cursorCross = document.querySelector('.cursor-cross');
const portraitSystem = document.getElementById('portrait-system');
const portraitHost = document.getElementById('portrait-3d');

function closeMenu(restoreFocus=false){
  if(!nav?.classList.contains('open')) return;
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-open');
  if(restoreFocus) menuButton?.focus();
}

function openMenu(){
  if(!nav||!menuButton) return;
  nav.classList.add('open');
  menuButton.setAttribute('aria-expanded','true');
  document.body.classList.add('menu-open');
  navLinks[0]?.focus();
}

menuButton?.addEventListener('click',()=>nav?.classList.contains('open')?closeMenu():openMenu());
navLinks.forEach(link=>link.addEventListener('click',()=>closeMenu()));

document.addEventListener('pointerdown',event=>{
  if(nav?.classList.contains('open')&&!header?.contains(event.target)) closeMenu();
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeMenu(true);return}
  if(event.key!=='Tab'||!nav?.classList.contains('open')) return;
  const focusables=[menuButton,...navLinks].filter(Boolean);
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});

let scrollFrame=0;
function updateScrollUI(){
  const y=window.scrollY;
  header?.classList.toggle('scrolled',y>18);
  if(progress){
    const max=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
    progress.style.transform=`scaleX(${Math.min(y/max,1)})`;
  }
  scrollFrame=0;
}
function requestScrollUI(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollUI)}
updateScrollUI();
window.addEventListener('scroll',requestScrollUI,{passive:true});
window.addEventListener('resize',requestScrollUI,{passive:true});

if(cursorCross&&!coarsePointer&&!reducedMotion){
  let x=0,y=0,frame=0;
  const paint=()=>{
    cursorCross.style.left=`${x}px`;
    cursorCross.style.top=`${y}px`;
    frame=0;
  };
  window.addEventListener('pointermove',event=>{
    x=event.clientX;y=event.clientY;
    document.body.classList.add('pointer-active');
    if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>document.body.classList.remove('pointer-active'));
}

const clock=document.getElementById('local-time');
const timeFormatter=new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:true});
function updateClock(){if(clock)clock.textContent=`${timeFormatter.format(new Date())} PHT`}
updateClock();
setInterval(updateClock,30000);

const revealItems=[...document.querySelectorAll('.reveal')];
if(reducedMotion||!('IntersectionObserver'in window)){
  revealItems.forEach(item=>item.classList.add('is-visible'));
}else{
  const fold=window.innerHeight*.92;
  revealItems.forEach(item=>{
    if(item.getBoundingClientRect().top<=fold)item.classList.add('is-visible');
    else item.classList.add('reveal-pending');
  });
  const revealObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{rootMargin:'0px 0px -7% 0px',threshold:.06});
  revealItems.filter(item=>item.classList.contains('reveal-pending')).forEach(item=>revealObserver.observe(item));
}

const sections=[...document.querySelectorAll('main section[id]')];
if('IntersectionObserver'in window&&sections.length){
  const sectionObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    navLinks.forEach(link=>{
      const active=link.getAttribute('href')===`#${visible.target.id}`;
      active?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current');
    });
  },{rootMargin:'-24% 0px -62% 0px',threshold:[.01,.15,.35]});
  sections.forEach(section=>sectionObserver.observe(section));
}

if(!coarsePointer&&!reducedMotion){
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    let frame=0;
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const px=(event.clientX-rect.left)/rect.width-.5;
      const py=(event.clientY-rect.top)/rect.height-.5;
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        card.style.setProperty('--mx',`${px*8}px`);
        card.style.setProperty('--my',`${py*8}px`);
      });
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--mx','0px');
      card.style.setProperty('--my','0px');
    });
  });
}

const portraitData='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TgAgADUATgBPACAAwwDbAMQAvgDDAKQAUgB1AHYAUQB1AFIAkgCVAHEAlQCSAJgAtgC3AJgATwA2ACAANgAhACAAIQA2AE8AIQA3ACIA+ADtAOwA+QD4AOwAlQByAHEAlwC2AJgAlwCSAJEAlwCRALUAtgCXALUAuACZALcAtwCZAJgA2ADXAPQA1wDwAPQA8wDXANYA8ADXAPMA7QD2AO4A+AD2AO0A7gD2APcAUABRACIANwBQACIAUAAhAE8AUAA3ACEAdAB4AHUAdQB4AHYAkwByAJUAmgC4ALkAmgCZALgAnQCcALoAnAC5ALoAnACaALkAeQB4AHQAcwB5AHQAlAB5AHMAlABzAHIAkwCUAHIAYABfAIAAYACAAIEASwBuAG8AbgBLAEoA0QDpAOoA6QDRANAAoQB8AKAAfAChAH0AXAB8AH0AfABcAFsApAClAIEAgACkAIEAfgBcAH0AfgBdAFwAXwBeAIAAXgB/AIAABwAGABEAEgAHABEABgAFABEABQAQABEA4ADIAMcAyADgAOEASwAyAEoAMgAxAEoA4gDIAOEAyADiAMkA4gDjAMoAyQDiAMoABAHiAOEA4gAEAQUB0gDRAOoA0gDqAOsA0QCxANAAsQDRALIArgDOAK8AzgCuAM0AewCeAJ8AngB7AHoAfAB7AKAAewCfAKAA3QDeAMUAxADdAMUAYAA8AF8APAA7AF8AKAASABEAEgAoACkADgAlACYADwAOACYAPAAkACMAJAA8AD0APgAkAD0AJQAkAD4ABQAEABAABAAPABAAxQDfAMYA3gDfAMUA3wDHAMYA3wDgAMcAqgDIAMkAyACqAKkAqgCFAKkAqgCGAIUA7ADSAOsA0gDsANMASQAvAEgALwBJADAAMQBJAEoASQAxADAASQBIAGwAbQBJAGwASQBuAEoASQBtAG4AcABLAG8AcABMAEsAMwAyAEsATAAzAEsAawCLAIwAiwBrAGoAaABDAGcAQwBoAEQAaACIAIkAiABoAGcAaABFAEQARQBoAGkARQAtACwALQBFAEYARgBFAGoARQBpAGoA4gAGAeMABgHiAAUBbQCPAG4AjwBtAI4AaACKAGkAigBoAIkArQCKAIkArgCKAK0AaQCKAGoAigCLAGoAigCuAK8AiwCKAK8AsACLAK8AiwCwAIwAzgCwAK8AsADOAM8AsQCwANAA0ACwAM8AjQCwALEAsACNAIwAbQCNAI4AjQBtAGwAjQBrAIwAawCNAGwAjQCxALIAjQCyAI4A5wDOAM0A5gDnAM0AiACsAIkArACtAIkAewBaAHoAWgBZAHoAWgB8AFsAWgB7AHwAowCkAIAAfwCjAIAAhgBlAIUAhQBlAGQADwAnABAAJwAPACYAEAAnABEAPwAnACYAJwA/AEAAPwAlAD4AJQA/ACYAQAA/AGQAPwBjAGQADgANACUADQAkACUAJAANACMADQAMACMA4AADAeEAAwEEAeEA8QDZANgA2QDxAPIAcABNAEwATQBwAHEATQAzAEwAMwBNADQARwAtAEYALQBHAC4ALwBHAEgALgBHAC8ARwBGAGoAawBHAGoASABHAGwARwBrAGwARQArAEQAKwBFACwAKwBDAEQAKwAqAEMA0gCzANEA0QCzALIAswCPAI4AsgCzAI4AzgDoAM8A5wDoAM4A6ADpANAA6ADQAM8A4wDkAMoA5ADLAMoABgHkAOMA5AAGAQcB5AAHAQgB5QDkAAgBzADkAOUA5ADMAMsArgDMAM0AzACuAK0ArADMAK0AzACsAMsAzADmAM0AzADlAOYAqgCrAIYAhgCrAIcAqwDJAMoAqwCqAMkAqwCsAIgAqwCIAIcArACrAMsAywCrAMoAogCjAH8AfgCiAH8AoQCiAH0AogB+AH0AZgCIAGcAiABmAIcAZgBlAIYAZgCGAIcApgDEAMUAxACmAKUApQCmAIEApgCCAIEAPABhAD0AYQA8AGAAYQBgAIEAggBhAIEA3wACAeAAAgEDAeAAAgHfAN4AAgHeAAEB7gDvANYA1QDuANYAbgCQAG8AjwCQAG4AkABwAG8AkACRAHAAcACSAHEAkQCSAHAAEwASACkAKgATACkA2QC5ANgAuQDZALoApADDAKUAwwDEAKUAJwBBACgAQQAnAEAAZQBBAGQAQQBAAGQAYwCEAGQAhACFAGQA7ADtANMA7QDUANMA7QDuANUA1ADtANUAtADSANMAtACzANIA1AC0ANMAtADUALUAswC0AI8AtACQAI8AkAC0AJEAkQC0ALUAtgDUANUA1AC2ALUAtgDVANYAtwC2ANYAQwBCAGcAQgBmAGcAKgBCAEMAQgAqACkAZgBCAGUAQgBBAGUAKABCACkAQQBCACgApwDFAMYApwCmAMUAYgA/AD4APwBiAGMAYgA+AD0AYQBiAD0AcgBNAHEAcgBOAE0AuQDXANgAuADXALkA1wC3ANYA1wC4ALcAhQCoAKkAhACoAIUAqADIAKkAyACoAMcAxwCoAMYAqACnAMYAqACDAKcAgwCoAIQApgCDAIIApwCDAKYAgwCEAGMAYgCDAGMAgwBhAIIAgwBiAGEAUAB0AHUAUAB1AFEAUABzAHQAcwBQAE8AcgBzAE4ATgBzAE8A';

function decodePortraitMesh(base64){
  const raw=atob(base64);
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const view=new DataView(bytes.buffer);
  const vertexCount=view.getUint32(0,true);
  const indexCount=view.getUint32(4,true);
  const scale=view.getUint32(8,true);
  let offset=12;

  const positions=new Float32Array(vertexCount*3);
  for(let i=0;i<positions.length;i++,offset+=2){
    positions[i]=view.getInt16(offset,true)/scale;
  }

  const colors=new Float32Array(vertexCount*3);
  for(let i=0;i<colors.length;i++,offset++){
    colors[i]=bytes[offset]/255;
  }

  const indices=new Uint16Array(indexCount);
  for(let i=0;i<indexCount;i++,offset+=2){
    indices[i]=view.getUint16(offset,true);
  }

  return {positions,colors,indices};
}

async function initPortrait3D(){
  if(!portraitHost||!window.WebGLRenderingContext) return;

  try{
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.164.1/+esm');
    const data=decodePortraitMesh(portraitData);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(30,1,.1,100);
    camera.position.set(0,.1,13.5);

    const renderer=new THREE.WebGLRenderer({
      alpha:true,
      antialias:!coarsePointer,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarsePointer?1.3:1.7));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    portraitHost.appendChild(renderer.domElement);

    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(data.colors,3));
    geometry.setIndex(new THREE.BufferAttribute(data.indices,1));
    geometry.computeVertexNormals();

    const group=new THREE.Group();
    scene.add(group);

    const material=new THREE.MeshStandardMaterial({
      vertexColors:true,
      roughness:.82,
      metalness:.05,
      flatShading:true,
      side:THREE.DoubleSide
    });
    const person=new THREE.Mesh(geometry,material);
    person.rotation.x=-.02;
    group.add(person);

    const wire=new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color:0xff6d2d,
        wireframe:true,
        transparent:true,
        opacity:.095,
        depthWrite:false
      })
    );
    wire.scale.setScalar(1.004);
    group.add(wire);

    const halo=new THREE.Group();
    group.add(halo);

    const ringMat=new THREE.MeshBasicMaterial({color:0xff6d2d,transparent:true,opacity:.18,depthWrite:false});
    const ringA=new THREE.Mesh(new THREE.TorusGeometry(2.55,.012,8,96),ringMat);
    ringA.position.set(0,.65,-.45);
    ringA.rotation.x=1.17;
    halo.add(ringA);

    const ringB=new THREE.Mesh(
      new THREE.TorusGeometry(3.05,.008,8,96),
      new THREE.MeshBasicMaterial({color:0xf2eee6,transparent:true,opacity:.08,depthWrite:false})
    );
    ringB.position.set(0,.3,-.7);
    ringB.rotation.set(1.42,.15,.3);
    halo.add(ringB);

    scene.add(new THREE.HemisphereLight(0xfff4e8,0x101010,2.6));
    const key=new THREE.DirectionalLight(0xffd5bd,3.4);
    key.position.set(4,6,8);
    scene.add(key);
    const rim=new THREE.DirectionalLight(0xff6d2d,2.2);
    rim.position.set(-5,1,-2);
    scene.add(rim);

    const target={x:0,y:0};
    const current={x:0,y:0};
    let scrollMix=0;
    let visible=true;
    let raf=0;

    function setPointer(clientX,clientY){
      const rect=portraitHost.getBoundingClientRect();
      const nx=((clientX-rect.left)/Math.max(rect.width,1)-.5)*2;
      const ny=((clientY-rect.top)/Math.max(rect.height,1)-.5)*2;
      target.x=Math.max(-1,Math.min(1,nx));
      target.y=Math.max(-1,Math.min(1,ny));
      portraitSystem?.style.setProperty('--portrait-x',(target.x*5).toFixed(2));
      portraitSystem?.style.setProperty('--portrait-y',(target.y*4).toFixed(2));
    }

    window.addEventListener('pointermove',event=>setPointer(event.clientX,event.clientY),{passive:true});
    window.addEventListener('touchmove',event=>{
      const t=event.touches?.[0];
      if(t)setPointer(t.clientX,t.clientY);
    },{passive:true});

    function updateScroll(){
      const hero=document.querySelector('.hero');
      if(!hero)return;
      const rect=hero.getBoundingClientRect();
      scrollMix=Math.max(0,Math.min(1,-rect.top/Math.max(rect.height,1)));
    }
    updateScroll();
    window.addEventListener('scroll',updateScroll,{passive:true});

    new IntersectionObserver(entries=>{
      visible=entries[0]?.isIntersecting??true;
    },{threshold:.01}).observe(portraitSystem);

    function resize(){
      const width=Math.max(portraitHost.clientWidth,1);
      const height=Math.max(portraitHost.clientHeight,1);
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.fov=width<520?34:30;
      camera.updateProjectionMatrix();
      const mobile=width<520;
      group.scale.setScalar(mobile?.91:1.03);
      group.position.y=mobile?-.1:.02;
    }
    resize();
    window.addEventListener('resize',resize,{passive:true});

    const clock3d=new THREE.Clock();
    function render(){
      raf=requestAnimationFrame(render);
      if(!visible&&!reducedMotion)return;

      const t=clock3d.getElapsedTime();

      if(!reducedMotion){
        current.x+=(target.x-current.x)*.055;
        current.y+=(target.y-current.y)*.055;

        group.rotation.y=current.x*.32+scrollMix*.2;
        group.rotation.x=-current.y*.12-scrollMix*.05;
        group.rotation.z=current.x*-.025;
        group.position.x=current.x*.16;
        group.position.y=(portraitHost.clientWidth<520?-.1:.02)-scrollMix*.34+Math.sin(t*.55)*.025;
        group.position.z=scrollMix*.18;

        halo.rotation.z=t*.07;
        ringA.rotation.z=t*.11;
        ringB.rotation.y=t*.08;

        camera.position.x=current.x*.18;
        camera.position.y=.1-current.y*.09+scrollMix*.16;
      }

      camera.lookAt(0,0,0);
      renderer.render(scene,camera);
    }
    render();

    portraitSystem?.classList.add('portrait-ready');

    window.addEventListener('pagehide',()=>{
      cancelAnimationFrame(raf);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      ringA.geometry.dispose();
      ringB.geometry.dispose();
    },{once:true});
  }catch(error){
    console.warn('Interactive portrait fallback active.',error);
  }
}

initPortrait3D();
