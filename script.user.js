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
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==

main();

const htmlTemplate = `
<button id="gmShowTemplate" name="templateButton" style="display:none" type="button">Show</button>
<div id="discogGenerator">
<input type="text" id="master_url" value="" style="display:none">
<div class="ui search" id="Discog_search">
<input type="text" class="prompt input" id="searchID" placeholder="Artist + Album name"  onfocus="this.placeholder = ''" onblur="this.placeholder = 'Artist + Album name'">
<div class="results input" style="display:none"></div>
</div>
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
<label>Enter Your discorg API Key, Then Click On Save :)</label>
<input type="text" id="dgKey" value="" class="input" placeholder="discorg API Key" onfocus="this.placeholder = ''" onblur="this.placeholder = 'discorg API Key'">
<button class="button--primary button button--icon" id="gmSaveKey" name="templateButton" type="button">Save Key</button>
<button class="button--primary button button--icon" id="gmClearBtn" name="templateButton" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" name="templateButton" type="button">Hide</button>
</div>
`;

function main() {
	GM.getValue('DiscogKey', 'foo').then(value => {
		const APIVALUE = value;
		if (APIVALUE !== 'foo') {
			var temphtml = document.getElementsByTagName('dd')[0];
			temphtml.innerHTML += htmlTemplate;
		} else {
			temphtml = document.getElementsByTagName('dd')[0];
			temphtml.innerHTML += dginput;
		}

		var titlechange = document.getElementsByName('title')[0];
		if (titlechange) {
			titlechange.className += 'input';
		}
		$('#gmHideTemplate').click(() => hideTemplate());
		$('#gmShowTemplate').click(() => showTemplate());
		$('#gmSaveKey').click(() => saveApiKey(APIVALUE));
		searchDiscog(APIVALUE);
		$('#gmGenerate').click(() => generateTemplate(APIVALUE, titlechange));
	});
}

$(document).on('keydown', function(event) {
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
			onResponse: function(myfunc) {
				var response = {
					results: {}
				};
				$.each(myfunc.results, function(index, item) {
					var category = item.type || 'Unknown',
						maxResults = 50;
					if (index >= maxResults) {
						return false;
					}
					if (response.results[category] === undefined) {
						response.results[category] = {
							name: '~~~~~~~~~~' + category + '~~~~~~~~~~',
							results: []
						};
					}
					var Name = item.title + ' (' + item.year + ')';
					response.results[category].results.push({
						title: Name,
						description: Name,
						master_url: item.master_url
					});
				});
				delete response.results['release'];
				delete response.results['label'];
				delete response.results['artist'];
				return response;
			}
		},
		fields: {
			results: 'results',
			title: 'name'
		},
		onSelect: function(response) {
			console.log(response);
			$('#master_url').val(response.master_url);
		},
		minCharacters: 3
	});
}

function generateTemplate(APIVALUE, titlechange) {
	let ddl = $('#ddl').val();
	let hidereactscore = $('#HideReactScore').val();
	let hideposts = $('#HidePosts').val();
	let master_url = $('#master_url').val();
	if (!master_url) {
		alert("You Didn't Select A Result or Enter a URL!");
	} else if (!ddl) {
		alert("Uh Oh! You Forgot Your Download Link! That's Pretty Important...");
	} else {
		if (Downcloud.checked) {
			ddl = '[DOWNCLOUD]' + ddl + '[/DOWNCLOUD]';
		}
		ddl = '[HIDEREACT=1,2,3,4,5,6]' + ddl + '[/HIDEREACT]';
		if (hidereactscore !== '0') {
			ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hideposts !== '0') {
			ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]';
		}
		var xhReq = new XMLHttpRequest();
		xhReq.open('GET', `${master_url}?token=${APIVALUE}`, false);
		xhReq.send(null);
		var albumjson = JSON.parse(xhReq.responseText);
		var artist_url = albumjson.artists[0].resource_url;
		GM_xmlhttpRequest({
			method: 'GET',
			url: `${artist_url}?token=${APIVALUE}`,
			onload: function(response) {
				var artistjson = JSON.parse(response.responseText);
				let masterUri = albumjson.uri;
				let artistUri = artistjson.uri;
				let Cover =
					'[CENTER][IMG width="250px"]' + albumjson.images[0].uri + '[/IMG]\n';
				let artist =
					`[COLOR=rgb(44, 171, 162)][B][SIZE=6][URL=${artistUri}]` +
					albumjson.artists[0].name +
					'[/URL]\n';
				let title =
					`[URL=${masterUri}]` +
					albumjson.title +
					'[/URL][/SIZE][/B][/COLOR]\n';
				let tracklist = albumjson.tracklist;
				let tracknum = tracklist.length + ' Tracks\n';
				let tracks =
					'[INDENT][SIZE=6][COLOR=rgb(44, 171, 162)][B]Album Details[/B][/COLOR][/SIZE][/INDENT]\n[SPOILER="Track List"]\n[TABLE=collapse]\n[TR]\n[TH]No.[/TH]\n[TH]Track Name[/TH]\n[TH]Track Duration[/TH]\n[/TR]\n';
				for (let t of tracklist) {
					tracks +=
						'[TR][TD]' +
						t.position +
						'[/TD]\n[TD]' +
						t.title +
						'[/TD]\n[TD]' +
						t.duration +
						'[/TD][/TR]\n';
				}
				tracks += '[/TABLE]\n[/SPOILER]\n';
				let styles = '[SIZE=6]' + albumjson.styles[0];
				let genres = albumjson.genres[0] + '[/SIZE][/CENTER]\n';
				let artistinfo =
					'[SPOILER="About Artist"]\n' +
					artistjson.profile.replace(/\[.=/gm, '').replace(/\]/gm, '') +
					'\n[/SPOILER]';
				let memberlist = artistjson.members;
				let members =
					'[INDENT][SIZE=6][COLOR=rgb(44, 171, 162)][B]Artist Details[/B][/COLOR][/SIZE][/INDENT]\n[SPOILER="Member List"]\n';
				for (let ml of memberlist) {
					members +=
						ml.name + '\n[IMG width="150px"]' + ml.thumbnail_url + '[/IMG]\n';
				}
				members += '\n[/SPOILER]\n';
				let artistslinks = artistjson.urls;
				let artlink = '[SPOILER="Artist Links"]\n';
				for (let artistlink of artistslinks) {
					artlink += artistlink + '\n';
				}
				artlink += '\n[/SPOILER]\n[hr][/hr]\n';
				ddl =
					'[hr][/hr][center][size=6][color=rgb(44, 171, 162)][b]Download Link[/b][/color][/size]\n' +
					ddl +
					'\n[/center]';
				let dump = `${Cover}${artist}${title}${tracknum}${styles} ${genres}${members}${artistinfo}${artlink}${tracks}${ddl}`;
				GM_setClipboard(dump);
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					alert(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					let xf_title_value = titlechange.value;
					if (!xf_title_value) {
						document.getElementById('title').value = name;
					}
				}
			}
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
