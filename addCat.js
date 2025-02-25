// IMPORT PACKAGES
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.firebasestorage.app",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b"
};

// APP | DB
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("subBtn");
    const form = document.forms[0];

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const { catName, catId, oldCatName } = form.elements;
        const userInput = catName.value.trim();
        
        if (!/^[a-zA-Z\s]{2,}$/.test(userInput)) {
            return alert("Invalid category name. Only letters, at least 2.");
        }

        try {
            if (await isDuplicateCategory(userInput, catId.value)) {
                return alert("Category already exists!");
            }

            if (catId.value) {
                await updateCategory(catId.value, userInput, oldCatName.value);
            } else {
                await addDoc(collection(db, "categories"), { name: userInput });
            }
            resetFormFields();
            displayCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("An error occurred while saving the category.");
        }
    });
    
    async function isDuplicateCategory(name, id) {
        const catquery = query(collection(db, "categories"));
        const snapshot = await getDocs(catquery);
        return snapshot.docs.some(doc => doc.data().name.toLowerCase() === name.toLowerCase() && doc.id !== id);
    }

    async function updateCategory(id, newName, oldName) {
        await updateDoc(doc(db, "categories", id), { name: newName });
        await updateRelatedCourses(oldName, newName);
    }

    async function updateRelatedCourses(oldName, newName) {
        const q = query(collection(db, "courses"), where("category", "==", oldName));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.update(doc.ref, { category: newName }));
        await batch.commit();
    }

    function resetFormFields() {
        form.reset();
        form.elements["catId"].value = "";
        form.elements["oldCatName"].value = "";
        submitBtn.textContent = "Add Category";
    }

    async function displayCategories() {
        const snapshot = await getDocs(collection(db, "categories"));
        document.querySelector("tbody").innerHTML = snapshot.docs.map(doc => {
            return `<tr>
                        <td>${doc.data().name}</td>
                        <td><button class="update" data-id="${doc.id}">Update</button></td>
                        <td><button class="delete" data-id="${doc.id}">Delete</button></td>
                    </tr>`;
        }).join("");

        document.querySelectorAll(".update").forEach(btn => btn.addEventListener("click", () => updateCategoryForm(btn.dataset.id)));
        document.querySelectorAll(".delete").forEach(btn => btn.addEventListener("click", () => confirmDelete(btn.dataset.id)));
    }

    async function updateCategoryForm(id) {
        const docSnap = await getDoc(doc(db, "categories", id));
        if (!docSnap.exists()) return alert("Category not found.");
        
        form.elements["catName"].value = docSnap.data().name;
        form.elements["catId"].value = id;
        form.elements["oldCatName"].value = docSnap.data().name;
        submitBtn.textContent = "Update Category";
    }

    async function confirmDelete(id) {
        if (confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(id);
            displayCategories();
        }
    }

    async function deleteCategory(id) {
        const docSnap = await getDoc(doc(db, "categories", id));
        if (!docSnap.exists()) return alert("Category not found.");
        
        const categoryName = docSnap.data().name;
        await deleteRelatedCourses(categoryName);
        await deleteDoc(doc(db, "categories", id));
    }

    async function deleteRelatedCourses(categoryName) {
        const q = query(collection(db, "courses"), where("category", "==", categoryName));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }

    displayCategories();
});
