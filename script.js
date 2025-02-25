document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const nameInput = document.querySelector("input[type='text']");
    const emailInput = document.querySelector("input[type='email']");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    
    
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors();

        if (!validateName()) return;
        if (!validateEmail()) return;
        if (!validatePassword()) return;
        if (!validateConfirmPassword()) return;

        // Register the user in Firestore
        registerUser();

        // Success message and reset form
        alert("Registration successful!");
        form.reset();
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

        // Check if the email already exists in Firestore
        const q = query(usersCollection, where("email", "==", emailInput.value.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            showError(emailInput, "Email is already registered.");
            return;
        }

        // If the email is unique, add the new user to Firestore
        const newUser = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim(), // In real applications, you should hash the password!
        };

        try {
            // Add user document to Firestore
            await addDoc(usersCollection, newUser);
            console.log("User registered:", newUser);
        } catch (error) {
            console.error("Error registering user:", error);
            showError(form, "Error registering user. Please try again.");
        }
    }
});
