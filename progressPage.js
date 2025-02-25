// IMPORT PACKAGES
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.appspot.com",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//////////////////////////////////////////////////////////////////

function toggleBox(element) {
    element.classList.toggle("expanded");
}

async function getByID(collectionName, ID, retrievedData) {
    let ref = doc(db, collectionName, ID);
    let docSnap = await getDoc(ref);
    return docSnap.data()[retrievedData];  
}

function renderDiv() {
    // parent 
    let container = document.getElementById("container");

    // create div inside the container
    let div = document.createElement("div");
    div.classList.add("box");

    // Attach the event 
    div.onclick = () => toggleBox(div);

    // append
    container.appendChild(div);

    return div;
}

function addTXT(txt, div) {
    // create + add + append
    let p = document.createElement("p");
    p.innerText = txt;
    div.appendChild(p);
}

async function renderStudentsInfo() {

    // reference
    let URef = collection(db, "users");

    // documents
    let UDocs = await getDocs(URef);

    // iteratable by foreach <doc>
    UDocs.docs.forEach(async (doc) => {

        // render empty div
        let infoContainer = renderDiv();

        // get data
        let data = doc.data();

        // add txt at rendered here and give him txt which is `student name : ${data.username}`
        addTXT(`Student Name : ${data.name}`, infoContainer);

        // access userCourses
        let userCourses = data.userCourses;

        // loop on keys, value:
        Object.entries(userCourses).forEach(async ([k, v]) => {
            // get course title by course id
            let courseTitle = await getByID("courses", k, "title");

            // add text at rendered here and give him which is `course : ${courseTitle} ${value.progress}`
            addTXT(`Course : ${courseTitle} | progress : ${Math.ceil(v.progress)}`, infoContainer);

            // add progress bar included {value.progress} in the div. [EXTRA]
        });
    });
}

await renderStudentsInfo();
