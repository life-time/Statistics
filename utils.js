// the user token, used for xmlhttp requests
function getUserToken() {
	return document.querySelector('script[data-description="globals population"]').innerText.match(/g_ck = '([^']+)'/)[1];
}