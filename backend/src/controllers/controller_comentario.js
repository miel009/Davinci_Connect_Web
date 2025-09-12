import { db } from "../firebase.js";


export const crearComentario = async (req, res) => {
  try {
    const { usuario,email,mensaje } = req.body;
    if (!usuario || !email|| !mensaje) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const nuevoComentario = {
      usuario,
      email,
      mensaje,
      fecha: new Date(),
    };

    const docRef = await db.collection("comentarios").add(nuevoComentario);
    res.status(201).json({ id: docRef.id, ...nuevoComentario });
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


export const obtenerComentarios = async (req, res) => {
  try {
    const snapshot = await db.collection("comentarios").get();
    const comentarios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(comentarios);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error );
    res.status(500).json({ error: "Error en el servidor", detalle: error });
  }
};


