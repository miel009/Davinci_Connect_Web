const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Inicializa admin con las credenciales del entorno de Functions
try {
  admin.initializeApp();
} catch (e) {
  // ya inicializado
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// POST /assign-admin
// Body: { email } or { uid }
// Header: Authorization: Bearer <idToken> (token del solicitante)
app.post('/assign-admin', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).send('No autorizado');
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Comprobar si solicitante es admin
    if (!decoded.admin) return res.status(403).send('No tienes permisos');

    const { email, uid } = req.body;
    let targetUid = uid;
    if (!targetUid && email) {
      const user = await admin.auth().getUserByEmail(email);
      targetUid = user.uid;
    }
    if (!targetUid) return res.status(400).send('Proporciona email o uid');

    await admin.auth().setCustomUserClaims(targetUid, { admin: true });
    return res.json({ ok: true, uid: targetUid });
  } catch (error) {
    console.error('Error en assign-admin:', error);
    return res.status(500).send('Error interno');
  }
});

exports.api = functions.https.onRequest(app);
