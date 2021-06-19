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
Main();

// Main function that runs the script
function Main() {
    var htmlPlacement = document.getElementsByTagName('dd')[0]; // Grab dd tag under the inputs
    htmlPlacement.innerHTML += htmlTemplate; // Place our HTML under the inputs
    $('#gmHideTemplate').click(() => HideTemplate()); // When Hide button clicked, run hide function
    $('#showTemplate').click(() => ShowTemplate()); // When Show button clicked, run Show function
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
function ShowTemplate() {
    document.getElementById('showTemplate').style.display = 'none';
    document.getElementsByName('showDivider')[0].style.display = 'none';
    $('#ApkGenerator').show();
}

// Hide Template HTML and unhide "Show" button
function HideTemplate() {
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
function FilterSize(element) {
    return element.textContent === 'Size'; // Return div holding text "Size"
}
function FilterCurrentVersion(element) {
    return element.textContent === 'Current Version'; // Return div holding text "Current Version"
}
function FilterRequiredVersion(element) {
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

function DownloadLinkHandler(downloadLinks) {
    let [hideReactScore, hidePosts] = [$('#HideReactScore').val(), $('#HidePosts').val()]
    if (Downcloud.checked) {
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
    downloadLinks = `[hidereact=1,2,3,4,5,6]${downloadLinks.replace(/\n+$/, '')}[/hidereact]`;
    if (hideReactScore !== '0') {
        downloadLinks = `[hidereactscore=${hideReactScore}]${downloadLinks}[/hidereactscore]`;
    }
    if (hidePosts !== '0') {
        downloadLinks = `[hideposts=${hidePosts}]${downloadLinks}[/hideposts]`;
    }
    return downloadLinks
}

function ScreenshotHandler(images) {
    var playStoreImages = [];
    for (let screen of images) {
        let screenattr = screen.alt;
        if (screenattr == 'Screenshot Image') {
            let imageSize = screen.width > '200' ? '[img width="500px"]' : '[img width="300px"]';
            if (!screen.dataset | !screen.dataset.srcset) {
                playStoreImages.push(
                    imageSize + screen.srcset.replace('-rw', '').replace(' 2x', '') + '[/img]'
                );
            } else {
                playStoreImages.push(
                    imageSize + screen.dataset.srcset.replace('-rw', '').replace(' 2x', '') +
                    '[/img]'
                );
            }
        }
        if (playStoreImages.length == '3') {
            playStoreImages = playStoreImages.join('')
            break;
        }
    }
    playStoreImages =
        `[indent][size=6][color=rgb(26, 162, 96)][B]Screenshots[/B][/color][/size][/indent]\n${playStoreImages}[/center]\n[hr][/hr]\n`;
    return playStoreImages;
}

function generateTemplate() {
    // Create variables from HTML
    let [playStoreLink, modInfo, virustotalLinks, downloadLinks, mod, unlocked, adfree, lite, premium] = [
        $('#gplaylink').val(),
        $('#modinfo').val(),
        $('#virustotal').val(),
        $('#ddl').val(),
        document.querySelector('input[value="mod"]').checked ? ' [Mod]' : '',
        document.querySelector('input[value="unlocked"]').checked ? ' [Unlocked]' : '',
        document.querySelector('input[value="adfree"]').checked ? ' [Ad-Free]' : '',
        document.querySelector('input[value="lite"]').checked ? ' [Lite]' : '',
        document.querySelector('input[value="premium"]').checked ? ' [Premium]' : '',
    ];
    // Error Messages for required fields
    if (!playStoreLink | !downloadLinks | !virustotalLinks) {
        var errors = '';
        errors += !playStoreLink ? '<li>No Google Play link Found!</li>' : '';
        errors += !downloadLinks ? '<li>No Download Link Found!</li>' : '';
        errors += !virustotalLinks ? '<li>No Virustotal Found!</li>' : '';
        Popup(errors);
    } else {
        playStoreLink = playStoreLink.includes('&hl')
            ? playStoreLink.replace(/\&.*$/, '&hl=en_US')
            : playStoreLink + '&hl=en_US';

        // Split VT links 1 per line
        let virustotalSplit = virustotalLinks.split(' ');
        virustotalLinks = '';
        for (let splitLink of virustotalSplit) {
            virustotalLinks += `[downcloud]${splitLink}[/downcloud]\n`;
        }
        var titleExtra = mod + unlocked + premium + adfree + lite;
        downloadLinks = DownloadLinkHandler(downloadLinks)
        // Get GPS page & details for post
        GM_xmlhttpRequest({
            method: 'GET',
            url: playStoreLink,
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

                // Filter Function
                var [appSize, playStoreVersion, requiredVersion] = [
                    h2.filter(FilterSize),
                    h2.filter(FilterCurrentVersion),
                    h2.filter(FilterRequiredVersion),
                ];
                // Grab all images & find logo
                let images = parsedHtml.getElementsByTagName('img');
                for (let logoImage of images) {
                    let logoattr = logoImage.alt;
                    if (logoattr == 'Cover art') {
                        var logo =
                            `[center][img width='100px']${logoImage.srcset.replace('-rw', '').replace(' 2x', '')}[/img]\n`;
                    }
                }
                let playStoreImages = ScreenshotHandler(images)
                // App Name
                let title = gplayjson.name
                    ? `[color=rgb(26, 162, 96)][B][size=6]${gplayjson.name}[/size][/B][/color]\n`
                    : '';
                // Review Star Rating
                try {
                    var rating = gplayjson.aggregateRating.ratingValue
                        ? `[img width='40px']https://i.postimg.cc/g28wfSTs/630px-Green-star-41-108-41-svg.png[/img][size=6][B]${Math.floor(gplayjson.aggregateRating.ratingValue)}/5[/B]\n`
                        : '';
                } catch (e) {
                    rating = '';
                }
                // Amount of Reviews
                try {
                    var reviewscount = gplayjson.aggregateRating.ratingCount
                        ? `[img width='40px']https://i.postimg.cc/nV6RDhJ3/Webp-net-resizeimage-002.png[/img]${gplayjson.aggregateRating.ratingCount}[/size]\n`
                        : '';
                } catch (e) {
                    reviewscount = '';
                }

                // Grab App Details from Play Store HTML parse
                // App Description
                let appDescription = gplayjson.description
                    ? `[indent][size=6][color=rgb(26, 162, 96)][B]App Description[/B][/color][/size][/indent]\n[SPOILER='App Description']\n${gplayjson.description}\n[/SPOILER]\n[hr][/hr]\n`
                    : '';
                let developerName = gplayjson.author.name
                    ? `[indent][size=6][color=rgb(26, 162, 96)][B]App Details[/B][/color][/size][/indent]\n[LIST]\n[*][B]Developer: [/B] ${upperCase(gplayjson.author.name)}`
                    : '';
                // App Category
                let playStoreCategory = gplayjson.applicationCategory
                    ? `\n[*][B]Category: [/B] ${upperCase(gplayjson.applicationCategory.replace(/\_/g, ' '))}`
                    : '';
                // Age Content Rating
                let ContentRating = gplayjson.contentRating
                    ? `\n[*][B]Content Rating: [/B] ${gplayjson.contentRating}`
                    : '';
                requiredVersion = requiredVersion[0].nextElementSibling.innerText
                    ? `\n[*][B]Required Android Version: [/B] ${requiredVersion[0].nextElementSibling.innerText}`
                    : '';
                appSize = appSize[0].nextElementSibling.innerText
                    ? `\n[*][B]size: [/B] ${appSize[0].nextElementSibling.innerText} (Taken from the Google Play Store)`
                    : '';
                playStoreVersion = playStoreVersion[0].nextElementSibling.innerText
                    ? `\n[*][B]Latest Google Play Version: [/B] ${playStoreVersion[0].nextElementSibling.innerText}\n[/LIST]\n`
                    : '';
                // Add BBCode for "Get this on Google Play Store"
                playStoreLink =
                    `[URL=${playStoreLink}][img width='250px']https://i.postimg.cc/mrWtVGwr/image.png[/img][/URL]\n[hr][/hr]\n`;
                modInfo = modInfo
                    ? `[indent][size=6][color=rgb(26, 162, 96)][B]Mod Info[/B][/color][/size][/indent]\n${modInfo}[hr][/hr]\n`
                    : '';
                virustotalLinks =
                    `[indent][size=6][color=rgb(26, 162, 96)][B]Virustotal[/B][/color][/size][/indent]\n${virustotalLinks}[hr][/hr]\n`;
                downloadLinks =
                    `[indent][size=6][color=rgb(26, 162, 96)][B]Download Link[/B][/color][/size][/indent]\n[center]\n${downloadLinks}\n[/center]`;
                let bbcode = `${logo}${title}${rating}${reviewscount}${playStoreImages}${appDescription}${developerName}${playStoreCategory}${ContentRating}${requiredVersion}${appSize}${playStoreVersion}${playStoreLink}${modInfo}${virustotalLinks}${downloadLinks}`;
                try {
                    document.getElementsByName('message')[0].value = bbcode;
                } catch (err) {
                    RemoveAllChildNodes(
                        document.getElementsByClassName('fr-element fr-view')[0]
                    );
                    let p = document.createElement('p');
                    p.innerText = dump;
                    document.getElementsByClassName('fr-element fr-view')[0].appendChild(p);
                } finally {
                    if (!document.getElementsByClassName('js-titleInput')[0].value) {
                        document.getElementsByClassName('js-titleInput')[0].value =
                            `${gplayjson.name}${titleExtra}`;
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
