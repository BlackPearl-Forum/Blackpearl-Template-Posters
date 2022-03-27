// ==UserScript==
// @name        Blackpearl Movie/TV Template Generator
// @version     4.0.2
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Omdb/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Omdb/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(129|172|173|174|175|176|178|179|180|181|183|184|187|188|189|190|193|194|197|198|199|200|203|204|206|207|208|210|223)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @grant       GM_addStyle
// @grant       GM.xmlHttpRequest
// @run-at      document-end
// @connect     imdb.com
// ==/UserScript==

///////////////////////////////////////////////////////////////////////////
//                                  HTML                                 //
///////////////////////////////////////////////////////////////////////////

const htmlTemplate = `
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button class="button--primary button button--icon" id="showTemplate" style="display:none" type="button">Show</button>
<div id="OmdbGenerator">
<input type="text" id="hiddenIID" value="" style="display:none">
<div class="ui search" id="omdbSearch">
<input type="text" class="prompt input" id="searchID" placeholder="Enter Imdb ID or Link"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'Enter Imdb ID or Link'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="screensLinks" value="" class="input" placeholder="Screenshot Links" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Screenshot Links'">
<input type="text" id="ytLink" value="" class="input" placeholder="Youtube Trailer Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Youtube Trailer Link'">
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<textarea rows="1" style="width:100%;" class="input" id="mediaInfo" placeholder="Mediainfo" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Mediainfo'"></textarea>
<div id="textareaDivider">&nbsp;</div>
<span>DownCloud</span>
<label class="switch">
<input type="checkbox" id="Downcloud" value="Downcloud" checked></input>
<span class="slider round"></span></label>
HideReactScore
<input type="number" id="HideReactScore" min="0" max="100" value="0">
HidePosts
<input type="number" id="HidePosts" min="0" max="50" value="0"> <br>
<div id="textareaDivider">&nbsp;</div>
<button class="button--primary button button--icon" id="generateTemplate" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="ClearBtn" type="reset">Clear</button>
<button class="button--primary button button--icon" id="hideTemplate" type="button">Hide</button>
</div>
`;

const omdbinput = `
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button id="showTemplate" style="display:none" class="button--primary button button--icon" type="button">Show</button>
<div id="OmdbGenerator">
<input type="text" id="omdbKey" value="" class="input" placeholder="Enter Your Omdb API Key & Click Save">
<div id="textareaDivider">&nbsp;</div>
<button class="button--primary button button--icon" id="saveKey" type="button">Save Key</button>
<button class="button--primary button button--icon" id="clearBtn" type="reset">Clear</button>
<button class="button--primary button button--icon" id="hideTemplate" type="button">Hide</button>
</div>
`;

var errPopup = `<div class="overlay-container is-active" name='errorpopup' id="js-XFUniqueId2"><div class="overlay" tabindex="-1" role="alertdialog" id="errBox" aria-hidden="false">
<div class="overlay-title">
<a class="overlay-titleCloser js-overlayClose" role="button" tabindex="0" aria-label="Close"></a>
Oops! We ran into some problems.</div>
<div class="overlay-content">
<div class="blockMessage">
<ul>
errormessages
</ul>
</div></div></div></div>`;

var tagSelect = `<li class="select2-selection__choice" title="tagname"><span class="select2-selection__choice__remove" role="presentation">×</span>tagname</li>`;

///////////////////////////////////////////////////////////////////////////
//                               IMDB Scraper                            //
///////////////////////////////////////////////////////////////////////////
class Imdb {
	regexSplit = /([a-z])([A-Z])/g;

	async requestUrl(imdb) {
		this.imdbID = imdb?.match(/tt\d+/)[0] || null;
		if (!this.imdbID) {
			this.imdbDocument = { Error: 'Unable To Find IMDB TT ID' };
			return;
		}
		this.imdbURL = 'https://imdb.com/title/' + this.imdbID;
		const req = await RequestUrl('GET', this.imdbURL, null, {
			'accept-language': 'en-US,en',
		});
		const parser = new DOMParser();
		this.imdbDocument = parser.parseFromString(req.response, 'text/html');
	}

	createJSON() {
		return {
			Title: this.title,
			Name: this.name,
			Poster: this.poster,
			Ratings: {
				Star: this.starRating,
				Total: this.totalRatings,
				Metascore: this.metascore,
			},
			Plot: this.plot,
			Genres: this.genres,
			Taglines: this.taglines,
			ContentRating: this.mpaa,
			DidYouKnow: this.didYouKnow,
			Details: this.details,
			TechSpecs: this.techSpecs,
			Staff: this.staff,
			Trailer: this.trailer,
			Url: this.imdbURL,
			ID: this.imdbID,
		};
	}
	get title() {
		return (
			this.imdbDocument
				.querySelector('title')
				?.innerText.replace(' - IMDb', '')
				.replace('TV Series ', '') || null
		);
	}
	get name() {
		return (
			this.imdbDocument.querySelector('[data-testid=hero-title-block__title]')
				?.innerText || null
		);
	}

	get poster() {
		return (
			this.imdbDocument
				.querySelector('.ipc-image')
				?.src?.replace(/(?!=\.)_V1_.*(?=\.jpg)/, '_V1_SX1000') || null
		);
	}

	get starRating() {
		return (
			this.imdbDocument.querySelector(
				'[data-testid=hero-rating-bar__aggregate-rating__score]'
			)?.innerText || null
		);
	}

	get totalRatings() {
		return (
			this.imdbDocument.querySelector(
				'[data-testid=hero-rating-bar__aggregate-rating__score]'
			)?.nextElementSibling?.nextElementSibling?.innerText || null
		);
	}

	get plot() {
		return (
			this.imdbDocument
				.querySelector('[class="ipc-html-content ipc-html-content--base"]')
				?.innerText.split('—')[0] || null
		);
	}

	get genres() {
		return (
			this.imdbDocument
				.querySelector('[data-testid="storyline-genres"]')
				?.innerText.replace(this.regexSplit, '$1,$2')
				?.split(',')
				?.slice(1, -1) || null
		);
	}

	get taglines() {
		return (
			this.imdbDocument.querySelector(
				'[data-testid="storyline-taglines"] .ipc-metadata-list-item__list-content-item'
			)?.innerText || null
		);
	}

	get mpaa() {
		return (
			this.imdbDocument
				.querySelector(
					'[data-testid="storyline-certificate"] .ipc-metadata-list-item__list-content-item'
				)
				?.innerText?.split(' ')[1] || null
		);
	}

	get didYouKnow() {
		const nodes =
			this.imdbDocument
				.querySelector('[data-testid="DidYouKnow"]')
				?.querySelectorAll('.ipc-list-card--border-line') || null;
		if (!nodes) {
			return null;
		}
		var didYouKnow = {};
		for (const node of nodes) {
			const section =
				node.querySelector('.ipc-metadata-list-item__label')?.innerText || null;
			let content = node.querySelector('.ipc-html-content');
			didYouKnow[titleCase(section).replace(/ /g, '')] =
				section != 'Soundtracks'
					? content?.innerText || null
					: [...content?.children[0]?.children].map((item) => {
							return section == 'Official sites' ? item.href : item.innerText;
					  });
		}
		return didYouKnow;
	}

	get details() {
		const nodes =
			this.imdbDocument.querySelector('[data-testid="title-details-section"]')
				?.children[0]?.children || null;
		if (!nodes || nodes.length === 0) {
			return null;
		}
		var details = {};
		for (let node of nodes) {
			const section =
				node.querySelector('.ipc-metadata-list-item__label')?.innerText || null;
			let content = node.querySelectorAll(
				'.ipc-metadata-list-item__list-content-item'
			);
			if (!section || section.length === 0 || content.length === 0) {
				continue;
			}
			details[titleCase(section).replace(/ /g, '')] = [...content].map(
				(item) => {
					return section == 'Official sites' ? item.href : item.innerText;
				}
			);
		}
		return details;
	}

	get techSpecs() {
		const nodes = this.imdbDocument?.querySelectorAll(
			'[data-testid="TechSpecs"] .ipc-metadata-list__item'
		);
		if (nodes.length === 0) {
			return null;
		}
		var specs = {};
		for (const node of nodes) {
			const sectionNode = node?.children[0]?.innerText || null;
			let content = node?.children[1] || null;
			if (!sectionNode || !content || content.length === 0) {
				continue;
			}
			specs[titleCase(sectionNode).replace(/ /g, '')] =
				content?.children.length === 0
					? content.innerText
					: [...content.querySelectorAll('.ipc-inline-list__item')].map(
							(item) => {
								return item.innerText;
							}
					  );
		}
		return specs;
	}

	get metascore() {
		return (
			this.imdbDocument?.querySelector('span.score-meta')?.innerText || null
		);
	}

	get staff() {
		const nodes =
			this.imdbDocument.querySelector('[data-testid="title-pc-wide-screen"]')
				?.children[0]?.children || null;
		if (nodes?.length == 0) {
			return null;
		}
		var staff = {};
		for (const node of nodes) {
			const jobTitle =
				node?.querySelector('.ipc-metadata-list-item__label')?.innerText ||
				null;
			let people =
				node?.querySelectorAll('.ipc-metadata-list-item__list-content-item') ||
				null;
			if (!jobTitle || !people) {
				continue;
			}
			staff[titleCase(jobTitle).replace(/ /g, '')] = [...people].map((item) => {
				return item.innerText;
			});
		}
		return staff;
	}
	get trailer() {
		let video =
			this.imdbDocument.querySelector('[aria-label="Watch {VideoTitle}"]')
				?.href || null;
		if (video) {
			video = video.replace(/.*(?=\/video)/, 'https://imdb.com');
		}
		return video;
	}
}

///////////////////////////////////////////////////////////////////////////
//                                Utility                                //
///////////////////////////////////////////////////////////////////////////

/**
 * Converts the text in a string to TitleCase
 * @param str String that contains text.
 */
const titleCase = (str) => {
	if (!str) {
		return str;
	}
	str = str.toLowerCase().split(' ');
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
};

/**
 * Converts the text in a string to pascal case (Title Case)
 * @param word String that contains text.
 */
const splitPascalCase = (word) => {
	return word.match(/($[a-z])|[A-Z][^A-Z]+/g).join(' ');
};

// Close Error Popup if overlay clicked
$(document).click(function (e) {
	if (
		(!$('#errBox').is(e.target) && $('#js-XFUniqueId2').is(e.target)) ||
		$('.js-overlayClose').is(e.target)
	) {
		document.getElementsByName('errorpopup')[0].remove();
	}
});

/**
 * Changes template to "shown" state
 */
const ShowTemplate = () => {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementsByName('showDivider')[0].style.display = 'none';
	document.getElementById('OmdbGenerator').style.display = 'block';
};

/**
 * Changes template to "hidden" state
 */
const HideTemplate = () => {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementsByName('showDivider')[0].style.display = 'block';
	document.getElementById('OmdbGenerator').style.display = 'none';
};

/**
 * Adds a tag to the page.
 * @param tag String containing tag that should be added to the forum.
 */
const Popup = (errors) => {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
};

/**
 * Adds a tag to the page.
 * @param tag String containing tag that should be added to the forum.
 */
const TagsPush = (tag) => {
	const tagOutput = tagSelect.replace(/tagname/g, tag);
	let tagParent = document.getElementsByClassName(
		'select2-selection__rendered'
	)[1];
	let tagParent2 = document.getElementsByName('tokens_select')[0];
	let option = document.createElement('option');
	option.text = tag;
	option.value = tag;
	tagParent.insertAdjacentHTML('afterbegin', tagOutput);
	tagParent2.add(option);
};

/**
 * Removes all children from a Node.
 * @param parent Node where the children should be removed from.
 */
const RemoveAllChildNodes = (parent) => {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};

/**
 * Asyncronous XHR returning a Promise.
 * @param method String defining what request method should be used.
 * @param url String containing URL where the request should be sent.
 * @param data Any data to be sent with your request.
 * @param headers Object containing key and values to used as your header.
 */
const RequestUrl = async (method, url, data, headers) => {
	return new Promise((resolve, reject) => {
		GM.xmlHttpRequest({
			method: method,
			url: url,
			data: data,
			headers: headers,
			onload: (response) => {
				resolve(response);
			},
			onerror: (response) => {
				reject(response);
			},
		});
	});
};

///////////////////////////////////////////////////////////////////////////
//                                 Mediainfo                             //
///////////////////////////////////////////////////////////////////////////
/**
 * Handles scraping of Mediainfo
 * @param mediainfo String that contains FULL mediainfo from Mediainfo Application
 */
class Mediainfo {
	constructor(mediainfo) {
		this.video = mediainfo.match(/(Video|Video #1)$.*?(?=\n{2,})/ms)?.[0];
		this.audio = mediainfo.match(/(Audio|Audio #1)$.*?(?=\n{2,})/ms)?.[0];
		this.general = mediainfo.match(/General$.*?(?=\n{2,})/ms)?.[0];
	}

	create() {
		return {
			video: this.video,
			audio: this.audio,
			general: this.general,
			VideoResolution: this.videoResolution,
			VideoLibrary: this.videoWritingLib,
			BitDepth: this.videoBitDepth,
			AudioCodec: this.audioCodec,
			Size: this.fileSize,
		};
	}
	/**
	 * Returns String of the corresponding resolution based on Video Width.
	 *
	 * Returns Empty String if Invalid or Unknown
	 */
	get videoResolution() {
		switch (this.video?.match(/(?<=Width.*)\d(\s)?\d+/)?.[0]) {
			case '3 840':
				return '2160p';
			case '1 920':
				return '1080p';
			case '1 280':
				return '720p';
			case '720':
				return '480p';
			default:
				return '';
		}
	}

	/**
	 * Returns String containing first video Libaray or Format
	 *
	 * Returns Empty String if Invalid or Unknown
	 */
	get videoWritingLib() {
		return (
			this.video?.match(/Writing library.*(x264|x265)/)?.[1] ||
			this.video?.match(/(?<=Format.*\s)\w{3,4}\n/)?.[0] ||
			''
		);
	}

	/**
	 * Returns String containing first video Bit Depth
	 *
	 * Returns Empty String if Invalid or Unknown
	 */
	get videoBitDepth() {
		return this.video?.match(/(?<=Bit depth.*)\d+/)?.[0].concat('Bit') || '';
	}

	/**
	 * Returns String containing first audio Codec
	 *
	 * Returns Empty String if Invalid or Unknown
	 */
	get audioCodec() {
		return this.audio?.match(/(?<=Codec ID.*A_)\w+/)?.[0] || '';
	}

	/**
	 * Returns String containing the File Size.
	 *
	 * Returns Empty String if Invalid or Unknown
	 */
	get fileSize() {
		return (
			this.general?.match(/(?<=File size.*)\d+\s\w+/)?.[0].replace('i', '') ||
			''
		);
	}
}

///////////////////////////////////////////////////////////////////////////
//                                 BBCode                                //
///////////////////////////////////////////////////////////////////////////

/**
 * Handles all generation of BBCode
 */
class BBCodeGenerator {
	/**
	 * Generates BBCode for Download Links.
	 * @param links - String that contains 1 or more link to process (Seperated by spaces)
	 */
	download(links) {
		links = document.getElementById('Downcloud').checked
			? links.split(' ').map((link) => `[downcloud]${link}[/downcloud]\n`)
			: links.split(' ');
		var prefix = [
			'[hr][/hr][center][size=6][forumcolor][b]Download Link[/b][/forumcolor][/size]\n[hidereact=1,2,3,4,5,6,7,8]',
		];
		var suffix = ['\n[/center]', '[/hidereact]'];
		const reactCount = document.getElementById('HideReactScore').value;
		if (reactCount !== '0') {
			prefix.push(`[hidereactscore=${reactCount}]`);
			suffix.unshift('[/hidereactscore]');
		}
		const postsCount = document.getElementById('HidePosts').value;
		if (postsCount !== '0') {
			prefix.push(`[hideposts=${postsCount}]`);
			suffix.unshift('[/hideposts]');
		}
		return prefix.join('') + links.join('') + suffix.join('');
	}
	/**
	 * Generates BBCode for Screenshot Images.
	 * @param links - String that contains 1 or more link to process (Seperated by spaces)
	 */
	screenshots(links) {
		if (!links) return '';
		const imageBBCode = links
			.split(' ')
			.map((link) => `[img]${link}[/img]`)
			.join('');
		return `\n[hr][/hr][indent][size=6][forumcolor][b]Screenshots[/b][/forumcolor][/size][/indent]\n [spoiler='Screenshots']\n${imageBBCode}[/spoiler]`;
	}
	/**
	 * Generates BBCode based on IMDB Scraper.
	 * @param link - String that contains IMDB title url.
	 */
	async imdb(link) {
		const scraper = new Imdb();
		await scraper.requestUrl(link);
		if (scraper.imdbDocument?.Error) {
			return null;
		}
		const imdbInfo = scraper.createJSON();
		// Update to show all ratings avaliable
		let movieInfo = '';
		if (imdbInfo?.Staff) {
			movieInfo += Object.entries(imdbInfo.Staff)
				.map(
					(staff) =>
						`[*][B]${splitPascalCase(staff[0])}: [/B] ${staff[1].join(', ')}\n`
				)
				.join('');
		}
		if (imdbInfo?.ContentRating) {
			movieInfo += `[*][B]Content Rating: [/B] ${imdbInfo.ContentRating}\n`;
		}
		if (imdbInfo?.Genres) {
			movieInfo += `[*][B]Genre: [/B] ${imdbInfo.Genres.join(', ')}\n`;
		}
		if (imdbInfo?.Details?.ReleaseDate) {
			movieInfo += `[*][B]Release Date: [/B] ${imdbInfo.Details.ReleaseDate.join(
				', '
			)}\n`;
		}
		if (imdbInfo?.TechSpecs) {
			movieInfo += Object.entries(imdbInfo.TechSpecs)
				.map(
					(detail) =>
						`[*][B]${splitPascalCase(detail[0])}: [/B] ${
							Array.isArray(detail[1]) ? detail[1]?.join(', ') : detail[1]
						}\n`
				)
				.join('');
		}
		if (imdbInfo?.Details?.ProductionCompanies) {
			movieInfo += `[*][B]Production: [/B] ${imdbInfo.Details.ProductionCompanies.join(
				', '
			)}\n`;
		}
		movieInfo = movieInfo
			? `\n[hr][/hr][indent][size=6][forumcolor][b]Movie Info[/b][/forumcolor][/size][/indent]\n[LIST]${movieInfo}[/LIST]\n`
			: '';
		return {
			Poster: imdbInfo?.Poster
				? `[center][img width='350px']${imdbInfo.Poster}[/img][/center]\n`
				: '',
			Title: `[center][forumcolor][b][size=6][url='https://blackpearl.biz/search/1/?q=${
				imdbInfo?.ID || ''
			}&o=date']${
				imdbInfo?.Title || ''
			}[/url][/size][/b][/forumcolor][/center]\n`,
			Rating: imdbInfo?.Ratings?.Star
				? `[size=6]${imdbInfo.Ratings.Star}[/size][/center]\n`
				: '[/center]\n',
			TotalRatings: imdbInfo?.Ratings?.Total
				? `[center][img]https://i.imgur.com/sEpKj3O.png[/img][size=6]${imdbInfo.Ratings.Total}[/size][/center]\n`
				: '',
			Plot: imdbInfo?.Plot
				? `[hr][/hr][indent][size=6][forumcolor][b]Plot[/b][/forumcolor][/size][/indent]\n\n${imdbInfo.Plot}`
				: '',
			Search: imdbInfo?.ID
				? `[center][url=https://www.imdb.com/title/${imdbInfo.ID}][img width='46px']https://i.imgur.com/KO5Twbs.png[/img][/url]`
				: '[center][img width="46px"]https://i.imgur.com/KO5Twbs.png[/img][/url]',
			Details: movieInfo,
			Genres: imdbInfo?.Genres,
			TitleSimple: imdbInfo?.Title,
		};
	}
}

///////////////////////////////////////////////////////////////////////////
//                            Main Generation                            //
///////////////////////////////////////////////////////////////////////////

/**
 * Create's extra BBCode not related to the body message.
 * @param mediainfo String that contains FULL mediainfo from Mediainfo Application
 * @param title String that contains the Title from the IMDB Scraper.
 * @param genres Array that contains the Generes from the IMDB Scraper.
 */
const GenerateExtras = (mediainfo, title, genres) => {
	const mediaScraper = new Mediainfo(mediainfo);
	const media = mediaScraper.create();
	let tags = genres ? genres : [];
	title = [
		title,
		media.VideoResolution,
		media.BitDepth,
		media.VideoLibrary,
	].join(' ');
	if (media.video?.includes('Dolby Vision')) {
		tags.push('Dolby Vision');
		title += ' Dolby Vision';
	}
	if (media.video?.includes('HDR10+ Profile')) {
		tags.push('hdr10plus');
		title += ' HDR10Plus';
	} else if (media.video?.includes('HDR10 Compatible')) {
		tags.push('hdr10');
		title += ' HDR10';
	}
	title += ` ${media.AudioCodec}`;
	if (
		[
			129, 172, 173, 174, 175, 176, 178, 179, 180, 181, 183, 184, 202, 204,
		].includes(parseInt(window.location.href.match(/\d+/, '')[0]))
	) {
		title += ` ${media.Size}`;
	}
	return {
		title: title,
		tags: tags,
		mediainfo: `[hr][/hr][indent][size=6][forumcolor][b]Media Info[/b][/forumcolor][/size][/indent]\n[spoiler='Click here to view Media Info']\n${mediainfo}\n[/spoiler]\n`,
	};
};

/**
 * Send's generated data into DOM
 * @param forumBBcode String that contains FULL body message we want to send.
 * @param tags Array that contains the tags we want to add to the post.
 * @param title String that contains the Full title of the post.
 * @param titleBool Boolean to send title data.
 */
const PasteToForum = (forumBBcode, tags, title, titleBool) => {
	try {
		document.getElementsByName('message')[0].value = forumBBcode;
	} catch (err) {
		RemoveAllChildNodes(
			document.getElementsByClassName('fr-element fr-view')[0]
		);
		let p = document.createElement('p');
		p.innerText = forumBBcode;
		document.getElementsByClassName('fr-element fr-view')[0].appendChild(p);
	} finally {
		if (tags) {
			document.getElementsByName('tags')[0].value = tags.join(', ');
			for (let tag of tags) {
				TagsPush(tag);
			}
		}
		if (titleBool) {
			document.getElementsByClassName('js-titleInput')[0].value = title;
		}
	}
};

const generateTemplate = async () => {
	const [imdbInput, downloadLinks, mediaInfo] = [
		document.getElementById('searchID').value,
		document.getElementById('ddl').value,
		document.getElementById('mediaInfo').value,
	];
	if (!imdbInput || !downloadLinks || !mediaInfo) {
		let errors = '';
		errors += !imdbInput ? "<li>You Didn't Enter an IMDB ID or Link!</li>" : '';
		errors += !downloadLinks
			? "<li>You Forgot Your Download Link! That's Pretty Important...!</li>"
			: '';
		errors += !mediaInfo
			? "<li>You Don't Have Any Mediainfo? It's Required!</li>"
			: '';
		Popup(errors);
		return;
	}
	const bbcodeHandler = new BBCodeGenerator();
	const downloadBBCode = bbcodeHandler.download(downloadLinks);
	const screenshotsBBCode = bbcodeHandler.screenshots(
		document.querySelector('#screensLinks').value
	);
	const youtubeLink = document.getElementById('ytLink').value;
	const trailer = youtubeLink.match(/[a-z]/)
		? `\n[hr][/hr][indent][size=6][forumcolor][b]Trailer[/b][/forumcolor][/size][/indent]\n ${youtubeLink}`
		: '';
	const imdbInfo = await bbcodeHandler.imdb(imdbInput);
	const titleBool = !document.getElementsByClassName('js-titleInput')[0].value;
	const extras = GenerateExtras(
		mediaInfo,
		imdbInfo.TitleSimple,
		imdbInfo.Genres
	);
	PasteToForum(
		`${imdbInfo.Poster}${imdbInfo.Title}${imdbInfo.Search} ${imdbInfo.Rating}${imdbInfo.TotalRatings}${imdbInfo.Plot}${trailer}${screenshotsBBCode}${imdbInfo.Details}${extras.mediainfo}${downloadBBCode}`,
		extras.tags,
		extras.title,
		titleBool
	);
};

///////////////////////////////////////////////////////////////////////////
//                                  Main                                 //
///////////////////////////////////////////////////////////////////////////

/**
 * The main function being ran.
 * Pushes our HTML to the DOM.
 * Generates Event Listeners on our buttons.
 */
const main = () => {
	document.getElementsByTagName('dd')[0].innerHTML += htmlTemplate;
	document.querySelector('#hideTemplate').addEventListener(
		'click',
		() => {
			HideTemplate();
		},
		false
	);
	document.querySelector('#showTemplate').addEventListener(
		'click',
		() => {
			ShowTemplate();
		},
		false
	);
	document.querySelector('#generateTemplate').addEventListener(
		'click',
		() => {
			generateTemplate();
		},
		false
	);
};

GM_addStyle(`
@media screen and (min-width: 300px) {
	/* Reactscore & Posts */
	input[type='number'] {
		border-bottom: 2px solid teal;
		border-image: linear-gradient(to right, #11998e, #38ef7d);
		border-image-slice: 1;
		background: transparent;
		color: white;
		max-width: 35px;
	}
	#textareaDivider {
		margin-top: -11px;
	}
	/* Start Rounded sliders Checkboxes */
	.switch {
		position: relative;
		display: inline-block;
		width: 42px;
		height: 17px;
	}
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}
	.slider:before {
		position: absolute;
		content: '';
		height: 13px;
		width: 13px;
		left: 2px;
		bottom: 2px;
		background-color: #42464d;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}
	input:checked + .slider {
		background-color: #4caf50;
	}
	input:focus + .slider {
		box-shadow: 0 0 1px #4caf50;
	}
	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}
	.slider.round {
		border-radius: 34px;
	}
	.slider.round:before {
		border-radius: 50%;
	}
}
@media screen and (min-width: 768px) {
	/* Reactscore & Posts */
	input[type='number'] {
		border-bottom: 2px solid teal;
		border-image: linear-gradient(to right, #11998e, #38ef7d);
		border-image-slice: 1;
		background: transparent;
		color: white;
		max-width: 35px;
	}
	#textareaDivider {
		margin-top: -11px;
	}
	.switch {
		position: relative;
		display: inline-block;
		width: 42px;
		height: 17px;
	}
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}
	.slider:before {
		position: absolute;
		content: '';
		height: 13px;
		width: 13px;
		left: 2px;
		bottom: 2px;
		background-color: #42464d;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}
	input:checked + .slider {
		background-color: #4caf50;
	}
	input:focus + .slider {
		box-shadow: 0 0 1px #4caf50;
	}
	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}
	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}
	.slider.round:before {
		border-radius: 50%;
	}
}`);

main();
