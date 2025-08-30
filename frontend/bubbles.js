document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector('.hero');
  const bubbleCount = 20; // número de burbujas grandes
  const bubbles = [];

  for(let i=0; i<bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    hero.appendChild(bubble);
    bubbles.push(bubble);

    // tamaño aleatorio grande
    const size = 50 + Math.random() * 100; 
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';

    // posición inicial aleatoria
    let x = Math.random() * hero.clientWidth;
    let y = Math.random() * hero.clientHeight;

    // velocidad aleatoria
    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;

    function animate() {
      x += dx;
      y += dy;

      // rebote en los bordes
      if(x + size > hero.clientWidth || x < 0) dx = -dx;
      if(y + size > hero.clientHeight || y < 0) dy = -dy;

      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';

      requestAnimationFrame(animate);
    }

    animate();
  }
});
