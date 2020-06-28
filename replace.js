// finds the primary table for which we're creating stats
function findPresentationTable() {
	return [...document.querySelectorAll('iframe')]
		.map(f => { 
			return {
				table: f.contentWindow.document.body.querySelector("table[role='presentation']"),
				filter: f.contentWindow.document.body.querySelector(".breadcrumb_container a[filter]:last-of-type"),
				frame: f
			}
		})
		.find(elem => elem.table != null);
}

// finds the primary table after navigation
function refindTable(container) {
	container.table = container.frame.contentWindow.document.body.querySelector("table[role='presentation']");
	container.filter = container.frame.contentWindow.document.body.querySelector(".breadcrumb_container a[filter]:last-of-type");
}

// retrieves the table columns and filters only columns for which retrieving stats is meaningful
function getColumns(table) {
	return [...table.querySelectorAll("table[role='grid'] tHead th[role='columnheader']")].map(function(item){return item.getAttribute("glide_label")});
}

// create the container which holds the field-stats and populates it
function createFieldDataStatistics() {
	// create fields-data container

	// get columns

	// for each column create an accordion entry

	// add onclick callbacks to draw bar charts
	let filter = dataTableContainer.filter.getAttribute('filter');
}

// for a given svg, create the bar chart
function draw(elem, table, column, filter) {

}

// split the page
function splitePage(){
	var dom = dataTableContainer.frame.contentWindow.document;//.activeElement;

		var leftPanel = dom.createElement("DIV");
  		//var textnode = dom.createTextNode("Water");

		// creating button element  
        var button = document.createElement('BUTTON1');  
        // creating text to be 
        //displayed on button 
        var text = document.createTextNode("Button1_a");             
		// appending text to button 	
         button.appendChild(text); 
                  
         // appending button to div  
		leftPanel.appendChild(button);
		var content1 = dom.createElement("DIV");
		content1.setAttribute("style","padding: 0 18px; display: none;  overflow: hidden;  background-color: #f1f1f1;");
		var textnode = dom.createTextNode("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>");
		
  		leftPanel.setAttribute("style","position: relative; width: 25%; float: left; height: 100%; background-color: #E3D6CA; z-index: 1010101010");

		var pos = dom.location.pathname.indexOf("_list");
		var tableName= dom.location.pathname.slice(1, pos);

		var el = dom.getElementById(tableName+"_list");
		var table= el.parentElement.parentElement;

		table.setAttribute("style","position: relative;  width: 75%;  float: left;  height: 100%;   z-index: 1010101010");
		table.parentNode.insertBefore(leftPanel, table);
	
		dataTableContainer.table.style.fontFamily = 'fantasy';
}

console.log('Turkugulu plugin loaded');

// find the primary table
dataTableContainer = findPresentationTable();

if (dataTableContainer) {
	createFieldDataStatistics();

	// subscribe to iframe reload
	dataTableContainer.frame.onload = () => {
		refindTable(dataTableContainer);
		if (dataTableContainer.table == null) {
			console.log('table lost, TODO: somehow reinstall hook after table re-found');
			return;
		}
		createFieldDataStatistics();
		splitePage();
	};
	splitePage();
} else {
	console.log('table not found without listener');
}
