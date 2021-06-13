// ==UserScript==
// @name        Blackpearl IMDB
// @version     3.0.11
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/issues/
// @updateURL   https://raw.githubusercontent.com/BlackPearl-Forum/Blackpearl-Template-Posters/Omdb/script.user.js
// @downloadURL https://raw.githubusercontent.com/BlackPearl-Forum/Blackpearl-Template-Posters/Omdb/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(129|172|173|174|175|176|178|179|180|181|183|184|187|188|189|190|193|194|197|198|199|200|203|204|206|207|208|210|223)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js#sha512=894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.min.js#sha512=4DaiBX8rsgOoBSNLceQ/IixDF+uUDV0hJrQX/MJ9RwJZCDqbEp0EjIQodGxszPtTpwlenJznR2jkgDWqj4Hs+A==
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.min.js#sha512=cYY5gAyJxIK4sLwDYueWWJH9rEdgBNvRaEIGJ6+dQ5vzfoTqHAtUDYrG2rdZTGqACvPS9QRrnzqqRGfrgxO7ug==
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.min.js#sha512=Xx3WEY47isjKM7q4XwPXnJ/YGuMbA4Iua+rO3+/cU8/p69YqJNb1NORkJtbQWJyE9ek1i6jrxn/e6RpB6GXf7w==
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// @connect     omdbapi.com
// ==/UserScript==
/* eslint-disable */

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
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button id="showTemplate" style="display:none" class="button--primary button button--icon" type="button">Show</button>
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
		htmlpush.innerHTML += APIVALUE !== 'foo' ? htmlTemplate : omdbinput;
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
		[129, 172, 173, 174, 175, 176, 178, 179, 180, 181, 183, 184, 202, 204],
		[187, 188, 189, 190, 193, 194, 197, 198, 199, 200, 203, 206, 208, 209, 223],
	];
	var query;
	if (Series.includes(section)) {
		query = `https://www.omdbapi.com/?s={query}&type=series&apikey=${APIVALUE}&r=JSON`;
	} else if (Movies.includes(section)) {
		query = `https://www.omdbapi.com/?s={query}&type=movie&apikey=${APIVALUE}&r=JSON`;
	} else {
		query = `https://www.omdbapi.com/?s={query}&apikey=${APIVALUE}&r=JSON`;
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
					var category = item.Type.replace("movie", "Movies").replace("series",  "TV Shows") || 'Unknown',
						maxResults = 10;
					if (index >= maxResults) {
						return false;
					}
					if (response.results[category] === undefined) {
						response.results[category] = {
							name: category.bold(),
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
		document.getElementById('showTemplate').remove();
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
		ddl = '[HIDEREACT=1,2,3,4,5,6,7,8]\n' + ddl + '[/HIDEREACT]';
		if (hidereactscore !== '0') {
			ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hideposts !== '0') {
			ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]';
		}
		if (screenshots) {
			screenshots = screenshots.split(' ');
			var screen = `[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]Media Screenshots :[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[SPOILER='Media Screenshots']\n[CENTER]`;
			for (let ss of screenshots) {
				screen += `[IMG]${ss}[/IMG]`;
			}
			screen += `[/CENTER][/SPOILER]\n`;
		} else {
			screen = '';
		}
		if (uToob.match(/[a-z]/)) {
			var trailer = `[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]Official Trailer :[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[CENTER]${uToob}\n[/CENTER]`;
		} else {
			trailer = '';
		}
		GM_xmlhttpRequest({
			method: 'GET',
			url: `http://www.omdbapi.com/?apikey=${APIVALUE}&i=${IID}&plot=full&r=json`,
			onload: function (response) {
				let json = JSON.parse(response.responseText);
				let poster =
					json.Poster && json.Poster !== 'N/A'
						? "[CENTER][IMG WIDTH='350px']" + json.Poster.replace(/._V1_SX\d+.jpg/g, '._V1_SX1000.png') + '[/IMG][/CENTER]\n'
						: '';
				if (json.Title && json.Title !== 'N/A') {
					var title = `[CENTER][FORUMCOLOR][B][SIZE=6][URL='https://blackpearl.biz/search/1/?q=${json.imdbID}&o=date']${json.Title}`;
				} else {
					errors =
						"You Messed Up! Check That You've Entered Something Into The IMDB Field!";
					Popup(errors);
				}
				let year =
					json.Year && json.Year !== 'N/A'
						? `(${json.Year.replace(/([–]*)$/g, '')})`
						: '';
				let imdbId =
					json.imdbID && json.imdbID !== 'N/A'
						? '[URL=https://www.imdb.com/title/' +
						  json.imdbID +
						  "][IMG WIDTH='46px']https://ia.media-imdb.com/images/M/MV5BMTk3ODA4Mjc0NF5BMl5BcG5nXkFtZTgwNDc1MzQ2OTE@.png[/IMG][/URL]"
						: '';
				let rating =
					json.imdbRating && json.imdbRating !== 'N/A'
						? '[SIZE=6] ' + json.imdbRating + '/10[/SIZE]\n'
						: '';
				let imdbvotes =
					json.imdbVotes && json.imdbVotes !== 'N/A'
						? '[IMG]https://i.imgur.com/sEpKj3O.png[/IMG][SIZE=6]' +
						  json.imdbVotes +
						  '[/SIZE]'
						: '';
				let plot =
					json.Plot && json.Plot !== 'N/A'
						? '[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]Plot Summary :[/B][/FORUMCOLOR][/SIZE]\n\n[JUSTIFY]' +
						  json.Plot + '[/JUSTIFY][/INDENT]'
						: '';
				let rated =
					json.Rated && json.Rated !== 'N/A'
						? '[*][FORUMCOLOR][B]Rating: [/B][/FORUMCOLOR]' + json.Rated + '\n'
						: '';
				let genre =
					json.Genre && json.Genre !== 'N/A'
						? '[*][FORUMCOLOR][B]Genre: [/B][/FORUMCOLOR]' + json.Genre + '\n'
						: '';
				let director =
					json.Director && json.Director !== 'N/A'
						? '[*][FORUMCOLOR][B]Directed By: [/B][/FORUMCOLOR]' + json.Director + '\n'
						: '';
				let writer =
					json.Writer && json.Writer !== 'N/A'
						? '[*][FORUMCOLOR][B]Written By: [/B][/FORUMCOLOR]' + json.Writer + '\n'
						: '';
				let actors =
					json.Actors && json.Actors !== 'N/A'
						? '[*][FORUMCOLOR][B]Starring: [/B][/FORUMCOLOR]' + json.Actors + '\n'
						: '';
				let released =
					json.Released && json.Released !== 'N/A'
						? '[*][FORUMCOLOR][B]Release Date: [/B][/FORUMCOLOR]' + json.Released + '\n'
						: '';
				let runtime =
					json.Runtime && json.Runtime !== 'N/A'
						? '[*][FORUMCOLOR][B]Runtime: [/B][/FORUMCOLOR]' + json.Runtime + '\n'
						: '';
				let production =
					json.Production && json.Production !== 'N/A'
						? '[*][FORUMCOLOR][B]Production: [/B][/FORUMCOLOR]' + json.Production + '\n'
						: '';
				let tags = json.Genre && json.Genre !== 'N/A' ? json.Genre : '';
				let threadtitle = document.getElementsByClassName('js-titleInput')[0].value
				if (threadtitle.includes(".DV.") || threadtitle.includes(".DoVi.") || MEDIAINFO.includes("Dolby Vision")) {tags += ", Dolby Vision";}
				if (threadtitle.includes("HDR10Plus") || threadtitle.includes(".HDR10+.") || MEDIAINFO.includes("HDR10+")) {tags += ", HDR10Plus";}
				tags = tags.replace(/^([, ]*)/g, '')
				MEDIAINFO =
					"[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]Media Info :[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[SPOILER='Media Info'][CODE TITLE='Media Info']" +
					MEDIAINFO +
					'[/CODE][/SPOILER]\n';
				ddl =
					'[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]Download Link :[/B][/FORUMCOLOR][/SIZE][/INDENT]\n[CENTER]' +
					ddl +
					'[/CENTER]';
				let dump = `${poster}${title} ${year}[/URL][/SIZE][/B][/FORUMCOLOR]\n${imdbId} ${rating}${imdbvotes}[/CENTER]${plot}\n${trailer}${screen}` +
					"[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]IMDb Info :[/B][/FORUMCOLOR][/SIZE][/INDENT]" +
					`[LIST]${rated}${genre}${director}${writer}${actors}${released}${runtime}${production}[/LIST]\n${MEDIAINFO}${ddl}`;
				dump = dump.replace("[HR][/HR][INDENT][SIZE=6][FORUMCOLOR][B]IMDb Info :[/B][/FORUMCOLOR][/SIZE][/INDENT][LIST][/LIST]\n",'')
				try {
					document.getElementsByName('message')[0].value = dump;
					if (tags) {
						document.getElementsByName('tags')[0].value = tags;
						tags = tags.split(', ');
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
					if (!threadtitle) {
						document.getElementsByClassName('js-titleInput')[0].value =
							json.Title + ' (' + json.Year.replace(/([–]*)$/g, '') + ')';
					}
				}
			},
		});
	}
}

GM_addStyle(
"                                                                     \
    @media screen and (min-width: 300px) {                            \
      /* Reactscore & Posts */                                        \
      input[type=number]{                                             \
            border-bottom:          2px solid teal;                   \
            border-image: linear-gradient(to right, #11998e,#38ef7d); \
            border-image-slice:     1;                                \
            background:             transparent;                      \
            color:                  white;                            \
            max-width:              35px;                             \
      }                                                               \
      #textareaDivider {                                              \
            margin-top:             -11px;                            \
      }                                                               \
      /* Start Rounded sliders Checkboxes */                          \
      .switch {                                                       \
            position:               relative;                         \
            display:                inline-block;                     \
            width:                  42px;                             \
            height:                 17px;                             \
      }                                                               \
      .switch input {                                                 \
            opacity:                0;                                \
            width:                  0;                                \
            height:                 0;                                \
      }                                                               \
      .slider {                                                       \
            position:               absolute;                         \
            cursor:                 pointer;                          \
            top:                    0;                                \
            left:                   0;                                \
            right:                  0;                                \
            bottom:                 0;                                \
            background-color:       #ccc;                             \
            -webkit-transition:     .4s;                              \
            transition:             .4s;                              \
      }                                                               \
      .slider:before {                                                \
            position:               absolute;                         \
            content:                '';                               \
            height:                 13px;                             \
            width:                  13px;                             \
            left:                   2px;                              \
            bottom:                 2px;                              \
            background-color:       #42464D;                          \
            -webkit-transition:     .4s;                              \
            transition:             .4s;                              \
      }                                                               \
      input:checked + .slider {                                       \
            background-color:       #4caf50;                          \
      }                                                               \
      input:focus + .slider {                                         \
            box-shadow:             0 0 1px #4caf50;                  \
      }                                                               \
      input:checked + .slider:before {                                \
            -webkit-transform:      translateX(26px);                 \
            -ms-transform:          translateX(26px);                 \
            transform:              translateX(26px);                 \
      }                                                               \
      .slider.round {                                                 \
            border-radius:          34px;                             \
      }                                                               \
      .slider.round:before {                                          \
            border-radius:          50%;                              \
      }                                                               \
}                                                                     \
    @media screen and (min-width: 768px) {                            \
      /* Reactscore & Posts */                                        \
      input[type=number]{                                             \
            border-bottom:          2px solid teal;                   \
            border-image: linear-gradient(to right, #11998e,#38ef7d); \
            border-image-slice:     1;                                \
            background:             transparent;                      \
            color:                  white;                            \
            max-width:              35px;                             \
      }                                                               \
      #textareaDivider {                                              \
            margin-top:             -11px;                            \
      }                                                               \
      .switch {                                                       \
            position:               relative;                         \
            display:                inline-block;                     \
            width:                  42px;                             \
            height:                 17px;                             \
      }                                                               \
      .switch input {                                                 \
            opacity:                0;                                \
            width:                  0;                                \
            height:                 0;                                \
      }                                                               \
      .slider {                                                       \
            position:               absolute;                         \
            cursor:                 pointer;                          \
            top:                    0;                                \
            left:                   0;                                \
            right:                  0;                                \
            bottom:                 0;                                \
            background-color:       #ccc;                             \
            -webkit-transition:     .4s;                              \
            transition:             .4s;                              \
      }                                                               \
      .slider:before {                                                \
            position:               absolute;                         \
            content:                '';                               \
            height:                 13px;                             \
            width:                  13px;                             \
            left:                   2px;                              \
            bottom:                 2px;                              \
            background-color:       #42464D;                          \
            -webkit-transition:     .4s;                              \
            transition:             .4s;                              \
      }                                                               \
      input:checked + .slider {                                       \
            background-color:       #4caf50;                          \
      }                                                               \
      input:focus + .slider {                                         \
            box-shadow:             0 0 1px #4caf50;                  \
      }                                                               \
      input:checked + .slider:before {                                \
            -webkit-transform:      translateX(26px);                 \
            -ms-transform:          translateX(26px);                 \
            transform:              translateX(26px);                 \
      }                                                               \
      /* Rounded sliders */                                           \
      .slider.round {                                                 \
            border-radius:          34px;                             \
      }                                                               \
      .slider.round:before {                                          \
            border-radius:          50%;                              \
      }                                                               \
}                                                                     \
"
);
