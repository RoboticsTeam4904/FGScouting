var data = [];
var counter = 1;
var dataName = "form";
// Get data. Example:
data[0] = prompt("New member name?");
// This should be changed to retrieve data from the form

function saveN(data, name) {
	localStorage.setItem(name, JSON.stringify(data));
}
function save(data) {
	var name = dataName + counter.toString();
	saveN(data, name);
	counter++;
}
// Set up with a button on the webpage? automatic?

function get(data, name) {
	return JSON.parse(localStorage.getItem(name));
}
// Run on initialization?


//
