// Script para asignar custom claim 'admin' a un usuario por email
// Uso: node makeAdmin.js email@dominio.com
// Requiere: tener `backend/src/serviceAccountKey.json` descargado desde Firebase Console

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve('./src/serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('No se encontró serviceAccountKey.json en backend/src/. Coloca el archivo y vuelve a intentar.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function makeAdminByEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('Claim admin asignado a', email, user.uid);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Uso: node makeAdmin.js email@dominio.com');
  process.exit(1);
}
makeAdminByEmail(email);
