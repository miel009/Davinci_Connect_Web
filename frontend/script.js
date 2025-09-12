const form = document.getElementById("comentarioForm"); 
const respuesta = document.createElement("div"); 
form.parentNode.appendChild(respuesta); 

const listaComentarios = document.createElement("div");
listaComentarios.id = "listaComentarios";
form.parentNode.appendChild(listaComentarios);

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
    form.reset();
    setTimeout(() => {
        respuesta.innerText = "";
        respuesta.classList.remove("success");
      }, 5000);

    //cargarComentarios(); // Implementar
  } catch (error) {
    console.error("Error:", error);
    respuesta.innerText = "Ocurrió un error ❌";
  }
});


