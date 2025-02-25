import { collection, getDocs, db } from "./FirebaseConfig.js";



// prevent the hiddne button (add course) to work
var status = false;
var id;

// Display all courses from Firestore
async function viewCourses() {


    //=====================INNER-FUNCTION===============================================
    let form = document.forms[0];

    // Prepare the form for updating a course
    window.prepUpdateCourse = function (target) {

        // get data
        let course = JSON.parse(target.getAttribute("data-course")); // Get course data

        // change title
        document.getElementById("operation").innerText = `Update Course ${course.title}`;

        // fill textBox
        form.elements[0].value = course.title;
        form.elements[1].value = course.image;
        form.elements[2].value = course.bgImage;
        form.elements[3].value = course.category;
        form.elements[4].value = course.instructor;
        form.elements[5].value = course.description;
        form.elements[6].value = course.accessType;
        form.elements[7].value = course.price;
        form.elements[8].value = course.duration;

        //content adding from firebase========

        // get content data for the course
        let contentData = course.content;
        console.log("course.content = ", contentData);
        console.log("course length = ", contentData["length"]);


        // get content div
        let contentDiv = document.getElementById("ContentContainer");

        // remove any fieldset inside div
        //==========================================================
        // get fieldsets
        let Allfieldsets = contentDiv.querySelectorAll("fieldset")
        Allfieldsets.forEach(element => element.remove());

        console.log("removed")
        //=========================================================

        for(var idx=0 ; idx<contentData.length ; idx++){

            // get lesson object
            let lessonObj = contentData[idx];

            //------------------------------------------------------------------------------

            // create label for textbox for lesson title
            let l_title = document.createElement("label");
            l_title.innerText = "Title: ";
            l_title.id = "lessonTitle";
            
            // create input textbox for lesson title
            let title = document.createElement("input");
            title.classList.add("mandatory"); // <necessary for adding lesson checking empty>
            title.type = "text";
            title.value = lessonObj["lessonTitle"];
            
            //------------------------------------------------------------------------------

            // create input textbox for video url
            let url = document.createElement("input");
            url.classList.add("mandatory");  // <necessary for adding lesson checking empty>
            url.type = "text";
            url.value = lessonObj["urlVideo"];


            // create label for textbox for lesson title
            let l_url = document.createElement("label");
            l_url.innerText = "Video URL: ";
            l_url.id = "videoURL";

            //------------------------------------------------------------------------------


            // create input browse file  for asset
            let asset = document.createElement("input");
            asset.type = "file";
            asset.value = lessonObj["asset"];


            // create label for textbox for lesson title
            let l_asset = document.createElement("label");
            l_asset.innerText = "Asset: ";
            l_asset.id = "asset";

            //------------------------------------------------------------------------------
            
            // create fieldset 
            let newFieldset = document.createElement("fieldset");
            newFieldset.classList.add("lessonForm"); // <necessary for adding lesson>

            //------------------------------------------------------------------------------


            //append the title , url, asset in the field set
            newFieldset.appendChild(l_title);
            newFieldset.appendChild(title);

            newFieldset.appendChild(l_url);
            newFieldset.appendChild(url);

            newFieldset.appendChild(l_asset);
            newFieldset.appendChild(asset);


            // append the fieldset into existing div
            contentDiv.appendChild(newFieldset)
    

        }
        

        //====================================

        // Show the "Update" button and hide the "Add" button
        document.getElementById("mainBtn").style.display = "none"; 
        document.getElementById("updateBtn").style.display = "flex"; 

        // prevent the hiddne button (add course) to work
        status = true

        // get id
        id = target.getAttribute("data-id"); // Get course ID
    };

    //======================END=INNER=FUNCTION=====================================================




    const courseList = document.getElementById("allCourses");
    courseList.innerHTML = ""; // Clear 

    const querySnapshot = await getDocs(collection(db, "courses"));
    querySnapshot.forEach((doc) => {
        let course = doc.data();

        const courseElement = document.createElement("div");
        courseElement.classList.add("course-card");

        courseElement.innerHTML = `
        <p style="margin-right: auto"><strong>Title:</strong> ${course.title}</p>
    
        <button id="prepUpdateBtn"
                onclick="prepUpdateCourse(this)"
                data-course='${JSON.stringify(course)
                    .replace(/"/g, "&quot;")  // Escape double quotes
                    .replace(/'/g, "&apos;") // Escape single quotes
                    .replace(/\n/g, " ")}'   // Remove new lines
                data-id="${doc.id}"
                style="width:100px">Update</button>
    
        <button onclick="delCourse(this)"
                data-id="${doc.id}">X</button>
    `;
    

        courseList.appendChild(courseElement);
    });


}

export {viewCourses, status, id}


