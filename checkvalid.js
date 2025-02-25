// IMPORT PACKAGES
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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



//-----------------------------------
//if exist ? do nothing : fire
function checkEmpty(obj) {
    return !obj.value.trim(); 
}

function checkLimit(obj) {
    return obj.value.length > 200;
}

//---------------------------------------------------------

function checkStrIncluded(obj) { 
    const regex = /[A-Za-z]/;  
    return !regex.test(obj.value.trim());  
}
function checkStringOnly(obj) {
    const regex = /^[A-Za-z\s]+$/; 
    return !regex.test(obj.value.trim());  
}

function checkSpecialChars(obj) {
    const regex = /[!@#$%^&*()_+={}:;"'<>,.?/\\|`~]/;
    return regex.test(obj.value); 
}

//--------------------------------------------------------

function checkLink(obj) {
    const regex = /^(https?:\/\/[^\s]+)$/;
    return !regex.test(obj.value);  
}

//-------------------------------------------------------

function checkNum(obj) {
    const regex = /^\d+(\.\d+)?$/;
    return !regex.test(obj.value);  
}



//-------maintainance--------------------------

async function checkUniue(target, flagRef) {

    // reference 
    let coursesCollection = collection(db,"courses");
    
    // docs
    let coursesDocs = await getDocs(coursesCollection);
    
    // convert docs to title [extraction]
    let titles = coursesDocs.docs.map(doc => doc.data().title.trim());

    console.log("target = ", target.value.trim()); //debug
    console.log("titles = ", titles);      //debug
    
    flagRef.value = titles.includes(target.value.trim());

    return flagRef.value;
}
//-----------------------------------------------

function checking(arr, checkCond, flagRef, msg) {
    for (let e of arr) {
        if (checkCond(e)) {
            alert(e.id + ": " + msg);
            flagRef.value = true;
            break;
        }
    }
}

async function awaitChecking(arr, checkCond, flagRef, msg){

    for(let e of arr){ 

        let checkResult = await checkCond(e, flagRef);

        if(checkResult){ 
            alert(msg);
            flagRef.value = true;
            break;
        }
    }
}





function get(id) { return document.getElementById(id); }
function getC(c) { return document.getElementsByClassName(c); }

//================================================================

async function checkValid() {

    var flagRef = { value: false }; // reference 

    let courseTitle = get("courseTitle");
    let fgimage = get("image");
    let bgimage = get("bgImage");
    let category = get("category");
    let instructor = get("instructor");
    let desc = get("description");
    let accessType = get("accessType");
    let price = get("price");
    let duration = get("duration");

    // type class
    let lessonTitle = getC("lessonTitle");
    let videoURL = getC("videoURL")

    //---CHECK EMPTY------------------------------------------
    let checkEmptyList = [
        courseTitle,
        fgimage,
        bgimage,
        category,
        instructor,
        desc,
        duration
    ];
    let msg = "empty is not allowed";
    checking(checkEmptyList, checkEmpty, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done empty checks"); // debug

    //-----------CHECK STRING INCLUDED----------------------
    let checkStrInludedList = [
        courseTitle,
        desc
    ];
    msg = "should be at least some text";
    checking(checkStrInludedList, checkStrIncluded, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done string included checks"); // debug

    //----------CHECK STRING ONLY---------------------------
    let checkStrOnlyList = [instructor];
    msg = "should be text";
    checking(checkStrOnlyList, checkStringOnly, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done string only checks"); // debug
    
    //--------CHECK-STR-UNIQUE------------------------------

    let uniqueList = [courseTitle];
    msg = "course title already exist!. enter different title";

    await awaitChecking(uniqueList, checkUniue, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done unique checks"); // debug

    //-------CHECK LIMIT------------------------------------
    let checkLimitList50 = [
        courseTitle,
        instructor,
        desc
    ];

    msg = "Exceed the limit of text (more than 100 characters)";
    checking(checkLimitList50, checkLimit, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done check limit"); // debug

    //-----CHECK NUM----------------------------------------
    let checkNumList = [duration];

    msg = "should be a number";
    checking(checkNumList, checkNum, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done numbers checks"); // debug

    //--------CHECK SPECIAL CHARACTER-----------------------
    let checkSCharsList = [
        courseTitle,
        instructor
    ];

    msg = "special character is not allowed";
    checking(checkSCharsList, checkSpecialChars, flagRef, msg);
    if (flagRef.value) return true;

    // CHECK LINK:
    let checkLinkList = [
        fgimage,
        bgimage
    ];

    msg = "doesn't represent a link";
    checking(checkLinkList, checkLink, flagRef, msg);
    if (flagRef.value) return true;

    console.log("done special characters checks"); // debug

    //----CHECK TITLE OF THE LESSON-----------------------
    for (let e of lessonTitle) {
        console.log("element = ", e.value);
        if ((checkStrIncluded(e) || checkLimit(e)) || checkEmpty(e)) {
            alert("Lesson title EMPTY or should contain text or exceed the limit.");
            flagRef.value = true;
            break;
        }
    }

    if (flagRef.value) return true;

    console.log("done lesson title checks"); // debug

    //---------CHECK LINK OF VIDEOS IN LESSONS--------------

    for (let e of videoURL) {
        console.log("element = ", e.value);
        if (checkLink(e) || checkEmpty(e)) {
            alert("Lesson video is empty or doesn't represent link");
            flagRef.value = true;
            break;
        }
    }
    //-----------------------------------------------------

    console.log("done videos lesson checks"); // debug

    //---CHECK PRICE-------------------------
    if (price.value == "paid"){
        checking([price], checkNum, flagRef, "price should be number")
    }

    //FEEDBACK
    console.log("flag = ", flagRef.value);
    return flagRef.value;
}

export { checkValid };
