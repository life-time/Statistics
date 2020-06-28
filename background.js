// used to inject multiple content scripts into the page
function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injecstDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}

// respond to clicking on the addon button
chrome.browserAction.onClicked.addListener(function(tab) {
	executeScripts(tab.id, [
		{ file: 'd3.min.js'   },
		{ file: 'utils.js'   },
		{ file: 'graph.js'   },
		{ file: 'replace.js' }
	]);
});