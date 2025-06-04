import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNv65fs5kSVqS1QHPQ12r_S9443ZE-N-8",
  authDomain: "schedulr-68d3b.firebaseapp.com",
  projectId: "schedulr-68d3b",
  storageBucket: "schedulr-68d3b.appspot.com",
  messagingSenderId: "376263031544",
  appId: "1:376263031544:web:bcbde904e270bd5ae3590d",
  measurementId: "G-9GNPLQ4XNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the form and status message elements
const form = document.getElementById("addTeacherForm");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherName = document.getElementById("teacherName").value;
  const teacherEmail = document.getElementById("teacherEmail").value;
  const teacherPassword = document.getElementById("teacherPassword").value;
  const teacherSubject = document.getElementById("teacherSubject").value;

  try {
    // Step 1: Create teacher in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
    const user = userCredential.user;

    // Step 2: Store additional teacher information in Firestore
    const docRef = await addDoc(collection(db, "teachers"), {
      name: teacherName,
      email: teacherEmail,
      subject: teacherSubject,
      uid: user.uid, // Store the Firebase user UID for reference
    });

    // Step 3: Provide success feedback
    statusMessage.style.color = "green";
    statusMessage.textContent = `Teacher added successfully: ${teacherName}`;

    // Clear the form after successful submission
    form.reset();
  } catch (error) {
    // Step 4: Handle errors and provide feedback
    statusMessage.style.color = "red";
    statusMessage.textContent = `Error adding teacher: ${error.message}`;
  }
});
