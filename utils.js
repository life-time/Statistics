// the user token, used for xmlhttp requests.
// can't get it from window.g_ck as that's not accessible for content scripts for security reasons.
function getUserToken() {
	return document.querySelector('script[data-description="globals population"]').innerText.match(/g_ck = '([^']+)'/)[1];
}