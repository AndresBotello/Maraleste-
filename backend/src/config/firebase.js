// Firebase Admin SDK - Configuración del servidor (Backend)
const admin = require("firebase-admin");

// Opción 1: Usar Service Account JSON (recomendado para producción)
// Descarga tu clave desde: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// Guarda el archivo como serviceAccountKey.json en backend/src/config/

// Opción 2: Usar variables de entorno
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  const path = require("path");
  const fs = require("fs");
  const keyPath = path.join(__dirname, "maraleste-787b5-firebase-adminsdk-fbsvc-6a2bb8536e.json");
  if (!fs.existsSync(keyPath)) {
    console.error(
      "\n❌ No se encontró la Service Account Key de Firebase.\n" +
      "   Opciones:\n" +
      "   1) Coloca el archivo de clave en backend/src/config/\n" +
      "   2) Define FIREBASE_SERVICE_ACCOUNT_KEY en el archivo .env\n"
    );
    process.exit(1);
  }
  serviceAccount = require("./maraleste-787b5-firebase-adminsdk-fbsvc-6a2bb8536e.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "maraleste-787b5",
  storageBucket: "maraleste-787b5.firebasestorage.app",
});

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, auth, db, storage };
