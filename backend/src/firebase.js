import admin from "firebase-admin";

let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Si existe la variable en Render → la usamos
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } else {
    // sino, usamos el archivo local
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    serviceAccount = require("../serviceAccountKey.json");
  }
} catch (error) {
  console.error("Error leyendo credenciales de Firebase:", error);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { admin, db };

console.log("✅ Firebase Admin inicializado correctamente");
