function displayWishlist() {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const wishlistContent = document.getElementById("wishlist-content");

    if (!loggedInUser || !loggedInUser.wishlist.length) {
        wishlistContent.innerHTML = "<p>No courses added to your wishlist yet!</p>";
        return;
    }

    wishlistContent.innerHTML = "";

    loggedInUser.wishlist.forEach(course => {
        const courseCard = document.createElement("div");
        courseCard.classList.add("course-card");

        courseCard.innerHTML = `
        <img src="${course.image || '/default-image.jpg'}" alt="${course.title}">
        <div>
          <h3>${course.title}</h3>
          <p>${course.description}</p>
        </div>
        <button class="remove-btn" data-title="${course.title}">Remove</button>
      `;

        const removeButton = courseCard.querySelector(".remove-btn");
        removeButton.addEventListener("click", () => removeFromWishlist(course));

        wishlistContent.appendChild(courseCard);
    });
}

function removeFromWishlist(course) {
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) return;

    loggedInUser.wishlist = loggedInUser.wishlist.filter(item => item.title !== course.title);

    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    localStorage.setItem(loggedInUser.userEmail, JSON.stringify(loggedInUser));


    displayWishlist();
}

document.addEventListener("DOMContentLoaded", displayWishlist);