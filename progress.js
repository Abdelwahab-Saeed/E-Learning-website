import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, onSnapshot, updateDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";


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


async function getIDBased(collectionName, fieldName, targetValue) {
    let ID = null;

    // query contains only one doc that matches
    const q = query(collection(db, collectionName), where(fieldName, "==", targetValue));

    // extract user id
    const Docs = await getDocs(q);
    Docs.forEach(doc => { ID = doc.id; });

    // console.log("ID = ", ID);

    return ID;
}

async function getData(collectionName, fieldName, comparableValue, retrievedData) {

    // get ID based on the userEmail
    let ID = await getIDBased(collectionName, fieldName, comparableValue);

    // user collection reference
    let CollectionRef = collection(db, collectionName);

    // user document reference
    let DocRef = doc(CollectionRef, ID);

    // get user document [DATA]
    let Doc = await getDoc(DocRef);

    //console.log(Doc.data()[retrievedData]);

    return Doc.data()[retrievedData];
}


function getUserData() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("User not logged in!");
        return null;
    }
    return loggedInUser;
}


async function fetchCourses() {
    const currUser = getUserData().userEmail;
    console.log("curr user = ", currUser);
    const userCourses = await getData("users", "email", currUser, "userCourses");
    console.log(userCourses);
    console.log(userCourses[0].finishedLessons);
    const coursesContainer = document.querySelector(".container");
    coursesContainer.innerHTML;
}

fetchCourses()
