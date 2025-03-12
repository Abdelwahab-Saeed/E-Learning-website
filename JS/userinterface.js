import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getAuth, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
    import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

    
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-bar').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });

    function handleSearch() {
      const query = document.getElementById('search-bar').value.trim().toLowerCase();
      const courseCards = document.querySelectorAll('.course-card');

      courseCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(query) || description.includes(query)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }



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

    async function fetchCoursesByCategory(categoryName) {
      const coursesContainer = document.querySelector('.courses');
      coursesContainer.innerHTML = ''; // Clear the container

      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        querySnapshot.forEach(async (doc) => {
          const course = doc.data();
          if (course.category === categoryName) {
            // SECTION 1: Create the basic card structure
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            // Build the initial HTML without price info
            courseCard.innerHTML = `
          <img src="${course.image || '/default-image.jpg'}" alt="${course.title}">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="course-actions"></div>
        `;

            // Get the container for action buttons
            const actionsContainer = courseCard.querySelector('.course-actions');

            // SECTION 2: Check user login/enrollment status
            const user = await getCurrentUser();
            if (user) {
              const userEmail = user.email;
              // Use query() to properly combine where clauses (note: you need to wrap them in query())
              const enrollmentQuery = query(
                collection(db, "enrollments"),
                where("userId", "==", userEmail),
                where("courseTitle", "==", course.title)
              );
              const enrollmentQuerySnapshot = await getDocs(enrollmentQuery);

              // SECTION 3: Handle paid courses
              if (course.accessType === 'paid') {
                // If the course is paid, append the "Pay for This Course" button
                if (enrollmentQuerySnapshot.empty) {
                  const payButton = document.createElement('button');
                  payButton.classList.add('pay-btn');
                  payButton.textContent = 'Pay for This Course';
                  payButton.addEventListener('click', () => {
                    window.location.href = `/payment.html?course=${course.title}`;
                  });
                  actionsContainer.appendChild(payButton);
                }
                // Append the course price as a separate element (do not reset innerHTML)
                const coursePriceElement = document.createElement('p');
                coursePriceElement.classList.add('course-price');
                coursePriceElement.textContent = course.price ? '$' + course.price : 'Free';
                courseCard.appendChild(coursePriceElement);
              }

              // SECTION 4: Handle enrollment status (for both free and paid courses)
              if (!enrollmentQuerySnapshot.empty) {
                const enrollment = enrollmentQuerySnapshot.docs[0].data();
                const status = enrollment.status;
                const enrollButton = document.createElement('button');
                enrollButton.classList.add('enroll-btn');
                enrollButton.setAttribute('data-course-title', course.title);

                if (status === "approved") {
                  enrollButton.textContent = "View Content";
                  enrollButton.classList.add("approved");
                  enrollButton.onclick = () => {
                    window.location.href = `/course-content.html?course=${course.title}`;
                  };
                } else if (status === "pending") {
                  enrollButton.textContent = "Pending";
                  enrollButton.disabled = true;
                  enrollButton.classList.add("pending");
                }
                actionsContainer.appendChild(enrollButton);
              } else {
                // No enrollment found
                if (course.accessType === 'free') {
                  const enrollButton = document.createElement('button');
                  enrollButton.classList.add('enroll-btn');
                  enrollButton.textContent = 'Enroll';
                  enrollButton.addEventListener('click', () => enrollInCourse(course.title));
                  actionsContainer.appendChild(enrollButton);
                }
              }
            } else {
              // SECTION 5: User not logged in
              if (course.accessType === 'paid') {
                // For paid courses, show price and pay button
                const coursePriceElement = document.createElement('p');
                coursePriceElement.classList.add('course-price');
                coursePriceElement.textContent = course.price ? '$' + course.price : 'Free';
                courseCard.appendChild(coursePriceElement);

                const payButton = document.createElement('button');
                payButton.classList.add('pay-btn');
                payButton.textContent = 'Pay for This Course';
                payButton.onclick = () => window.location.href = `payment.html?course=${course.title}`;
                actionsContainer.appendChild(payButton);
              } else {
                const enrollButton = document.createElement('button');
                enrollButton.classList.add('enroll-btn');
                enrollButton.textContent = 'Enroll';
                enrollButton.addEventListener('click', () => enrollInCourse(course.title));
                actionsContainer.appendChild(enrollButton);
              }
            }

            // SECTION 6: Add the favorite button (wishlist)
            const favButton = document.createElement('button');
            favButton.classList.add('fav-btn');
            favButton.textContent = '❤️';
            favButton.addEventListener('click', () => handleFavButtonClick(favButton, course));
            actionsContainer.appendChild(favButton);

            // Finally, add the complete card to the courses container
            coursesContainer.appendChild(courseCard);
          }
        });
      } catch (error) {
        console.error("Error fetching courses by category:", error);
      }
    }

    async function enrollInCourse(courseTitle) {
  try {
    const user = await getCurrentUser();

    // Check if user is not logged in or is logged in anonymously
    if (!user || user.isAnonymous) {
      alert("Please log in first.");
      return;
    }

    const userEmail = user.email;

    // Check if the user is already enrolled in the course
    const enrollmentQuerySnapshot = await getDocs(
      query(
        collection(db, "enrollments"),
        where("userId", "==", userEmail),
        where("courseTitle", "==", courseTitle)
      )
    );

    if (!enrollmentQuerySnapshot.empty) {
      // If enrollment exists, get the status
      const enrollment = enrollmentQuerySnapshot.docs[0].data();
      const status = enrollment.status;

      // Update the button based on the enrollment status
      const enrollButton = document.querySelector(`[data-course-title="${courseTitle}"]`);
      if (enrollButton) {
        if (status === "approved") {
          enrollButton.textContent = "View Content";
          enrollButton.classList.add("approved");
          enrollButton.onclick = () => window.location.href = `/course-content.html?course=${courseTitle}`;
        } else if (status === "pending") {
          enrollButton.textContent = "Pending";
          enrollButton.disabled = true;
          enrollButton.classList.add("pending");
        }
      }
    } else {
      // If not enrolled, proceed with enrollment
      const enrollmentData = {
        userId: userEmail,
        userName: userName,
        courseTitle: courseTitle,
        status: "pending",  // Initial status
        timestamp: new Date(),
      };

      await addDoc(collection(db, "enrollments"), enrollmentData);

      // Update button to show pending status
      const courseCard = document.querySelector(`[data-course-title="${courseTitle}"]`)?.closest('.course-card');
      if (courseCard) {
        const actionsContainer = courseCard.querySelector('.course-actions');
        if (actionsContainer) {
          // Remove existing enroll button if it exists
          const existingEnrollButton = actionsContainer.querySelector('.enroll-btn');
          if (existingEnrollButton) {
            existingEnrollButton.remove();
          }

          // Add new pending button
          const pendingButton = document.createElement('button');
          pendingButton.classList.add('enroll-btn', 'pending');
          pendingButton.setAttribute('data-course-title', courseTitle);
          pendingButton.textContent = "Pending";
          pendingButton.disabled = true;
          actionsContainer.insertBefore(pendingButton, actionsContainer.firstChild);
        }
      }

      alert("Enrollment request sent to admin!");
    }

  } catch (error) {
    console.error("Error enrolling in course:", error);
    alert("There was an error processing your enrollment request.");
  }
}
 
    async function fetchCourses() {
      const coursesContainer = document.querySelector('.courses');
      coursesContainer.innerHTML = '';

      try {
        const querySnapshot = await getDocs(collection(db, "courses"));

        querySnapshot.forEach(async (doc) => {
          const course = doc.data();

          const courseCard = document.createElement('div');
          courseCard.classList.add('course-card');

          courseCard.innerHTML = `
        <img src="${course.image || '/default-image.jpg'}" alt="${course.title}">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="course-actions"></div>
      `;

          const actionsContainer = courseCard.querySelector('.course-actions');

          // Check if the user is enrolled and update the button accordingly
          const user = await getCurrentUser();
          if (user) {
            const userEmail = user.email;

            const enrollmentQuerySnapshot = await getDocs(
              query(
                collection(db, "enrollments"),
                where("userId", "==", userEmail),
                where("courseTitle", "==", course.title)
              )
            );

            // Handle paid courses first
            if (course.accessType === 'paid') {
              const coursePrice = document.createElement('p');
              coursePrice.classList.add('course-price');
              coursePrice.textContent = course.price ? `$${course.price}` : 'Free';
              courseCard.appendChild(coursePrice);

              if (!enrollmentQuerySnapshot.empty) {
                const enrollment = enrollmentQuerySnapshot.docs[0].data();
                if (enrollment.status === "approved") {
                  const viewButton = document.createElement('button');
                  viewButton.classList.add('enroll-btn', 'approved');
                  viewButton.textContent = "View Content";
                  viewButton.onclick = () => window.location.href = `/contentPage.html?courseTitle=${course.title}&userEmail=${userEmail}`;
                  actionsContainer.appendChild(viewButton);
                } else if (enrollment.status === "pending") {
                  const pendingButton = document.createElement('button');
                  pendingButton.classList.add('enroll-btn', 'pending');
                  pendingButton.textContent = "Pending";
                  pendingButton.disabled = true;
                  actionsContainer.appendChild(pendingButton);
                }
              } else {
                const payButton = document.createElement('button');
                payButton.classList.add('pay-btn');
                payButton.textContent = 'Pay for This Course';
                payButton.onclick = () => window.location.href = `payment.html?course=${course.title}`;
                actionsContainer.appendChild(payButton);
              }
            }
            else {
              if (!enrollmentQuerySnapshot.empty) {
                const enrollment = enrollmentQuerySnapshot.docs[0].data();
                const enrollButton = document.createElement('button');
                enrollButton.classList.add('enroll-btn');
                enrollButton.setAttribute('data-course-title', course.title);

                if (enrollment.status === "approved") {
                  enrollButton.textContent = "View Content";
                  enrollButton.classList.add("approved");
                  enrollButton.onclick = () => window.location.href = `/contentPage.html?courseTitle=${course.title}&userEmail=${userEmail}`;
                } else if (enrollment.status === "pending") {
                  enrollButton.textContent = "Pending";
                  enrollButton.disabled = true;
                  enrollButton.classList.add("pending");
                }
                actionsContainer.appendChild(enrollButton);
              } else {
                const enrollButton = document.createElement('button');
                enrollButton.classList.add('enroll-btn');
                enrollButton.textContent = 'Enroll';
                enrollButton.addEventListener('click', () => enrollInCourse(course.title));
                actionsContainer.appendChild(enrollButton);
              }
            }
          } else {
            // Handle non-logged in users
            if (course.accessType === 'paid') {
              const coursePrice = document.createElement('p');
              coursePrice.classList.add('course-price');
              coursePrice.textContent = course.price ? `$${course.price}` : 'Free';
              courseCard.appendChild(coursePrice);

              const payButton = document.createElement('button');
              payButton.classList.add('pay-btn');
              payButton.textContent = 'Pay for This Course';
              payButton.onclick = () => window.location.href = `/payment.html?course=${course.title}`;
              actionsContainer.appendChild(payButton);
            } else {
              const enrollButton = document.createElement('button');
              enrollButton.classList.add('enroll-btn');
              enrollButton.textContent = 'Enroll';
              enrollButton.addEventListener('click', () => enrollInCourse(course.title));
              actionsContainer.appendChild(enrollButton);
            }
          }

          // Add favorite button
          const favButton = document.createElement('button');
          favButton.classList.add('fav-btn');
          favButton.textContent = '❤️';
          favButton.addEventListener('click', () => handleFavButtonClick(favButton, course));
          actionsContainer.appendChild(favButton);

          coursesContainer.appendChild(courseCard);
        });
      } catch (error) {
        console.error("Error fetching courses:", error);
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

    function getUserData() {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!loggedInUser) {
        alert("User not logged in!");
        return null;
      }
      return loggedInUser;
    }

    const WISHLIST_KEY = "userWishlist";

    function addToWishlist(course) {
      let userData = getUserData();
      if (!userData) return;

      const { userEmail, wishlist } = userData;

      const index = wishlist.findIndex(item => item.title === course.title);

      if (index !== -1) {
        wishlist.splice(index, 1);
        alert(`${course.title} removed from your wishlist.`);
      } else {
        wishlist.push(course);
        alert(`${course.title} added to your wishlist.`);
      }

      userData.wishlist = wishlist;
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      localStorage.setItem(userEmail, JSON.stringify(userData));
    }

    function loadWishlist() {
      let userData = getUserData();
      if (!userData) return;

      userData.wishlist.forEach((course) => {
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

    function logout() {
  // Sign out the user using Firebase Authentication
  signOut(auth)
    .then(() => {
      // On successful sign-out, clear local/session data
      localStorage.removeItem('userToken');
      sessionStorage.clear();

      // Optionally hide sensitive UI elements (if applicable)
      const coursesContainer = document.querySelector('.courses');
      const categoriesContainer = document.querySelector('.course-categories');
      if (coursesContainer) coursesContainer.style.display = 'none';
      if (categoriesContainer) categoriesContainer.style.display = 'none';

      // Redirect the user to the login page
      window.location.href = 'login.html';
    })
    .catch((error) => {
      // Handle any errors during sign-out
      console.error("Error signing out:", error);
    });
}

    document.getElementById('logout-btn').addEventListener('click', logout);