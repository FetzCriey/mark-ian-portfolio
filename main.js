import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const mobile = window.matchMedia('(max-width: 700px)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const container = document.getElementById('three-scene');
const fallback = document.querySelector('.scene-fallback');

// ---------- Navigation ----------
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Soft cursor glow ----------
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!glow || mobile) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
}, { passive: true });

// ---------- Three.js 3D hero ----------
if (!container || !window.WebGLRenderingContext) {
  if (fallback) fallback.style.display = 'grid';
} else {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.6, mobile ? 10.2 : 9.1);

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const COLORS = {
      navy: 0x1f3556,
      orange: 0xe9783f,
      yellow: 0xe6b653,
      green: 0x6f8f72,
      cream: 0xf4efe6,
      ink: 0x25262b,
      white: 0xfffdf8,
      wood: 0xc99262,
      metal: 0x8b8f95
    };

    const matte = (color, roughness = 0.72) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
    const metal = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.55 });

    const world = new THREE.Group();
    world.rotation.set(-0.08, -0.16, 0);
    scene.add(world);

    // Platform
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(3.65, 3.9, 0.38, mobile ? 40 : 64),
      matte(COLORS.cream)
    );
    platform.position.y = -2.45;
    platform.receiveShadow = true;
    world.add(platform);

    const platformAccent = new THREE.Mesh(
      new THREE.TorusGeometry(3.12, 0.08, 10, 80),
      matte(COLORS.orange)
    );
    platformAccent.rotation.x = Math.PI / 2;
    platformAccent.position.y = -2.21;
    world.add(platformAccent);

    // Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 1.55), matte(COLORS.wood));
    desk.position.set(0.35, -0.82, 0);
    desk.castShadow = true;
    world.add(desk);

    [-1.38, 1.95].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.7, 0.18), metal(COLORS.ink));
      leg.position.set(x, -1.72, 0);
      leg.castShadow = true;
      world.add(leg);
    });

    // Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0.55, 0.34, -0.08);
    world.add(monitorGroup);

    const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(2.55, 1.6, 0.16), matte(COLORS.ink, 0.5));
    monitorBody.castShadow = true;
    monitorGroup.add(monitorBody);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.28, 1.34),
      new THREE.MeshBasicMaterial({ color: COLORS.navy })
    );
    screen.position.z = 0.086;
    monitorGroup.add(screen);

    // Screen code bars
    const codeGroup = new THREE.Group();
    codeGroup.position.z = 0.092;
    monitorGroup.add(codeGroup);
    const barColors = [COLORS.orange, COLORS.yellow, COLORS.white, COLORS.green];
    for (let i = 0; i < 10; i++) {
      const width = 0.35 + ((i * 17) % 100) / 100 * 1.35;
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(width, 0.055),
        new THREE.MeshBasicMaterial({ color: barColors[i % barColors.length] })
      );
      bar.position.set(-0.78 + width / 2, 0.45 - i * 0.1, 0);
      codeGroup.add(bar);
    }

    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), metal(COLORS.ink));
    stand.position.y = -1.05;
    monitorGroup.add(stand);
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.48), metal(COLORS.ink));
    standBase.position.y = -1.4;
    monitorGroup.add(standBase);

    // Mini second monitor / device
    const device = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.82, 0.12), matte(COLORS.white));
    device.position.set(-1.2, -0.22, 0.46);
    device.rotation.y = 0.16;
    device.castShadow = true;
    world.add(device);
    const deviceScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.62), new THREE.MeshBasicMaterial({ color: COLORS.orange }));
    deviceScreen.position.set(-1.19, -0.22, 0.526);
    deviceScreen.rotation.y = 0.16;
    world.add(deviceScreen);

    // Keyboard
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 0.55), matte(0xd8d2c9));
    keyboard.position.set(0.32, -0.57, 0.75);
    keyboard.rotation.x = -0.08;
    world.add(keyboard);

    // Circuit board: a visual nod to electronics background
    const board = new THREE.Group();
    board.position.set(-2.05, 0.15, 0.3);
    board.rotation.set(-0.2, 0.28, -0.08);
    world.add(board);

    const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 0.1), matte(COLORS.green));
    pcb.castShadow = true;
    board.add(pcb);
    for (let i = 0; i < (mobile ? 9 : 15); i++) {
      const chip = new THREE.Mesh(
        new THREE.BoxGeometry(i % 3 === 0 ? 0.25 : 0.1, i % 4 === 0 ? 0.22 : 0.08, 0.08),
        matte(i % 4 === 0 ? COLORS.ink : COLORS.yellow)
      );
      chip.position.set(-0.45 + ((i * 0.31) % 0.9), -0.58 + ((i * 0.27) % 1.16), 0.09);
      board.add(chip);
    }

    // Floating orbit / tech halo
    const orbit = new THREE.Group();
    orbit.position.set(1.8, 1.75, 0.2);
    world.add(orbit);

    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 10, 48), matte(COLORS.orange));
    ringA.rotation.x = 1.1;
    orbit.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 10, 48), matte(COLORS.yellow));
    ringB.rotation.y = 1.0;
    orbit.add(ringB);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), metal(COLORS.navy));
    orbit.add(core);

    // Orbiting small nodes
    const nodeCount = mobile ? 5 : 8;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.09 + (i % 3) * 0.02, 12, 12),
        matte([COLORS.orange, COLORS.yellow, COLORS.green, COLORS.white][i % 4])
      );
      orbit.add(node);
      nodes.push(node);
    }

    // Small plant for warmth
    const plant = new THREE.Group();
    plant.position.set(2.45, -1.12, -0.15);
    world.add(plant);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.62, 20), matte(COLORS.orange));
    plant.add(pot);
    const leaves = mobile ? 5 : 7;
    for (let i = 0; i < leaves; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), matte(COLORS.green));
      leaf.scale.set(0.75, 1.7, 0.55);
      const a = (i / leaves) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.28, 0.55 + (i % 2) * 0.18, Math.sin(a) * 0.25);
      leaf.rotation.z = Math.cos(a) * 0.45;
      plant.add(leaf);
    }

    // Floating "document" tiles
    const papers = [];
    const paperCount = mobile ? 3 : 5;
    for (let i = 0; i < paperCount; i++) {
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.025), matte(COLORS.white));
      const side = i % 2 === 0 ? -1 : 1;
      paper.position.set(side * (2.5 + (i % 2) * 0.35), 1.55 - i * 0.36, -0.55 + i * 0.16);
      paper.rotation.set(0.12 * i, 0.18 * side, 0.15 * side);
      world.add(paper);
      papers.push(paper);
    }

    // Lights
    scene.add(new THREE.HemisphereLight(0xfffbf4, 0x9a8c7c, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(4, 7, 6);
    key.castShadow = !mobile;
    scene.add(key);
    const warm = new THREE.PointLight(COLORS.orange, 8, 10, 2);
    warm.position.set(-4, 2.5, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x86a8d8, 6, 11, 2);
    cool.position.set(4, 3, 2);
    scene.add(cool);

    // Interaction targets
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let scrollRatio = 0;
    let visible = true;

    const updatePointer = (x, y) => {
      target.x = (x / window.innerWidth - 0.5) * 2;
      target.y = (y / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', (e) => updatePointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) updatePointer(t.clientX, t.clientY);
    }, { passive: true });

    const updateScroll = () => {
      const hero = document.getElementById('hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      scrollRatio = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1.2);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });

    const sceneObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.01 });
    sceneObserver.observe(container);

    function resize() {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!visible && !reducedMotion) return;

      const t = clock.getElapsedTime();
      current.x += (target.x - current.x) * (mobile ? 0.035 : 0.055);
      current.y += (target.y - current.y) * (mobile ? 0.035 : 0.055);

      if (!reducedMotion) {
        world.rotation.y = -0.16 + current.x * 0.15 + scrollRatio * 0.22;
        world.rotation.x = -0.08 + current.y * -0.075 + scrollRatio * 0.06;
        world.position.y = Math.sin(t * 0.7) * 0.045 - scrollRatio * 0.18;
        orbit.rotation.y = t * 0.5;
        orbit.rotation.z = Math.sin(t * 0.6) * 0.22;
        core.rotation.x = t * 0.9;
        core.rotation.y = t * 1.2;
        monitorGroup.rotation.y = current.x * 0.035;
        board.rotation.y = 0.28 - current.x * 0.08;

        nodes.forEach((node, i) => {
          const a = t * (0.55 + i * 0.025) + (i / nodeCount) * Math.PI * 2;
          const r = 1.12 + (i % 2) * 0.18;
          node.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.55, Math.sin(a) * r);
        });

        papers.forEach((paper, i) => {
          paper.position.y += Math.sin(t * 0.8 + i) * 0.0007;
          paper.rotation.z += 0.0007 * (i % 2 ? 1 : -1);
        });
      }

      camera.position.x = current.x * (mobile ? 0.28 : 0.42);
      camera.position.y = 1.6 + current.y * -0.18 + scrollRatio * 0.22;
      camera.lookAt(0, -0.25, 0);
      renderer.render(scene, camera);
    }
    animate();
  } catch (error) {
    console.warn('3D scene fallback activated:', error);
    if (fallback) fallback.style.display = 'grid';
  }
}
