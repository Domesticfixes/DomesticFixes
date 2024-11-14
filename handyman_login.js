// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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
const db = getFirestore(handymanApp); // Initialize Firestore

// Function to fetch handyman's selected service from Firestore
async function fetchHandymanDetails(userId) {
    const handymanDocRef = doc(db, "handymen", userId);  // Reference to handyman's document
    const docSnapshot = await getDoc(handymanDocRef);

    if (docSnapshot.exists()) {
        const handymanData = docSnapshot.data();
        return {
            service: handymanData.service,
            fullName: handymanData.fullName,
            phoneNumber: handymanData.phoneNumber,
            email: handymanData.email  // Ensure all needed fields are returned
        };
    } else {
        throw new Error("No handyman data found");
    }
}

// Get the login button and attach event listener
const handyLoginButton = document.getElementById('handybutton');
handyLoginButton.addEventListener('click', async function(event) {
    event.preventDefault();

    const email = document.getElementById('handyemail').value;
    const password = document.getElementById('handypassword').value;

    if (!email || !password) {
        alert("Please fill in both email and password");
        return;
    }

    try {
        // Sign in the handyman
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login successful for user:", user.uid);

        // Fetch the handyman's details from Firestore
        const handymanDetails = await fetchHandymanDetails(user.uid);

        if (handymanDetails) {
            console.log("Handyman's details:", handymanDetails);

            // Store UID, email, service, full name, and phone number in localStorage
            localStorage.setItem('userType', 'handyman');
            localStorage.setItem('handymanService', handymanDetails.service);
            localStorage.setItem('handymanUid', user.uid);  // Store UID
            localStorage.setItem('handymanEmail', handymanDetails.email);  // Store email
            localStorage.setItem('handymanFullName', handymanDetails.fullName);  // Store full name
            localStorage.setItem('handymanPhoneNumber', handymanDetails.phoneNumber);  // Store phone number

            // Confirm data is stored in localStorage
            console.log("Handyman UID in LocalStorage:", localStorage.getItem('handymanUid'));
            console.log("Handyman Email in LocalStorage:", localStorage.getItem('handymanEmail'));
            console.log("Handyman Service in LocalStorage:", localStorage.getItem('handymanService'));
            console.log("User Type in LocalStorage:", localStorage.getItem('userType'));
            console.log("Handyman Full Name in LocalStorage:", localStorage.getItem('handymanFullName'));
            console.log("Handyman Phone Number in LocalStorage:", localStorage.getItem('handymanPhoneNumber'));

            // Redirect to dashboard (index.html) after successful login and fetching service
            window.location.href = "index.html"; 
        } else {
            console.error("Error: No handyman details found.");
            alert("No details found for this handyman.");
        }
    } catch (error) {
        console.error("Error during login or fetching details:", error.message);
        alert("Error: " + error.message);
    }
});