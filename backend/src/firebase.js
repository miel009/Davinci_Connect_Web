import admin from "firebase-admin";

let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // Si existe la variable en Render → la usamos
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log(" Credenciales Firebase leídas desde variable de entorno");
  } else {
    // sino, usamos el archivo local
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    serviceAccount = require("../serviceAccountKey.json");
    console.log("Credenciales Firebase cargadas desde archivo local");
  }
} catch (error) {
  console.error(" Error leyendo credenciales de Firebase:", error);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Configurar storageBucket si no está en la variable de entorno
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount && serviceAccount.project_id ? `${serviceAccount.project_id}.appspot.com` : undefined),
    });
    console.log("✅ Firebase Admin inicializado correctamente");
  } catch (initError) {
    console.error("Error inicializando Firebase Admin:", initError);
  }
}

const db = admin.firestore();
export { admin, db };
