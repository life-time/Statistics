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
	};
} else {
	console.log('table not found without listener');
}