// ==UserScript==
// @name        Blackpearl IMDB
// @version     3.0.5
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/Omdb/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/Omdb/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(129|172|173|174|175|176|178|179|180|181|182|183|184|187|188|189|190|193|194|197|198|199|200|203|204|206|207|208|210|223)\/post-thread/
// @require     https://code.jquery.com/jquery-3.5.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==

main();

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
<button class="button--primary button button--icon" id="gmGenerate" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="gmClearBtn" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" type="button">Hide</button>
</div>
`;

const omdbinput = `
<button id="gmShowTemplate" style="display:none" type="button">Show</button>
<div id="OmdbGenerator">
<label>Enter Your OMDB API Key, Then Click On Save :)</label>
<input type="text" id="omdbKey" value="" class="input" placeholder="Omdb API Key">
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
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : omdbinput;
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
		$('#OmdbGenerator').hide();
		document.getElementById('showTemplate').style.display = 'block';
		document.getElementsByName('showDivider')[0].style.display = 'block';
	}
});

function showTemplate() {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementsByName('showDivider')[0].style.display = 'none';
	$('#OmdbGenerator').show();
}

function hideTemplate() {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementsByName('showDivider')[0].style.display = 'block';
	$('#OmdbGenerator').hide();
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
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
	const tab_url = window.location.href;
	var section = tab_url.match(/\d+/, '');
	section = parseInt(section);
	const [Movies, Series] = [
		[129, 172, 173, 174, 175, 176, 178, 179, 180, 181, 182, 183, 184, 202, 204],
		[187, 188, 189, 190, 193, 194, 197, 198, 199, 200, 203, 206, 208, 209, 223],
	];
	var query;
	if (Series.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=series`;
	} else if (Movies.includes(section)) {
		query = `https://www.omdbapi.com/?apikey=${APIVALUE}&r=JSON&s={query}&type=movie`;
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
					var category = item.Type.toUpperCase() || 'Unknown',
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
			$('#hiddenIID').val(response.imdbID);
			$('#searchID').val(response.title);
		},
		minCharacters: 3,
	});
}

function saveApiKey(APIVALUE, htmlpush) {
	if (APIVALUE == 'foo') {
		let omdbKey = $('#omdbKey').val();
		if (omdbKey) {
			GM.setValue('APIKEY', omdbKey);
		} else {
			alert("You Didn't Enter Your Key!!");
		}
		document.getElementById('OmdbGenerator').remove();
		document.getElementById('gmShowTemplate').remove();
		main();
	}
}

function generateTemplate(APIVALUE) {
	var IID = $('#hiddenIID').val();
	var screenshots = $('#screensLinks').val();
	var uToob = $('#ytLink').val();
	var ddl = $('#ddl').val();
	var MEDIAINFO = $('#mediaInfo').val();
	var hidereactscore = $('#HideReactScore').val();
	var hideposts = $('#HidePosts').val();
	if (!IID) {
		IID = $('#searchID').val();
		if (IID.includes('imdb')) {
			IID = IID.match(/tt\d+/)[0];
		}
	}
	if (!IID | !ddl | !MEDIAINFO) {
		var errors = '';
		errors += !IID
			? "<li>You Didn't Select A Title or Enter a IMDB ID!</li>"
			: '';
		errors += !ddl
			? "<li>You Forgot Your Download Link! That's Pretty Important...!</li>"
			: '';
		errors += !MEDIAINFO
			? "<li>You Don't Have Any Mediainfo? It's Required!</li>"
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
		ddl = '[HIDEREACT=1,2,3,4,5,6]\n' + ddl + '\n[/HIDEREACT]';
		if (hidereactscore !== '0') {
			ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hideposts !== '0') {
			ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]';
		}
		if (screenshots) {
			screenshots = screenshots.split(' ');
			var screen = `\n[hr][/hr][indent][size=6][forumcolor][b]Screenshots[/b][/forumcolor][/size][/indent]\n [Spoiler='screenshots']\n`;
			for (let ss of screenshots) {
				screen += `[img]${ss}[/img]`;
			}
			screen += `[/Spoiler] \n`;
		} else {
			screen = '';
		}
		if (uToob.match(/[a-z]/)) {
			var trailer = `\n[hr][/hr][indent][size=6][forumcolor][b]Trailer[/b][/forumcolor][/size][/indent]\n ${uToob}`;
		} else {
			trailer = '';
		}
		GM_xmlhttpRequest({
			method: 'GET',
			url: `http://www.omdbapi.com/?apikey=${APIVALUE}&i=${IID}&plot=full&y&r=json`,
			onload: function (response) {
				let json = JSON.parse(response.responseText);
				let poster =
					json.Poster && json.Poster !== 'N/A'
						? '[center][img]' + json.Poster + '[/img]\n'
						: '';
				if (json.Title && json.Title !== 'N/A') {
					var title = '[forumcolor][b][size=6]' + json.Title;
				} else {
					errors =
						"You Messed Up! Check That You've Entered Something Into The IMDB Field!";
					Popup(errors);
				}
				let year =
					json.Year && json.Year !== 'N/A'
						? json.Year + ')[/size][/b][/forumcolor]\n'
						: '';
				let imdbId =
					json.imdbID && json.imdbID !== 'N/A'
						? '[url=https://www.imdb.com/title/' +
						  json.imdbID +
						  '][img]https://i.imgur.com/rcSipDw.png[/img][/url]'
						: '';
				let rating =
					json.imdbRating && json.imdbRating !== 'N/A'
						? '[size=6][b]' + json.imdbRating + '[/b]/10[/size]\n'
						: '';
				let imdbvotes =
					json.imdbVotes && json.imdbVotes !== 'N/A'
						? '[size=6][img]https://i.imgur.com/sEpKj3O.png[/img]' +
						  json.imdbVotes +
						  '[/size][/center]\n'
						: '';
				let plot =
					json.Plot && json.Plot !== 'N/A'
						? '[hr][/hr][indent][size=6][forumcolor][b]Plot[/b][/forumcolor][/size][/indent]\n\n ' +
						  json.Plot
						: '';
				let rated =
					json.Rated && json.Rated !== 'N/A'
						? '[B]Rating: [/B]' + json.Rated + '\n'
						: '';
				let genre =
					json.Genre && json.Genre !== 'N/A'
						? '[*][B]Genre: [/B] ' + json.Genre + '\n'
						: '';
				let director =
					json.Director && json.Director !== 'N/A'
						? '[*][B]Directed By: [/B] ' + json.Director + '\n'
						: '';
				let writer =
					json.Writer && json.Writer !== 'N/A'
						? '[*][B]Written By: [/B] ' + json.Writer + '\n'
						: '';
				let actors =
					json.Actors && json.Actors !== 'N/A'
						? '[*][B]Starring: [/B] ' + json.Actors + '\n'
						: '';
				let released =
					json.Released && json.Released !== 'N/A'
						? '[*][B]Release Date: [/B] ' + json.Released + '\n'
						: '';
				let runtime =
					json.Runtime && json.Runtime !== 'N/A'
						? '[*][B]Runtime: [/B] ' + json.Runtime + '\n'
						: '';
				let production =
					json.Production && json.Production !== 'N/A'
						? '[*][B]Production: [/B] ' + json.Production + '\n'
						: '';
				let tags = json.Genre && json.Genre !== 'N/A' ? json.Genre : '';
				MEDIAINFO =
					"[hr][/hr][indent][size=6][forumcolor][b]Media Info[/b][/forumcolor][/size][/indent]\n [spoiler='Click here to view Media Info']\n " +
					MEDIAINFO +
					'\n[/spoiler]\n';
				ddl =
					'[hr][/hr][center][size=6][forumcolor][b]Download Link[/b][/forumcolor][/size]\n' +
					ddl +
					'\n[/center]';
				let dump = `${poster}${title} (${year}${imdbId} ${rating}${imdbvotes}${plot}${trailer}${screen}
[hr][/hr][indent][size=6][forumcolor][b]Movie Info[/b][/forumcolor][/size][/indent]
[LIST][*]${rated}${genre}${director}${writer}${actors}${released}${runtime}${production}[/LIST]\n${MEDIAINFO}${ddl}`;
				try {
					document.getElementsByName('message')[0].value = dump;
					if (tags) {
						document.getElementsByName('tags')[0].value = tags;
						tags = tags.replace(/\,/g, '');
						tags = tags.split(' ');
						for (let i = 0; i < tags.length; i++) {
							tagsPush(tags[i]);
						}
					}
				} catch (err) {
					alert(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					let xf_title_value = document.querySelector('#title').value;
					if (!xf_title_value) {
						document.getElementById('title').value =
							json.Title + ' (' + json.Year + ')';
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
