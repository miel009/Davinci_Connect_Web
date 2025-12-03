import { admin, db } from "../firebase.js";
import fs from "node:fs/promises";
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
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(s => s.trim()) : [];
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
    // token de pedticion
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    let existeAdmin = false;
    let pageToken = undefined;

    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      for (const u of result.users) {
        if (u.customClaims && u.customClaims.admin) {
          existeAdmin = true;
          break;
        }
      }
      pageToken = result.pageToken;
    } while (pageToken && !existeAdmin);

    if (existeAdmin && !decodedRequester.admin) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para asignar administradores" });
    }

    // usuario objetivo (SIEMPRE debe ser de Auth)
    const { email, uid } = req.body;
    let targetUid = uid;
    let targetEmail = email;
    let targetName = "Administrador";

    if (!targetUid && email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        targetUid = userRecord.uid;
        targetEmail = userRecord.email;
        targetName = userRecord.displayName || "Usuario sin nombre";
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          return res.status(404).json({
            error: "El usuario no existe en Firebase Auth.",
          });
        }
        throw error;
      }
    }

    if (!targetUid) {
      return res
        .status(400)
        .json({ error: "Debes proporcionar un email de un usuario registrado" });
    }

    // asignar claim admin
    await admin.auth().setCustomUserClaims(targetUid, { admin: true });

    const check = await admin.auth().getUser(targetUid);
    console.log("✅ Claims actualizados:", check.customClaims);

    return res.json({
      ok: true,
      uid: targetUid,
      email: targetEmail,
      name: targetName,
      message: existeAdmin
        ? "Administrador asignado correctamente"
        : "Primer administrador creado correctamente",
    });
  } catch (error) {
    console.error("Error asignando admin claim:", error);
    return res.status(500).json({
      error: "Error interno del servidor al asignar administrador.",
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
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
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

// Listar usuarios (requiere token de admin)
export async function listUsers(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const idToken = authHeader.split(' ')[1];

    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para listar usuarios" });
    }

    const wantAll = req.query.all === 'true' || req.query.all === '1';
    const maxPerPage = parseInt(req.query.max || '1000', 10) || 1000;

    // Si piden todos, iteramos paginando internamente
    if (wantAll) {
      const allUsers = [];
      let nextPageToken = undefined;

      do {
        const listResult = await admin.auth().listUsers(maxPerPage, nextPageToken);
        const chunk = (listResult.users || []).map(u => ({
          uid: u.uid,
          email: u.email || "",
          name: u.displayName || "",
          admin: !!(u.customClaims && u.customClaims.admin),
          lastSignInTime: u.metadata?.lastSignInTime || null,
          createdAt: u.metadata?.creationTime || null,
          photoURL: u.photoURL || null
        }));
        allUsers.push(...chunk);
        nextPageToken = listResult.pageToken;
      } while (nextPageToken);

      return res.json(allUsers);
    }

    // Si no piden todos, devolvemos una sola página y nextPageToken para paginar desde el cliente
    const pageToken = req.query.pageToken;
    const listResult = await admin.auth().listUsers(maxPerPage, pageToken);
    const users = (listResult.users || []).map(u => ({
      uid: u.uid,
      email: u.email || "",
      name: u.displayName || "",
      admin: !!(u.customClaims && u.customClaims.admin),
      lastSignInTime: u.metadata?.lastSignInTime || null,
      createdAt: u.metadata?.creationTime || null,
      photoURL: u.photoURL || null
    }));

    return res.json({ users, nextPageToken: listResult.pageToken || null });
  } catch (error) {
    console.error('Error listUsers:', error);
    return res.status(500).json({ error: 'Error listando usuarios' });
  }
}

// Eliminar usuario por uid (requiere token de admin)
export async function deleteUser(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const idToken = authHeader.split(' ')[1];

    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para eliminar usuarios" });
    }

    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'UID requerido' });

    await admin.auth().deleteUser(uid);
    return res.json({ ok: true, uid });
  } catch (error) {
    console.error('Error deleteUser:', error);
    return res.status(500).json({ error: 'Error eliminando usuario' });
  }
}

// Listar archivos en Firebase Storage (requiere admin)
export async function listContents(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const idToken = authHeader.split(' ')[1];

    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para listar contenidos" });
    }

    const bucket = admin.storage().bucket();
    const prefix = req.query.prefix || '';
    const wantAll = req.query.all === 'true' || req.query.all === '1';
    const maxResults = parseInt(req.query.max || '100', 10) || 100;
    const pageToken = req.query.pageToken;
    // Si dirs=true pedimos los "prefixes" (carpetas simuladas) usando delimiter '/'
    const wantDirs = req.query.dirs === 'true' || req.query.dirs === '1';

    if (wantAll) {
      // iterar y devolver todos
      const allFiles = [];
      let next = undefined;
      do {
        const opts = { prefix, maxResults, pageToken: next };
        if (wantDirs) opts.delimiter = '/';
        const [files, , apiResponse] = await bucket.getFiles(opts);
        allFiles.push(...files);
        next = apiResponse?.nextPageToken;
      } while (next);

      const itemsAll = await Promise.all(allFiles.map(async (f) => {
        const meta = f.metadata || {};
        let url = null;
        // Use public URL (files are made public on upload). If not public, access may 403.
        try {
          const bucketName = admin?.storage?.().bucket().name || process.env.FIREBASE_STORAGE_BUCKET;
          url = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(f.name)}`;
        } catch (e) {
          url = null;
        }
        return {
          name: f.name,
          size: meta.size || null,
          contentType: meta.contentType || null,
          updated: meta.updated || null,
          url
        };
      }));

      return res.json(itemsAll);
    }

    // paginado estándar
    const opts = { prefix, maxResults, pageToken };
    if (wantDirs) opts.delimiter = '/';
    const [files, , apiResponse] = await bucket.getFiles(opts);
    const items = await Promise.all(files.map(async (f) => {
      const meta = f.metadata || {};
      let url = null;
      try {
        const bucketName = admin?.storage?.().bucket().name || process.env.FIREBASE_STORAGE_BUCKET;
        url = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(f.name)}`;
      } catch (e) {
        url = null;
      }
      return {
        name: f.name,
        size: meta.size || null,
        contentType: meta.contentType || null,
        updated: meta.updated || null,
        url
      };
    }));

    const nextPageToken = apiResponse?.nextPageToken || null;
    const prefixes = apiResponse?.prefixes || null;

    // If requested, compute counts per prefix (careful: can be expensive). Cap counts at 10000.
    let prefixCounts = null;
    if (wantDirs && prefixes && prefixes.length) {
      prefixCounts = {};
      await Promise.all(prefixes.map(async (p) => {
        try {
          let count = 0;
          let nt = undefined;
          const cap = 10000;
          do {
            const [filesPage, , resp] = await bucket.getFiles({ prefix: p, maxResults: 1000, pageToken: nt });
            count += (filesPage || []).length;
            nt = resp?.nextPageToken;
            if (count >= cap) {
              prefixCounts[p] = { count: cap, truncated: true };
              return;
            }
          } while (nt);
          prefixCounts[p] = { count, truncated: false };
        } catch (e) {
          prefixCounts[p] = { count: 0, truncated: false };
        }
      }));
    }

    return res.json({ items, nextPageToken, prefixes, prefixCounts });
  } catch (error) {
    console.error('Error listContents:', error);
    return res.status(500).json({ error: 'Error listando contenidos' });
  }
}

// Subir archivo a Firebase Storage (requiere admin). Espera multipart form-data con campo 'file'
export async function uploadContent(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const idToken = authHeader.split(' ')[1];

    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para subir contenidos" });
    }

    if (!req.file || !req.file.originalname) return res.status(400).json({ error: 'Archivo requerido' });

    const bucket = admin.storage().bucket();
    let destName;
    if (req.body && req.body.path) {
      const clean = req.body.path.replace(new RegExp('(^/+|/+$)', 'g'), '');
      destName = clean + '/' + req.file.originalname;
    } else {
      destName = req.file.originalname;
    }

    // Upload from disk if available (multer.diskStorage), otherwise from buffer
    let url = null;
    try {
      if (req.file && req.file.path) {
        // stream upload from local temp file
        await bucket.upload(req.file.path, { destination: destName, metadata: { contentType: req.file.mimetype } });
        // remove temp file
        try { await fs.unlink(req.file.path); } catch (e) { }
      } else if (req.file && req.file.buffer) {
        const fileRef = bucket.file(destName);
        await fileRef.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
      }

      // Make the uploaded file public
      try {
        const fileRef2 = bucket.file(destName);
        await fileRef2.makePublic();
      } catch (e) {
        // ignore makePublic errors
      }

      const bucketName = bucket.name || process.env.FIREBASE_STORAGE_BUCKET;
      url = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(destName)}`;

      return res.json({ ok: true, name: destName, url });
    } catch (error) {
      console.error('Error uploadContent:', error);
      // cleanup temp file if present
      try { if (req.file && req.file.path) await fs.unlink(req.file.path); } catch (e) { }
      return res.status(500).json({ error: 'Error subiendo contenido' });
    }
  } catch (error) {
    console.error('Error uploadContent:', error);
    return res.status(500).json({ error: 'Error subiendo contenido' });
  }
}

// Eliminar archivo en Storage
export async function deleteContent(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const idToken = authHeader.split(' ')[1];

    const decodedRequester = await admin.auth().verifyIdToken(idToken);
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s => s.trim()) : [];
    if (!decodedRequester.admin && !(decodedRequester.email && adminEmails.includes(decodedRequester.email))) {
      return res.status(403).json({ error: "No tienes permisos para eliminar contenidos" });
    }

    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    const bucket = admin.storage().bucket();
    const file = bucket.file(decodeURIComponent(name));
    await file.delete();

    return res.json({ ok: true, name });
  } catch (error) {
    console.error('Error deleteContent:', error);
    return res.status(500).json({ error: 'Error eliminando contenido' });
  }
}

export async function listUsersWithPending(req, res) {
  try {
    const all = await admin.auth().listUsers(1000);

    const snapshot = await admin.firestore().collection("acceptedUsers").get();
    const aceptados = new Set(snapshot.docs.map(d => d.id));

    const pendientes = [];
    const aceptadosList = [];

    for (const u of all.users) {
      if (aceptados.has(u.uid)) {
        aceptadosList.push({
          uid: u.uid,
          email: u.email,
          admin: u.customClaims?.admin || false,
          lastSignInTime: u.metadata?.lastSignInTime || null
        });
      } else {
        pendientes.push({
          uid: u.uid,
          email: u.email
        });
      }
    }

    res.json({
      pendientes,
      aceptados: aceptadosList,
      todos: all.users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error listando usuarios" });
  }
}


export async function aceptarUser(req, res) {
  try {
    // Verificar token admin
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) 
      return res.status(401).json({ error: "No autorizado" });

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map(s => s.trim())
      : [];

    if (!decoded.admin && !(decoded.email && adminEmails.includes(decoded.email))) {
      return res.status(403).json({ error: "No tienes permisos para aceptar usuarios" });
    }

    // UID real enviado desde admin.js
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Falta UID" });

    // Obtener usuario real
    const userRecord = await admin.auth().getUser(uid);
    const email = userRecord.email || "";

    // Asignar rol alumno
    await admin.auth().setCustomUserClaims(uid, { alumno: true });

    // Guardar aceptación
    await admin.firestore()
      .collection("acceptedUsers")
      .doc(uid)
      .set({
        email,
        rol: "alumno",
        fechaAceptado: admin.firestore.FieldValue.serverTimestamp()
      });

    return res.json({ ok: true, message: "Usuario aceptado correctamente" });

  } catch (err) {
    console.error("ERROR aceptarUser:", err);
    res.status(500).json({ error: "Error aceptando usuario" });
  }
}



export async function rechazarUser(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "No autorizado" });

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map(s => s.trim())
      : [];

    if (!decoded.admin && !(decoded.email && adminEmails.includes(decoded.email))) {
      return res.status(403).json({ error: "No tienes permisos" });
    }

    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "Falta UID" });

    // Marcar como rechazado
    await admin.firestore().collection("rechazados").doc(uid).set({
      estado: "rechazado",
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });

    // ELIMINAR al usuario de Firebase Auth (esto faltaba)
    await admin.auth().deleteUser(uid);

    return res.json({ ok: true, message: "Usuario rechazado y eliminado" });

  } catch (err) {
    console.error("ERROR rechazarUser:", err);
    res.status(500).json({ error: "Error rechazando usuario" });
  }
}

