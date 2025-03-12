# E-Learning Platform

## Overview
This is a full-featured e-learning platform that allows users to enroll in courses, manage their learning progress, and interact with an admin panel for course and user management. Built using Vanilla JavaScript for both frontend and backend, along with Firebase for authentication, database management, and real-time updates, the platform provides a seamless learning experience.

## Features
- **User Enrollment**: Users can enroll in free courses instantly or pay for paid courses without requiring admin approval.
- **Wishlist**: Users can add courses to their wishlist.
- **Admin Panel**:
  - **Category Management**: Create, update, delete course categories.
  - **Course Management**: Create, update, delete courses.
  - **User Management**: Manage user registrations and access.
  - **Track User Progress**: Monitor users' progress in courses.
- **Real-Time Updates**: Enrollment status and course availability update dynamically.
- **Secure Data Handling**: Firestore security rules ensure safe interactions.

## Technologies Used
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Vanilla JavaScript (No Node.js, runs entirely in the browser)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting

## Setup Instructions
### Prerequisites
- Firebase project set up

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Abdelwahab-Saeed/E-Learning-website.git
   ```
2. Open the project folder in a code editor.
3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore, Authentication, and Hosting
   - Add Firebase config to your JavaScript file.

4. Open `index.html` in a browser to run the application.

## Firebase Configuration
Ensure your Firebase config is included in your JavaScript file:
```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
firebase.initializeApp(firebaseConfig);
```

## Usage
- **Users**: Sign up, enroll in free or paid courses, add to wishlist.
- **Admins**: Manage categories, courses, user registrations, and track user progress via the admin panel.

## Contributing
1. Fork the repository.
2. Create a feature branch:
   ```sh
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```sh
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```sh
   git push origin feature-name
   ```
5. Submit a pull request.

## Contact
For any inquiries, reach out to [abdelwahabsaeed415@gmail.com].

