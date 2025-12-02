// Script para cambiar la contraseña de un usuario por email usando Admin SDK
// Uso: node changePassword.js email@dominio.com NuevaContraseña
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
const newPassword = process.argv[3];
if (!email || !newPassword) {
  console.error('Uso: node changePassword.js email@dominio.com NuevaContraseña');
  process.exit(1);
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    console.log(`Contraseña actualizada para ${email} (uid: ${user.uid})`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
