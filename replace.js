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
			.map(item => item.getAttribute("name"))
			.filter(item => !item.includes("date"));
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

		if (dataTableContainer.frame.contentWindow.document.getElementById(column)){
			let container = dataTableContainer.frame.contentWindow.document.getElementById(column).firstElementChild;
			barChart(container, 200, 200, transformed);
		}
		
	});

	// add onclick callbacks to draw bar charts
	
}

// split the page
function splitPage(){
	const doc = dataTableContainer.frame.contentWindow.document;
	const pos = doc.location.pathname.indexOf("_list");
	const tableName= doc.location.pathname.slice(1, pos);
	const table = doc.getElementById(tableName+"_table");

	let statisticsSideBar = doc.getElementById("statistics-extension");
	if (statisticsSideBar !== null){
		statisticsSideBar.parentNode.removeChild(statisticsSideBar);
		const table = doc.getElementById(tableName+"_table");
		table.setAttribute("style","position: relative;  width: 100%;");
		return;	
	}

	const statisticsPanel = doc.createElement("DIV");
	statisticsPanel.setAttribute("id","statistics-extension");
	statisticsPanel.setAttribute("style","position: relative; width: 10%; border: none; float: left; margin-top: 29px; height: 100%;"); 
	
	if (table){
		table.setAttribute("style","position: relative;  width: 90%; float: left;  height: 100%; z-index: 0");
		table.parentNode.insertBefore(statisticsPanel, table);
		populateColumns(statisticsPanel,table);
		// add title
		statisticsPanel.innerHTML = ` <div style="padding: 10px;border-top: 2px solid #c3c6ca; margin-top: 2px;">
									      <span style="font-family: &quot;Helvetica Neue&quot;, Arial; font-weight: bolder;">Statistics</span>
									  </div>` + statisticsPanel.innerHTML;
	}
}

function getCollapseButton(columnName){
	return `
	<div>
	<button type="button" class="btn btn-info btn-accordion collapsed" data-toggle="collapse" data-target="#`
	+ columnName +
	`">`
  	+ columnName +`
  	</button>
 	<div id="`
 	+ columnName +
 	`" class="collapse">
    	<svg height="200", width="140"></svg>
	</div>
	</div>
	`;
}

function populateColumns(statisticsPanel,tableName) {
	let htmlContent = `<style>
	    .btn-accordion {
    	    border-radius: 0;
		    width: 100%;
		    text-align: left;
		    font-family: SourceSansPro, "Helvetica Neue", Arial;
		    font-size: 13px;
		    color: #000;
		    border: none;
		    background-color: #e9ebee;
	    }
	    .btn-accordion:focus, .btn-accordion:hover, .btn-accordion:active:focus {
	    	color: black;
	    	font-weight: bolder;
	    	outline: none !important;
    		outline-offset: 0;
    		box-shadow: none;
    		border-radius: 0;
    		background-color: #e9ebee;
	    }
	    .btn-accordion.collapsed {
	    	background: transparent; !important;
	    }
	    .collapse {
	    	background-color: #f5f7fa;
	    }
	</style>`;

	let columns = getColumns(tableName);

	if (columns) {
		statisticsPanel.innerHTML = htmlContent + columns.map(getCollapseButton).join('');
	} else { 
		statisticsPanel.innerHTML = "no Columns found";
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
