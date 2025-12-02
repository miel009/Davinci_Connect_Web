// Script para comprobar custom claims de un usuario por email
// Uso: node checkClaims.js email@dominio.com
// Requiere: backend/src/serviceAccountKey.json

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

const email = process.argv[2];
if (!email) {
  console.error('Uso: node checkClaims.js email@dominio.com');
  process.exit(1);
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log('UID:', user.uid);
    console.log('customClaims:', user.customClaims || {});
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
