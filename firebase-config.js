import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNv65fs5kSVqS1QHPQ12r_S9443ZE-N-8",
  authDomain: "schedulr-68d3b.firebaseapp.com",
  projectId: "schedulr-68d3b",
  storageBucket: "schedulr-68d3b.appspot.com",
  messagingSenderId: "376263031544",
  appId: "1:376263031544:web:bcbde904e270bd5ae3590d",
  measurementId: "G-9GNPLQ4XNE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, setDoc, getDocs, deleteDoc };
