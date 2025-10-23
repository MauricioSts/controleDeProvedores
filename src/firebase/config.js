// Importa o Firebase App
import { initializeApp } from "firebase/app";
// ❗️IMPORTANTE: você precisa importar o getFirestore
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxzOeyQrTTt4f13fpvLRvN8-eBvC4HhJs",
  authDomain: "provedores-112c7.firebaseapp.com",
  projectId: "provedores-112c7",
  storageBucket: "provedores-112c7.firebasestorage.app",
  messagingSenderId: "184171118487",
  appId: "1:184171118487:web:582f86e60d8e8311a58ed2",
  measurementId: "G-XED4C84V1R",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

// Exporta para usar em outros arquivos
export { db };
