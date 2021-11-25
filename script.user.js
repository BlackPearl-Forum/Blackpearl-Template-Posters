// ==UserScript==
// @name        Blackpearl Movie/TV Template Generator
// @version     3.1.0
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Omdb/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Omdb/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(129|172|173|174|175|176|178|179|180|181|183|184|187|188|189|190|193|194|197|198|199|200|203|204|206|207|208|210|223)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// @connect     omdbapi.com
// ==/UserScript==

Main();

const htmlTemplate = `
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button class="button--primary button button--icon" id="showTemplate" style="display:none" type="button">Show</button>
<div id="OmdbGenerator">
<input type="text" id="hiddenIID" value="" style="display:none">
<div class="ui search" id="omdbSearch">
<input type="text" class="prompt input" id="searchID" placeholder="IMDB ID, Title, or Link"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'IMDB ID, Title, or Link'">
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

var sectionType;

function Main() {
	GM.getValue('APIKEY', 'foo').then((APIVALUE) => {
		const htmlpush = document.getElementsByTagName('dd')[0];
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : omdbinput;
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
			SectionSearch(APIVALUE);
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
	});
}

// Close Error Popup if overlay clicked
$(document).click(function (e) {
	if (
		(!$('#errBox').is(e.target) & $('#js-XFUniqueId2').is(e.target)) |
		$('.js-overlayClose').is(e.target)
	) {
		document.getElementsByName('errorpopup')[0].remove();
	}
});

function ShowTemplate() {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementsByName('showDivider')[0].style.display = 'none';
	document.getElementById('OmdbGenerator').style.display = 'block';
}

function HideTemplate() {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementsByName('showDivider')[0].style.display = 'block';
	document.getElementById('OmdbGenerator').style.display = 'none';
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
}

// Push Genre Tags to HTML
function TagsPush(tag) {
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
}

// Removes all Child nodes from a parent | Used for clearing the HTML Render
function RemoveAllChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

// Displays Search Results
function SectionSearch(APIVALUE) {
	const section = parseInt(window.location.href.match(/\d+/, '')[0]);
	const [movies, series] = [
		[129, 172, 173, 174, 175, 176, 178, 179, 180, 181, 183, 184, 202, 204],
		[187, 188, 189, 190, 193, 194, 197, 198, 199, 200, 203, 206, 208, 209, 223],
	];
	var query;
	if (series.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=series`;
		sectionType = 'series';
	} else if (movies.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=movie`;
		sectionType = 'movies';
	} else {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}`;
	}
	$('#omdbSearch').search({
		type: 'category',
		apiSettings: {
			url: query,
			onResponse: function (myfunc) {
				var response = {
					results: {},
				};
				$.each(myfunc.Search, function (index, item) {
					var category =
							item.Type.replace('movie', 'Movies').replace(
								'series',
								'TV Shows'
							) || 'Unknown',
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
					var Name = item.Title + ' (' + item.Year + ')';
					response.results[category].results.push({
						title: Name,
						description: Name,
						imdbID: item.imdbID,
					});
				});
				return response;
			},
		},
		fields: {
			results: 'results',
			title: 'name',
		},
		onSelect: function (response) {
			document.getElementById('hiddenIID').value = response.imdbID;
			document.getElementById('searchID').value = response.title;
		},
		minCharacters: 3,
	});
}

// Asyncronous http requests
async function RequestUrl(url) {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: (response) => {
				resolve(response);
			},
			onerror: (response) => {
				reject(response);
			},
		});
	});
}

// Check response status from API
async function CheckApiStatus(url) {
	return RequestUrl(url)
		.then(function (response) {
			if (response.status !== 200) {
				if (response.status === 401) {
					let data = JSON.parse(response.responseText);
					let errors =
						'<li>Something Messed Up! Check The Omdb Error Below.</li>';
					errors += `<li>${data.message}</li>`;
					Popup(errors);
					throw Error('401 Response');
				} else {
					throw Error(
						`Unable To Verify API Key. \n HTTP STATUS CODE: ${response.status}`
					);
				}
			}
			return true;
		})
		.catch(function (error) {
			if (error.message !== '401 Response') {
				let errors =
					'<li>Something Messed Up! Check The Omdb Error Below.</li>';
				errors += `<li>${error.message}</li>`;
				Popup(errors);
			}
			console.error(error);
			return false;
		});
}

// Check and Save API Key if valid
function SaveApiKey() {
	let omdbKey = document.getElementById('omdbKey').value;
	if (omdbKey) {
		let apiResult = CheckApiStatus(
			`https://www.omdbapi.com/?apikey=${omdbKey}`
		);
		apiResult.then(function (result) {
			if (result) {
				GM.setValue('APIKEY', omdbKey);
				document.getElementById('OmdbGenerator').remove();
				document.getElementById('showTemplate').remove();
				Main();
			}
		});
	} else {
		let errors = '<li>Something Messed Up! Check The Error Below.</li>';
		errors +=
			'<li>No API Key found. Please check that you have entered your key and try again.</li>';
		Popup(errors);
	}
}

// Handles BBCode for Download Links
function DownloadLinkHandler(downloadLinks) {
	let [hideReactScore, hidePosts] = [
		document.getElementById('HideReactScore').value,
		document.getElementById('HidePosts').value,
	];
	if (document.getElementById('Downcloud').checked) {
		let ddlSplit = downloadLinks.split(' ');
		downloadLinks = '';
		for (let singleLink of ddlSplit) {
			if (singleLink) {
				downloadLinks += `[downcloud]${singleLink}[/downcloud]\n`;
			}
		}
	} else {
		downloadLinks = downloadLinks.replace(/\ /g, '\n');
	}
	downloadLinks = `[hidereact=1,2,3,4,5,6,7,8]${downloadLinks.replace(
		/\n+$/,
		''
	)}[/hidereact]`; // Remove extra newline at end of string
	if (hideReactScore !== '0') {
		downloadLinks = `[hidereactscore=${hideReactScore}]${downloadLinks}[/hidereactscore]`;
	}
	if (hidePosts !== '0') {
		downloadLinks = `[hideposts=${hidePosts}]${downloadLinks}[/hideposts]`;
	}
	return `[hr][/hr][center][size=6][forumcolor][b]Download Link[/b][/forumcolor][/size]\n${downloadLinks}\n[/center]`;
}

// Handle BBCode for Screenshots
function ScreenshotHandler(screenshots) {
	var screen = `\n[hr][/hr][indent][size=6][forumcolor][b]Screenshots[/b][/forumcolor][/size][/indent]\n [spoiler='screenshots']\n`;
	for (let ss of screenshots) {
		screen += `[img]${ss}[/img]`;
	}
	screen += `[/spoiler]`;
	return screen;
}

// Parses Mediainfo for Title values
function ParseMediaInfo(mediaInfo, premadeTitle) {
	let videoInfo = mediaInfo.match(/(Video|Video #1)$.*?(?=\n{2,})/ms);
	if (videoInfo) {
		videoInfo = videoInfo[0];
		let videoWidth = videoInfo.match(/Width.*/);
		if (videoWidth) {
			videoWidth = videoWidth[0];
			if (videoWidth.includes('3 840')) {
				premadeTitle += ' 2160p';
			} else if (videoWidth.includes('1 920')) {
				premadeTitle += ' 1080p';
			} else if (videoWidth.includes('1 280')) {
				premadeTitle += ' 720p';
			} else if (videoWidth.includes('720')) {
				premadeTitle += ' 480p';
			}
		}
		let videoWritingLib = videoInfo.match(/Writing library.*/);
		if (
			videoWritingLib &
			(videoWritingLib[0].includes('x265') |
				videoWritingLib[0].includes('x264'))
		) {
			videoWritingLib = videoWritingLib[0];
			if (videoWritingLib.includes('x265')) {
				premadeTitle += ' x265';
			} else if (videoWritingLib.includes('x264')) {
				premadeTitle += ' x264';
			}
		} else {
			let videoFormat = videoInfo.match(/Format.*/);
			if (videoFormat) {
				videoFormat = videoFormat[0];
				if (videoFormat.includes('HEVC')) {
					premadeTitle += ' HEVC';
				} else if (videoFormat.includes('AVC')) {
					premadeTitle += ' AVC';
				}
			}
		}
		let videoBitDepth = videoInfo.match(/Bit depth.*/);
		if (videoBitDepth) {
			videoBitDepth = videoBitDepth[0];
			premadeTitle += videoBitDepth.match(/\d.*/)
				? ` ${videoBitDepth.match(/\d.*/)[0].replace(' bits', 'bit')}`
				: '';
		}
	}
	let audioInfo = mediaInfo.match(/(Audio|Audio #1)$.*?(?=\n{2,})/ms);
	if (audioInfo) {
		audioInfo = audioInfo[0];
		let audioCodec = audioInfo.match(/Codec ID.*/);
		if (audioCodec) {
			audioCodec = audioCodec[0];
			premadeTitle += audioCodec.match(/(?<=A_).*/)
				? ` ${audioCodec.match(/(?<=A_).*/)[0]}`
				: '';
		}
	}
	if (sectionType === 'movies') {
		let generalInfo = mediaInfo.match(/General$.*?(?=\n{2,})/ms);
		if (generalInfo) {
			generalInfo = generalInfo[0];
			let mediaSize = generalInfo.match(/File size.*/);
			if (mediaSize) {
				mediaSize = mediaSize[0];
				premadeTitle += mediaSize.match(/\d.*/)
					? ` [${mediaSize.match(/\d.*/)[0]}]`
					: '';
			}
		}
	}
	return premadeTitle;
}

// Handles Generation of BBcode Template
function GenerateTemplate(APIVALUE) {
	var [imdbID, screenshots, youtubeLink, downloadLinks, mediaInfo] = [
		document.getElementById('hiddenIID').value
			? document.getElementById('hiddenIID').value
			: document.getElementById('searchID').value,
		document.getElementById('screensLinks').value,
		document.getElementById('ytLink').value,
		document.getElementById('ddl').value,
		document.getElementById('mediaInfo').value,
	];
	if (imdbID.includes('imdb')) {
		imdbID = imdbID.match(/tt\d+/)[0];
	}
	if (!imdbID | !downloadLinks | !mediaInfo) {
		let errors = '';
		errors += !imdbID
			? "<li>You Didn't Select A Title or Enter a IMDB ID!</li>"
			: '';
		errors += !downloadLinks
			? "<li>You Forgot Your Download Link! That's Pretty Important...!</li>"
			: '';
		errors += !mediaInfo
			? "<li>You Don't Have Any Mediainfo? It's Required!</li>"
			: '';
		Popup(errors);
		return;
	}
	let downloadLinksBBCode = DownloadLinkHandler(downloadLinks);
	var screen = screenshots ? ScreenshotHandler(screenshots.split(' ')) : '';
	var trailer = youtubeLink.match(/[a-z]/)
		? `\n[hr][/hr][indent][size=6][forumcolor][b]Trailer[/b][/forumcolor][/size][/indent]\n ${youtubeLink}`
		: '';
	GM_xmlhttpRequest({
		method: 'GET',
		url: `http://www.omdbapi.com/?apikey=${APIVALUE}&i=${imdbID}&plot=full&y&r=json`,
		onload: function (response) {
			try {
				var json = JSON.parse(response.responseText);
			} catch (e) {
				let errors =
					'<li>Something Messed Up! Check The OMDB Error Below.</li>';
				errors += `<li>${response.responseText}</li>`;
				Popup(errors);
				return;
			}
			let poster =
				json.Poster && json.Poster !== 'N/A'
					? `[center][img width='350px']${json.Poster.replace(
							/._V1_SX\d+.jpg/g,
							'._V1_SX1000.png'
					  )}[/img][/center]\n`
					: '';
			if (json.Title) {
				var title = json.Title && json.Title !== 'N/A' ? json.Title : '';
			} else {
				let errors =
					'<li>Something Messed Up! Check The OMDB Error Below.</li>';
				errors += `<li>${json.Error}</li>`;
				Popup(errors);
				return;
			}
			let year = json.Year && json.Year !== 'N/A' ? ` (${json.Year})` : '';
			let fullName = `[center][forumcolor][b][size=6][url='https://blackpearl.biz/search/1/?q=${imdbID}&o=date']${title}${year}[/url][/size][/b][/forumcolor][/center]`;
			imdbID =
				json.imdbID && json.imdbID !== 'N/A'
					? `[center][url=https://www.imdb.com/title/${json.imdbID}][img width='46px']https://i.imgur.com/KO5Twbs.png[/img][/url]`
					: '[center][img width="46px"]https://i.imgur.com/KO5Twbs.png[/img][/url]';
			let rating =
				json.imdbRating && json.imdbRating !== 'N/A'
					? `[size=6][b]${json.imdbRating}[/b]/10[/size][/center]\n`
					: '[/center]\n';
			let imdbvotes =
				json.imdbVotes && json.imdbVotes !== 'N/A'
					? `[center][img]https://i.imgur.com/sEpKj3O.png[/img][size=6]${json.imdbVotes}[/size][/center]\n`
					: '';
			let plot =
				json.Plot && json.Plot !== 'N/A'
					? `[hr][/hr][indent][size=6][forumcolor][b]Plot[/b][/forumcolor][/size][/indent]\n\n${json.Plot}`
					: '';
			let movieInfo = '';
			if (json.Rated && json.Rated !== 'N/A') {
				movieInfo += `[*][B]Rating: [/B] ${json.Rated}\n`;
			}
			if (json.Genre && json.Genre !== 'N/A') {
				movieInfo += `[*][B]Genre: [/B] ${json.Genre}\n`;
			}
			if (json.Director && json.Director !== 'N/A') {
				movieInfo += `[*][B]Directed By: [/B] ${json.Director}\n`;
			}
			if (json.Writer && json.Writer !== 'N/A') {
				movieInfo += `[*][B]Written By: [/B] ${json.Writer}\n`;
			}
			if (json.Actors && json.Actors !== 'N/A') {
				movieInfo += `[*][B]Starring: [/B] ${json.Actors}\n`;
			}
			if (json.Released && json.Released !== 'N/A') {
				movieInfo += `[*][B]Release Date: [/B] ${json.Released}\n`;
			}
			if (json.Awards && json.Awards !== 'N/A') {
				movieInfo += `[*][B]Awards: [/B] ${json.Awards}\n`;
			}
			if (json.Runtime && json.Runtime !== 'N/A') {
				movieInfo += `[*][B]Runtime: [/B] ${json.Runtime}\n`;
			}
			if (json.Production && json.Production !== 'N/A') {
				movieInfo += `[*][B]Production: [/B] ${json.Production}\n`;
			}
			movieInfo = movieInfo
				? `\n[hr][/hr][indent][size=6][forumcolor][b]Movie Info[/b][/forumcolor][/size][/indent]\n[LIST]${movieInfo}[/LIST]\n`
				: '';
			let titleBool =
				!document.getElementsByClassName('js-titleInput')[0].value;
			let premadeTitle = titleBool ? `${json.Title} (${json.Year})` : '';
			if (titleBool) {
				premadeTitle = ParseMediaInfo(mediaInfo, premadeTitle);
			}
			let tags = json.Genre && json.Genre !== 'N/A' ? json.Genre : '';
			if (mediaInfo.includes('Dolby Vision')) {
				tags += ', Dolby Vision';
				premadeTitle += titleBool ? ' Dolby Vision' : '';
			}
			if (mediaInfo.includes('HDR10+ Profile')) {
				tags += ', hdr10plus';
				premadeTitle += titleBool ? ' HDR10Plus' : '';
			} else if (mediaInfo.includes('HDR10 Compatible')) {
				tags += ', hdr10';
				premadeTitle += titleBool ? ' HDR10' : '';
			}
			tags = tags.replace(/^([, ]*)/g, '');
			mediaInfo =
				'[hr][/hr][indent][size=6][forumcolor][b]Media Info[/b][/forumcolor][/size][/indent]\n' +
				`[spoiler='Click here to view Media Info']\n${mediaInfo}\n[/spoiler]\n`;
			let forumBBcode = `${poster}${fullName}${imdbID} ${rating}${imdbvotes}${plot}${trailer}${screen}${movieInfo}${mediaInfo}${downloadLinksBBCode}`;
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
					document.getElementsByName('tags')[0].value = tags;
					tags = tags.split(', ');
					for (let tag of tags) {
						TagsPush(tag)
					}
				}
				if (titleBool) {
					document.getElementsByClassName('js-titleInput')[0].value =
						premadeTitle;
				}
			}
		},
	});
}

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
}                                        
`);
