import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, onSnapshot, updateDoc, doc, deleteDoc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";


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

function loadPendingEnrollments() {

    // access
    const enrollmentTable = document.getElementById("enrollmentTable");
    // init
    enrollmentTable.innerHTML = "";

    // get enrollement reference
    const enrollmentsRef = collection(db, "enrollments");

    // onSnapshot ??
    onSnapshot(enrollmentsRef, (snapshot) => {

        // init
        enrollmentTable.innerHTML = ""; 

        // get documents + loop
        snapshot.docs.forEach((docSnap) => {

            // get data
            let enrollment = docSnap.data();

            // condition
            if (enrollment.status === "pending") {
                
                // adding inside table
                // ALTERATION : CHANGE [docSnap.id] => [enrollment.userId]
                enrollmentTable.innerHTML += `
                    <tr class="border">
                        <td class="border p-2">${enrollment.userId}</td>
                        <td class="border p-2">${enrollment.courseTitle}</td>
                        <td class="border p-2">
                            <button onclick="approveEnrollment('${docSnap.id}')" class="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                            <button onclick="rejectEnrollment('${docSnap.id}')" class="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                        </td>
                    </tr>
                `;
            }
        });
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////

async function getIDBased(collectionName, fieldName, targetValue, output) {
    let ID = null;

    // query contains only one doc that matches
    const q = query(collection(db, collectionName), where(fieldName, "==", targetValue)); 

    // extract user id
    const Docs = await getDocs(q);
    Docs.forEach(doc => { ID = doc.id; });

    console.log(`${output} ID = `, ID);

    return ID;
}

//---------------------------


async function getNumLesson(collectionName,CID){

    // get 'specific course' reference <use ID>
    let coures_ref = doc(collection(db, collectionName), CID);

    // get doc course
    let courseDoc = await getDoc(coures_ref);

    // get Data
    let len = courseDoc.data().content.length;
    
    return len;
}


//---------------------------



async function addCourse2Usr(UID, CID) {

    // course doc reference <use ID>
    let docRef = doc(db, "users", UID);

    // get <num of lessons> on <content> for <course>
    let len = await getNumLesson("courses", CID);

    // make aray of zeros using len
    let clickArr = Array(len).fill(0);

    console.log("created click array = ", clickArr);

    // Update userCourses 
    await updateDoc(docRef, {
        [`userCourses.${CID}`]: {  
            "finishedLessons": 0, 
            "AllLessons": len, 
            "progress": 0,
            "clicked": clickArr
        }
    });

    console.log("Added successfully!");
}


async function get_UsrEmail_CourseEmail(orderRef){

    let orderDoc =  await getDoc(orderRef);

    let order = orderDoc.data();

    console.log("order = ", order); //debug

    let usrEmail = order.userId; 
    let courseTitle =  order.courseTitle;

    console.log("usrEmail = ", usrEmail);
    console.log("courseTitle = ", courseTitle);
    

    return [usrEmail, courseTitle]

}

////////////////////////////////////////////////////////////////////////////////////////////////

// included inside loading function
async function approveEnrollment(enrollID) {

    console.log("enrollement id = ", enrollID); // debug:

    // get order reference
    const orderRef = doc(db, "enrollments", enrollID);

    // Main job: Update enrollment status
    await updateDoc(orderRef, { 
        status: "approved", 
        progress: 0
    });

    //------------FIXED CODE------------------------------------

    // get user email, course title  <from enroll ID>
    let [usrEmail, courseTitle] = await get_UsrEmail_CourseEmail(orderRef);

    // get user id , course id 
    let UID = await getIDBased("users", "email", usrEmail, "user ");
    let CID = await getIDBased("courses", "title", courseTitle, "course ");

    // add 
    await addCourse2Usr(UID, CID);
    alert("Enrollment approved and progress initialized!");
    

    //----------------END---------------------------------------
}



// included inside loading function
async function rejectEnrollment(enrollmentId) {
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    await deleteDoc(enrollmentRef); 
    alert("Enrollment rejected!");
}

window.onload = () => {
    loadPendingEnrollments();
};

window.approveEnrollment = approveEnrollment;
window.rejectEnrollment = rejectEnrollment;