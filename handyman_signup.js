// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Firebase configuration for Handyman Authentication
const handymanFirebaseConfig = {
  apiKey: "AIzaSyCLQM9r0TFFZbm9t848Y7y3XRE4PHsLJTg",
  authDomain: "energybright-handymen-48ca1.firebaseapp.com",
  projectId: "energybright-handymen-48ca1",
  storageBucket: "energybright-handymen-48ca1.firebasestorage.app",
  messagingSenderId: "207939075042",
  appId: "1:207939075042:web:de2a91a36dee6cdd4ed7bb",
  measurementId: "G-YV9T5VNRB2"
};

// Initialize Firebase
const handymanApp = initializeApp(handymanFirebaseConfig, "EnergyBright Handymen");
const auth = getAuth(handymanApp);

const db = getFirestore(handymanApp);  // Initialize Firestore

// Get the signup form and handle the submit event
const signupForm = document.getElementById('signupform');
signupForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('handymansignupemail').value;
  const password = document.getElementById('handymansignuppassword').value;
  const fullName = document.getElementById('handymansignupfullname').value;
  const phoneNumber = document.getElementById('handymansignupphonenumber').value;
  const accountName = document.getElementById('handymansignupaccountname').value;
  const service = document.getElementById('handymansignupservices').value;

  if (!email || !password || !fullName || !phoneNumber || !accountName || !service) {
    alert("Please fill out all fields.");
    return;
  }

  // Create user in Firebase Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Save user data in Firestore after successful signup
      return setDoc(doc(db, "handymen", user.uid), {
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        accountName: accountName,
        service: service,
        uid: user.uid,
      });
    })
    .then(() => {
      alert("Handyman signup successful!");
      // Redirect to the index page or dashboard after successful signup
      window.location.href = "handyman_login.html";
    })
    .catch((error) => {
      console.error("Error during signup: ", error.message);
      alert("Error: " + error.message);
    });
});
