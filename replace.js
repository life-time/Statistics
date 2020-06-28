function findPresentationTable() {
	return [...document.querySelectorAll('iframe')]
		.map(f => { 
			return {
				table: f.contentWindow.document.body.querySelector("table[role='presentation']"),
				frame: f
			}
		})
		.find(elem => elem.table != null);
}

function refindTable(container) {
	container.table = container.frame.contentWindow.document.body.querySelector("table[role='presentation']");
}

console.log('replace loaded');

dataTableContainer = findPresentationTable();
if (dataTableContainer) {
	dataTableContainer.table.style.fontFamily = 'fantasy';
	console.log('changed style without listener');

	// subscribe to iframe reload
	dataTableContainer.frame.onload = () => {
		refindTable(dataTableContainer);
		if (dataTableContainer.table == null) {
			console.log('table lost, TODO: somehow reinstall hook after table re-found');
			return;
		}
		dataTableContainer.table.style.fontFamily = 'fantasy';
		console.log('changed style with listener');
	};
} else {
	console.log('table not found without listener');
}
