// Import Firebase SDKs and necessary services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, doc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Firebase configuration for Energybright project
const handymanfirebaseConfig = {
    apiKey: "AIzaSyC5GhldUQRoH4Qjsko0PKiM6vGG7lrFvKk",
    authDomain: "energybright-d1bbd.firebaseapp.com",
    projectId: "energybright-d1bbd",
    storageBucket: "energybright-d1bbd.firebasestorage.app",
    messagingSenderId: "302530911503",
    appId: "1:302530911503:web:36804af986efdc1a6af27a",
    measurementId: "G-BR6CEK3RZD"
};

// Initialize Firebase
const handymanApp = initializeApp(handymanfirebaseConfig, "EnergyBright Handymen");
const db = getFirestore(handymanApp);
const auth = getAuth(handymanApp);

// Function to display loader
function showLoader() {
    const requestList = document.getElementById('requestlist');
    requestList.innerHTML = "<p>Loading service requests...</p>";
}

// Function to show no requests found message
function showNoRequestsMessage() {
    const requestList = document.getElementById('requestlist');
    requestList.innerHTML = "<p>No service requests available at the moment.</p>";
}

// Function to fetch service requests based on the handyman's selected service
function fetchServiceRequestsBasedOnHandymanService() {
    showLoader();

    const handymanService = localStorage.getItem('handymanService');
    if (!handymanService) {
        alert("No service found. Please login again.");
        return;
    }

    const q = query(collection(db, "serviceRequests"), where("serviceType", "==", handymanService));

    getDocs(q).then((querySnapshot) => {
        const requestList = document.getElementById('requestlist');
        requestList.innerHTML = "";

        if (querySnapshot.empty) {
            showNoRequestsMessage();
        } else {
            querySnapshot.forEach((doc) => {
                const request = doc.data();
                const requestId = doc.id;
                const statusEmoji = getStatusEmoji(request.status);
                const requestItem = document.createElement('div');
                requestItem.className = 'request-item';

                let buttonsHtml = '';
                if (request.status === 'Pending') {
                    buttonsHtml = `
                        <button class="accept-btn" data-id="${requestId}">Accept</button>
                        <button class="decline-btn" data-id="${requestId}">Decline</button>
                    `;
                }

                requestItem.innerHTML = `
                    <h3>${request.serviceType}</h3>
                    <p><strong>Description:</strong> ${request.jobDescription}</p>
                    <p><strong>Date & Time:</strong> ${request.dateTime}</p>
                    <p><strong>Status:</strong> <span class="${request.status.toLowerCase()}">${statusEmoji} ${request.status}</span></p>
                    ${buttonsHtml}
                    <div class="quote-section" id="quote-section-${requestId}" style="display:none;">
                        <input type="number" class="quote-input" placeholder="Enter your quote" data-id="${requestId}" />
                        <button class="quote-btn" data-id="${requestId}">Submit Quote</button>
                    </div>
                `;

                requestList.appendChild(requestItem);
            });

            document.querySelectorAll('.accept-btn').forEach(button => {
                button.addEventListener('click', handleAcceptRequest);
            });

            document.querySelectorAll('.decline-btn').forEach(button => {
                button.addEventListener('click', handleDeclineRequest);
            });

            document.querySelectorAll('.quote-btn').forEach(button => {
                button.addEventListener('click', handleQuoteSubmission);
            });
        }
    }).catch((error) => {
        console.error("Error fetching service requests: ", error);
        alert("Error fetching requests. Please try again later.");
    });
}

// Function to return the appropriate emoji for each status
function getStatusEmoji(status) {
    switch (status) {
        case 'Pending':
            return '🕒';
        case 'Accepted':
            return '👍';
        case 'Declined':
            return '❌';
        case 'Quote Submitted':
            return '💬';
        case 'Quote Accepted':
            return '✔️';
        case 'In Progress':
            return '🔧';
        case 'Completed':
            return '✅';
        case 'Canceled':
            return '🚫';
        case 'Paid':
            return '💰';
        default:
            return '';
    }
}

// Function to handle Accept action
function handleAcceptRequest(event) {
    const requestId = event.target.getAttribute('data-id');
    document.getElementById(`quote-section-${requestId}`).style.display = 'block';
    event.target.disabled = true;
}

// Function to handle Decline action
async function handleDeclineRequest(event) {
    const requestId = event.target.getAttribute('data-id');
    try {
        await deleteDoc(doc(db, 'serviceRequests', requestId));
        alert("Request declined and removed from your dashboard.");
        fetchServiceRequestsBasedOnHandymanService();
    } catch (error) {
        console.error("Error declining request: ", error);
        alert("Error: Could not decline the request.");
    }
}

// Display logged-in user info
function displayUserInfo() {
    const userInfoDiv = document.getElementById('user-info');
    const handymanEmail = localStorage.getItem('handymanEmail');
    const handymanUid = localStorage.getItem('handymanUid');

    if (handymanEmail && handymanUid) {
        userInfoDiv.innerHTML = `<p>Logged in as: ${handymanEmail} (UID: ${handymanUid})</p>`;
        console.log("Displaying logged-in handyman:", handymanUid);
    } else {
        userInfoDiv.innerHTML = "<p>Logged in as: no user</p>";
        console.log("No user data found in localStorage.");
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserInfo();
        fetchServiceRequestsBasedOnHandymanService();
    } else {
        displayUserInfo(); // Shows "no user" message
    }
});

async function handleQuoteSubmission(event) {
    const requestId = event.target.getAttribute('data-id');
    const inputField = document.querySelector(`input[data-id="${requestId}"]`);
    const quoteValue = inputField.value;
    
    // Retrieve handyman details from localStorage
    const handymanId = localStorage.getItem('handymanUid');
    const handymanEmail = localStorage.getItem('handymanEmail');
    const handymanName = localStorage.getItem('handymanFullName');  // Ensure this is stored in localStorage during login
    const handymanphonenumber = localStorage.getItem('handymanPhoneNumber');  // Ensure this is stored in localStorage during login

    if (!handymanId) {
        alert('User not authenticated. Please login again.');
        return;
    }

    if (!quoteValue || isNaN(quoteValue)) {
        alert('Please enter a valid quote');
        return;
    }

    try {
        const quotesCollectionRef = collection(db, 'quotes');
        await addDoc(quotesCollectionRef, {
            requestId: requestId,
            handymanId: handymanId,
            handymanEmail: handymanEmail,
            handymanName: handymanName,
            handymanphonenumber: handymanphonenumber,
            quoteAmount: quoteValue,
            status: 'Quote Submitted',
            timestamp: new Date()
        });

        // Update the status in the serviceRequests collection
        const requestDocRef = doc(db, 'serviceRequests', requestId);
        await updateDoc(requestDocRef, { status: 'Quote Submitted' });

        alert('Quote submitted successfully!');
        fetchServiceRequestsBasedOnHandymanService();  // Refresh the list after submitting the quote
    } catch (error) {
        console.error('Error submitting quote:', error);
        alert('There was an error submitting your quote. Please try again later.');
    }
}



// Initial fetch on page load
displayUserInfo();
fetchServiceRequestsBasedOnHandymanService();
