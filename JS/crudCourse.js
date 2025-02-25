import { collection, addDoc, getDocs, deleteDoc, doc, db, updateDoc } from "./H_crudCourse/FirebaseConfig.js";
import { getCat } from "./H_crudCourse/getCat.js";
import { viewCourses, status, id } from "./H_crudCourse/viewCourses.js";
import { addCourse } from "./H_crudCourse/addCourse.js";
import { checkValid } from "../checkvalid.js";


//=========GLOBAL=VARIABLES========================================
export let form = document.forms[0];
export var courseId; // To store the ID of the course being updated
export var isUpdating = false; // Flag: track if we're in "update" mode
//=================================================================



function addField(contentDiv){
    //add the mandatory fieldset
    //------------------------------------------------------------------------------


    // create label for textbox for lesson title
    let l_title = document.createElement("label");
    l_title.innerText = "Title: ";
    l_title.id = "lessonTitle";

    // create input textbox for lesson title
    let title = document.createElement("input");
    title.classList.add("mandatory"); // <necessary for adding lesson checking empty>
    title.type = "text";

    //--------------------------------------

    // create input textbox for video url
    let url = document.createElement("input");
    url.classList.add("mandatory");  // <necessary for adding lesson checking empty>
    url.type = "text";


    // create label for textbox for lesson title
    let l_url = document.createElement("label");
    l_url.innerText = "Video URL: ";
    l_url.id = "videoURL";

    //---------------------------------------


    // create input browse file  for asset
    let asset = document.createElement("input");
    asset.type = "file";


    // create label for textbox for lesson title
    let l_asset = document.createElement("label");
    l_asset.innerText = "Asset: ";
    l_asset.id = "asset";

    //---------------------------------------

    // create fieldset 
    let newFieldset = document.createElement("fieldset");
    newFieldset.classList.add("lessonForm"); // <necessary for adding lesson>

    //---------------------------------------

    //append the title , url, asset in the field set
    newFieldset.appendChild(l_title);
    newFieldset.appendChild(title);

    newFieldset.appendChild(l_url);
    newFieldset.appendChild(url);

    newFieldset.appendChild(l_asset);
    newFieldset.appendChild(asset);


    // append the fieldset into existing div
    contentDiv.appendChild(newFieldset);

}



function resetForm() {
    form.reset();
    document.getElementById("operation").innerText = `ADD Course`;
    document.getElementById("mainBtn").style.display = "flex"; // Show "Add" button
    document.getElementById("updateBtn").style.display = "none"; // Hide "Update" button
    isUpdating = false; // Reset the update flag

    //-------------------------------------------
    
    // get the div
    let contentDiv = document.getElementById("ContentContainer");

    // remove all fieldset inside the div
    let availableFieldsets = contentDiv.querySelectorAll("fieldset");
    availableFieldsets.forEach( f => f.remove());

    //add fieldset
    addField(contentDiv);
};

window.resetForm = resetForm;



// Handle the update button click
document.getElementById("updateBtn").addEventListener("click", async function (event) {

    event.preventDefault(); 


    // check validation-----
    if(await checkValid()) return;
    //----------------------


    //if you are in update mode prevent
    isUpdating = status;

    if (!isUpdating) {
        return; // If we're not in "update" mode, do nothing
    }


    //-----------------------------------------------
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
    //-----------------------------------------------

    let updatedCourse = {
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

    courseId  = id;
    console.log("courseId = ", courseId)
    const courseRef = doc(db, "courses", courseId); 
    await updateDoc(courseRef, updatedCourse); 
   

    resetForm();
    viewCourses();
});

// Delete a course from Firestore
window.delCourse = async function (target) {

    let courseId = target.getAttribute("data-id");
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef); 

    viewCourses();
    resetForm(); 
};


// from check validation
function checkNum(obj) {
    const regex = /^\d+(\.\d+)?$/;
    return !regex.test(obj.value);  
}

//====================================================================================================

// After the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    getCat();
    viewCourses(); 

    //once access type checked free, disable the price  and make has no validation
    document.getElementById("accessType").addEventListener("input", function(){

        // access value + access pice textbox
        let value =  document.getElementById("accessType").value;
        let priceInput = document.getElementById("price");
        if(value == "free"){

            // disable the price textinput
            priceInput.disabled = true;

            // value = "" + no validation checking
            priceInput.value = "";
            priceInput.style="background-color: rgb(204, 204, 204);"
        }
        else{
            // enable the price textinput
            priceInput.disabled = false;
            priceInput.style = "background-color: #eee;";
        }

    })



    form.addEventListener("submit", addCourse); 
});








