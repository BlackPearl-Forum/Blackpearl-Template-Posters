// ==UserScript==
// @name        Blackpearl Discog Poster
// @version     1.0.0
// @description Template Maker
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
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// @connect     api.discogs.com
// ==/UserScript==

Main();

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

function Main() {
	GM.getValue('DiscogKey', 'foo').then((value) => {
		const APIVALUE = value;
		const htmlpush = document.getElementsByTagName('dd')[0];
		let lossless = window.location.href.match(/\d+/, '').includes('88');
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : dginput;
		SearchDiscog(APIVALUE);
		document.getElementById('hideTemplate').addEventListener(
			'click',
			function () {
				HideTemplate();
			},
			false
		);
		document.getElementById('showTemplate').addEventListener(
			'click',
			function () {
				ShowTemplate();
			},
			false
		);
		if (APIVALUE !== 'foo') {
			document.getElementById('generateTemplate').addEventListener(
				'click',
				function () {
					GenerateTemplate(APIVALUE, lossless);
				},
				false
			);
		} else {
			document.getElementById('saveKey').addEventListener(
				'click',
				function () {
					SaveApiKey(APIVALUE);
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
	document.getElementById('discogGenerator').style.display = 'none';
}

function HideTemplate() {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementById('discogGenerator').style.display = 'block';
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

function RemoveAllChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

function SearchDiscog(APIVALUE) {
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
}

function SaveApiKey(APIVALUE) {
	if (APIVALUE == 'foo') {
		let discogKey = document.getElementById('dgKey').value;
		if (discogKey) {
			GM.setValue('DiscogKey', discogKey);
		} else {
			alert("You Didn't Enter Your Key!");
		}
		document.getElementById('discogGenerator').remove();
		document.getElementById('showTemplate').remove();
		Main();
	}
}

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
	downloadLinks = `[hidereact=1,2,3,4,5,6]${downloadLinks.replace(
		/\n+$/,
		''
	)}[/hidereact]`; // Remove extra newline at end of string
	if (hideReactScore !== '0') {
		downloadLinks = `[hidereactscore=${hideReactScore}]${downloadLinks}[/hidereactscore]`;
	}
	if (hidePosts !== '0') {
		downloadLinks = `[hideposts=${hidePosts}]${downloadLinks}[/hideposts]`;
	}
	downloadLinks = `[hr][/hr][center][size=6][forumcolor][b]Download Link[/b][/forumcolor][/size]\n${downloadLinks}\n[/center]`;
	return downloadLinks;
}

async function AlbumHandler(albumLink) {
	let response = await new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: albumLink,
			onload: (response) => {
				resolve(response);
			},
			onerror: (response) => {
				reject(response);
			},
		});
	});
	//TODO: Fix up this error handling, currently displays BP Error page
	try {
		var albumjson = JSON.parse(response.responseText);
	} catch (e) {
		console.log(response);
		let errors = '<li>Something Messed Up! Check The Discog Error Below.</li>';
		errors += `<li>Error Reporting Currently Unavaliable</li>`;
		Popup(errors);
		return;
	}
	let Cover = albumjson.images
		? `[center][img width="250px"]${albumjson.images[0].uri}[/img][/center]\n`
		: '';
	let artistName = albumjson.artists[0].name.replace(/\(\d*\)/g, '');
	let album =
		albumjson.uri && albumjson.title
			? `[center][forumcolor][b][size=6][url=${albumjson.uri}]${albumjson.title}[/url][/size][/b][/forumcolor][/center]\n`
			: '';
	let tracknum = `[center][size=6]${albumjson.tracklist.length} Tracks[/size][/center]\n`;
	let styles = '';
	if (albumjson.styles) {
		styles = '[*][b][forumcolor]Style(s): [/b][/forumcolor] | ';
		for (let i = 0; i < albumjson.styles.length; i++) {
			styles += `[url=https://www.discogs.com/style/${albumjson.styles[
				i
			].replace(' ', '+')}]${albumjson.styles[i]}[/url] | `;
		}
	}
	let genres = '';
	if (albumjson.genres) {
		genres = '\n[*][forumcolor][b]Genre(s): [/b][/forumcolor] | ';
		for (let i = 0; i < albumjson.genres.length; i++) {
			genres += `[url=https://www.discogs.com/genre/${albumjson.genres[
				i
			].replace(' ', '+')}]${albumjson.genres[i]}[/url] | `;
		}
	}
	let year = '';
	if (albumjson.year) {
		year = `\n[*][forumcolor][b]Release Year: [/b][/forumcolor]${albumjson.year}`;
	}
	let videos = '';
	if (albumjson.videos) {
		videos = '[spoiler="Video(s)"]\n';
		for (let i = 0; i < albumjson.videos.length; i++) {
			videos += albumjson.videos[i].uri + '\n';
		}
		videos += '[/spoiler]\n';
	}

	let albumDetails = `[INDENT][size=6][forumcolor][B]Album Details[/B][/forumcolor][/size][/INDENT]\n[list]\n${styles}${genres}${year}\n[/list]\n`;
	//? Add more details? ^^^^
	let tracks = '';
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
	var tags = albumjson.genres.concat(albumjson.styles); //? Find example of "blank" genres or styles, possible error checking needed
	let forumTitle = `${artistName} - ${albumjson.title} (${albumjson.year})`;
	return {
		cover: Cover,
		artistName: artistName,
		artistURL: albumjson.artists[0].resource_url,
		album: album,
		tracknum: tracknum,
		styles: styles,
		genres: genres,
		year: year,
		videos: videos,
		albumDetails: albumDetails,
		tracks: tracks,
		tags: tags,
		forumTitle: forumTitle,
	};
}

async function ArtistHandler(artistURL, artistName) {
	let response = await new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: 'GET',
			url: artistURL,
			onload: (response) => {
				resolve(response);
			},
			onerror: (response) => {
				reject(response);
			},
		});
	});
	//TODO: Fix up this error handling, currently displays BP Error page
	try {
		var artistjson = JSON.parse(response.responseText);
	} catch (e) {
		let errors = '<li>Something Messed Up! Check The Discog Error Below.</li>';
		errors += `<li>Error Reporting Currently Unavaliable</li>`;
		Popup(errors);
		return;
	}
	let artistUri = artistjson.uri.replace('http:', 'https:');
	let artist =
		artistName && artistUri
			? `[center][forumcolor][b][size=6][url=${artistUri}]${artistName}[/url][/size][/b][/forumcolor][/center]\n`
			: '';
	let artistinfo = artistjson.profile
		? `[spoiler="About Artist"]\n${artistjson.profile
				.replace(/\[.=/gm, '')
				.replace(/\[.*?\]/gm, '')}\n[/spoiler]`
		: '';
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
	let artistLinks = '';
	if (artistjson.urls) {
		artistLinks = '[spoiler="Artist Links"]\n';
		for (let link of artistjson.urls) {
			artistLinks += link.replace('http:', 'https:') + '\n';
		}
		artistLinks += '\n[/spoiler]\n[hr][/hr]\n';
	}
	return {
		artistUri: artistUri,
		artist: artist,
		artistinfo: artistinfo,
		members: members,
		artistLinks: artistLinks,
	};
}

function SubmitToForum(albumDict, artistDict, quality, downloadLinks) {
	let forumBBcode = `${albumDict.cover}${artistDict.artist}${albumDict.album}${albumDict.tracknum}${artistDict.members}${artistDict.artistinfo}${artistDict.artistLinks}${albumDict.albumDetails}${albumDict.tracks}${albumDict.videos}${quality}${downloadLinks}`;
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
		//TODO: Add all Genre's and Styles from Discog to BP Tag System
		if (albumDict.tags) {
			document.getElementsByName('tags')[0].value = albumDict.tags.toString();
			for (let i = 0; i < albumDict.tags.length; i++) {
				TagsPush(albumDict.tags[i]);
			}
		}
		if (!document.getElementsByClassName('js-titleInput')[0].value) {
			document.getElementsByClassName('js-titleInput')[0].value =
				albumDict.forumTitle;
		}
	}
}

async function GenerateTemplate(APIVALUE, lossless) {
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
	let albumDict = AlbumHandler(`${masterUrl}?token=${APIVALUE}`);
	downloadLinks = DownloadLinkHandler(downloadLinks);
	let qualityImage = '';
	if (qualityImages) {
		for (let qi of qualityImages.split(' ')) {
			qualityImage += `[img width="300"]${qi}[/img]`;
		}
		qualityImage += '\n';
	}
	qualityText = qualityText
		? `[spoiler="Quality Proof"]${qualityText}[/Spoiler]\n`
		: '';
	let quality =
		qualityImage || qualityText
			? `[hr][/hr][center][size=6][forumcolor][b]Quality Proof[/b][/forumcolor][/size]\n${qualityImage}${qualityText}`
			: '';
	var artistDict;
	albumDict.then(function (albumDict) {
		artistDict = albumDict.artistURL ? ArtistHandler(`${albumDict.artistURL}?token=${APIVALUE}`, albumDict.artistName) : '';
		if (artistDict) {
			artistDict.then(function (artistDict) {
				SubmitToForum(albumDict, artistDict, quality, downloadLinks);
			});
		} else {
			artistDict = {
				artistUri: '',
				artist: `[center][forumcolor][b][size=6]Various Artists[/size][/b][/forumcolor][/center]\n`,
				artistinfo: '',
				members: '',
				artistLinks: '',
				};
			SubmitToForum(albumDict, artistDict, quality, downloadLinks);
		}
	});
}

//--- CSS styles make it work...
GM_addStyle(
	"                                                             \
    @media screen and (min-width: 300px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  8px;                          \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
            max-width:              35px;                         \
      }                                                           \
      #textareaDivider {                                          \
            margin-top:             -11px;                        \
      }                                                           \
      /* Start Rounded sliders Checkboxes */                      \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
      .content {                                                  \
            cursor:                 pointer;                      \
  }                                                               \
}                                                                 \
    @media screen and (min-width: 768px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  15px;                         \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
            max-width:              35px;                         \
      }                                                           \
      #textareaDivider {                                          \
            margin-top:             -11px;                        \
      }                                                           \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      /* Rounded sliders */                                       \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
      .content {                                                  \
            cursor:                 pointer;                      \
  }                                                               \
}                                                                 \
"
);
