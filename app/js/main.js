jQuery(document).ready(function($){
	init();
});

function init() {
	$('form.scraper').on('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		let $form = $(this);
		let address = $form.find('input.address').val();

		// $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent(address) + '&callback=?', function(data){
		requestCrossDomain(address, function(data) {
			console.log(data);
			let results = getResults(data.contents, 'a');
			let html = '<ul>';

			if (results) {
				for (let i = 0, r; r = results[i]; i++) {
					html += '<li>';
					html += '<a href="' + r + '" target="_blank">' + r + '</a>';

					if (isInternalUrl(address, r)) {
						console.log(r);
					}

					html += '</li>';
				}
			}

			html += '</ul>';
			$('section.results').html(html);
		});
	});
}

function getResults(content, element) {
	let results = [];
	let data = content.split('<' + element + ' ');

	for (let i = 1, part; part = data[i]; i++) {
		let url = part.getBetween("href='", "'");

		if (!url) {
			url = part.getBetween('href="', '"');
		}

		if (url.startsWith("http")) {
			results.push(url);
		}
	}

	return results;
}

function isInternalUrl(mainUrl, scrapeUrl) {
	mainUrl = stripUrl(mainUrl);
	scrapeUrl = stripUrl(scrapeUrl);

	mainUrl = mainUrl.split('/')[0];
	scrapeUrl = scrapeUrl.split('/')[0];

	if (mainUrl == scrapeUrl) {
		return true;
	} else {
		return false;
	}
}

function stripUrl(url) {
	let arrUndo = ['https', 'http', '://', '/'];

	let result = url;

	for (let i = 0, undo; undo = arrUndo[i]; i++) {
		result = result.replace(undo, '');
	}

	arrResult = result.split('.');

	if (arrResult.length >= 3) arrResult.shift(); // removes first element;

	result = arrResult.join('.');

	return result;
}

String.prototype.getBetween = function(start, end) {
	if (!this) return;
	let result = this.split(start)[1];
	if (!result) return;
	return result.split(end)[0];
}

// Accepts a url and a callback function to run.
function requestCrossDomain( site, callback ) {
     
    // If no url was passed, exit.
    if ( !site ) {
        console.error('No site was passed.');
        return false;
    }
     
    // Take the provided url, and add it to a YQL query. Make sure you encode it!
    var yql = "select * from htmlstring where url='" + site + "' AND xpath='//div'";
   	var resturl = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(yql) + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

   	console.log(resturl);
    
    // Request that YSQL string, and run a callback function.
    // Pass a defined function to prevent cache-busting.
    $.getJSON( resturl, cbFunc );
     
    function cbFunc(data) {
    	// console.log(data);
	    // If we have something to work with...
	    if ( data.results[0] ) {
	        // Strip out all script tags, for security reasons.
	        // BE VERY CAREFUL. This helps, but we should do more. 
	        data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
	         
	        // If the user passed a callback, and it
	        // is a function, call it, and send through the data var.
	        if ( typeof callback === 'function') {
	            callback(data);
	        }
	    }
	    // Else, Maybe we requested a site that doesn't exist, and nothing returned.
	    else throw new Error('Nothing returned from getJSON.');
    }
}