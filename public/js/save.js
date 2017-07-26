var counter = 1;
var dataName = "form";
// This should be changed to retrieve data from the form

//Saves Data to Local Storage
function saveN(data, name) {
    localStorage.setItem(name, JSON.stringify(compactJson(data)));
}

// Retrieving localstorage: Set up with a button on the webpage? automatic? Run on initialization?
function get(data, name) {
    return localStorage.getItem(data + name);
}

function compactJson(json) {
    var object = {};
    var name;
    for (var key in json) {
        // skip loop if the property is from prototype
        if (!json.hasOwnProperty(key)) continue;
        var obj = json[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(prop)) continue;
            if (prop == "name") {
                name = obj[prop];
            } else {
                object[name] = obj[prop];
            }
        }
    }
    return object;
}

$(document).ready(function() {
    //Clear outstanding local storage.
    if(localStorage.length != 0){
        if(confirm('It looks like you have other data locally saved on this browser. Would you like us to clear this data?')){
            localStorage.clear();
        }
    }
    //Saves form to localstorage on click.
    $("#saveButton").on('click', function() {
        saveCurrentForm();
    });
    //Resets the form on click.
    $("#clearForm").on('click', function() {
        $("#mainform")[0].reset();
    });
    //Pushes the data to the cloud.
    $("#pushData").on('click', function() {
        //Adds the option to save the current form.
        if(confirm('Would you like to push your current form as well?')){
            saveCurrentForm();
        }
        pushData();
    });
    //Save Current Form
    function saveCurrentForm(){
        var name = dataName + counter.toString();
        saveN($("#mainform").serializeArray(), name);
        counter++;
    }
    //Push All Data
    function pushData() { //TODO: Check for connectivity before running.
        for (var i = counter; i > 1; i--) {
            var data = JSON.parse(get('form', i));
            var request = $.ajax({
                type: 'POST',
                url: '/pushData',
                data: data
            });
            request.done(function(response) { //If pushing is successful.
                // alert(response); //TODO: Add clear message after successful push.
                localStorage.removeItem('dataName' + i);
                counter--;
            });
            request.fail(function(jqXHR, textStatus) { //If pushing is unsuccessful.
                alert("Database not loaded. Make sure you have a strong connection to wifi. If that is not the issue, reach out to a system administrator for help. Error Message: " + textStatus);
                return;
            });
        }
    }
});
