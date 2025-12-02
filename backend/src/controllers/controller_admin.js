import { admin, db } from "../firebase.js";

// Verifica ID token enviado en Authorization: Bearer <token>
export async function verifyAdminToken(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    let idToken = null;
    if (authHeader.startsWith("Bearer ")) idToken = authHeader.split(" ")[1];
    if (!idToken && req.body && req.body.idToken) idToken = req.body.idToken;
    if (!idToken) return res.status(401).send("No se proporcionó token");

    const decoded = await admin.auth().verifyIdToken(idToken);

    // Comprueba claim 'admin' o lista de emails en env ADMIN_EMAILS
    const isAdminClaim = !!decoded.admin;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(s=>s.trim()) : [];
    const isAdminEmail = decoded.email && adminEmails.includes(decoded.email);

    if (isAdminClaim || isAdminEmail) {
      return res.json({ ok: true, uid: decoded.uid, email: decoded.email });
    }

    return res.status(403).send("Usuario no es administrador");
  } catch (error) {
    console.error("Error verificando token admin:", error);
    return res.status(401).send("Token inválido");
  }
}

// Asigna custom claim 'admin' a un usuario (buscar por email o usar uid)
export async function setAdminClaim(req, res) {
  try {
    // Verifica que quien hace la petición ya sea admin
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) 
      return res.status(401).json({ error: "No autorizado" });

    const idToken = authHeader.split(" ")[1];
    const decodedRequester = await admin.auth().verifyIdToken(idToken);

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim())
      : [];

    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para asignar admin" });
    }

    const { email, uid } = req.body;
    let targetUid = uid;

    // Buscar usuario por email si no viene UID
    if (!targetUid && email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        targetUid = userRecord.uid;

        // devolver nombre y email
        return res.json({
          ok: true,
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName || "Usuario sin nombre"
        });

      } catch (error) {
        if (error.code === "auth/user-not-found") {
          return res.status(404).json({
            error: "El usuario no existe. Verifica el email antes de asignar administrador."
          });
        }
        throw error;
      }
    }

    if (!targetUid)
      return res.status(400).json({ error: "Debes proporcionar un email válido" });

    await admin.auth().setCustomUserClaims(targetUid, { admin: true });

    return res.json({
      ok: true,
      uid: targetUid,
      email,
      name: "Usuario actualizado"
    });

  } catch (error) {
    console.error("Error asignando admin claim:", error);
    return res.status(500).json({
      error: "Error interno del servidor al asignar administrador."
    });
  }
}


// Eliminar comentario por id (protegido)
export async function deleteComentario(req, res) {
  try {
    // Verificar token del solicitante
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).send('No autorizado');
    const idToken = authHeader.split(' ')[1];
    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s=>s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).send('No tienes permisos para eliminar comentarios');
    }

    const { id } = req.params;
    if (!id) return res.status(400).send('ID requerido');
    await db.collection('comentarios').doc(id).delete();
    return res.json({ ok: true, id });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    return res.status(500).send('Error eliminando comentario');
  }
}
