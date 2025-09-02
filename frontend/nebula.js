// ===== HERO SMOKE =====
const heroCanvas = document.getElementById("nebula");
const heroCtx = heroCanvas.getContext("2d");

function resizeHero() {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
}
resizeHero();
window.addEventListener("resize", resizeHero);

class SmokeParticle {
  constructor(x, y, color, boost = false) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = Math.random() * -1 - (boost ? 1.2 : 0.4);
    this.life = Math.random() * 400 + 400;
    this.opacity = 1;
    this.color = color;
    this.size = (Math.random() * 120 + 60) * (boost ? 1.3 : 1);
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = (Math.random() - 0.5) * 0.02;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.angularSpeed;
    this.life--;
    this.opacity = Math.max(0, this.life / 500);
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, this.color.replace("OPACITY", this.opacity * 0.6));
    gradient.addColorStop(1, this.color.replace("OPACITY", 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Hero particles
let heroParticles = [];
const heroColors = [
  "rgba(120, 20, 160, OPACITY)",
  "rgba(20, 60, 160, OPACITY)",
  "rgba(80, 30, 160, OPACITY)"
];
for (let i = 0; i < 200; i++) {
  const color = heroColors[Math.floor(Math.random() * heroColors.length)];
  heroParticles.push(new SmokeParticle(Math.random() * heroCanvas.width, heroCanvas.height - Math.random() * 200, color, true));
}

function animateHero() {
  heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  heroCtx.fillStyle = "rgba(0,0,0,0.25)";
  heroCtx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);

  if (heroParticles.length < 500) {
    const color = heroColors[Math.floor(Math.random() * heroColors.length)];
    heroParticles.push(new SmokeParticle(Math.random() * heroCanvas.width, heroCanvas.height + 100, color));
  }

  for (let i = heroParticles.length - 1; i >= 0; i--) {
    const p = heroParticles[i];
    p.update();
    p.draw(heroCtx);
    if (p.life <= 0) heroParticles.splice(i, 1);
  }

  requestAnimationFrame(animateHero);
}
animateHero();

// ===== SECTIONS SMOKE =====
const sections = document.querySelectorAll(".smoke-section");

sections.forEach(section => {
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = 0;
  canvas.style.pointerEvents = "none"; // para que no interfiera con clicks
  section.style.position = "relative";
  section.prepend(canvas);

  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const colors = [
    "rgba(50, 10, 80, OPACITY)",
    "rgba(10, 30, 80, OPACITY)",
    "rgba(40, 15, 90, OPACITY)"
  ];

  let particles = [];
  for (let i = 0; i < 80; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new SmokeParticle(Math.random() * canvas.width, canvas.height - Math.random() * 100, color, true));
  }

  function animateSection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.1)"; // humo más tenue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (particles.length < 150) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new SmokeParticle(Math.random() * canvas.width, canvas.height + 50, color));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0) particles.splice(i, 1);
    }

    requestAnimationFrame(animateSection);
  }
  animateSection();
});
