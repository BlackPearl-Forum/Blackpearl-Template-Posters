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

main();

const htmlTemplate = `
<button id="gmShowTemplate" name="templateButton" style="display:none" type="button">Show</button>
<div id="discogGenerator">
<input type="text" id="masterUrl" value="" style="display:none">
<div class="ui search" id="Discog_search">
<input type="text" class="prompt input" id="searchID" placeholder="Artist + Album name"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'Artist + Album name'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="qImgs" value="" class="input" placeholder="Quality Image Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Quality Image Link'">
<textarea rows="1" style="width:100%;" class="input" id="qText" placeholder="Quality Text" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Quality Text'"></textarea>
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<div id="textarea_divider">&nbsp;</div>
<span>DownCloud</span>
<label class="switch">
<input type="checkbox" id="Downcloud" value="Downcloud" checked></input>
<span class="slider round"></span></label>
HideReactScore
<input type="number" id="HideReactScore" min="0" max="100" value="0">
HidePosts
<input type="number" id="HidePosts" min="0" max="50" value="0"> <br>
<div id="textarea_divider">&nbsp;</div>
<button class="button--primary button button--icon" id="gmGenerate" name="templateButton" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
</div>
`;

const dginput = `
<button id="gmShowTemplate" name="templateButton" style="display:none" type="button">Show</button>
<div id="discogGenerator">
<label>Enter Your Discog API Key, Then Click On Save :)</label>
<input type="text" id="dgKey" value="" class="input" placeholder="discorg API Key" onfocus="this.placeholder = ''" onblur="this.placeholder = 'discorg API Key'">
<button class="button--primary button button--icon" id="gmSaveKey" name="templateButton" type="button">Save Key</button>
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
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

function main() {
	GM.getValue('DiscogKey', 'foo').then((value) => {
		const APIVALUE = value;
		if (APIVALUE !== 'foo') {
			var temphtml = document.getElementsByTagName('dd')[0];
			temphtml.innerHTML += htmlTemplate;
		} else {
			temphtml = document.getElementsByTagName('dd')[0];
			temphtml.innerHTML += dginput;
		}
		let lossless = window.location.href.match(/\d+/, '').includes('88');
		$('#gmHideTemplate').click(() => hideTemplate());
		$('#gmShowTemplate').click(() => showTemplate());
		$('#gmSaveKey').click(() => saveApiKey(APIVALUE));
		searchDiscog(APIVALUE);
		$('#gmGenerate').click(() => generateTemplate(APIVALUE, lossless));
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

$(document).on('keydown', function (event) {
	if (event.key == 'Escape') {
		$('#discogGenerator').hide();
		document.getElementById('gmShowTemplate').style.display = 'block';
	}
});

function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#discogGenerator').hide();
}

function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#discogGenerator').show();
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
}

function saveApiKey(APIVALUE) {
	if (APIVALUE == 'foo') {
		let dgKey = $('#dgKey').val();
		if (dgKey) {
			GM.setValue('DiscogKey', dgKey);
		} else {
			alert("You Didn't Enter Your Key!!");
		}
		document.getElementById('discogGenerator').remove();
		document.getElementById('gmShowTemplate').remove();
		main();
	}
}

function searchDiscog(APIVALUE) {
	$('#Discog_search').search({
		type: 'category',
		apiSettings: {
			url: `https://api.discogs.com/database/search?q={query}&token=${APIVALUE}`,
			onResponse: function (myfunc) {
				var response = {
					results: {},
				};
				$.each(myfunc.results, function (index, item) {
					var category = item.type || 'Unknown',
						maxResults = 50;
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
				delete response.results['release'];
				delete response.results['label'];
				delete response.results['artist'];
				return response;
			},
		},
		fields: {
			results: 'results',
			title: 'name',
		},
		onSelect: function (response) {
			$('#masterUrl').val(response.master_url);
		},
		minCharacters: 3,
	});
}

function generateTemplate(APIVALUE, lossless) {
	let ddl = $('#ddl').val();
	let qImgs = $('#qImgs').val();
	let qText = $('#qText').val();
	let hideReactScore = $('#HideReactScore').val();
	let hidePosts = $('#HidePosts').val();
	let masterUrl = $('#masterUrl').val();
	if (!masterUrl | !ddl | (lossless & !qImgs & !qText)) {
		var errors = '';
		errors += !masterUrl
			? "<li>You Didn't Select A Result or Enter a URL!</li>"
			: '';
		errors += !ddl
			? "<li>Uh Oh! You Forgot Your Download Link! That's Pretty Important...</li>"
			: '';
		if (lossless) {
			errors +=
				!qImgs && !qText ? '<li>You Didnt Add A Quality / Log Proof</li>' : '';
		}
		if (errors) {
			Popup(errors);
		}
	} else {
		if (Downcloud.checked) {
			ddl = '[DOWNCLOUD]' + ddl + '[/DOWNCLOUD]';
		}
		ddl = '[HIDEREACT=1,2,3,4,5,6]' + ddl + '[/HIDEREACT]';
		if (hideReactScore !== '0') {
			ddl = `[HIDEREACTSCORE=${hideReactScore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hidePosts !== '0') {
			ddl = `[HIDEPOSTS=${hidePosts}]` + ddl + '[/HIDEPOSTS]';
		}
		var xhReq = new XMLHttpRequest();
		xhReq.open('GET', `${masterUrl}?token=${APIVALUE}`, false);
		xhReq.send(null);
		var albumjson = JSON.parse(xhReq.responseText);
		var artist_url = albumjson.artists[0].resource_url;
		GM_xmlhttpRequest({
			method: 'GET',
			url: `${artist_url}?token=${APIVALUE}`,
			onload: function (response) {
				var artistjson = JSON.parse(response.responseText);
				let masterUri = albumjson.uri;
				let artistUri = artistjson.uri.replace('http:', 'https:');
				let Cover =
					'[CENTER][IMG width="250px"]' + albumjson.images[0].uri + '[/IMG]\n';
				let artistName = albumjson.artists[0].name.replace(/\(\d*\)/g, '');
				let artist =
					`[FORUMCOLOR][B][SIZE=6][URL=${artistUri}]` + artistName + '[/URL]\n';
				let album =
					`[URL=${masterUri}]` +
					albumjson.title +
					'[/URL][/SIZE][/B][/FORUMCOLOR]\n';
				let albumYear = albumjson.year;
				let tracklist = albumjson.tracklist;
				let tracknum = tracklist.length + ' Tracks\n';
				let tracks =
					'[INDENT][SIZE=6][FORUMCOLOR][B]Album Details[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[SPOILER="Track List"]\n[TABLE=collapse]\n[TR]\n[TH]No.[/TH]\n[TH]Track Name[/TH]\n[TH]Track Duration[/TH]\n[/TR]\n';
				for (let t of tracklist) {
					tracks +=
						'[TR][TD]' + t.position + '[/TD]\n[TD]' + t.title + '[/TD]\n[TD]';
					if (t.duration) {
						tracks += t.duration + '[/TD][/TR]\n';
					} else {
						tracks += '[/TR]\n';
					}
				}
				tracks += '[/TABLE]\n[/SPOILER]\n';
				let styles = albumjson.styles ? '[SIZE=6]' + albumjson.styles[0] : '';
				let genres = albumjson.genres
					? albumjson.genres[0] + '[/SIZE][/CENTER]\n'
					: '';
				let artistinfo = artistjson.profile
					? '[SPOILER="About Artist"]\n' +
					  artistjson.profile.replace(/\[.=/gm, '').replace(/\]/gm, '') +
					  '\n[/SPOILER]'
					: '';
				if (artistjson.members) {
					let memberlist = artistjson.members;
					var members =
						'[INDENT][SIZE=6][FORUMCOLOR][B]Artist Details[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[SPOILER="Member List"]\n';
					if (memberlist.length >= 1) {
						members += '[tabs]';
						for (let ml of memberlist) {
							members +=
								'[slide=' +
								ml.name +
								']\n[IMG width="150px"]' +
								ml.thumbnail_url +
								'[/IMG][/slide]\n';
						}
					}
					members += '[/tabs]\n[/SPOILER]\n';
				} else {
					members =
						'[INDENT][SIZE=6][FORUMCOLOR][B]Artist Details[/B][/FORUMCOLOR][/SIZE][/INDENT]\n';
				}
				if (artistjson.urls) {
					let artistslinks = artistjson.urls;
					var artlink = '[SPOILER="Artist Links"]\n';
					for (let artistlink of artistslinks) {
						artlink += artistlink.replace('http:', 'https:') + '\n';
					}
					artlink += '\n[/SPOILER]\n[hr][/hr]\n';
				}
				ddl =
					'[hr][/hr][center][size=6][FORUMCOLOR][b]Download Link[/b][/FORUMCOLOR][/size]\n' +
					ddl +
					'\n[/center]';
				if (qImgs) {
					let q = qImgs.split(' ');
					var qImg = '';
					for (let qi of q) {
						qImg += `[img width="300"]${qi}[/img]`;
					}
				} else {
					qImg = '';
				}
				qImg = qImg ? qImg + '\n' : '';
				qText = qText
					? '[SPOILER="Quality Proof"]' + qText + '[/Spoiler]\n'
					: '';
				let quality =
					qImg || qText
						? '[hr][/hr][center][size=6][FORUMCOLOR][b]Quality Proof[/b][/FORUMCOLOR][/size]\n' +
						  qImg +
						  qText
						: '';
				let dump = `${Cover}${artist}${album}${tracknum}${styles} ${genres}${members}${artistinfo}${artlink}${tracks}${quality}${ddl}`;
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					alert(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					if (!document.getElementsByClassName('js-titleInput')[0].value) {
						document.getElementsByClassName('js-titleInput')[0].value =
							artistName + ' - ' + albumjson.title + ' (' + albumYear + ')';
					}
				}
			},
		});
	}
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
      #textarea_divider {                                         \
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
      #textarea_divider {                                         \
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
