

function checkEmpty(){

    // get all class element
    arr = document.getElementsByClassName("mandatory");

    // loop
    for (element of arr){

        // search empty value
        if(element.value === ""){
            alert("video and title required");
            return 0;
        }
    }
    return 1;
}


// remove the fieldset
function remove(event){

    let contentDiv = document.getElementById("ContentContainer")
    let len = contentDiv.querySelectorAll("fieldset").length; 

    if(len > 1)
    {
        const fieldset = event.target.closest("fieldset");
        fieldset.remove()
    }
    else
    {
        alert("can't remove. one lesson is manadtory");
    }


}


function duplicate(){

    // check empty
    if(checkEmpty())
    {
        // original
        const original = document.getElementsByClassName("lessonForm")[0];

        // copy
        const copy = original.cloneNode(true); //include children

        //clear inputs in copy
        inputs = copy.querySelectorAll("input");
        inputs.forEach(i => { i.value = "";});

        // content div
        document.getElementById("ContentContainer").append(copy);
    }

}


//====== Events ======//
// Duplicate on button click
document.getElementById("addLessonBtn").addEventListener("click", duplicate);
//===================================================================================



