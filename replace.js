var varientColumnTypes = ["string", "longint", "html", "journal_input"];
var columnToSeries = {};

// TODO: listen on filter changes

// finds the primary table for which we're creating stats
function findPresentationTable() {
	return [...document.querySelectorAll('iframe')]
		.map(f => { 
			return {
				table:  f.contentWindow.document.body.querySelector("table[role='presentation']"),
				filter: f.contentWindow.document.body.querySelector(".breadcrumb_container a[filter]:last-of-type"),
				frame:  f
			}
		})
		.find(elem => elem.table != null);
}

// finds the primary table after navigation
function refindTable(container) {
	container.table  = container.frame.contentWindow.document.body.querySelector("table[role='presentation']");
	container.filter = container.frame.contentWindow.document.body.querySelector(".breadcrumb_container a[filter]:last-of-type");
}

// retrieves the table columns and filters only columns for which retrieving stats is meaningful
// Filter our all columns that are of a high varience type and that the column doesn't contain any data.
function getColumns(table){
	let firstRowData = [...table.querySelector("table[role='grid'] tbody tr").querySelectorAll("td[class='vt']")];
	let colNames = [...table.querySelector("table[role='grid'] tHead").querySelectorAll("th[role='columnheader']")]
	let emptyColumns = firstRowData.filter(item => item.innerText == "")
								   .map(item => firstRowData.indexOf(item));
	return colNames
			.filter(item => !varientColumnTypes.includes(item.getAttribute("glide_type")) && !emptyColumns.includes(colNames.indexOf(item)))
			.map(item => item.getAttribute("name"));
}

// gets the table name from the URI search part. TODO: find a better way to do this
function getTableName() {
	var match = decodeURIComponent(document.location.search).match(/uri=\/(.+)_list.do/);
	return match[1];
}

// create the container which holds the field-stats and populates it
function createFieldDataStatistics() {
	// create fields-data container
	splitPage();

	// get columns
	let columns = getColumns(dataTableContainer.table);

	// for each column create an accordion entry
	let filter = dataTableContainer.filter.getAttribute('filter');
	let table = getTableName();
	columns.forEach(async column => {
		let series = await fetchSeries(table, column, filter);
		if (series == null)
			return;

		let transformed = transformSeries(series);

		columnToSeries[column] = transformed;
		console.log("Fetched seriesfor " + column + ": " + JSON.stringify(transformed, null, 2));

		let container = dataTableContainer.frame.contentWindow.document.getElementById(column).firstElementChild;
		barChart(container, 200, 200, transformed);
	});

	// add onclick callbacks to draw bar charts
	
}

// split the page
function splitPage(){
	var dom = dataTableContainer.frame.contentWindow.document;//.activeElement;
	let statisticsSideBar = dom.getElementById("statistics-extension");
	if (statisticsSideBar !== null){
		statisticsSideBar.parentNode.removeChild(statisticsSideBar);
		return;
	}

	var leftPanel = dom.createElement("DIV");
	leftPanel.setAttribute("id","statistics-extension");
	leftPanel.setAttribute("style","position: relative; width: 25%; float: left; height: 100%; background-image: url('https://i.gifer.com/Xnbj.gif'); z-index: 1010101010");

	var pos = dom.location.pathname.indexOf("_list");
	var tableName= dom.location.pathname.slice(1, pos);

	var el = dom.getElementById(tableName+"_list");
	var table= el.parentElement.parentElement;

	table.setAttribute("style","position: relative;  width: 75%;  float: left;  height: 100%;   z-index: 1010101010");
	table.parentNode.insertBefore(leftPanel, table);
	// dom.body.insertBefore(leftPanel, dom.body.firstChild);
	populateColumns(leftPanel,table);
}

function getCollapseButton(columnName){
	return `
	<div>
	<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#`
	+ columnName +
	`">`
  	+ columnName +`
  	</button>
 	<div id="`
 	+ columnName +
 	`" class="collapse">
    	<svg height="200", width="200"></svg>
	</div>
	</div>
	`;
}

function populateColumns(leftPanel,tableName) {
	var htmlContent;
	var columns = getColumns(tableName);

	if (columns) {
		for (i = 0; i < columns.length; i++) {
			if (htmlContent) {
	 	 		htmlContent = htmlContent + getCollapseButton(columns[i]);
			}else{
				htmlContent = getCollapseButton(columns[i]);
			}
		}

		leftPanel.innerHTML = htmlContent;
	} else { 
		leftPanel.innerHTML ="no Columns found";
	}
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
