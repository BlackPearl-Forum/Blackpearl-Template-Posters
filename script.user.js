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
<textarea rows="1" style="width:100%;" class="input" id="modinfo" placeholder="Mod Details" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Mod Details'"></textarea>
<input type="text" id="virustotal" value="" class="input" placeholder="VirusTotal Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Virustotal Link'">
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<div id="textarea_divider">&nbsp;</div>
<span>Mod</span>
<label class="switch">
<input type="checkbox" id="mod" value="mod" >
<span class="slider round"></span></label>
<span>Unlocked</span>
<label class="switch">
<input type="checkbox" id="unlocked" value="unlocked" >
<span class="slider round"></span></label>
<span>Premium</span>
<label class="switch">
<input type="checkbox" id="premium" value="premium" >
<span class="slider round"></span></label>
<span>Ad-Free</span>
<label class="switch">
<input type="checkbox" id="adfree" value="adfree" >
<span class="slider round"></span></label>
<span>Lite</span>
<label class="switch">
<input type="checkbox" id="lite" value="lite" >
<span class="slider round"></span></label>
<br/>
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
	$('#gmGenerate').click(() => generateTemplate());
}

$(document).on('keydown', function(event) {
	if (event.key == 'Escape') {
		$('#ApkGenerator').hide();
		document.getElementById('ShowTemplate').style.display = 'block';
	}
});

/*Grab Specific divs*/
function filterSize(element) {
	return element.textContent === 'Size';
}
function filterCurVer(element) {
	return element.textContent === 'Current Version';
}
function filterReqAndr(element) {
	return element.textContent === 'Requires Android';
}

/*fix word casing*/
function upperCase(str) {
	str = str.toLowerCase();
	return str.replace(/(^|\s)\S/g, function(t) {
		return t.toUpperCase();
	});
}

function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#ApkGenerator').show();
}
function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#ApkGenerator').hide();
}

function generateTemplate() {
	let link = $('#gplaylink').val();
	let modinfo = $('#modinfo').val();
	let VT = $('#virustotal').val();
	let ddl = $('#ddl').val();
	let hidereactscore = $('#HideReactScore').val();
	let hideposts = $('#HidePosts').val();
	mod = document.querySelector('input[value="mod"]');
	unlocked = document.querySelector('input[value="unlocked"]');
	adfree = document.querySelector('input[value="adfree"]');
	lite = document.querySelector('input[value="lite"]');
	premium = document.querySelector('input[value="premium"]');
	//* Error Messages *//
	if (!link) {
		alert('Gotta give us a Google Play link at least!');
	} else if (!ddl) {
		alert("Uh Oh! You Forgot Your Download Link! That's Pretty Important...");
	} else if (!VT) {
		alert("You Don't Have Any VirusTotal? It's Required!");
	} else {
		if (link.includes('&hl')) {
			link = link.replace(/\&.*$/, '&hl=en_US');
		} else {
			link = link + '&hl=en_US';
		}
		//* Add BBcode if checked/changed *//
		var mod = mod.checked ? ' [Mod]' : '';
		var unlocked = unlocked.checked ? ' [Unlocked]' : '';
		var adfree = adfree.checked ? ' [Ad-Free]' : '';
		var premium = premium.checked ? ' [Premium]' : '';
		if (mod.checked & lite.checked) {
			var lite = ' [Mod-Lite]';
			mod = '';
		} else {
			lite = lite.checked ? ' [Lite]' : '';
		}
		var titleExtra = mod + unlocked + premium + adfree + lite;
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
				//*Grab json from parse*//
				var gplayjson = parsedHtml.querySelector(
					'script[type="application/ld+json"]'
				).text;
				gplayjson = JSON.parse(gplayjson);
				//turn nodelist into an array
				var h2 = Array.prototype.slice.call(parsedHtml.querySelectorAll('div'));
				//Array of matches
				var siz = h2.filter(filterSize);
				var curVer = h2.filter(filterCurVer);
				var reqAndr = h2.filter(filterReqAndr);

				//Filter Function
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
				let title =
					'[COLOR=rgb(26, 162, 96)][B][SIZE=6]' +
					gplayjson.name +
					'[/SIZE][/B][/COLOR]\n';
				//* rating *//
				let rating =
					"[IMG width='40px']https://i.postimg.cc/g28wfSTs/630px-Green-star-41-108-41-svg.png[/IMG][SIZE=6][B]" +
					Math.floor(gplayjson.aggregateRating.ratingValue) +
					'/5[/B]\n';
				//* Amount of Reviews *//
				let reviewscount =
					"[IMG width='40px']https://i.postimg.cc/L617X3tq/Webp-net-resizeimage.png[/IMG]" +
					gplayjson.aggregateRating.ratingCount +
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
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Screenshots[/B][/COLOR][/SIZE][/INDENT][CENTER]\n' +
					screens +
					'[/CENTER]\n[hr][/hr]\n';
				//* App Description *//
				let description =
					"[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Description[/B][/COLOR][/SIZE][/INDENT]\n[SPOILER='App Description']\n" +
					gplayjson.description +
					'\n[/SPOILER]\n[hr][/hr]\n';
				let dev =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Details[/B][/COLOR][/SIZE][/INDENT]\n[LIST]\n[*][B]Developer: [/B] ' +
					upperCase(gplayjson.author.name);
				let category =
					'\n[*][B]Category: [/B] ' + upperCase(gplayjson.applicationCategory);
				let ContentRating =
					'\n[*][B]Content Rating: [/B] ' + gplayjson.contentRating;
				let requiredAndroid =
					'\n[*][B]Required Android Version: [/B] ' +
					reqAndr[0].nextElementSibling.innerText;
				let size =
					'\n[*][B]Size: [/B] ' +
					siz[0].nextElementSibling.innerText +
					' (Taken from the Google Play Store)';
				let LatestPlayStoreVersion =
					'\n[*][B]Latest Google Play Version: [/B] ' +
					curVer[0].nextElementSibling.innerText +
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
				//* Try to paste to page. Alert user if using wrong mode *//
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					GM_setClipboard(dump);
					alert(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					let xf_title_value = document.getElementById('title').value;
					if (!xf_title_value) {
						document.getElementById('title').value =
							gplayjson.name + titleExtra;
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
            margin-bottom:          5px;                          \
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
            margin-bottom:          5px;                          \
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
