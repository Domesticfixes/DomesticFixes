// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, doc, collection, query, where, getDocs, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Firebase configuration for Energybright project
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
const db = getFirestore(customerApp);

// Function to display loader
function showLoader() {
    const quotesList = document.getElementById('quotes-list');
    quotesList.innerHTML = "<p>Loading service requests...</p>";
}

// Function to show no requests found message
function showNoRequestsMessage() {
    const quotesList = document.getElementById('quotes-list');
    quotesList.innerHTML = "<p>No service requests found for your account.</p>";
}

// Function to fetch customer-specific service requests from Firestore
function fetchCustomerRequests(userEmail) {
    showLoader();
    
    const q = query(collection(db, "serviceRequests"), where("email", "==", userEmail));

    getDocs(q).then((querySnapshot) => {
        const quotesList = document.getElementById('quotes-list');
        quotesList.innerHTML = "";

        if (querySnapshot.empty) {
            showNoRequestsMessage();
        } else {
            querySnapshot.forEach((doc) => {
                const request = doc.data();
                const requestId = doc.id;
                const quoteItem = document.createElement('div');
                quoteItem.className = 'quote-item';

                let viewQuoteLink = `<a href="#" onclick="openQuoteModal('${requestId}')">View the Quote Here</a>`;

                quoteItem.innerHTML = `
                    <h3>${request.serviceType}</h3>
                    <p><strong>Description:</strong> ${request.jobDescription}</p>
                    <p><strong>Date & Time:</strong> ${request.dateTime}</p>
                    <p><strong>Status:</strong> 
                        <span class="${request.status.toLowerCase()}">${request.status}</span>
                    </p>
                    ${viewQuoteLink}
                `;

                quotesList.appendChild(quoteItem);
            });
        }
    }).catch((error) => {
        console.error("Error fetching service requests:", error);
        alert("Error fetching your requests. Please try again later.");
    });
}

// Function to open the quote modal and display all quotes and handyman details for a specific requestId
window.openQuoteModal = async function(requestId) {
    const modal = document.getElementById("handyman-quote-modal");
    const handymanQuoteList = document.getElementById("handyman-quote-list");

    // Clear previous content
    handymanQuoteList.innerHTML = "";

    try {
        // Query the quotes collection for the specific requestId
        const q = query(collection(db, "quotes"), where("requestId", "==", requestId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((quoteDoc) => {
                const quoteData = quoteDoc.data();
                const quoteId = quoteDoc.id;

                // Create a new list item for each quote
                const quoteItem = document.createElement("div");
                quoteItem.className = "quote-item";
                quoteItem.id = `quote-${quoteId}`;
                quoteItem.innerHTML = `
                    <div class="quote-details">
                        <p><strong>Quote Amount:</strong> ${quoteData.quoteAmount} EUR</p>
                        <p><strong>Name:</strong> ${quoteData.handymanName}</p>
                        <p><strong>Email:</strong> ${quoteData.handymanEmail}</p>
                        <p><strong>Phone Number:</strong> ${quoteData.handymanphonenumber}</p>
                    </div>
                    <div class="action-icons">
                        <span class="blinking-text">Block ${quoteData.handymanName} now!!!</span>
                        <img src="images/accept.png" alt="Accept" style="width: 30px; height: 30px; cursor: pointer;" onclick="handleAcceptQuote('${quoteId}')">
                    </div>
                    <hr>
                `;

                handymanQuoteList.appendChild(quoteItem);
            });
        } else {
            handymanQuoteList.innerHTML = "<p>No quotes available</p>";
        }
    } catch (error) {
        console.error("Error fetching quotes or handyman details:", error);
        handymanQuoteList.innerHTML = "<p>Error loading quotes</p>";
    }

    // Show the modal
    modal.style.display = "flex";
};

// Function to handle Accept action for a quote
window.handleAcceptQuote = async function(quoteId) {
    console.log("Accept clicked for quote:", quoteId);
    const quoteDocRef = doc(db, 'quotes', quoteId);

    try {
        // Step 1: Fetch the quote document to get handyman details and requestId
        const quoteDoc = await getDoc(quoteDocRef);
        if (quoteDoc.exists()) {
            const quoteData = quoteDoc.data();
            const handymanEmail = quoteData.handymanEmail;
            const handymanName = quoteData.handymanName;
            const quoteAmount = quoteData.quoteAmount;
            const requestId = quoteData.requestId; // Assuming requestId is saved in the quote document

            // Step 2: Use requestId to fetch customer data from serviceRequests
            const requestDocRef = doc(db, 'serviceRequests', requestId);
            const requestDoc = await getDoc(requestDocRef);
            if (requestDoc.exists()) {
                const requestData = requestDoc.data();
                const customerEmail = requestData.email;
                const customerName = requestData.fullName;
                const serviceType = requestData.serviceType;
                const customerPhoneNumber = requestData.phoneNumber;
                const customerAddress = requestData.address;
                 // Get customer email from serviceRequests

                // Step 3: Update the quote status to 'Accepted' in Firestore
                await updateDoc(quoteDocRef, { status: 'Accepted' });
                console.log("Quote accepted and updated in Firestore.");

                // Step 4: API call to send the emails
                const response = await fetch("http://localhost:3001/api/accept-quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customerEmail, handymanEmail, handymanName, quoteAmount, customerName,serviceType,customerPhoneNumber,customerAddress })
                });

                if (response.ok) {
                    console.log("Emails sent successfully.");
                     // Open payment link
                     window.open('https://www.paypal.com/ncp/payment/GQH5VTSY94QK8', '_blank');
                } else {
                    console.error("Failed to send emails:", response.statusText);
                }

               

            } else {
                console.error("Service request not found in Firestore.");
                alert("Error: Service request not found.");
            }

        } else {
            console.error("Quote not found in Firestore.");
            alert("Error: Quote not found.");
        }

    } catch (error) {
        console.error("Error in handleAcceptQuote:", error);
        alert("Error: Could not accept the quote.");
    }
};


// Function to close the modal
window.closeQuoteModal = function() {
    document.getElementById("handyman-quote-modal").style.display = "none";
};

// Listen for the authenticated user
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Log the customer's UID and email
        console.log("Logged-in Customer UID:", user.uid);
        console.log("Logged-in Customer Email:", user.email);

        // Display the logged-in user's UID and email on the dashboard
        const userInfoDiv = document.getElementById('user-info');
        userInfoDiv.innerHTML = `<p><strong>UID:</strong> ${user.uid}</p><p><strong>Email:</strong> ${user.email}</p>`;

        // Fetch and display their service requests
        fetchCustomerRequests(user.email);
    } else {
        // Redirect to login if the user is not authenticated
        window.location.href = "customer_login.html";
    }
});
