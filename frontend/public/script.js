const form = document.getElementById("comentarioForm");
const listaComentarios = document.getElementById("listaComentarios");

// Crear o ubicar el contenedor de mensaje justo debajo del formulario
let respuesta = document.getElementById("respuesta");
if (!respuesta) {
  respuesta = document.createElement("p");
  respuesta.id = "respuesta";
  respuesta.classList.add("mensaje-respuesta");
  form.parentNode.insertBefore(respuesta, form.nextSibling);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const mensaje = document.getElementById("comentario").value;

  try {
    const res = await fetch("https://davinci-connect-web.onrender.com/api/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: nombre, email, mensaje }),
    });

    if (!res.ok) throw new Error("Error en el servidor");

    await res.json();
    respuesta.innerText = "Comentario enviado con éxito ✅";
    respuesta.classList.remove("error");
    form.reset();
    cargarComentarios();
    // ocultar notificacion dsp de 5 segundos
  setTimeout(() => {
    respuesta.innerText = "";
  }, 5000);

  } catch (error) {
    console.error("Error:", error);
    respuesta.innerText = "Ocurrió un error ❌";
    respuesta.classList.add("error");
  }
});
// Obtener comentarios y mostrarlos
async function cargarComentarios() {
  try {
    const res = await fetch("https://davinci-connect-web.onrender.com/api/comentarios");
    const data = await res.json();

    listaComentarios.innerHTML = "";
    data.forEach((c) => {
      const fecha = c.fecha?._seconds
        ? new Date(c.fecha._seconds * 1000).toLocaleString()
        : "Sin fecha";
      //avatar random - usuario
      const avatarURL = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(c.usuario)}`;
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${avatarURL}" alt="Avatar de ${c.usuario}" style="width:60px; height:60px; border-radius:50%; margin-bottom:10px;">
        <h3>${c.usuario}</h3>
        <p>${c.mensaje}</p>
        <small>${fecha} • ${c.email}</small>
      `;
      listaComentarios.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando comentarios:", error);
    listaComentarios.innerHTML = "<p>No se pudieron cargar los comentarios.</p>";
  }
}
const anchoCard = 270;

let posicion = 0;

setInterval(() => {
  posicion += anchoCard;

  if (posicion + listaComentarios.clientWidth > listaComentarios.scrollWidth) {
    posicion = 0; 
  }

  listaComentarios.scrollTo({ left: posicion, behavior: "smooth" });
}, 3000);

window.addEventListener("DOMContentLoaded", cargarComentarios);
setInterval(cargarComentarios, 6000);  


// --- Lógica para modal de administración (abrir / cerrar / login simulado)
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");
  const adminModal = document.getElementById("adminModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const adminCancel = document.getElementById("adminCancel");
  const adminForm = document.getElementById("adminLoginForm");
  const adminError = document.getElementById("adminError");

  function openModal() {
    adminModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    adminModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = '';
    adminError.style.display = 'none';
    adminForm.reset();
  }

  if (adminBtn) adminBtn.addEventListener("click", openModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
  if (adminCancel) adminCancel.addEventListener("click", closeModal);

  if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("adminEmail").value.trim();
      const pwd = document.getElementById("adminPassword").value;

      if (!window.__davinciFirebase) {
        adminError.style.display = 'block';
        adminError.innerText = 'Firebase no está configurado en el cliente. Copia tu config en /public/firebase-client.js';
        return;
      }

      try {
        // Iniciar sesión con Firebase Auth cliente
        const { token } = await window.__davinciFirebase.signIn(email, pwd);

        // Verificar token en backend
        const verifyRes = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({})
        });

        if (!verifyRes.ok) {
          const txt = await verifyRes.text().catch(() => 'No autorizado');
          adminError.style.display = 'block';
          adminError.innerText = 'Acceso denegado: ' + txt;
          try { await window.__davinciFirebase.signOut(); } catch(e){
            console.error(e);
          }
          return;
        }

        // Acceso concedido
        closeModal();
        window.location.href = '/admin.html';
      } catch (err) {
        console.error(err);
        adminError.style.display = 'block';
        adminError.innerText = err.message || 'Error autenticando';
      }
    });
  }
});
