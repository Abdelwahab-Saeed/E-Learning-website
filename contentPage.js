// IMPORT PACKAGES
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import { 
    getFirestore, collection, addDoc, getDocs, getDoc, deleteDoc, 
    doc, updateDoc, query, where 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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


////////////////////////////////////////////////////////////////////

// will be got by the URL 
let params = new URLSearchParams(document.location.search);
let course = params.get("courseTitle");
const email = params.get("userEmail");
const courseTitle = course;
const userEmail = email;

var courseId = await getIDBased("courses", 'title', courseTitle);
//courseId = "PdJfWT5TQgHeWQ4Hl03s";

///////////////////////////////////////////////////////////////////


// Fetch course data by ID
async function fetchCourseById(courseId) {
    console.log("Fetching data for course ID:", courseId);

    // Reference
    const courseDocRef = doc(db, "courses", courseId);

    // Fetch document
    const courseDoc = await getDoc(courseDocRef);

    // Check if document exists
    if (!courseDoc.exists()) {
        console.warn("Course not found!");
        return null;
    }

    return courseDoc.data();
}


// Convert YouTube link to embed format
function cvtlink(link) {
    if (!link.includes("youtu.be/")) {
        console.error("Invalid YouTube link:", link);
        return "";
    }
    let key = link.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${key}`;
}


// Render course information
function renderCourseInfo(course) {
    if (!course) return;

    // Get bgImage + change src
    document.getElementById("bgImg").src = course.bgImage;

    // Get fgImage + change src
    document.getElementById("fgImg").src = course.image;

    // Get title + change innerText
    document.getElementById("cTitle").innerText = course.title;

    // Get desc + change innerText
    document.getElementById("cDesc").innerText = course.description;
}


// Render course lessons
// Render course lessons
async function renderLessons() {
    // Fetch course data
    let course = await fetchCourseById(courseId);

    // Add course info
    renderCourseInfo(course);

    // Get course content
    let content = course.content;
    let UID = await getIDBased("users", "email", userEmail);
    let Udata = await fetchUserByID(UID);
    const userCourses = Udata.userCourses;
    const clickArr = userCourses[courseId]["clicked"];

    console.log("clickArr = ", clickArr);

    content.forEach((lessonObj, index) => {
        // Create lesson div
        let lessonContentDiv = document.createElement("div");
        lessonContentDiv.classList.add("lessonContentDiv");

        // Create title
        let lessonTitle = document.createElement("h2");
        lessonTitle.innerText = lessonObj.lessonTitle;

        // Create iframe
        let videoIFrame = document.createElement("iframe");
        videoIFrame.classList.add("frameVideo");
        videoIFrame.allowFullscreen = true;
        videoIFrame.src = cvtlink(lessonObj.urlVideo);

        // Create progress button
        let doneBtn = document.createElement("button");
        doneBtn.classList.add("doneBtn");
        doneBtn.innerText = "Done";
        doneBtn.type = "button";

        // Disable button if lesson is already clicked (1)
        doneBtn.disabled = clickArr[index] === 1;

        // Append elements
        lessonContentDiv.appendChild(lessonTitle);
        lessonContentDiv.appendChild(videoIFrame);
        lessonContentDiv.appendChild(doneBtn);

        // Append to contentPageDiv
        document.getElementById("contentPageDiv").appendChild(lessonContentDiv);
    });
}


// ACTION
await renderLessons();




async function fetchUserByID(UID) {

    // refernece
    const usrCollectionRef = collection(db, "users");
    const usrDocRef = doc(usrCollectionRef, UID);

    // doc
    const userDoc = await getDoc(usrDocRef)
    
    //data
    const userData = userDoc.data()
    
    return userData;
}


// Helper func : get id (user , course)
async function getIDBased(collectionName, fieldName, targetValue) {
    let ID = null;

    // rm spaces 
    targetValue = targetValue.replace(/\s/g, "");

    // get data
    const q = query(collection(db, collectionName));
    const Docs = await getDocs(q);

    // filter
    Docs.forEach(doc => {
        const fieldValue = doc.data()[fieldName]?.replace(/\s/g, ""); // rm spaces
        if (fieldValue === targetValue) {ID = doc.id;}
    });

    console.log("ID =", ID);
    return ID;
}


console.log("Hello, I am in contentPage.js"); // Debugging


// Event listener for the "Done" button
document.getElementById("contentPageDiv").addEventListener("click", async function (event) {
    if (event.target.classList.contains("doneBtn")) {
        // Disable the clicked button immediately
        event.target.disabled = true;


        // Get user ID
        let UID = await getIDBased("users", "email", userEmail);

        // Debugging checks
        if (!UID) {
            console.error("User not found.");
            return;
        }
        

        // Get user data
        let usrData = await fetchUserByID(UID);

        // Debugging checks
        if (!usrData || !usrData.userCourses || !usrData.userCourses[courseId]) {
            console.error("User course data not found.");
            return;
        }

        // Get userCourses
        let userCourses = usrData.userCourses;
        let courseData = userCourses[courseId];

        // Calculate lesson index (find position of clicked button)
        let lessonIndex = Array.from(document.querySelectorAll(".doneBtn")).indexOf(event.target);

        // Update clicked array
        let clickedArray = courseData.clicked;
        clickedArray[lessonIndex] = 1; // Mark lesson as completed

        // Calculate percentage
        let len = courseData['AllLessons'];
        let amount = 100 / len;

        // Update progress and finishedLessons
        let newProgress = courseData['progress'] + amount;
        let newFinishedLesson = courseData['finishedLessons'] + 1;

        // Update Firestore
        await updateDoc(doc(db, "users", UID), {
            [`userCourses.${courseId}.progress`]: newProgress,
            [`userCourses.${courseId}.finishedLessons`]: newFinishedLesson,
            [`userCourses.${courseId}.clicked`]: clickedArray
        });

        alert("Progress updated!");
        console.log("Progress updated!");

        //update the progress after clikcking
        showProgress();
    }
});


// GOAL: view progress +  button of quiz, (once 100%)

async function getProgressbyUID(){

    let UID = await getIDBased("users",'email',userEmail);
    let CID = await getIDBased("courses", 'title', courseTitle);

    console.log("UID = ", UID);
    console.log("CID = ", CID);

    let ref = doc(db,"users",UID);
    let Doc = await getDoc(ref);

    console.log("Doc = ",Doc);
    let progress = Doc.data().userCourses[CID]["progress"];


    return progress;
}

async function showProgress(){
    let progress = await getProgressbyUID();
    document.getElementById('progress').innerText = ` Your progress: ${progress}%`;
}

showProgress();


async function getCertificate(){
    const currProgress = await getProgressbyUID();
    if( currProgress == 100 )
    {
        const certificate = document.createElement("button");
        certificate.type ="button";
        certificate.innerHTML = "Get certificate";
        certificate.addEventListener('click', function(event){

            event.preventDefault();

            window.location.href = "Quize.html"

        });
        document.getElementById("contentPageDiv").appendChild(certificate);
    }
}

getCertificate();