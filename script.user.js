// ==UserScript==
// @name        Blackpearl Games
// @version     1.0.1
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/Games/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/Games/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(96|132)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// @connect     api.rawg.io
// ==/UserScript==

main();

const htmlTemplate = `
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button class="button--primary button button--icon" id="showTemplate" style="display:none" type="button">Show</button>
<div id="rawgGenerator">
<input type="text" id="hiddenIID" value="" style="display:none">
<div class="ui search" id="rawgSearch">
<input type="text" class="prompt input" id="searchID" placeholder="Game Title or Rawg.io Link"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'Game Title or Rawg.io Link'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="ytLink" value="" class="input" placeholder="Youtube Trailer Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Youtube Trailer Link'">
<input type="text" id="info" value="" class="input" placeholder="Crack / Repack Info" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Crack / Repack Info'">
<input type="text" id="vtLink" value="" class="input" placeholder="VirusTotal Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'VirusTotal Link'">
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
<button class="button--primary button button--icon" id="gmGenerate" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="gmClearBtn" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" type="button">Hide</button>
</div>
`;

const rawginput = `
<button id="gmShowTemplate" style="display:none" type="button">Show</button>
<div id="rawgGenerator">
<label>Enter Your RAWG API Key, Then Click On Save :)</label>
<input type="text" id="rawgKey" value="" class="input" placeholder="Rawg API Key">
<button class="button--primary button button--icon" id="gmSaveKey" type="button">Save Key</button>
<button class="button--primary button button--icon" id="gmClearBtn" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" type="button">Hide</button>
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

function main() {
	GM.getValue('APIKEY', 'foo').then((value) => {
		var APIVALUE = value;
		const htmlpush = document.getElementsByTagName('dd')[0];
		const titlechange = document.getElementById('title');
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : rawginput;
		if (titlechange) {
			document.getElementById('title').className += 'input';
		}
		sectionSearch(APIVALUE);
		$('#gmHideTemplate').click(() => hideTemplate());
		$('#showTemplate').click(() => showTemplate());
		$('#gmSaveKey').click(() => saveApiKey(APIVALUE, htmlpush));
		$('#gmGenerate').click(() => generateTemplate(APIVALUE));
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
		$('#rawgGenerator').hide();
		document.getElementById('showTemplate').style.display = 'block';
		document.getElementsByName('showDivider')[0].style.display = 'block';
	}
});

function showTemplate() {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementsByName('showDivider')[0].style.display = 'none';
	$('#rawgGenerator').show();
}

function hideTemplate() {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementsByName('showDivider')[0].style.display = 'block';
	$('#rawgGenerator').hide();
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	let body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
}

// Push Genre Tags to HTML
function tagsPush(tag) {
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

function sectionSearch(APIVALUE) {
	var query = `https://rawg.io/api/games?search={query}&key=${APIVALUE}`;
	$('#rawgSearch').search({
		apiSettings: {
			url: query,
			onResponse: function (myfunc) {
				var response = {
					results: [],
				};
				$.each(myfunc.results, function (index, item) {
					var maxResults = 10;
					if (index >= maxResults) {
						return false;
					}
					let releaseDate = item.released
						? ' (' + item.released.replace(/\-.*/, '') + ')'
						: '';
					var Name = item.name + releaseDate;
					response.results.push({
						title: Name,
						description: Name,
						rawgID: item.id,
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
			$('#hiddenIID').val(response.rawgID);
			$('#searchID').val(response.title);
		},
		minCharacters: 3,
	});
}

function saveApiKey(APIVALUE, htmlpush) {
	if (APIVALUE == 'foo') {
		let rawgKey = $('#rawgKey').val();
		if (rawgKey) {
			GM.setValue('APIKEY', rawgKey);
		} else {
			alert("You Didn't Enter Your Key!!");
		}
		document.getElementById('rawgGenerator').remove();
		document.getElementById('gmShowTemplate').remove();
		main();
	}
}

function httpGet(url) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', url, false);
	xmlHttp.send(null);
	return xmlHttp.response;
}

function generateTemplate(APIVALUE) {
	var IID = $('#hiddenIID').val();
	var uToob = $('#ytLink').val();
	var info = $('#info').val();
	var vtLink = $('#vtLink').val();
	var ddl = $('#ddl').val();
	var hidereactscore = $('#HideReactScore').val();
	var hideposts = $('#HidePosts').val();
	if (!IID) {
		IID = $('#searchID').val();
		if (IID.includes('rawg')) {
			IID = IID.match(/(?<=games\/).*(?<!\/)/)[0];
		}
	}
	if (!IID | !ddl | !vtLink) {
		var errors = '';
		errors += !IID
			? "<li>You Didn't Select A Title or Enter a Rawg.io Link!</li>"
			: '';
		errors += !vtLink
			? "<li>You Forgot Your VirusTotal Link! That's Pretty Important...!</li>"
			: '';
		errors += !ddl
			? "<li>You Forgot Your Download Link! That's Pretty Important...!</li>"
			: '';
		Popup(errors);
	} else {
		if (Downcloud.checked) {
			let ddlsplit = ddl.split(' ');
			ddl = '';
			for (let dls of ddlsplit) {
				ddl += `[DOWNCLOUD]${dls}[/DOWNCLOUD]\n`;
			}
		} else {
			ddl = ddl.replace(/\ /g, '\n');
		}
		ddl = '[HIDEREACT=1,2,3,4,5,6,7,8]\n' + ddl + '\n[/HIDEREACT]';
		if (hidereactscore !== '0') {
			ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hideposts !== '0') {
			ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]';
		}

		var screenshots_url = `https://api.rawg.io/api/games/${IID}/screenshots?key=${APIVALUE}`;
    	var screenshots = JSON.parse(httpGet(screenshots_url));
		if (screenshots.count !== 0) {
			var screen = `[indent][size=25px][forumcolor][b]Screenshots[/b][/forumcolor][/size][/indent]\n [Spoiler='Screenshots']\n`;
			for (let x in screenshots.results) {
				var img = screenshots.results[x].image;
				screen += `[img]${img}[/img]`
			}
			screen += `[/Spoiler][HR][/HR]\n`;
		} else {
			screen = '';
		}

		if (uToob.match(/[a-z]/)) {
			var trailer = `[indent][size=25px][forumcolor][b]Trailer[/b][/forumcolor][/size][/indent]\n\n${uToob}\n\n[HR][/HR]\n`;
		} else {
			trailer = '';
		}
		let vtLinksplit = vtLink.split(' ');
		vtLink = '';
		for (let vts of vtLinksplit) {
			vtLink += `[DOWNCLOUD]${vts}[/DOWNCLOUD]\n`;
		}

		if (info.match(/[a-z]/)) {
			info =
				`[indent][size=25px][forumcolor][b]Release Infos[/b][/forumcolor][/size][/indent]\n[spoiler='Click here to view Release Info']\n${info}\n[/spoiler]\n[HR][/HR]\n`;
		} else {
			info = '';
		}

		var stores_url = `https://api.rawg.io/api/games/${IID}/stores?key=${APIVALUE}`;
		var stores = JSON.parse(httpGet(stores_url));
		var steamReg = /(https?:\/\/)?store\.steampowered\.com\/app\/\d{1,7}/;
		var steamStoreLink = stores.results.find((e) => e.url.match(steamReg));
		if (steamStoreLink && steamStoreLink.length !== 0) {
			let steamID = steamStoreLink.url.match(/\d{1,7}/);
			var steam =
				'[media=steamstore]' + steamID + '[/media][/center]\n[HR][/HR]\n';
		} else {
			steam = '[/center]\n[HR][/HR]\n';
		}
		GM_xmlhttpRequest({
			method: 'GET',
			url: `https://api.rawg.io/api/games/${IID}?key=${APIVALUE}`,
			onload: function (response) {
				let json = JSON.parse(response.responseText);
				let backgroundimage =
					json.background_image && json.background_image !== ''
						? '[center][img width="548px"]' + json.background_image + '[/img]\n'
						: '';
				if (json.name && json.name !== '') {
					var title = '[forumcolor][b][size=25px]' + json.name;
				} else {
					errors =
						"You Messed Up! Check That You've Entered Something Into The IMDB Field!";
					Popup(errors);
				}
				let year =
					json.released && json.released !== ''
						? ' - (' +
						  json.released.substring(0, 4) +
						  ')[/size][/b][/forumcolor]\n'
						: '[/b][/size][/forumcolor][/center]\n[HR][/HR]\n';
				let description =
					'[indent][forumcolor][b][size=25px]Description' +
					'[/size][/b][/forumcolor][/indent]\n' +
					json.description_raw +
					'\n[HR][/HR]\n';
				let ratings =
					'[indent][forumcolor][b][size=25px]Ratings' +
					'[/size][/b][/forumcolor][/indent]\n[size=16px]\n[list]\n';
				if (json.ratings == '') {
					ratings +=
						'[*][img width="24px"]' +
						'https://i.ibb.co/nrdc7M8/noreviews.png[/img]' +
						'[color=rgb(126, 129, 129)]No reviews[/color]\n';
				} else {
					for (let x of json.ratings) {
						var img;
						var color;
						switch (x.title.toString()) {
							case 'exceptional':
								img = 'https://i.ibb.co/XZ0sVDf/exceptional.png';
								color = '(97, 189, 109)';
								break;
							case 'recommended':
								img = 'https://i.ibb.co/g3GKQ6B/recommended.png';
								color = '(82, 116, 216)';
								break;
							case 'meh':
								img = 'https://i.ibb.co/xG5772d/meh.png';
								color = '(248, 157, 59)';
								break;
							default:
								img = 'https://i.ibb.co/cQ65F2b/skip.png';
								color = '(251, 69, 83)';
						}
						ratings +=
							'[*][img width="24px"]' +
							img +
							'[/img][color=rgb' +
							color +
							']' +
							x.title.toString() +
							': ' +
							x.count.toString() +
							' (' +
							x.percent.toString() +
							'%)[/color]\n';
					}
				}
				ratings +=
					'[SIZE=12px]Source: https://rawg.io/games/' +
					IID +
					'[/SIZE][/LIST]\n[/size]\n[HR][/HR]\n';
				
				vtLink =
					'[indent][forumcolor][b][size=25px]VirusTotal' +
					'[/size][/b][/forumcolor][/indent]\n' +
					vtLink +
					'\n[HR][/HR]\n';

				ddl =
					'[center][size=25px][forumcolor][b]Download Link[/b][/forumcolor][/size]\n' +
					ddl +
					'\n[/center]';
				let dump = `${backgroundimage}${title} ${year} ${steam} ${description}${trailer}${screen}${ratings}${info}${vtLink}${ddl}`;
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
							json.name + ' - (' + json.released + ')';
					}
				}
			},
		});
	}
}

GM_addStyle(
	"                                                         \
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
      #textareaDivider {                                         \
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
      #textareaDivider {                                         \
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
}                                                                 \
"
);
