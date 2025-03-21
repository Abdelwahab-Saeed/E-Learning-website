import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzkfiCihtsJ5ip08cx0QySH7UIpdVEKhM",
    authDomain: "e-laerning-1dcc6.firebaseapp.com",
    projectId: "e-laerning-1dcc6",
    storageBucket: "e-laerning-1dcc6.appspot.com",
    messagingSenderId: "1006424759938",
    appId: "1:1006424759938:web:cee85ec89369a138b25e9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function fetchCategories() {
    const categoriesContainer = document.querySelector('.course-categories');
    categoriesContainer.innerHTML = '';

    try {
        const allCoursesBtn = document.createElement('button');
        allCoursesBtn.classList.add('category-btn');
        allCoursesBtn.textContent = 'All Courses';
        allCoursesBtn.addEventListener('click', fetchCourses);
        categoriesContainer.appendChild(allCoursesBtn);

        const querySnapshot = await getDocs(collection(db, "categories"));

        querySnapshot.forEach((doc) => {
            const category = doc.data();

            const categoryBtn = document.createElement('button');
            categoryBtn.classList.add('category-btn');
            categoryBtn.textContent = category.name;

            categoryBtn.addEventListener('click', () => fetchCoursesByCategory(category.name));

            categoriesContainer.appendChild(categoryBtn);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function fetchCourses() {
    const coursesContainer = document.querySelector('.courses');
    coursesContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const user = await getCurrentUser();

        if (!user) return;

        const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
        const approvedCourses = enrollmentsSnapshot.docs.filter(doc => {
            const enrollmentData = doc.data();
            return enrollmentData.userId === user.email && enrollmentData.status === 'approved';
        }).map(doc => doc.data().courseTitle);

        querySnapshot.forEach((doc) => {
            const course = doc.data();
            if (approvedCourses.includes(course.title)) {
                const courseCard = document.createElement('div');
                courseCard.classList.add('course-card');

                courseCard.innerHTML = `
              <img src="${course.image || '/default-image.jpg'}" alt="${course.title}">
              <h3>${course.title}</h3>
              <p>${course.description}</p>
              <div class="course-actions">
                <button class="fav-btn">❤️</button>
                <button class="enroll-btn" data-course-title="${course.title}">Access Content</button>
              </div>
            `;

                const enrollButton = courseCard.querySelector('.enroll-btn');
                enrollButton.addEventListener('click', () => window.location.href = `/contentPage.html?courseTitle=${course.title}&userEmail=${user.email}`);

                coursesContainer.appendChild(courseCard);
                const favButton = courseCard.querySelector('.fav-btn');
                favButton.addEventListener('click', () => handleFavButtonClick(favButton, course));
            }
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}

async function fetchCoursesByCategory(categoryName) {
    const coursesContainer = document.querySelector('.courses');
    coursesContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const user = await getCurrentUser();

        if (!user) return;


        const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
        const approvedCourses = enrollmentsSnapshot.docs.filter(doc => {
            const enrollmentData = doc.data();
            return enrollmentData.userId === user.email && enrollmentData.status === 'approved';
        }).map(doc => doc.data().courseTitle);

        querySnapshot.forEach((doc) => {
            const course = doc.data();
            if (course.category === categoryName && approvedCourses.includes(course.title)) {
                const courseCard = document.createElement('div');
                courseCard.classList.add('course-card');

                courseCard.innerHTML = `
              <img src="${course.image || '/default-image.jpg'}" alt="${course.title}">
              <h3>${course.title}</h3>
              <p>${course.description}</p>
              <div class="course-actions">
                <button class="fav-btn">❤️</button>
                <button class="enroll-btn" data-course-title="${course.title}">Access Content</button>
              </div>
            `;

                const enrollButton = courseCard.querySelector('.enroll-btn');
                enrollButton.addEventListener('click', () => window.location.href = `/course-content.html?title=${course.title}`);

                coursesContainer.appendChild(courseCard);
                const favButton = courseCard.querySelector('.fav-btn');
                favButton.addEventListener('click', () => handleFavButtonClick(favButton, course));
            }
        });
    } catch (error) {
        console.error("Error fetching courses by category:", error);
    }
}

async function enrollInCourse(courseTitle) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            alert("Please log in first.");
            return;
        }

        const userEmail = user.email;
        const userName = user.displayName || "Anonymous User";

        const enrollmentData = {
            userId: userEmail,
            userName: userName,
            courseTitle: courseTitle,
            status: "pending",
            timestamp: new Date(),
        };

        const enrollmentRef = await addDoc(collection(db, "enrollments"), enrollmentData);

        const enrollButton = document.querySelector(`[data-course-title="${courseTitle}"]`);
        enrollButton.textContent = "Pending";
        enrollButton.disabled = true;

        alert("Enrollment request sent to admin!");

    } catch (error) {
        console.error("Error enrolling in course:", error);
        alert("There was an error processing your enrollment request.");
    }
}

function getCurrentUser() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                reject("No user is logged in");
            }
        });
    });
}

const WISHLIST_KEY = "userWishlist";

function addToWishlist(course) {
    let wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    const isInWishlist = wishlist.find((item) => item.title === course.title);

    if (isInWishlist) {
        wishlist = wishlist.filter((item) => item.title !== course.title);
        alert(`${course.title} removed from your wishlist.`);
    } else {
        wishlist.push(course);
        alert(`${course.title} added to your wishlist.`);
    }

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

function loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    wishlist.forEach((course) => {
        const favButton = document.querySelector(`[data-course-title="${course.title}"]`)?.closest('.course-card')?.querySelector('.fav-btn');
        if (favButton) {
            favButton.classList.add('liked');
        }
    });
}

function handleFavButtonClick(favButton, course) {
    favButton.classList.toggle("liked");
    addToWishlist(course);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();
    fetchCourses();
    loadWishlist();
});