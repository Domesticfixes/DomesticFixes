// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const customerfirebaseConfig = {
  apiKey: "AIzaSyC5GhldUQRoH4Qjsko0PKiM6vGG7lrFvKk",
  authDomain: "energybright-d1bbd.firebaseapp.com",
  projectId: "energybright-d1bbd",
  storageBucket: "energybright-d1bbd.firebasestorage.app",
  messagingSenderId: "302530911503",
  appId: "1:302530911503:web:36804af986efdc1a6af27a",
  measurementId: "G-BR6CEK3RZD"
};

// Initialize Firebase
const customerApp = initializeApp(customerfirebaseConfig, "EnergyBright");
const auth = getAuth(customerApp);
// Get button and attach event listener
const customersignup = document.getElementById('signupbutton');
customersignup.addEventListener("click", function(event) {
  event.preventDefault();

  const email = document.getElementById('signupemail').value;
  const password = document.getElementById('signuppassword').value;

  // Ensure both email and password are filled in before continuing
  if (!email || !password) {
    alert("Please fill in both email and password");
    return;
  }

  console.log("Creating account..."); // Debug message

  // Create user account with Firebase Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Account created successfully"); // Debug message
    window.location.href = "customer_login.html"
    })
    .catch((error) => {
      console.error("Error creating account: ", error.message); // Log error for debugging
      alert("Error: " + error.message); // Show error message
    });
});
