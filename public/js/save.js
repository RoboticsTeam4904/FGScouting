var currentFormNumber = 0;
var dataName = "form";
var signedIn = false;
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
            if (prop === "name") {
                name = obj[prop];
            } else {
                object[name] = obj[prop];
            }
        }
    }
    return object;
}

/*
* Oauth with google logins.
*/

// Run when signed in.
function onSignIn(googleUser) {
    if(!signedIn){
        console.log("User logged in.");
        var id_token = googleUser.getAuthResponse().id_token;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/tokensignin');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if(xhr.responseText === "error"){
                signOut();
            }else{
                alert('Signed in as ' + xhr.responseText);
                $("#signInButton").hide();
                $("#signOutButton").show();
                signedIn = true;
            }
        };
        xhr.send('idtoken=' + id_token);
    }else{
        $("#signInButton").hide();
        $("#signOutButton").show();
    }
}

// Run when signed out.
function signOut() {
    if(signedIn){
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          console.log('User signed out.');
      });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/tokensignout');
        xhr.onload = function() {
            alert('Signed out.');
            $("#signOutButton").hide();
            $("#signInButton").show();
            signedIn = false;
        };
        xhr.send();
    }else{
        $("#signInButton").show();
        $("#signOutButton").hide();
    }
}

$(document).ready(function() {
    // Grab the required form fields
    var requiredFields = [];
    $("#mainform :input").each(function(){
        if(this.required){
            requiredFields.push(this.name);
        }
    });

    /*
    * Run on Startup
    */

    //Clear outstanding local storage.
    if(localStorage.length !== 0){
        if(confirm('It looks like you have other data locally saved on this browser. Would you like us to clear this data?')){
            localStorage.clear();
        }
    }
    //Set Offline Status
    Offline.check();
    var cachedConnectionStatus = Offline.state;

    //Hide Buttons
    $("#signOutButton").hide();
    $("#signInButton").show();

    /*
    * Repetitive Checks
    */

    // Every 1 Second, check connection. If connected, push the data to the cloud.
    setInterval(function(){
        Offline.check();
        if(Offline.state === 'up'){ //If connected
            //If there's data.
            if(localStorage.length > 0){ 
                pushData(false);
            }
            cachedConnectionStatus = 'up';
        }else if(Offline.state === 'down' && cachedConnectionStatus === 'up'){ //If not connected
            console.log("Connection Lost");
            cachedConnectionStatus = 'down';
        }
    }, 1000);

    /*
    * Button Responses
    */

    //Pushes current form if able, saves if not
    $("#submitData").on('click', function() {
        //Check if all the fields are required
        var currentFormJS = $("#mainform").serializeArray();
        var fieldsUnfilled = false;
        for(var key in currentFormJS){
            if(currentFormJS.hasOwnProperty){
                // If the name of the current form is in the requiredFields
                if(requiredFields.indexOf(currentFormJS[key].name) > -1 && currentFormJS[key].value === ""){
                    fieldsUnfilled = true;
                }
            }
        }
        //If required fields are unfilled.
        if(fieldsUnfilled){
            alert("Not all required fields are filled. Please complete the required fields before submitting.");
        }else{
            Offline.check();
            // If Connected else Not-Connected
            if(Offline.state === 'up'){
                saveCurrentForm();
                pushData(true);
                console.log("Form Pushed");
            }else{ 
                alert('Connection not Found. Saving form...');
                saveCurrentForm();
            }
        }
    });
    //Resets the form on click.
    $("#clearForm").on('click', function() {
        $("#mainform")[0].reset();
    });
    //Signs out of google
    $("#signout").on('click', function() {
        signOut();
    });

    /*
    * Functions
    */

    //Save Current Form
    function saveCurrentForm(){
        var name = dataName + currentFormNumber.toString();
        saveN($("#mainform").serializeArray(), name);
        currentFormNumber++;
    }
    //Push All Data
    function pushData(alertUser) {
        var error = false;
        var dataArray = [];
        for (var i = 0; i < currentFormNumber; i++) {
            dataArray.push(get('form', i));
        }
        dataArray = JSON.stringify(dataArray);
        var request = $.ajax({
            type: 'POST',
            url: '/pushData',
            data: {
                content: dataArray
            },
        });
        request.done(function(response) { //If pushing is successful.
            alert(response);
            currentFormNumber = 0;
            localStorage.clear();
        });
        request.fail(function(jqXHR, textStatus, errorCode) { //If pushing is unsuccessful.
            if(!error){
                if(alertUser){
                    alert("Error: " + errorCode.toLowerCase() + ". Make sure you are logged into your Nueva email. Otherwise, please reach out to a qualified individual for assistance.");
                }else{
                    console.log("Error: " + errorCode.toLowerCase() + ". Make sure you are logged into your Nueva email. Otherwise, please reach out to a qualified individual for assistance.");
                }
                error = true;
            }
        });
    }
});
