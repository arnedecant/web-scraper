const PROPERTIES = {
	anchor: {
		name: 'anchor',
		element: 'a',
		scrape: 'href'
	},
	image: {
		name: 'image',
		element: 'img',
		scrape: 'src'
	}
}

jQuery(document).ready(function($){
	init();
});

function init() {
	for (let key in PROPERTIES) {
		if (!PROPERTIES.hasOwnProperty(key)) continue;
		let prop = PROPERTIES[key];

		console.log(prop.element);

		let option = '<option value="'+prop.name+'" data-name="'+prop.name+'" data-element="'+prop.element+'" data-scrape="'+prop.scrape+'">'+prop.name+'</option>'
		$('form.scraper select.element').append(option);
	}

	$('form.scraper').on('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		let $form = $(this);
		let address = $form.find('input.address').val();

		$.getJSON('https://whateverorigin.herokuapp.com/get?url=' + encodeURIComponent(address) + '&callback=?', function(data){
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