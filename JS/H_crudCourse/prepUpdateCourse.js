// it maybe update something
import { viewCourses } from "./viewCourses";


//======adding global variables=======================
import { form, courseId, isUpdating } from "../crudCourse";
//====================================================


// Prepare the form for updating a course
function prepUpdateCourse(target) {
    let course = JSON.parse(target.getAttribute("data-course")); // Get course data
    courseId = target.getAttribute("data-id"); // Get course ID

    // Populate the form with course data
    document.getElementById("operation").innerText = `Update Course ${course.title}`;


    form.elements[0].value = course.title;
    form.elements[1].value = course.image;
    form.elements[2].value = course.category;
    form.elements[3].value = course.instructor;
    form.elements[4].value = course.description;
    form.elements[5].value = course.price;
    form.elements[6].value = course.duration;

    // iterate on the content array that contain object

    form.elements[7].value = "";



    // Show the "Update" button and hide the "Add" button
    form.elements[12].style.display = "none"; 
    form.elements[13].style.display = "flex"; 
    isUpdating = true; 
    console.log("InsideUpdating : ", isUpdating);
};

export {prepUpdateCourse}


//isUpdating here is not important because you only declare function inside it
// so you take the input from crud.js and return it again as it is.



