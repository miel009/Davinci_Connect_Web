// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Tu configuración de Firebase (copiada desde Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyAZzB2eXstBep6NEQjhyQvDXZgceGJT4mY",
    authDomain: "comentarios-form.firebaseapp.com",
    projectId: "comentarios-form",
    storageBucket: "comentarios-form.firebasestorage.app",
    messagingSenderId: "74168137309",
    appId: "1:74168137309:web:5e858f4c742dccc4f0ffb4"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección "comentarios"
const comentariosRef = collection(db, "comentarios");

// Capturamos el formulario
const form = document.getElementById("comentarioForm"); // coincide con tu HTML
const respuesta = document.createElement("div"); // crea un div para mensajes
form.parentNode.appendChild(respuesta); // lo añadimos debajo del formulario

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("comentario").value; // coincide con tu textarea

    try {
        await addDoc(comentariosRef, {
            nombre,
            email,
            mensaje,
            fecha: new Date()
        });

        respuesta.innerText = "Comentario enviado con éxito ✅";
        form.reset();
    } catch (error) {
        console.error("Error guardando comentario: ", error);
        respuesta.innerText = "Ocurrió un error ❌";
    }
});