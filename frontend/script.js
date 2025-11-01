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
    const res = await fetch("http://localhost:4000/api/comentarios", {
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
    const res = await fetch("/api/comentarios");
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

setInterval(() => {
  listaComentarios.scrollBy({ left: anchoCard, behavior: "smooth" });
  if (listaComentarios.scrollLeft + listaComentarios.clientWidth >= listaComentarios.scrollWidth) {
    listaComentarios.scrollTo({ left: 0, behavior: "smooth" });
  }
}, 3000);

window.addEventListener("DOMContentLoaded", cargarComentarios);
setInterval(cargarComentarios, 20000);  
