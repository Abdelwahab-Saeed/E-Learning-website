import {collection, getDocs, db} from "./FirebaseConfig.js";

// Fetch categories from Firestore
async function getCat() {
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = '<option value="">Select a category</option>';

    const data = await getDocs(collection(db, "categories"));
    data.forEach((doc) => {
        const category = doc.data().name;
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}


export {getCat}