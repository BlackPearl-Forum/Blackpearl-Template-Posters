// ==UserScript==
// @name        Blackpearl Android Template Generator
// @version     1.0.0
// @description Android App Template
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/tree/Android
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Android/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Android/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(94)\/post-thread/
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

const htmlTemplate = `
<button id="ShowTemplate" name="template_button" style="display:none" type="button">Show</button>
<div id="ApkGenerator">
<input type="text" id="gplaylink" value="" class="input" placeholder="Google Play Store Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Google Play Store Link'">
<input type="text" id="modinfo" value="" class="input" placeholder="Mod Details" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Mod Details'">
<input type="text" id="virustotal" value="" class="input" placeholder="VirusTotal Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Screenshot Links'">
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
<button class="button--primary button button--icon" id="gmGenerate" name="template_button" type="button">Generate Template</button>
<button class="button--primary button button--icon" id="gmClearBtn" name="template_button" type="reset">Clear</button>
<button class="button--primary button button--icon" id="gmHideTemplate" name="template_button" type="button">Hide</button>
</div>
`;

main();

function main() {
	var temphtml = document.getElementsByTagName('dd')[0];
	temphtml.innerHTML += htmlTemplate;
	var titlechange = document.getElementsByName('title')[0];
	if (titlechange) {
		titlechange.className += 'input';
	}
	$('#gmHideTemplate').click(() => hideTemplate());
	$('#gmShowTemplate').click(() => showTemplate());
	$('#gmGenerate').click(() => generateTemplate(titlechange));
}

$(document).on('keydown', function(event) {
	if (event.key == 'Escape') {
		$('#ApkGenerator').hide();
		document.getElementById('ShowTemplate').style.display = 'block';
	}
});

function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#ApkGenerator').show();
}
function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#ApkGenerator').hide();
}

function generateTemplate(titlechange) {
	let link = $('#gplaylink').val();
	let modinfo = $('#modinfo').val();
	let VT = $('#virustotal').val();
	let ddl = $('#ddl').val();
	let hidereactscore = $('#HideReactScore').val();
	let hideposts = $('#HidePosts').val();
	//* Error Messages *//
	if (!link) {
		alert('Gotta give us a Google Play link at least!');
	} else if (!ddl) {
		alert("Uh Oh! You Forgot Your Download Link! That's Pretty Important...");
	} else if (!VT) {
		alert("You Don't Have Any VirusTotal? It's Required!");
	} else {
		//* Add BBcode if checked/changed *//
		if (Downcloud.checked) {
			let ddlsplit = ddl.split(' ');
			ddl = '';
			for (var dls of ddlsplit) {
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
		//* Get GPS page & details for post *//
		GM_xmlhttpRequest({
			method: 'GET',
			url: link,
			onload: function(response) {
				let test = response.responseText;
				let parser = new DOMParser();
				let parsedHtml = parser.parseFromString(test, 'text/html');
				//* Grab all images & find logo *//
				let images = parsedHtml.getElementsByTagName('img');
				for (let logoimg of images) {
					let logoattr = logoimg.alt;
					if (logoattr == 'Cover art') {
						var logo =
							"[CENTER][IMG width='100px']" +
							logoimg.srcset.replace('-rw', '').replace(' 2x', '') +
							'[/IMG]\n';
					}
				}
				//* App Name *//
				let name = parsedHtml.getElementsByClassName('AHFaub')[0].innerText;
				let title =
					'[COLOR=rgb(26, 162, 96)][B][SIZE=6]' +
					name +
					'[/SIZE][/B][/COLOR]\n';
				//* rating *//
				let rating =
					"[IMG width='40px']https://i.postimg.cc/g28wfSTs/630px-Green-star-41-108-41-svg.png[/IMG][SIZE=6][B]" +
					parsedHtml.getElementsByClassName('BHMmbe')[0].innerText +
					'/5[/B]\n';
				//* Amount of Reviews *//
				let reviewscount =
					"[IMG width='40px']https://i.postimg.cc/L617X3tq/Webp-net-resizeimage.png[/IMG]" +
					parsedHtml.getElementsByClassName('O3QoBc hzfjkd')[0].nextSibling
						.innerHTML +
					'[/SIZE][/CENTER]\n';
				//* Grab SS from images (Only grab 3!) *//
				var screenshots = [];
				for (let screen of images) {
					let screenattr = screen.alt;
					if (screenattr == 'Screenshot Image') {
						if (!screen.dataset | !screen.dataset.srcset) {
							screenshots.push(
								screen.srcset.replace('-rw', '').replace(' 2x', '') + '\n'
							);
						} else {
							screenshots.push(
								screen.dataset.srcset.replace('-rw', '').replace(' 2x', '') +
									'\n'
							);
						}
					}
					if (screenshots.length == '3') {
						break;
					}
				}
				var screens = '';
				for (let ss of screenshots) {
					screens += '[IMG width="300px"]' + ss + '[/IMG]';
				}
				screens =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Screenshots[/B][/COLOR][/SIZE][/INDENT][CENTER]' +
					screens +
					'[/CENTER]\n[hr][/hr]\n';
				//* App Description *//
				let description =
					"[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Description[/B][/COLOR][/SIZE][/INDENT]\n [SPOILER='App Description']\n" +
					parsedHtml.getElementsByClassName('DWPxHb')[0].textContent +
					'\n[/SPOILER]\n[hr][/hr]\n';
				let dev =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Details[/B][/COLOR][/SIZE][/INDENT]\n[LIST]\n[*][B]Developer: [/B] ' +
					parsedHtml.getElementsByClassName('T32cc UAO9ie')[0].innerText;
				let category =
					'\n[*][B]Category: [/B] ' +
					parsedHtml.getElementsByClassName('T32cc UAO9ie')[1].innerText;
				let ContentRating =
					'\n[*][B]Content Rating: [/B] ' +
					parsedHtml.getElementsByClassName('htlgb')[11].querySelector('div')
						.innerText;
				let requiredAndroid =
					'\n[*][B]Required Android Version: [/B] ' +
					parsedHtml.getElementsByClassName('htlgb')[9].textContent;
				let size =
					'\n[*][B]Size: [/B] ' +
					parsedHtml.getElementsByClassName('htlgb')[3].textContent +
					' (Taken from the Google Play Store)';
				let LatestPlayStoreVersion =
					'\n[*][B]Latest Google Play Version: [/B] ' +
					parsedHtml.getElementsByClassName('htlgb')[7].textContent +
					'\n[/LIST]\n';
				link =
					'[URL=' +
					link +
					"][IMG width='250px']https://i.postimg.cc/mrWtVGwr/image.png[/IMG][/URL]\n[hr][/hr]\n";
				//* Don't add modinfo line if not needed *//
				if (modinfo) {
					modinfo =
						'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Mod Info[/B][/COLOR][/SIZE][/INDENT]\n' +
						modinfo +
						'[hr][/hr]\n';
				} else {
					modinfo = '';
				}
				VT =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Virustotal[/B][/COLOR][/SIZE][/INDENT]\n[DOWNCLOUD]' +
					VT +
					'[/DOWNCLOUD]\n[hr][/hr]\n';
				ddl =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Download Link[/B][/COLOR][/SIZE][/INDENT]\n[CENTER]\n' +
					ddl +
					'\n[/CENTER]';
				let dump = `${logo}${title}${rating}${reviewscount}${screens}${description}${dev}${category}${ContentRating}${requiredAndroid}${size}${LatestPlayStoreVersion}${link}${modinfo}${VT}${ddl}`;
				GM_setClipboard(dump);
				//* Try to paste to page. Alert user if using wrong mode *//
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
	"                                                   \
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
}                                                                 \
"
);
