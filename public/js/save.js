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

    /*
    * Run on Startup
    */

    //Clear outstanding local storage.
    if(localStorage.length != 0){
        if(confirm('It looks like you have other data locally saved on this browser. Would you like us to clear this data?')){
            localStorage.clear();
        }
    }
    Offline.check();
    var cachedConnectionStatus = Offline.state;

    /*
    * Repetitive Checks
    */

    // Every 1 Second, check connection. If connected, push the data to the cloud.
    setInterval(function(){
        Offline.check();
        if(Offline.state == 'up'){
            if(localStorage.length > 0){
                pushData();
            }
            cachedConnectionStatus = 'up';
        }else if(Offline.state == 'down' && cachedConnectionStatus == 'up'){
            console.log("Connection Lost");
            cachedConnectionStatus = 'down';
        }
    }, 1000);

    /*
    * Button Responses
    */

    //Pushes current form if able, saves if not
    $("#submitData").on('click', function() {
        Offline.check();
        if(Offline.state == 'up'){ //If Connected
            saveCurrentForm();
            pushData();
            $("#mainform")[0].reset();
            console.log("Form Pushed");
        }else{ //If not connected
            alert('Connection not Found. Saving form...');
            saveCurrentForm();
        }
    });
    // //Resets the form on click.
    $("#clearForm").on('click', function() {
        $("#mainform")[0].reset();
    });

    /*
    * Functions
    */

    //Save Current Form
    function saveCurrentForm(){
        var name = dataName + counter.toString();
        saveN($("#mainform").serializeArray(), name);
        counter++;
    }
    //Push All Data
    function pushData() { //TODO: Check for connectivity before running.
        var error = false;
        for (var i = (counter-1); i >= 1; i--) {
            var data = JSON.parse(get('form', i));
            var request = $.ajax({
                type: 'POST',
                url: '/pushData',
                data: data
            });
            request.done(function(response) { //If pushing is successful.
                console.log("Data successfully pushed.");
                localStorage.removeItem('dataName' + i);
                counter--;
            });
            request.fail(function(jqXHR, textStatus) { //If pushing is unsuccessful.
                if(!error){
                    alert("Pushing was unsuccessful. Please reach out to a qualified individual for assistance. Error Message: " + textStatus);
                    error = true;
                }
            });
        }
    }
});
