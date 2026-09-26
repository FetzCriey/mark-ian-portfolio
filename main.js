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

/* ─────────────────────────────────────────────────────────────
   INTERACTIVE PORTRAIT / IMAGE-DERIVED 3D DEPTH MESH
   Pointer reacts without click. Scroll adds depth + rotation.
   ───────────────────────────────────────────────────────────── */
(async function initPortraitDepthMesh(){
  const hero=document.querySelector('.hero-portrait');
  const shell=document.getElementById('portrait-shell');
  const stage=document.getElementById('portrait-stage');
  const canvas=document.getElementById('portrait-canvas');
  const fallback=document.getElementById('portrait-fallback');
  const loading=document.getElementById('portrait-loading');

  if(!hero||!shell||!stage||!canvas||!fallback) return;

  const portraitParts=[
    '/assets/portrait-1.b64',
    '/assets/portrait-2.b64',
    '/assets/portrait-3.b64',
    '/assets/portrait-4.b64',
    '/assets/portrait-5.b64',
    '/assets/portrait-6.b64'
  ];

  const state={
    pointerX:0,
    pointerY:0,
    scroll:0,
    currentX:0,
    currentY:0,
    currentScroll:0,
    visible:true
  };

  const clamp=(n,min,max)=>Math.min(Math.max(n,min),max);

  async function base64Asset(paths,mime){
    const chunks=await Promise.all(paths.map(async(path)=>{
      const response=await fetch(path,{cache:'force-cache'});
      if(!response.ok) throw new Error('Asset failed: '+path);
      return (await response.text()).trim();
    }));
    const raw=atob(chunks.join(''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:mime}));
  }

  function loadImage(url){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.decoding='async';
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Image decode failed'));
      image.src=url;
    });
  }

  let portraitUrl='';
  let depthUrl='';

  try{
    portraitUrl=await base64Asset(portraitParts,'image/webp');
    fallback.src=portraitUrl;
    await fallback.decode().catch(()=>{});
    stage.classList.add('is-fallback');

    if(reducedMotion){
      loading?.classList.add('is-done');
      return;
    }

    depthUrl=await base64Asset(['/assets/portrait-depth.b64'],'image/webp');

    const [portraitImage,depthImage,THREE]=await Promise.all([
      loadImage(portraitUrl),
      loadImage(depthUrl),
      import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js')
    ]);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(26,1,.1,100);
    camera.position.set(0,.05,14.7);

    const renderer=new THREE.WebGLRenderer({
      canvas,
      alpha:true,
      antialias:!coarsePointer,
      powerPreference:'high-performance',
      failIfMajorPerformanceCaveat:false
    });
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarsePointer?1.35:1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;

    const depthCanvas=document.createElement('canvas');
    depthCanvas.width=depthImage.naturalWidth;
    depthCanvas.height=depthImage.naturalHeight;
    const depthContext=depthCanvas.getContext('2d',{willReadFrequently:true});
    depthContext.drawImage(depthImage,0,0);
    const depthData=depthContext.getImageData(0,0,depthCanvas.width,depthCanvas.height).data;

    const aspect=portraitImage.naturalWidth/portraitImage.naturalHeight;
    const planeHeight=6.35;
    const planeWidth=planeHeight*aspect;
    const segmentsX=coarsePointer?28:44;
    const segmentsY=coarsePointer?66:104;
    const geometry=new THREE.PlaneGeometry(planeWidth,planeHeight,segmentsX,segmentsY);

    const positions=geometry.attributes.position;
    const uvs=geometry.attributes.uv;

    for(let i=0;i<positions.count;i++){
      const u=clamp(uvs.getX(i),0,1);
      const v=clamp(uvs.getY(i),0,1);
      const px=Math.min(depthCanvas.width-1,Math.round(u*(depthCanvas.width-1)));
      const py=Math.min(depthCanvas.height-1,Math.round((1-v)*(depthCanvas.height-1)));
      const depth=depthData[(py*depthCanvas.width+px)*4]/255;
      positions.setZ(i,depth*.78);
    }
    positions.needsUpdate=true;
    geometry.computeVertexNormals();

    const portraitTexture=new THREE.Texture(portraitImage);
    portraitTexture.colorSpace=THREE.SRGBColorSpace;
    portraitTexture.needsUpdate=true;
    portraitTexture.minFilter=THREE.LinearFilter;
    portraitTexture.magFilter=THREE.LinearFilter;

    const portraitMaterial=new THREE.MeshBasicMaterial({
      map:portraitTexture,
      transparent:true,
      alphaTest:.035,
      side:THREE.DoubleSide,
      depthWrite:true
    });

    const glowMaterial=new THREE.ShaderMaterial({
      uniforms:{
        uMap:{value:portraitTexture},
        uColor:{value:new THREE.Color(0xff6d2d)}
      },
      vertexShader:`
        varying vec2 vUv;
        void main(){
          vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }
      `,
      fragmentShader:`
        uniform sampler2D uMap;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main(){
          float a=texture2D(uMap,vUv).a;
          if(a<0.025) discard;
          gl_FragColor=vec4(uColor,a*0.14);
        }
      `,
      transparent:true,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    });

    const group=new THREE.Group();
    scene.add(group);

    const glowMesh=new THREE.Mesh(geometry.clone(),glowMaterial);
    glowMesh.scale.setScalar(1.035);
    glowMesh.position.z=-.12;
    group.add(glowMesh);

    const portraitMesh=new THREE.Mesh(geometry,portraitMaterial);
    group.add(portraitMesh);

    const ringMaterial=new THREE.MeshBasicMaterial({
      color:0xff6d2d,
      transparent:true,
      opacity:.13,
      side:THREE.DoubleSide,
      depthWrite:false
    });

    const ringA=new THREE.Mesh(new THREE.TorusGeometry(2.0,.008,6,120),ringMaterial);
    ringA.position.z=-.38;
    ringA.rotation.x=.18;
    ringA.rotation.y=.12;
    group.add(ringA);

    const ringB=new THREE.Mesh(
      new THREE.TorusGeometry(2.55,.006,6,120),
      ringMaterial.clone()
    );
    ringB.material.opacity=.07;
    ringB.position.z=-.48;
    ringB.rotation.x=-.11;
    ringB.rotation.y=-.18;
    group.add(ringB);

    group.position.y=-.06;

    function resize(){
      const rect=stage.getBoundingClientRect();
      const width=Math.max(1,rect.width);
      const height=Math.max(1,rect.height);
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();

      const mobile=width<520;
      const portraitScale=mobile?1.07:1.12;
      group.scale.setScalar(portraitScale);
    }

    let resizeFrame=0;
    const requestResize=()=>{
      if(resizeFrame) return;
      resizeFrame=requestAnimationFrame(()=>{
        resizeFrame=0;
        resize();
      });
    };
    resize();
    window.addEventListener('resize',requestResize,{passive:true});

    const updatePointer=(clientX,clientY)=>{
      const rect=hero.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight) return;
      state.pointerX=clamp((clientX/window.innerWidth-.5)*2,-1,1);
      state.pointerY=clamp((clientY/window.innerHeight-.5)*2,-1,1);
      hero.style.setProperty('--hero-x',`${state.pointerX*16}px`);
      hero.style.setProperty('--hero-y',`${state.pointerY*8}px`);
    };

    window.addEventListener('pointermove',(event)=>{
      updatePointer(event.clientX,event.clientY);
    },{passive:true});

    window.addEventListener('touchmove',(event)=>{
      const touch=event.touches[0];
      if(touch) updatePointer(touch.clientX,touch.clientY);
    },{passive:true});

    function updateScroll(){
      const rect=hero.getBoundingClientRect();
      const travel=Math.max(hero.offsetHeight*.82,1);
      state.scroll=clamp(-rect.top/travel,0,1);
      hero.style.setProperty('--hero-scroll',`${state.scroll*-34}px`);
    }
    updateScroll();
    window.addEventListener('scroll',updateScroll,{passive:true});

    if('IntersectionObserver' in window){
      new IntersectionObserver((entries)=>{
        state.visible=entries[0]?.isIntersecting??true;
      },{threshold:.01}).observe(stage);
    }

    const rxReadout=document.querySelector('[data-readout="rx"]');
    const ryReadout=document.querySelector('[data-readout="ry"]');
    const scrollReadout=document.querySelector('[data-readout="scroll"]');
    const clock3d=new THREE.Clock();
    let animationFrame=0;

    function animate(){
      animationFrame=requestAnimationFrame(animate);
      if(!state.visible) return;

      const elapsed=clock3d.getElapsedTime();

      state.currentX+=(state.pointerX-state.currentX)*.055;
      state.currentY+=(state.pointerY-state.currentY)*.055;
      state.currentScroll+=(state.scroll-state.currentScroll)*.06;

      const idleX=Math.sin(elapsed*.55)*.012;
      const idleY=Math.cos(elapsed*.42)*.014;

      group.rotation.y=state.currentX*.26+state.currentScroll*.11+idleX;
      group.rotation.x=-state.currentY*.10+idleY-state.currentScroll*.045;
      group.rotation.z=state.currentX*.024+state.currentScroll*.07;
      group.position.x=state.currentX*.22;
      group.position.y=-.06-state.currentY*.10-state.currentScroll*.42+Math.sin(elapsed*.7)*.022;
      group.position.z=state.currentScroll*.46;

      ringA.rotation.z=elapsed*.055+state.currentX*.08;
      ringB.rotation.z=-elapsed*.04-state.currentX*.05;
      ringA.rotation.x=.18+state.currentY*.04;
      ringB.rotation.y=-.18+state.currentX*.055;

      camera.position.x=state.currentX*.14;
      camera.position.y=.05-state.currentY*.06+state.currentScroll*.08;
      camera.lookAt(0,-.02,0);

      renderer.render(scene,camera);

      const rx=THREE.MathUtils.radToDeg(group.rotation.x);
      const ry=THREE.MathUtils.radToDeg(group.rotation.y);
      if(rxReadout) rxReadout.textContent=`${rx>=0?'+':''}${rx.toFixed(1)}°`;
      if(ryReadout) ryReadout.textContent=`${ry>=0?'+':''}${ry.toFixed(1)}°`;
      if(scrollReadout) scrollReadout.textContent=String(Math.round(state.currentScroll*100)).padStart(3,'0');
    }

    stage.classList.remove('is-fallback');
    stage.classList.add('is-webgl');
    loading?.classList.add('is-done');
    animate();

    window.addEventListener('pagehide',()=>{
      cancelAnimationFrame(animationFrame);
      renderer.dispose();
      geometry.dispose();
      portraitMaterial.dispose();
      glowMaterial.dispose();
      ringA.geometry.dispose();
      ringA.material.dispose();
      ringB.geometry.dispose();
      ringB.material.dispose();
      portraitTexture.dispose();
      if(portraitUrl) URL.revokeObjectURL(portraitUrl);
      if(depthUrl) URL.revokeObjectURL(depthUrl);
    },{once:true});

  }catch(error){
    console.warn('Interactive portrait fallback:',error);
    stage.classList.add('is-fallback');
    loading?.classList.add('is-done');

    window.addEventListener('pointermove',(event)=>{
      const x=clamp((event.clientX/window.innerWidth-.5)*2,-1,1);
      const y=clamp((event.clientY/window.innerHeight-.5)*2,-1,1);
      hero.style.setProperty('--hero-x',`${x*10}px`);
      hero.style.setProperty('--hero-y',`${y*6}px`);
      hero.style.setProperty('--portrait-ry',String(x*4));
    },{passive:true});
  }
})();
