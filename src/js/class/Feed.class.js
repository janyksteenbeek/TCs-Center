const contentsAvailable = ['msgs', 'topics'];
export const productsAvailable = [
	{
		'name': 'YouTube',
		'id': 0,
		'param': 'youtube',
		'img': 'youtube'
	},
	{
		'name': 'Chrome',
		'id': 1,
		'param': 'chrome',
		'img': 'chrome'
	},
	{
		'name': 'Gmail',
		'id': 2,
		'param': 'gmail',
		'img': 'gmail'
	},
	{
		'name': 'AdSense',
		'id': 3,
		'param': 'adsense',
		'img': 'adsense'
	},
	{
		'name': 'Maps',
		'id': 4,
		'param': 'maps',
		'img': 'maps'
	},
	{
		'name': 'Photos',
		'id': 5,
		'param': 'photos',
		'img': 'photos'
	},
	{
		'name': 'Websearch',
		'id': 6,
		'param': 'websearch',
		'img': 'websearch'
	},
	{
		'name': 'Calendar',
		'id': 7,
		'param': 'calendar',
		'img': 'calendar'
	},
	{
		'name': 'Webmaster',
		'id': 8,
		'param': 'webmaster',
		'img': 'search-console'
	},
	{
		'name': 'Chromebook',
		'id': 9,
		'param': 'chromebook-central',
		'img': 'chromebook'
	},
	{
		'name': 'G Suite Administrator',
		'id': 10,
		'param': 'apps',
		'img': 'g-suite'
	},
	{
		'name': 'Google Play',
		'id': 11,
		'param': 'play',
		'img': 'google-play'
	},
	{
		'name': 'Google Home',
		'id': 12,
		'param': 'googlehome',
		'img': 'google-home'
	},
	{
		'name': 'Google Wifi',
		'id': 13,
		'param': 'googlewifi',
		'img': 'google-wifi'
	},
	{
		'name': 'Google Education',
		'id': 14,
		'param': 'google-education',
		'img': 'education'
	},
	{
		'name': 'CS First',
		'id': 15,
		'param': 'cs-first',
		'img': 'csfirst'
	},
];

class Feed {

	constructor(feed) {
		this.id = 'feed';
		this.product = feed.product;
		this.active = feed.active;
		this.number = feed.number;
		this.notification = feed.notification;
		this.content = feed.content;
		this.topics = feed.topics || [];
		this.status = feed.status || 200;
	}

	setProduct(value) {
		this.product = productsAvailable.find(item => item.id === parseInt(value));
	}

	setActive(value) {
		this.active = (typeof(value) === "boolean") ? value : true;
	}

	setNumber(value) {
		this.number = (parseInt(value, 10) <= 10 && parseInt(value, 10) > 0) ? parseInt(value) : 5;
	}

	setNotification(value) {
		this.notification = (typeof (value) === "boolean") ? value : true;
	}

	setContent(value) {
		this.content = (contentsAvailable.includes(value)) ? value : contentsAvailable[0];
	}
}


export function getFeed(feed = {
	'active': true,
	'notification': true,
	'number': 5,
	'product': productsAvailable[0],
	'content': contentsAvailable[0],
}) {
 	return new Feed(feed);
}