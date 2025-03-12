import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

const auth = getAuth();

function getCurrentUserId() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user.uid); // Returns the user ID
            } else {
                reject("No user is logged in");
            }
        });
    });
}

// Example Usage
getCurrentUserId().then(userId => {
    console.log("Current User ID:", userId);
}).catch(error => {
    console.error(error);
});