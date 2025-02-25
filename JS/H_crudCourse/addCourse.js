import { collection, addDoc, db} from "./FirebaseConfig.js";
import { viewCourses } from "./viewCourses.js";
import {checkValid} from "../../checkvalid.js"

//======adding global variables==============
import { form, isUpdating } from "../crudCourse.js";
//===========================================



// Add a new course
async function addCourse(event) {

    event.preventDefault(); 

    // check validation-----
    if(await checkValid()) return;
    //----------------------


    // If we're in "update" mode, don't add a new course
    if (isUpdating) {return;}

    // collect the content in the array
    var contentArr = []; 
    
    // get content div
    let contentDiv = document.getElementById("ContentContainer");

    // get fieldsets
    let fieldsets = contentDiv.querySelectorAll("fieldset");

    // go inside the fieldset
    fieldsets.forEach(fieldset => {
        
        // get inputs block for each fieldset
        let inputs = fieldset.querySelectorAll("input"); 

        //title
        let lessonTitle = inputs[0].value;

        //urlVideo
        let urlVideo = inputs[1].value;

        //asset
        let asset = inputs[2].value;

        let lesson = {"lessonTitle": lessonTitle, "urlVideo" : urlVideo, "asset" : asset }; 
        contentArr.push(lesson);
        
    });


    let course = {
        title: form.elements[0].value,       // courseTitle
        image: form.elements[1].value,       // foreground image
        bgImage: form.elements[2].value,     // background image
        category: form.elements[3].value,    // category
        instructor: form.elements[4].value,  // instructor
        description: form.elements[5].value, // description
        accessType: form.elements[6].value,  // Access Type
        price: form.elements[7].value,       // price
        duration: form.elements[8].value,    // duration
        content: contentArr
    };

    await addDoc(collection(db, "courses"), course); 
    form.reset(); // Reset the form
    viewCourses(); // Refresh the course list
    resetForm();
}



export {addCourse}

