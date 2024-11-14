// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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
const customerlogin = document.getElementById('loginbutton');
customerlogin.addEventListener("click", function(event) {
  event.preventDefault();

  const email = document.getElementById('loginemail').value;
  const password = document.getElementById('loginpassword').value;

  if (!email || !password) {
    alert("Please fill in both email and password");
    return;
  }

  // Sign in the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Login successful");

      // Store user details in localStorage
      localStorage.setItem('userType', 'customer');
      localStorage.setItem('customerEmail', user.email);
      localStorage.setItem('customerUid', user.uid);
      
      
      console.log("User Type in LocalStorage:", localStorage.getItem('userType')); 
      console.log("Customer Email in LocalStorage:", localStorage.getItem('customerEmail')); 
      console.log("Customer UID in LocalStorage:", localStorage.getItem('customerUid')); 

      // Redirect to another page after successful login (e.g., a dashboard)
      window.location.href = "index.html"; 
    })
    .catch((error) => {
      console.error("Error signing in:", error.message);
      alert("Error: " + error.message);
    });
});
