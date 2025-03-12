import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.firebasestorage.app",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors();

        if (!validateName()) return;
        if (!validateEmail()) return;
        if (!validatePassword()) return;
        if (!validateConfirmPassword()) return;

        registerUser();
    });

    function validateName() {
        const name = nameInput.value.trim();
        const nameRegex = /^[A-Za-zÀ-ÿ]+(_[A-Za-zÀ-ÿ]+)?$/;

        if (!nameRegex.test(name)) {
            showError(nameInput, "Invalid Name! Enter the name without spaces or numbers. You can use '_' instead.");
            return false;
        }
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showError(emailInput, "Invalid email format.");
            return false;
        }
        return true;
    }

    function validatePassword() {
        if (passwordInput.value.length < 6) {
            showError(passwordInput, "Password must be at least 6 characters.");
            return false;
        }
        return true;
    }

    function validateConfirmPassword() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, "Passwords do not match.");
            return false;
        }
        return true;
    }

    function showError(input, message) {
        const error = document.createElement("div");
        error.className = "error-message";
        error.textContent = message;
        input.parentElement.appendChild(error);
        input.classList.add("error");
    }

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(error => error.remove());
        document.querySelectorAll(".error").forEach(input => input.classList.remove("error"));
    }

    async function registerUser() {
        const usersCollection = collection(db, "users");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const userCourses = {};

        const q = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            showError(emailInput, "Email is already registered.");
            return;
        }

        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const newUser = {
                name,
                email,
                uid: userCredential.user.uid,
                userCourses
            };


            await addDoc(usersCollection, newUser);
            alert("Registration successful!");
            form.reset();
        } catch (error) {
            console.error("Error registering user:", error);
            showError(form, "Error registering user. Please try again.");
        }
    }
});