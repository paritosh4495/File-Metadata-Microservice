const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragenter", preventDefault, false);
dropZone.addEventListener("dragleave", preventDefault, false);
dropZone.addEventListener("dragover", preventDefault, false);
dropZone.addEventListener("drop", handleDrop, false);

/**
 * Prevent default behavior
 */
function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Handle dropped files
 */
function handleDrop(e) {
    preventDefault(e);
    const files = e.dataTransfer.files;

    Array.prototype.forEach.call(files, function (file) {
        uploadFile(file);
    });
    return false;
}

/**
 * Build and send form data
 */
function uploadFile(file) {
    const url = window.location.origin + "/api/fileanalyse";
    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.addEventListener("readystatechange", function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            window.document.write(
                '<pre style="word-wrap: break-word; white-space: pre-wrap;">' +
                xhr.response +
                "</pre>"
            );
            document.close();
        } else if (xhr.readyState == 4 && xhr.status != 200) {
            alert("Something went wrong");
        }
    });

    formData.append("upfile", file);
    xhr.send(formData);
}

/**
 *  Zone drop highlight on drag/drop
 */
let counter = 0;
dropZone.addEventListener("dragenter", onDragEnter, false);
dropZone.addEventListener("dragover", onDragover, false);

["dragleave", "drop"].forEach(e => {
    dropZone.addEventListener(e, onLeaveOrDrop, false);
});

function onDragEnter(e) {
    counter++;
    dropZone.classList.add("onDrag");
    return false;
}

function onDragover(e) {
    dropZone.classList.add("onDrag");
    return false;
}

function onLeaveOrDrop(e) {
    counter--;
    if (counter === 0) {
        dropZone.classList.remove("onDrag");
    }
    return false;
}

/**
 * Handle upload by submit
 */
const inputTriger = document.getElementById("upload-trigger");
const fileInput = document.getElementById("file-input");
// Delete previously selected file (if any)
inputTriger.addEventListener("click touchstart", function () {
    fileInput.value = "";
}),
    false;
// listen for file select and trigger form submit
fileInput.addEventListener(
    "change",
    function () {
        if (fileInput.value) {
            document.getElementById("upload-form").submit();
        }
    },
    false
);
