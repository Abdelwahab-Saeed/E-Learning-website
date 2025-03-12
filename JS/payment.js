import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

let userEmail = null;
let courseTitle = null;
let coursePrice = null;
let courseData = null;

async function getUserEmail() {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.userEmail) {
            const usersRef = collection(db, "users");
            const q = query(
                usersRef,
                where("email", "==", parsedUser.userEmail)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                userEmail = parsedUser.userEmail;
                document.getElementById("userName").value =
                    parsedUser.userName || "";
                document.getElementById("userEmail").value = userEmail;
                return userEmail;
            }
        }
    }

    const user = auth.currentUser;
    if (user && user.email) {
        userEmail = user.email;
        document.getElementById("userEmail").value = userEmail;
        document.getElementById("userName").value = user.displayName || "";
        return userEmail;
    }
    return null;
}

async function initializePaymentPage() {
    const urlParams = new URLSearchParams(window.location.search);
    courseTitle = urlParams.get("course");

    if (!courseTitle) {
        document.getElementById("payment-message").textContent =
            "Course information is missing.";
        document.getElementById("payment-message").style.color = "red";
        return;
    }

    try {
        const coursesRef = collection(db, "courses");
        const q = query(coursesRef, where("title", "==", courseTitle));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            courseData = querySnapshot.docs[0].data();
            coursePrice = parseFloat(courseData.price);

            document.getElementById("amount").value = coursePrice;
            document.getElementById("courseTitle").value =
                courseData.lessonTitle || courseTitle;

            const verifiedEmail = await getUserEmail();
            if (!verifiedEmail) {
                document.getElementById("payment-message").textContent =
                    "Please log in to continue.";
                document.getElementById("payment-message").style.color = "red";
            }
        } else {
            document.getElementById("payment-message").textContent =
                "Course not found.";
            document.getElementById("payment-message").style.color = "red";
        }
    } catch (error) {
        console.error("Error fetching course:", error);
        document.getElementById("payment-message").textContent =
            "Error loading course information.";
        document.getElementById("payment-message").style.color = "red";
    }
}

paypal
    .Buttons({
        createOrder: function (data, actions) {
            if (!coursePrice) {
                document.getElementById("payment-message").textContent =
                    "Course price not loaded.";
                document.getElementById("payment-message").style.color = "red";
                return;
            }
            return actions.order.create({
                purchase_units: [
                    {
                        description: courseData.lessonTitle || courseTitle,
                        amount: {
                            value: coursePrice.toFixed(2),
                        },
                    },
                ],
            });
        },
        onApprove: async function (data, actions) {
            try {
                const details = await actions.order.capture();
                const verifiedEmail = await getUserEmail();

                if (!verifiedEmail) {
                    document.getElementById("payment-message").textContent =
                        "User verification failed. Please log in again.";
                    document.getElementById("payment-message").style.color = "red";
                    return;
                }

                // Save payment record (without lessonTitle)
                await addDoc(collection(db, "payments"), {
                    userId: verifiedEmail,
                    courseTitle,
                    amount: coursePrice,
                    instructor: courseData.instructor,
                    payerName: details.payer.name.given_name,
                    status: "successful",
                    timestamp: new Date(),
                });

                // Save enrollment record (without lessonTitle)
                await addDoc(collection(db, "enrollments"), {
                    userId: verifiedEmail,
                    courseTitle,
                    instructor: courseData.instructor,
                    status: "approved",
                    timestamp: new Date(),
                });

                const messageElement = document.getElementById("payment-message");
                messageElement.textContent = `Payment successful! You are now enrolled in ${courseData.lessonTitle || courseTitle
                    }.`;
                messageElement.style.color = "green";

                //------INTEGRATION---------------------------------------------

                //USER EMAIL INPUT , COURSE TITLE

                async function getIDBased(
                    collectionName,
                    fieldName,
                    targetValue
                ) {
                    let ID = null;

                    // query contains only one doc that matches
                    const q = query(
                        collection(db, collectionName),
                        where(fieldName, "==", targetValue)
                    );

                    // extract user id
                    const Docs = await getDocs(q);
                    Docs.forEach((doc) => {
                        ID = doc.id;
                    });

                    console.log(`ID = `, ID);

                    return ID;
                }

                //---------------------------

                //Inner func
                async function getNumLesson(collectionName, CID) {
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
                            finishedLessons: 0,
                            AllLessons: len,
                            progress: 0,
                            clicked: clickArr,
                        },
                    });

                    console.log("Added successfully!");
                }

                let UID = await getIDBased("users", "email", userEmail);
                let CID = await getIDBased("courses", "title", courseTitle);

                addCourse2Usr(UID, CID);

                //--------END-INTEGRATION------------------------------------------------

                // Store course access in localStorage
                const accessData = JSON.parse(
                    localStorage.getItem("courseAccess") || "{}"
                );
                accessData[courseTitle] = {
                    granted: true,
                    timestamp: new Date().toISOString(),
                    userEmail: verifiedEmail,
                };
                localStorage.setItem("courseAccess", JSON.stringify(accessData));

                // Redirect to course content
                setTimeout(() => {
                    window.location.href = `/contentPage.html?courseTitle=${courseTitle}&userEmail=${userEmail}`;
                }, 2000);
            } catch (error) {
                console.error("Error processing payment:", error);
                document.getElementById("payment-message").textContent =
                    "Payment failed. Please try again.";
                document.getElementById("payment-message").style.color = "red";
            }
        },
        onError: function (err) {
            console.error("PayPal Error:", err);
            document.getElementById("payment-message").textContent =
                "Payment failed. Please try again.";
            document.getElementById("payment-message").style.color = "red";
        },
        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
        },
    })
    .render("#paypal-button-container");

// Initialize the page when DOM is ready
document.addEventListener("DOMContentLoaded", initializePaymentPage);