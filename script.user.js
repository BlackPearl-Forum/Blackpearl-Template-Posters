// ==UserScript==
// @name        Blackpearl Android Template Generator
// @version     1.0.1
// @description Generates a Template for the Android section of Blackpearl
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/tree/Android
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Android/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Android/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(94)\/post-thread/
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

const htmlTemplate = `
<div id="textareaDivider" name="showDivider" style="display:none">&nbsp;</div>
<button class="button--primary button button--icon rippleButton" id="showTemplate" style="display:none" type="button">Show</button>
<div id="ApkGenerator">
<input type="text" id="gplaylink" value="" class="input" placeholder="Google Play Store Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Google Play Store Link'">
<textarea rows="1" style="width:100%;" class="input" id="modinfo" placeholder="Mod Details" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Mod Details'"></textarea>
<input type="text" id="virustotal" value="" class="input" placeholder="VirusTotal Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Virustotal Link'">
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<div id="textareaDivider">&nbsp;</div>
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
<div id="textareaDivider">&nbsp;</div>
<button class="button--primary button button--icon" id="gmGenerate" type="button">Generate Template</button>
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
// Run the Main function
main();

// Main function that runs the script
function main() {
	var temphtml = document.getElementsByTagName('dd')[0]; // Grab div under the inputs
	temphtml.innerHTML += htmlTemplate; // Place our HTML under the inputs
	$('#gmHideTemplate').click(() => hideTemplate()); // When Hide button clicked, run hide function
	$('#showTemplate').click(() => showTemplate()); // When Show button clicked, run Show function
	$('#gmGenerate').click(() => generateTemplate()); // When Generate button clicked, run Generate function
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

// Add Hotkey "Escape" to Hide fields
$(document).on('keydown', function (event) {
	if (event.key == 'Escape') {
		$('#ApkGenerator').hide();
		document.getElementById('showTemplate').style.display = 'block';
		document.getElementsByName('showDivider')[0].style.display = 'block';
	}
});

// Show Template HTML and hide "Show" button
function showTemplate() {
	document.getElementById('showTemplate').style.display = 'none';
	document.getElementsByName('showDivider')[0].style.display = 'none';
	$('#ApkGenerator').show();
}

// Hide Template HTML and unhide "Show" button
function hideTemplate() {
	document.getElementById('showTemplate').style.display = 'block';
	document.getElementsByName('showDivider')[0].style.display = 'block';
	$('#ApkGenerator').hide();
}

// Popup for Errors
function Popup(errors) {
	let errOutput = errPopup.replace('errormessages', errors);
	var body = document.getElementsByTagName('Body')[0];
	body.insertAdjacentHTML('beforeend', errOutput);
}

// Grab Specific divs
function filterSize(element) {
	return element.textContent === 'Size'; // Return div holding text "Size"
}
function filterCurVer(element) {
	return element.textContent === 'Current Version'; // Return div holding text "Current Version"
}
function filterReqAndr(element) {
	return element.textContent === 'Requires Android'; // Return div holding text "Requires Android"
}

// fix word casing
function upperCase(str) {
	str = str.toLowerCase(); // First make entire string lowercase
	return str.replace(/(^|\s)\S/g, function (t) {
		return t.toUpperCase(); // Return Uppercase for every word in String
	});
}

function RemoveAllChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

function generateTemplate() {
	// Create variables from HTML
	let [
		link,
		modinfo,
		VT,
		ddl,
		hidereactscore,
		hideposts,
		mod,
		unlocked,
		adfree,
		lite,
		premium,
	] = [
		$('#gplaylink').val(),
		$('#modinfo').val(),
		$('#virustotal').val(),
		$('#ddl').val(),
		$('#HideReactScore').val(),
		$('#HidePosts').val(),
		document.querySelector('input[value="mod"]'),
		document.querySelector('input[value="unlocked"]'),
		document.querySelector('input[value="adfree"]'),
		document.querySelector('input[value="lite"]'),
		document.querySelector('input[value="premium"]'),
	];
	// Error Messages for required fields
	if (!link | !ddl | !VT) {
		var errors = '';
		errors += !link ? '<li>No Google Play link Found!</li>' : '';
		errors += !ddl ? '<li>No Download Link Found!</li>' : '';
		errors += !VT ? '<li>No Virustotal Found!</li>' : '';
		Popup(errors);
	} else {
		link = link.includes('&hl')
			? link.replace(/\&.*$/, '&hl=en_US')
			: link + '&hl=en_US';

		// Split VT links 1 per line
		let vtsplit = VT.split(' ');
		VT = '';
		for (let vts of vtsplit) {
			VT += `[DOWNCLOUD]${vts}[/DOWNCLOUD]\n`;
		}
		// Check for pressed buttons
		mod = mod.checked ? ' [Mod]' : '';
		unlocked = unlocked.checked ? ' [Unlocked]' : '';
		adfree = adfree.checked ? ' [Ad-Free]' : '';
		premium = premium.checked ? ' [Premium]' : '';
		lite = lite.checked ? ' [Lite]' : '';
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
		// Get GPS page & details for post
		GM_xmlhttpRequest({
			method: 'GET',
			url: link,
			onload: function (response) {
				let [page, parser] = [response.responseText, new DOMParser()];
				let parsedHtml = parser.parseFromString(page, 'text/html');
				// Grab json from parse
				var gplayjson = parsedHtml.querySelector(
					'script[type="application/ld+json"]'
				).text;
				gplayjson = JSON.parse(gplayjson);
				// Turn nodelist into an array
				var h2 = Array.prototype.slice.call(parsedHtml.querySelectorAll('div'));
				// Array of matches
				// Filter Function
				var [siz, curVer, reqAndr] = [
					h2.filter(filterSize),
					h2.filter(filterCurVer),
					h2.filter(filterReqAndr),
				];
				// Grab all images & find logo
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
				// App Name
				let title = gplayjson.name
					? '[COLOR=rgb(26, 162, 96)][B][SIZE=6]' +
					  gplayjson.name +
					  '[/SIZE][/B][/COLOR]\n'
					: '';
				// Review Star Rating
				try {
					var rating = gplayjson.aggregateRating.ratingValue
						? "[IMG width='40px']https://i.postimg.cc/g28wfSTs/630px-Green-star-41-108-41-svg.png[/IMG][SIZE=6][B]" +
						  Math.floor(gplayjson.aggregateRating.ratingValue) +
						  '/5[/B]\n'
						: '';
				} catch (e) {
					console.log(e);
					rating = '';
				}
				// Amount of Reviews
				try {
					var reviewscount = gplayjson.aggregateRating.ratingCount
						? "[IMG width='40px']https://i.postimg.cc/nV6RDhJ3/Webp-net-resizeimage-002.png[/IMG]" +
						  gplayjson.aggregateRating.ratingCount +
						  '[/size]\n'
						: '';
				} catch (e) {
					console.log(e);
					reviewscount = '';
				}
				// Grab SS from images (Only grab 3!)
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
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Screenshots[/B][/COLOR][/SIZE][/INDENT]\n' +
					screens +
					'[/CENTER]\n[hr][/hr]\n';
				// Grab App Details from Play Store HTML parse
				// App Description
				let description = gplayjson.description
					? "[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Description[/B][/COLOR][/SIZE][/INDENT]\n[SPOILER='App Description']\n" +
					  gplayjson.description +
					  '\n[/SPOILER]\n[hr][/hr]\n'
					: '';
				// Developer Name
				let dev = gplayjson.author.name
					? '[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]App Details[/B][/COLOR][/SIZE][/INDENT]\n[LIST]\n[*][B]Developer: [/B] ' +
					  upperCase(gplayjson.author.name)
					: '';
				// App Category
				let appCat = gplayjson.applicationCategory.replace(/\_/g, ' ');
				let category = gplayjson.applicationCategory
					? '\n[*][B]Category: [/B] ' + upperCase(appCat)
					: '';
				// Age Content Rating
				let ContentRating = gplayjson.contentRating
					? '\n[*][B]Content Rating: [/B] ' + gplayjson.contentRating
					: '';
				// Required Android Version
				let requiredAndroid = reqAndr[0].nextElementSibling.innerText
					? '\n[*][B]Required Android Version: [/B] ' +
					  reqAndr[0].nextElementSibling.innerText
					: '';
				// App Size
				let size = siz[0].nextElementSibling.innerText
					? '\n[*][B]Size: [/B] ' +
					  siz[0].nextElementSibling.innerText +
					  ' (Taken from the Google Play Store)'
					: '';
				// Latest Version from the Playstore
				let LatestPlayStoreVersion = curVer[0].nextElementSibling.innerText
					? '\n[*][B]Latest Google Play Version: [/B] ' +
					  curVer[0].nextElementSibling.innerText +
					  '\n[/LIST]\n'
					: '';
				// Add BBCode for "Get this on Google Play Store"
				link =
					'[URL=' +
					link +
					"][IMG width='250px']https://i.postimg.cc/mrWtVGwr/image.png[/IMG][/URL]\n[hr][/hr]\n";
				// Don't add modinfo line if not needed
				modinfo = modinfo
					? '[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Mod Info[/B][/COLOR][/SIZE][/INDENT]\n' +
					  modinfo +
					  '[hr][/hr]\n'
					: '';
				VT =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Virustotal[/B][/COLOR][/SIZE][/INDENT]\n' +
					VT +
					'[hr][/hr]\n';
				ddl =
					'[INDENT][SIZE=6][COLOR=rgb(26, 162, 96)][B]Download Link[/B][/COLOR][/SIZE][/INDENT]\n[CENTER]\n' +
					ddl +
					'\n[/CENTER]';
				let dump = `${logo}${title}${rating}${reviewscount}${screens}${description}${dev}${category}${ContentRating}${requiredAndroid}${size}${LatestPlayStoreVersion}${link}${modinfo}${VT}${ddl}`;
				// Try to paste to page. Alert user if using wrong mode
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					GM_setClipboard(dump);
					Popup(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					if (!document.getElementsByClassName('js-titleInput')[0].value) {
						document.getElementsByClassName('js-titleInput')[0].value =
							gplayjson.name + titleExtra;
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
      #textareaDivider {                                         \
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
      #textareaDivider {                                         \
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
