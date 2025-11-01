import admin from "firebase-admin";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://davinciconnect-4817d.firebaseio.com"
});

const db = admin.firestore();

export { admin, db };
console.log("Firebase Admin inicializado ✅");