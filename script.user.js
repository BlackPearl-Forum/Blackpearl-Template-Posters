// ==UserScript==
// @name        Blackpearl Music Template Generator
// @version     1.0.1
// @description Creates a BBCode template with data pulled from the Discogs API.
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/tree/Music
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Music/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Music/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(88|89|90|91|163)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM.xmlHttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// @connect     api.discogs.com
// ==/UserScript==

///////////////////////////////////////////////////////////////////////////
//                                  HTML                                 //
///////////////////////////////////////////////////////////////////////////
const htmlTemplate = `
<button id="showTemplate" name="templateButton" style="display:none" type="button">Show</button>
<div id="discogGenerator">
<input type="text" id="masterUrl" value="" style="display:none">
<div class="ui search" id="discogSearch">
<input type="text" class="prompt input" id="searchID" placeholder="Artist + Album name"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'Artist + Album name'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="qImgs" value="" class="input" placeholder="Quality Image Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Quality Image Link'">
<textarea rows="1" style="width:100%;" class="input" id="qText" placeholder="Quality Text" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Quality Text'"></textarea>
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
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
<button class="button--primary button button--icon" id="generateTemplate" name="templateButton" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="clearBtn" name="templateButton" type="reset">Clear</button>
<button class="button--primary button button--icon" id="hideTemplate" name="templateButton" type="button">Hide</button>
</div>
`;

const dginput = `
<button id="showTemplate" name="templateButton" style="display:none" type="button">Show</button>
<div id="discogGenerator">
<input type="text" id="dgKey" value="" class="input" placeholder="Enter Your Discog API Key, Then Click On Save." onfocus="this.placeholder = ''" onblur="this.placeholder = 'Enter Your Discog API Key, Then Click On Save.'">
<button class="button--primary button button--icon" id="saveKey" name="templateButton" type="button">Save Key</button>
<button class="button--primary button button--icon" id="clearBtn" name="templateButton" type="reset">Clear</button>
<button class="button--primary button button--icon" id="hideTemplate" name="templateButton" type="button">Hide</button>
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

const lossless = window.location.href.match(/\d+/, '').includes('88');

///////////////////////////////////////////////////////////////////////////
//                                Utility                                //
///////////////////////////////////////////////////////////////////////////
// Close Error Popup if overlay clicked
document.addEventListener('click', (element) => {
	if (
		(document.querySelector('#errBox') != element.target &&
			document.querySelector('#js-XFUniqueId2') == element.target) ||
		document.querySelector('.js-overlayClose') == element.target
	) {
		document.querySelector('[name="errorpopup"]').remove();
	}
});

// Changes template to "shown" state
const ShowTemplate = () => {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementById('discogGenerator').style.display = 'none';
};

// Changes template to "hidden" state
const HideTemplate = () => {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementById('discogGenerator').style.display = 'block';
};

/**
 * Pop's up an error overlay
 * @param {string} errors HTML Errors (li) that should be displayed to the user.
 * @returns {void}
 */
const Popup = (errors) => {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
};

/**
 * Adds a tag to the post.
 * @param {string} tag text to add to the post as a tag.
 * @returns {void}
 */
const TagsPush = (tag) => {
	let tagOutput = tagSelect.replace(/tagname/g, tag);
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
 * @param {HTMLElement} parent parent node to remove children from.
 * @returns {void}
 */
const RemoveAllChildNodes = (parent) => {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};
/**
 * Asyncronous XHR returning a Promise.
 * @param {string} method HTTP method to use. [GET, HEAD, POST, etc]
 * @param {string} url String containing URL where the request should be sent.
 * @param {any} data Any data to be sent with your request.
 * @param {object} headers Object containing key and values to used as your header.
 * @returns {Promise<object>} HTTP Response
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

/**
 * Adds CSS into DOM.
 * @param {string} styleString Style to inject into HTML head
 */
const addStyle = (styleString) => {
	const style = document.createElement('style');
	style.textContent = styleString;
	style.id = 'blackpearl-omdb-userscript';
	document.head.append(style);
};

// Displays Search Results
const SearchDiscog = (APIVALUE) => {
	$('#discogSearch').search({
		type: 'category',
		apiSettings: {
			url: `https://api.discogs.com/database/search?q={query}&type=master&token=${APIVALUE}`,
			onResponse: function (myfunc) {
				var response = {
					results: {},
				};
				$.each(myfunc.results, function (index, item) {
					var category = item.type || 'Unknown',
						maxResults = 10;
					if (index >= maxResults) {
						return false;
					}
					if (response.results[category] === undefined) {
						response.results[category] = {
							name: '~~~~~~~~~~' + category + '~~~~~~~~~~',
							results: [],
						};
					}
					var Name = item.title + ' (' + item.year + ')';
					response.results[category].results.push({
						title: Name,
						description: Name,
						master_url: item.master_url,
					});
				});
				delete (response.results.release,
				response.results.label,
				response.results.artist);
				return response;
			},
		},
		fields: {
			results: 'results',
			title: 'name',
		},
		onSelect: function (response) {
			document.getElementById('masterUrl').value = response.master_url;
		},
		minCharacters: 3,
	});
};

/**
 * Checks API Key for valid response from Discog.
 * @param {string} url Url to check API.
 * @returns {Promise <boolean|object>}
 */
const CheckApiStatus = async (url) => {
	return RequestUrl('GET', url)
		.then(function (response) {
			if (!response.ok) {
				if (response.status === 401) {
					let data = JSON.parse(response.responseText);
					let errors =
						'<li>Something Messed Up! Check The Discog Error Below.</li>';
					errors += `<li>${data.message}</li>`;
					Popup(errors);
					throw Error('401 Response');
				}
			} else {
				throw Error(
					`Unable To Verify API Key. \n HTTP STATUS CODE: ${response.status}`
				);
			}
			return response;
		})
		.then(function (response) {
			return true;
		})
		.catch(function (error) {
			if (error.message !== '401 Response') {
				let errors =
					'<li>Something Messed Up! Check The Discog Error Below.</li>';
				errors += `<li>${error.message}</li>`;
				Popup(errors);
			}
			console.error(error);
			return false;
		});
};

// Check and Save API Key if valid
const SaveApiKey = () => {
	let discogKey = document.getElementById('dgKey').value;
	if (discogKey) {
		let apiResult = CheckApiStatus(
			`https://api.discogs.com/oauth/identity?token=${discogKey}`
		);
		apiResult.then(function (result) {
			if (result) {
				GM.setValue('DiscogKey', discogKey);
				document.getElementById('discogGenerator').remove();
				document.getElementById('showTemplate').remove();
				Main();
			}
		});
	} else {
		let errors = '<li>Something Messed Up! Check The Error Below.</li>';
		errors += `<li>No API Key found. Please check that you have entered your key and try again.</li>`;
		Popup(errors);
	}
};
/**
 * Handles all generation of BBCode
 */
class BBCodeGenerator {
	/**
	 * Generates BBCode for Download Links.
	 * @param {string} links - Link(s) to be processed.
	 * @returns {string} - Compiled BBCode.
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
	 * Generates BBCode for Images.
	 * @param {string} images - Link(s) to be processed.
	 * @param {string} text - Text to be processed.
	 * @returns {string} - Compiled BBCode
	 */
	quality(images, text) {
		if (!images && !text) return '';
		var imageBBCode = '';
		if (images) {
			imageBBCode = images
				.split(' ')
				.map((link) => `[img]${link}[/img]`)
				.join('');
		}
		return `[hr][/hr][center][size=6][forumcolor][b]Quality Proof[/b][/forumcolor][/size]\n${imageBBCode}[spoiler="Quality Proof"]${text}[/Spoiler]\n`;
	}
}

// Handle BBCode for Album Details
const AlbumHandler = async (albumURL) => {
	let response = await RequestUrl('GET', albumURL);
	var albumjson = JSON.parse(response.responseText);
	let styles = String();
	if (albumjson.styles) {
		styles = '[*][b][forumcolor]Style(s): [/b][/forumcolor] ';
		for (const style of albumjson.styles) {
			styles += `[url=https://www.discogs.com/style/${style.replace(
				' ',
				'+'
			)}]${style}[/url], `;
		}
	}
	let genres = String();
	if (albumjson.genres) {
		genres = '\n[*][forumcolor][b]Genre(s): [/b][/forumcolor] ';
		for (const genre of albumjson.genres) {
			genres += `[url=https://www.discogs.com/genre/${genre.replace(
				' ',
				'+'
			)}]${genre}[/url], `;
		}
	}
	let videos = String();
	if (albumjson.videos) {
		videos = '[spoiler="Video(s)"]\n';
		for (const video of albumjson.videos) {
			videos += video.uri + '\n';
		}
		videos += '[/spoiler]\n';
	}
	let tracks = String();
	if (albumjson.tracklist) {
		tracks =
			'\n[spoiler="Track List"]\n[TABLE=collapse]\n[TR]\n[TH]No.[/TH]\n[TH]Track Name[/TH]\n[TH]Track Duration[/TH]\n[/TR]\n';
		for (let t of albumjson.tracklist) {
			tracks += `[TR][TD]${t.position}[/TD]\n[TD]${t.title}[/TD]\n`;
			if (t.duration) {
				tracks += `[TD]${t.duration}[/TD]`;
			}
			tracks += '[/TR]\n';
		}
		if (!albumjson.tracklist[0].duration) {
			tracks = tracks.replace('[TH]Track Duration[/TH]\n', '');
		}
		tracks += '[/TABLE]\n[/spoiler]\n';
	}
	let artistName = albumjson.artists[0].name.replace(/\(\d*\)/g, '');
	return {
		cover: albumjson.images
			? `[center][img width="250px"]${albumjson.images[0].uri}[/img][/center]\n`
			: '',
		artistName: artistName,
		artistURL: albumjson.artists[0].resource_url,
		album:
			albumjson.uri && albumjson.title
				? `[center][forumcolor][b][size=6][url=${albumjson.uri}]${albumjson.title}[/url][/size][/b][/forumcolor][/center]\n`
				: '',
		tracknum: `[center][size=6]${albumjson.tracklist.length} Tracks[/size][/center]\n`,
		styles: styles,
		genres: genres,
		videos: videos,
		albumDetails: `[INDENT][size=6][forumcolor][B]Album Details[/B][/forumcolor][/size][/INDENT]\n[list]\n${styles}${genres}\n[*][forumcolor][b]Release Year: [/b][/forumcolor]${albumjson.year}\n[/list]\n`,
		tracks: tracks,
		tags: albumjson.genres.concat(albumjson.styles), //? Find example of "blank" genres or styles, possible error checking needed
		forumTitle: `${artistName} - ${albumjson.title} (${albumjson.year})`,
	};
};

// Handle BBCode for Artist Details
const ArtistHandler = async (artistURL, artistName) => {
	let response = await RequestUrl('GET', artistURL);
	var artistjson = JSON.parse(response.responseText);
	let members =
		'[indent][size=6][forumcolor][B]Artist Details[/B][/forumcolor][/size][/indent]\n';
	if (artistjson.members) {
		let memberlist = artistjson.members;
		members += '[spoiler="Member List"]\n[tabs]';
		for (let ml of memberlist) {
			members += `[slide=${ml.name}]\n[img width="150px"]${ml.thumbnail_url}[/img][/slide]\n`;
		}
		members += '[/tabs]\n[/spoiler]\n';
	}
	let artistLinks = String();
	if (artistjson.urls) {
		artistLinks = '[spoiler="Artist Links"]\n';
		for (let link of artistjson.urls) {
			artistLinks += link.replace('http:', 'https:') + '\n';
		}
		artistLinks += '\n[/spoiler]\n[hr][/hr]\n';
	}
	return {
		artist:
			artistName && artistjson.uri
				? `[center][forumcolor][b][size=6][url=${artistjson.uri.replace(
						'http:',
						'https:'
				  )}]${artistName}[/url][/size][/b][/forumcolor][/center]\n`
				: '',
		artistInfo: artistjson.profile
			? `[spoiler="About Artist"]\n${artistjson.profile
					.replace(/\[.=/gm, '')
					.replace(/\[.*?\]/gm, '')}\n[/spoiler]`
			: '',
		members: members,
		artistLinks: artistLinks,
	};
};

// Submit Generated BBCode to the forums
const SubmitToForum = (albumDict, artistDict, quality, downloadLinks) => {
	let forumBBcode = `${albumDict.cover}${artistDict.artist}${albumDict.album}${albumDict.tracknum}${artistDict.members}${artistDict.artistInfo}${artistDict.artistLinks}${albumDict.albumDetails}${albumDict.tracks}${albumDict.videos}${quality}${downloadLinks}`;
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
		// TODO: Add all Genre's and Styles from Discog to BP Tag System
		if (albumDict.tags) {
			document.getElementsByName('tags')[0].value = albumDict.tags.toString();
			for (const tag of albumDict.tags) {
				TagsPush(tag);
			}
		}
		if (!document.getElementsByClassName('js-titleInput')[0].value) {
			document.getElementsByClassName('js-titleInput')[0].value =
				albumDict.forumTitle;
		}
	}
};

// Handles Generation of BBcode Template
const GenerateTemplate = async (APIVALUE) => {
	var [downloadLinks, qualityImages, qualityText, masterUrl] = [
		document.getElementById('ddl').value,
		document.getElementById('qImgs').value,
		document.getElementById('qText').value,
		document.getElementById('masterUrl').value,
	];
	if (
		!masterUrl |
		!downloadLinks |
		(lossless & !qualityImages & !qualityText)
	) {
		var errors = '';
		errors += !masterUrl
			? "<li>You Didn't Select A Result or Enter a URL!</li>"
			: '';
		errors += !downloadLinks
			? "<li>Uh Oh! You Forgot Your Download Link! That's Pretty Important...</li>"
			: '';
		if (lossless) {
			errors +=
				!qualityImages && !qualityText
					? '<li>You Didnt Add A Quality / Log Proof</li>'
					: '';
		}
		if (errors) {
			Popup(errors);
		}
		return;
	}
	let albumDict = await AlbumHandler(`${masterUrl}?token=${APIVALUE}`);
	const bbcode = new BBCodeGenerator();
	const downloadBBCode = bbcode.download(downloadLinks);
	const quality = bbcode.quality(qualityImages, qualityText);
	const artistDict = albumDict.artistURL
		? ArtistHandler(
				`${albumDict.artistURL}?token=${APIVALUE}`,
				albumDict.artistName
		  )
		: null;
	if (artistDict) {
		artistDict.then((artistValue) => {
			SubmitToForum(albumDict, artistValue, quality, downloadBBCode);
		});
	} else {
		const artistDetails = {
			artist: `[center][forumcolor][b][size=6]Various Artists[/size][/b][/forumcolor][/center]\n`,
			artistInfo: '',
			artistLinks: '',
			members: '',
		};
		SubmitToForum(albumDict, artistDetails, quality, downloadBBCode);
	}
};

// TODO: Add CheckApiStatus to Main
const Main = async () => {
	const APIVALUE = await GM.getValue('DiscogKey', 'foo');
	document.getElementsByTagName('dd')[0].innerHTML +=
		APIVALUE !== 'foo' ? htmlTemplate : dginput;
	document.getElementById('hideTemplate').addEventListener(
		'click',
		() => {
			HideTemplate();
		},
		false
	);
	document.getElementById('showTemplate').addEventListener(
		'click',
		() => {
			ShowTemplate();
		},
		false
	);
	if (APIVALUE !== 'foo') {
		SearchDiscog(APIVALUE);
		document.getElementById('generateTemplate').addEventListener(
			'click',
			() => {
				GenerateTemplate(APIVALUE);
			},
			false
		);
	} else {
		document.getElementById('saveKey').addEventListener(
			'click',
			() => {
				SaveApiKey();
			},
			false
		);
	}
};

Main();

addStyle(`@media screen and (min-width: 300px) {
	/* Divide Buttons */
	.divider {
		width: 8px;
		height: auto;
		display: inline-block;
	}
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
	.content {
		cursor: pointer;
	}
}
@media screen and (min-width: 768px) {
	/* Divide Buttons */
	.divider {
		width: 15px;
		height: auto;
		display: inline-block;
	}
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
	.content {
		cursor: pointer;
	}
}
`);
