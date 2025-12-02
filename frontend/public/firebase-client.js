// Configuración web oficial de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpK7umQfIz-k-8TnBhihHU3V7Y1G36wZM",
  authDomain: "davinciconnect-4817d.firebaseapp.com",
  databaseURL: "https://davinciconnect-4817d-default-rtdb.firebaseio.com",
  projectId: "davinciconnect-4817d",
  storageBucket: "davinciconnect-4817d.appspot.com",
  messagingSenderId: "252502803706",
  appId: "1:252502803706:web:7ff96fbb7e6991d2e7f543"
};

// Inicialización del SDK compat (modo script)
function initFirebaseCompat() {
  // Usamos window.firebase para evitar ReferenceError si el identificador global no existe.
  if (window.firebase && window.firebase.apps && window.firebase.apps.length === 0) {
    window.firebase.initializeApp(firebaseConfig);
    console.log("Firebase cliente inicializado correctamente");
  } else if (!window.firebase) {
    console.error("Firebase SDK no detectado. Faltan scripts CDN.");
  }

  // Exponer funciones para admin.js
  window.__davinciFirebase = {
    signIn: async (email, password) => {
      if (!window.firebase || !window.firebase.auth) throw new Error('Firebase SDK no cargado. Revisa que los scripts CDN estén incluidos antes de firebase-client.js');
      const cred = await window.firebase.auth().signInWithEmailAndPassword(email, password);
      const user = cred.user;
      const token = await user.getIdToken();
      return { token, email: user.email, uid: user.uid };
    },
    signOut: () => window.firebase.auth().signOut(),
    onAuthStateChanged: (cb) => window.firebase.auth().onAuthStateChanged(cb),
    getCurrentUserToken: async () => {
      const u = window.firebase.auth().currentUser;
      return u ? u.getIdToken() : null;
    },
    sendPasswordResetEmail: async (email) => {
      if (!window.firebase || !window.firebase.auth) throw new Error('Firebase SDK no cargado. Revisa que los scripts CDN estén incluidos antes de firebase-client.js');
      await window.firebase.auth().sendPasswordResetEmail(email);
      return true;
    }
  };
}

// Ejecutamos inicialización 
initFirebaseCompat();
