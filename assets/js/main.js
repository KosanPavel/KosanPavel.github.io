// ==================== NAVIGATION ====================
const header    = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

// Mobile hamburger toggle
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.querySelector('i').className = open ? 'uil uil-times' : 'uil uil-bars';
  });
}

// Close mobile menu on link click
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    if (navToggle) navToggle.querySelector('i').className = 'uil uil-bars';
  });
});


// ==================== SCROLL BEHAVIOUR ====================
const sections = document.querySelectorAll('section[id]');
const scrollUpBtn = document.getElementById('scroll-up');

window.addEventListener('scroll', () => {
  const y = window.pageYOffset;

  // Sticky header shadow
  header.classList.toggle('scrolled', y > 50);

  // Active nav link highlighting
  sections.forEach(section => {
    const top    = section.offsetTop - 90;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav__link[href="#${id}"]`);
    if (link) link.classList.toggle('active-link', y >= top && y < bottom);
  });

  // Show / hide scroll-up button
  if (scrollUpBtn) scrollUpBtn.classList.toggle('is-visible', y >= 500);
});


// ==================== PROJECT MODAL ====================
const modal = document.getElementById('project-modal');

if (modal) {
  // Open modal when a project card button is clicked
  document.addEventListener('click', e => {
    const btn = e.target.closest('.project-card button');
    if (btn) {
      const id = btn.closest('.project-card').dataset.project;
      modal.querySelectorAll('.project-detail').forEach(p => {
        p.style.display = p.id === id ? 'block' : 'none';
      });
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      return;
    }

    // Close on backdrop or close button
    if (e.target.matches('.modal__backdrop') || e.target.closest('.modal__close')) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}


// ==================== GRAPH BACKGROUND ANIMATION ====================
(function () {
  const canvas = document.getElementById('graph-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NODE_COUNT  = 60;
  const MAX_DIST    = 160;   // max edge length
  const BASE_SPEED  = 0.4;
  const MOUSE_RANGE = 130;   // mouse attraction radius
  const MAX_SPEED   = 1.4;

  let W, H;
  let nodes = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkNode() {
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (0.5 + Math.random());
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  2 + Math.random() * 2.5,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, mkNode);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Mouse attraction & velocity update
    for (const n of nodes) {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d  = Math.hypot(dx, dy);
      if (d < MOUSE_RANGE && d > 0) {
        const f = (1 - d / MOUSE_RANGE) * 0.025;
        n.vx += dx * f;
        n.vy += dy * f;
      }

      // Clamp speed
      const spd = Math.hypot(n.vx, n.vy);
      if (spd > MAX_SPEED) { n.vx = (n.vx / spd) * MAX_SPEED; n.vy = (n.vy / spd) * MAX_SPEED; }

      // Move
      n.x += n.vx;
      n.y += n.vy;

      // Bounce off walls
      if (n.x < 0)  { n.x = 0;  n.vx = Math.abs(n.vx); }
      if (n.x > W)  { n.x = W;  n.vx = -Math.abs(n.vx); }
      if (n.y < 0)  { n.y = 0;  n.vy = Math.abs(n.vy); }
      if (n.y > H)  { n.y = H;  n.vy = -Math.abs(n.vy); }
    }

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.5;
          ctx.strokeStyle = `rgba(90,90,90,${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const d    = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      const near = d < MOUSE_RANGE;
      ctx.beginPath();
      ctx.arc(n.x, n.y, near ? n.r * 1.7 : n.r, 0, Math.PI * 2);
      ctx.fillStyle = near ? 'rgba(50,50,50,0.85)' : 'rgba(110,110,110,0.7)';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  init();
  requestAnimationFrame(frame);
})();




