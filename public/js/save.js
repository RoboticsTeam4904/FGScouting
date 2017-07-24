var data = [];
var counter = 1;
var dataName = "form";
// This should be changed to retrieve data from the form

//Saves Data to Local Storage
function saveN(data, name) {
    localStorage.setItem(name, JSON.stringify(compactJson(data)));
}

//Returns the currently stored data
function getData() {
    return data;
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
    console.log(object);
    return object;
}

$(document).ready(function() {
    localStorage.clear();
    $("#saveButton").on('click', function() {
        var name = dataName + counter.toString();
        saveN($("#mainform").serializeArray(), name);
        counter++;
    });
    $("#pushData").on('click', function() {
        for (var i = 1; i < counter; i++) {
					console.log(i);
            var data = JSON.parse(get('form', i));
            var request = $.ajax({
                type: 'POST',
                url: '/pushData',
                data: data
            });
            request.done(function(response) {
                console.log(response);
            });
            request.fail(function(jqXHR, textStatus) {
                console.log(textStatus);
            });
        }
				counter = 1;
				localStorage.clear();
    });
});
