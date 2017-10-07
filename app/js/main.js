const ELEMENTS = {
	anchor: {
		name: 'anchor',
		tag: 'a',
		scrape: 'href'
	},
	image: {
		name: 'image',
		tag: 'img',
		scrape: 'src'
	}
}

jQuery(document).ready(function($){
	materialize();
	init();
});

function materialize() {
	$('select').material_select();
	$('select').on('contentChanged', function() {
		// re-initialize (update)
		$(this).material_select();
	});
}

function init() {
	for (let key in ELEMENTS) {
		if (!ELEMENTS.hasOwnProperty(key)) continue;
		let el = ELEMENTS[key];

		let option = '<option value="'+el.name+'" data-name="'+el.name+'" data-tag="'+el.tag+'" data-scrape="'+el.scrape+'">'+el.name+'</option>'
		$('form.scraper select.element').append(option).trigger('contentChanged');
	}

	$('form.scraper').on('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		let $form = $(this);
		let address = $form.find('input.address').val();
		let element = ELEMENTS[$form.find('select.element').val()];

		if (!element) alert('An error has occurred.');

		$.getJSON('https://whateverorigin.herokuapp.com/get?url=' + encodeURIComponent(address) + '&callback=?', function(data){
			let results = getResults(data.contents, element);

			console.log(results);

			let html = '<ul>';

			if (results) {
				for (let i = 0, r; r = results[i]; i++) {
					html += '<li>';

					if (element.tag === 'a') {
						html += '<a href="' + r + '" target="_blank">' + r + '</a>';

						if (isInternalUrl(address, r)) {
							console.log(r);
						}
					} else if (element.tag === 'img') {
						html += '<img src="" />'
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
	let data = content.split('<' + element.tag + ' ');
	let scrape = element.scrape + '=';

	for (let i = 1, part; part = data[i]; i++) {
		let url = part.getBetween(scrape + "'", "'");

		if (!url) {
			url = part.getBetween(scrape + '"', '"');
		}

		if ((element.tag === 'a' && url.startsWith("http")) || element.tag === 'img') {
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