import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.appspot.com",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const redirect = urlParams.get("redirect");
if (redirect) {
    window.location.href = redirect;
}

function saveUserData(userEmail) {
    let userData = JSON.parse(localStorage.getItem(userEmail));

    if (!userData) {
        userData = { userEmail, wishlist: [], enrolledCourses: [] };
    }

    localStorage.setItem("loggedInUser", JSON.stringify(userData));
    localStorage.setItem(userEmail, JSON.stringify(userData));
}

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        const adminEmail = "mrihan@iti.gov.eg";
        const adminPassword = "1234567";

        document.getElementById("emailError").textContent = "";
        document.getElementById("passwordError").textContent = "";

        if (!email) {
            document.getElementById("emailError").textContent =
                "Email is required";
            return;
        }

        if (!password) {
            document.getElementById("passwordError").textContent =
                "Password is required";
            return;
        }

        let emailPattern = /^[a-zA-Z0-9._%+-]+@iti\.gov\.eg$/;

        try {
            if (email === adminEmail && password === adminPassword) {
                alert("Admin login successful");
                window.location.href = "admin_dashboard.html";
                return;
            } else {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
                const user = userCredential.user;

                alert(
                    "Student login successful! Welcome to Learn World   " +
                    user.email
                );

                saveUserData(email);
                window.location.href = "userinterface.html";

                return;
            }
        } catch (error) {
            document.getElementById("passwordError").textContent =
                "Incorrect email or password";
        }
    });