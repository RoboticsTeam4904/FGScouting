var data = [];
var counter = 1;
var dataName = "form";
// This should be changed to retrieve data from the form

//Saves Data to Local Storage
function saveN(data, name) {
	localStorage.setItem(name, JSON.stringify(data));
}

//Returns the currently stored data
function getData(){
	return data;
}

//Saves the latest form to localstorage
function save() {
	var name = dataName + counter.toString();
	retrieveData();
	data = getData();
	saveN(data, name);
	counter++;
}

// Retrieving localstorage: Set up with a button on the webpage? automatic? Run on initialization?
function get(data, name) {
	return JSON.parse(localStorage.getItem(data + name));
}

// Retrieves locally stored data
function retrieveData() {
	var formElements = document.getElementsByTagName("input");
	j = 0;
	for(i = 0; i < formElements.length; i++){
		if(formElements[i].getAttribute('class') == "dynamic"){
			data[j] = formElements[i].value;
			j++;
		}else if(formElements[i].checked){
			data[j] = formElements[i].value;
			j++;
		}
	}
}

//Pushes locally stored data to the database
function pushLocalStorage(){
	//Connection to Database?
}
