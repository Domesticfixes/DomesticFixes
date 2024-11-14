// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Firebase configuration for Energybright project (customer)
const customerfirebaseConfig = {
    apiKey: "AIzaSyC5GhldUQRoH4Qjsko0PKiM6vGG7lrFvKk",
  authDomain: "energybright-d1bbd.firebaseapp.com",
  projectId: "energybright-d1bbd",
  storageBucket: "energybright-d1bbd.firebasestorage.app",
  messagingSenderId: "302530911503",
  appId: "1:302530911503:web:36804af986efdc1a6af27a",
  measurementId: "G-BR6CEK3RZD"
};

// Firebase configuration for handyman
const handymanFirebaseConfig = {
  apiKey: "AIzaSyCLQM9r0TFFZbm9t848Y7y3XRE4PHsLJTg",
  authDomain: "energybright-handymen-48ca1.firebaseapp.com",
  projectId: "energybright-handymen-48ca1",
  storageBucket: "energybright-handymen-48ca1.firebasestorage.app",
  messagingSenderId: "207939075042",
  appId: "1:207939075042:web:de2a91a36dee6cdd4ed7bb",
  measurementId: "G-YV9T5VNRB2"
};

// Initialize Firebase for customer and handyman
const customerApp = initializeApp(customerfirebaseConfig, "EnergyBright");
const handymanApp = initializeApp(handymanFirebaseConfig, "EnergyBright Handymen");

// Firestore and Auth for both customer and handyman apps
const customerDb = getFirestore(customerApp);
const customerAuth = getAuth(customerApp);
const handymanAuth = getAuth(handymanApp);

// Function to get the correct Auth instance based on user type
function getCurrentAuth() {
    const userType = localStorage.getItem('userType');
    return userType === 'handyman' ? handymanAuth : customerAuth;
}

// Handle authentication state changes
document.addEventListener('DOMContentLoaded', () => {
    const auth = getCurrentAuth();
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const loginLogoutText = document.getElementById('login-logout-text');
    const loginDropdown = document.getElementById('login-dropdown');
    const welcomeMessage = document.getElementById('welcome-message');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userType = localStorage.getItem('userType');
            const userEmail = user.email;

            // Show logout button and hide login dropdown
            loginLogoutText.textContent = 'Logout';
            loginDropdown.style.display = 'none';

            // Customize greeting based on user type
            if (userType === 'handyman') {
                welcomeMessage.textContent = `Welcome Handyman, ${userEmail}! We're here to streamline your services.`;
            } else {
                welcomeMessage.textContent = `Welcome Customer, ${userEmail}! Enjoy our services for your home.`;

                // Automatically fill the email field in the service request form
                const emailField = document.querySelector('input[placeholder="Email Address"]');
                if (emailField) {
                    emailField.value = userEmail;
                }
            }

            // Logout functionality
            loginLogoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    alert('You have been logged out.');
                    localStorage.removeItem('userType');
                    window.location.reload();
                }).catch((error) => {
                    console.error('Error logging out: ', error);
                });
            });

        } else {
            // User is signed out, show login dropdown
            loginLogoutText.textContent = 'Login';
            loginDropdown.style.display = 'block';
            welcomeMessage.textContent = `Streamline your homeownership with our trusted services, from cleaning to renovations. We ensure you get the best home experience.`;
        }
    });
});

// Function to handle service request form submission (Customer Only)
export function submitForm() {
    const userType = localStorage.getItem('userType');

    // Ensure only customers can book services
    if (userType !== 'customer') {
        alert("Only customers can submit service requests.");
        return;
    }

    const serviceType = document.querySelector('select').value;
    const fullName = document.querySelector('input[placeholder="Full Name"]').value;
    const email = document.querySelector('input[placeholder="Email Address"]').value;
    const phoneNumber = document.querySelector('input[placeholder="Phone Number"]').value;
    const jobDescription = document.querySelector('textarea').value;
    const address = document.querySelector('input[placeholder="Address"]').value;
    const eirCode = document.querySelector('input[placeholder="EIRCode"]').value;
    const dateTime = document.querySelector('input[type="datetime-local"]').value;

    // Basic validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10,15}$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!phonePattern.test(phoneNumber)) {
        alert("Please enter a valid phone number.");
        return;
    }

    if (!serviceType || !fullName || !email || !phoneNumber || !jobDescription || !address || !eirCode || !dateTime) {
        alert("Please fill out all fields before submitting.");
        return;
    }

    // Create request data
    const requestData = {
        serviceType,
        fullName,
        email,
        phoneNumber,
        jobDescription,
        address,
        eirCode,
        dateTime,
        status: "Pending"
    };

    // Disable the submit button to prevent multiple submissions
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    // Save the request to Firestore (customer instance)
    addDoc(collection(customerDb, "serviceRequests"), requestData)
        .then(() => {
            alert("Your service request has been submitted successfully!");
            document.querySelector('form').reset();
            closeModal();
        })
        .catch((error) => {
            console.error("Error submitting request: ", error);
            alert("Error: " + error.message);
        })
        .finally(() => {
            submitButton.disabled = false;
        });
}

// Functions to handle modal display for service request form
export function showModal() {
    document.getElementById('service-modal').style.display = 'flex';
}

export function closeModal() {
    document.getElementById('service-modal').style.display = 'none';
}

// Function to handle contact form submission
export function submitContactForm() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    // Basic validation
    if (!name || !email || !message) {
        alert("Please fill out the required fields.");
        return;
    }

    // Create contact message data
    const contactData = {
        name: name,
        email: email,
        phone: phone || "N/A",
        message: message,
        timestamp: serverTimestamp()
    };

    // Save the contact message to Firestore (customer instance)
    addDoc(collection(customerDb, "contactMessages"), contactData)
        .then(() => {
            alert("Thank you for contacting us! Your message has been sent successfully.");
            document.querySelector("form").reset();
        })
        .catch((error) => {
            console.error("Error submitting contact message: ", error);
            alert("Error: " + error.message);
        });
}

// Attach submitContactForm to form submission on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector("form");
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitContactForm();
    });
});
