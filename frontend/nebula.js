const canvas = document.getElementById("nebula");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

class SmokeParticle {
  constructor(x, y, color, boost = false) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1;       
    this.vy = Math.random() * -1 - (boost ? 1.2 : 0.4); // ⚡ más rápido al inicio
    this.life = Math.random() * 400 + 400;
    this.opacity = 1;
    this.color = color;
    this.size = (Math.random() * 120 + 60) * (boost ? 1.3 : 1); // más grandes al inicio
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

let particles = [];
const colors = [
  "rgba(120, 20, 160, OPACITY)", // fucsia oscuro
  "rgba(20, 60, 160, OPACITY)",  // azul profundo
  "rgba(80, 30, 160, OPACITY)"   // violeta oscuro
];

// ⚡ Generar muchas partículas al inicio
for (let i = 0; i < 200; i++) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const spawnX = Math.random() * canvas.width;
  const spawnY = canvas.height - Math.random() * 200; // algunas más arriba ya
  particles.push(new SmokeParticle(spawnX, spawnY, color, true));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // flujo normal de humo después del boost inicial
  if (particles.length < 500) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const spawnX = Math.random() * canvas.width;
    const spawnY = canvas.height + 100;
    particles.push(new SmokeParticle(spawnX, spawnY, color));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.life <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

animate();
