import { deleteDoc, doc, db} from "./FirebaseConfig.js";
import { viewCourses } from "./viewCourses.js";
import { resetForm } from "./resetForm.js";
window.resetForm = resetForm;

// Delete a course from Firestore
async function delCourse  (target) {

    let courseId = target.getAttribute("data-id");
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef); 

    viewCourses();
    resetForm(); 
};

export {delCourse}